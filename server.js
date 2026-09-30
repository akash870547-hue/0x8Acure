import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import fs from "node:fs";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 8080);
const secret = process.env.JWT_SECRET || "change-this-secret";
const dbPath = process.env.DB_PATH || path.join(root, "data", "dpdp-ctf.db");
fs.mkdirSync(path.dirname(dbPath), {recursive:true});
const db = new Database(dbPath);
const contentDir = path.join(root, "content");
const sourceRegistry = JSON.parse(fs.readFileSync(path.join(contentDir, "sources.json"), "utf8"));
const taskRegistry = JSON.parse(fs.readFileSync(path.join(contentDir, "tasks.json"), "utf8"));
const sourceIds = new Set((sourceRegistry.sources || []).map(s => s.id));

function validateTask(task) {
  if (!task || typeof task !== "object") throw new Error("Task must be an object");
  if (!task.id || !task.type || !task.prompt || task.correct_answer === undefined || !task.explanation) {
    throw new Error("Task is missing a required field");
  }
  if (!task.citation || !task.citation.reference || !task.citation.source_id) {
    throw new Error("Task rejected: citation is required");
  }
  if (!sourceIds.has(task.citation.source_id)) {
    throw new Error("Task rejected: citation source_id is not registered");
  }
  if (!Array.isArray(task.hints)) throw new Error("Task rejected: hints must be an array");
  return true;
}

for (const task of (taskRegistry.tasks || [])) validateTask(task);

db.pragma("journal_mode = WAL");
db.exec([
  "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT,email TEXT NOT NULL UNIQUE,name TEXT NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'learner',organization TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,last_login_at TEXT)",
  "CREATE TABLE IF NOT EXISTS rooms (id TEXT PRIMARY KEY,code TEXT NOT NULL UNIQUE,title TEXT NOT NULL,path TEXT NOT NULL,version TEXT NOT NULL DEFAULT '2026.1',status TEXT NOT NULL DEFAULT 'published',source_url TEXT,legal_reference TEXT,effective_from TEXT,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE TABLE IF NOT EXISTS progress (user_id INTEGER NOT NULL,room_id TEXT NOT NULL,completed INTEGER NOT NULL DEFAULT 0,xp INTEGER NOT NULL DEFAULT 0,attempts INTEGER NOT NULL DEFAULT 0,completed_at TEXT,PRIMARY KEY(user_id,room_id))",
  "CREATE TABLE IF NOT EXISTS challenge_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL,room_id TEXT NOT NULL,challenge_index INTEGER NOT NULL,correct INTEGER NOT NULL,xp_awarded INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE TABLE IF NOT EXISTS certificates (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL,certificate_no TEXT NOT NULL UNIQUE,course TEXT NOT NULL,issued_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,verification_hash TEXT NOT NULL UNIQUE)",
  "CREATE TABLE IF NOT EXISTS audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT,actor_user_id INTEGER,action TEXT NOT NULL,target_type TEXT,target_id TEXT,metadata_json TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"
].join(";"));

const app = express();
app.use(cors({origin: process.env.CORS_ORIGIN || "*"}));
app.use(express.json({limit:"100kb"}));
app.use(express.static(root));

function token(user){ return jwt.sign({sub:user.id,role:user.role,email:user.email},secret,{expiresIn:"7d"}); }
function auth(req,res,next){
  const h=req.headers.authorization || "";
  if(!h.startsWith("Bearer ")) return res.status(401).json({error:"Authentication required"});
  try { req.user=jwt.verify(h.slice(7),secret); next(); } catch { res.status(401).json({error:"Invalid or expired token"}); }
}
function role(...roles){ return (req,res,next)=>roles.includes(req.user.role) ? next() : res.status(403).json({error:"Insufficient role"}); }
function audit(actor,action,targetType,targetId,meta={}) {
  db.prepare("INSERT INTO audit_log(actor_user_id,action,target_type,target_id,metadata_json) VALUES(?,?,?,?,?)")
    .run(actor?.id || null,action,targetType||null,targetId||null,JSON.stringify(meta));
}

app.get("/api/health",(req,res)=>res.json({ok:true,service:"dpdp-ctf-platform"}));

app.post("/api/auth/register",async(req,res)=>{
  const email=String(req.body?.email||"").trim().toLowerCase();
  const name=String(req.body?.name||"").trim();
  const password=String(req.body?.password||"");
  const organization=String(req.body?.organization||"").trim() || null;
  if(!email || !name || password.length<8) return res.status(400).json({error:"Email, name and an 8+ character password are required"});
  if(db.prepare("SELECT id FROM users WHERE email=?").get(email)) return res.status(409).json({error:"Account already exists"});
  const hash=await bcrypt.hash(password,12);
  const info=db.prepare("INSERT INTO users(email,name,password_hash,organization) VALUES(?,?,?,?)").run(email,name,hash,organization);
  const user=db.prepare("SELECT id,email,name,role,organization FROM users WHERE id=?").get(info.lastInsertRowid);
  audit(user,"register","user",String(user.id));
  res.status(201).json({user,token:token(user)});
});

