(() => {
  const LS="dpdp-platform-v4";
  const originalSet=localStorage.setItem.bind(localStorage);
  let syncing=false;
  localStorage.setItem=(key,value)=>{
    originalSet(key,value);
    if(key===LS && !syncing) window.dispatchEvent(new CustomEvent("0x8acure:progress-changed"));
  };
  async function sync(){
    const c=window.DPDP_AUTH?.client;
    if(!c||syncing)return;
    const {data:{session}}=await c.auth.getSession(); if(!session?.user)return;
    let state={};try{state=JSON.parse(localStorage.getItem(LS)||"{}")}catch{}
    const rows=Object.entries(state.completed||{}).map(([room_id,completed])=>({
      user_id:session.user.id,room_id,completed:!!completed,
      best_score:Number(state.roomQuiz?.[room_id]?.bestScore||0),xp:Number(state.xp||0)
    }));
    syncing=true;
    try{
      if(rows.length) await c.from("room_progress").upsert(rows,{onConflict:"user_id,room_id"});
      await c.from("profiles").update({
        xp:Number(state.xp||0),streak:Number(state.streak||0),
        last_active_date:state.lastActiveDate||null,updated_at:new Date().toISOString()
      }).eq("id",session.user.id);
    } finally { syncing=false; }
  }
  window.addEventListener("0x8acure:progress-changed",()=>{sync().catch(()=>{})});
  window.addEventListener("load",()=>setTimeout(()=>sync().catch(()=>{}),900));
})();