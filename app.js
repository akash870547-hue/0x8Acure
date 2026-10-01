(() => {
  const LS = "dpdp-platform-v4";
  const saved = JSON.parse(localStorage.getItem(LS) || "{}");
  const state = Object.assign({xp:0,theme:"dark",completed:{},quizScore:0,quizDone:false}, saved);

  let view = "home";
  let pathId = null;
  let moduleId = null;
  let roomId = null;
  let quizIndex = 0;
  let quizSelected = null;
  let quizFeedback = null;
  let quizTasks = [];
  let activeTaskId = null;

  const appEl = document.getElementById("app");
  const streakEl = document.getElementById("streakCount");

  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
  }[c]));

  const save = () => {
    const today = new Date().toISOString().slice(0,10);
    if (state.lastActiveDate !== today) {
      const prev = state.lastActiveDate ? new Date(state.lastActiveDate) : null;
      const diff = prev ? Math.round((new Date(today) - prev) / 86400000) : 0;
      state.streak = diff === 1 ? Number(state.streak || 0) + 1 : 1;
      state.lastActiveDate = today;
    }
    localStorage.setItem(LS, JSON.stringify(state));
    document.documentElement.dataset.theme = state.theme;
    if (streakEl) streakEl.textContent = "";
  };

  const path = () => DPDP_CURRICULUM.find(p => p.id === pathId);
  const mod = () => path()?.modules?.find(m => m.id === moduleId);
  const room = () => mod()?.rooms?.find(r => r.id === roomId) || path()?.modules?.flatMap(m => m.rooms || []).find(r => r.id === roomId);
  let legalStatusByRoom = {};
  const draftBadge = id => legalStatusByRoom[id] === "VERIFIED_WORD_FOR_WORD" ? "" : '<span class="badge amber">Draft, under verification</span>';

  const allRooms = () => DPDP_CURRICULUM.flatMap(p => (p.modules || []).flatMap(m => m.rooms || []));

  function syncBrowserUrl(replace = false) {
    const params = new URLSearchParams();
    if (view === "paths") params.set("view", "paths");
    else if (view === "path" && pathId) { params.set("path", pathId); }
    else if (view === "module" && pathId && moduleId) { params.set("path", pathId); params.set("module", moduleId); }
    else if (view === "room" && roomId) { params.set("room", roomId); }
    else if (view === "quiz" ) params.set("view", "quiz");
    else if (view === "quizRun" && roomId) { params.set("room", roomId); params.set("quiz", "1"); }
    else if (view === "sources") params.set("view", "sources");
    else if (view === "progress") params.set("view", "progress");
    else if (view === "profile") params.set("view", "profile");
    const next = params.toString() ? (window.location.pathname + "?" + params.toString()) : window.location.pathname;
    const method = replace ? "replaceState" : "pushState";
    if (window.history && window.location.href !== new URL(next, window.location.href).href) {
      window.history[method]({view, pathId, moduleId, roomId}, "", next);
    }
  }

  function restoreFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const urlRoom = params.get("room");
    const urlPath = params.get("path");
    const urlModule = params.get("module");
    const urlView = params.get("view");
    if (urlRoom) {
      for (const p of DPDP_CURRICULUM) {
        const m = (p.modules || []).find(x => (x.rooms || []).some(r => r.id === urlRoom));
        if (m) { pathId = p.id; moduleId = m.id; roomId = urlRoom; view = params.get("quiz") === "1" ? "room" : "room"; return; }
      }
    }
    if (urlPath) {
      const p = DPDP_CURRICULUM.find(x => x.id === urlPath);
      if (p) {
        pathId = p.id;
        if (urlModule) {
          const m = p.modules?.find(x => x.id === urlModule);
          if (m) { moduleId = m.id; view = "module"; return; }
        }
        view = "path"; return;
      }
    }
    if (["paths","quiz","sources","progress","profile"].includes(urlView)) view = urlView;
  }

  function navigate(nextView, ids = {}, replace = false) {
    view = nextView;
    if ("pathId" in ids) pathId = ids.pathId;
    if ("moduleId" in ids) moduleId = ids.moduleId;
    if ("roomId" in ids) roomId = ids.roomId;
    syncBrowserUrl(replace);
    render();
  }

  const completedRooms = () => Object.keys(state.completed).length;
  // Paths, modules and rooms are always accessible. Login only persists progress.
  const pathUnlocked = () => true;
  const roomIndexInPath = (p, roomId) => (p?.modules || []).flatMap(m => m.rooms || []).findIndex(r => r.id === roomId);
  const roomUnlocked = () => true;

  const sourceUrl = item => String(item?.source || "").includes("Rules")
    ? DPDP_SOURCE.rules
    : DPDP_SOURCE.act;

  const sourceLink = (title, url) =>
    '<a target="_blank" rel="noopener" href="' + url + '">' + esc(title) + '</a>';

  function topActions() {
    return '<div class="hero-actions">' +
      '<button class="btn primary" data-action="paths">Explore Learning</button>' +
      '<button class="btn ghost" data-action="quiz">Quiz</button>' +
      '<button class="btn ghost" data-action="sources">Official Sources</button>' +
      '</div>';
  }

  function badges() {
    const n = completedRooms();
    return [n >= 1 ? "First Room" : null, n >= 5 ? "Five Rooms" : null, state.xp >= 100 ? "100 XP" : null, n >= 10 ? "Path Runner" : null].filter(Boolean);
  }

  function home() {
    const current = DPDP_CURRICULUM.find(p => (p.modules||[]).flatMap(m=>m.rooms||[]).some(r=>!state.completed[r.id]));
    const earned = badges();
    appEl.innerHTML =
      '<section class="dashboard-head"><div><div class="eyebrow">0x8Acure · Dashboard</div><h1>Continue your DPDP training.</h1><p>Three ordered paths, official-source rooms, practical scenarios and cited challenges.</p></div>' +
      '<div class="dash-actions"><button class="btn primary" data-action="continue">' + (current ? "Continue learning" : "Explore paths") + '</button><button class="btn ghost" data-action="paths">Path overview</button></div></section>' +
      '<section class="metric-grid dashboard-metrics"><div class="metric"><b>' + state.xp + '</b><span>XP earned</span></div><div class="metric"><b>' + completedRooms() + '</b><span>Rooms completed</span></div><div class="metric"><b>' + (state.streak || 0) + '</b><span>Day streak</span></div><div class="metric"><b>' + earned.length + '</b><span>Badges</span></div></section>' +
      '<section class="dashboard-grid"><div><div class="section-head"><div><h2>Current path</h2><p>' + (current ? esc(current.name) : "All paths complete") + '</p></div></div>' +
      (current ? '<button class="path-card current-path" data-path="' + current.id + '"><div class="card-top"><span class="badge cyan">' + esc(current.level) + '</span><span class="badge">' + esc(current.tag) + '</span></div><h3>' + esc(current.name) + '</h3><p>' + esc(current.description) + '</p><div class="path-meta"><span>Continue in order</span><span>Official sources</span></div></button>' : '<div class="panel"><div class="notice">You have completed the available rooms.</div></div>') +
      '</div><aside><div class="section-head"><div><h2>Badges</h2><p>Earned locally on this browser.</p></div></div><div class="badge-stack">' +
      (earned.length ? earned.map(x=>'<span class="achievement"><b>0x8A</b>'+esc(x)+'</span>').join("") : '<div class="panel muted">Complete rooms to earn badges.</div>') +
      '</div><div class="section-head"><div><h2>Leaderboard</h2><p>Opt in before viewing public rankings.</p></div></div><button class="panel optin-card" data-action="leaderboard"><b>View leaderboard</b><span>Participation is opt-in.</span></button></aside></section>';
  }

  function paths() {
    appEl.innerHTML =
      '<div class="section-head"><div><h2>Learning Paths</h2><p>Three paths. Pick one and enter its modules.</p></div><button class="btn ghost" data-action="home">Home</button></div>' +
      '<div class="grid path-grid">' +
        DPDP_CURRICULUM.map((p, i) =>
          '<button class="path-card ' + (pathUnlocked(i) ? "" : "locked") + '" data-path="' + p.id + '" data-locked="' + (!pathUnlocked(i)) + '">' +
            '<div class="card-top"><span class="badge violet">' + esc(p.level) + '</span><span class="badge">' + esc(p.tag) + '</span></div>' +
            '<h3>' + esc(p.name) + '</h3>' +
            '<p>' + esc(p.description) + '</p>' +
            '<div class="path-meta"><span>Enter path</span><span>Modules inside</span></div>' +
          '</button>'
        ).join("") +
      '</div>';
  }

  function pathView() {
    const p = path();
    if (!p) { view = "paths"; return render(); }
    const rooms = (p.modules || []).flatMap(m => m.rooms || []);
    const done = rooms.filter(r=>state.completed[r.id]).length;
    appEl.innerHTML =
      '<div class="section-head"><div><span class="badge cyan">' + esc(p.level) + ' · ' + esc(p.tag) + '</span><h2 style="margin-top:12px">' + esc(p.name) + '</h2><p>' + esc(p.description) + '</p></div><button class="btn ghost" data-action="paths">All paths</button></div>' +
      '<div class="progress-strip"><div><div class="kicker">Path progress</div><div style="margin:8px 0">All rooms are open. Complete rooms to track progress.</div><div class="progress-track"><div class="progress-fill" style="width:' + Math.round(done/Math.max(rooms.length,1)*100) + '%"></div></div></div><div><b>' + done + '</b><div class="kicker">completed</div></div></div>' +
      '<div class="grid room-grid" style="margin-top:16px">' +
      rooms.map((r,i)=>{const unlocked=roomUnlocked(p,i);return '<button class="room-card ' + (state.completed[r.id]?'complete ':'') + (!unlocked?'locked':'') + '" data-room="' + r.id + '"><div class="card-top"><span class="badge">' + String(i+1).padStart(2,'0') + '</span><span class="badge">' + (state.completed[r.id]?'Completed':unlocked?'Room':'Locked') + '</span></div><h3>' + esc(r.title) + '</h3><p>' + esc(r.sections) + '</p><div class="room-meta"><span>' + esc(r.difficulty) + ' · ' + esc(r.estimated_minutes) + ' min</span><span>' + (unlocked?'Open room':'Open room') + '</span></div></button>';}).join('') +
      '</div>';
  }

  function moduleView() {
    const p = path();
    const m = mod();
    if (!p || !m) { view = "path"; return render(); }

    appEl.innerHTML =
      '<div class="section-head">' +
        '<div><div class="kicker">' + esc(p.name) + ' / Module</div>' +
        '<h2 style="margin-top:8px">' + esc(m.name) + '</h2>' +
        '<p>' + esc(m.description) + '</p></div>' +
        '<button class="btn ghost" data-action="path">Back to path</button>' +
      '</div>' +
      '<div class="panel path-intro"><div class="notice">Room-based learning. Open a room, study the objective, then mark it learned when you are done.</div></div>' +
      '<div class="grid room-grid" style="margin-top:16px">' +
        m.rooms.map((r, i) => {
          const unlocked = roomUnlocked(p, roomIndexInPath(p, r.id));
          return '<button class="room-card ' + (state.completed[r.id] ? "complete" : "") + (unlocked ? "" : " locked") + '" data-room="' + r.id + '" data-locked="' + (!unlocked) + '">' +
            '<div class="card-top"><span class="badge">' + String(i + 1).padStart(2,"0") + '</span><span class="badge">' + (state.completed[r.id] ? "Completed" : unlocked ? "Room" : "Locked") + '</span>' + draftBadge(r.id) + '</div>' +
            '<h3>' + esc(r.title) + '</h3><p>' + esc(r.sections) + '</p>' +
            '<div class="room-meta"><span>' + esc(r.sourceIds.join(" + ")) + '</span><span>' + (unlocked ? "Open room" : "Open room") + '</span></div></button>';
        }).join("") +
      '</div>';
  }


  function rqArrayEqual(a,b){ return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((v,i)=>v===b[i]); }
  function rqSorted(a){ return [...a].sort((x,y)=>x-y); }
  function rqGrade(q,raw){
    const expected=q.answer!==undefined?q.answer:q.correct_answer;
    if(raw===undefined||raw===null) return false;
    if(q.type==="multi-select") return Array.isArray(raw)&&Array.isArray(expected)&&rqArrayEqual(rqSorted(raw),rqSorted(expected));
    if(q.type==="order"||q.type==="match") return Array.isArray(raw)&&Array.isArray(expected)&&rqArrayEqual(raw,expected);
    return raw===expected;
  }
  function rqWrongReasons(q,raw,correct){
    if(correct) return "";
    if(q.type==="multi-select"&&Array.isArray(q.options)){
      const chosen=new Set(Array.isArray(raw)?raw:[]), expected=new Set(Array.isArray(q.answer)?q.answer:[]);
      return q.options.map((opt,i)=>expected.has(i)?(chosen.has(i)?"":"Missing correct option: "+opt):(chosen.has(i)?(q.why_wrong?.[i]||"This option should not be selected."): "")).filter(Boolean).join(" ");
    }
    return Array.isArray(q.why_wrong)?q.why_wrong.filter(Boolean).join(" "):"Review the cited provision and exact answer shape.";
  }
  function rqQuestionControl(q,selected){
    if(q.type==="multi-select"){
      const chosen=new Set(Array.isArray(selected)?selected:[]);
      return '<div class="challenge-options">'+(q.options||[]).map((o,i)=>'<label class="option '+(chosen.has(i)?"selected":"")+'"><input type="checkbox" data-rq-multi="'+i+'" '+(chosen.has(i)?"checked":"")+'><span>'+esc(o)+'</span></label>').join("")+'</div><p class="muted">Select all that apply. Scoring: all-correct-or-none.</p>';
    }
    if(q.type==="order"){
      const value=Array.isArray(selected)?selected:Array.from({length:(q.options||[]).length},()=>null);
      return '<div class="rq-order">'+value.map((v,pos)=>'<label class="rq-order-row"><b>'+(pos+1)+'.</b><select data-rq-order="'+pos+'"><option value="">Choose…</option>'+q.options.map((o,i)=>'<option value="'+i+'" '+(Number(v)===i?'selected':'')+'>'+esc(o)+'</option>').join('')+'</select></label>').join('')+'</div><p class="muted">Use every option exactly once. Grading is exact-order.</p>';
    }
    if(q.type==="match"){
      const value=Array.isArray(selected)?selected:[];
      return '<div class="rq-match">'+q.pairs.map((pair,i)=>'<label class="rq-match-row"><b>'+esc(pair.left)+'</b><select data-rq-match="'+i+'"><option value="">Choose…</option>'+pair.right_options.map((o,j)=>'<option value="'+j+'" '+(Number(value[i])===j?'selected':'')+'>'+esc(o)+'</option>').join('')+'</select></label>').join('')+'</div><p class="muted">Every mapping must match exactly.</p>';
    }
    return '<div class="challenge-options">'+(q.options||[]).map((o,i)=>'<button type="button" class="option '+(Number(selected)===i?"selected":"")+'" data-rq-option="'+i+'">'+esc(o)+'</button>').join("")+'</div>';
  }
  let roomRegistryRequest;
  async function loadRoomRegistry(){
    if(roomRegistryRequest) return roomRegistryRequest;
    roomRegistryRequest=(async()=>{
      let apiError=null;
      try{
        const apiPath=window.DPDP_API_URL?window.DPDP_API_URL("/api/legal-rooms"):"/api/legal-rooms";
        const response=await fetch(apiPath,{cache:"no-store"});
        if(response.ok){
          const registry=await response.json();
          if(Array.isArray(registry?.rooms)&&registry.rooms.length){
            legalStatusByRoom=Object.fromEntries(registry.rooms.map(x=>[x.id,x.official_text_status||"UNVERIFIED"]));
            window.__roomRegistry=registry;
            return registry;
          }
        }
        apiError=new Error("API quiz registry unavailable.");
      }catch(error){ apiError=error; }

      // GitHub Pages-safe fallback: the bundled task catalog is always available.
      try{
        const response=await fetch("content/tasks.json",{cache:"no-store"});
        if(!response.ok) throw new Error("HTTP "+response.status);
        const raw=await response.json();
        const tasks=Array.isArray(raw?.tasks)?raw.tasks:[];
        const roomMap=new Map();
        for(const task of tasks){
          const roomId=String(task.id||"").split("-t")[0];
          if(!roomId) continue;
          if(!roomMap.has(roomId)) roomMap.set(roomId,[]);
          roomMap.get(roomId).push({
            ...task,
            type:task.type==="order-the-steps"?"order":task.type,
            answer:task.correct_answer,
            section_reference:task.citation?.reference||"",
            why:task.explanation||""
          });
        }
        const curriculumRooms=allRooms();
        const rooms=curriculumRooms
          .filter(room=>roomMap.has(room.id))
          .map(room=>({
            id:room.id,
            title:room.title,
            difficulty:room.difficulty||"beginner",
            estimated_minutes:room.estimated_minutes||10,
            sections_covered:room.sections_covered||[room.sections||""],
            official_text_status:"UNVERIFIED",
            tasks:[{
              id:room.id+"-quiz",
              title:"DPDP Quiz",
              questions:roomMap.get(room.id)
            }]
          }));
        if(rooms.length){
          const registry={rooms};
          legalStatusByRoom=Object.fromEntries(rooms.map(x=>[x.id,x.official_text_status]));
          window.__roomRegistry=registry;
          window.__quizDataSource="content/tasks.json";
          return registry;
        }
      }catch(error){ /* continue to the legal-room registry fallbacks */ }

      const staticSources=[
        "content/legal-room-content.json",
        "https://raw.githubusercontent.com/akash870547-hue/0x8Acure/main/content/legal-room-content.json"
      ];
      let staticError=null;
      for(const source of staticSources){
        try{
          const response=await fetch(source,{cache:"no-store"});
          if(!response.ok) throw new Error("HTTP "+response.status);
          const raw=await response.json();
          const registry=Array.isArray(raw)?{rooms:raw}:raw;
          if(!Array.isArray(registry?.rooms)||!registry.rooms.length) throw new Error("empty registry");
          legalStatusByRoom=Object.fromEntries(registry.rooms.map(x=>[x.id,x.official_text_status||"UNVERIFIED"]));
          window.__roomRegistry=registry;
          window.__quizDataSource=source;
          return registry;
        }catch(error){ staticError=error; }
      }
      const detail=apiError?.message||staticError?.message||"Unknown error";
      throw new Error("DPDP quiz data could not be loaded. "+detail);
    })().catch(error=>{roomRegistryRequest=null;throw error;});
    return roomRegistryRequest;
  }

  function roomContentHtml(legal){
    const status=legal.official_text_status==="VERIFIED_WORD_FOR_WORD"?"VERIFIED":"Draft, under verification";
    const tasks=(legal.tasks||[]).map((t,i)=>{
      const official=(t.official_text||[]).map(x=>'<div class="official-text"><pre>'+esc(x)+'</pre></div>').join("");
      const terms=(t.key_terms||[]).map(term=>{
        if(Array.isArray(term)) return '<span class="term-chip"><b>'+esc(term[0])+'</b><small>'+esc(term.slice(1).join(" · "))+'</small></span>';
        return '<span class="term-chip"><b>'+esc(term)+'</b></span>';
      }).join("");
      const mistakes=(t.common_mistakes||[]).map(item=>{
        if(Array.isArray(item)&&item.length>=4) return '<div class="myth-card"><b>'+esc(item[0])+'</b><span>'+esc(item[1])+'</span><b>'+esc(item[2])+'</b><span>'+esc(item[3])+'</span></div>';
        return '<div class="myth-card"><b>NOTE</b><span>'+esc(Array.isArray(item)?item.join(" · "):item)+'</span></div>';
      }).join("");
      return '<details class="task-details" '+(i===0?"open":"")+'><summary>'+esc(t.title||("TASK "+(i+1)))+'</summary>'+
        '<div class="task-copy">'+official+
        (t.simple_words?'<div class="notice"><b>In simple words:</b><br>'+esc(t.simple_words)+'</div>':"")+
        (terms?'<h3>Key terms</h3><div class="term-list">'+terms+'</div>':"")+
        (t.real_world_example?'<h3>Real-world example</h3><p>'+esc(t.real_world_example)+'</p>':"")+
        (t.student_angle?'<h3>Student angle</h3><p>'+esc(t.student_angle)+'</p>':"")+
        (mistakes?'<h3>Myths / facts</h3>'+mistakes:"")+
        '</div></details>';
    }).join("");
    return '<div class="room-heading"><div><div class="kicker">ROOM</div><h1>'+esc(legal.title)+'</h1>'+
      '<div class="room-stats"><span>'+esc(legal.difficulty)+'</span><span>'+esc(legal.estimated_minutes)+' min</span><span>'+status+'</span></div></div>'+
      '<div class="hero-actions"><button class="btn ghost" data-action="module">Back</button><button class="btn primary" data-action="room-quiz">Take Quiz</button></div></div>'+
      (status!=="VERIFIED"?'<div class="notice warning"><b>Draft, under verification</b><br>This room remains open while its official text is verified.</div>':"")+
      '<div class="panel room-objectives"><div class="kicker">LEARNING OBJECTIVES</div><ul>'+((legal.learning_objectives||[]).map(x=>'<li>'+esc(x)+'</li>').join(""))+'</ul>'+
      '<p><b>Sections:</b> '+esc((legal.sections_covered||[]).join(", "))+'</p>'+
      (legal.source_pages!==undefined?'<p><b>Source page(s):</b> '+esc(Array.isArray(legal.source_pages)?legal.source_pages.join(", "):legal.source_pages)+'</p>':"")+
      '</div><div class="room-shell room-content-shell"><section class="room-learning">'+
      '<details class="task-details" open><summary>LEARNING CONTENT</summary><div class="task-copy">'+tasks+
      '<details class="task-details"><summary>SUMMARY / CHEAT-SHEET</summary><div class="task-copy">'+
      (legal.summary?'<p>'+esc(legal.summary)+'</p>':"")+
      '<ul>'+((legal.cheat_sheet||[]).map(x=>'<li>'+esc(x)+'</li>').join(""))+'</ul></div></details>'+
      '<details class="task-details"><summary>FINAL CHALLENGE</summary><div class="task-copy"><p>'+esc(legal.final_challenge?.scenario||"")+'</p>'+
      (legal.final_challenge?.flag?'<code>'+esc(legal.final_challenge.flag)+'</code>':"")+
      '</div></details></div></details></section>'+
      '<aside class="challenge-panel"><div class="score-card"><b>Learning room</b><span>Study the room here. Quizzes are separate.</span></div>'+
      '<button class="btn primary" data-action="room-quiz">Start room quiz</button><button class="btn ghost" data-action="module">Back to module</button></aside></div>';
  }

  async function roomView(){
    const p=path(),m=mod(),r=room();
    if(!p||!m||!r){view="paths";return render();}
    try{
      const reg=await loadRoomRegistry();
      const legal=(reg.rooms||[]).find(x=>x.id===r.id);
      if(!legal) throw new Error("Room content unavailable.");
      appEl.innerHTML=roomContentHtml(legal);
    }catch(e){
      appEl.innerHTML='<div class="notice"><b>Room unavailable.</b><br>'+esc(e.message)+'</div>';
    }
  }

  function submitRoomAnswer(index){
    const legal=(window.__roomRegistry.rooms||[]).find(x=>x.id===roomId); if(!legal)return;
    const q=legal.tasks.flatMap(t=>t.questions||[])[Number(index)],rs=roomQuizMeta(legal).rs,raw=rs.answers[String(index)];
    if(raw===undefined){toastMsg("Choose an answer first");return;}
    const ok=rqGrade(q,raw); rs.results[String(index)]=ok; rs.feedback||(rs.feedback={});
    rs.feedback[String(index)]={correct:ok,explanation:q.why||"Review the cited provision.",wrongReasons:rqWrongReasons(q,raw,ok)};
    const total=legal.tasks.reduce((n,t)=>n+(t.questions||[]).length,0),correct=Object.values(rs.results).filter(Boolean).length,score=total?Math.round(correct/total*100):0;
    rs.bestScore=Math.max(Number(rs.bestScore||0),score); save(); render();
  }
  async function leaderboard() {
    if(localStorage.getItem("0x8acure-leaderboard-optin")!=="yes"){
      appEl.innerHTML='<section class="panel optin-panel"><h2>Leaderboard is opt-in</h2><p>Enable public participation before viewing learner rankings.</p><label class="check-row"><input id="leaderboard-optin" type="checkbox"> I agree to participate.</label><div class="hero-actions"><button class="btn primary" data-action="leaderboard-enable">Enable leaderboard</button><button class="btn ghost" data-action="home">Cancel</button></div></section>';
      return;
    }
    try{
      const data=await DPDP_API.request("/api/leaderboard");
      appEl.innerHTML='<div class="section-head"><div><h2>Leaderboard</h2><p>Opt-in learner rankings.</p></div><button class="btn ghost" data-action="home">Dashboard</button></div><div class="panel table-wrap"><table class="score-table"><thead><tr><th>#</th><th>Learner</th><th>XP</th><th>Rooms</th></tr></thead><tbody>'+(data.rows||[]).map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(x.name)+'</td><td>'+x.xp+'</td><td>'+x.completed_rooms+'</td></tr>').join('')+'</tbody></table></div>';
    }catch(e){appEl.innerHTML='<div class="notice">Leaderboard requires the platform backend.</div>';}
  }

  async function quiz(){
    try{
      const reg=await loadRoomRegistry();
      window.__quizRegistry=reg;
      const activeIds=new Set(allRooms().map(x=>x.id));
      const rooms=(reg.rooms||[]).filter(r=>activeIds.has(r.id)&&(r.tasks||[]).some(t=>(t.questions||[]).length));
      appEl.innerHTML='<div class="section-head"><div><span class="badge amber">QUIZ</span><h2 style="margin-top:12px">Quiz Library</h2><p>Study rooms separately. All assessments are collected here.</p></div><button class="btn ghost" data-action="home">Home</button></div>'+
        '<div class="panel path-intro"><div class="notice">Open a room to learn, then come here for its separate quiz. Room content does not contain quiz questions.</div></div>'+
        '<div class="grid room-grid" style="margin-top:16px">'+
        rooms.map((r,i)=>{
          const qs=(r.tasks||[]).flatMap(t=>t.questions||[]);
          const best=Number(state.roomQuiz?.[r.id]?.bestScore||0);
          return '<button class="room-card '+(best>=70?"complete":"")+'" data-quiz-room="'+esc(r.id)+'">'+
            '<div class="card-top"><span class="badge">'+String(i+1).padStart(2,"0")+'</span><span class="badge">'+(best?"Best "+best+"%":"Not attempted")+'</span></div>'+
            '<h3>'+esc(r.title)+'</h3><p>'+esc((r.sections_covered||[]).join(", "))+'</p>'+
            '<div class="room-meta"><span>'+qs.length+' questions</span><span>Open quiz</span></div></button>';
        }).join("")+'</div>';
    }catch(err){
      appEl.innerHTML='<div class="notice"><b>Quiz unavailable.</b><br>'+esc(err.message)+'</div>';
    }
  }

  async function startRoomQuiz(roomKey){
    try{
      const reg=window.__quizRegistry||await loadRoomRegistry();
      window.__quizRegistry=reg;
      const legal=(reg.rooms||[]).find(r=>r.id===roomKey);
      if(!legal) throw new Error("Quiz content unavailable.");
      const all=(legal.tasks||[]).flatMap(t=>t.questions||[]);
      if(!all.length) throw new Error("This room has no quiz questions.");
      const p=DPDP_CURRICULUM.find(x=>(x.modules||[]).some(m=>(m.rooms||[]).some(r=>r.id===roomKey)));
      const m=p?.modules?.find(x=>(x.rooms||[]).some(r=>r.id===roomKey));
      pathId=p?.id||pathId; moduleId=m?.id||moduleId; roomId=roomKey; activeTaskId=roomKey;
      quizTasks=all; quizIndex=0; quizSelected=null; quizFeedback=null; view="quizRun"; renderQuiz();
    }catch(err){
      appEl.innerHTML='<div class="notice"><b>Quiz unavailable.</b><br>'+esc(err.message)+'</div>';
    }
  }

  function quizAnswerStore(){
    state.roomQuiz||(state.roomQuiz={});
    state.roomQuiz[activeTaskId]||(state.roomQuiz[activeTaskId]={answers:{},results:{},feedback:{},bestScore:0,index:0});
    return state.roomQuiz[activeTaskId];
  }

  function quizScore(){
    const rs=quizAnswerStore(); const total=quizTasks.length;
    const correct=Object.values(rs.results||{}).filter(Boolean).length;
    return {total,correct,score:total?Math.round(correct/total*100):0,best:Number(rs.bestScore||0)};
  }

  async function quizSubmit(){
    const key=String(quizIndex),rs=quizAnswerStore(),answer=rs.answers?.[key];
    if(answer===undefined){toastMsg("Choose an answer first.");return;}
    try{
      let feedback;
      try{
        feedback=await DPDP_API.request("/api/legal-quizzes/"+encodeURIComponent(activeTaskId)+"/answer",{
          method:"POST",body:JSON.stringify({index:quizIndex,answer})
        });
      }catch(apiError){
        const q=quizTasks[quizIndex];
        const correct=rqGrade(q,answer);
        feedback={
          correct,
          explanation:q.explanation||q.why||"Review the cited provision and exact answer.",
          wrongReasons:correct?"":rqWrongReasons(q,answer,false)
        };
      }
      rs.results[key]=!!feedback.correct;
      rs.feedback[key]=feedback;
      save();
      renderQuiz();
    }catch(error){toastMsg(error.message||"Could not check this answer.");}
  }

  function renderQuiz(){
    const q=quizTasks[quizIndex]; if(!q) return finishRoomQuiz();
    const rs=quizAnswerStore(); const key=String(quizIndex);
    const selected=rs.answers?.[key]; const feedback=rs.feedback?.[key];
    const title=(window.__quizRegistry?.rooms||[]).find(r=>r.id===activeTaskId)?.title||"Room Quiz";
    appEl.innerHTML='<div class="section-head"><div><span class="badge amber">QUIZ</span><h2 style="margin-top:12px">'+esc(title)+'</h2>'+
      '<p>Question '+(quizIndex+1)+' of '+quizTasks.length+' · Best '+Number(rs.bestScore||0)+'%</p></div>'+
      '<div class="hero-actions"><button class="btn ghost" data-action="quiz">Quiz Library</button><button class="btn ghost" data-action="room">Back to room</button></div></div>'+
      '<div class="room-progress"><div class="progress-track"><div class="progress-fill" style="width:'+Math.round((quizIndex+1)/quizTasks.length*100)+'%"></div></div><span>'+(quizIndex+1)+'/'+quizTasks.length+'</span></div>'+
      '<div class="room-shell"><section class="room-learning"><div class="panel"><div class="kicker">'+esc(q.type||"QUESTION")+'</div><div class="question">'+esc(q.prompt||"")+'</div>'+
      rqQuestionControl(q,selected)+(feedback?'<div class="feedback '+(feedback.correct?"success":"error")+'"><b>'+(feedback.correct?"Correct":"Incorrect")+'</b><br>'+esc(feedback.explanation||"")+(feedback.wrongReasons?'<br><br><b>Wrong-option reasons:</b><br>'+esc(feedback.wrongReasons):"")+'</div>':"")+
      '</div></section><aside class="challenge-panel"><div class="score-card"><b>Current score: '+quizScore().score+'%</b><span>Pass mark: 70% · Best: '+Number(rs.bestScore||0)+'%</span></div>'+
      (feedback?'<button class="btn primary" data-action="quiz-next-room">'+(quizIndex+1<quizTasks.length?"Next question":"Finish quiz")+'</button>':'<button class="btn primary" data-action="quizsubmit">Submit answer</button>')+
      '<button class="btn ghost" data-action="quiz-room-reset">Retry from start</button></aside></div>';
  }

  function finishRoomQuiz(){
    const result=quizScore(); const title=(window.__quizRegistry?.rooms||[]).find(r=>r.id===activeTaskId)?.title||"Room Quiz";
    const passed=result.score>=70;
    appEl.innerHTML='<section class="hero"><div class="hero-main"><div class="eyebrow">Quiz complete</div><h1>'+esc(title)+'</h1>'+
      '<p>'+result.correct+' of '+result.total+' correct · '+result.score+'%</p><div class="hero-actions">'+
      '<button class="btn primary" data-action="quiz-room-retry">Retry quiz</button><button class="btn ghost" data-action="quiz">Quiz library</button><button class="btn ghost" data-action="room">Back to room</button>'+
      (passed?'<button class="btn primary" data-action="complete">Complete room</button>':"")+
      '</div></div><aside class="hero-side"><div class="stat"><b>'+result.score+'%</b><span>Current score</span></div><div class="stat"><b>'+result.best+'%</b><span>Best score</span></div><div class="stat"><b>'+result.correct+'/'+result.total+'</b><span>Correct</span></div></aside></section>';
  }

  async function quizStart(){ view="quiz"; return quiz(); }

  async function sources() {
    appEl.innerHTML = '<div class="section-head"><div><h2>Official Sources</h2><p>Government sources used by the platform. Last verified: 2026-09-30.</p></div><button class="btn ghost" data-action="home">Home</button></div><div class="panel"><div class="notice">Not legal advice. Educational use only.</div><div id="source-list" class="grid room-grid" style="margin-top:16px">Loading source registry...</div></div>';
    try {
      const r = await fetch("content/sources.json", {cache:"no-store"});
      if (!r.ok) throw new Error("Source registry could not be loaded.");
      const registry = await r.json();
      document.getElementById("source-list").innerHTML = (registry.sources || []).map(s =>
        '<a class="room-card" target="_blank" rel="noopener" href="' + esc(s.url) + '">' +
        '<span class="badge cyan">' + esc(s.document_type) + '</span>' +
        '<h3>' + esc(s.title) + '</h3>' +
        '<p><b>Publisher:</b> ' + esc(s.publisher) + '<br><b>Document date:</b> ' + esc(s.date) + '<br><b>Covers:</b> ' + esc(s.covers) + '</p>' +
        '<div class="room-meta"><span>Last verified: ' + esc(registry.last_verified) + '</span><span>Open source</span></div></a>'
      ).join("");
    } catch (err) {
      document.getElementById("source-list").innerHTML = '<div class="notice">' + esc(err.message) + '</div>';
    }
  }

  function profile() {
    const auth = window.DPDP_AUTH || {};
    const user = auth.user || auth.profile || null;
    const email = user?.email || auth.email || "Not signed in";
    const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.name || auth.name || (email !== "Not signed in" ? email.split("@")[0] : "Learner");
    const initials = String(name).trim().split(/\\s+/).slice(0,2).map(x=>x[0]||"").join("").toUpperCase() || "0X";
    const completed = completedRooms();
    const total = Math.max(1, allRooms().length);
    const pct = Math.min(100, Math.round(completed / total * 100));
    appEl.innerHTML =
      '<div class="section-head"><div><span class="badge cyan">MY PROFILE</span><h2 style="margin-top:12px">Profile</h2><p>Your account and learning snapshot.</p></div><button class="btn ghost" data-action="home">Dashboard</button></div>' +
      '<section class="profile-grid"><div class="profile-card panel"><div class="profile-avatar">'+esc(initials)+'</div><div class="profile-main"><h3>'+esc(name)+'</h3><p>'+esc(email)+'</p><span class="profile-role">'+(auth.isAdmin ? 'Administrator' : 'Learner')+'</span></div></div>' +
      '<div class="profile-card panel"><div class="profile-stat"><b>'+state.xp+'</b><span>XP earned</span></div><div class="profile-stat"><b>'+completed+'</b><span>Rooms completed</span></div><div class="profile-stat"><b>'+pct+'%</b><span>Overall progress</span></div><div class="profile-stat"><b>'+(state.streak||0)+'</b><span>Day streak</span></div></div></section>' +
      '<section class="panel profile-progress"><div class="section-head compact"><div><h3>Learning progress</h3><p>Keep building your DPDP skills.</p></div><button class="btn ghost" data-action="progress">View progress</button></div><div class="progress-track"><div class="progress-fill" style="width:'+pct+'%"></div></div></section>' +
      '<section class="panel profile-actions"><h3>Account</h3><p class="muted">Authentication, saved progress, certificates and account controls are available from your account menu.</p><div class="hero-actions"><button class="btn primary" data-action="auth-profile">Account settings</button><button class="btn ghost" data-action="certificates">Certificates</button></div></section>';
  }

  function progress() {
    const total = Math.max(1, allRooms().length);
    const pct = Math.min(100, completedRooms() / total * 100);

    appEl.innerHTML =
      '<div class="section-head"><div><h2>My Progress</h2><p>Private local learning progress on this browser.</p></div><button class="btn ghost" data-action="home">Home</button></div>' +
      '<div class="progress-strip"><div><div class="kicker">Rooms completed</div><div style="margin:10px 0 7px;font-weight:700">' + completedRooms() + ' completed</div><div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div></div>' +
      '<div style="text-align:right"><div style="font-size:26px;font-weight:800">' + state.xp + '</div><div class="kicker">XP</div></div></div>' +
      '<div class="notice" style="margin-top:16px">The interface does not expose the total number of rooms or labs. Progress only shows what you have completed.</div><div class="hero-actions"><button class="btn primary" data-action="badges">View Badges</button><button class="btn ghost" data-action="certificates">Certificates</button></div>';
  }

  function render() {
    save();
    if (view === "paths") paths();
    else if (view === "path") pathView();
    else if (view === "module") {
      if(window.__roomRegistry) moduleView();
      else {
        appEl.innerHTML='<section class="panel" role="status">Loading room details…</section>';
        loadRoomRegistry().then(()=>{if(view==="module") moduleView();}).catch(()=>{if(view==="module") moduleView();});
      }
    }
    else if (view === "room") roomView();
    else if (view === "quiz") quiz();
    else if (view === "quizRun") renderQuiz();
    else if (view === "sources") sources();
    else if (view === "progress") progress();
    else if (view === "profile") profile();
    else home();
  }

  document.addEventListener("click", e => {
    const action = e.target.closest("[data-action]");
    if (action) {
      const x = action.dataset.action;
      if (x === "home") { view = "home"; render(); }
      else if (x === "paths") { view = "paths"; render(); }
      else if (x === "path") { view = "path"; render(); }
      else if (x === "module") { view = "module"; render(); }
      else if (x === "room") { view = "room"; render(); }
      else if (x === "complete") {
        const r = room();
        if (!r) return;
        if (window.DPDP_BADGES?.completeRoom) {
          window.DPDP_BADGES.completeRoom(r.id).then(result => {
            if (!result?.completed) { toastMsg("Room needs at least 70% correct tasks"); return; }
            state.completed[r.id] = true;
            state.xp += 30;
            save();
            toastMsg("Room completed");
            render();
          }).catch(err => toastMsg(err.message || "Room completion failed"));
        } else if (!state.completed[r.id]) {
          state.completed[r.id] = true;
          state.xp += 30;
          save();
          toastMsg("Room marked complete");
          render();
        } else toastMsg("Room already completed");
      }
      else if (x === "continue") {
        const p = DPDP_CURRICULUM.find(p=>(p.modules||[]).flatMap(m=>m.rooms||[]).some(r=>!state.completed[r.id]));
        if(p){pathId=p.id;view="path";render();}
      }
      else if (x === "leaderboard") leaderboard();
      else if (x === "leaderboard-enable") { localStorage.setItem("0x8acure-leaderboard-optin","yes"); leaderboard(); }
      else if (x === "quiz") { navigate("quiz", {pathId:null,moduleId:null,roomId:null}); }
      else if (x === "room-quiz") startRoomQuiz(roomId);
      else if (x === "quizsubmit") quizSubmit();
      else if (x === "quiz-next-room") { quizIndex++; quizFeedback=null; renderQuiz(); }
      else if (x === "quiz-room-retry") { const old=quizAnswerStore(); state.roomQuiz[activeTaskId]={answers:{},results:{},feedback:{},bestScore:Number(old.bestScore||0),index:0}; quizIndex=0; quizFeedback=null; view="quizRun"; render(); }
      else if (x === "quiz-room-reset") { const old=quizAnswerStore(); state.roomQuiz[activeTaskId]={answers:{},results:{},feedback:{},bestScore:Number(old.bestScore||0),index:0}; quizIndex=0; quizFeedback=null; renderQuiz(); }
      else if (x === "sources") { view = "sources"; render(); }
      else if (x === "progress") { navigate("progress"); }
      else if (x === "profile") { navigate("profile"); }
      else if (x === "auth-profile") { document.getElementById("auth-nav")?.click(); }
      else if (x === "badges") { window.DPDP_BADGES?.page(); }
      else if (x === "certificates") { window.DPDP_CERTS?.page(); }
      else if (x === "theme") { state.theme = state.theme === "dark" ? "light" : "dark"; save(); render(); }
    }

    const p = e.target.closest("[data-path]");
    if (p) {
      const idx = DPDP_CURRICULUM.findIndex(x => x.id === p.dataset.path);
      pathId = p.dataset.path;
      moduleId = null;
      roomId = null;
      view = "path";
      render();
    }

    const m = e.target.closest("[data-module]");
    if (m) {
      moduleId = m.dataset.module;
      roomId = null;
      view = "module";
      render();
    }

    const r = e.target.closest("[data-room]");
    if (r) {
      const currentPath = path();
      const ordered = currentPath ? (currentPath.modules || []).flatMap(m => m.rooms || []) : [];
      const roomIndex = ordered.findIndex(x => x.id === r.dataset.room);
      roomId = r.dataset.room;
      const roomModule = (currentPath?.modules || []).find(m => (m.rooms || []).some(x => x.id === roomId));
      moduleId = roomModule?.id || null;
      view = "room";
      render();
    }

    const qr=e.target.closest("[data-quiz-room]");
    if(qr){ startRoomQuiz(qr.dataset.quizRoom); return; }

    const rq=e.target.closest("[data-rq-option]");
    if(rq && view==="quizRun"){ const rs=quizAnswerStore(); rs.answers[String(quizIndex)]=Number(rq.dataset.rqOption); save(); renderQuiz(); return; }

    const rqm=e.target.closest("[data-rq-multi]");
    if(rqm && view==="quizRun"){ const rs=quizAnswerStore(),key=String(quizIndex),cur=Array.isArray(rs.answers[key])?[...rs.answers[key]]:[],v=Number(rqm.dataset.rqMulti); rs.answers[key]=cur.includes(v)?cur.filter(x=>x!==v):[...cur,v]; save(); renderQuiz(); return; }

    const rqo=e.target.closest("[data-rq-order]");
    if(rqo && view==="quizRun"){ const rs=quizAnswerStore(),q=quizTasks[quizIndex],key=String(quizIndex),cur=Array.isArray(rs.answers[key])?[...rs.answers[key]]:Array.from({length:(q.options||[]).length},()=>null); cur[Number(rqo.dataset.rqOrder)]=rqo.value===""?null:Number(rqo.value); rs.answers[key]=cur; save(); renderQuiz(); return; }

    const rqx=e.target.closest("[data-rq-match]");
    if(rqx && view==="quizRun"){ const rs=quizAnswerStore(),q=quizTasks[quizIndex],key=String(quizIndex),cur=Array.isArray(rs.answers[key])?[...rs.answers[key]]:Array.from({length:(q.pairs||[]).length},()=>null); cur[Number(rqx.dataset.rqMatch)]=rqx.value===""?null:Number(rqx.value); rs.answers[key]=cur; save(); renderQuiz(); return; }

    const task = e.target.closest("[data-task]");
    if (task) {
      const feedback = document.getElementById("feedback-" + task.dataset.task);
      if (!feedback) return;
      feedback.hidden = false;
      feedback.textContent = "Checking answer...";
      DPDP_API.request("/api/tasks/" + encodeURIComponent(task.dataset.task) + "/answer", {
        method:"POST", body:JSON.stringify({answer:Number(task.dataset.answer)})
      }).then(result => {
        feedback.textContent = result.correct ? "Correct. " + (result.explanation || "") : "Not correct. " + (result.explanation || "Review the citation.");
        feedback.className = "explain " + (result.correct ? "" : "wrong");
      }).catch(err => { feedback.textContent = err.message; feedback.className="explain wrong"; });
    }

    const taskOpen = e.target.closest("[data-task-open]");
    if (taskOpen) { activeTaskId = taskOpen.dataset.taskOpen; window._selectedAnswer = undefined; render(); return; }

    const answer = e.target.closest("[data-answer-select]");
    if (answer) {
      window._selectedAnswer = Number(answer.dataset.answerSelect);
      document.querySelectorAll("[data-answer-select]").forEach(x=>x.classList.remove("selected"));
      answer.classList.add("selected");
      return;
    }

    const submit = e.target.closest("[data-task-submit]");
    if (submit) { submitTask(submit.dataset.taskSubmit); return; }

    const hint = e.target.closest("[data-hint]");
    if (hint) {
      const fb=document.getElementById("task-feedback");
      if(fb){(window.DPDP_BADGES?.useHint ? window.DPDP_BADGES.useHint(hint.dataset.hint).catch(()=>{}) : Promise.resolve());fb.textContent="Hint: open the cited provision and verify the exact requirement. Cost: 5 points.";fb.className="feedback hint";}
      return;
    }

    const q = e.target.closest("[data-qoption]");
    if (q) {
      quizSelected = Number(q.dataset.qoption);
      renderQuiz();
    }
  });

  function toastMsg(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastMsg.t);
    toastMsg.t = setTimeout(() => t.classList.remove("show"), 2200);
  }

  if(!document.getElementById("room-content-inline-style")){
    const s=document.createElement("style");s.id="room-content-inline-style";s.textContent=".official-text{margin:14px 0;border:1px solid rgba(34,211,238,.35);border-left:4px solid var(--cyan);border-radius:12px;background:rgba(3,10,18,.72);overflow:hidden}.official-label{padding:9px 12px;font:700 11px/1.2 \"JetBrains Mono\",monospace;letter-spacing:.08em;color:var(--cyan);background:rgba(34,211,238,.07)}.official-text pre{margin:0;padding:16px;white-space:pre-wrap;font:500 12px/1.75 \"JetBrains Mono\",monospace;color:var(--text);overflow:auto}.room-objectives{margin:14px 0}.room-objectives ul{margin:10px 0 0 20px}.room-objectives li{margin:6px 0}.term-list{display:flex;gap:9px;flex-wrap:wrap}.term-chip{display:inline-flex;flex-direction:column;gap:4px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--panel2);min-width:150px}.term-chip b{font-size:12px}.term-chip small{color:var(--muted);line-height:1.45}.myth-card{display:grid;grid-template-columns:auto 1fr;gap:5px 12px;padding:12px;border:1px solid var(--line);border-radius:10px;background:var(--panel2);margin:8px 0}.myth-card b{color:var(--cyan);font-size:11px;text-transform:uppercase}.myth-card span{font-size:13px;line-height:1.5}.mini-question{padding:14px;border:1px solid var(--line);border-radius:10px;margin:10px 0;background:var(--panel2)}.mini-question p{margin:8px 0;line-height:1.5}.mini-question ol{margin:8px 0 0 22px}.mini-question li{margin:4px 0}@media(max-width:700px){.official-text pre{font-size:11px}.term-chip{min-width:100%}.myth-card{grid-template-columns:1fr}.room-stats{flex-wrap:wrap}}";document.head.appendChild(s);
  }
  if(!document.querySelector('script[src="badge-ui.js"]')){const s=document.createElement('script');s.src='badge-ui.js';document.body.appendChild(s);}
  window.DPDP_NAVIGATE = target => {
    if(!target||typeof target!=="object") return false;
    if(target.type==="view"){
      if(target.value==="admin"){
        if(window.DPDP_AUTH?.isAdmin) window.DPDP_ADMIN?.open();
        else document.getElementById("auth-nav")?.click();
      }else if(target.value==="badges") window.DPDP_BADGES?.page();
      else if(target.value==="certificates") window.DPDP_CERTS?.page();
      else if(target.value==="leaderboard") leaderboard();
      else if(target.value==="account") document.getElementById("auth-nav")?.click();
      else if(["home","paths","quiz","sources","progress"].includes(target.value)){navigate(target.value, {pathId:null,moduleId:null,roomId:null});}
      else return false;
      return true;
    }
    if(target.type==="path"){
      const p=DPDP_CURRICULUM.find(x=>x.id===target.id);
      if(!p) return false;
      navigate("path",{pathId:p.id,moduleId:null,roomId:null});return true;
    }
    if(target.type==="module"){
      const p=DPDP_CURRICULUM.find(x=>x.id===target.pathId),m=p?.modules?.find(x=>x.id===target.id);
      if(!p||!m) return false;
      navigate("module",{pathId:p.id,moduleId:m.id,roomId:null});return true;
    }
    if(target.type==="room"){
      for(const p of DPDP_CURRICULUM){
        const m=(p.modules||[]).find(x=>(x.rooms||[]).some(r=>r.id===target.id));
        if(m){navigate("room",{pathId:p.id,moduleId:m.id,roomId:target.id});return true;}
      }
    }
    return false;
  };
  render();
})();
