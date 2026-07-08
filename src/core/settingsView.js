import { ATTRS, guessAttr } from "./constants.js";
import { pick, RND_BROKEN, RND_COLORS, RND_DONE, RND_NAMES, RND_PENDING, RND_ROLES } from "./npcs.js";
import { escapeHtml } from "./utils.js";

export class SettingsView {
  constructor(root, core, onChange) {
    this.root = root;
    this.core = core;
    this.onChange = onChange || (() => {});
  }

  mount() {
    this.root.innerHTML = `
      <div class="panel">
        <h2>SYNC QUEUE // YOUR FITNESS APPS</h2>
        <p class="small" style="margin-bottom:12px">These are the data nodes you sync each day. Rename them to your actual apps, pick an icon, add or remove as needed.</p>
        <div data-app-editor></div>
        <button class="btn y" data-add-app style="margin-top:6px">+ ADD NODE</button>
      </div>
      <div class="panel">
        <h2>RESIDENTS // NPC ROSTER</h2>
        <p class="small" style="margin-bottom:12px">Your crew moves in as you level up. Edit names, roles, colors, unlock level, and what they say. Lines are grouped by mood — one line per row. Roll a random stranger to add someone new to Night City.</p>
        <div data-npc-editor></div>
        <button class="btn m" data-roll-npc style="margin-top:6px">⚄ ROLL RANDOM RESIDENT</button>
      </div>
      <div class="panel">
        <h2>TERMINAL CONFIG</h2>
        <div class="field">
          <label>DAILY RESET HOUR (0–23) — when the day rolls over</label>
          <input type="number" data-reset-hour min="0" max="23" style="max-width:120px">
        </div>
        <div class="field">
          <label>SOUND FX</label>
          <div class="toggle" data-sound-toggle><div class="sw"><i></i></div><span class="small">Blips on log &amp; alerts</span></div>
        </div>
        <div class="field" style="margin-top:22px">
          <label>DANGER ZONE</label>
          <button class="btn danger" data-wipe>⚠ WIPE ALL DATA</button>
        </div>
      </div>
    `;

    this.root.querySelector("[data-add-app]").addEventListener("click", () => {
      this.core.state.apps.push({ id: "a" + Date.now(), nm: "New Node", e: "▸", attr: "tech" });
      this.core.persist();
      this.render();
      this.onChange();
    });
    this.root.querySelector("[data-roll-npc]").addEventListener("click", () => {
      const nm = pick(RND_NAMES);
      this.core.state.npcs.push({
        id: "r" + Date.now(), nm, role: pick(RND_ROLES), color: pick(RND_COLORS), lvl: this.core.state.level,
        done: RND_DONE.slice(), pending: RND_PENDING.slice(), broken: RND_BROKEN.slice(),
      });
      this.core.persist();
      this.render();
      this.onChange();
    });
    this.root.querySelector("[data-reset-hour]").addEventListener("change", (e) => {
      this.core.state.settings.resetHour = Math.max(0, Math.min(23, parseInt(e.target.value) || 0));
      this.core.persist();
      this.onChange();
    });
    this.root.querySelector("[data-sound-toggle]").addEventListener("click", () => {
      this.core.state.settings.sound = !this.core.state.settings.sound;
      this.core.persist();
      this.render();
    });
    this.root.querySelector("[data-wipe]").addEventListener("click", () => {
      if (confirm("Wipe ALL habit-tracker progress — streaks, eddies, contracts, training, residents, everything? This cannot be undone.")) {
        localStorage.removeItem("nightcity_ops_core_v1");
        location.reload();
      }
    });

    this.render();
  }

  render() {
    this.renderAppEditor();
    this.renderNpcEditor();
    this.root.querySelector("[data-reset-hour]").value = this.core.state.settings.resetHour;
    this.root.querySelector("[data-sound-toggle]").classList.toggle("on", this.core.state.settings.sound);
  }

