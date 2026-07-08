import { APARTMENT_ITEMS, APARTMENT_SLOTS, itemById, itemsForSlot } from "./apartmentItems.js";
import { apartmentVibeScore, housingTierForScore, totalVibes, VIBE_KEYS } from "./vibeScore.js";
import { VISITORS, visitorById } from "./visitors.js";

// Renders the Apartment tab: overview, equip slots, owned collection, vibe
// totals, and the visitors panel. The marketplace lives in its own tab —
// see marketView.js — both share the same ApartmentState instance passed
// in from main.js. This file owns no persisted data itself, it just
// reflects state.state into the DOM and calls state methods on interaction.
export class ApartmentView {
  constructor(root, apartmentState, onChange) {
    this.root = root;
    this.state = apartmentState;
    this.onChange = onChange || (() => {});
  }

  mount() {
    this.root.innerHTML = `
      <section class="apartment-hub">
        <header class="apartment-hero">
          <div>
            <h1>H10 Apartment</h1>
            <p>Equip owned pieces, invite OCs, collect tiny rewards.</p>
          </div>
        </header>

        <div class="event-banner" data-event-banner></div>

        <section class="apartment-grid">
          <main class="apartment-panel apartment-home">
            <h2 class="panel-title">Apartment Overview</h2>
            <div class="housing-card" data-housing></div>
            <div class="slot-grid" data-slots></div>
            <h2 class="panel-title">Owned Collection</h2>
            <div class="owned-collection" data-owned></div>
            <h2 class="panel-title">Vibe Totals</h2>
            <div class="vibe-score-card" data-vibe-score></div>
            <div class="vibe-grid" data-vibes></div>
          </main>

          <aside class="apartment-panel visitor-panel">
            <h2 class="panel-title">Visitors</h2>
            <div class="affinity-summary" data-affinity-summary></div>
            <div class="visitor-list" data-visitors></div>
            <div class="visitor-result" data-visitor-result></div>
          </aside>
        </section>
      </section>
    `;

    this.eventBannerEl = this.root.querySelector("[data-event-banner]");
    this.slotsEl = this.root.querySelector("[data-slots]");
    this.housingEl = this.root.querySelector("[data-housing]");
    this.ownedEl = this.root.querySelector("[data-owned]");
    this.vibesEl = this.root.querySelector("[data-vibes]");
    this.vibeScoreEl = this.root.querySelector("[data-vibe-score]");
    this.affinitySummaryEl = this.root.querySelector("[data-affinity-summary]");
    this.visitorsEl = this.root.querySelector("[data-visitors]");
    this.resultEl = this.root.querySelector("[data-visitor-result]");
    this.render();
  }

  render() {
    this.state.checkDailyEvent();
    this.renderEventBanner();
    this.renderSlots();
    this.renderOwnedCollection();
    this.renderVibes();
    this.renderAffinitySummary();
    this.renderVisitors();
    this.renderResult();
  }

  renderEventBanner() {
    const event = this.state.state.lastEventResult;
    if (!event || event.date !== this.state.core.today()) {
      this.eventBannerEl.innerHTML = "";
      this.eventBannerEl.style.display = "none";
      return;
    }
    this.eventBannerEl.style.display = "block";
    const tone = event.eddies > 0 ? "good" : event.eddies < 0 ? "bad" : "neutral";
    this.eventBannerEl.className = `event-banner tone-${tone}`;
    this.eventBannerEl.innerHTML = `
      <p>${event.text}</p>
      ${event.eddies ? `<b>${event.eddies > 0 ? "+" : ""}${event.eddies} eddies</b>` : ""}
    `;
  }

  renderSlots() {
    this.slotsEl.innerHTML = APARTMENT_SLOTS.map((slot) => {
      const equipped = itemById(this.state.state.equippedSlots[slot]);
      const ownedForSlot = itemsForSlot(slot).filter((item) => this.state.isOwned(item.id));
      return `
        <section class="equip-slot">
          <div class="slot-head">
            <b>${slot}</b>
            ${equipped ? `<button type="button" data-clear-slot="${slot}">Clear</button>` : ""}
          </div>
          <div class="equipped-card">
            ${equipped ? `<div class="item-icon small" aria-hidden="true">${equipped.icon}</div><span>${equipped.name}</span>` : `<span class="empty-slot">Empty</span>`}
          </div>
          <div class="equip-options">
            ${ownedForSlot.map((item) => `<button class="${equipped?.id === item.id ? "on" : ""}" type="button" data-equip-slot="${slot}" data-equip-item="${item.id}">${item.name}</button>`).join("") || "<small>No owned items for this slot.</small>"}
          </div>
        </section>
      `;
    }).join("");

    this.slotsEl.querySelectorAll("[data-equip-slot]").forEach((button) => {
      button.addEventListener("click", () => {
        this.state.equipItem(button.dataset.equipSlot, button.dataset.equipItem);
        this.render();
        this.onChange();
      });
    });
    this.slotsEl.querySelectorAll("[data-clear-slot]").forEach((button) => {
      button.addEventListener("click", () => {
        this.state.clearSlot(button.dataset.clearSlot);
        this.render();
        this.onChange();
      });
    });
  }