app.post("/api/auth/login",async(req,res)=>{
  const email=String(req.body?.email||"").trim().toLowerCase();
  const password=String(req.body?.password||"");
  const row=db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if(!row || !(await bcrypt.compare(password,row.password_hash))) return res.status(401).json({error:"Invalid credentials"});
  db.prepare("UPDATE users SET last_login_at=CURRENT_TIMESTAMP WHERE id=?").run(row.id);
  const user={id:row.id,email:row.email,name:row.name,role:row.role,organization:row.organization};
  audit(user,"login","user",String(user.id));
  res.json({user,token:token(user)});
});

app.get("/api/me",auth,(req,res)=>{
  res.json({user:db.prepare("SELECT id,email,name,role,organization,created_at,last_login_at FROM users WHERE id=?").get(req.user.sub)});
});

app.get("/api/rooms",(req,res)=>{
  res.json({rooms:db.prepare("SELECT * FROM rooms WHERE status='published' ORDER BY path,code").all()});
});

app.get("/api/tasks/quiz",auth,(req,res)=>{
  const tasks=(taskRegistry.tasks || []).map(({correct_answer, ...publicTask})=>publicTask);
  res.json({tasks,last_verified:taskRegistry.last_verified});
});

app.post("/api/tasks/:taskId/answer",auth,(req,res)=>{
  const task=(taskRegistry.tasks || []).find(t=>t.id===req.params.taskId);
  if(!task) return res.status(404).json({error:"Task not found"});
  validateTask(task);
  const supplied=req.body?.answer;
  const correct=JSON.stringify(supplied)===JSON.stringify(task.correct_answer);
  const points=correct ? task.points : 0;
  audit(req.user,"task_answered","task",task.id,{correct});
  res.json({
    correct,
    points,
    explanation:task.explanation,
    citation:task.citation,
    hint_costs:(task.hints || []).map(h=>h.cost)
  });
});

app.get("/api/progress",auth,(req,res)=>{
  const rows=db.prepare("SELECT p.room_id,p.completed,p.xp,p.attempts,p.completed_at,r.code,r.title,r.path FROM progress p JOIN rooms r ON r.id=p.room_id WHERE p.user_id=? ORDER BY r.path,r.code").all(req.user.sub);
  const totals=db.prepare("SELECT COALESCE(SUM(xp),0) xp,COUNT(*) completed FROM progress WHERE user_id=? AND completed=1").get(req.user.sub);
  res.json({rows,totals});
});

app.post("/api/progress/attempt",auth,(req,res)=>{
  const roomId=String(req.body?.roomId||"");
  const challengeIndex=Number(req.body?.challengeIndex);
  const correct=!!req.body?.correct;
  const xp=correct ? Math.max(0,Number(req.body?.xp)||0) : 0;
  if(!roomId || !Number.isInteger(challengeIndex)) return res.status(400).json({error:"roomId and challengeIndex are required"});
  db.prepare("INSERT INTO challenge_attempts(user_id,room_id,challenge_index,correct,xp_awarded) VALUES(?,?,?,?,?)").run(req.user.sub,roomId,challengeIndex,correct?1:0,xp);
  db.prepare("INSERT INTO progress(user_id,room_id,attempts,xp) VALUES(?,?,1,?) ON CONFLICT(user_id,room_id) DO UPDATE SET attempts=attempts+1,xp=xp+excluded.xp").run(req.user.sub,roomId,xp);
  audit(req.user,"challenge_attempt","room",roomId,{challengeIndex,correct,xp});
  res.json({ok:true,xpAwarded:xp});
});

app.post("/api/progress/complete-room",auth,(req,res)=>{
  const roomId=String(req.body?.roomId||"");
  if(!db.prepare("SELECT id FROM rooms WHERE id=?").get(roomId)) return res.status(404).json({error:"Room not found"});
  db.prepare("INSERT INTO progress(user_id,room_id,completed,xp,completed_at) VALUES(?,?,1,?,CURRENT_TIMESTAMP) ON CONFLICT(user_id,room_id) DO UPDATE SET completed=1,completed_at=CURRENT_TIMESTAMP").run(req.user.sub,roomId,Math.max(0,Number(req.body?.xp)||0));
  audit(req.user,"room_completed","room",roomId);
  res.json({ok:true});
});

