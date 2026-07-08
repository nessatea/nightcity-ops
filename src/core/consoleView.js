import { attrMeta, ATTRS } from "./constants.js";
import { computeStability } from "./shards.js";
import { escapeHtml } from "./utils.js";

// Renders the Console tab: today's sync queue, status banner, reactor
// gauge, streak/XP cred panel, system stability, and attribute matrix.
export class ConsoleView {
  constructor(root, core, onChange) {
    this.root = root;
    this.core = core;
    this.onChange = onChange || (() => {});
  }

  mount() {
    this.root.innerHTML = `
      <div data-status></div>
      <div class="cols">
        <div class="panel">
          <h2>DATA SYNC QUEUE <span class="tag" data-today-tag></span></h2>
          <div data-queue></div>
        </div>
        <div class="panel">
          <h2>ATTRIBUTE MATRIX <span class="tag">LAST 7 DAYS</span></h2>
          <div class="attrgrid" data-attrs></div>
        </div>
        <div>
          <div class="panel">
            <h2>REACTOR</h2>
            <div class="reactor">
              <div class="gauge">
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <circle cx="90" cy="90" r="78" fill="none" stroke="#1a1a28" stroke-width="12"/>
                  <circle data-gauge-arc cx="90" cy="90" r="78" fill="none" stroke="url(#gg)" stroke-width="12"
                    stroke-dasharray="490" stroke-dashoffset="490" stroke-linecap="round"/>
                  <defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#00e5ff"/><stop offset="1" stop-color="#fcee0a"/>
                  </linearGradient></defs>
                </svg>
                <div class="num"><b data-gauge-pct>0%</b><small data-gauge-sub>0 / 0 SYNCED</small></div>
              </div>
            </div>
          </div>
          <div class="panel">
            <h2>STREET CRED</h2>
            <div class="metar"><span data-lvl-label>LVL 1</span><span data-xp-label>0 / 100 XP</span></div>
            <div class="xpbar"><i data-xp-fill style="width:0%"></i></div>
            <div class="streakrow" style="margin-top:16px">
              <div class="sbox cur"><b data-s-cur>0</b><span>UPTIME (DAYS)</span></div>
              <div class="sbox best"><b data-s-best>0</b><span>PEAK UPTIME</span></div>
              <div class="sbox rate"><b data-s-rate>0%</b><span>SYNC RATE</span></div>
            </div>
          </div>
          <div class="panel">
            <h2>SYSTEM STABILITY</h2>
            <div data-stability></div>
          </div>
        </div>
      </div>
    `;
    this.render();
  }

  render() {
    this.renderStatus();
    this.renderQueue();
    this.renderReactor();
    this.renderCred();
    this.renderStability();
    this.renderAttributes();
  }

  renderStatus() {
    const total = this.core.state.apps.length;
    const doneN = Object.keys(this.core.state.today.done).length;
    const el = this.root.querySelector("[data-status]");
    const broken = this.core.state.streak.cur === 0 && this.core.state.streak.best > 0 && doneN < total;
    if (total > 0 && doneN >= total) {
      el.innerHTML = `<div class="status done"><div class="big">◆ ALL SYSTEMS SYNCED</div><div class="sub">Uptime secured · ${this.core.state.streak.cur}-day streak · come back tomorrow, choom</div></div>`;
    } else if (doneN > 0 || !broken) {
      const rem = total - doneN;
      el.innerHTML = `<div class="status risk"><div class="big">⚠ ${rem} NODE${rem === 1 ? "" : "S"} UNSYNCED</div><div class="sub">Streak at risk. Log the rest before the day rolls over at ${String(this.core.state.settings.resetHour || 0).padStart(2, "0")}:00. Set a phone alarm as backup.</div></div>`;
    } else {
      el.innerHTML = `<div class="status broken"><div class="big">▼ CONNECTION LOST</div><div class="sub">Streak flatlined. Re-establish the uplink — clear today's queue to start a new run.</div></div>`;
    }
  }

  renderQueue() {
    this.root.querySelector("[data-today-tag]").textContent = this.core.today();
    const q = this.root.querySelector("[data-queue]");
    if (!this.core.state.apps.length) {
      q.innerHTML = `<p class="small">No nodes configured. Add your fitness apps in CONFIG.</p>`;
      return;
    }
    q.innerHTML = this.core.state.apps.map((a) => {
      const on = !!this.core.state.today.done[a.id];
      const at = attrMeta(a.attr);
      return `
        <div class="node ${on ? "done" : ""}" data-toggle-app="${a.id}">
          <div class="box"></div><div class="ico">${a.e || "▸"}</div>
          <div class="nm">${escapeHtml(a.nm)} <span class="attrpill">${at.e} ${at.nm}</span></div>
          <div class="st">${on ? "SYNCED" : "PENDING"}</div>
        </div>
      `;
    }).join("");
    q.querySelectorAll("[data-toggle-app]").forEach((node) => {
      node.addEventListener("click", () => {
        this.core.toggleApp(node.dataset.toggleApp);
        this.render();
        this.onChange();
      });
    });
  }

  renderReactor() {
    const total = this.core.state.apps.length;
    const doneN = Object.keys(this.core.state.today.done).length;
    const pct = total ? Math.round((doneN / total) * 100) : 0;
    const circ = 490;
    this.root.querySelector("[data-gauge-arc]").style.strokeDashoffset = circ - (circ * pct) / 100;
    this.root.querySelector("[data-gauge-pct]").textContent = pct + "%";
    this.root.querySelector("[data-gauge-sub]").textContent = doneN + " / " + total + " SYNCED";
  }

  renderCred() {
    const need = this.core.xpForLevel(this.core.state.level);
    this.root.querySelector("[data-lvl-label]").textContent = "LVL " + this.core.state.level;
    this.root.querySelector("[data-xp-label]").textContent = this.core.state.xp + " / " + need + " XP";
    this.root.querySelector("[data-xp-fill]").style.width = Math.min(100, (this.core.state.xp / need) * 100) + "%";
    this.root.querySelector("[data-s-cur]").textContent = this.core.state.streak.cur;
    this.root.querySelector("[data-s-best]").textContent = this.core.state.streak.best;
    const days = Object.keys(this.core.state.history).length + (this.core.state.today.date ? 1 : 0);
    const fulls = Object.values(this.core.state.history).filter((h) => h.full).length + ((this.core.state.apps.length && Object.keys(this.core.state.today.done).length >= this.core.state.apps.length) ? 1 : 0);
    this.root.querySelector("[data-s-rate]").textContent = (days ? Math.round((fulls / days) * 100) : 0) + "%";
  }

  renderStability() {
    const el = this.root.querySelector("[data-stability]");
    const st = computeStability(this.core);
    el.innerHTML = `
      <div class="stability">
        <div class="score ${st.cls}">${st.score}</div>
        <div>
          <div class="metar"><span>${st.band}</span><span>SYSTEM BALANCE</span></div>
          <div class="meter"><i style="width:${st.score}%"></i></div>
          <p class="small" style="margin-top:10px">${escapeHtml(st.rec)}</p>
        </div>
      </div>
    `;
  }

  renderAttributes() {
    const counts = this.core.attrStats();
    this.root.querySelector("[data-attrs]").innerHTML = ATTRS.map((a) => {
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