  renderOwnedCollection() {
    const ownedItems = APARTMENT_ITEMS.filter((item) => this.state.isOwned(item.id));
    this.ownedEl.innerHTML = ownedItems.map((item) => `
      <span class="owned-chip" title="${item.name}">
        <b aria-hidden="true">${item.icon}</b>${item.name}
      </span>
    `).join("");
  }

  renderVibes() {
    const equippedSlots = this.state.state.equippedSlots;
    const vibes = totalVibes(equippedSlots);
    const score = apartmentVibeScore(equippedSlots);
    const equippedCount = Object.values(equippedSlots).filter((itemId) => itemById(itemId)).length;
    this.housingEl.innerHTML = `
      <span>Housing Tier</span>
      <b>${housingTierForScore(score)}</b>
      <small>${equippedCount}/${APARTMENT_SLOTS.length} showcase slots equipped</small>
    `;
    this.vibeScoreEl.innerHTML = `
      <span>Apartment Vibe</span>
      <b>${score}</b>
      <i style="width:${score}%"></i>
    `;
    this.vibesEl.innerHTML = VIBE_KEYS.map((key) => {
      const value = vibes[key] || 0;
      return `
        <div class="vibe-meter">
          <span>${key}</span>
          <b>${value}</b>
          <i style="width:${Math.min(100, value * 14)}%"></i>
        </div>
      `;
    }).join("");
  }

  renderVisitors() {
    this.visitorsEl.innerHTML = VISITORS.map((visitor) => {
      const affinity = this.state.state.visitorAffinity[visitor.id] || 0;
      return `
        <button class="visitor-card ${this.state.state.selectedVisitorId === visitor.id ? "on" : ""}" type="button" data-visitor="${visitor.id}">
          <b>${visitor.name}</b>
          <span>${visitor.visitorType} / ${visitor.archetype}</span>
          <small>Likes ${visitor.likes.join(", ")}${visitor.visitorType === "vip" ? ` / Affinity ${affinity}` : ""}</small>
        </button>
      `;
    }).join("");

    this.visitorsEl.querySelectorAll("[data-visitor]").forEach((button) => {
      button.addEventListener("click", () => {
        this.state.selectVisitor(button.dataset.visitor);
        this.render();
      });
    });
  }

  renderAffinitySummary() {
    const vipAffinities = VISITORS
      .filter((visitor) => visitor.visitorType === "vip")
      .map((visitor) => ({
        visitor,
        affinity: this.state.state.visitorAffinity[visitor.id] || 0,
      }))
      .sort((a, b) => b.affinity - a.affinity)
      .slice(0, 4);

    this.affinitySummaryEl.innerHTML = `
      <span>VIP Affinity</span>
      ${vipAffinities.map(({ visitor, affinity }) => `
        <small><b>${visitor.name}</b> ${affinity}</small>
      `).join("")}
    `;
  }

  renderResult() {
    const visitor = visitorById(this.state.state.selectedVisitorId);
    const result = this.state.state.lastVisitorResult;
    const affinity = this.state.state.visitorAffinity[visitor.id] || 0;

    this.resultEl.innerHTML = `
      <div class="visitor-profile">
        <b>${visitor.name}</b>
        <span>${visitor.role} / ${visitor.visitorType}</span>
        <p>${visitor.personality}</p>
        <p>Likes ${visitor.likes.join(", ")}. Dislikes ${visitor.dislikes.join(", ")}.</p>
        <p>Favorite slots: ${visitor.favoriteSlots.join(", ")}.</p>
        ${visitor.visitorType === "vip" ? `
          <div class="affinity-bar"><i style="width:${Math.min(100, affinity * 8)}%"></i></div>
          <small>VIP Affinity ${affinity}</small>
        ` : `<small>Random visitor: smaller rewards, no affinity tracking.</small>`}
      </div>
      <button class="btn primary invite-btn" type="button" data-invite>Invite for Rating</button>
      ${result ? `
        <div class="rating-card tier-${result.tier}">
          <span>${result.tier.toUpperCase()} / ${result.score || 0}</span>
          <p>${result.dialogue}</p>
          <b>+${result.rewardAmount} ${result.rewardType === "xp" ? "XP" : "eddies"}${result.affinityGain ? ` · +${result.affinityGain} affinity` : ""}</b>
        </div>
      ` : `<div class="rating-card"><p>No visit logged yet.</p></div>`}
    `;

    this.resultEl.querySelector("[data-invite]").addEventListener("click", () => {
      this.state.inviteSelectedVisitor();
      this.render();
      this.onChange();
    });
  }
}
