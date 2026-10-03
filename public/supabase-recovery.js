(() => {
  const show=client=>{
    if(document.getElementById("password-recovery-modal"))return;
    const d=document.createElement("div");d.id="password-recovery-modal";d.className="auth-modal";
    d.innerHTML='<section class="auth-card" role="dialog" aria-modal="true" aria-labelledby="recovery-title"><div class="eyebrow">0x8Acure · Password reset</div><h2 id="recovery-title">Choose a new password</h2><form id="recovery-form" class="auth-form"><label>New password<input id="recovery-password" type="password" minlength="8" required></label><div id="recovery-error" class="auth-error"></div><button class="btn primary">Update password</button></form></section>';
    document.body.appendChild(d);
    d.querySelector("form").onsubmit=async e=>{e.preventDefault();const err=d.querySelector("#recovery-error");const {error}=await client.auth.updateUser({password:d.querySelector("#recovery-password").value});if(error)err.textContent=error.message;else{d.remove();history.replaceState({},document.title,location.pathname);const t=document.getElementById("toast");if(t){t.textContent="Password updated.";t.classList.add("show")}}};
  };
  window.addEventListener("load",()=>{
    const wait=()=>{const c=window.DPDP_AUTH?.client;if(!c){setTimeout(wait,100);return}c.auth.onAuthStateChange((event)=>{if(event==="PASSWORD_RECOVERY")show(c)});};
    wait();
  });
})();