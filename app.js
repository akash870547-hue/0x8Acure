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

  const allRooms = () => DPDP_CURRICULUM.flatMap(p => (p.modules || []).flatMap(m => m.rooms || []));
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
            '<div class="card-top"><span class="badge">' + String(i + 1).padStart(2,"0") + '</span><span class="badge">' + (state.completed[r.id] ? "Completed" : unlocked ? "Room" : "Locked") + '</span></div>' +
            '<h3>' + esc(r.title) + '</h3><p>' + esc(r.sections) + '</p>' +
            '<div class="room-meta"><span>' + esc(r.sourceIds.join(" + ")) + '</span><span>' + (unlocked ? "Open room" : "Open room") + '</span></div></button>';
        }).join("") +
      '</div>';
  }


  async function roomView(){
    const p=path(),m=mod(),r=room(); if(!p||!m||!r){view="paths";return render();}
    try{
      const reg=await fetch("content/legal-room-content.json",{cache:"no-store"}).then(x=>x.json());
      const legal=(reg.rooms||[]).find(x=>x.id===r.id); if(!legal) throw new Error("Room content unavailable.");
      window.__roomRegistry=reg;
      const meta=roomQuizMeta(legal), qs=meta.all, rs=meta.rs;
      const idx=Math.min(Number(rs.index||0),Math.max(qs.length-1,0)), q=qs[idx], key=String(idx);
      const status=legal.official_text_status==="VERIFIED_WORD_FOR_WORD"?"VERIFIED":"Draft, under verification";
      const selected=rs.answers?.[key];
      const opts=(q.options||[]).map((o,i)=>'<button class="option '+(Number(selected)===i?"selected":"")+'" data-rq-option="'+i+'">'+esc(o)+'</button>').join("");
      const feedback=rs.feedback?.[key];
      appEl.innerHTML='<div class="room-heading"><div><div class="kicker">'+esc(p.name)+' / ROOM</div><h1>'+esc(legal.title)+'</h1><div class="room-stats"><span>'+esc(legal.difficulty)+'</span><span>'+esc(legal.estimated_minutes)+' min</span><span>'+status+'</span><span>Best: '+Number(rs.bestScore||0)+'%</span></div></div><button class="btn ghost" data-action="module">Back</button></div>'+
      (status!=="VERIFIED"?'<div class="notice warning"><b>Draft, under verification</b><br>This room remains open while its official text is verified.</div>':'')+
      '<div class="panel room-objectives"><div class="kicker">LEARNING OBJECTIVES</div><ul>'+legal.learning_objectives.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul><p><b>Sections:</b> '+esc(legal.sections_covered.join(", "))+'</p></div>'+
      '<div class="room-progress"><div class="progress-track"><div class="progress-fill" style="width:'+meta.score+'%"></div></div><span>'+meta.answered+'/'+qs.length+' questions · '+meta.score+'%</span></div>'+
      '<div class="room-shell"><section class="room-learning">'+
      '<details class="task-details" open><summary>A. OFFICIAL TEXT</summary><div class="task-copy">'+(q.official_text||[]).map(x=>'<div class="official-text"><pre>'+esc(x)+'</pre></div>').join("")+'</div></details>'+
      '<details class="task-details" open><summary>QUESTION '+(idx+1)+' / '+qs.length+' · '+esc(q.type)+'</summary><div class="task-copy"><h2>'+esc(q.prompt)+'</h2><div class="challenge-options">'+opts+'</div>'+
      (feedback?'<div class="feedback '+(feedback.correct?"success":"error")+'"><b>'+(feedback.correct?"Correct":"Incorrect")+'</b><br>'+esc(feedback.explanation||"")+'<br><br><b>Wrong-option reasons:</b><br>'+esc(feedback.wrongReasons||"")+'</div>':'')+
      '</div></details><details class="task-details"><summary>SUMMARY / CHEAT-SHEET</summary><div class="task-copy"><p>'+esc(legal.summary)+'</p><ul>'+legal.cheat_sheet.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul></div></details>'+
      '<details class="task-details"><summary>FINAL CHALLENGE</summary><div class="task-copy"><p>'+esc(legal.final_challenge.scenario)+'</p><code>'+esc(legal.final_challenge.flag)+'</code></div></details>'+
      '</section><aside class="challenge-panel"><button class="btn primary" data-rq-submit="'+key+'">Submit answer</button><button class="btn ghost" data-rq-next>Next unanswered</button><button class="btn ghost" data-rq-retry>Retry</button>'+
      '<div class="score-card"><b>Current score: '+meta.score+'%</b><span>Best score: '+Number(rs.bestScore||0)+'% · Pass mark: 70%</span></div>'+
      (meta.answered===qs.length?(meta.score>=70?'<button class="btn primary" data-action="complete">Complete room</button>':'<div class="notice">Not passed. Retry allowed.</div>'):'')+
      '</aside></div>';
    }catch(e){appEl.innerHTML='<div class="notice"><b>Room unavailable.</b><br>'+esc(e.message)+'</div>';}
  }

  function submitRoomAnswer(index){
    const legal=(window.__roomRegistry.rooms||[]).find(x=>x.id===roomId), q=legal.tasks.flatMap(t=>t.questions||[])[Number(index)], rs=roomQuizMeta(legal).rs;
    const raw=rs.answers[String(index)]; if(raw===undefined){toastMsg("Choose an answer first");return;}
    const expected=q.answer??q.correct_answer, ok=JSON.stringify(raw)===JSON.stringify(expected);
    rs.results[String(index)]=ok; rs.feedback||(rs.feedback={});
    let wrong="";
    if(Array.isArray(q.options)) wrong=q.options.map((x,i)=>i===Number(expected)?"":(q.why_wrong?.[i]||"")).filter(Boolean).join(" ");
    rs.feedback[String(index)]={correct:ok,explanation:ok?q.why:(q.why_wrong?.[Number(raw)]||"Review the cited provision."),wrongReasons:wrong};
    const total=legal.tasks.reduce((n,t)=>n+(t.questions||[]).length,0),correct=Object.values(rs.results).filter(Boolean).length;
    rs.bestScore=Math.max(Number(rs.bestScore||0),Math.round(correct/total*100)); save(); render();
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

  async function quizStart() {
    quizIndex = 0;
    quizSelected = null;
    quizFeedback = null;
    state.quizScore = 0;
    state.quizDone = false;
    try {
      const data = await DPDP_API.request("/api/tasks/quiz");
      if (!data || !Array.isArray(data.tasks)) {
        appEl.innerHTML = '<div class="notice"><b>Quiz unavailable.</b><br>The assessment requires the platform backend so correct answers stay server-side.</div>';
        return;
      }
      quizTasks = data.tasks;
      view = "quizRun";
      renderQuiz();
    } catch (err) {
      appEl.innerHTML = '<div class="notice"><b>Quiz unavailable.</b><br>' + esc(err.message) + '</div>';
    }
  }

  function renderQuiz() {
    const q = quizTasks[quizIndex];
    if (!q) return quizResult();

    const opts = (q.options || []).map((x, i) =>
      '<button class="option ' + (quizSelected === i ? "selected" : "") + '" data-qoption="' + i + '">' +
      '<input type="radio" ' + (quizSelected === i ? "checked" : "") + '><span>' + esc(x) + '</span></button>'
    ).join("");

    appEl.innerHTML =
      '<div class="section-head"><div><span class="badge amber">ASSESSMENT</span><h2 style="margin-top:12px">DPDP Knowledge Check</h2><p>Correct answers are validated on the server.</p></div><button class="btn ghost" data-action="home">Exit</button></div>' +
      '<div class="room-layout"><section class="panel"><div class="kicker">Question ' + (quizIndex + 1) + '</div>' +
      '<div class="question">' + esc(q.prompt) + '</div><div class="options">' + opts + '</div>' +
      '<div class="challenge-actions"><button class="btn primary" data-action="quizsubmit">Submit answer</button></div>' +
      (quizFeedback ? '<div class="explain ' + (quizFeedback.ok ? "" : "wrong") + '">' + esc(quizFeedback.text) + '</div>' : "") +
      '</section><aside class="challenge-card"><div class="challenge-num">ASSESSMENT</div><p class="muted">Every task has a required legal citation.</p><button class="btn ghost" data-action="sources">Official Sources</button></aside></div>';
  }

  async function quizSubmit() {
    const q = quizTasks[quizIndex];
    if (!q) return;
    if (quizSelected === null) {
      quizFeedback = {ok:false, text:"Select an answer first."};
      return renderQuiz();
    }
    try {
      const result = window.DPDP_BADGES?.submitTask
        ? await window.DPDP_BADGES.submitTask(q.id, quizSelected)
        : await DPDP_API.request("/api/tasks/" + encodeURIComponent(q.id) + "/answer", {
          method:"POST",
          body:JSON.stringify({answer:quizSelected})
        });
      const ok = !!result.correct;
      if (ok) {
        state.quizScore++;
        state.xp += Number(result.points || 0);
        quizFeedback = {ok:true, text:"Correct. " + (result.explanation || "")};
      } else {
        quizFeedback = {ok:false, text:"Not correct. " + (result.explanation || "Review the cited room.")};
      }
      save();
      renderQuiz();
      setTimeout(() => {
        quizIndex++;
        quizSelected = null;
        quizFeedback = null;
        if (quizIndex >= quizTasks.length) {
          state.quizDone = true;
          save();
          quizResult();
        } else {
          renderQuiz();
        }
      }, 700);
    } catch (err) {
      quizFeedback = {ok:false, text:err.message};
      renderQuiz();
    }
  }

  function quizResult() {
    appEl.innerHTML =
      '<section class="hero"><div class="hero-main"><div class="eyebrow">Assessment complete</div><h1>Knowledge check finished.</h1>' +
      '<p>Correct answers were validated by the backend.</p><div class="hero-actions"><button class="btn primary" data-action="quiz">Retake quiz</button><button class="btn ghost" data-action="paths">Explore paths</button></div></div>' +
      '<aside class="hero-side"><div class="stat"><b>' + state.quizScore + '</b><span>Correct answers</span></div><div class="stat"><b>' + state.xp + ' XP</b><span>Total learning XP</span></div></aside></section>';
  }

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
    else if (view === "module") moduleView();
    else if (view === "room") roomView();
    else if (view === "quizRun") renderQuiz();
    else if (view === "sources") sources();
    else if (view === "progress") progress();
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
      else if (x === "quiz") quizStart();
      else if (x === "quizsubmit") quizSubmit();
      else if (x === "sources") { view = "sources"; render(); }
      else if (x === "progress") { view = "progress"; render(); }
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

    const rq=e.target.closest("[data-rq-option]");
    if(rq){const legal=(window.__roomRegistry.rooms||[]).find(x=>x.id===roomId),rs=roomQuizMeta(legal).rs;rs.answers[String(rs.index||0)]=Number(rq.dataset.rqOption);save();render();return;}
    const rqs=e.target.closest("[data-rq-submit]");
    if(rqs){submitRoomAnswer(rqs.dataset.rqSubmit);return;}
    const rqn=e.target.closest("[data-rq-next]");
    if(rqn){const legal=(window.__roomRegistry.rooms||[]).find(x=>x.id===roomId),rs=roomQuizMeta(legal).rs,keys=Array.from({length:roomQuizMeta(legal).all.length},(_,i)=>String(i)),n=keys.findIndex(k=>rs.results?.[k]===undefined);rs.index=n<0?0:n;save();render();return;}
    const rqr=e.target.closest("[data-rq-retry]");
    if(rqr){const legal=(window.__roomRegistry.rooms||[]).find(x=>x.id===roomId),old=roomQuizMeta(legal).rs;state.roomQuiz[roomId]={answers:{},results:{},feedback:{},bestScore:old.bestScore||0,index:0};save();render();return;}

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

  // Room quiz state is persisted locally until Supabase migration.
  const roomQuizState=()=>state.roomQuiz||(state.roomQuiz={});

  function roomQuizMeta(roomData){
    const all=(roomData.tasks||[]).flatMap(t=>t.questions||[]);
    const rs=state.roomQuiz?.[roomData.id]||{answers:{},results:{},bestScore:0};
    const answered=Object.keys(rs.results||{}).length;
    const correct=Object.values(rs.results||{}).filter(Boolean).length;
    return {all,rs,answered,correct,score:answered?Math.round(correct/all.length*100):0};
  }

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
  if(!document.getElementById("academy-footer")){const f=document.createElement("footer");f.id="academy-footer";f.textContent="Educational use. Not legal advice. Refer to the official gazette.";f.style.cssText="padding:20px;text-align:center;color:var(--muted);font-size:12px;border-top:1px solid var(--line);margin-top:28px";document.body.appendChild(f);}
  if(!document.querySelector('script[src="badge-ui.js"]')){const s=document.createElement('script');s.src='badge-ui.js';document.body.appendChild(s);}
  render();
})();