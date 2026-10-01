import express from "express";
import { rateLimit } from "express-rate-limit";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getPrisma } from "../lib/prisma.js";

const quizRate=rateLimit({windowMs:60_000,limit:24,standardHeaders:"draft-8",legacyHeaders:false,message:{error:"Too many quiz requests. Try again shortly."}});
const writeRate=rateLimit({windowMs:60_000,limit:12,standardHeaders:"draft-8",legacyHeaders:false,message:{error:"Too many requests. Try again shortly."}});
const submissionSchema=z.object({quizId:z.string().uuid(),attemptKey:z.string().uuid(),answers:z.record(z.string().uuid(),z.number().int().min(-1).max(20)),timeSpent:z.number().int().min(0).max(14_400)}).strict();
const projectSchema=z.object({
  title:z.string().trim().min(2).max(120),slug:z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  summary:z.string().trim().min(10).max(500),content:z.string().max(30_000),
  tags:z.array(z.string().trim().min(1).max(32)).max(12),
  repoUrl:z.string().url().startsWith("https://").nullable().optional(),
  liveUrl:z.string().url().startsWith("https://").nullable().optional(),
  featured:z.boolean().default(false),published:z.boolean().default(false)
}).strict();
const questionBaseSchema=z.object({
  prompt:z.string().trim().min(8).max(3000),options:z.array(z.string().trim().min(1).max(300)).min(2).max(8),
  correctOption:z.number().int().min(0).max(7),explanation:z.string().trim().min(8).max(3000),
  category:z.string().trim().min(2).max(60),difficulty:z.enum(["Beginner","Intermediate","Advanced"]),position:z.number().int().min(0).max(200)
}).strict();
const questionSchema=questionBaseSchema.superRefine((question,ctx)=>{if(question.correctOption>=question.options.length)ctx.addIssue({code:"custom",path:["correctOption"],message:"The correct option must exist."});});
const quizSchema=z.object({
  title:z.string().trim().min(2).max(120),slug:z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  description:z.string().trim().min(10).max(500),category:z.string().trim().min(2).max(60),
  difficulty:z.enum(["Beginner","Intermediate","Advanced"]),timeLimit:z.number().int().min(1).max(240).default(30),isActive:z.boolean().default(false),
  questions:z.array(questionBaseSchema.omit({position:true})).max(100).default([])
}).strict();

let authClient;
function supabaseAdmin(){
  if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase server authentication is not configured.");
  if(!authClient) authClient=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:false,persistSession:false}});
  return authClient;
}
function safeMarkdown(markdown){
  return String(markdown||"")
    .replace(/<(script|style|iframe|object|embed|svg)[^>]*>[\s\S]*?<\/\1\s*>/gi,"")
    .replace(/<[^>]*>/g,"")
    .replace(/(\]\s*\()\s*(?:javascript|data):[^)]*(\))/gi,"$1#$2");
}
function sendError(res,error){
  if(error?.name==="ZodError") return res.status(400).json({error:"Invalid request",details:error.issues.map(issue=>({field:issue.path.join("."),message:issue.message}))});
  console.error("Cyber Lab API:",error);
  return res.status(500).json({error:"The request could not be completed."});
}
function publicProject(project){const {createdById,updatedAt,...visible}=project;return {...visible,content:safeMarkdown(visible.content)};}

