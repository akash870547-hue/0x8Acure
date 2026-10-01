import {useEffect,useMemo,useRef,useState,type ReactNode} from "react";
import {Activity,Award,Download,ExternalLink,FileKey2,Link as LinkIcon,Search,ShieldCheck,Users} from "lucide-react";
import {useAuth} from "../auth/AuthProvider";

type Tab="telemetry"|"certificate"|"badges"|"drive"|"users";
type AdminUser={id:string;username:string;email:string;role:"admin"|"user";xp:number;status:"ACTIVE"|"REVOKED"};
type Badge={id:string;name:string;description:string;xp:number};
type Drive={id:string;name:string;url:string};
type EventRow={id:string;time:string;severity:"INFO"|"LOW"|"MEDIUM"|"HIGH";action:string;target:string};

const USER_KEY="0x8acure.admin.users";
const BADGE_KEY="0x8acure.admin.badges";
const DRIVE_KEY="0x8acure.admin.drive";
const EVENT_KEY="0x8acure.admin.events";

const defaultUsers:AdminUser[]=[
{id:"local-admin",username:"admin",email:"admin@0x8acure.local",role:"admin",xp:0,status:"ACTIVE"},
{id:"demo-learner",username:"learner",email:"learner@0x8acure.local",role:"user",xp:275,status:"ACTIVE"}
];
const defaultBadges:Badge[]=[
{id:"forensic-investigator",name:"Forensic Investigator",description:"Digital forensics milestone",xp:100},
{id:"cloud-sentinel",name:"Cloud Sentinel",description:"Cloud security milestone",xp:125},
{id:"packet-hunter",name:"Packet Hunter",description:"Network forensics milestone",xp:75},
{id:"kernel-slayer",name:"Kernel Slayer",description:"Advanced systems milestone",xp:150}
];
const defaultDrive:Drive[]=[
{id:"chfi",name:"CHFI v11 Master Drive",url:"https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb"},
{id:"cloud",name:"Cloud Security Engineering",url:"https://drive.google.com/drive/folders/1Pj3FZyAQTeaZVF8i5jvwTRBJCLhtvZiw"}
];

