(() => {
  // Supabase-only frontend adapter. No same-origin server and no server.js calls.
  const client=()=>window.DPDP_AUTH?.client;
  window.DPDP_API={
    async request(path,options={}){
      const c=client(); if(!c) throw new Error("Supabase is not configured or you are signed out.");
      if(path==="/api/leaderboard"){
        const {data,error}=await c.rpc("public_leaderboard"); if(error) throw error; return {rows:data||[]};
      }
      if(path==="/api/tasks/quiz"){
        const r=await fetch("content/legal-room-content.json",{cache:"no-store"}); if(!r.ok) throw new Error("Quiz content unavailable.");
        const reg=await r.json();
        const tasks=(reg.rooms||[]).flatMap(room=>(room.tasks||[]).flatMap(task=>(task.questions||[]).map(q=>({...q,id:q.id,room_id:room.id}))));
        return {tasks};
      }
      const m=path.match(/^\/api\/tasks\/([^/]+)\/answer$/);
      if(m && options.method==="POST"){
        let body={};try{body=JSON.parse(options.body||"{}")}catch{}
        const {data,error}=await c.rpc("submit_task",{p_task_id:decodeURIComponent(m[1]),p_answer:body.answer??null});
        if(error) throw error; return data;
      }
      throw new Error("Unsupported legacy API route. The platform uses Supabase only.");
    }
  };
})();