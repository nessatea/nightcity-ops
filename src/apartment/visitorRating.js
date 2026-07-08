import { APARTMENT_SLOTS, itemById } from "./apartmentItems.js";
import { apartmentVibeScore, totalVibes } from "./vibeScore.js";

const TIER_RULES = [
  { tier: "loved", min: 78, eddies: 50, xp: 10, affinity: 4 },
  { tier: "liked", min: 58, eddies: 25, xp: 5, affinity: 2 },
  { tier: "neutral", min: 36, eddies: 10, xp: 2, affinity: 1 },
  { tier: "disliked", min: 0, eddies: 2, xp: 0, affinity: 0 },
];

export function rateApartment(equippedSlots, visitor, currentAffinity = 0) {
  const vibes = totalVibes(equippedSlots);
  const equippedItems = Object.values(equippedSlots).map(itemById).filter(Boolean);
  const equippedCategories = new Set(equippedItems.map((item) => item.category));
  const equippedSlotNames = new Set(
    Object.entries(equippedSlots)
      .filter(([, itemId]) => itemById(itemId))
      .map(([slot]) => slot),
  );
  const filledSlots = equippedItems.length;
  const vibeScore = apartmentVibeScore(equippedSlots);

  let raw = 18 + Math.min(18, filledSlots * 2) + Math.min(10, Math.round(vibeScore / 10));

  visitor.likes.forEach((key) => {
    raw += (vibes[key] || 0) * 7;
  });

  visitor.dislikes.forEach((key) => {
    raw -= (vibes[key] || 0) * 5;
  });

  visitor.favoriteSlots.forEach((slot) => {
    raw += equippedSlotNames.has(slot) ? 7 : -3;
  });

  (visitor.favoriteCategories || []).forEach((category) => {
    if (equippedCategories.has(category)) raw += 4;
  });

  if (filledSlots >= Math.ceil(APARTMENT_SLOTS.length * 0.65)) raw += 6;
  if (visitor.visitorType === "vip" && currentAffinity >= 6) raw += 4;

  const score = Math.max(0, Math.min(100, Math.round(raw)));
  const rule = TIER_RULES.find((tierRule) => score >= tierRule.min) || TIER_RULES.at(-1);
  const rewardScale = visitor.visitorType === "random" ? 0.55 : 1;
  const baseReward = visitor.rewardType === "xp" ? rule.xp : rule.eddies;
  const rewardAmount = Math.round(baseReward * rewardScale);
  const affinityGain = visitor.visitorType === "vip" ? rule.affinity : 0;

  return {
    visitorId: visitor.id,
    score,
    tier: rule.tier,
    dialogue: visitor.dialogue[rule.tier],
    rewardType: visitor.rewardType,
    rewardAmount,
    affinityGain,
    vibeTotals: vibes,
    apartmentVibeScore: vibeScore,
    ratedAt: new Date().toISOString(),
  };
}
