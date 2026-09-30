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

  function home() {
    appEl.innerHTML =
      '<section class="hero">' +
        '<div class="hero-main">' +
          '<div class="eyebrow">0x8Acure · DPDP Learning Platform</div>' +
          '<h1>Train on India’s digital data protection framework.</h1>' +
          '<p>Learn the DPDP Act, 2023 and notified DPDP Rules, 2025 through guided paths, modules and hands-on rooms.</p>' +
          topActions() +
          '<div class="legal">Primary-source curriculum: ' +
            sourceLink("MeitY DPDP Act 2023", DPDP_SOURCE.act) + ' · ' +
            sourceLink("MeitY DPDP Rules 2025", DPDP_SOURCE.rules) +
            '. Training content is educational and not legal advice.</div>' +
        '</div>' +
        '<aside class="hero-side">' +
          '<div class="stat"><b>Continue learning</b><span>Choose a path and work through its modules and rooms.</span></div>' +
          '<div class="stat"><b>' + state.xp + ' XP</b><span>Learning progress</span></div>' +
          '<div class="stat"><b>Official-source first</b><span>Government material is the source of truth.</span></div>' +
          '<div class="notice">Path → Module → Room. The platform intentionally does not expose total room or lab counts.</div>' +
        '</aside>' +
      '</section>' +
      '<div class="section-head"><div><h2>Learning Paths</h2><p>Choose where you want to start.</p></div></div>' +
      '<div class="grid path-grid">' +
        DPDP_CURRICULUM.map(p =>
          '<button class="path-card" data-path="' + p.id + '">' +
            '<div class="card-top"><span class="badge cyan">' + esc(p.level) + '</span><span class="badge">' + esc(p.tag) + '</span></div>' +
            '<h3>' + esc(p.name) + '</h3>' +
            '<p>' + esc(p.description) + '</p>' +
            '<div class="path-meta"><span>Open path</span><span>Modules inside</span></div>' +
          '</button>'
        ).join("") +
      '</div>';
  }

  function paths() {
    appEl.innerHTML =
      '<div class="section-head"><div><h2>Learning Paths</h2><p>Three paths. Pick one and enter its modules.</p></div><button class="btn ghost" data-action="home">Home</button></div>' +
      '<div class="grid path-grid">' +
        DPDP_CURRICULUM.map(p =>
          '<button class="path-card" data-path="' + p.id + '">' +
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

    appEl.innerHTML =
      '<div class="section-head">' +
        '<div><span class="badge cyan">' + esc(p.level) + ' · ' + esc(p.tag) + '</span>' +
        '<h2 style="margin-top:12px">' + esc(p.name) + '</h2>' +
        '<p>' + esc(p.description) + '</p></div>' +
        '<button class="btn ghost" data-action="paths">All paths</button>' +
      '</div>' +
      '<div class="panel path-intro"><div class="notice">Choose a module. Inside each module you will find individual rooms/labs. Complete rooms to build XP and progress.</div></div>' +
      '<div class="grid path-grid" style="margin-top:16px">' +
        p.modules.map((m, i) =>
          '<button class="path-card" data-module="' + m.id + '">' +
            '<div class="card-top"><span class="badge cyan">MODULE ' + String(i + 1).padStart(2,"0") + '</span><span class="badge">' + esc(m.tag) + '</span></div>' +
            '<h3>' + esc(m.name) + '</h3>' +
            '<p>' + esc(m.description) + '</p>' +
            '<div class="path-meta"><span>Enter module</span><span>Rooms inside</span></div>' +
          '</button>'
        ).join("") +
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
        m.rooms.map((r, i) =>
          '<button class="room-card ' + (state.completed[r.id] ? "complete" : "") + '" data-room="' + r.id + '">' +
            '<div class="card-top"><span class="badge">' + String(i + 1).padStart(2,"0") + '</span><span class="badge">' + (state.completed[r.id] ? "Completed" : "Room") + '</span></div>' +
            '<h3>' + esc(r.title) + '</h3>' +
            '<p>' + esc(r.sections) + '</p>' +
            '<div class="room-meta"><span>' + esc(r.source || "Official source") + '</span><span>Open room</span></div>' +
          '</button>'
        ).join("") +
      '</div>';
  }

  function roomView() {
    const p = path();
    const m = mod();
    const r = room();
    if (!p || !m || !r) { view = "paths"; return render(); }

    appEl.innerHTML =
      '<div class="room-top">' +
        '<div><div class="kicker">' + esc(p.name) + ' / ' + esc(m.name) + '</div>' +
        '<h1>' + esc(r.title) + '</h1><p>' + esc(m.description) + '</p></div>' +
        '<span class="badge cyan">ROOM</span>' +
      '</div>' +
      '<div class="room-layout" style="margin-top:18px">' +
        '<section class="panel room-theory">' +
          '<div class="notice">Source of truth: ' + esc(r.source || "Government source") + '</div>' +
          '<div class="theory-block"><div class="kicker">Room objective</div>' +
            (r.body || []).map(x => '<p>' + esc(x) + '</p>').join("") +
          '</div>' +
          '<div class="theory-block"><div class="kicker">Official source</div><p>' +
            sourceLink("Open official MeitY source", sourceUrl(r)) +
          '</p></div>' +
          '<div class="hero-actions">' +
            '<button class="btn primary" data-action="complete">' + (state.completed[r.id] ? "Completed" : "Mark room complete") + '</button>' +
            '<button class="btn ghost" data-action="module">Back to module</button>' +
          '</div>' +
        '</section>' +
        '<aside class="challenge-card">' +
          '<div class="challenge-head"><div class="challenge-num">ROOM</div><span class="badge">Hands-on learning</span></div>' +
          '<div class="question">Study the source, understand the requirement, then use the separate Quiz section to test yourself.</div>' +
          '<button class="btn violet" style="width:100%" data-action="quiz">Open Quiz</button>' +
          '<div class="hint-box">Tip: distinguish the exact statutory requirement from operational guidance.</div>' +
        '</aside>' +
      '</div>';
  }

  function quizStart() {
    quizIndex = 0;
    quizSelected = null;
    quizFeedback = null;
    state.quizScore = 0;
    state.quizDone = false;
    save();
    view = "quizRun";
    renderQuiz();
  }

  function renderQuiz() {
    const q = DPDP_QUIZ[quizIndex];
    if (!q) return quizResult();

    const opts = q.o.map((x, i) =>
      '<button class="option ' + (quizSelected === i ? "selected" : "") + '" data-qoption="' + i + '">' +
        '<input type="radio" ' + (quizSelected === i ? "checked" : "") + '><span>' + esc(x) + '</span>' +
      '</button>'
    ).join("");

    appEl.innerHTML =
      '<div class="section-head"><div><span class="badge amber">ASSESSMENT</span><h2 style="margin-top:12px">DPDP Knowledge Check</h2><p>Standalone quiz area based on the official-source curriculum.</p></div><button class="btn ghost" data-action="home">Exit</button></div>' +
      '<div class="room-layout"><section class="panel">' +
        '<div class="kicker">Question ' + (quizIndex + 1) + '</div>' +
        '<div class="question">' + esc(q.q) + '</div>' +
        '<div class="options">' + opts + '</div>' +
        '<div class="challenge-actions"><button class="btn primary" data-action="quizsubmit">Submit answer</button></div>' +
        (quizFeedback ? '<div class="explain ' + (quizFeedback.ok ? "" : "wrong") + '">' + esc(quizFeedback.text) + '</div>' : "") +
      '</section><aside class="challenge-card"><div class="challenge-num">ASSESSMENT</div><p class="muted">Review the cited Act or Rules room if you need a refresher.</p><button class="btn ghost" data-action="sources">Official Sources</button></aside></div>';
  }

  function quizSubmit() {
    const q = DPDP_QUIZ[quizIndex];
    if (quizSelected === null) {
      quizFeedback = {ok:false, text:"Select an answer first."};
      return renderQuiz();
    }

    const ok = quizSelected === q.a;
    if (ok) {
      state.quizScore++;
      state.xp += 20;
      quizFeedback = {ok:true, text:"Correct. Good work."};
    } else {
      quizFeedback = {ok:false, text:"Not correct. Review the cited Act or Rules room."};
    }
    save();
    renderQuiz();

    if (ok) {
      setTimeout(() => {
        quizIndex++;
        quizSelected = null;
        quizFeedback = null;
        if (quizIndex >= DPDP_QUIZ.length) {
          state.quizDone = true;
          save();
          quizResult();
        } else {
          renderQuiz();
        }
      }, 500);
    }
  }

  function quizResult() {
    appEl.innerHTML =
      '<section class="hero"><div class="hero-main">' +
        '<div class="eyebrow">Assessment complete</div>' +
        '<h1>Knowledge check finished.</h1>' +
        '<p>Your score is stored locally on this browser. Revisit any path to strengthen weak areas.</p>' +
        '<div class="hero-actions"><button class="btn primary" data-action="quiz">Retake quiz</button><button class="btn ghost" data-action="paths">Explore paths</button></div>' +
      '</div><aside class="hero-side"><div class="stat"><b>' + state.quizScore + '</b><span>Correct answers</span></div><div class="stat"><b>' + state.xp + ' XP</b><span>Total learning XP</span></div></aside></section>';
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
      else if (x === "quiz") quizStart();
      else if (x === "quizsubmit") quizSubmit();
      else if (x === "sources") { view = "sources"; render(); }
      else if (x === "progress") { view = "progress"; render(); }
      else if (x === "theme") { state.theme = state.theme === "dark" ? "light" : "dark"; save(); render(); }
    }

    const p = e.target.closest("[data-path]");
    if (p) {
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
      roomId = r.dataset.room;
      view = "room";
      render();
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