(() => {
  const LS = "dpdp-platform-v4";
  const originalSet = localStorage.setItem.bind(localStorage);
  let syncing = false;
  let mergingLocalState = false;
  let syncQueue = Promise.resolve();

  localStorage.setItem = (key, value) => {
    originalSet(key, value);
    if (key === LS && !mergingLocalState) window.dispatchEvent(new CustomEvent("0x8acure:progress-changed"));
  };

  const parseState = () => {
    try {
      const value = JSON.parse(localStorage.getItem(LS) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch (error) {
      console.error("[DPDP] Could not read local progress for Supabase sync.", error);
      return {};
    }
  };
  const roomScores = (state) => Object.fromEntries(
    Object.entries(state.roomQuiz || {}).map(([roomId, quiz]) => [roomId, Number(quiz?.bestScore) || 0])
  );
  const completedRooms = (state) => Object.keys(state.completed || {}).filter((roomId) => state.completed[roomId]);
  const uniqueStrings = (values) => [...new Set((Array.isArray(values) ? values : []).filter((value) => typeof value === "string"))];

  async function loadAndMerge(client, userId) {
    const { data, error } = await client.from("dpdp_progress").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    const state = parseState();
    if (!data) {
      const scores = roomScores(state);
      const row = {
        user_id: userId,
        completed_rooms: completedRooms(state),
        quiz_scores: scores,
        bookmarks: uniqueStrings(state.bookmarks),
        last_active: new Date().toISOString()
      };
      const { error: insertError } = await client.from("dpdp_progress").upsert(row, { onConflict: "user_id" });
      if (insertError) throw insertError;
      return;
    }

    const mergedCompleted = uniqueStrings([...completedRooms(state), ...data.completed_rooms]);
    const mergedScores = { ...(data.quiz_scores || {}) };
    for (const [roomId, score] of Object.entries(roomScores(state))) {
      mergedScores[roomId] = Math.max(Number(mergedScores[roomId]) || 0, score);
    }
    const mergedBookmarks = uniqueStrings([...uniqueStrings(state.bookmarks), ...data.bookmarks]);
    state.completed = { ...(state.completed || {}), ...Object.fromEntries(mergedCompleted.map((roomId) => [roomId, true])) };
    state.roomQuiz = state.roomQuiz || {};
    for (const [roomId, score] of Object.entries(mergedScores)) {
      state.roomQuiz[roomId] = { ...(state.roomQuiz[roomId] || {}), bestScore: score };
    }
    state.bookmarks = mergedBookmarks;

    mergingLocalState = true;
    try {
      localStorage.setItem(LS, JSON.stringify(state));
    } finally {
      mergingLocalState = false;
    }
    const { error: updateError } = await client.from("dpdp_progress").upsert({
      user_id: userId,
      completed_rooms: mergedCompleted,
      quiz_scores: mergedScores,
      bookmarks: mergedBookmarks,
      last_active: new Date().toISOString()
    }, { onConflict: "user_id" });
    if (updateError) throw updateError;
  }

  async function syncProgress() {
    const client = window.DPDP_AUTH?.client;
    if (!client || syncing) return;
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    if (!data.session?.user) return;
    syncing = true;
    try {
      await loadAndMerge(client, data.session.user.id);

      const state = parseState();
      const rows = Object.entries(state.completed || {}).map(([room_id, completed]) => ({
        user_id: data.session.user.id,
        room_id,
        completed: Boolean(completed),
        xp: Number(state.xp) || 0
      }));
      if (rows.length) {
        const { error: progressError } = await client.from("room_progress").upsert(rows, { onConflict: "user_id,room_id" });
        if (progressError) throw progressError;
      }
      const { error: profileError } = await client.from("profiles").update({
        xp: Number(state.xp) || 0,
        streak: Number(state.streak) || 0,
        last_active_date: state.lastActiveDate || null,
        updated_at: new Date().toISOString()
      }).eq("id", data.session.user.id);
      if (profileError) throw profileError;
    } finally {
      syncing = false;
    }
  }

  function enqueueSync() {
    syncQueue = syncQueue.then(syncProgress).catch((error) => {
      console.error("[DPDP] Supabase progress sync failed; local progress is preserved.", error);
    });
  }
  window.addEventListener("0x8acure:progress-changed", enqueueSync);
  window.addEventListener("load", () => window.setTimeout(enqueueSync, 900));
  window.addEventListener("0x8acure:supabase-session-ready", enqueueSync);
})();
