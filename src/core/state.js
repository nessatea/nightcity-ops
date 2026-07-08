import { loadCoreState, saveCoreState } from "../state/storage.js";
import { ATTRS, DEFAULT_APPS, guessAttr } from "./constants.js";
import { defaultNpcs } from "./npcs.js";
import { defaultTrainingState, normalizeTraining } from "./training.js";
import { computeStability } from "./shards.js";

function defState() {
  return {
    version: 1,
    apps: DEFAULT_APPS.map((a) => ({ ...a })),
    today: { date: null, done: {} },
    history: {},
    shards: [],
    contractClaims: {},
    training: defaultTrainingState(),
    streak: { cur: 0, best: 0, lastFull: null, insuranceUsed: false },
    xp: 0,
    level: 1,
    eddies: 100,
    totalLogs: 0,
    ownedUpgrades: {},
    npcs: defaultNpcs(),
    settings: { resetHour: 0, sound: false },
    bootSeen: false,
    // Cross-system signals so Gigs contracts can react to apartment/visitor
    // activity without importing anything from src/apartment/ — apartmentState
    // calls logVisitorInvite()/logApartmentPurchase() instead.
    visitorInviteDates: [],
    apartmentPurchaseDates: [],
  };
}

// Owns the shared habit-tracker economy (eddies/XP/level/streak) plus daily
// sync state, shard journal, contract claims, training, NPC roster, and
// settings. src/apartment/apartmentState.js takes an instance of this and
// calls award()/spend() instead of keeping its own wallet — apartment and
// market purchases/rewards all draw from this same pool.
export class CoreState {
  constructor() {
    const loaded = loadCoreState(defState());
    const d = defState();
    this.state = {
      ...d,
      ...loaded,
      apps: (loaded.apps && loaded.apps.length ? loaded.apps : d.apps).map((a, i) => ({
        ...d.apps[i % d.apps.length],
        ...a,
        attr: a.attr || guessAttr(a.nm),
      })),
      today: { ...d.today, ...(loaded.today || {}) },
      streak: { ...d.streak, ...(loaded.streak || {}) },
      settings: { ...d.settings, ...(loaded.settings || {}) },
      shards: Array.isArray(loaded.shards) ? loaded.shards : [],
      contractClaims: loaded.contractClaims || {},
      training: normalizeTraining(loaded.training),
      ownedUpgrades: loaded.ownedUpgrades || {},
      npcs: loaded.npcs && loaded.npcs.length ? loaded.npcs : d.npcs,
      visitorInviteDates: Array.isArray(loaded.visitorInviteDates) ? loaded.visitorInviteDates : [],
      apartmentPurchaseDates: Array.isArray(loaded.apartmentPurchaseDates) ? loaded.apartmentPurchaseDates : [],
    };
    this.rollover();
  }

  persist() {
    saveCoreState(this.state);
  }

  adjNow() {
    const d = new Date();
    d.setHours(d.getHours() - (this.state.settings.resetHour || 0));
    return d;
  }

