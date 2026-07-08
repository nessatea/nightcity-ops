import { loadApartmentState, saveApartmentState } from "../state/storage.js";
import { APARTMENT_SLOTS, itemById } from "./apartmentItems.js";
import { rollEvent } from "./apartmentEvents.js";
import { rateApartment } from "./visitorRating.js";
import { VISITORS, visitorById } from "./visitors.js";

const DAILY_EVENT_CHANCE = 0.45;

const STARTING_STATE = {
  ownedItems: {
    "coffin-bed": true,
    "mox-loveseat": true,
    "neon-lamp": true,
  },
  equippedSlots: {
    bed: "coffin-bed",
    lounge: "mox-loveseat",
    lighting: "neon-lamp",
  },
  visitorAffinity: {},
  selectedVisitorId: "zoya-mathis",
  lastVisitorResult: null,
  lastEventDate: null,
  lastEventResult: null,
};

// Owns the persisted apartment data (owned items, equipped slots, visitor
// affinity, last result) and every mutation that touches it. Eddies/XP are
// NOT stored here — this shares the CoreState wallet (src/core/state.js) so
// habit-tracker rewards and apartment purchases/rewards draw from the same
// pool. apartmentView.js and marketView.js read from this and call its
// methods; it never touches localStorage directly.
export class ApartmentState {
  constructor(core) {
    this.core = core;
    this.state = loadApartmentState(STARTING_STATE);
    this.normalize();
    this.persist();
  }

  normalize() {
    Object.entries(this.state.equippedSlots).forEach(([slot, itemId]) => {
      const item = itemById(itemId);
      if (!APARTMENT_SLOTS.includes(slot) || !item || item.compatibleSlot !== slot) {
        delete this.state.equippedSlots[slot];
      }
    });
    if (!VISITORS.some((visitor) => visitor.id === this.state.selectedVisitorId)) {
      this.state.selectedVisitorId = STARTING_STATE.selectedVisitorId;
    }
  }

  persist() {
    saveApartmentState(this.state);
  }

  isOwned(itemId) {
    return !!this.state.ownedItems[itemId];
  }

  isEquipped(itemId) {
    return Object.values(this.state.equippedSlots).includes(itemId);
  }

  buyItem(itemId) {
    const item = itemById(itemId);
    if (!item) return;
    if (this.isOwned(itemId) && !item.allowMultiples) return;
    if (!this.core.spend(item.price)) {
      this.state.lastVisitorResult = {
        tier: "neutral",
        dialogue: "Not enough eddies for that piece yet.",
        rewardType: "eddies",
        rewardAmount: 0,
        affinityGain: 0,
        score: 0,
      };
      this.persist();
      return;
    }

    this.state.ownedItems[itemId] = true;
    if (!this.state.equippedSlots[item.compatibleSlot]) {
      this.state.equippedSlots[item.compatibleSlot] = itemId;
    }
    this.core.logApartmentPurchase();
    this.persist();
  }

  equipItem(slot, itemId) {
    const item = itemById(itemId);
    if (!item || item.compatibleSlot !== slot || !this.isOwned(itemId)) return;
    this.state.equippedSlots[slot] = itemId;
    this.persist();
  }

  clearSlot(slot) {
    delete this.state.equippedSlots[slot];
    this.persist();
  }

  selectVisitor(visitorId) {
    this.state.selectedVisitorId = visitorId;
    this.persist();
  }

  inviteSelectedVisitor() {
    const visitor = visitorById(this.state.selectedVisitorId);
    const currentAffinity = this.state.visitorAffinity[visitor.id] || 0;
    const result = rateApartment(this.state.equippedSlots, visitor, currentAffinity);

    this.state.visitorAffinity[visitor.id] = currentAffinity + result.affinityGain;
    if (result.rewardType === "xp") this.core.award(result.rewardAmount, 0);
    else this.core.award(0, result.rewardAmount);
    this.state.lastVisitorResult = result;
    this.core.logVisitorInvite();
    this.persist();
    return result;
  }

  // Ambient apartment events: rolled at most once per day, on first visit
  // to the Apartment tab that day. Not every day produces one (see
  // DAILY_EVENT_CHANCE) — that's the point, it should feel like a surprise
  // rather than a daily chore.
  checkDailyEvent() {
    const t = this.core.today();
    if (this.state.lastEventDate === t) return;
    this.state.lastEventDate = t;
    if (Math.random() < DAILY_EVENT_CHANCE) {
      const event = rollEvent();
      if (event.eddies) {
        this.core.state.eddies = Math.max(0, this.core.state.eddies + event.eddies);
        this.core.persist();
      }
      this.state.lastEventResult = { ...event, date: t };
    } else {
      this.state.lastEventResult = null;
    }
    this.persist();
  }
}