app.get("/api/leaderboard",(req,res)=>{
  const rows=db.prepare("SELECT u.id,u.name,u.organization,COALESCE(SUM(CASE WHEN p.completed=1 THEN p.xp ELSE 0 END),0) xp,COUNT(CASE WHEN p.completed=1 THEN 1 END) completed_rooms FROM users u LEFT JOIN progress p ON p.user_id=u.id WHERE u.role='learner' GROUP BY u.id ORDER BY xp DESC,completed_rooms DESC,u.name ASC LIMIT 100").all();
  res.json({rows});
});

app.get("/api/admin/summary",auth,role("hr","admin"),(req,res)=>{
  res.json({
    users:db.prepare("SELECT COUNT(*) count FROM users WHERE role='learner'").get().count,
    completions:db.prepare("SELECT COUNT(*) count FROM progress WHERE completed=1").get().count,
    attempts:db.prepare("SELECT COUNT(*) count FROM challenge_attempts").get().count,
    certificates:db.prepare("SELECT COUNT(*) count FROM certificates").get().count
  });
});

app.get("/api/admin/users",auth,role("hr","admin"),(req,res)=>{
  const rows=db.prepare("SELECT u.id,u.email,u.name,u.organization,u.created_at,COALESCE(SUM(CASE WHEN p.completed=1 THEN p.xp ELSE 0 END),0) xp,COUNT(CASE WHEN p.completed=1 THEN 1 END) completed_rooms FROM users u LEFT JOIN progress p ON p.user_id=u.id GROUP BY u.id ORDER BY u.created_at DESC").all();
  res.json({rows});
});

app.post("/api/certificates/issue",auth,role("hr","admin"),(req,res)=>{
  const user=db.prepare("SELECT id,name FROM users WHERE id=?").get(Number(req.body?.userId));
  if(!user) return res.status(404).json({error:"User not found"});
  const completed=db.prepare("SELECT COUNT(*) count FROM progress WHERE user_id=? AND completed=1").get(user.id).count;
  const total=db.prepare("SELECT COUNT(*) count FROM rooms WHERE status='published'").get().count;
  if(completed<total) return res.status(400).json({error:"User has not completed all published rooms"});
  const no="DPDP-"+new Date().getFullYear()+"-"+crypto.randomBytes(5).toString("hex").toUpperCase();
  const hash=crypto.createHash("sha256").update(no+":"+user.id+":"+Date.now()).digest("hex");
  db.prepare("INSERT INTO certificates(user_id,certificate_no,course,verification_hash) VALUES(?,?,?,?)").run(user.id,no,"DPDP CTF Foundation",hash);
  audit(req.user,"certificate_issued","certificate",no,{userId:user.id});
  res.status(201).json({certificateNo:no,verificationHash:hash});
});

app.get("/api/certificates/verify/:no",(req,res)=>{
  const row=db.prepare("SELECT c.certificate_no,c.course,c.issued_at,c.verification_hash,u.name FROM certificates c JOIN users u ON u.id=c.user_id WHERE c.certificate_no=?").get(req.params.no);
  if(!row) return res.status(404).json({valid:false});
  res.json({valid:true,...row});
});

app.post("/api/admin/seed-rooms",auth,role("admin"),(req,res)=>{
  const rooms=Array.isArray(req.body?.rooms) ? req.body.rooms : [];
  const stmt=db.prepare("INSERT INTO rooms(id,code,title,path,version,status,source_url,legal_reference,effective_from,updated_at) VALUES(@id,@code,@title,@path,@version,@status,@source_url,@legal_reference,@effective_from,CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET code=excluded.code,title=excluded.title,path=excluded.path,version=excluded.version,status=excluded.status,source_url=excluded.source_url,legal_reference=excluded.legal_reference,effective_from=excluded.effective_from,updated_at=CURRENT_TIMESTAMP");
  db.transaction(function(items){items.forEach(function(x){stmt.run(x);});})(rooms);
  audit(req.user,"rooms_seeded","room",null,{count:rooms.length});
  res.json({ok:true,count:rooms.length});
});

const adminEmail=process.env.ADMIN_EMAIL;
const adminPassword=process.env.ADMIN_PASSWORD;
if(adminEmail && adminPassword && !db.prepare("SELECT id FROM users WHERE email=?").get(adminEmail.toLowerCase())) {
  const hash=await bcrypt.hash(adminPassword,12);
  const info=db.prepare("INSERT INTO users(email,name,password_hash,role) VALUES(?,?,?,?)").run(adminEmail.toLowerCase(),"Platform Administrator",hash,"admin");
  audit({id:Number(info.lastInsertRowid)},"bootstrap_admin","user",String(info.lastInsertRowid));
}

app.listen(port,function(){console.log("DPDP CTF running on http://localhost:"+port);});