export function createFeatureApi(){
  const router=express.Router();
  const authenticate=async(req,res,next)=>{
    const token=req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if(!token) return res.status(401).json({error:"Sign in to continue."});
    try{
      const {data,error}=await supabaseAdmin().auth.getUser(token);
      if(error||!data.user?.id||!data.user.email) return res.status(401).json({error:"Your session is invalid or expired."});
      const prisma=getPrisma(),email=data.user.email.toLowerCase();
      let user=await prisma.user.findUnique({where:{email}});
      if(user){
        if(user.id!==data.user.id) user=await prisma.user.update({where:{email},data:{id:data.user.id,avatarUrl:data.user.user_metadata?.avatar_url||user.avatarUrl}});
      }else{
        const raw=String(data.user.user_metadata?.user_name||data.user.user_metadata?.preferred_username||email.split("@")[0]).toLowerCase();
        const base=raw.replace(/[^a-z0-9._-]/g,"").slice(0,24)||"learner";
        const username=`${base}-${data.user.id.slice(0,6)}`;
        user=await prisma.user.create({data:{id:data.user.id,email,username,avatarUrl:data.user.user_metadata?.avatar_url||null,role:"user"}});
      }
      req.user={id:user.id,email:user.email,username:user.username,role:user.role,xp:user.xp};
      next();
    }catch(error){if(error.message?.includes("not configured"))return res.status(503).json({error:"Authentication service is not configured."});sendError(res,error);}
  };
  const admin=(req,res,next)=>req.user?.role==="admin"?next():res.status(403).json({error:"Admin access required."});

  router.get("/auth/sync",authenticate,(req,res)=>res.json({user:req.user}));
  router.get("/quizzes",quizRate,async(req,res)=>{
    try{
      const quizzes=await getPrisma().quiz.findMany({where:{isActive:true},orderBy:{category:"asc"},select:{id:true,title:true,slug:true,description:true,category:true,difficulty:true,timeLimit:true,questions:{orderBy:{position:"asc"},select:{id:true,prompt:true,options:true,category:true,difficulty:true,position:true}}}});
      res.set("Cache-Control","public, max-age=60, stale-while-revalidate=300").json({quizzes});
    }catch(error){if(!process.env.DATABASE_URL)return res.status(503).json({error:"Set DATABASE_URL and seed the Cyber Lab database."});sendError(res,error);}
  });
  router.post("/quizzes/submit",writeRate,authenticate,async(req,res)=>{
    try{
      const input=submissionSchema.parse(req.body),prisma=getPrisma();
      const quiz=await prisma.quiz.findFirst({where:{id:input.quizId,isActive:true},include:{questions:{orderBy:{position:"asc"},select:{id:true,correctOption:true,explanation:true,category:true}}}});
      if(!quiz||!quiz.questions.length)return res.status(404).json({error:"Quiz is unavailable."});
      const existing=await prisma.quizAttempt.findUnique({where:{attemptKey:input.attemptKey}});
      if(existing){if(existing.userId!==req.user.id)return res.status(409).json({error:"This attempt key was already used."});return res.json({attemptId:existing.id,score:existing.score,maxScore:existing.maxScore,scorePercent:Math.round(existing.score/existing.maxScore*100),xpAwarded:existing.xpAwarded,replayed:true});}
      const answerMap=input.answers;
      const correct=quiz.questions.filter(question=>answerMap[question.id]===question.correctOption).length;
      const scorePercent=Math.round(correct/quiz.questions.length*100),targetReward=Math.floor(scorePercent/10);
      const feedback=quiz.questions.map(question=>({questionId:question.id,correct:answerMap[question.id]===question.correctOption,explanation:question.explanation,category:question.category}));
      const result=await prisma.$transaction(async tx=>{
        const prior=await tx.quizAttempt.aggregate({where:{userId:req.user.id,quizId:quiz.id},_max:{xpAwarded:true}});
        const xpAwarded=Math.max(0,targetReward-(prior._max.xpAwarded||0));
        const attempt=await tx.quizAttempt.create({data:{attemptKey:input.attemptKey,userId:req.user.id,quizId:quiz.id,score:correct,maxScore:quiz.questions.length,timeSpent:input.timeSpent,answersJson:answerMap,xpAwarded}});
        if(xpAwarded) await tx.user.update({where:{id:req.user.id},data:{xp:{increment:xpAwarded}}});
        return {attempt,xpAwarded};
      },{isolationLevel:"Serializable"});
      res.status(201).set("Cache-Control","no-store").json({attemptId:result.attempt.id,score:correct,maxScore:quiz.questions.length,scorePercent,xpAwarded:result.xpAwarded,feedback});
    }catch(error){
      if(error?.name==="ZodError")return sendError(res,error);
      if(error?.code==="P2034")return res.status(409).json({error:"Attempt was being updated. Retry with the same attempt key."});
      if(error?.code==="P2002"&&req.body?.attemptKey){try{const saved=await getPrisma().quizAttempt.findUnique({where:{attemptKey:req.body.attemptKey}});if(saved&&saved.userId===req.user?.id)return res.json({attemptId:saved.id,score:saved.score,maxScore:saved.maxScore,scorePercent:Math.round(saved.score/saved.maxScore*100),xpAwarded:saved.xpAwarded,replayed:true});}catch{}}
      sendError(res,error);
    }
  });
  router.get("/cyber/leaderboard",async(req,res)=>{
    if(!process.env.DATABASE_URL)return res.status(503).json({error:"Set DATABASE_URL to enable the Cyber Lab leaderboard."});
    try{
      const rows=await getPrisma().$queryRawUnsafe([
        "SELECT u.id,u.username,u.xp,",
        "(SELECT COUNT(*)::int FROM public.cyber_quiz_attempts a WHERE a.user_id=u.id) AS attempts,",
        "COALESCE((SELECT SUM(best_time)::int FROM (SELECT MIN(a.time_spent) AS best_time",
        "FROM public.cyber_quiz_attempts a WHERE a.user_id=u.id GROUP BY a.quiz_id) speed),0)::int AS total_seconds",
        "FROM public.cyber_users u WHERE u.role='user'",
        "ORDER BY u.xp DESC,total_seconds ASC,u.username ASC LIMIT 50"
      ].join(" "));
      res.set("Cache-Control","no-store").json({rows:rows.map(({id,username,xp,attempts,total_seconds},index)=>({id,rank:index+1,username,xp,attempts,totalSeconds:total_seconds}))});
    }catch(error){sendError(res,error);}
  });
  router.get("/projects",async(req,res)=>{
    try{
      const category=typeof req.query.category==="string"?req.query.category:undefined;
      const search=typeof req.query.q==="string"?req.query.q.trim().slice(0,80):undefined;
      const projects=await getPrisma().project.findMany({where:{published:true,...(category?{tags:{has:category}}:{}),...(search?{OR:[{title:{contains:search,mode:"insensitive"}},{summary:{contains:search,mode:"insensitive"}},{tags:{has:search}}]}:{})},orderBy:[{featured:"desc"},{updatedAt:"desc"}],take:60});
      res.set("Cache-Control","public, max-age=60").json({projects:projects.map(publicProject)});
    }catch(error){sendError(res,error);}
  });
  router.get("/projects/:slug",async(req,res)=>{
    try{const project=await getPrisma().project.findFirst({where:{slug:req.params.slug,published:true}});if(!project)return res.status(404).json({error:"Project not found."});res.json({project:publicProject(project)});}catch(error){sendError(res,error);}
  });
  router.get("/cyber/rooms",async(req,res)=>{
    try{const rooms=await getPrisma().room.findMany({where:{isActive:true},orderBy:{title:"asc"},select:{id:true,title:true,slug:true,topic:true}});res.json({rooms});}catch(error){sendError(res,error);}
  });
  router.get("/admin/metrics",authenticate,admin,async(req,res)=>{
    try {
      const prisma = getPrisma();
      const [users, projects, quizzes, attempts, recent] = await Promise.all([
        prisma.user.count(),
        prisma.project.count(),
        prisma.quiz.count(),
        prisma.quizAttempt.count(),
        prisma.quizAttempt.findMany({
          take: 20,
          orderBy: { createdAt: "desc" },
          include: {
            quiz: { select: { title: true } },
            user: { select: { username: true } },
          },
        }),
      ]);
      res.json({
        users,
        projects,
        quizzes,
        attempts,
        recent: recent.map((item) => ({
          id: item.id,
          username: item.user.username,
          quiz: item.quiz.title,
          score: item.score,
          maxScore: item.maxScore,
          createdAt: item.createdAt,
        })),
      });
    } catch (error) {
      sendError(res, error);
    }
  });
  router.get("/admin/projects",authenticate,admin,async(req,res)=>{try{const projects=await getPrisma().project.findMany({orderBy:{updatedAt:"desc"},take:100});res.json({projects});}catch(error){sendError(res,error);}});
  router.get("/admin/quizzes",authenticate,admin,async(req,res)=>{try{const quizzes=await getPrisma().quiz.findMany({orderBy:{createdAt:"desc"},include:{questions:{orderBy:{position:"asc"}}}});res.json({quizzes});}catch(error){sendError(res,error);}});
  router.post("/admin/quizzes",writeRate,authenticate,admin,async(req,res)=>{
    try{const input=quizSchema.parse(req.body),{questions,...quizData}=input;const quiz=await getPrisma().quiz.create({data:{...quizData,questions:{create:questions.map((question,position)=>({...question,position}))}},include:{questions:{orderBy:{position:"asc"}}}});res.status(201).json({quiz});}
    catch(error){if(error?.code==="P2002")return res.status(409).json({error:"That quiz slug is already in use."});sendError(res,error);}
  });
  router.patch("/admin/quizzes/:id",writeRate,authenticate,admin,async(req,res)=>{
    try{const input=quizSchema.partial().omit({questions:true}).strict().parse(req.body),quiz=await getPrisma().quiz.update({where:{id:req.params.id},data:input,include:{questions:{orderBy:{position:"asc"}}}});res.json({quiz});}
    catch(error){if(error?.code==="P2025")return res.status(404).json({error:"Quiz not found."});if(error?.code==="P2002")return res.status(409).json({error:"That quiz slug is already in use."});sendError(res,error);}
  });
  router.delete("/admin/quizzes/:id",writeRate,authenticate,admin,async(req,res)=>{try{await getPrisma().quiz.delete({where:{id:req.params.id}});res.status(204).end();}catch(error){if(error?.code==="P2025")return res.status(404).json({error:"Quiz not found."});sendError(res,error);}});
  router.post("/admin/quizzes/:id/questions",writeRate,authenticate,admin,async(req,res)=>{
    try{const input=questionSchema.parse(req.body),quiz=await getPrisma().quiz.findUnique({where:{id:req.params.id},select:{id:true}});if(!quiz)return res.status(404).json({error:"Quiz not found."});const question=await getPrisma().question.create({data:{...input,quizId:quiz.id}});res.status(201).json({question});}
    catch(error){if(error?.code==="P2002")return res.status(409).json({error:"That question position is already in use."});sendError(res,error);}
  });
  router.patch("/admin/questions/:id",writeRate,authenticate,admin,async(req,res)=>{
    try{const input=questionSchema.partial().strict().parse(req.body),question=await getPrisma().question.update({where:{id:req.params.id},data:input});res.json({question});}
    catch(error){if(error?.code==="P2025")return res.status(404).json({error:"Question not found."});if(error?.code==="P2002")return res.status(409).json({error:"That question position is already in use."});sendError(res,error);}
  });
  router.delete("/admin/questions/:id",writeRate,authenticate,admin,async(req,res)=>{try{await getPrisma().question.delete({where:{id:req.params.id}});res.status(204).end();}catch(error){if(error?.code==="P2025")return res.status(404).json({error:"Question not found."});sendError(res,error);}});
  router.post("/admin/projects",writeRate,authenticate,admin,async(req,res)=>{
    try{const input=projectSchema.parse(req.body),project=await getPrisma().project.create({data:{...input,content:safeMarkdown(input.content),createdById:req.user.id}});res.status(201).json({project:publicProject(project)});}catch(error){if(error?.code==="P2002")return res.status(409).json({error:"That project slug is already in use."});sendError(res,error);}
  });
  router.patch("/admin/projects/:id",writeRate,authenticate,admin,async(req,res)=>{
    try{const input=projectSchema.partial().strict().parse(req.body),project=await getPrisma().project.update({where:{id:req.params.id},data:{...input,...(input.content?{content:safeMarkdown(input.content)}:{})}});res.json({project:publicProject(project)});}catch(error){if(error?.code==="P2025")return res.status(404).json({error:"Project not found."});if(error?.code==="P2002")return res.status(409).json({error:"That project slug is already in use."});sendError(res,error);}
  });
  router.delete("/admin/projects/:id",writeRate,authenticate,admin,async(req,res)=>{try{await getPrisma().project.delete({where:{id:req.params.id}});res.status(204).end();}catch(error){if(error?.code==="P2025")return res.status(404).json({error:"Project not found."});sendError(res,error);}});
  return router;
}