function read<T>(key:string,fallback:T):T{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw) as T:fallback;}catch{return fallback;}}
function save(key:string,value:unknown){localStorage.setItem(key,JSON.stringify(value));}
async function digest(value:string){const data=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));return Array.from(new Uint8Array(data)).map(x=>x.toString(16).padStart(2,"0")).join("");}
function download(blob:Blob,name:string){const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function eventRow(severity:EventRow["severity"],action:string,target:string):EventRow{return{id:crypto.randomUUID(),time:new Date().toISOString(),severity,action,target};}

export function AdminView(){
 const {user}=useAuth();
 const [tab,setTab]=useState<Tab>("telemetry");
 if(user?.role!=="admin")return <section className="content-page"><div className="panel admin-locked"><ShieldCheck size={34}/><h1>Admin access required</h1><p>Administrator authentication is required for this workspace.</p></div></section>;
 const tabs:[Tab,string,ReactNode][]=[
  ["telemetry","Telemetry & Activity",<Activity size={16}/>],
  ["certificate","Certificate Generator",<FileKey2 size={16}/>],
  ["badges","Badges & XP",<Award size={16}/>],
  ["drive","Drive & Content",<LinkIcon size={16}/>],
  ["users","User Directory",<Users size={16}/>]
 ];
 return <section className="content-page">
  <div className="page-heading admin-heading"><div><span className="eyebrow">RBAC · ADMIN ONLY</span><h1>Admin Command Center</h1><p>Standalone administration workspace with offline-safe local persistence.</p></div><div className="panel"><ShieldCheck size={16}/> ADMIN SESSION</div></div>
  <nav className="materials-filters" aria-label="Admin modules">{tabs.map(([id,label,icon])=><button key={id} className={tab===id?"filter-pill active":"filter-pill"} onClick={()=>setTab(id)}>{icon}{label}</button>)}</nav>
  {tab==="telemetry"&&<Telemetry/>}
  {tab==="certificate"&&<Certificate/>}
  {tab==="badges"&&<Badges/>}
  {tab==="drive"&&<DriveManager/>}
  {tab==="users"&&<UsersPanel/>}
 </section>;
}

function Telemetry(){
 const [users,setUsers]=useState<AdminUser[]>(()=>read(USER_KEY,defaultUsers));
 const [events,setEvents]=useState<EventRow[]>(()=>read(EVENT_KEY,[eventRow("INFO","Admin console initialized","GitHub Pages"),eventRow("LOW","Curriculum loaded","21 modules"),eventRow("INFO","Scenario bank loaded","100 questions")]));
 const [live,setLive]=useState(true);
 useEffect(()=>{if(!live)return;const timer=setInterval(()=>{setEvents(current=>{const next=[eventRow("INFO","Security heartbeat","Cyber Lab"),...current].slice(0,40);save(EVENT_KEY,next);return next;});},5000);return()=>clearInterval(timer);},[live]);
 function revoke(id:string){const next=users.map(u=>u.id===id?{...u,status:"REVOKED" as const}:u);setUsers(next);save(USER_KEY,next);setEvents(current=>{const next=[eventRow("HIGH","Session revoked",id),...current];save(EVENT_KEY,next);return next;});}
 return <div className="admin-columns">
  <section className="panel"><div className="panel-title"><span>SYSTEM TELEMETRY</span><Activity size={16}/></div>
   <div className="metric-grid"><div className="metric-card"><span>Registered Users</span><b>{users.length}</b></div><div className="metric-card"><span>Active Sessions</span><b>{users.filter(u=>u.status==="ACTIVE").length}</b></div><div className="metric-card"><span>Modules</span><b>21</b></div><div className="metric-card"><span>Questions</span><b>100</b></div></div>
   <button className="btn secondary" onClick={()=>setLive(x=>!x)}>{live?"Pause live stream":"Resume live stream"}</button>
  </section>
  <section className="panel"><div className="panel-title"><span>LIVE SECURITY LOG</span><span>{live?"LIVE":"PAUSED"}</span></div>{events.map(e=><div className="attempt-row" key={e.id}><span><b>{e.action}</b><small>{e.target}</small></span><span>{e.severity}</span><time>{new Date(e.time).toLocaleTimeString()}</time></div>)}</section>
  <section className="panel"><div className="panel-title"><span>SESSION REVOKE</span><ShieldCheck size={16}/></div>{users.map(u=><div className="attempt-row" key={u.id}><span><b>{u.username}</b><small>{u.email}</small></span><span>{u.status}</span>{u.id!=="local-admin"&&<button className="btn secondary" disabled={u.status==="REVOKED"} onClick={()=>revoke(u.id)}>Revoke</button>}</div>)}</section>
 </div>;
}

function Certificate(){
 const users=read<AdminUser[]>(USER_KEY,defaultUsers);
 const [candidate,setCandidate]=useState(users[1]?.id||users[0].id);
 const [track,setTrack]=useState("CHFI v11");
 const [hash,setHash]=useState("");
 const [id]=useState("0x8A-CERT-"+new Date().getFullYear()+"-"+crypto.randomUUID().slice(0,8).toUpperCase());
 const svgRef=useRef<SVGSVGElement|null>(null);
 const name=users.find(u=>u.id===candidate)?.username||"Learner";
 async function generate(){setHash(await digest(id+"|"+name+"|"+track));}
 function svg(){if(!svgRef.current)return;download(new Blob([new XMLSerializer().serializeToString(svgRef.current)],{type:"image/svg+xml"}),id+".svg");}
 function png(){if(!svgRef.current)return;const source=new XMLSerializer().serializeToString(svgRef.current);const image=new Image();const url=URL.createObjectURL(new Blob([source],{type:"image/svg+xml"}));image.onload=()=>{const canvas=document.createElement("canvas");canvas.width=1600;canvas.height=1000;const ctx=canvas.getContext("2d");if(!ctx)return;ctx.fillStyle="#fff";ctx.fillRect(0,0,1600,1000);ctx.drawImage(image,0,0,1600,1000);canvas.toBlob(blob=>{if(blob)download(blob,id+".png");URL.revokeObjectURL(url)},"image/png")};image.src=url;}
 return <section className="panel"><div className="panel-title"><span>DYNAMIC CERTIFICATE GENERATOR</span><FileKey2 size={16}/></div>
  <div className="admin-columns"><div className="admin-form"><label>Candidate<select value={candidate} onChange={e=>setCandidate(e.target.value)}>{users.map(u=><option key={u.id} value={u.id}>{u.username}</option>)}</select></label><label>Track<select value={track} onChange={e=>setTrack(e.target.value)}><option>CHFI v11</option><option>Cloud Security</option></select></label><label>Certificate ID<input readOnly value={id}/></label><button className="btn primary" onClick={()=>void generate()}>Generate SHA-256</button>{hash&&<p className="form-message"><code style={{wordBreak:"break-all"}}>{hash}</code></p>}</div>
   <div><svg ref={svgRef} viewBox="0 0 1600 1000" width="100%" aria-label="Certificate preview"><rect width="1600" height="1000" fill="white"/><rect x="35" y="35" width="1530" height="930" fill="none" stroke="black" strokeWidth="5"/><text x="800" y="190" textAnchor="middle" fontSize="36">0x8Acure</text><text x="800" y="285" textAnchor="middle" fontSize="50" fontWeight="700">CERTIFICATE OF COMPLETION</text><text x="800" y="400" textAnchor="middle" fontSize="26">Awarded to</text><text x="800" y="480" textAnchor="middle" fontSize="48" fontWeight="700">{name}</text><text x="800" y="565" textAnchor="middle" fontSize="28">Track: {track}</text><text x="800" y="650" textAnchor="middle" fontSize="20">Certificate ID: {id}</text><text x="800" y="725" textAnchor="middle" fontSize="15">{hash||"Generate SHA-256 hash to verify"}</text></svg><div className="admin-inline-actions"><button className="btn secondary" onClick={svg}><Download size={15}/>SVG</button><button className="btn primary" onClick={png}><Download size={15}/>PNG</button></div></div>
  </div></section>;
}

function Badges(){
 const [users,setUsers]=useState<AdminUser[]>(()=>read(USER_KEY,defaultUsers));
 const badges=read<Badge[]>(BADGE_KEY,defaultBadges);
 const [userId,setUserId]=useState(users[1]?.id||users[0].id);
 const [badgeId,setBadgeId]=useState(badges[0].id);
 const [message,setMessage]=useState("");
 function award(){const b=badges.find(x=>x.id===badgeId);if(!b)return;const next=users.map(u=>u.id===userId?{...u,xp:u.xp+b.xp}:u);setUsers(next);save(USER_KEY,next);setMessage(b.name+" awarded, +"+b.xp+" XP.");}
 return <section className="panel"><div className="panel-title"><span>BADGE & GAMIFICATION</span><Award size={16}/></div><div className="admin-form"><label>Candidate<select value={userId} onChange={e=>setUserId(e.target.value)}>{users.map(u=><option key={u.id} value={u.id}>{u.username}</option>)}</select></label><label>Badge<select value={badgeId} onChange={e=>setBadgeId(e.target.value)}>{badges.map(b=><option key={b.id} value={b.id}>{b.name} (+{b.xp} XP)</option>)}</select></label><button className="btn primary" onClick={award}>Award Badge</button>{message&&<p className="form-message">{message}</p>}</div><div className="admin-list">{users.map(u=><div className="attempt-row" key={u.id}><span><b>{u.username}</b><small>{u.email}</small></span><span>{u.xp} XP</span></div>)}</div></section>;
}

function DriveManager(){
 const [links,setLinks]=useState<Drive[]>(()=>read(DRIVE_KEY,defaultDrive));
 const [message,setMessage]=useState("");
 function update(id:string,field:"name"|"url",value:string){setLinks(current=>current.map(x=>x.id===id?{...x,[field]:value}:x));}
 function saveLinks(){save(DRIVE_KEY,links);setMessage("Drive links saved locally.");}
 function add(){setLinks(current=>[...current,{id:crypto.randomUUID(),name:"New Content",url:"https://drive.google.com/"}]);}
 return <section className="panel"><div className="panel-title"><span>DRIVE LINKS & CONTENT MANAGER</span><LinkIcon size={16}/></div><div className="admin-form">{links.map(l=><div className="panel" key={l.id}><label>Label<input value={l.name} onChange={e=>update(l.id,"name",e.target.value)}/></label><label>Google Drive URL<input type="url" value={l.url} onChange={e=>update(l.id,"url",e.target.value)}/></label><a className="btn secondary" href={l.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={15}/>Open</a></div>)}<div className="admin-inline-actions"><button className="btn secondary" onClick={add}>Add link</button><button className="btn primary" onClick={saveLinks}>Save changes</button></div>{message&&<p className="form-message">{message}</p>}</div></section>;
}

function UsersPanel(){
 const [users,setUsers]=useState<AdminUser[]>(()=>read(USER_KEY,defaultUsers));
 const [query,setQuery]=useState("");
 const rows=useMemo(()=>{const q=query.trim().toLowerCase();return q?users.filter(u=>(u.username+" "+u.email+" "+u.role).toLowerCase().includes(q)):users;},[query,users]);
 function role(id:string,role:"admin"|"user"){if(id==="local-admin"&&role!=="admin")return;const next=users.map(u=>u.id===id?{...u,role}:u);setUsers(next);save(USER_KEY,next);}
 return <section className="panel"><div className="panel-title"><span>USER DIRECTORY</span><Users size={16}/></div><div style={{position:"relative",marginBottom:"1rem"}}><Search size={16} style={{position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)"}}/><input style={{width:"100%",paddingLeft:"38px"}} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search users, email, or role"/></div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr><th>User</th><th>Email</th><th>Role</th><th>XP</th><th>Status</th></tr></thead><tbody>{rows.map(u=><tr key={u.id}><td>{u.username}</td><td>{u.email}</td><td><select value={u.role} onChange={e=>role(u.id,e.target.value as "admin"|"user")}><option value="user">USER</option><option value="admin">ADMIN</option></select></td><td>{u.xp}</td><td>{u.status}</td></tr>)}</tbody></table></div></section>;
}
