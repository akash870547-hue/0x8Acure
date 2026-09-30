(() => {
  const cfg = window.SUPABASE_CONFIG || {};
  const ready = !!(cfg.url && cfg.anonKey && window.supabase);
  const LS = "dpdp-platform-v4";
  const guestKey = "0x8acure-guest-progress";
  let client = null;
  let session = null;

  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&#92;","'":"&#039;"
  }[c]));

  function toast(msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.classList.remove("show"), 2500);
  }

  function injectStyles() {
    if (document.getElementById("auth-styles")) return;
    const s = document.createElement("style");
    s.id = "auth-styles";
    s.textContent = `
      .auth-button{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:10px;padding:8px 11px;font-size:12px;font-weight:700}
      .auth-button:hover{border-color:var(--cyan)}
      .auth-modal{position:fixed;inset:0;z-index:200;display:grid;place-items:center;padding:18px;background:rgba(2,6,12,.78);backdrop-filter:blur(12px)}
      .auth-card{width:min(480px,100%);max-height:calc(100vh - 36px);overflow:auto;border:1px solid var(--line);background:var(--panel);border-radius:18px;padding:24px;box-shadow:var(--shadow)}
      .auth-card h2{margin:0 0 8px}.auth-card p{color:var(--muted);line-height:1.6;font-size:13px}
      .auth-form{display:grid;gap:10px;margin-top:16px}.auth-form label{font-size:12px;color:var(--muted)}
      .auth-form input{width:100%;margin-top:5px;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:10px;padding:11px 12px}
      .auth-form input:focus{outline:3px solid rgba(34,211,238,.35);border-color:var(--cyan)}
      .auth-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.auth-error{color:#fda4af;font-size:12px;min-height:18px}
      .privacy-box{border:1px solid var(--line);border-radius:12px;padding:12px;margin-top:12px;font-size:12px;line-height:1.6;color:var(--muted)}
      .privacy-box a{color:#7dd3fc}.auth-check{display:flex;gap:9px;align-items:flex-start;margin-top:12px;font-size:12px;color:var(--muted)}
      .auth-check input{width:18px;height:18px;flex:0 0 auto;margin-top:1px}
      .account-panel{max-width:760px;margin:24px auto}.account-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      .account-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}
      @media(max-width:640px){.account-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(s);
  }

  function addAuthNav() {
    const actions = document.querySelector(".nav-actions");
    if (!actions || document.getElementById("auth-nav")) return;
    const b = document.createElement("button");
    b.id = "auth-nav";
    b.className = "auth-button";
    b.type = "button";
    b.addEventListener("click", () => session ? accountView() : openAuth("login"));
    actions.prepend(b);
    updateNav();
  }

  function updateNav() {
    const b = document.getElementById("auth-nav");
    if (!b) return;
    b.textContent = session ? "Account" : "Sign in";
    b.setAttribute("aria-label", session ? "Open account" : "Sign in");
  }

  function openAuth(mode="login") {
    if (!ready) {
      toast("Supabase is not configured. Add the public URL and publishable key in supabase-config.js.");
      return;
    }
    closeAuth();
    const modal = document.createElement("div");
    modal.className = "auth-modal";
    modal.id = "auth-modal";
    modal.innerHTML = `
      <section class="auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button class="btn ghost" id="auth-close" style="float:right">Close</button>
        <div class="eyebrow">0x8Acure · Account</div>
        <h2 id="auth-title">${mode==="signup"?"Create account":"Welcome back"}</h2>
        <p>${mode==="signup"?"Save your learning progress across devices. We only require your name and email for the platform account.":"Sign in to sync your learning progress securely."}</p>
        <form class="auth-form" id="auth-form">
          ${mode==="signup"?'<label>Name<input id="auth-name" autocomplete="name" required maxlength="120"></label>':""}
          <label>Email<input id="auth-email" type="email" autocomplete="email" required></label>
          <label>Password<input id="auth-password" type="password" autocomplete="${mode==="signup"?"new-password":"current-password"}" minlength="8" required></label>
          ${mode==="signup"?'<label class="auth-check"><input id="auth-consent" type="checkbox" required><span>I have read the <a href="#" id="privacy-link">Privacy Notice</a> and explicitly consent to the processing described there.</span></label>':""}
          <div class="auth-error" id="auth-error" aria-live="polite"></div>
          <button class="btn primary" type="submit">${mode==="signup"?"Create account":"Sign in"}</button>
        </form>
        <div class="auth-row">
          <button class="btn ghost" id="google-auth" type="button">Continue with Google</button>
          ${mode==="login"?'<button class="btn ghost" id="reset-auth" type="button">Forgot password?</button>':""}
          <button class="btn ghost" id="switch-auth" type="button">${mode==="signup"?"I already have an account":"Create an account"}</button>
        </div>
        <div class="privacy-box"><b>Privacy Notice</b><br>We collect your name and email to create and secure your account, provide learning progress, issue or verify certificates where applicable, and respond to account requests. Guest learning progress stays in your browser until you choose to merge it. You can download your account data or delete your account from Account. We do not require an organization, phone number, profile photo, or other optional identity data.</div>
      </section>`;
    document.body.appendChild(modal);
    document.getElementById("auth-close").onclick = closeAuth;
    document.getElementById("switch-auth").onclick = () => openAuth(mode==="signup"?"login":"signup");
    document.getElementById("google-auth").onclick = googleLogin;
    const reset = document.getElementById("reset-auth");
    if (reset) reset.onclick = resetPassword;
    const privacy = document.getElementById("privacy-link");
    if (privacy) privacy.onclick = e => {e.preventDefault(); closeAuth(); privacyView();};
    document.getElementById("auth-form").onsubmit = e => submitAuth(e, mode);
    document.getElementById("auth-email").focus();
  }

  function closeAuth(){document.getElementById("auth-modal")?.remove();}

  async function submitAuth(e, mode) {
    e.preventDefault();
    const errEl = document.getElementById("auth-error");
    errEl.textContent = "";
    try {
      if (mode==="signup") {
        if (!document.getElementById("auth-consent").checked) throw new Error("Explicit consent is required.");
        const name = document.getElementById("auth-name").value.trim();
        const email = document.getElementById("auth-email").value.trim().toLowerCase();
        const password = document.getElementById("auth-password").value;
        const {data,error} = await client.auth.signUp({
          email,password,
          options:{data:{name,privacy_version:"2026-09-30",consent_at:new Date().toISOString()}}
        });
        if(error) throw error;
        if(data.session) {
          await finishUser(data.user,name,true);
          closeAuth();
        } else {
          closeAuth();
          toast("Account created. Check your email to verify your address before signing in.");
        }
      } else {
        const email=document.getElementById("auth-email").value.trim().toLowerCase();
        const password=document.getElementById("auth-password").value;
        const {data,error}=await client.auth.signInWithPassword({email,password});
        if(error) throw error;
        await finishUser(data.user);
        closeAuth();
      }
    } catch(e) { errEl.textContent=e.message || "Authentication failed."; }
  }

  async function googleLogin() {
    try {
      const {error}=await client.auth.signInWithOAuth({
        provider:"google",
        options:{redirectTo:location.href}
      });
      if(error) throw error;
    } catch(e) { const el=document.getElementById("auth-error"); if(el) el.textContent=e.message; else toast(e.message); }
  }

  async function resetPassword() {
    const email=document.getElementById("auth-email")?.value.trim().toLowerCase();
    if(!email) { document.getElementById("auth-error").textContent="Enter your email first."; return; }
    try {
      const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.href.split("#")[0]});
      if(error) throw error;
      closeAuth(); toast("If that email has an account, a password reset message will be sent.");
    } catch(e) { document.getElementById("auth-error").textContent=e.message; }
  }

  async function finishUser(user, suppliedName="", mergeGuest=false) {
    if(!user) return;
    if(!user.email_confirmed_at && user.app_metadata?.provider !== "google") {
      toast("Please verify your email before using the account.");
      return;
    }
    const name = suppliedName || user.user_metadata?.name || user.email.split("@")[0];
    const consentAt = user.user_metadata?.consent_at || new Date().toISOString();
    const {error} = await client.from("profiles").upsert({
      id:user.id,name,email:user.email,consent_at:consentAt,privacy_version:"2026-09-30"
    },{onConflict:"id"});
    if(error) throw error;
    session = (await client.auth.getSession()).data.session;
    updateNav();
    if(mergeGuest) await mergeGuestData(user.id);
    await loadRemoteProgress(user.id);
  }

  async function mergeGuestData(userId) {
    const raw=localStorage.getItem(guestKey) || localStorage.getItem(LS);
    if(!raw) return;
    let guest; try { guest=JSON.parse(raw); } catch { return; }
    const completed=guest.completed || {};
    const rows=Object.entries(completed).map(([room_id,completed])=>({user_id:userId,room_id,completed:!!completed,xp:0,attempts:0}));
    if(rows.length) await client.from("room_progress").upsert(rows,{onConflict:"user_id,room_id"});
    const badgeNames = [];
    const n=Object.keys(completed).length;
    if(n>=1) badgeNames.push("first-room");
    if(n>=5) badgeNames.push("five-rooms");
    if(Number(guest.xp||0)>=100) badgeNames.push("100-xp");
    if(n>=10) badgeNames.push("path-runner");
    if(badgeNames.length) await client.from("badges_earned").upsert(
      badgeNames.map(badge_id=>({user_id:userId,badge_id})),{onConflict:"user_id,badge_id"}
    );
    localStorage.removeItem(guestKey);
  }

  async function loadRemoteProgress(userId) {
    const {data,error}=await client.from("room_progress").select("room_id,completed,xp").eq("user_id",userId);
    if(error) return;
    const state=JSON.parse(localStorage.getItem(LS)||"{}");
    state.completed=state.completed||{};
    for(const row of data||[]) if(row.completed) state.completed[row.room_id]=true;
    localStorage.setItem(LS,JSON.stringify(state));
    if(typeof window.render0x8Acure==="function") window.render0x8Acure();
  }

  async function syncLocalProgress() {
    if(!session) return;
    const state=JSON.parse(localStorage.getItem(LS)||"{}");
    const rows=Object.entries(state.completed||{}).map(([room_id,completed])=>({
      user_id:session.user.id,room_id,completed:!!completed,xp:0,attempts:0
    }));
    if(rows.length) await client.from("room_progress").upsert(rows,{onConflict:"user_id,room_id"});
  }

  function privacyView() {
    const app=document.getElementById("app");
    app.innerHTML=`
      <section class="panel account-panel">
        <div class="eyebrow">0x8Acure · Privacy</div>
        <h1>Privacy Notice</h1>
        <p>This platform collects the minimum account data needed to provide authenticated learning: your name and email address. Authentication also creates technical account/session records through Supabase.</p>
        <h3>Purposes</h3><p>Account creation and security, learning progress synchronization, badges, and certificate administration or verification where applicable.</p>
        <h3>Your choices</h3><p>Account creation requires an explicit, unticked consent checkbox. You can use guest mode without creating an account. You can download your account data or request account deletion from Account. You may also contact the platform operator using the published grievance/contact channel.</p>
        <h3>Data minimisation</h3><p>We do not require an organization, phone number, profile photo, advertising identifier, or other optional profile data.</p>
        <h3>Security</h3><p>Authenticated application data is protected with Supabase Row Level Security. Browser code contains only the Supabase publishable/anon key. Secret/service keys remain server-side.</p>
        <h3>Legal note</h3><p>This notice is written for this learning platform and is not legal advice. It should be reviewed against the platform's actual processing, applicable commencement provisions, and current DPDP requirements before production use.</p>
        <div class="auth-row"><button class="btn primary" data-action="home">Back to learning</button></div>
      </section>`;
  }

  async function accountView() {
    if(!session){openAuth("login");return;}
    const {data}=await client.from("profiles").select("name,email,consent_at,privacy_version,leaderboard_opt_in,created_at").eq("id",session.user.id).single();
    const p=data||{name:session.user.user_metadata?.name||"",email:session.user.email};
    document.getElementById("app").innerHTML=`
      <section class="panel account-panel">
        <div class="eyebrow">0x8Acure · Account</div><h1>My account</h1>
        <div class="account-grid"><div class="panel"><b>Name</b><p>${esc(p.name)}</p></div><div class="panel"><b>Email</b><p>${esc(p.email)}</p></div></div>
        <div class="privacy-box"><b>Consent recorded</b><br>${esc(p.consent_at||"")}. Privacy notice version: ${esc(p.privacy_version||"")}. Guest progress is merged into this account when available.</div>
        <div class="account-actions">
          <button class="btn primary" id="download-data">Download my data</button>
          <button class="btn ghost" id="privacy-account">Privacy Notice</button>
          <button class="btn ghost" id="signout-account">Sign out</button>
          <button class="btn" id="delete-account" style="border-color:#6b2434;color:#fda4af">Delete my account</button>
        </div>
      </section>`;
    document.getElementById("download-data").onclick=downloadData;
    document.getElementById("privacy-account").onclick=privacyView;
    document.getElementById("signout-account").onclick=async()=>{await client.auth.signOut();session=null;updateNav();location.hash="";location.reload();};
    document.getElementById("delete-account").onclick=deleteAccount;
  }

  async function downloadData() {
    const tables=["profiles","room_progress","task_submissions","badges_earned"];
    const out={exported_at:new Date().toISOString(),user_id:session.user.id};
    for(const table of tables){
      const {data,error}=await client.from(table).select("*").eq(table==="profiles"?"id":"user_id",session.user.id);
      if(error) throw error;
      out[table]=data||[];
    }
    const {data:certs}=await client.from("certificates").select("*").eq("user_id",session.user.id);
    out.certificates=certs||[];
    const blob=new Blob([JSON.stringify(out,null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="0x8acure-my-data.json";a.click();URL.revokeObjectURL(a.href);
  }

  async function deleteAccount() {
    if(!confirm("Delete your 0x8Acure account and associated platform data? This cannot be undone.")) return;
    try {
      const {error}=await client.functions.invoke("delete-account",{body:{}});
      if(error) throw error;
      await client.auth.signOut();
      session=null; localStorage.removeItem(LS); localStorage.removeItem(guestKey);
      toast("Account deleted.");
      setTimeout(()=>location.reload(),400);
    } catch(e){toast(e.message||"Account deletion failed.");}
  }

  async function init() {
    injectStyles();
    addAuthNav();
    if(!ready){
      window.DPDP_AUTH={configured:false,openAuth,privacyView};
      return;
    }
    client=window.supabase.createClient(cfg.url,cfg.anonKey,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
    });
    window.DPDP_AUTH={configured:true,client,openAuth,accountView,privacyView,syncLocalProgress};
    const {data}=await client.auth.getSession();
    session=data.session;
    updateNav();
    client.auth.onAuthStateChange(async(_event,newSession)=>{
      session=newSession; updateNav();
      if(newSession) {
        try { await finishUser(newSession.user); } catch(e) { toast(e.message); }
      }
    });
  }

  document.addEventListener("click",e=>{
    if(e.target.closest("#privacy-notice-link")) {e.preventDefault();privacyView();}
  });

  window.addEventListener("0x8acure:progress-changed",()=>syncLocalProgress().catch(()=>{}));
  window.addEventListener("load",init);
})();