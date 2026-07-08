export const ATTRS = [
  { id: "body", nm: "BODY", e: "💪", desc: "strength, workouts, mobility, nutrition" },
  { id: "reflexes", nm: "REFLEXES", e: "⚡", desc: "steps, cardio, streak momentum" },
  { id: "cool", nm: "COOL", e: "🧘", desc: "sleep, mood, water, recovery" },
  { id: "tech", nm: "TECH", e: "🛠️", desc: "app upkeep, logging, systems" },
  { id: "intelligence", nm: "INTELLIGENCE", e: "🧠", desc: "planning, learning, reflection" },
];

export function attrMeta(id) {
  return ATTRS.find((a) => a.id === id) || ATTRS[0];
}

export function guessAttr(name) {
  const n = String(name || "").toLowerCase();
  if (/step|walk|run|cardio|strava|fitbit|garmin/.test(n)) return "reflexes";
  if (/sleep|water|mood|meditat|recovery|oura/.test(n)) return "cool";
  if (/food|meal|nutrition|protein|calorie|macro|workout|strong|hevy|fitbod|gym|lift/.test(n)) return "body";
  if (/journal|read|study|learn|python|plan/.test(n)) return "intelligence";
  return "tech";
}

export const DEFAULT_APPS = [
  { id: "a1", nm: "Steps", e: "👟", attr: "reflexes" },
  { id: "a2", nm: "Workout", e: "💪", attr: "body" },
  { id: "a3", nm: "Sleep", e: "😴", attr: "cool" },
  { id: "a4", nm: "Nutrition", e: "🥗", attr: "body" },
  { id: "a5", nm: "Water", e: "💧", attr: "cool" },
];

export const UPGRADES = [
  { id: "oc1", nm: "Overclock Biochip", e: "🧠", price: 500, lvl: 2, desc: "+25% XP from every sync" },
  { id: "oc2", nm: "Sandevistan MK.II", e: "⚡", price: 1200, lvl: 5, desc: "+25% XP (stacks to +50%)" },
  { id: "wallet", nm: "Militech Wallet", e: "💳", price: 400, lvl: 3, desc: "+20% eddies from full days" },
  { id: "skinC", nm: "Reactor Skin: Cyan", e: "🟦", price: 300, lvl: 2, desc: "Cosmetic reactor theme" },
  { id: "skinM", nm: "Reactor Skin: Magenta", e: "🟪", price: 300, lvl: 3, desc: "Cosmetic reactor theme" },
  { id: "guard", nm: "Streak Insurance", e: "🛡️", price: 900, lvl: 4, desc: "Forgives one missed day, once" },
];

