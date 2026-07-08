// Manual journal entries ("shards") plus the System Stability score derived
// from today's sync rate, recent full-day rate, and whether a recovery
// signal (sleep/water/mood/recovery/meditation) was logged. Kept separate
// from state.js so CoreState can import computeStability without the file
// growing into a monolith.

export function logShard(core, { type, energy, mood, note }) {
  core.state.shards = core.state.shards || [];
  core.state.shards.push({
    id: "s" + Date.now(),
    date: core.today(),
    type,
    energy: Math.max(1, Math.min(5, parseInt(energy) || 3)),
    mood: Math.max(1, Math.min(5, parseInt(mood) || 3)),
    note: (note || "").trim(),
  });
  core.award(12, 8);
  core.persist();
}

export function deleteShard(core, id) {
  core.state.shards = (core.state.shards || []).filter((x) => x.id !== id);
  core.persist();
}

export function computeStability(core) {
  const total = core.state.apps.length;
  const doneN = Object.keys(core.state.today.done).length;
  const pct = total ? doneN / total : 0;
  const full7 = core.fullDaysLast(7);
  const recentRate = full7 / 7;
  let score = 45 + pct * 25 + recentRate * 20;
  if (core.hasRecoverySignal()) score += 10;
  if (core.hasDoneWords(["workout", "gym", "lift", "run"]) && !core.hasRecoverySignal()) score -= 10;
  if (core.state.streak.cur >= 5 && !core.hasRecoverySignal()) score -= 6;
  score = Math.max(0, Math.min(100, Math.round(score)));
  let band = "NOMINAL", cls = "", rec = "Systems look balanced. Keep the queue clean and log one small recovery note if anything feels off.";
  if (score < 55) {
    band = "UNSTABLE"; cls = "bad";
    rec = "Recovery gig recommended: log water, sleep, mood, or a low-effort reset before pushing harder.";
  } else if (score < 75) {
    band = "WATCH"; cls = "warn";
    rec = "A few systems need support. Pair one hard task with one recovery task to protect the streak.";
  }
  return { score, band, cls, rec };
}

export function debriefText(core) {
  const total = core.state.apps.length;
  const doneN = Object.keys(core.state.today.done).length;
  const pct = total ? Math.round((doneN / total) * 100) : 0;
  const missing = core.state.apps.filter((a) => !core.state.today.done[a.id]).map((a) => a.nm);
  const st = computeStability(core);
  const ents = core.todayEntries();
  const status = pct >= 100 ? "clean sweep" : pct >= 60 ? "partial sync" : "low signal";
  return {
    pct,
    status,
    doneN,
    total,
    shardCount: ents.length,
    stability: st,
    missing,
    summary:
      `${pct}% ${status.toUpperCase()}. Today you synced ${doneN} of ${total} nodes, archived ${ents.length} shard${ents.length === 1 ? "" : "s"}, ` +
      `and your System Stability is ${st.score}% (${st.band}). ` +
      (missing.length ? `Pending nodes: ${missing.join(", ")}. ` : "All configured nodes are clear. ") +
      st.rec,
  };
}
