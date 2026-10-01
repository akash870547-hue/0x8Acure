(() => {
  const cfg=window.SUPABASE_CONFIG||{};
  const LS="dpdp-platform-v4", GUEST="0x8acure-guest-progress";
  let sb=null, session=null, profile=null, initialized=false;
  const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;");
  const toast=m=>{const e=document.getElementById("toast");if(!e)return;e.textContent=m;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("show"),2400)};
  const configured=!!(cfg.url&&cfg.anonKey&&window.supabase);
  const isAdmin=()=>String(profile?.role||"").toLowerCase()==="admin";
  const basePath=()=>location.hostname.endsWith("github.io")?"/0x8Acure":"";
  const route=p=>basePath()+p;
  const go=p=>{history.pushState({},document.title,route(p));handleRoute()};
  const loginIdentity=v=>{const x=String(v||"").trim();return x.toLowerCase()==="admin"?"admin@0x8acure.local":x.toLowerCase()};

  function css(){
    if(document.getElementById("auth-css"))return;
    const s=document.createElement("style");s.id="auth-css";s.textContent=String.raw\`
      .auth-page{min-height:calc(100vh - 150px);display:grid;place-items:center;padding:36px 0 70px}
      .auth-page-card{width:min(900px,100%);display:grid;grid-template-columns:.82fr 1.18fr;overflow:hidden;border:1px solid rgba(0,229,255,.22);border-radius:24px;background:rgba(10,15,24,.94);box-shadow:0 28px 90px rgba(0,0,0,.42)}
      .auth-visual{position:relative;padding:38px;background:radial-gradient(circle at 80% 15%,rgba(0,255,157,.15),transparent 35%),linear-gradient(150deg,#09131a,#0b1321 55%,#101329);border-right:1px solid rgba(0,229,255,.14)}
      .auth-visual:after{content:"";position:absolute;width:260px;height:260px;right:-150px;top:90px;border:1px solid rgba(0,255,157,.16);border-radius:50%;box-shadow:0 0 0 28px rgba(0,255,157,.025),0 0 0 58px rgba(0,229,255,.018)}
      .auth-brand{font:700 11px 'JetBrains Mono',monospace;letter-spacing:.12em;color:#9efbe2;text-transform:uppercase}
      .auth-visual h1{position:relative;z-index:1;margin:115px 0 12px;font-size:42px;line-height:1.02;letter-spacing:-.045em;color:#f4fbff}
      .auth-visual p{position:relative;z-index:1;max-width:310px;color:#94a8b9;line-height:1.75;font-size:13px}
      .auth-points{position:relative;z-index:1;display:grid;gap:10px;margin-top:26px;color:#b9cad5;font-size:11px}
      .auth-point{display:flex;gap:9px;align-items:center}.auth-point i{display:grid;place-items:center;width:24px;height:24px;border:1px solid rgba(0,255,157,.25);border-radius:7px;color:#00ff9d;font-style:normal;font:700 9px 'JetBrains Mono',monospace}
      .auth-main{padding:34px 40px}.auth-tabs{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;border:1px solid var(--line);border-radius:12px;background:var(--panel2);margin:20px 0}
      .auth-tab{border:0;border-radius:9px;background:transparent;color:var(--muted);padding:10px;font-size:12px;font-weight:750;cursor:pointer}.auth-tab.active{background:var(--panel);color:var(--text);box-shadow:0 5px 18px rgba(0,0,0,.16)}
      .auth-main h2{margin:0 0 6px;font-size:28px;letter-spacing:-.035em}.auth-main>p{margin:0;color:var(--muted);font-size:13px;line-height:1.6}
      .auth-form{display:grid;gap:12px;margin-top:20px}.auth-form label{display:grid;gap:5px;color:var(--text);font-size:11px;font-weight:700}
      .auth-form input{width:100%;height:44px;border:1px solid var(--line);border-radius:10px;background:var(--panel2);color:var(--text);padding:0 12px;outline:none}.auth-form input:focus{border-color:#00e5ff;box-shadow:0 0 0 3px rgba(0,229,255,.09)}
      .auth-check{display:flex!important;gap:8px!important;align-items:center;color:var(--muted)!important;font-weight:500!important}.auth-check input{width:17px;height:17px}
      .auth-submit{width:100%;height:46px!important;margin-top:3px;background:linear-gradient(110deg,#00ff9d,#00e5ff)!important;color:#03120f!important;border:0!important}
      .auth-error{min-height:18px;color:#fda4af;font-size:11px;line-height:1.5}.auth-success{padding:10px 12px;border:1px solid rgba(0,255,157,.25);border-radius:10px;background:rgba(0,255,157,.06);color:#8fffd1;font-size:11px;line-height:1.5}
      .auth-footer-row{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-top:12px}.auth-link{border:0;background:none;color:#67e8f9;font-size:11px;cursor:pointer;padding:4px}
      .unauthorized-banner{margin-bottom:14px;padding:11px 13px;border:1px solid rgba(251,113,133,.4);background:rgba(251,113,133,.08);color:#fecdd3;border-radius:10px;font-size:12px}
      @media(max-width:760px){.auth-page{padding:20px 0 50px}.auth-page-card{grid-template-columns:1fr}.auth-visual{padding:24px;border-right:0;border-bottom:1px solid rgba(0,229,255,.14)}.auth-visual h1{margin:42px 0 8px;font-size:30px}.auth-visual p{font-size:12px}.auth-points{grid-template-columns:1fr 1fr}.auth-main{padding:26px 22px}}
      @media(max-width:440px){.auth-points{grid-template-columns:1fr}.auth-main{padding:23px 17px}}
    \`;document.head.appendChild(s);
  }
  function nav(){const a=document.querySelector(".nav-actions");if(!a)return;let b=document.getElementById("auth-nav");if(!b){b=document.createElement("button");b.id="auth-nav";a.prepend(b)}b.className="auth-button";b.type="button";b.onclick=()=>session?account():go("/login");updateNav()}
  function updateNav(){const b=document.getElementById("auth-nav"),a=document.querySelector(".nav-actions");if(b){b.textContent=session?"Account":"Sign in";b.setAttribute("aria-label",session?"Open account":"Sign in")}document.getElementById("admin-nav")?.remove();if(a&&isAdmin()){const x=document.createElement("button");x.id="admin-nav";x.className="auth-button";x.textContent="Admin";x.onclick=()=>go("/admin/dashboard");a.prepend(x)}}
  async function resolveEmail(login){const value=loginIdentity(login);if(value.includes("@"))return value;if(!sb)throw Error("Authentication service is not ready.");const {data,error}=await sb.rpc("resolve_login_email",{p_login:value});if(error)throw Error("Username login requires the admin-console migration.");if(!data)throw Error("Invalid username or password.");return data}

  function renderLoginPage(message=""){
    css();document.getElementById("academy-footer")?.style.setProperty("display","none");
    const signup=location.hash==="#signup";
    document.getElementById("app").innerHTML=String.raw\`
      <section class="auth-page"><div class="auth-page-card"><aside class="auth-visual"><div class="auth-brand">0x8Acure · Secure Access</div><h1>Learn. Practice. Prove.</h1><p>Private learning, practical security scenarios, and verifiable progress in one focused workspace.</p><div class="auth-points"><div class="auth-point"><i>01</i>Scenario-led training</div><div class="auth-point"><i>02</i>Progress sync</div><div class="auth-point"><i>03</i>Verifiable credentials</div></div></aside>
      <section class="auth-main">\${message?'<div class="unauthorized-banner">'+esc(message)+'</div>':""}<div class="eyebrow">0x8Acure Authentication</div><h2>\${signup?"Create your account":"Welcome back"}</h2><p>\${signup?"Create a learner account to sync your progress.":"Sign in with your username or email."}</p>
      <div class="auth-tabs" role="tablist"><button class="auth-tab \${!signup?"active":""}" data-auth-tab="login" role="tab">Existing User Login</button><button class="auth-tab \${signup?"active":""}" data-auth-tab="signup" role="tab">Create Account</button></div>
      <form id="login-form" class="auth-form">\${signup?'<label>Username<input id="auth-username" autocomplete="username" maxlength="40" pattern="[A-Za-z0-9._-]{3,40}" required placeholder="your_username"></label>':""}
      <label>\${signup?"Email":"Username / Email"}<input id="auth-email" type="\${signup?"email":"text"}" autocomplete="\${signup?"email":"username"}" required placeholder="\${signup?"you@example.com":"admin or you@example.com"}"></label>
      <label>Password<input id="auth-password" type="password" minlength="8" autocomplete="\${signup?"new-password":"current-password"}" required placeholder="••••••••"></label>
      \${signup?'<label>Confirm Password<input id="auth-confirm" type="password" minlength="8" autocomplete="new-password" required placeholder="Repeat your password"></label>':'<label class="auth-check"><input id="remember-me" type="checkbox" checked><span>Remember Me</span></label>'}
      <div id="auth-error" class="auth-error" aria-live="polite"></div><button class="btn primary auth-submit" type="submit">\${signup?"Create Account":"Login"}</button></form>
      <div class="auth-footer-row">\${signup?'<button class="auth-link" id="to-login" type="button">Already have an account? Login</button>':'<button class="auth-link" id="forgot-password" type="button">Forgot password?</button><button class="auth-link" id="to-signup" type="button">Create an account</button>'}</div>
      </section></div></section>\`;
    document.querySelectorAll("[data-auth-tab]").forEach(b=>b.onclick=()=>{location.hash=b.dataset.authTab==="signup"?"signup":"";renderLoginPage(message)});
    document.getElementById("to-login")?.addEventListener("click",()=>{location.hash="";renderLoginPage()});
    document.getElementById("to-signup")?.addEventListener("click",()=>{location.hash="signup";renderLoginPage()});
    document.getElementById("forgot-password")?.addEventListener("click",forgotPassword);
    document.getElementById("login-form").onsubmit=e=>submit(e,signup?"signup":"login");
  }
  async function submit(e,mode){
    e.preventDefault();const er=document.getElementById("auth-error");er.textContent="";
    try{
      if(mode==="signup"){
        const username=document.getElementById("auth-username").value.trim().toLowerCase(),email=document.getElementById("auth-email").value.trim().toLowerCase(),password=document.getElementById("auth-password").value,confirm=document.getElementById("auth-confirm").value;
        if(password!==confirm)throw Error("Passwords do not match.");if(!/^[a-z0-9._-]{3,40}$/.test(username))throw Error("Username must be 3-40 characters: letters, numbers, dot, underscore or hyphen.");
        const consentAt=new Date().toISOString();const {data,error}=await sb.auth.signUp({email,password,options:{data:{username,name:username,consent_at:consentAt,privacy_version:"2026-09-30"},emailRedirectTo:route("/login")}});if(error)throw error;
        if(data.session){localStorage.setItem("0x8acure-session-start",String(Date.now()));await finish(data.user,username,consentAt);location.href=route(isAdmin()?"/admin/dashboard":"/dashboard")}else{location.hash="";renderLoginPage();document.getElementById("auth-error").innerHTML='<span class="auth-success">Account created. Verify your email, then log in.</span>'}
      }else{
        const email=await resolveEmail(document.getElementById("auth-email").value),remember=document.getElementById("remember-me")?.checked!==false;
        localStorage.setItem("0x8acure-remember",remember?"1":"0");
        sb=window.supabase.createClient(cfg.url,cfg.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:remember?localStorage:sessionStorage}});window.DPDP_AUTH.client=sb;
        const {data,error}=await sb.auth.signInWithPassword({email,password:document.getElementById("auth-password").value});if(error)throw error;
        localStorage.setItem("0x8acure-session-start",String(Date.now()));
        await finish(data.user);location.href=route(isAdmin()?"/admin/dashboard":"/dashboard");
      }
    }catch(x){er.textContent=x.message||"Authentication failed."}
  }
  async function forgotPassword(){const er=document.getElementById("auth-error");er.textContent="";try{const email=await resolveEmail(document.getElementById("auth-email")?.value),{error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:route("/login")});if(error)throw error;er.innerHTML='<span class="auth-success">If the account exists, a password reset email will be sent.</span>'}catch(x){er.textContent=x.message||"Could not start password reset."}}
  async function finish(user,suppliedUsername="",consentAt=""){
    if(!user)throw Error("No authenticated user.");if(!user.email_confirmed_at)throw Error("Please verify your email before using the account.");
    const q=await sb.from("profiles").select("id,name,email,username,role,account_status,session_revoked_at,consent_at,privacy_version").eq("id",user.id).maybeSingle();if(q.error)throw q.error;
    if(!q.data){const c=consentAt||user.user_metadata?.consent_at;if(!c)throw Error("Account profile is missing required consent.");const username=suppliedUsername||user.user_metadata?.username||user.email.split("@")[0];const {error}=await sb.from("profiles").insert({id:user.id,name:user.user_metadata?.name||username,email:user.email,username,role:"learner",consent_at:c,privacy_version:"2026-09-30"});if(error)throw error}
    const p=await sb.from("profiles").select("id,name,email,username,role,account_status,consent_at,privacy_version").eq("id",user.id).single();if(p.error)throw p.error;profile=p.data;if(profile.account_status!=="active")throw Error("This account is not active.");const started=Number(localStorage.getItem("0x8acure-session-start")||Date.now());if(profile.session_revoked_at&&new Date(profile.session_revoked_at).getTime()>started){await sb.auth.signOut();localStorage.removeItem("0x8acure-session-start");throw Error("This session was revoked by an administrator.");}
    session=(await sb.auth.getSession()).data.session;window.DPDP_AUTH.role=String(profile.role||"learner").toLowerCase();window.DPDP_AUTH.isAdmin=isAdmin();updateNav();await load(user.id);
    try{await sb.rpc("admin_log_activity",{p_user_id:user.id,p_action:"Logged In",p_status:"success",p_metadata:{client:"web"}})}catch{}
  }
  async function load(uid){const {data}=await sb.from("room_progress").select("room_id,completed,xp").eq("user_id",uid);if(!data)return;const s=JSON.parse(localStorage.getItem(LS)||"{}");s.completed=s.completed||{};for(const x of data)if(x.completed)s.completed[x.room_id]=true;localStorage.setItem(LS,JSON.stringify(s))}
  async function account(){if(!session){go("/login");return}const {data}=await sb.from("profiles").select("name,email,username,role,account_status").eq("id",session.user.id).single();document.getElementById("app").innerHTML='<section class="panel account-panel"><div class="eyebrow">0x8Acure · Account</div><h1>My account</h1><div class="account-grid"><div class="panel"><b>Name</b><p>'+esc(data?.name)+'</p></div><div class="panel"><b>Username</b><p>'+esc(data?.username)+'</p></div><div class="panel"><b>Email</b><p>'+esc(data?.email)+'</p></div><div class="panel"><b>Role</b><p>'+esc(data?.role)+'</p></div></div><div class="account-actions"><button class="btn primary" id="signout-account">Sign out</button></div></section>';document.getElementById("signout-account").onclick=async()=>{await sb.auth.signOut();localStorage.removeItem("0x8acure-session-start");location.href=route("/login")}}
  async function handleRoute(){
    if(!initialized)return;const p=location.pathname.replace(/\/$/,"")||"/";
    if(p==="/login"||p===basePath()+"/login"){if(session){go(isAdmin()?"/admin/dashboard":"/dashboard")}else renderLoginPage();return}
    if(p==="/admin/dashboard"||p===basePath()+"/admin/dashboard"){if(!session){renderLoginPage("Unauthorized access. Please sign in with an administrator account.");return}if(!isAdmin()){renderLoginPage("Unauthorized access. Administrator privileges are required.");return}window.DPDP_ADMIN?.open(new URLSearchParams(location.search).get("tab")||"telemetry");return}
  }
  async function init(){
    css();nav();if(!configured){window.DPDP_AUTH={configured:false,open:()=>go("/login"),role:"learner",isAdmin:false};initialized=true;handleRoute();return}
    const remember=localStorage.getItem("0x8acure-remember")!=="0";sb=window.supabase.createClient(cfg.url,cfg.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:remember?localStorage:sessionStorage}});
    window.DPDP_AUTH={configured:true,client:sb,open:()=>go("/login"),account,role:"learner",isAdmin:false};
    const {data}=await sb.auth.getSession();session=data.session;if(session){try{await finish(session.user)}catch(x){await sb.auth.signOut();toast(x.message)}}
    initialized=true;updateNav();handleRoute();sb.auth.onAuthStateChange(async(e,s)=>{session=s;updateNav();if(!s){profile=null;window.DPDP_AUTH.isAdmin=false;return}if(e!=="INITIAL_SESSION"){try{await finish(s.user)}catch(x){toast(x.message)}}handleRoute()});
    window.addEventListener("popstate",handleRoute);
  }
  window.addEventListener("load",init);
  window.addEventListener("0x8acure:progress-changed",()=>{if(session)load(session.user.id)});
})();