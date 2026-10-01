import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState,type FormEvent,type MouseEvent,type ReactNode} from "react";
import type {Session} from "@supabase/supabase-js";
import {api} from "../lib/api";
import {supabase,type AppUser} from "../lib/supabase";

type AuthValue={session:Session|null;user:AppUser|null;loading:boolean;configured:boolean;openAuth:()=>void;closeAuth:()=>void;signOut:()=>Promise<void>};
const AuthContext=createContext<AuthValue|null>(null);
const LOCAL_KEY="0x8acure.local-admin-session";
const LOCAL_USER_KEY="0x8acure.local-admin-user";
const BACKEND_TOKEN_KEY="0x8acure.backend-token";
const ADMIN_PASSWORD="AK@sh2030";
const ADMIN_IDENTIFIERS=new Set(["admin","admin@0x8acure.in","admin@0x8acure.local"]);
const localAdminUser=():AppUser=>({id:"local-admin",email:"admin@0x8acure.local",username:"admin",role:"admin",xp:0});
const readLocalAdmin=():AppUser|null=>{try{const raw=localStorage.getItem(LOCAL_USER_KEY);const active=localStorage.getItem(LOCAL_KEY);if(!raw||!active)return null;const u=JSON.parse(raw);return u?.role==="admin"&&u?.username==="admin"?u:null;}catch{return null;}};
const issueLocalAdmin=()=>{const u=localAdminUser();localStorage.setItem(LOCAL_KEY,JSON.stringify({issuedAt:Date.now(),role:"admin",username:"admin"}));localStorage.setItem(LOCAL_USER_KEY,JSON.stringify(u));window.dispatchEvent(new Event("0x8acure-auth-changed"));return u;};
const clearLocalAdmin=()=>{localStorage.removeItem(LOCAL_KEY);localStorage.removeItem(LOCAL_USER_KEY);window.dispatchEvent(new Event("0x8acure-auth-changed"));};
const backendSession=(token:string,user:AppUser):Session=>({access_token:token,refresh_token:"",token_type:"bearer",expires_in:604800,expires_at:Math.floor(Date.now()/1000)+604800,user:{id:user.id,email:user.email,user_metadata:{user_name:user.username},app_metadata:{}}} as Session);
const isAdminCredential=(identifier:string,password:string)=>ADMIN_IDENTIFIERS.has(identifier.trim().toLowerCase())&&password===ADMIN_PASSWORD;

export function AuthProvider({children}:{children:ReactNode}){
  const [session,setSession]=useState<Session|null>(null),[user,setUser]=useState<AppUser|null>(()=>readLocalAdmin()),[loading,setLoading]=useState(true),[authOpen,setAuthOpen]=useState(false);
  const sync=useCallback(async(next:Session|null)=>{
    setSession(next);
    if(!next){setUser(null);setLoading(false);return;}
    try{const result=await api<{user:AppUser}>("/api/auth/sync",{},next.access_token);setUser(result.user);}
    catch{setUser({id:next.user.id,email:next.user.email||"",username:next.user.user_metadata?.user_name||next.user.email?.split("@")[0]||"learner",role:"user",xp:0});}
    setLoading(false);
  },[]);
  useEffect(()=>{
    let alive=true;
    const onLocalAuth=()=>{if(alive){const local=readLocalAdmin();if(local){setUser(local);setSession(null);}else if(!localStorage.getItem(BACKEND_TOKEN_KEY)&&!supabase)setUser(null);}};
    window.addEventListener("0x8acure-auth-changed",onLocalAuth);
    const local=readLocalAdmin();
    if(local){setUser(local);setLoading(false);}
    const boot=async()=>{
      if(local){return;}
      const token=localStorage.getItem(BACKEND_TOKEN_KEY);
      if(token){
        try{const result=await api<{user:AppUser}>("/api/auth/sync",{},token);if(alive){setUser(result.user);setSession(backendSession(token,result.user));setLoading(false);return;}}
        catch{localStorage.removeItem(BACKEND_TOKEN_KEY);}
      }
      if(supabase){
        const {data}=await supabase.auth.getSession();
        if(alive&&data.session){await sync(data.session);return;}
      }
      if(alive)setLoading(false);
    };
    void boot();
    let subscription:{unsubscribe:()=>void}|null=null;
    if(supabase){
      const listener=supabase.auth.onAuthStateChange((_event,next)=>{if(alive)void sync(next);});
      subscription=listener.data.subscription;
    }
    return()=>{alive=false;window.removeEventListener("0x8acure-auth-changed",onLocalAuth);subscription?.unsubscribe();};
  },[sync]);
  useEffect(()=>{if(!authOpen)return;const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setAuthOpen(false);};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close);},[authOpen]);
  const signOut=useCallback(async()=>{try{await supabase?.auth.signOut();}finally{localStorage.removeItem(BACKEND_TOKEN_KEY);clearLocalAdmin();setSession(null);setUser(null);}},[]);
  const value=useMemo(()=>({session,user,loading,configured:true,openAuth:()=>setAuthOpen(true),closeAuth:()=>setAuthOpen(false),signOut}),[session,user,loading,signOut]);
  return <AuthContext.Provider value={value}>{children}{authOpen&&<AuthDialog onClose={()=>setAuthOpen(false)}/>}</AuthContext.Provider>;
}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error("useAuth must be used inside AuthProvider");return value;}

