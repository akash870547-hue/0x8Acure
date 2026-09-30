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
    localStorage.setItem(LS, JSON.stringify(state));
    document.documentElement.dataset.theme = state.theme;
    if (streakEl) streakEl.textContent = "";
  };

  const path = () => DPDP_CURRICULUM.find(p => p.id === pathId);
  const mod = () => path()?.modules?.find(m => m.id === moduleId);
  const room = () => mod()?.rooms?.find(r => r.id === roomId);

  const allRooms = () => DPDP_CURRICULUM.flatMap(p => (p.modules || []).flatMap(m => m.rooms || []));
  const completedRooms = () => Object.keys(state.completed).length;
  const pathUnlocked = idx => idx === 0 || DPDP_CURRICULUM.slice(0, idx).every(p => (p.modules || []).flatMap(m => m.rooms || []).every(r => state.completed[r.id]));
  const roomUnlocked = (p, idx) => idx === 0 || (p.modules || []).flatMap(m => m.rooms || []).slice(0, idx).every(r => state.completed[r.id]);

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
      '<div class="progress-strip"><div><div class="kicker">Path progress</div><div style="margin:8px 0">Complete rooms in order to unlock the next one.</div><div class="progress-track"><div class="progress-fill" style="width:' + Math.round(done/Math.max(rooms.length,1)*100) + '%"></div></div></div><div><b>' + done + '</b><div class="kicker">completed</div></div></div>' +
      '<div class="grid room-grid" style="margin-top:16px">' +
      rooms.map((r,i)=>{const unlocked=roomUnlocked(p,i);return '<button class="room-card ' + (state.completed[r.id]?'complete ':'') + (!unlocked?'locked':'') + '" data-room="' + r.id + '"><div class="card-top"><span class="badge">' + String(i+1).padStart(2,'0') + '</span><span class="badge">' + (state.completed[r.id]?'Completed':unlocked?'Room':'Locked') + '</span></div><h3>' + esc(r.title) + '</h3><p>' + esc(r.sections) + '</p><div class="room-meta"><span>' + esc(r.difficulty) + ' · ' + esc(r.estimated_minutes) + ' min</span><span>' + (unlocked?'Open room':'Complete previous') + '</span></div></button>';}).join('') +
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
          const unlocked = roomUnlocked(p, i);
          return '<button class="room-card ' + (state.completed[r.id] ? "complete" : "") + (unlocked ? "" : " locked") + '" data-room="' + r.id + '" data-locked="' + (!unlocked) + '">' +
            '<div class="card-top"><span class="badge">' + String(i + 1).padStart(2,"0") + '</span><span class="badge">' + (state.completed[r.id] ? "Completed" : unlocked ? "Room" : "Locked") + '</span></div>' +
            '<h3>' + esc(r.title) + '</h3><p>' + esc(r.sections) + '</p>' +
            '<div class="room-meta"><span>' + esc(r.sourceIds.join(" + ")) + '</span><span>' + (unlocked ? "Open room" : "Complete previous room") + '</span></div></button>';
        }).join("") +
      '</div>';
  }

  async function roomView() {
    const p = path(), m = mod(), r = room();
    if (!p || !m || !r) { view = "paths"; return render(); }
    const all = (p.modules || []).flatMap(x => x.rooms || []);
    const idx = all.findIndex(x => x.id === r.id);
    if (!roomUnlocked(p, idx)) { toastMsg("Complete the previous room first"); view = "module"; return render(); }
    try {
      const data = await DPDP_API.request("/api/tasks/room/" + encodeURIComponent(r.id));
      const tasks = data.tasks || [];
      if (!activeTaskId || !tasks.some(t=>t.id===activeTaskId)) activeTaskId = tasks[0]?.id;
      const active = tasks.find(t=>t.id===activeTaskId) || tasks[0];
      const done = state.completedTasks || {};
      const completedCount = tasks.filter(t=>done[t.id]).length;
      const roomXp = completedCount * 10;
      const pct = Math.round(completedCount / Math.max(tasks.length,1) * 100);
      appEl.innerHTML =
        '<div class="room-heading"><div><div class="kicker">' + esc(p.name) + ' / ROOM</div><h1>' + esc(r.title) + '</h1><div class="room-stats"><span>' + esc(r.difficulty) + '</span><span>' + esc(r.estimated_minutes) + ' min</span><span>+' + roomXp + ' XP earned</span></div></div><button class="btn ghost" data-action="module">Back</button></div>' +
        '<div class="room-progress"><div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div><span>' + completedCount + '/' + tasks.length + ' tasks</span></div>' +
        '<div class="room-shell"><aside class="task-sidebar"><div class="sidebar-title">TASKS</div>' +
        tasks.map((t,i)=>'<button class="task-nav ' + (t.id===active.id?'active ':'') + (done[t.id]?'done':'') + '" data-task-open="' + esc(t.id) + '"><span class="task-index">' + String(i+1).padStart(2,'0') + '</span><span><b>' + esc(t.type) + '</b><small>' + (done[t.id]?'Completed':'Open') + '</small></span><span>' + (done[t.id]?'✓':'') + '</span></button>').join('') +
        '</aside><section class="room-learning">' +
        '<details class="task-details" open><summary>THEORY <span>Read the cited requirement</span></summary><div class="task-copy"><p>Study the statutory requirement, then distinguish it from operational guidance. Training content is educational and not legal advice.</p><div class="citation-row">' + (r.sourceIds||[]).map(id=>'<a class="citation-chip" target="_blank" rel="noopener" href="' + esc(id==="rules-2025"?DPDP_SOURCE.rules:DPDP_SOURCE.act) + '">' + esc(id) + '</a>').join('') + '<span class="verify-chip">Last verified ' + esc(r.last_verified) + '</span></div></div></details>' +
        '<details class="task-details"><summary>GUIDED SCENARIO <span>Apply the rule</span></summary><div class="task-copy"><p>Review a realistic HR, product, engineering or incident scenario. Identify the facts, locate the exact Act or Rule provision, and apply only what the cited text supports.</p></div></details>' +
        '<details class="task-details" open><summary>CHALLENGE TASKS <span>' + tasks.length + ' tasks</span></summary><div class="task-copy"><p>Choose a task from the sidebar. Answers are checked by the backend.</p></div></details>' +
        '<details class="task-details"><summary>ROOM SUMMARY <span>Learning objectives</span></summary><div class="task-copy"><ul>' + r.learning_objectives.map(x=>'<li>' + esc(x) + '</li>').join('') + '</ul><p><b>Citation:</b> ' + esc(r.sections) + '</p></div></details>' +
        '</section><aside class="challenge-panel"><div class="challenge-top"><span class="badge cyan">CHALLENGE</span><span class="badge">' + esc(active.difficulty) + '</span></div><div class="kicker">TASK</div><h2>' + esc(active.prompt) + '</h2><div class="challenge-options">' +
        (active.options||[]).map((o,j)=>'<button class="option ' + (window._selectedAnswer===j?'selected':'') + '" data-answer-select="' + j + '">' + esc(o) + '</button>').join('') +
        '</div><div class="challenge-actions"><button class="btn primary" data-task-submit="' + esc(active.id) + '">Submit</button><button class="btn ghost" data-hint="' + esc(active.id) + '">Hint · 5 pts</button></div><div class="feedback" id="task-feedback"></div><div class="citation-box"><b>Citation</b><span>' + esc(active.citation.reference) + '</span><a target="_blank" rel="noopener" href="' + esc(active.citation.source_id==="rules-2025"?DPDP_SOURCE.rules:DPDP_SOURCE.act) + '">Open official source</a></div></aside></div>';
    } catch (err) {
      appEl.innerHTML='<div class="notice"><b>Room unavailable.</b><br>' + esc(err.message) + '</div>';
    }
  }

  async function submitTask(id) {
    const answer = window._selectedAnswer;
    if (answer === undefined) { toastMsg("Choose an answer first"); return; }
    try {
      const result = await DPDP_API.request("/api/tasks/" + encodeURIComponent(id) + "/answer", {method:"POST",body:JSON.stringify({answer})});
      state.completedTasks = state.completedTasks || {};
      const wasDone = !!state.completedTasks[id];
      state.completedTasks[id] = !!result.correct;
      if (result.correct && !wasDone) state.xp += Number(result.points || 10);
      save();
      const fb=document.getElementById("task-feedback");
      if(fb){fb.textContent=(result.correct?"Correct. ":"Not correct. ") + (result.explanation||"");fb.className="feedback " + (result.correct?"success":"error");}
      setTimeout(render,700);
    } catch(e) { toastMsg(e.message); }
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
      const result = await DPDP_API.request("/api/tasks/" + encodeURIComponent(q.id) + "/answer", {
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
      '<div class="notice" style="margin-top:16px">The interface does not expose the total number of rooms or labs. Progress only shows what you have completed.</div>';
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
        if (r && !state.completed[r.id]) {
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
      else if (x === "theme") { state.theme = state.theme === "dark" ? "light" : "dark"; save(); render(); }
    }

    const p = e.target.closest("[data-path]");
    if (p) {
      const idx = DPDP_CURRICULUM.findIndex(x => x.id === p.dataset.path);
      if (!pathUnlocked(idx)) { toastMsg("Unlock the previous learning path first"); return; }
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
      if (!roomUnlocked(currentPath, roomIndex)) { toastMsg("Complete the previous room first"); return; }
      roomId = r.dataset.room;
      view = "room";
      render();
    }

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
      if(fb){fb.textContent="Hint: open the cited provision and verify the exact requirement. Cost: 5 points.";fb.className="feedback hint";}
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

  render();
})();