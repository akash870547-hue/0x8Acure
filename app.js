(() => {
  const API = window.DPDP_API;
  const LS = "dpdp-platform-v3";
  const saved = JSON.parse(localStorage.getItem(LS) || "{}");
  const state = Object.assign({xp:0,theme:"dark",completed:{},quizScore:0,quizDone:false},saved);
  let view="home", pathId=null, lessonId=null, quizIndex=0, quizSelected=null, quizFeedback=null;

  const appEl=document.getElementById("app");
  const streakEl=document.getElementById("streakCount");
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));
  const save=()=>{localStorage.setItem(LS,JSON.stringify(state));document.documentElement.dataset.theme=state.theme; if(streakEl) streakEl.textContent="";};
  const path=()=>DPDP_CURRICULUM.find(p=>p.id===pathId);
  const lesson=()=>path()?.lessons.find(l=>l.id===lessonId);
  const totalLessons=()=>DPDP_CURRICULUM.reduce((n,p)=>n+p.lessons.length,0);
  const completedLessons=()=>Object.keys(state.completed).length;
  const sourceLink=(title,url)=>'<a target="_blank" rel="noopener" href="'+url+'">'+esc(title)+'</a>';

  function topActions(){
    return '<div class="hero-actions"><button class="btn primary" data-action="paths">Explore Learning</button><button class="btn ghost" data-action="quiz">Quiz</button><button class="btn ghost" data-action="sources">Official Sources</button></div>';
  }

  function home(){
    appEl.innerHTML='<section class="hero"><div class="hero-main"><div class="eyebrow">0x8Acure · DPDP Learning Platform</div><h1>Train on India’s digital data protection framework.</h1><p>Learn the DPDP Act, 2023 and notified DPDP Rules, 2025 through guided paths, legal concepts, operational scenarios and a dedicated assessment area.</p>'+topActions()+'<div class="legal">Primary-source curriculum: '+sourceLink("MeitY DPDP Act 2023",DPDP_SOURCE.act)+' · '+sourceLink("MeitY DPDP Rules 2025",DPDP_SOURCE.rules)+'. Training content is educational and not legal advice.</div></div><aside class="hero-side"><div class="stat"><b>Continue learning</b><span>Pick any path. Your local progress is saved.</span></div><div class="stat"><b>'+state.xp+' XP</b><span>Learning progress</span></div><div class="stat"><b>Official-source first</b><span>Government material is the source of truth.</span></div><div class="notice">The platform does not display a total room/lab count. Learning is organised as a curriculum, like a security-training platform.</div></aside></section><div class="section-head"><div><h2>Continue where you left off</h2><p>Choose a learning track.</p></div></div><div class="grid path-grid">'+DPDP_CURRICULUM.map(p=>'<button class="path-card" data-path="'+p.id+'"><div class="card-top"><span class="badge cyan">'+esc(p.level)+'</span><span class="badge">'+esc(p.tag)+'</span></div><h3>'+esc(p.name)+'</h3><p>'+esc(p.description)+'</p><div class="path-meta"><span>Open curriculum</span><span>'+p.lessons.length+' modules</span></div></button>').join("")+'</div>';
  }

  function paths(){
    appEl.innerHTML='<div class="section-head"><div><h2>Learning Paths</h2><p>Follow a path or jump directly into a topic.</p></div><button class="btn ghost" data-action="home">Home</button></div><div class="grid path-grid">'+DPDP_CURRICULUM.map(p=>'<button class="path-card" data-path="'+p.id+'"><div class="card-top"><span class="badge violet">'+esc(p.level)+'</span><span class="badge">'+esc(p.tag)+'</span></div><h3>'+esc(p.name)+'</h3><p>'+esc(p.description)+'</p><div class="path-meta"><span>Open path</span><span>'+p.lessons.length+' modules</span></div></button>').join("")+'</div>';
  }

  function pathView(){
    const p=path(); if(!p){view="paths";return render();}
    appEl.innerHTML='<div class="section-head"><div><span class="badge cyan">'+esc(p.level)+' · '+esc(p.tag)+'</span><h2 style="margin-top:12px">'+esc(p.name)+'</h2><p>'+esc(p.description)+'</p></div><button class="btn ghost" data-action="paths">All paths</button></div><div class="panel path-intro"><div class="notice">Learn the legal rule first, then apply it. Each module shows its statutory source so learners can distinguish primary law from internal operating guidance.</div></div><div class="grid room-grid" style="margin-top:16px">'+p.lessons.map((l,i)=>'<button class="room-card '+(state.completed[l.id]?"complete":"")+'" data-lesson="'+l.id+'"><div class="card-top"><span class="badge">'+String(i+1).padStart(2,"0")+'</span><span class="badge">'+(state.completed[l.id]?"Completed":"Learn")+'</span></div><h3>'+esc(l.title)+'</h3><p>'+esc(l.sections)+'</p><div class="room-meta"><span>'+esc(l.source||"Official source")+'</span><span>Open</span></div></button>').join("")+'</div>';
  }

  function lessonView(){
    const l=lesson(); const p=path(); if(!l||!p){view="paths";return render();}
    appEl.innerHTML='<div class="room-top"><div><div class="kicker">'+esc(p.level)+' · '+esc(l.sections)+'</div><h1>'+esc(l.title)+'</h1><p>'+esc(p.description)+'</p></div><span class="badge cyan">LEARNING MODULE</span></div><div class="room-layout" style="margin-top:18px"><section class="panel room-theory"><div class="notice">Source of truth: '+esc(l.source||"Government source")+'</div><div class="theory-block"><div class="kicker">Core learning</div>'+l.body.map(x=>'<p>'+esc(x)+'</p>').join("")+'</div><div class="theory-block"><div class="kicker">Source</div><p>'+sourceLink("Open official MeitY source", l.source?.includes("Rules")?DPDP_SOURCE.rules:DPDP_SOURCE.act)+'</p></div><div class="hero-actions"><button class="btn primary" data-action="complete">Mark learned</button><button class="btn ghost" data-action="path">Back to path</button></div></section><aside class="challenge-card"><div class="challenge-head"><div class="challenge-num">KNOWLEDGE CHECK</div><span class="badge">No room counter</span></div><div class="question">After studying this module, test yourself in the separate Quiz section.</div><button class="btn violet" style="width:100%" data-action="quiz">Open Quiz</button><div class="hint-box">Tip: read the cited statutory section before treating an operational recommendation as a legal requirement.</div></aside></div>';
  }

  function quiz(){
    quizIndex=0;quizSelected=null;quizFeedback=null;state.quizDone=false;save();renderQuiz();
  }
  function renderQuiz(){
    const q=DPDP_QUIZ[quizIndex];
    if(!q){view="home";return render();}
    const opts=q.o.map((x,i)=>'<button class="option '+(quizSelected===i?"selected":"")+'" data-qoption="'+i+'"><input type="radio" '+(quizSelected===i?"checked":"")+'><span>'+esc(x)+'</span></button>').join("");
    appEl.innerHTML='<div class="section-head"><div><span class="badge amber">ASSESSMENT</span><h2 style="margin-top:12px">DPDP Knowledge Check</h2><p>Standalone quiz area. Quiz questions are based on the official-source curriculum.</p></div><button class="btn ghost" data-action="home">Exit</button></div><div class="room-layout"><section class="panel"><div class="kicker">Question '+(quizIndex+1)+'</div><div class="question">'+esc(q.q)+'</div><div class="options">'+opts+'</div><div class="challenge-actions"><button class="btn primary" data-action="quizsubmit">Submit answer</button></div>'+(quizFeedback?'<div class="explain '+(quizFeedback.ok?"":"wrong")+'">'+esc(quizFeedback.text)+'</div>':"")+'</section><aside class="challenge-card"><div class="challenge-num">ASSESSMENT</div><p class="muted">Use the primary source links if you need to review a concept, then return here.</p><button class="btn ghost" data-action="sources">Official Sources</button></aside></div>';
  }
  function quizSubmit(){
    const q=DPDP_QUIZ[quizIndex];
    if(quizSelected===null){quizFeedback={ok:false,text:"Select an answer first."};return renderQuiz();}
    const ok=quizSelected===q.a;
    if(ok){state.quizScore++;state.xp+=20;quizFeedback={ok:true,text:"Correct. The curriculum and source mapping support this answer."};}
    else quizFeedback={ok:false,text:"Not correct. Review the cited Act or Rules module and try again."};
    save();renderQuiz();
    if(ok)setTimeout(()=>{quizIndex++;quizSelected=null;quizFeedback=null;if(quizIndex>=DPDP_QUIZ.length){state.quizDone=true;save();quizResult();}else renderQuiz();},650);
  }
  function quizResult(){
    appEl.innerHTML='<section class="hero"><div class="hero-main"><div class="eyebrow">Assessment complete</div><h1>Knowledge check finished.</h1><p>Your score is tracked locally for this session. Revisit any learning path to strengthen weak areas.</p><div class="hero-actions"><button class="btn primary" data-action="quiz">Retake quiz</button><button class="btn ghost" data-action="paths">Explore paths</button></div></div><aside class="hero-side"><div class="stat"><b>'+state.quizScore+'</b><span>Correct answers</span></div><div class="stat"><b>'+state.xp+' XP</b><span>Total learning XP</span></div></aside></section>';
  }

  function sources(){
    appEl.innerHTML='<div class="section-head"><div><h2>Official Sources</h2><p>Government material only for the legal curriculum.</p></div><button class="btn ghost" data-action="home">Home</button></div><div class="grid room-grid"><a class="room-card" target="_blank" rel="noopener" href="'+DPDP_SOURCE.act+'"><span class="badge cyan">MEITY / GAZETTE</span><h3>Digital Personal Data Protection Act, 2023</h3><p>Primary statutory text hosted by MeitY.</p></a><a class="room-card" target="_blank" rel="noopener" href="'+DPDP_SOURCE.rules+'"><span class="badge cyan">MEITY</span><h3>Digital Personal Data Protection Rules, 2025</h3><p>Notified Rules and official MeitY document page.</p></a><a class="room-card" target="_blank" rel="noopener" href="'+DPDP_SOURCE.note+'"><span class="badge cyan">MEITY</span><h3>Explanatory Note to the Rules</h3><p>Official explanatory material. It is educational and not itself the statutory text.</p></a><a class="room-card" target="_blank" rel="noopener" href="'+DPDP_SOURCE.actPage+'"><span class="badge cyan">MEITY</span><h3>MeitY DPDP Act Page</h3><p>Official Ministry landing page for the Act.</p></a></div><div class="notice" style="margin-top:16px"><b>Commencement note:</b> the notified Rules use phased commencement. Rules 1, 2 and 17-21 commence on publication; Rule 4 follows one year after publication; Rules 3, 5-16, 22 and 23 follow eighteen months after publication. The platform keeps this distinction visible so learners do not confuse a notified rule with one already in force.</div>';
  }

  function progress(){
    appEl.innerHTML='<div class="section-head"><div><h2>My Progress</h2><p>Private local learning progress on this browser.</p></div><button class="btn ghost" data-action="home">Home</button></div><div class="progress-strip"><div><div class="kicker">Modules completed</div><div style="margin:10px 0 7px;font-weight:700">'+completedLessons()+' completed</div><div class="progress-track"><div class="progress-fill" style="width:'+Math.min(100,completedLessons()/Math.max(1,totalLessons())*100)+'%"></div></div></div><div style="text-align:right"><div style="font-size:26px;font-weight:800">'+state.xp+'</div><div class="kicker">XP</div></div></div><div class="notice" style="margin-top:16px">Progress is curriculum-based. The platform intentionally avoids exposing a total room/lab count.</div>';
  }

  function render(){
    save();
    if(view==="paths")paths();
    else if(view==="path")pathView();
    else if(view==="lesson")lessonView();
    else if(view==="quiz")quiz();
    else if(view==="quizRun")renderQuiz();
    else if(view==="sources")sources();
    else if(view==="progress")progress();
    else home();
  }

  document.addEventListener("click",e=>{
    const a=e.target.closest("[data-action]");
    if(a){
      const x=a.dataset.action;
      if(x==="home"){view="home";render();}
      else if(x==="paths"){view="paths";render();}
      else if(x==="path"){view="path";render();}
      else if(x==="complete"){const l=lesson();if(l&&!state.completed[l.id]){state.completed[l.id]=true;state.xp+=30;save();toastMsg("Module marked learned");}else toastMsg("Already completed");}
      else if(x==="quiz"){view="quizRun";quiz();}
      else if(x==="quizsubmit"){quizSubmit();}
      else if(x==="sources"){view="sources";render();}
      else if(x==="progress"){view="progress";render();}
      else if(x==="theme"){state.theme=state.theme==="dark"?"light":"dark";save();render();}
    }
    const p=e.target.closest("[data-path]");
    if(p){pathId=p.dataset.path;view="path";render();}
    const l=e.target.closest("[data-lesson]");
    if(l){lessonId=l.dataset.lesson;view="lesson";render();}
    const q=e.target.closest("[data-qoption]");
    if(q){quizSelected=Number(q.dataset.qoption);renderQuiz();}
  });
  function toastMsg(msg){const t=document.getElementById("toast");if(!t)return;t.textContent=msg;t.classList.add("show");clearTimeout(toastMsg.t);toastMsg.t=setTimeout(()=>t.classList.remove("show"),2200);}
  window.DPDP_API.setBase(localStorage.getItem("dpdp-api-base") || ((!location.hostname.includes("github.io")) ? location.origin : ""));
  render();
})();