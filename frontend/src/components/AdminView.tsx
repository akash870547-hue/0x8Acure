import { useEffect, useState, type FormEvent } from "react";
import { Plus, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { api } from "../lib/api";
import { QuizAdminPanel } from "./QuizAdminPanel";

type Metrics={users:number;projects:number;quizzes:number;attempts:number;recent:{id:string;username:string;quiz:string;score:number;maxScore:number;createdAt:string}[]};
type Project={id:string;title:string;slug:string;summary:string;content:string;tags:string[];repoUrl?:string|null;liveUrl?:string|null;featured:boolean;published:boolean};
export function AdminView(){
 const {session,user,openAuth}=useAuth();
 const [metrics,setMetrics]=useState<Metrics|null>(null),[projects,setProjects]=useState<Project[]>([]),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
 const load=async()=>{
  if(!session)return;
  try{
   const [stats,projectData]=await Promise.all([
    api<Metrics>("/api/admin/metrics",{},session.access_token),
    api<{projects:Project[]}>("/api/admin/projects",{},session.access_token)
   ]);
   setMetrics(stats);setProjects(projectData.projects);setMessage("");
  }catch(error){setMessage(error instanceof Error?error.message:"Could not load admin data.");}
 };
 useEffect(()=>{void load();},[session?.access_token]);
 const saveProject=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();if(!session)return;const target=event.currentTarget,form=new FormData(target);setBusy(true);
  try{
   await api("/api/admin/projects",{method:"POST",body:JSON.stringify({
    title:form.get("title"),slug:form.get("slug"),summary:form.get("summary"),content:form.get("content"),
    tags:String(form.get("tags")).split(",").map(value=>value.trim()).filter(Boolean),featured:false,published:true
   })},session.access_token);
   target.reset();setMessage("Project published.");await load();
  }catch(error){setMessage(error instanceof Error?error.message:"Project could not be saved.");}
  finally{setBusy(false);}
 };
 const updateProject=async(project:Project,event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();if(!session)return;const form=new FormData(event.currentTarget);
  try{
   await api("/api/admin/projects/"+project.id,{method:"PATCH",body:JSON.stringify({
    title:form.get("title"),slug:form.get("slug"),summary:form.get("summary"),content:form.get("content"),
    tags:String(form.get("tags")).split(",").map(value=>value.trim()).filter(Boolean),
    repoUrl:form.get("repoUrl")||null,liveUrl:form.get("liveUrl")||null,
    featured:form.get("featured")==="on",published:form.get("published")==="on"
   })},session.access_token);
   setMessage("Project updated.");await load();
  }catch(error){setMessage(error instanceof Error?error.message:"Project could not be updated.");}
 };
 const removeProject=async(id:string)=>{
  if(!session)return;
  try{await api("/api/admin/projects/"+id,{method:"DELETE"},session.access_token);setMessage("Project removed.");await load();}
  catch(error){setMessage(error instanceof Error?error.message:"Project could not be removed.");}
 };
 if(user?.role!=="admin")return <section className="content-page"><div className="page-heading"><span className="eyebrow">RESTRICTED CONSOLE</span><h1>Admin Dashboard</h1><p>Administrator access is required for platform management.</p></div><div className="panel admin-locked"><ShieldCheck size={32}/><h2>Protected route</h2><p>Your account does not have the admin role.</p><button className="btn secondary" onClick={openAuth}>Sign in</button></div></section>;
 return <section className="content-page">
  <div className="page-heading admin-heading"><div><span className="eyebrow">RBAC · ADMIN ONLY</span><h1>Admin Dashboard</h1><p>Manage Cyber Lab content and inspect learner activity.</p></div><button className="btn secondary" onClick={()=>void load()}><RefreshCw size={15}/>Refresh</button></div>
  {message&&<p className="form-message" role="status">{message}</p>}
  {metrics&&<div className="metric-grid">{[["Learners",metrics.users],["Projects",metrics.projects],["Quizzes",metrics.quizzes],["Attempts",metrics.attempts]].map(([label,value])=><div className="metric-card panel" key={label}><span>{label}</span><b>{value}</b></div>)}</div>}
  <div className="admin-columns">
   <section className="panel admin-form-panel"><div className="panel-title"><span>NEW PROJECT</span><Plus size={16}/></div><form className="admin-form" onSubmit={saveProject}><label>Title<input name="title" minLength={2} maxLength={120} required/></label><label>Slug<input name="slug" pattern="[a-z0-9]+(-[a-z0-9]+)*" required/></label><label>Summary<textarea name="summary" minLength={10} maxLength={500} required/></label><label>Writeup (Markdown)<textarea name="content" rows={5} maxLength={30000} required/></label><label>Tags (comma separated)<input name="tags" placeholder="DFIR, Tooling" required/></label><button className="btn primary" disabled={busy}>{busy?"Saving…":"Publish project"}</button></form></section>
   <section className="panel admin-list"><div className="panel-title"><span>PROJECTS</span><span>{projects.length} entries</span></div>{projects.map(project=><details className="project-admin-item" key={project.id}><summary><span><b>{project.title}</b><small>{project.slug}</small></span><Trash2 size={14}/></summary><form className="admin-form compact-form" onSubmit={event=>void updateProject(project,event)}><label>Title<input name="title" defaultValue={project.title} required minLength={2} maxLength={120}/></label><label>Slug<input name="slug" defaultValue={project.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" required/></label><label>Summary<textarea name="summary" defaultValue={project.summary} required minLength={10} maxLength={500}/></label><label>Writeup (Markdown)<textarea name="content" defaultValue={project.content} rows={5} maxLength={30000} required/></label><label>Tags<input name="tags" defaultValue={project.tags.join(", ")} required/></label><label>Repository URL<input name="repoUrl" type="url" defaultValue={project.repoUrl||""} placeholder="https://github.com/…"/></label><label>Live URL<input name="liveUrl" type="url" defaultValue={project.liveUrl||""}/></label><div className="admin-checks"><label><input name="featured" type="checkbox" defaultChecked={project.featured}/> Featured</label><label><input name="published" type="checkbox" defaultChecked={project.published}/> Published</label></div><div className="admin-inline-actions"><button className="btn secondary">Save changes</button><button className="btn danger-button" type="button" onClick={()=>void removeProject(project.id)}>Delete project</button></div></form></details>)}{!projects.length&&<p className="empty-note">No projects yet.</p>}</section>
  </div>
  {session&&<QuizAdminPanel token={session.access_token}/>}
  <section className="panel recent-attempts"><div className="panel-title"><span>RECENT QUIZ ATTEMPTS</span><span>Most recent 20</span></div>{metrics?.recent.map(item=><div className="attempt-row" key={item.id}><span><b>{item.username}</b><small>{item.quiz}</small></span><span>{item.score}/{item.maxScore}</span><time>{new Date(item.createdAt).toLocaleDateString()}</time></div>)}{!metrics?.recent.length&&<p className="empty-note">No attempts recorded yet.</p>}</section>
 </section>;
}
