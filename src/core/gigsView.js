import { ATTRS, UPGRADES } from "./constants.js";
import { claimContract, contractDefs } from "./contracts.js";
import { computeStability } from "./shards.js";
import { escapeHtml } from "./utils.js";

// Renders the Gigs tab: fixer contracts, a recovery-gig nudge, the
// attribute matrix, and cyberware upgrades (XP/eddies boosts, streak
// insurance) — upgrades live here rather than Settings or Market since
// they're "spend eddies on progression," same as contracts.
export class GigsView {
  constructor(root, core, onChange) {
    this.root = root;
    this.core = core;
    this.onChange = onChange || (() => {});
  }

  mount() {
    this.root.innerHTML = `
      <div class="panel">
        <h2>FIXER CONTRACTS <span class="tag" data-contract-tag></span></h2>
        <div class="contracts" data-contracts></div>
      </div>
      <div class="panel">
        <h2>RECOVERY GIG</h2>
        <div data-recovery-gig></div>
      </div>
      <div class="panel">
        <h2>CYBERWARE UPGRADES <span class="tag">SPEND EDDIES ON PROGRESSION</span></h2>
        <div class="shelf" data-upgrades></div>
      </div>
      <div class="panel">
        <h2>ATTRIBUTE MATRIX <span class="tag">BODY · REFLEXES · COOL · TECH · INT</span></h2>
        <div class="attrgrid" data-attr-matrix></div>
      </div>
    `;
    this.render();
  }

  render() {
    this.renderContracts();
    this.renderUpgrades();
    this.renderAttributes();
  }

  renderContracts() {
    this.root.querySelector("[data-contract-tag]").textContent = this.core.today() + " · WEEK " + this.core.weekKey();
    const defs = contractDefs(this.core);
    this.root.querySelector("[data-contracts]").innerHTML = defs.map((c) => {
      const key = c.id + "_" + c.key;
      const claimed = !!this.core.state.contractClaims[key];
      const complete = c.progress >= c.goal;
      const pct = Math.min(100, Math.round((c.progress / c.goal) * 100));
      return `
        <div class="contract ${complete ? "done " : ""}${claimed ? "claimed" : ""}">
          <div class="scope">${c.scope} CONTRACT</div>
          <div class="title">${escapeHtml(c.title)}</div>
          <div class="fixer">FIXER · ${escapeHtml(c.fixer)}</div>
          <div class="desc">${escapeHtml(c.desc)}</div>
          <div class="metar"><span>${Math.min(c.progress, c.goal)} / ${c.goal}</span><span>${pct}%</span></div>
          <div class="meter"><i style="width:${pct}%"></i></div>
          <div class="reward">REWARD · ${c.xp} XP · ${c.ed} €$</div>
          <button class="buy" data-claim="${c.id}" ${!complete || claimed ? "disabled" : ""}>${claimed ? "CLAIMED" : complete ? "CLAIM REWARD" : "IN PROGRESS"}</button>
        </div>
      `;
    }).join("");

    this.root.querySelectorAll("[data-claim]").forEach((btn) => {
      btn.addEventListener("click", () => {
        claimContract(this.core, btn.dataset.claim);
        this.render();
        this.onChange();
      });
    });

    const st = computeStability(this.core);
    this.root.querySelector("[data-recovery-gig]").innerHTML = `
      <div class="debrief">
        <b>${st.band} · ${st.score}%</b><br>${escapeHtml(st.rec)}<br><br>
        <span class="small">Try logging a Recovery, Mood, Sleep, or Water shard when the score dips. This keeps the app from only rewarding grind mode.</span>
      </div>
    `;
  }

  renderUpgrades() {
    this.root.querySelector("[data-upgrades]").innerHTML = UPGRADES.map((u) => {
      const locked = this.core.state.level < u.lvl;
      const owned = !!this.core.state.ownedUpgrades[u.id];
      const poor = this.core.state.eddies < u.price;
      return `
        <div class="item ${owned ? "owned" : ""}">
          ${owned ? `<span class="req">INSTALLED</span>` : locked ? `<span class="req">LVL ${u.lvl}</span>` : ""}
          <div class="big">${u.e}</div><div class="nm">${escapeHtml(u.nm)}</div>
          <div class="desc">${escapeHtml(u.desc)}</div>
          <button class="buy" data-buy-upgrade="${u.id}" ${owned || locked || poor ? "disabled" : ""}>${owned ? "ACTIVE" : locked ? "LOCKED" : u.price + " €$"}</button>
        </div>
      `;
    }).join("");

    this.root.querySelectorAll("[data-buy-upgrade]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const upgrade = UPGRADES.find((u) => u.id === btn.dataset.buyUpgrade);
        if (!upgrade || this.core.state.level < upgrade.lvl || this.core.state.ownedUpgrades[upgrade.id]) return;
        if (!this.core.spend(upgrade.price)) return;
        this.core.state.ownedUpgrades[upgrade.id] = true;
        this.core.persist();
        this.render();
        this.onChange();
      });
    });
  }

  renderAttributes() {
    const counts = this.core.attrStats();
    this.root.querySelector("[data-attr-matrix]").innerHTML = ATTRS.map((a) => {
      const c = counts[a.id] || 0;
      const p = Math.min(100, c * 20);
      return `
        <div class="attrcard">
          <div class="hd"><span class="em">${a.e}</span>${a.nm}</div>
          <div class="cnt">${c} signal${c === 1 ? "" : "s"} this week · ${escapeHtml(a.desc)}</div>
          <div class="meter"><i style="width:${p}%"></i></div>
        </div>
      `;
    }).join("");
  }
}