  ymd(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  today() {
    return this.ymd(this.adjNow());
  }

  daysAgo(n) {
    const d = this.adjNow();
    d.setDate(d.getDate() - n);
    return this.ymd(d);
  }

  weekKey() {
    const d = this.adjNow();
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    return this.ymd(d);
  }

  xpForLevel(l) {
    return Math.round(80 * Math.pow(l, 1.55));
  }

  xpMult() {
    let m = 1;
    if (this.state.ownedUpgrades.oc1) m += 0.25;
    if (this.state.ownedUpgrades.oc2) m += 0.25;
    return m;
  }

  rollover() {
    const t = this.today();
    if (this.state.today.date === t) return;
    if (this.state.today.date) {
      const doneN = Object.keys(this.state.today.done).length;
      const totalN = this.state.apps.length;
      this.state.history[this.state.today.date] = {
        done: doneN,
        total: totalN,
        full: totalN > 0 && doneN >= totalN,
        doneIds: Object.keys(this.state.today.done),
        shards: this.state.shards.filter((x) => x.date === this.state.today.date).length,
        stability: computeStability(this).score,
      };
    }
    const streak = this.state.streak;
    if (streak.lastFull && streak.lastFull !== t && streak.lastFull !== this.daysAgo(1)) {
      if (streak.cur > 0 && this.state.ownedUpgrades.guard && !streak.insuranceUsed) {
        streak.insuranceUsed = true;
      } else {
        streak.cur = 0;
      }
    }
    this.state.today = { date: t, done: {} };
    this.persist();
  }

  award(xp, eddies) {
    const unlocks = [];
    if (xp) this.state.xp += Math.round(xp * this.xpMult());
    if (eddies) this.state.eddies += eddies;
    while (this.state.xp >= this.xpForLevel(this.state.level)) {
      this.state.xp -= this.xpForLevel(this.state.level);
      this.state.level++;
      this.state.npcs.forEach((n) => {
        if (n.lvl === this.state.level) unlocks.push(n.nm + " moved in");
      });
    }
    this.persist();
    return unlocks;
  }

  spend(eddies) {
    if (this.state.eddies < eddies) return false;
    this.state.eddies -= eddies;
    this.persist();
    return true;
  }

  // Called by apartmentState.js on a successful visitor invite / item
  // purchase, so Gigs contracts can react to apartment engagement.
  logVisitorInvite() {
    this.state.visitorInviteDates.push(this.today());
    if (this.state.visitorInviteDates.length > 200) this.state.visitorInviteDates = this.state.visitorInviteDates.slice(-200);
    this.persist();
  }

  logApartmentPurchase() {
    this.state.apartmentPurchaseDates.push(this.today());
    if (this.state.apartmentPurchaseDates.length > 200) this.state.apartmentPurchaseDates = this.state.apartmentPurchaseDates.slice(-200);
    this.persist();
  }

  // n=1 checks "today only"; n=7 checks the trailing week, matching the
  // historyForLast(n)/daysAgo(n) convention used elsewhere.
  countDatesLast(dates, n) {
    const set = new Set();
    for (let i = 0; i < n; i++) set.add(this.daysAgo(i));
    return dates.filter((d) => set.has(d)).length;
  }

  todayEntries() {
    const t = this.today();
    return (this.state.shards || []).filter((x) => x.date === t);
  }

  hasDoneWords(words) {
    const list = this.state.apps
      .filter((a) => this.state.today.done[a.id])
      .map((a) => String(a.nm || "").toLowerCase())
      .join(" ");
    return words.some((w) => list.includes(w));
  }

  hasRecoverySignal() {
    const ents = this.todayEntries();
    return (
      this.hasDoneWords(["sleep", "water", "recovery", "stretch", "mood", "meditat"]) ||
      ents.some((x) => ["Sleep", "Water", "Mood", "Recovery", "Journal"].includes(x.type))
    );
  }

  historyForLast(n) {
    const out = [];
    for (let i = n - 1; i >= 1; i--) {
      const day = this.daysAgo(i);
      if (this.state.history[day]) out.push(this.state.history[day]);
    }
    out.push({
      done: Object.keys(this.state.today.done).length,
      total: this.state.apps.length,
      full: this.state.apps.length > 0 && Object.keys(this.state.today.done).length >= this.state.apps.length,
      doneIds: Object.keys(this.state.today.done),
      shards: this.todayEntries().length,
    });
    return out;
  }

  fullDaysLast(n) {
    return this.historyForLast(n).filter((h) => h.full).length;
  }

  syncsLast(n) {
    return this.historyForLast(n).reduce((sum, h) => sum + (h.done || 0), 0);
  }

  attrsTouchedLast(n) {
    const touched = {};
    const byId = Object.fromEntries(this.state.apps.map((a) => [a.id, a]));
    this.historyForLast(n).forEach((h) => {
      (h.doneIds || []).forEach((id) => {
        const a = byId[id];
        if (a) touched[a.attr || guessAttr(a.nm)] = true;
      });
    });
    this.todayEntries().forEach((x) => {
      touched[attrForShard(x.type)] = true;
    });
    return Object.keys(touched).length;
  }

  attrStats() {
    const counts = Object.fromEntries(ATTRS.map((a) => [a.id, 0]));
    const byId = Object.fromEntries(this.state.apps.map((a) => [a.id, a]));
    this.historyForLast(7).forEach((h) => {
      (h.doneIds || []).forEach((id) => {
        const a = byId[id];
        if (a) counts[a.attr || guessAttr(a.nm)]++;
      });
    });
    this.todayEntries().forEach((x) => {
      counts[attrForShard(x.type)]++;
    });
    return counts;
  }

  toggleApp(id) {
    this.rollover();
    if (this.state.today.done[id]) {
      delete this.state.today.done[id];
    } else {
      this.state.today.done[id] = true;
      this.state.totalLogs++;
      this.award(10, 5);
    }
    this.checkFullDay();
    this.persist();
  }

  checkFullDay() {
    const total = this.state.apps.length;
    const doneN = Object.keys(this.state.today.done).length;
    const t = this.today();
    const streak = this.state.streak;
    const already = streak.lastFull === t;
    if (total > 0 && doneN >= total && !already) {
      const y = this.daysAgo(1);
      streak.cur = streak.lastFull === y ? streak.cur + 1 : 1;
      if (streak.cur > streak.best) streak.best = streak.cur;
      streak.lastFull = t;
      streak.insuranceUsed = false;
      let bonus = 20;
      if (this.state.ownedUpgrades.wallet) bonus = Math.round(bonus * 1.2);
      this.award(25, bonus);
      if (streak.cur % 7 === 0) this.award(0, 50);
    } else if (already && doneN < total) {
      streak.lastFull = streak.cur > 1 ? this.daysAgo(1) : null;
      streak.cur = Math.max(0, streak.cur - 1);
    }
    this.persist();
  }
}

function attrForShard(type) {
  if (["Workout"].includes(type)) return "body";
  if (["Water", "Sleep", "Mood", "Recovery"].includes(type)) return "cool";
  if (type === "App Audit") return "tech";
  if (type === "Journal") return "intelligence";
  return "tech";
}
