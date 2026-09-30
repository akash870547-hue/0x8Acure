(() => {
  const LS="dpdp-platform-v4";
  const originalSet=localStorage.setItem.bind(localStorage);
  localStorage.setItem=(key,value)=>{originalSet(key,value);if(key===LS)window.dispatchEvent(new CustomEvent("0x8acure:progress-changed"));};
  const wrap=()=>{
    if(!window.DPDP_API||window.DPDP_API.__supabaseWrapped)return;
    const original=window.DPDP_API.request.bind(window.DPDP_API);
    window.DPDP_API.request=async(path,options={})=>{
      const result=await original(path,options);
      if(/^\/api\/tasks\/[^/]+\/answer$/.test(path)&&options.method==="POST"&&window.DPDP_AUTH?.configured){
        try{
          const {data}=await window.DPDP_AUTH.client.auth.getSession(),u=data.session?.user;
          if(u){
            const taskId=decodeURIComponent(path.split("/")[3]);
            let answer=null;try{answer=JSON.parse(options.body||"{}").answer}catch{}
            await window.DPDP_AUTH.client.from("task_submissions").insert({user_id:u.id,task_id:taskId,answer,correct:!!result.correct,points:Number(result.points||0)});
          }
        }catch{}
      }
      return result;
    };
    window.DPDP_API.__supabaseWrapped=true;
  };
  window.addEventListener("load",()=>setTimeout(wrap,0));
})();