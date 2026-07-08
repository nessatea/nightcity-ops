import { APARTMENT_ITEMS } from "./apartmentItems.js";

// Renders the Market tab: the apartment item shelf. Split out from
// apartmentView.js so Market is its own top-level section instead of a
// panel bolted onto the Apartment tab. Shares the same ApartmentState
// instance as apartmentView.js (passed in from main.js) so purchases show
// up immediately in the Apartment tab's owned collection / equip slots.
export class MarketView {
  constructor(root, apartmentState, onChange) {
    this.root = root;
    this.state = apartmentState;
    this.onChange = onChange || (() => {});
  }

  mount() {
    this.root.innerHTML = `
      <section class="panel">
        <h2 class="panel-title">Market</h2>
        <div class="market-list" data-market></div>
      </section>
    `;
    this.marketEl = this.root.querySelector("[data-market]");
    this.render();
  }

  render() {
    this.marketEl.innerHTML = APARTMENT_ITEMS.map((item) => {
      const owned = this.state.isOwned(item.id);
      const equipped = this.state.isEquipped(item.id);
      return `
        <article class="market-card ${owned ? "is-owned" : ""}">
          <div class="item-icon" aria-hidden="true">${item.icon}</div>
          <div>
            <b>${item.name}</b>
            <span>${item.compatibleSlot} / ${item.category} / ${item.rarity}</span>
            <p>${item.desc}</p>
            <div class="vibe-pills">${vibePills(item.vibes)}</div>
          </div>
          <button class="btn ${owned ? "" : "primary"}" type="button" data-buy="${item.id}" ${owned && !item.allowMultiples ? "disabled" : ""}>
            ${owned ? (equipped ? "Equipped" : "Owned") : `Buy ${item.price}`}
          </button>
        </article>
      `;
    }).join("");

    this.marketEl.querySelectorAll("[data-buy]").forEach((button) => {
      button.addEventListener("click", () => {
        this.state.buyItem(button.dataset.buy);
        this.render();
        this.onChange();
      });
    });
  }
}

function vibePills(vibes) {
  return Object.entries(vibes)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `<small>${key} +${value}</small>`)
    .join("");
}
