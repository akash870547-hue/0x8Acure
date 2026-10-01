(() => {
  const dialog = document.getElementById("command-palette");
  const input = document.getElementById("command-palette-input");
  const results = document.getElementById("command-palette-results");
  const status = document.getElementById("command-palette-status");
  const closeButton = document.getElementById("command-palette-close");
  const trigger = document.getElementById("command-palette-trigger");
  if (!dialog || !input || !results || !trigger || !window.DPDP_CURRICULUM) return;

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
  const commands = [
    ["Home", "Dashboard and recent progress", "home", ["dashboard", "start"]],
    ["Learn", "Browse all learning paths", "paths", ["learning", "courses"]],
    ["Quiz Library", "Open assessments", "quiz", ["assessment", "questions"]],
    ["Official Sources", "Government documents and citations", "sources", ["acts", "rules", "references"]],
    ["My Progress", "Completion, XP, badges, and certificates", "progress", ["account", "scores"]],
    ["Leaderboard", "Opt-in learner rankings", "leaderboard", ["rankings"]],
    ["Badges", "View earned learning badges", "badges", ["achievements"]],
    ["Certificates", "View and issue certificates", "certificates", ["credentials"]],
    ["Sign in / Account", "Open sign in, signup, or your account", "account", ["login", "signup", "auth"]],
    ["Admin panel", "Admin account access", "admin", ["admin login", "administration"]]
  ].map(([label, detail, value, keywords]) => ({
    label, detail, keywords: keywords.join(" "), target: { type: "view", value }, quick: true
  }));

  for (const path of window.DPDP_CURRICULUM) {
    commands.push({
      label: path.name, detail: `${path.level || "Learning path"} · ${path.tag || ""}`,
      keywords: path.description || "", target: { type: "path", id: path.id }, quick: true
    });
    for (const module of path.modules || []) {
      commands.push({
        label: module.name, detail: `${path.name} · Module`,
        keywords: module.description || "", target: { type: "module", pathId: path.id, id: module.id }
      });
      for (const room of module.rooms || []) commands.push({
        label: room.title, detail: `${path.name} · ${module.name}`,
        keywords: `${room.sections || ""} ${room.difficulty || ""} ${room.sourceIds?.join(" ") || ""}`,
        target: { type: "room", id: room.id }
      });
    }
  }

  let activeIndex = -1;
  let shown = [];
  let previousFocus = null;
  const normalize = value => value.toLocaleLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").trim();

  function score(command, query) {
    const label = normalize(command.label);
    const detail = normalize(command.detail);
    const words = normalize(`${command.keywords} ${command.detail}`);
    if (label === query) return 100;
    if (label.startsWith(query)) return 80;
    if (label.includes(query)) return 65;
    const terms = query.split(/\s+/).filter(Boolean);
    if (terms.every(term => label.includes(term))) return 55;
    if (terms.every(term => words.includes(term))) return 35;
    if (detail.includes(query)) return 25;
    return 0;
  }

  function setActive(index) {
    activeIndex = shown.length ? (index + shown.length) % shown.length : -1;
    results.querySelectorAll('[role="option"]').forEach((option, i) => {
      const active = i === activeIndex;
      option.setAttribute("aria-selected", String(active));
      if (active) input.setAttribute("aria-activedescendant", option.id);
    });
    if (activeIndex < 0) input.removeAttribute("aria-activedescendant");
    results.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }

  function render() {
    const query = normalize(input.value);
    shown = (query
      ? commands.map(command => ({ command, rank: score(command, query) })).filter(item => item.rank)
        .sort((a, b) => b.rank - a.rank || a.command.label.localeCompare(b.command.label))
        .map(item => item.command)
      : commands.filter(command => command.quick)
    ).slice(0, 12);
    activeIndex = -1;

    if (!shown.length) {
      results.innerHTML = '<p class="palette-empty">No matching sections, paths, or rooms.</p>';
      status.textContent = "No results.";
      input.removeAttribute("aria-activedescendant");
      return;
    }

    results.innerHTML = shown.map((command, index) =>
      `<button class="palette-result" id="palette-option-${index}" type="button" role="option" aria-selected="false" tabindex="-1" data-palette-index="${index}"><span class="palette-result-copy"><b>${escapeHtml(command.label)}</b><small>${escapeHtml(command.detail)}</small></span><span class="palette-result-arrow" aria-hidden="true">↵</span></button>`
    ).join("");
    status.textContent = `${shown.length} ${shown.length === 1 ? "result" : "results"}.`;
  }

  function openPalette() {
    if (dialog.open) {
      input.focus();
      return;
    }
    previousFocus = document.activeElement;
    input.value = "";
    render();
    dialog.showModal();
    input.focus();
  }

  function choose(index) {
    const command = shown[index];
    if (!command) return;
    dialog.close();
    window.DPDP_NAVIGATE?.(command.target);
  }

  trigger.addEventListener("click", openPalette);
  closeButton.addEventListener("click", () => dialog.close());
  input.addEventListener("input", render);
  input.addEventListener("keydown", event => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(activeIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(activeIndex < 0 ? shown.length - 1 : activeIndex - 1);
    } else if (event.key === "Enter" && shown.length) {
      event.preventDefault();
      choose(activeIndex < 0 ? 0 : activeIndex);
    }
  });
  results.addEventListener("mousemove", event => {
    const option = event.target.closest("[data-palette-index]");
    if (option) setActive(Number(option.dataset.paletteIndex));
  });
  results.addEventListener("click", event => {
    const option = event.target.closest("[data-palette-index]");
    if (option) choose(Number(option.dataset.paletteIndex));
  });
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  });
  document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openPalette();
    }
  });

  if (/Mac|iPhone|iPad/.test(navigator.platform || "")) {
    trigger.querySelector("kbd").textContent = "⌘ K";
  }
})();