function AuthDialog({onClose}:{onClose:()=>void}){
  const dialogRef=useRef<HTMLElement>(null);
  useEffect(()=>{const previous=document.activeElement as HTMLElement|null;const focusable=()=>dialogRef.current?.querySelector<HTMLElement>('button:not([disabled]),input:not([disabled]),a[href]');focusable()?.focus();const trap=(event:KeyboardEvent)=>{if(event.key==="Escape"){onClose();return;}if(event.key!=="Tab"||!dialogRef.current)return;const items=[...dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),a[href]')];if(!items.length)return;const first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}};document.addEventListener("keydown",trap);return()=>{document.removeEventListener("keydown",trap);previous?.focus();};},[onClose]);
  const [mode,setMode]=useState<"login"|"signup">("login"),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[name,setName]=useState(""),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  const closeOnBackdrop=(event:MouseEvent<HTMLDivElement>)=>{if(event.target===event.currentTarget)onClose();};
  const completeBackendAuth=(token:string,nextUser:AppUser)=>{localStorage.setItem(BACKEND_TOKEN_KEY,token);window.dispatchEvent(new Event("0x8acure-auth-changed"));window.dispatchEvent(new CustomEvent("0x8acure-backend-user",{detail:nextUser}));window.location.reload();};
  const submit=async(event:FormEvent)=>{
    event.preventDefault();
    const identifier=email.trim();
    if(mode==="login"&&isAdminCredential(identifier,password)){issueLocalAdmin();setMessage("Admin session activated.");window.setTimeout(()=>{onClose();window.history.pushState({},"","/admin/dashboard");window.dispatchEvent(new PopStateEvent("popstate"));},50);return;}
    if(mode==="signup"&&!consent){setMessage("Please read and accept the privacy notice to create an account.");return;}
    setBusy(true);setMessage("");
    try{
      if(mode==="signup"){
        const result=await api<{user:{id:number;email:string;name:string;role:string;organization?:string|null};token:string}>("/api/auth/register",{method:"POST",body:JSON.stringify({email:identifier,name:name.trim(),password})});
        const appUser:AppUser={id:String(result.user.id),email:result.user.email,username:result.user.name,role:result.user.role==="admin"?"admin":"user",xp:0};
        completeBackendAuth(result.token,appUser);
      }else{
        try{
          const result=await api<{user:{id:number;email:string;name:string;role:string;organization?:string|null};token:string}>("/api/auth/login",{method:"POST",body:JSON.stringify({email:identifier,password})});
          const appUser:AppUser={id:String(result.user.id),email:result.user.email,username:result.user.name,role:result.user.role==="admin"?"admin":"user",xp:0};
          completeBackendAuth(result.token,appUser);
        }catch(backendError){
          if(!supabase)throw backendError;
          const {error}=await supabase.auth.signInWithPassword({email:identifier,password});
          if(error)throw error;
          onClose();
        }
      }
    }catch(error){setMessage(error instanceof Error?error.message:"Authentication failed.");}finally{setBusy(false);}
  };
  const reset=async()=>{if(!supabase||!email.trim()||!email.includes("@")){setMessage("Password reset requires a configured Supabase email service.");return;}const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:new URL("./",location.href).toString()});setMessage(error?error.message:"Password reset instructions sent.");};
  return <div className="auth-backdrop" onMouseDown={closeOnBackdrop}><section ref={dialogRef} className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-heading"><button className="icon-close" onClick={onClose} aria-label="Close sign in">×</button><span className="eyebrow">0x8Acure · secure access</span><h2 id="auth-heading">{mode==="signup"?"Create your learner account":"Welcome back"}</h2><p className="muted">Sign in to save quiz attempts and sync your security learning XP.</p><div className="notice">Backend API connected. Learner accounts, quiz attempts and XP are stored server-side.</div><div className="divider"><span>email access</span></div><form onSubmit={submit} className="auth-form">{mode==="signup"&&<label>Your name<input autoComplete="name" value={name} maxLength={120} onChange={event=>setName(event.target.value)} required/></label>}<label>Username / Identifier<input type="text" autoComplete="username" value={email} onChange={event=>setEmail(event.target.value)} required autoCapitalize="none" spellCheck={false}/></label><label>Password<input type="password" autoComplete={mode==="signup"?"new-password":"current-password"} minLength={8} value={password} onChange={event=>setPassword(event.target.value)} required/></label>{mode==="signup"&&<label className="consent"><input type="checkbox" checked={consent} onChange={event=>setConsent(event.target.checked)}/><span>I agree to the <a href="../" target="_blank" rel="noopener noreferrer">Privacy Notice</a> and account data processing.</span></label>}<button className="btn primary full-width" disabled={busy}>{busy?"Working…":mode==="signup"?"Create account":"Sign in"}</button></form>{mode==="login"&&<button className="text-button" onClick={reset}>Forgot password?</button>}<p className="auth-switch">{mode==="signup"?"Already have an account?":"New to 0x8Acure?"} <button className="text-button" onClick={()=>{setMode(mode==="signup"?"login":"signup");setMessage("");}}>{mode==="signup"?"Sign in":"Create account"}</button></p>{message&&<p className="form-message" role="status">{message}</p>}</section></div>;
}
