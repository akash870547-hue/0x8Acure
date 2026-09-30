(() => {
  let lastBadgeIds=new Set();

  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;"," >":"&gt;","\"":"&quot;","'":"&#039;"}[c]));

  function style(){
    if(document.getElementById("badge-ui-css"))return;
    const s=document.createElement("style");s.id="badge-ui-css";s.textContent=`
.badge-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.badge-card{border:1px solid var(--line);background:var(--panel);border-radius:16px;padding:18px;box-shadow:var(--shadow)}.badge-art{width:112px;height:112px;display:block;margin:0 auto 12px}.badge-card h3{margin:6px 0;font-size:16px}.badge-card p{color:var(--muted);font-size:12px;line-height:1.6}.badge-earned{border-color:#236047;box-shadow:0 0 0 1px rgba(52,211,153,.12),var(--shadow)}.badge-date{font-size:10px;color:var(--muted)}.badge-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.badge-popup{position:fixed;inset:0;z-index:240;display:grid;place-items:center;pointer-events:none}.badge-popup-card{width:min(390px,calc(100% - 32px));padding:24px;text-align:center;border:1px solid #2d5870;border-radius:20px;background:linear-gradient(180deg,#111d2d,#0a111c);box-shadow:0 30px 100px rgba(0,0,0,.55);animation:badgePop .5s cubic-bezier(.2,.9,.2,1) both}.badge-popup-card img{width:150px;height:150px;animation:badgeSpin .65s ease both}.badge-popup-card h2{margin:8px 0}.badge-popup-card p{color:var(--muted);font-size:12px}@keyframes badgePop{from{opacity:0;transform:translateY(24px) scale(.82)}to{opacity:1;transform:none}}@keyframes badgeSpin{from{transform:rotate(-12deg) scale(.6)}to{transform:none}}@media(max-width:800px){.badge-grid{grid-template-columns:1fr 1fr}}@media(max-width:520px){.badge-grid{grid-template-columns:1fr}}
`;document.head.appendChild(s);
  }
  function client(){return window.DPDP_AUTH?.configured?window.DPDP_AUTH.client:null}
  async function getBadges(){const c=client();if(!c)return[];const [{data:earned},{data:catalog}]=await Promise.all([
    c.from("badges_earned").select("badge_id,earned_at").order("earned_at",{ascending:false}),
    c.from("badge_catalog").select("id,name,criteria,category,artwork_svg")
  ]);const map=new Map((catalog||[]).map(x=>[x.id,x]));return (earned||[]).map(x=>({...map.get(x.badge_id),badge_id:x.badge_id,earned_at:x.earned_at})).filter(x=>x.name)}
  async function evaluate(){const c=client();if(!c)return[];const {data,error}=await c.rpc("evaluate_badges",{p_user:(await c.auth.getUser()).data.user?.id});if(error)throw error;return data||[]}
  function showPopup(b){style();document.getElementById("badge-popup")?.remove();const d=document.createElement("div");d.id="badge-popup";d.className="badge-popup";d.innerHTML=`<div class="badge-popup-card" role="status" aria-live="polite"><div class="eyebrow">BADGE UNLOCKED</div><img alt="" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(b.artwork_svg)}"><h2>${esc(b.name)}</h2><p>${esc(b.criteria)}</p></div>`;document.body.appendChild(d);setTimeout(()=>d.remove(),2800)}
  async function checkNewBadges(){if(!client())return[];const before=new Set(lastBadgeIds);await evaluate();const now=await getBadges();lastBadgeIds=new Set(now.map(x=>x.badge_id));for(const b of now)if(!before.has(b.badge_id))showPopup(b);return now}
  async function submitTask(taskId,answer){const c=client();if(!c)return null;const {data,error}=await c.rpc("submit_task",{p_task_id:taskId,p_answer:answer});if(error)throw error;await checkNewBadges();return data}
  async function useHint(taskId){const c=client();if(!c)return false;const {data,error}=await c.rpc("use_hint",{p_task_id:taskId});if(error)throw error;return data}
  async function completeRoom(roomId){const c=client();if(!c)return null;const {data,error}=await c.rpc("complete_room",{p_room_id:roomId});if(error)throw error;await checkNewBadges();return data}
  function shareSvg(b){const blob=new Blob([b.artwork_svg],{type:"image/svg+xml"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="0x8acure-${b.badge_id}.svg";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  async function page(){
    style();const c=client();if(!c){document.getElementById("app").innerHTML='<section class="panel"><h2>Badges</h2><p class="muted">Sign in to earn and sync server-validated badges. Guest learning remains local.</p><button class="btn primary" data-action="home">Back to learning</button></section>';return}
    const badges=await getBadges();lastBadgeIds=new Set(badges.map(x=>x.badge_id));
    const {data:catalog}=await c.from("badge_catalog").select("id,name,criteria,category,artwork_svg").order("category").order("name");
    const earned=new Map(badges.map(x=>[x.badge_id,x]));
    document.getElementById("app").innerHTML='<div class="section-head"><div><h2>Badges</h2><p>Earned badges are evaluated and stored server-side. Duplicate awards are ignored.</p></div><button class="btn ghost" data-action="progress">Progress</button></div><div class="badge-grid">'+(catalog||[]).map(b=>{const e=earned.get(b.id);return '<article class="badge-card '+(e?'badge-earned':'')+'"><img class="badge-art" alt="" src="data:image/svg+xml;charset=utf-8,'+encodeURIComponent(b.artwork_svg)+'"><span class="badge">'+esc(b.category)+'</span><h3>'+esc(b.name)+'</h3><p>'+esc(b.criteria)+'</p>'+(e?'<div class="badge-date">Earned '+new Date(e.earned_at).toLocaleDateString()+'</div><div class="badge-actions"><button class="btn ghost" data-badge-download="'+esc(b.id)+'">Download share image</button></div>':'<div class="badge-date">Not yet earned</div>')+'</article>'}).join('')+'</div>';
    window._badgeCatalog=Object.fromEntries((catalog||[]).map(x=>[x.id,x]));
  }
  async function init(){style();if(window.DPDP_AUTH?.configured){try{lastBadgeIds=new Set((await getBadges()).map(x=>x.badge_id))}catch{}}}
  document.addEventListener("click",e=>{
    const b=e.target.closest("[data-badge-download]");if(b){const x=window._badgeCatalog?.[b.dataset.badgeDownload];if(x)shareSvg(x)}
    if(e.target.closest('[data-action="badges"]'))page().catch(()=>toastMsg("Could not load badges."));
  });
  window.DPDP_BADGES={page,submitTask,useHint,completeRoom,checkNewBadges,getBadges};
  window.addEventListener("load",init);
})();