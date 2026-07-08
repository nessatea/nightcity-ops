import { TRAINING_CYCLE, TRAINING_PICKER_OPTIONS, WORKOUT_PROGRAM } from "./constants.js";

export { TRAINING_PICKER_OPTIONS };

export function defaultTrainingState() {
  return {
    cyclePos: 0,
    day1Variant: "A",
    currentSession: null,
    sessionHistory: [],
    measurements: [],
    photos: [],
    totalCompleted: 0,
    streak: 0,
    lastCompletedDate: null,
    selectedKeyByDate: {},
  };
}

export function normalizeTraining(t) {
  const d = defaultTrainingState();
  t = t || {};
  return {
    ...d,
    ...t,
    cyclePos: Math.max(0, Math.min(3, parseInt(t.cyclePos) || 0)),
    day1Variant: t.day1Variant === "B" ? "B" : "A",
    sessionHistory: Array.isArray(t.sessionHistory) ? t.sessionHistory : [],
    measurements: Array.isArray(t.measurements) ? t.measurements : [],
    photos: Array.isArray(t.photos) ? t.photos : [],
    selectedKeyByDate: t.selectedKeyByDate && typeof t.selectedKeyByDate === "object" ? t.selectedKeyByDate : {},
    currentSession: t.currentSession || null,
  };
}

export function scheduledTrainingKey(T) {
  return TRAINING_CYCLE[T.cyclePos] === "1" ? "1" + T.day1Variant : TRAINING_CYCLE[T.cyclePos];
}

export function trainingKey(core) {
  const T = core.state.training;
  const override = T.selectedKeyByDate && T.selectedKeyByDate[core.today()];
  return WORKOUT_PROGRAM[override] ? override : scheduledTrainingKey(T);
}

export function trainingDay(key) {
  return WORKOUT_PROGRAM[key] || WORKOUT_PROGRAM["1A"];
}

