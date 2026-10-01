import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState,type FormEvent,type MouseEvent,type ReactNode} from "react";
import type {Session} from "@supabase/supabase-js";
import {api} from "../lib/api";
import {supabase,type AppUser} from "../lib/supabase";

type AuthValue={session:Session|null;user:AppUser|null;loading:boolean;configured:boolean;openAuth:()=>void;closeAuth:()=>void;signOut:()=>Promise<void>};
const AuthContext=createContext<AuthValue|null>(null);
export function AuthProvider({children}:{children:ReactNode}){
  const [session,setSession]=useState<Session|null>(null),[user,setUser]=useState<AppUser|null>(null),[loading,setLoading]=useState(true),[authOpen,setAuthOpen]=useState(false);
  const sync=useCallback(async(next:Session|null)=>{
    setSession(next);
    if(!next){setUser(null);setLoading(false);return;}
    try{const result=await api<{user:AppUser}>("/api/auth/sync",{},next.access_token);setUser(result.user);}
    catch{setUser({id:next.user.id,email:next.user.email||"",username:next.user.user_metadata?.user_name||next.user.email?.split("@")[0]||"learner",role:"user",xp:0});}
    setLoading(false);
  },[]);
  useEffect(()=>{
    if(!supabase){setLoading(false);return;}
    let alive=true;
    supabase.auth.getSession().then(({data})=>{if(alive)void sync(data.session);});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>{if(alive)void sync(next);});
    return()=>{alive=false;subscription.unsubscribe();};
  },[sync]);
  useEffect(()=>{if(!authOpen)return;const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setAuthOpen(false);};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close);},[authOpen]);
  const signOut=useCallback(async()=>{await supabase?.auth.signOut();setSession(null);setUser(null);},[]);
  const value=useMemo(()=>({session,user,loading,configured:!!supabase,openAuth:()=>setAuthOpen(true),closeAuth:()=>setAuthOpen(false),signOut}),[session,user,loading,signOut]);
  return <AuthContext.Provider value={value}>{children}{authOpen&&<AuthDialog onClose={()=>setAuthOpen(false)}/>}</AuthContext.Provider>;
}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error("useAuth must be used inside AuthProvider");return value;}

function AuthDialog({onClose}:{onClose:()=>void}){
  const dialogRef=useRef<HTMLElement>(null);
  useEffect(()=>{const previous=document.activeElement as HTMLElement|null;const focusable=()=>dialogRef.current?.querySelector<HTMLElement>('button:not([disabled]),input:not([disabled]),a[href]');focusable()?.focus();const trap=(event:KeyboardEvent)=>{if(event.key==="Escape"){onClose();return;}if(event.key!=="Tab"||!dialogRef.current)return;const items=[...dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),a[href]')];if(!items.length)return;const first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}};document.addEventListener("keydown",trap);return()=>{document.removeEventListener("keydown",trap);previous?.focus();};},[onClose]);
  const [mode,setMode]=useState<"login"|"signup">("login"),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[name,setName]=useState(""),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  const closeOnBackdrop=(event:MouseEvent<HTMLDivElement>)=>{if(event.target===event.currentTarget)onClose();};
  const submit=async(event:FormEvent)=>{
    event.preventDefault();if(!supabase)return;
    if(mode==="signup"&&!consent){setMessage("Please read and accept the privacy notice to create an account.");return;}
    setBusy(true);setMessage("");
    try{
      if(mode==="signup"){
        const {error}=await supabase.auth.signUp({email,password,options:{data:{name:name.trim()},emailRedirectTo:location.href}});if(error)throw error;
        setMessage("Check your inbox to verify your email, then sign in.");
      }else{const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;onClose();}
    }catch(error){setMessage(error instanceof Error?error.message:"Authentication failed.");}finally{setBusy(false);}
  };
  const reset=async()=>{if(!supabase||!email.trim()){setMessage("Enter your email address first.");return;}const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:new URL("./",location.href).toString()});setMessage(error?error.message:"Password reset instructions sent.");};
  return <div className="auth-backdrop" onMouseDown={closeOnBackdrop}><section ref={dialogRef} className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-heading"><button className="icon-close" onClick={onClose} aria-label="Close sign in">×</button><span className="eyebrow">0x8Acure · secure access</span><h2 id="auth-heading">{mode==="signup"?"Create your learner account":"Welcome back"}</h2><p className="muted">Sign in to save quiz attempts and sync your security learning XP.</p>{!supabase?<div className="notice">Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable sign in.</div>:<><div className="divider"><span>or use email</span></div><form onSubmit={submit} className="auth-form">{mode==="signup"&&<label>Your name<input autoComplete="name" value={name} maxLength={120} onChange={event=>setName(event.target.value)} required/></label>}<label>Email<input type="email" autoComplete="email" value={email} onChange={event=>setEmail(event.target.value)} required/></label><label>Password<input type="password" autoComplete={mode==="signup"?"new-password":"current-password"} minLength={8} value={password} onChange={event=>setPassword(event.target.value)} required/></label>{mode==="signup"&&<label className="consent"><input type="checkbox" checked={consent} onChange={event=>setConsent(event.target.checked)}/><span>I agree to the <a href="../" target="_blank" rel="noopener noreferrer">Privacy Notice</a> and account data processing.</span></label>}<button className="btn primary full-width" disabled={busy}>{busy?"Working…":mode==="signup"?"Create account":"Sign in"}</button></form>{mode==="login"&&<button className="text-button" onClick={reset}>Forgot password?</button>}<p className="auth-switch">{mode==="signup"?"Already have an account?":"New to 0x8Acure?"} <button className="text-button" onClick={()=>{setMode(mode==="signup"?"login":"signup");setMessage("");}}>{mode==="signup"?"Sign in":"Create account"}</button></p>{message&&<p className="form-message" role="status">{message}</p>}</>}</section></div>;
}
