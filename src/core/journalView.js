import { computeStability, debriefText, deleteShard, logShard } from "./shards.js";
import { escapeHtml } from "./utils.js";

const SHARD_TYPES = ["Workout", "Nutrition", "Sleep", "Water", "Mood", "Recovery", "App Audit", "Journal"];

export class LogView {
  constructor(root, core, onChange) {
    this.root = root;
    this.core = core;
    this.onChange = onChange || (() => {});
  }

  mount() {
    this.root.innerHTML = `
      <div class="panel">
        <h2>UPLINK LOG <span class="tag">LAST 91 DAYS</span></h2>
        <div class="heat" data-heat></div>
        <div class="legend">
          LOW <span class="d" style="background:var(--panel);border:1px solid var(--line)"></span>
          <span class="d l1"></span><span class="d l2"></span><span class="d l3"></span> FULL SYNC
          &nbsp;·&nbsp; <span style="outline:1px solid var(--yellow);outline-offset:1px;width:12px;height:12px;display:inline-block"></span> TODAY
        </div>
      </div>
      <div class="panel">
        <h2>DAILY DEBRIEF <span class="tag" data-debrief-tag></span></h2>
        <div data-debrief></div>
      </div>
      <div class="panel">
        <h2>SHARD LOG <span class="tag">MANUAL ENTRIES</span></h2>
        <div class="shardform">
          <select data-shard-type>${SHARD_TYPES.map((t) => `<option>${t}</option>`).join("")}</select>
          <input type="number" data-shard-energy min="1" max="5" value="3" title="Energy 1-5">
          <input type="number" data-shard-mood min="1" max="5" value="3" title="Mood 1-5">
          <textarea data-shard-note placeholder="Optional shard note: what happened, what app you logged in, what felt good, what needs recovery..."></textarea>
        </div>
        <button class="btn y" data-add-shard>+ ARCHIVE SHARD</button>
        <div class="entrylist" data-entry-list></div>
      </div>
      <div class="panel">
        <h2>SYSTEM DIAGNOSTICS</h2>
        <div class="diag" data-diag></div>
      </div>
    `;

    this.root.querySelector("[data-add-shard]").addEventListener("click", () => {
      logShard(this.core, {
        type: this.root.querySelector("[data-shard-type]").value,
        energy: this.root.querySelector("[data-shard-energy]").value,
        mood: this.root.querySelector("[data-shard-mood]").value,
        note: this.root.querySelector("[data-shard-note]").value,
      });
      this.root.querySelector("[data-shard-note]").value = "";
      this.root.querySelector("[data-shard-energy]").value = 3;
      this.root.querySelector("[data-shard-mood]").value = 3;
      this.render();
      this.onChange();
    });

    this.render();
  }

  render() {
    this.renderHeat();
    this.renderDebrief();
    this.renderShards();
    this.renderDiag();
  }

  renderHeat() {
    const t = this.core.today();
    let html = "";
    for (let i = 90; i >= 0; i--) {
      const day = this.core.daysAgo(i);
      let cls = "d";
      if (day === t) {
        const doneN = Object.keys(this.core.state.today.done).length;
        const total = this.core.state.apps.length;
        const r = total ? doneN / total : 0;
        cls += (r >= 1 ? " l3" : r >= 0.66 ? " l2" : r >= 0.33 ? " l1" : "") + " today";
      } else {
        const hh = this.core.state.history[day];
        if (hh) {
          const r = hh.total ? hh.done / hh.total : 0;
          cls += r >= 1 ? " l3" : r >= 0.66 ? " l2" : r >= 0.33 ? " l1" : "";
        }
      }
      html += `<div class="${cls}" title="${day}"></div>`;
    }
    this.root.querySelector("[data-heat]").innerHTML = html;
  }

  renderDebrief() {
    this.root.querySelector("[data-debrief-tag]").textContent = this.core.today();
    const d = debriefText(this.core);
    this.root.querySelector("[data-debrief]").innerHTML = `<div class="debrief"><b>${d.pct}% ${d.status.toUpperCase()}</b><br>${escapeHtml(d.summary)}</div>`;
  }

  renderShards() {
    const entries = (this.core.state.shards || []).slice().sort((a, b) => String(b.id).localeCompare(String(a.id))).slice(0, 18);
    const el = this.root.querySelector("[data-entry-list]");
    el.innerHTML = entries.length
      ? entries.map((x) => `
        <div class="entry"><button class="x" data-del-shard="${x.id}">✕</button>
        <div class="meta">${escapeHtml(x.date)} · ${escapeHtml(x.type)} · ENERGY ${escapeHtml(String(x.energy))} · MOOD ${escapeHtml(String(x.mood))}</div>
        <div class="note">${x.note ? escapeHtml(x.note) : '<span class="small">No note added.</span>'}</div></div>
      `).join("")
      : `<p class="small">No shards archived yet. Add manual context for workouts, meals, mood, sleep, water, or app-log cleanup.</p>`;
    el.querySelectorAll("[data-del-shard]").forEach((btn) => {
      btn.addEventListener("click", () => {
        deleteShard(this.core, btn.dataset.delShard);
        this.render();
      });
    });
  }

  renderDiag() {
    const days = Object.keys(this.core.state.history).length + (this.core.state.today.date ? 1 : 0);
    const fulls = Object.values(this.core.state.history).filter((h) => h.full).length;
    const st = computeStability(this.core);
    const rows = [
      ["TOTAL SYNCS", this.core.state.totalLogs],
      ["FULL DAYS", fulls],
      ["CURRENT UPTIME", this.core.state.streak.cur],
      ["PEAK UPTIME", this.core.state.streak.best],
      ["DAYS TRACKED", days],
      ["BALANCE €$", this.core.state.eddies.toLocaleString()],
      ["STREET CRED LVL", this.core.state.level],
      ["CYBERWARE", Object.keys(this.core.state.ownedUpgrades).length],
      ["SHARDS", (this.core.state.shards || []).length],
      ["STABILITY", st.score + "%"],
    ];
    this.root.querySelector("[data-diag]").innerHTML = rows.map(([k, v]) => `<div class="d"><b>${v}</b><span>${k}</span></div>`).join("");
  }
}