export function trainingSessionCounts(sess) {
  if (!sess) return { done: 0, total: 0, pct: 0 };
  let done = 0, total = 0;
  Object.values(sess.sets || {}).forEach((arr) => (arr || []).forEach((s) => { total++; if (s.done) done++; }));
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

export function trainingCompletedOn(core, date) {
  return (core.state.training.sessionHistory || []).some((x) => x.date === date);
}

export function trainingCountLast(core, n) {
  const dates = new Set();
  for (let i = 0; i < n; i++) dates.add(core.daysAgo(i));
  return (core.state.training.sessionHistory || []).filter((x) => dates.has(x.date)).length;
}

function markWorkoutNodeDone(core) {
  const node = core.state.apps.find((a) => /workout|gym|lift|training|strong|hevy|fitbod/i.test(a.nm));
  if (node && !core.state.today.done[node.id]) {
    core.state.today.done[node.id] = true;
    core.state.totalLogs++;
    core.checkFullDay();
  }
}

function buildTrainingSetsForKey(key) {
  const day = trainingDay(key);
  const sets = {};
  day.exercises.forEach((ex, i) => {
    sets[i] = Array.from({ length: parseInt(ex.sets) || 1 }, () => ({ weight: "", reps: "", done: false }));
  });
  return sets;
}

export function normalizeActiveTrainingSession(sess, core) {
  if (!sess) return null;
  sess.key = sess.key || trainingKey(core);
  sess.started = sess.started || core.today();
  sess.id = sess.id || "tr" + Date.now();
  sess.sets = sess.sets || {};
  const day = trainingDay(sess.key);
  day.exercises.forEach((ex, i) => {
    if (!Array.isArray(sess.sets[i])) sess.sets[i] = [];
    while (sess.sets[i].length < (parseInt(ex.sets) || 1)) sess.sets[i].push({ weight: "", reps: "", done: false });
    sess.sets[i] = sess.sets[i].slice(0, parseInt(ex.sets) || 1).map((x) => ({ weight: x.weight || "", reps: x.reps || "", done: !!x.done }));
  });
  return sess;
}

export function lastExerciseSetsForKey(core, key, exIdx) {
  const hist = (core.state.training.sessionHistory || []).slice().reverse().find((x) => x.key === key && x.sets && x.sets[exIdx]);
  if (!hist) return "";
  return (hist.sets[exIdx] || []).map((set, i) => "S" + (i + 1) + " " + (set.weight || "—") + "×" + (set.reps || "—")).join(" · ");
}

export function selectTrainingForToday(core, value) {
  core.rollover();
  const T = core.state.training;
  if (T.currentSession) return { locked: true };
  T.selectedKeyByDate = T.selectedKeyByDate || {};
  const date = core.today();
  if (!value || value === "auto") delete T.selectedKeyByDate[date];
  else if (WORKOUT_PROGRAM[value]) T.selectedKeyByDate[date] = value;
  core.persist();
  return { locked: false };
}

export function startTrainingSession(core) {
  core.rollover();
  const T = core.state.training;
  if (T.currentSession) {
    T.currentSession = normalizeActiveTrainingSession(T.currentSession, core);
    core.persist();
    return;
  }
  const scheduled = scheduledTrainingKey(T);
  const key = trainingKey(core);
  T.currentSession = { id: "tr" + Date.now(), key, scheduledKey: scheduled, isOverride: key !== scheduled, started: core.today(), sets: buildTrainingSetsForKey(key) };
  core.persist();
}

export function setTrainingSetField(core, exIdx, setIdx, field, value) {
  const sess = core.state.training.currentSession;
  if (!sess || !sess.sets[exIdx] || !sess.sets[exIdx][setIdx]) return;
  sess.sets[exIdx][setIdx][field] = value;
  core.persist();
}

export function toggleTrainingSet(core, exIdx, setIdx) {
  const sess = core.state.training.currentSession;
  if (!sess || !sess.sets[exIdx] || !sess.sets[exIdx][setIdx]) return;
  sess.sets[exIdx][setIdx].done = !sess.sets[exIdx][setIdx].done;
  core.persist();
}

export function finishTrainingSession(core) {
  const T = core.state.training;
  const sess = T.currentSession;
  if (!sess) return { ok: false, reason: "NO ACTIVE TRAINING CONTRACT" };
  const counts = trainingSessionCounts(sess);
  if (counts.done === 0) return { ok: false, reason: "LOG AT LEAST ONE SET FIRST" };
  const day = trainingDay(sess.key);
  const date = core.today();
  T.sessionHistory.push({ id: sess.id || "tr" + Date.now(), key: sess.key, name: day.name, date, sets: sess.sets, completedSets: counts.done, totalSets: counts.total });
  if (T.sessionHistory.length > 200) T.sessionHistory = T.sessionHistory.slice(-200);
  if (T.lastCompletedDate === date) {
    // same-day double session: count it, do not double-streak
  } else if (T.lastCompletedDate) {
    const diff = Math.round((new Date(date) - new Date(T.lastCompletedDate)) / 86400000);
    T.streak = diff <= 2 ? T.streak + 1 : 1;
  } else {
    T.streak = 1;
  }
  T.lastCompletedDate = date;
  T.totalCompleted = (T.totalCompleted || 0) + 1;
  const scheduled = sess.scheduledKey || scheduledTrainingKey(T);
  if (sess.key === scheduled) {
    if (TRAINING_CYCLE[T.cyclePos] === "1") T.day1Variant = T.day1Variant === "A" ? "B" : "A";
    T.cyclePos = (T.cyclePos + 1) % TRAINING_CYCLE.length;
  }
  if (T.selectedKeyByDate) delete T.selectedKeyByDate[date];
  T.currentSession = null;
  markWorkoutNodeDone(core);
  core.state.shards = core.state.shards || [];
  core.state.shards.push({ id: "s" + Date.now(), date, type: "Workout", energy: 3, mood: 3, note: "Closed training contract: " + day.name + " (" + counts.done + "/" + counts.total + " sets)." });
  const rate = counts.total ? counts.done / counts.total : 0;
  const eddiesAward = Math.round(30 + 45 * rate);
  core.award(Math.round(45 + 45 * rate), eddiesAward);
  core.persist();
  return { ok: true, eddiesAward };
}

export function deleteTrainingSession(core, id) {
  core.state.training.sessionHistory = (core.state.training.sessionHistory || []).filter((x) => x.id !== id);
  core.persist();
}

export function addTrainingMeasurement(core, { weight, hips, thigh }) {
  if (!weight && !hips && !thigh) return false;
  core.state.training.measurements.push({ id: "m" + Date.now(), date: core.today(), weight, hips, thigh });
  core.persist();
  return true;
}

export function deleteTrainingMeasurement(core, id) {
  core.state.training.measurements = (core.state.training.measurements || []).filter((x) => x.id !== id);
  core.persist();
}

export function deleteTrainingPhoto(core, id) {
  core.state.training.photos = (core.state.training.photos || []).filter((x) => x.id !== id);
  core.persist();
}

export function addTrainingPhotoFromFile(core, file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        try {
          const maxW = 520;
          const scale = Math.min(1, maxW / img.width);
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const data = canvas.toDataURL("image/jpeg", 0.72);
          core.state.training.photos.push({ id: "p" + Date.now(), date: core.today(), data });
          core.persist();
          resolve();
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
