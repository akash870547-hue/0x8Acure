(() => {
  const apiBase=String(window.DPDP_API_BASE||"").replace(/\/+$/,"");
  const apiUrl=path=>apiBase+path;
  window.DPDP_API_URL=apiUrl;
  const client=()=>window.DPDP_AUTH?.client;
  async function requestJson(path,options={}){
    const response=await fetch(apiUrl(path),{
      ...options,
      headers:{"Content-Type":"application/json",...(options.headers||{})}
    });
    const payload=await response.json().catch(()=>({error:"Invalid server response."}));
    if(!response.ok)throw new Error(payload.error||"The request could not be completed.");
    return payload;
  }
  window.DPDP_API={
    async request(path,options={}){
      if(path==="/api/legal-rooms")return requestJson(path);
      const legalAnswer=path.match(/^\/api\/legal-quizzes\/([^/]+)\/answer$/);
      if(legalAnswer&&options.method==="POST")return requestJson(path,options);
      if(path==="/api/tasks/quiz"){
        const registry=await requestJson("/api/legal-rooms");
        const tasks=(registry.rooms||[]).flatMap(room=>(room.tasks||[]).flatMap(task=>(task.questions||[]).map(question=>({...question,id:question.id,room_id:room.id}))));
        return {tasks};
      }
      const auth=client();
      if(!auth)throw new Error("Supabase is not configured or you are signed out.");
      if(path==="/api/leaderboard"){
        const {data,error}=await auth.rpc("public_leaderboard");
        if(error)throw error;
        return {rows:data||[]};
      }
      const taskAnswer=path.match(/^\/api\/tasks\/([^/]+)\/answer$/);
      if(taskAnswer&&options.method==="POST"){
        let body={};try{body=JSON.parse(options.body||"{}");}catch{}
        const {data,error}=await auth.rpc("submit_task",{p_task_id:decodeURIComponent(taskAnswer[1]),p_answer:body.answer??null});
        if(error)throw error;
        return data;
      }
      throw new Error("Unsupported legacy API route.");
    }
  };
})();