  renderAppEditor() {
    const el = this.root.querySelector("[data-app-editor]");
    el.innerHTML = this.core.state.apps.map((a, i) => {
      const opts = ATTRS.map((at) => `<option value="${at.id}" ${(a.attr || guessAttr(a.nm)) === at.id ? "selected" : ""}>${at.e} ${at.nm}</option>`).join("");
      return `
        <div class="editrow">
          <input class="iconpick" value="${escapeHtml(a.e || "")}" maxlength="4" data-edit-app-icon="${i}">
          <input type="text" value="${escapeHtml(a.nm)}" data-edit-app-name="${i}">
          <select style="max-width:170px" data-edit-app-attr="${i}">${opts}</select>
          <button class="btn x" data-del-app="${i}">✕</button>
        </div>
      `;
    }).join("");

    el.querySelectorAll("[data-edit-app-icon]").forEach((input) => {
      input.addEventListener("change", () => this.editApp(Number(input.dataset.editAppIcon), "e", input.value));
    });
    el.querySelectorAll("[data-edit-app-name]").forEach((input) => {
      input.addEventListener("change", () => this.editApp(Number(input.dataset.editAppName), "nm", input.value));
    });
    el.querySelectorAll("[data-edit-app-attr]").forEach((select) => {
      select.addEventListener("change", () => this.editApp(Number(select.dataset.editAppAttr), "attr", select.value));
    });
    el.querySelectorAll("[data-del-app]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (this.core.state.apps.length <= 1) return;
        this.core.state.apps.splice(Number(btn.dataset.delApp), 1);
        this.core.persist();
        this.render();
        this.onChange();
      });
    });
  }

  editApp(i, key, value) {
    this.core.state.apps[i][key] = key === "attr" ? value : value.trim() || this.core.state.apps[i][key];
    this.core.persist();
    this.onChange();
  }

  renderNpcEditor() {
    const el = this.root.querySelector("[data-npc-editor]");
    el.innerHTML = this.core.state.npcs.map((n, i) => `
      <div class="npc-edit">
        <div class="hd">
          <input type="text" class="iconpick" style="width:76px" value="${escapeHtml(n.color)}" data-npc-color="${i}" title="hex color">
          <input type="text" value="${escapeHtml(n.nm)}" data-npc-name="${i}" placeholder="name">
          <input type="text" value="${escapeHtml(n.role)}" data-npc-role="${i}" placeholder="role" style="max-width:170px">
          <span class="small">LVL <input type="number" min="1" value="${n.lvl}" style="width:56px" data-npc-lvl="${i}"></span>
          <button class="btn x" data-del-npc="${i}">✕</button>
        </div>
        <label class="small">SAYS WHEN DAY COMPLETE</label>
        <textarea data-npc-done="${i}">${escapeHtml((n.done || []).join("\n"))}</textarea>
        <label class="small" style="margin-top:8px;display:block">SAYS WHILE NODES PENDING</label>
        <textarea data-npc-pending="${i}">${escapeHtml((n.pending || []).join("\n"))}</textarea>
        <label class="small" style="margin-top:8px;display:block">SAYS WHEN STREAK BREAKS</label>
        <textarea data-npc-broken="${i}">${escapeHtml((n.broken || []).join("\n"))}</textarea>
      </div>
    `).join("");

    const bindField = (selector, key) => {
      el.querySelectorAll(`[${selector}]`).forEach((input) => {
        input.addEventListener("change", () => {
          const i = Number(input.dataset[toCamel(selector)]);
          this.core.state.npcs[i][key] = key === "lvl" ? Math.max(1, parseInt(input.value) || 1) : input.value;
          this.core.persist();
          this.onChange();
        });
      });
    };
    bindField("data-npc-color", "color");
    bindField("data-npc-name", "nm");
    bindField("data-npc-role", "role");
    bindField("data-npc-lvl", "lvl");

    const bindLines = (selector, key) => {
      el.querySelectorAll(`[${selector}]`).forEach((textarea) => {
        textarea.addEventListener("change", () => {
          const i = Number(textarea.dataset[toCamel(selector)]);
          this.core.state.npcs[i][key] = textarea.value.split("\n").map((x) => x.trim()).filter(Boolean);
          this.core.persist();
        });
      });
    };
    bindLines("data-npc-done", "done");
    bindLines("data-npc-pending", "pending");
    bindLines("data-npc-broken", "broken");

    el.querySelectorAll("[data-del-npc]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.core.state.npcs.splice(Number(btn.dataset.delNpc), 1);
        this.core.persist();
        this.render();
        this.onChange();
      });
    });
  }
}

function toCamel(dataAttr) {
  return dataAttr.replace(/^data-/, "").replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
