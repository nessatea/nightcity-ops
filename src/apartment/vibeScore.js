import { itemById } from "./apartmentItems.js";

export const VIBE_KEYS = [
  "comfort",
  "style",
  "tech",
  "luxury",
  "greenery",
  "neon",
  "cozy",
  "corporate",
  "rugged",
  "music",
  "occult",
  "practical",
];

export function emptyVibes() {
  return Object.fromEntries(VIBE_KEYS.map((key) => [key, 0]));
}

export function totalVibes(equippedSlots) {
  const totals = emptyVibes();
  Object.values(equippedSlots).forEach((itemId) => {
    const item = itemById(itemId);
    if (!item) return;
    Object.entries(item.vibes).forEach(([key, value]) => {
      totals[key] = (totals[key] || 0) + value;
    });
  });
  return totals;
}

export function apartmentVibeScore(equippedSlots) {
  const vibes = totalVibes(equippedSlots);
  const rawTotal = Object.values(vibes).reduce((sum, value) => sum + value, 0);
  const filledSlots = Object.values(equippedSlots).filter((itemId) => itemById(itemId)).length;
  return Math.min(100, Math.round(rawTotal * 4 + filledSlots * 3));
}

export function housingTierForScore(score) {
  if (score >= 80) return "Penthouse Mood";
  if (score >= 60) return "Curated Safehouse";
  if (score >= 38) return "Lived-In H10";
  return "Starter Crashpad";
}
