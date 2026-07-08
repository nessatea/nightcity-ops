import { trainingCompletedOn, trainingCountLast } from "./training.js";

export function contractDefs(core) {
  const total = core.state.apps.length;
  const doneN = Object.keys(core.state.today.done).length;
  const ent = core.todayEntries().length;
  const rec = core.hasRecoverySignal() ? 1 : 0;
  const trainToday = trainingCompletedOn(core, core.today()) ? 1 : 0;
  const trainWeek = trainingCountLast(core, 7);
  const d = core.today();
  const w = core.weekKey();
  const visitorToday = core.countDatesLast(core.state.visitorInviteDates, 1);
  const purchaseToday = core.countDatesLast(core.state.apartmentPurchaseDates, 1);
  const visitorWeek = core.countDatesLast(core.state.visitorInviteDates, 7);
  const purchaseWeek = core.countDatesLast(core.state.apartmentPurchaseDates, 7);
  return [
    { id: "daily-full", scope: "DAILY", key: d, title: "Regina's Sync Sweep", fixer: "REGINA JONES", desc: "Clear every configured fitness app node before reset.", progress: doneN, goal: total || 1, xp: 25, ed: 20 },
    { id: "daily-datajack", scope: "DAILY", key: d, title: "Datajack Integrity Check", fixer: "VIKTOR VECTOR", desc: "Sync at least three app nodes or as many as you have configured.", progress: Math.min(doneN, Math.min(3, total || 3)), goal: Math.min(3, total || 3), xp: 15, ed: 12 },
    { id: "daily-recovery", scope: "DAILY", key: d, title: "Ripperdoc Recovery Protocol", fixer: "VIKTOR VECTOR", desc: "Log a recovery signal: sleep, water, mood, recovery, meditation, or a shard.", progress: rec, goal: 1, xp: 15, ed: 15 },
    { id: "daily-shard", scope: "DAILY", key: d, title: "Archive One Shard", fixer: "JUDY ALVAREZ", desc: "Add one manual entry for workout context, mood, sleep, water, or app logging notes.", progress: Math.min(ent, 1), goal: 1, xp: 12, ed: 10 },
    { id: "daily-training", scope: "DAILY", key: d, title: "Coach Fred's Iron Contract", fixer: "COACH FRED", desc: "Close out today's training rotation workout inside the Training tab.", progress: trainToday, goal: 1, xp: 35, ed: 40 },
    { id: "daily-visitor", scope: "DAILY", key: d, title: "Afterlife VIP Reservation", fixer: "ROGUE", desc: "Invite a visitor to rate the apartment today.", progress: visitorToday, goal: 1, xp: 20, ed: 18 },
    { id: "daily-market", scope: "DAILY", key: d, title: "Night Market Requisition", fixer: "WAKAKO", desc: "Buy an apartment item today.", progress: purchaseToday, goal: 1, xp: 15, ed: 10 },
    { id: "weekly-full3", scope: "WEEKLY", key: w, title: "Afterlife Reputation Run", fixer: "ROGUE", desc: "Hit three full-sync days in the last seven days.", progress: core.fullDaysLast(7), goal: 3, xp: 60, ed: 75 },
    { id: "weekly-sync20", scope: "WEEKLY", key: w, title: "Netrunner Data Harvest", fixer: "T-BUG", desc: "Complete twenty total syncs across the last seven days.", progress: core.syncsLast(7), goal: 20, xp: 45, ed: 60 },
    { id: "weekly-attrs", scope: "WEEKLY", key: w, title: "Five-Attribute Loadout", fixer: "THE AFTERLIFE", desc: "Touch Body, Reflexes, Cool, Technical Ability, and Intelligence at least once this week.", progress: core.attrsTouchedLast(7), goal: 5, xp: 50, ed: 65 },
    { id: "weekly-training2", scope: "WEEKLY", key: w, title: "Iron Habit Protocol", fixer: "VIKTOR VECTOR", desc: "Close two training contracts in the last seven days.", progress: trainWeek, goal: 2, xp: 55, ed: 70 },
    { id: "weekly-visitors", scope: "WEEKLY", key: w, title: "Fixer Network Reservations", fixer: "WAKAKO", desc: "Host four visitor ratings in the last seven days.", progress: visitorWeek, goal: 4, xp: 50, ed: 55 },
    { id: "weekly-market", scope: "WEEKLY", key: w, title: "Apartment Refit Contract", fixer: "JUDY ALVAREZ", desc: "Buy three apartment items in the last seven days.", progress: purchaseWeek, goal: 3, xp: 40, ed: 65 },
  ];
}

export function claimContract(core, id) {
  const c = contractDefs(core).find((x) => x.id === id);
  if (!c) return { ok: false, reason: "UNKNOWN CONTRACT" };
  const key = c.id + "_" + c.key;
  if (core.state.contractClaims[key]) return { ok: false, reason: "CONTRACT ALREADY CLAIMED" };
  if (c.progress < c.goal) return { ok: false, reason: "CONTRACT INCOMPLETE" };
  core.state.contractClaims[key] = true;
  core.award(c.xp, c.ed);
  core.persist();
  return { ok: true, ed: c.ed, xp: c.xp };
}
