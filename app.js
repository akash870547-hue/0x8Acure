(() => {
  const API = window.DPDP_API;
  const LS = "dpdp-ctf-local-v2";
  const saved = JSON.parse(localStorage.getItem(LS) || "{}");
  const state = Object.assign({ xp: 0, streak: 0, lastPlayed: null, completed: {}, hints: {}, theme: "dark" }, saved);
  let view = "home";
  let roomId = null;
  let taskIndex = 0;
  let selected = null;
  let feedback = null;

  const app = document.getElementById("app");
  const toast = document.getElementById("toast");
  const streakEl = document.getElementById("streakCount");

  function esc(v) {
    return String(v).replace(/[&<>"']/g, function(c) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c];
    });
  }
  function save() {
    localStorage.setItem(LS, JSON.stringify(state));
    document.documentElement.dataset.theme = state.theme;
    streakEl.textContent = String(state.streak || 0);
  }
  function toastMsg(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastMsg.t);
    toastMsg.t = setTimeout(function() { toast.classList.remove("show"); }, 2200);
  }
  function allRooms() {
    return DPDP_ROOMS.flatMap(function(p) {
      return p.rooms.map(function(r) {
        return Object.assign({}, r, { pathName: p.name, accent: p.accent, path: p.path });
      });
    });
  }
  function room(id) { return allRooms().find(function(r) { return r.id === id; }); }
  function completedCount() { return allRooms().filter(function(r){return state.completed[r.id];}).length; }
  function totalRooms() { return allRooms().length; }
  function bumpStreak() {
    const today = new Date().toISOString().slice(0,10);
    if (state.lastPlayed === today) return;
    if (!state.lastPlayed) state.streak = 1;
    else {
      const prev = new Date(state.lastPlayed + "T00:00:00");
      const now = new Date(today + "T00:00:00");
      state.streak = Math.round((now - prev) / 86400000) === 1 ? (state.streak || 0) + 1 : 1;
    }
    state.lastPlayed = today;
    save();
  }
  function nav() {
    return '<div class="hero-actions">' +
      '<button class="btn primary" data-action="paths">Learning Paths</button>' +
      '<button class="btn ghost" data-action="progress">Progress</button>' +
      '<button class="btn ghost" data-action="leaderboard">Leaderboard</button>' +
      '<button class="btn ghost" data-action="account">' + (API.token ? "Account" : "Sign in") + '</button>' +
      '</div>';
  }
  function home() {
    app.innerHTML =
      '<section class="hero">' +
      '<div class="hero-main"><div class="eyebrow">0x8Acure · DPDP Compliance CTF</div>' +
      '<h1>Learn DPDP by solving real scenarios.</h1>' +
      '<p>Practice roles, consent, rights, minimization, security controls, incident handling, governance and penalty analysis through short challenge rooms.</p>' +
      nav() +
      '<div class="legal">Training only, not legal advice. Primary source links: <a target="_blank" rel="noopener" href="https://www.meity.gov.in/writereaddata/files/Digital%20Personal%20Data%20Protection%20Act%202023.pdf">DPDP Act 2023</a> and <a target="_blank" rel="noopener" href="https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digital-Personal-Data-Protection-Rules-2025">DPDP Rules 2025</a>.</div></div>' +
      '<aside class="hero-side">' +
      '<div class="stat"><b>' + completedCount() + " / " + totalRooms() + '</b><span>Rooms completed</span></div>' +
      '<div class="stat"><b>' + state.xp + '</b><span>Local XP</span></div>' +
      '<div class="stat"><b>' + Math.round(completedCount() / totalRooms() * 100) + '%</b><span>Overall progress</span></div>' +
      '<div class="notice">Backend mode is optional. Enable the API base to persist learner activity and use HR controls.</div>' +
      '</aside></section>';
  }
  function paths() {
    app.innerHTML = '<div class="section-head"><div><h2>Learning Paths</h2><p>Three tracks, nine scenario rooms.</p></div><button class="btn ghost" data-action="home">Home</button></div>' +
      DPDP_ROOMS.map(function(p) {
        return '<section class="panel" style="margin:14px 0"><div class="section-head" style="margin-top:0"><div><span class="badge ' + p.accent + '">' + p.level + " · " + esc(p.difficulty) + '</span><h2 style="margin-top:12px">' + esc(p.name) + '</h2><p>' + esc(p.audience) + '</p></div><div class="badge">' + p.rooms.filter(function(r){return state.completed[r.id];}).length + "/" + p.rooms.length + ' complete</div></div>' +
        '<p class="muted">' + esc(p.description) + '</p><div class="grid room-grid">' +
        p.rooms.map(function(r) {
          return '<button class="room-card ' + (state.completed[r.id] ? "complete" : "") + '" data-room="' + r.id + '"><div class="card-top"><span class="badge ' + p.accent + '">' + r.code + '</span><span class="badge">' + (state.completed[r.id] ? "Complete" : r.type) + '</span></div><h3>' + esc(r.title) + '</h3><p>' + esc(r.description) + '</p><div class="room-meta"><span>' + r.xp + " XP</span><span>" + r.tasks.length + " challenges</span></div></button>";
        }).join("") + '</div></section>';
      }).join("");
  }
  function renderRoom() {
    const r = room(roomId);
    const t = r.tasks[taskIndex];
    if (!r || !t) { view = "paths"; render(); return; }
    const opts = t.type === "mcq" ? '<div class="options">' + t.options.map(function(o,i) {
      return '<button class="option ' + (selected === i ? "selected" : "") + '" data-option="' + i + '"><input type="radio" ' + (selected === i ? "checked" : "") + '><span>' + esc(o) + '</span></button>';
    }).join("") + '</div>' : '<input id="flagInput" class="flag-input" placeholder="flag{...} or answer" autocomplete="off">';
    app.innerHTML =
      '<div class="room-top"><div><div class="kicker">' + r.code + " · " + esc(r.pathName) + '</div><h1>' + esc(r.title) + '</h1><p>' + esc(r.description) + '</p></div><div class="badge ' + r.accent + '">' + (taskIndex + 1) + "/" + r.tasks.length + '</div></div>' +
      '<div class="room-layout" style="margin-top:18px"><section class="panel room-theory"><div class="notice">Mission: understand the scenario, choose the correct compliance outcome and capture the concept.</div>' +
      '<div class="theory-block"><div class="kicker">Mission Brief</div>' + r.theory.map(function(x){return "<p>" + esc(x) + "</p>";}).join("") + '</div>' +
      '<div class="theory-block"><div class="kicker">Objectives</div><ul><li>Identify the correct role or control.</li><li>Reason from the scenario.</li><li>Submit the exact concept requested.</li></ul></div></section>' +
      '<aside class="challenge-card"><div class="challenge-head"><div class="challenge-num">CHALLENGE ' + (taskIndex+1) + '</div><span class="badge">+' + t.xp + ' XP</span></div>' +
      '<div class="question">' + esc(t.q) + '</div>' + opts +
      '<div class="challenge-actions"><button class="btn ghost" data-action="hint">Hint</button><button class="btn primary" data-action="submit">Submit</button></div>' +
      (state.hints[r.id + ":" + taskIndex] ? '<div class="hint-box">Use the exact role, principle or control named by the scenario.</div>' : '') +
      (feedback ? '<div class="explain ' + (feedback.ok ? "" : "wrong") + '"><b>' + (feedback.ok ? "Accepted" : "Not yet") + '</b><br>' + esc(feedback.text) + '</div>' : '') +
      '</aside></div>';
  }
  async function syncAttempt(ok, xp) {
    if (!API.base || !API.token) return;
    try {
      await API.request("/api/progress/attempt", {method:"POST", body:JSON.stringify({roomId:roomId, challengeIndex:taskIndex, correct:ok, xp:xp})});
    } catch (e) { toastMsg(e.message); }
  }
  async function syncComplete(r) {
    if (!API.base || !API.token) return;
    try {
      await API.request("/api/progress/complete-room", {method:"POST", body:JSON.stringify({roomId:r.id, xp:r.xp})});
    } catch (e) { toastMsg(e.message); }
  }
  async function submit() {
    const r = room(roomId);
    const t = r.tasks[taskIndex];
    let ok = false;
    if (t.type === "mcq") ok = selected === t.answer;
    else {
      const el = document.getElementById("flagInput");
      const raw = (el ? el.value : "").trim().toLowerCase().replace(/^flag\{|\}$/g, "");
      ok = raw === t.answer.toLowerCase();
    }
    bumpStreak();
    const key = r.id + ":" + taskIndex;
    const earned = ok ? Math.max(0, t.xp - (state.hints[key] ? 10 : 0)) : 0;
    if (ok && !state.completed[key]) state.xp += earned;
    feedback = {ok: ok, text: ok ? t.explanation : "Review the scenario and try again."};
    if (ok) {
      state.completed[key] = true;
      const done = r.tasks.every(function(_, i){ return state.completed[r.id + ":" + i]; });
      if (done) { state.completed[r.id] = true; await syncComplete(r); toastMsg("Room completed"); }
      else toastMsg("Correct, +" + earned + " XP");
      save();
      await syncAttempt(true, earned);
      if (!done) {
        setTimeout(function(){ taskIndex += 1; selected = null; feedback = null; renderRoom(); }, 650);
        return;
      }
    } else {
      await syncAttempt(false, 0);
    }
    renderRoom();
  }
  async function progress() {
    if (API.base && API.token) {
      try {
        const remote = await API.request("/api/progress");
        (remote.rows || []).forEach(function(x){ if(x.completed) state.completed[x.room_id] = true; });
        state.xp = Math.max(state.xp, Number(remote.totals && remote.totals.xp || 0));
        save();
      } catch (e) {}
    }
    view = "progress";
    render();
  }
  async function leaderboard() {
    let rows = [];
    if (API.base) { try { rows = (await API.request("/api/leaderboard")).rows || []; } catch (e) {} }
    if (!rows.length) rows = [{name:"Local player", xp:state.xp, completed_rooms:completedCount()}];
    app.innerHTML = '<div class="section-head"><div><h2>Leaderboard</h2><p>' + (API.base ? "Backend leaderboard" : "Local fallback") + '</p></div><button class="btn ghost" data-action="home">Home</button></div><div class="panel table-wrap"><table class="score-table"><thead><tr><th>#</th><th>Player</th><th>XP</th><th>Rooms</th></tr></thead><tbody>' +
      rows.map(function(x,i){return '<tr><td>'+(i+1)+'</td><td>'+esc(x.name||"Player")+'</td><td>'+Number(x.xp||0)+'</td><td>'+Number(x.completed_rooms||0)+'</td></tr>';}).join("") + '</tbody></table></div>';
  }
  function progressView() {
    const pct = Math.round(completedCount()/totalRooms()*100);
    app.innerHTML = '<div class="section-head"><div><h2>Your Progress</h2><p>Track rooms, XP and completion.</p></div><button class="btn ghost" data-action="home">Home</button></div>' +
      '<div class="progress-strip"><div><div class="kicker">Completion</div><div style="margin:10px 0 7px;font-weight:700">' + completedCount() + " of " + totalRooms() + ' rooms</div><div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div></div><div style="text-align:right"><div style="font-size:26px;font-weight:800">' + state.xp + '</div><div class="kicker">XP</div></div></div>' +
      '<div class="grid room-grid" style="margin-top:16px">' + allRooms().map(function(r){return '<button class="room-card ' + (state.completed[r.id] ? "complete" : "") + '" data-room="' + r.id + '"><div class="card-top"><span class="badge '+r.accent+'">'+r.code+'</span><span class="badge">'+(state.completed[r.id]?"Complete":"Play")+'</span></div><h3>'+esc(r.title)+'</h3><p>'+esc(r.description)+'</p></button>';}).join("") + '</div>';
  }
  function account() {
    if (!API.base) {
      app.innerHTML = '<div class="section-head"><div><h2>Account</h2><p>Set an API base URL in local storage to enable server-backed authentication.</p></div><button class="btn ghost" data-action="home">Home</button></div><div class="panel"><p class="muted">Backend API example: http://localhost:8080</p></div>';
      return;
    }
    if (API.token) {
      app.innerHTML = '<div class="section-head"><div><h2>Account</h2><p>Signed in as ' + esc(API.user && API.user.name || "learner") + '</p></div><button class="btn ghost" data-action="home">Home</button></div><div class="panel auth-panel"><div class="account-bar"><span class="user-pill">'+esc(API.user && API.user.role || "learner")+'</span></div><div class="hero-actions"><button class="btn ghost" data-action="logout">Sign out</button>' + (((API.user && (API.user.role==="hr"||API.user.role==="admin"))) ? '<button class="btn amber" data-action="hr">HR dashboard</button>' : '') + '<button class="btn ghost" data-action="verify">Verify certificate</button></div></div>';
      return;
    }
    app.innerHTML = '<div class="section-head"><div><h2>Sign in / Register</h2><p>Create an account for persistent progress.</p></div><button class="btn ghost" data-action="home">Home</button></div><div class="panel auth-panel"><div class="form-grid"><input id="name" placeholder="Full name"><input id="email" type="email" placeholder="Email"><input id="password" type="password" placeholder="Password, 8+ characters"><input id="org" placeholder="Organization (optional)"><div class="hero-actions"><button class="btn primary" data-action="register">Create account</button><button class="btn ghost" data-action="login">Login</button></div></div></div>';
  }
  async function auth(kind) {
    const body = {email:document.getElementById("email").value, password:document.getElementById("password").value};
    if (kind === "register") Object.assign(body, {name:document.getElementById("name").value, organization:document.getElementById("org").value});
    try {
      const r = await API.request("/api/auth/" + kind, {method:"POST",body:JSON.stringify(body)});
      API.setToken(r.token); API.user = r.user; toastMsg(kind === "login" ? "Logged in" : "Account created"); progress();
    } catch (e) { toastMsg(e.message); }
  }
  async function hr() {
    try {
      const s = await API.request("/api/admin/summary");
      const u = await API.request("/api/admin/users");
      app.innerHTML = '<div class="section-head"><div><h2>HR Dashboard</h2><p>Learner progress and completion overview.</p></div><button class="btn ghost" data-action="account">Account</button></div>' +
        '<div class="metric-grid"><div class="metric"><b>'+s.users+'</b><span>Learners</span></div><div class="metric"><b>'+s.completions+'</b><span>Completions</span></div><div class="metric"><b>'+s.attempts+'</b><span>Attempts</span></div><div class="metric"><b>'+s.certificates+'</b><span>Certificates</span></div></div>' +
        '<div class="panel table-wrap" style="margin-top:18px"><table class="score-table"><thead><tr><th>Name</th><th>Email</th><th>Org</th><th>XP</th><th>Rooms</th><th></th></tr></thead><tbody>' +
        (u.rows||[]).map(function(x){return '<tr><td>'+esc(x.name)+'</td><td>'+esc(x.email)+'</td><td>'+esc(x.organization||"")+'</td><td>'+x.xp+'</td><td>'+x.completed_rooms+'/'+totalRooms()+'</td><td><button class="btn ghost" data-cert="'+x.id+'">Issue cert</button></td></tr>';}).join("") +
        '</tbody></table></div>';
    } catch (e) { toastMsg(e.message); }
  }
  async function verify() {
    const no = prompt("Certificate number");
    if (!no) return;
    try {
      const r = await API.request("/api/certificates/verify/" + encodeURIComponent(no));
      app.innerHTML = '<div class="section-head"><div><h2>Certificate Verification</h2><p>Public verification result.</p></div><button class="btn ghost" data-action="home">Home</button></div><div class="cert-box"><b>Valid certificate</b><p>Name: '+esc(r.name)+'</p><p>Course: '+esc(r.course)+'</p><p>Certificate: <code>'+esc(r.certificate_no)+'</code></p><p>Issued: '+esc(r.issued_at)+'</p></div>';
    } catch (e) { toastMsg("Certificate not found"); }
  }
  async function issueCert(id) {
    try { const r = await API.request("/api/certificates/issue",{method:"POST",body:JSON.stringify({userId:Number(id)})}); toastMsg("Issued " + r.certificateNo); }
    catch (e) { toastMsg(e.message); }
  }
  function render() {
    save();
    if (view === "paths") paths();
    else if (view === "room") renderRoom();
    else if (view === "progress") progressView();
    else if (view === "leaderboard") leaderboard();
    else if (view === "account") account();
    else if (view === "hr") hr();
    else home();
  }
  document.addEventListener("click", function(e) {
    const action = e.target.closest("[data-action]");
    if (action) {
      const a = action.dataset.action;
      if (a==="home") {view="home"; render();}
      else if (a==="paths") {view="paths"; render();}
      else if (a==="progress") {progress();}
      else if (a==="leaderboard") {leaderboard();}
      else if (a==="account") {view="account"; render();}
      else if (a==="theme") {state.theme=state.theme==="dark"?"light":"dark"; save();}
      else if (a==="room") {roomId=action.dataset.roomId;taskIndex=0;selected=null;feedback=null;view="room";render();}
      else if (a==="hint") {state.hints[roomId+":"+taskIndex]=true;save();renderRoom();}
      else if (a==="submit") {submit();}
      else if (a==="register") {auth("register");}
      else if (a==="login") {auth("login");}
      else if (a==="logout") {API.setToken("");API.user=null;view="account";render();}
      else if (a==="hr") {view="hr";hr();}
      else if (a==="verify") {verify();}
    }
    const r = e.target.closest("[data-room]");
    if (r) {roomId=r.dataset.room;taskIndex=0;selected=null;feedback=null;view="room";render();}
    const o = e.target.closest("[data-option]");
    if (o) {selected=Number(o.dataset.option);renderRoom();}
    const c = e.target.closest("[data-cert]");
    if (c) issueCert(c.dataset.cert);
  });
  window.DPDP_API.setBase(localStorage.getItem("dpdp-api-base") || ((!location.hostname.includes("github.io")) ? location.origin : ""));
  render();
})();