export const WORKOUT_PROGRAM = {
  "1A": {
    name: "Glute & Hamstring contract — Variant A",
    sub: "Lower body // ~35-40 min",
    exercises: [
      { name: "Barbell hip thrust", target: "4 x 8-10", cue: "Chin tucked, drive through heels, squeeze glutes hard at the top. Don't overarch the low back.", sets: 4 },
      { name: "Romanian deadlift", target: "3 x 8-10", cue: "Soft knees, hinge the hips back, bar stays close to the legs, flat back the whole rep.", sets: 3 },
      { name: "Bulgarian split squat", target: "3 x 10-12/leg", cue: "Most of the weight on the front foot, lower straight down, torso stays tall.", sets: 3 },
      { name: "Cable standing glute kickback", target: "3 x 12-15/leg", cue: "Slight forward lean, kick straight back without arching the low back, squeeze at the top.", sets: 3 },
      { name: "Hanging knee raise or weighted plank", target: "3 x 10-12 / 30-45s", cue: "Knee raise: no swinging. Plank: straight line shoulders to heels, don't let hips sag.", sets: 3 },
    ],
  },
  "1B": {
    name: "Glute contract — Variant B (shelf focus)",
    sub: "Lower body // ~35-40 min",
    exercises: [
      { name: "Barbell hip thrust", target: "4 x 8-10", cue: "Chin tucked, drive through heels, squeeze glutes hard at the top. Don't overarch the low back.", sets: 4 },
      { name: "Curtsy lunge (DB)", target: "3 x 10-12/leg", cue: "Step the back leg behind and across, front knee tracks over the ankle, torso upright.", sets: 3 },
      { name: "Banded lateral walk", target: "3 x 15-20 steps/dir", cue: "Stay low in a slight squat, keep tension on the band the whole time, no bouncing.", sets: 3 },
      { name: "Standing cable hip abduction", target: "3 x 12-15/leg", cue: "Pull the cable from low/behind rather than straight to the side to hit the upper glute.", sets: 3 },
      { name: "Single-leg glute bridge", target: "2 x 12-15/leg", cue: "Keep hips level, don't let the non-working hip drop. Squeeze at the top.", sets: 2 },
    ],
  },
  "2": {
    name: "Pull/Back contract",
    sub: "Upper body // pull-up focus // ~35-40 min",
    exercises: [
      { name: "Assisted pull-up", target: "4 x 5-8", cue: "Pull elbows down and back, lead with the chest toward the bar, full hang at the bottom.", sets: 4 },
      { name: "Lat pulldown", target: "3 x 10-12", cue: "Pull elbows to ribs, avoid leaning back excessively, control the weight back up.", sets: 3 },
      { name: "Single-arm DB row", target: "3 x 10-12/side", cue: "Pull elbow back along the body, keep the back flat, no twisting the torso.", sets: 3 },
      { name: "Face pulls", target: "3 x 15", cue: "Pull to eye level, lead with the elbows high, squeeze shoulder blades together.", sets: 3 },
      { name: "Reverse fly (DB or machine)", target: "2 x 12-15", cue: "Slight bend in the elbows, lift with the back of the shoulders, no momentum.", sets: 2 },
      { name: "DB bicep curl", target: "2 x 10-12", cue: "Elbows pinned at the sides, control the lowering phase, no swinging.", sets: 2 },
      { name: "Dead hang (grip/forearm)", target: "2 x 30-45s", cue: "Relax the shoulders down out of the ears, just hold body weight.", sets: 2 },
    ],
  },
  "3": {
    name: "Quad contract",
    sub: "Lower body // ~35-40 min",
    exercises: [
      { name: "Back squat or leg press", target: "4 x 8-10", cue: "Knees track over toes, brace the core before descending, full depth without losing the flat back.", sets: 4 },
      { name: "Walking lunge (DB)", target: "3 x 10-12/leg", cue: "Step far enough that the front knee stays over the ankle, torso upright.", sets: 3 },
      { name: "Leg extension", target: "3 x 12-15", cue: "Control the weight down, avoid locking out aggressively at the top.", sets: 3 },
      { name: "Standing calf raise", target: "3 x 12-15", cue: "Full stretch at the bottom, pause briefly at the top, control the descent.", sets: 3 },
      { name: "Hanging knee raise or weighted plank", target: "3 x 10-12 / 30-45s", cue: "Knee raise: no swinging. Plank: straight line shoulders to heels, don't let hips sag.", sets: 3 },
    ],
  },
  "4": {
    name: "Push/Triceps contract",
    sub: "Upper body // push-up focus // ~35-40 min",
    exercises: [
      { name: "Incline DB bench press", target: "3 x 10-12", cue: "Shoulder blades pulled back and down, lower with control to chest level.", sets: 3 },
      { name: "Elevated/standard push-up", target: "3 x near-failure", cue: "Straight line head to heels, elbows ~45° from the body, full range down and up.", sets: 3 },
      { name: "DB shoulder press", target: "3 x 10-12", cue: "Press straight overhead, avoid arching the low back, control the weight down.", sets: 3 },
      { name: "Overhead DB triceps extension", target: "3 x 10-12", cue: "Elbows stay close to the head, only the forearm moves.", sets: 3 },
      { name: "Triceps pushdown", target: "2 x 12-15", cue: "Elbows pinned at the sides, full extension at the bottom without locking out hard.", sets: 2 },
      { name: "Cable lateral raise", target: "2 x 12-15", cue: "Lead with the elbow, lift to shoulder height, no momentum.", sets: 2 },
    ],
  },
};

export const TRAINING_CYCLE = ["1", "2", "3", "4"];

export const TRAINING_PICKER_OPTIONS = [
  { key: "auto", label: "Auto rotation" },
  { key: "1A", label: "Glute & Hamstring · Variant A" },
  { key: "1B", label: "Glute Shelf Focus · Variant B" },
  { key: "2", label: "Pull/Back · Pull-up Focus" },
  { key: "3", label: "Quad Contract" },
  { key: "4", label: "Push/Triceps · Push-up Focus" },
];
