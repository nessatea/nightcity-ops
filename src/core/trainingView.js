import { TRAINING_CYCLE } from "./constants.js";
import {
  addTrainingMeasurement,
  addTrainingPhotoFromFile,
  deleteTrainingMeasurement,
  deleteTrainingPhoto,
  deleteTrainingSession,
  finishTrainingSession,
  lastExerciseSetsForKey,
  normalizeActiveTrainingSession,
  scheduledTrainingKey,
  selectTrainingForToday,
  setTrainingSetField,
  startTrainingSession,
  toggleTrainingSet,
  trainingDay,
  trainingKey,
  trainingSessionCounts,
  TRAINING_PICKER_OPTIONS,
} from "./training.js";
import { escapeHtml } from "./utils.js";

export class TrainingView {
  constructor(root, core, onChange) {
    this.root = root;
    this.core = core;
    this.onChange = onChange || (() => {});
  }

  mount() {
    this.root.innerHTML = `
      <div class="panel">
        <h2>TRAINING CONTRACT <span class="tag" data-train-tag></span></h2>
        <div class="trainHero">
          <div class="trainCycle">
            <div class="metar"><span>ROTATION</span><span data-cycle-label>1 / 4</span></div>
            <div class="cycleDots" data-cycle-dots></div>
            <p class="small">Position 1 alternates Variant A and B. Completing a contract advances the rotation and feeds Body progression.</p>
          </div>
          <div>
            <div class="trainTitle" data-train-name>Loading...</div>
            <div class="trainSub" data-train-sub></div>
            <div class="trainPicker">
              <label for="trainingKeySelect">TODAY'S CONTRACT OVERRIDE</label>
              <select data-training-key-select></select>
              <div class="hint" data-picker-hint></div>
            </div>
            <div class="trainStats">
              <div class="trainStat"><b data-train-streak>0</b><span>TRAINING STREAK</span></div>
              <div class="trainStat"><b data-train-total>0</b><span>CONTRACTS CLOSED</span></div>
              <div class="trainStat"><b data-train-sets>0%</b><span>ACTIVE SET SYNC</span></div>
            </div>
            <div class="trainActions">
              <button type="button" class="btn y" data-start-training>ACCEPT TRAINING CONTRACT</button>
              <button type="button" class="btn m" data-finish-training>CLOSE OUT CONTRACT</button>
            </div>
          </div>
        </div>
      </div>

      <div class="panel" data-active-training-panel>
        <h2>ACTIVE LIFT LOG <span class="tag" data-active-train-tag></span></h2>
        <div data-training-log class="trainingLog"></div>
      </div>

      <div class="panel">
        <h2>TODAY'S LIFT PLAN <span class="tag" data-planned-tag></span></h2>
        <p class="small" data-planned-hint style="margin-bottom:12px"></p>
        <div data-planned-list class="plannedList"></div>
      </div>

      <div class="panel">
        <h2>TRAINING HISTORY <span class="tag">LAST 10 CONTRACTS</span></h2>
        <div data-training-history class="historyList"></div>
      </div>

      <div class="panel">
        <h2>RIPPERDOC PROGRESS FILE <span class="tag">PHOTOS + MEASUREMENTS</span></h2>
        <div class="progressGrid">
          <div>
            <p class="small">Progress photos stay on this device. The app downscales them before saving so localStorage does not flatline immediately.</p>
            <div class="photoGrid" data-training-photos></div>
            <input type="file" data-training-photo-input accept="image/*" style="display:none">
          </div>
          <div>
            <div class="measForm">
              <div><label>WEIGHT (LB)</label><input type="number" data-meas-weight inputmode="decimal"></div>
              <div><label>HIPS (IN)</label><input type="number" data-meas-hips inputmode="decimal"></div>
              <div><label>THIGH (IN)</label><input type="number" data-meas-thigh inputmode="decimal"></div>
            </div>
            <button class="btn y" data-save-measurement>SAVE BIOMETRIC READING</button>
            <table class="measTable"><thead><tr><th>Date</th><th>Wt</th><th>Hips</th><th>Thigh</th><th></th></tr></thead><tbody data-training-measures></tbody></table>
          </div>
        </div>
      </div>

      <div class="panel">
        <h2>TRAINING INTEL <span class="tag">NO NUTRITION MODULE IMPORTED</span></h2>
        <div class="intelGrid">
          <div class="intelCard"><b>Rotation:</b> Lower glutes/hamstrings, upper pull, lower quads, upper push. Position 1 alternates Variant A and Variant B for fuller glute coverage.</div>
          <div class="intelCard"><b>Overload:</b> When you hit the top of the rep range for all sets with good form twice, increase load next time: 2.5-5 lb upper body, 5-10 lb lower body.</div>
          <div class="intelCard"><b>Deload:</b> Every 4-6 weeks, reduce volume and reassess working weights, pull-up assistance, and push-up incline height.</div>
          <div class="intelCard"><b>Recovery rule:</b> If a session feels wrong, drop one set per exercise instead of forcing bad reps or skipping the contract entirely.</div>
        </div>
      </div>
    `;

    this.root.querySelector("[data-training-key-select]").addEventListener("change", (e) => {
      selectTrainingForToday(this.core, e.target.value);
      this.render();
      this.onChange();
    });
    this.root.querySelector("[data-start-training]").addEventListener("click", () => {
      startTrainingSession(this.core);
      this.render();
      this.onChange();
      this.focusLog();
    });
    this.root.querySelector("[data-finish-training]").addEventListener("click", () => {
      finishTrainingSession(this.core);
      this.render();
      this.onChange();
    });
    this.root.querySelector("[data-save-measurement]").addEventListener("click", () => {
      const weight = this.root.querySelector("[data-meas-weight]").value.trim();
      const hips = this.root.querySelector("[data-meas-hips]").value.trim();
      const thigh = this.root.querySelector("[data-meas-thigh]").value.trim();
      if (addTrainingMeasurement(this.core, { weight, hips, thigh })) {
        this.root.querySelector("[data-meas-weight]").value = "";
        this.root.querySelector("[data-meas-hips]").value = "";
        this.root.querySelector("[data-meas-thigh]").value = "";
        this.renderProgress();
      }
    });
    this.root.querySelector("[data-training-photo-input]").addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      addTrainingPhotoFromFile(this.core, file).then(() => this.renderProgress());
      e.target.value = "";
    });

    this.render();
  }

  focusLog() {
    const panel = this.root.querySelector("[data-active-training-panel]");
    if (panel && panel.scrollIntoView) panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  render() {
    const T = this.core.state.training;
    const key = T.currentSession ? T.currentSession.key : trainingKey(this.core);
    const day = trainingDay(key);
    const counts = trainingSessionCounts(T.currentSession);
    const plannedSets = day.exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);
    const selectedOverride = T.selectedKeyByDate && T.selectedKeyByDate[this.core.today()];

    this.root.querySelector("[data-train-tag]").textContent = this.core.today() + (T.currentSession ? " · ACTIVE" : selectedOverride ? " · CUSTOM" : " · AUTO");
    this.root.querySelector("[data-train-name]").textContent = day.name;
    this.root.querySelector("[data-train-sub]").textContent = day.sub + " · " + day.exercises.length + " lifts · " + plannedSets + " sets";
    this.root.querySelector("[data-cycle-label]").textContent = (T.cyclePos + 1) + " / 4";
    this.root.querySelector("[data-train-streak]").textContent = T.streak || 0;
    this.root.querySelector("[data-train-total]").textContent = T.totalCompleted || 0;
    this.root.querySelector("[data-train-sets]").textContent = counts.pct + "%";
    const startBtn = this.root.querySelector("[data-start-training]");
    startBtn.textContent = T.currentSession ? "CONTINUE ACTIVE LIFT LOG" : "ACCEPT TRAINING CONTRACT";
    this.root.querySelector("[data-finish-training]").style.display = T.currentSession ? "inline-block" : "none";
    this.root.querySelector("[data-cycle-dots]").innerHTML = TRAINING_CYCLE.map((x, i) =>
      `<div class="cycleDot ${i === T.cyclePos ? "on " : ""}${i < T.cyclePos ? "done" : ""}">POS ${i + 1}<br><span>${x === "1" ? "A/B" : x}</span></div>`
    ).join("");

    this.renderPicker(T, key);
    this.renderPlan();
    this.renderLog();
    this.renderHistory();
    this.renderProgress();
  }

  renderPicker(T, key) {
    const sel = this.root.querySelector("[data-training-key-select]");
    const scheduled = scheduledTrainingKey(T);
    const override = T.selectedKeyByDate && T.selectedKeyByDate[this.core.today()];
    const value = override || "auto";
    const autoLabel = "Auto rotation · " + trainingDay(scheduled).name;
    sel.innerHTML = TRAINING_PICKER_OPTIONS.map((o) => {
      const label = o.key === "auto" ? autoLabel : o.label;
      return `<option value="${escapeHtml(o.key)}">${escapeHtml(label)}</option>`;
    }).join("");
    sel.value = value;
    sel.disabled = !!T.currentSession;
    const hint = this.root.querySelector("[data-picker-hint]");
    if (T.currentSession) hint.textContent = "Active contract is locked to " + trainingDay(T.currentSession.key).name + ". Close it out before switching workouts.";
    else if (override) hint.textContent = "Custom workout selected for today. Closing it saves the session, but the automatic rotation stays on " + trainingDay(scheduled).name + " unless the custom workout matches it.";
    else hint.textContent = "Using the automatic rotation. Pick a different contract here when today needs a swap.";
  }

  renderPlan() {
    const T = this.core.state.training;
    const key = T.currentSession ? T.currentSession.key : trainingKey(this.core);
    const day = trainingDay(key);
    const totalSets = day.exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);
    this.root.querySelector("[data-planned-tag]").textContent = day.exercises.length + " LIFTS · " + totalSets + " SETS";
    this.root.querySelector("[data-planned-hint]").textContent = T.currentSession
      ? "Active contract loaded below. This is the lift plan you are logging right now."
      : "This is the actual exercise list for the current rotation. Accept the contract to turn this plan into editable weight/reps rows.";
    this.root.querySelector("[data-planned-list]").innerHTML = day.exercises.map((ex, i) => `
      <div class="plannedEx"><b>${i + 1}. ${escapeHtml(ex.name)}</b>
      <div class="plannedMeta">${escapeHtml(ex.target)} · ${escapeHtml(String(ex.sets))} SETS</div>
      <div class="plannedCue">${escapeHtml(ex.cue)}</div></div>
    `).join("");
  }

  renderLog() {
    const T = this.core.state.training;
    const el = this.root.querySelector("[data-training-log]");
    if (!T.currentSession) {
      this.root.querySelector("[data-active-train-tag]").textContent = "NO ACTIVE CONTRACT";
      el.innerHTML = `<p class="small">No active lift log yet. Tap the button below to open editable weight, reps, and set-complete rows for progressive overload tracking.</p><button type="button" class="btn y" data-log-start>OPEN EDITABLE LIFT LOG</button>`;
      el.querySelector("[data-log-start]").addEventListener("click", () => {
        startTrainingSession(this.core);
        this.render();
        this.onChange();
        this.focusLog();
      });
      return;
    }
    T.currentSession = normalizeActiveTrainingSession(T.currentSession, this.core);
    const day = trainingDay(T.currentSession.key);
    const counts = trainingSessionCounts(T.currentSession);
    this.root.querySelector("[data-active-train-tag]").textContent = counts.done + " / " + counts.total + " SETS SYNCED";
    let html = `<div class="activeHint">CONTRACT ACTIVE · Type your weight and reps into the boxes below, then tap ✓ when each set is complete. These saved numbers become your LAST RUN reference next time.</div><div class="trainingInputs">`;
    day.exercises.forEach((ex, exIdx) => {
      const sets = T.currentSession.sets[exIdx] || [];
      const all = sets.length && sets.every((x) => x.done);
      const last = lastExerciseSetsForKey(this.core, T.currentSession.key, exIdx);
      html += `<div class="workoutBlock ${all ? "done" : ""}">
        <div class="workoutTop"><div><b>${escapeHtml(ex.name)}</b><span>${escapeHtml(ex.target)} · ${escapeHtml(String(ex.sets))} SETS</span></div><div class="excheck">✓</div></div>
        <div class="cue">${escapeHtml(ex.cue)}</div>
        ${last ? `<div class="lastPerf">LAST RUN · ${escapeHtml(last)}</div>` : ""}
        <div class="setlabels"><span>SET</span><span>WEIGHT</span><span>REPS</span><span>DONE</span></div>`;
      sets.forEach((set, setIdx) => {
        html += `<div class="setrow">
          <div class="setn">SET ${setIdx + 1}</div>
          <input aria-label="${escapeHtml(ex.name)} set ${setIdx + 1} weight" type="number" inputmode="decimal" placeholder="lb" value="${escapeHtml(set.weight)}" data-set-field data-ex="${exIdx}" data-set="${setIdx}" data-field="weight">
          <input aria-label="${escapeHtml(ex.name)} set ${setIdx + 1} reps" type="number" inputmode="numeric" placeholder="reps" value="${escapeHtml(set.reps)}" data-set-field data-ex="${exIdx}" data-set="${setIdx}" data-field="reps">
          <button type="button" aria-label="Mark set ${setIdx + 1} complete" class="settoggle ${set.done ? "done" : ""}" data-toggle-set data-ex="${exIdx}" data-set="${setIdx}">✓</button>
        </div>`;
      });
      html += `</div>`;
    });
    html += `</div>`;
    el.innerHTML = html;

    el.querySelectorAll("[data-set-field]").forEach((input) => {
      const handler = () => {
        setTrainingSetField(this.core, Number(input.dataset.ex), Number(input.dataset.set), input.dataset.field, input.value);
        this.renderStatsOnly();
      };
      input.addEventListener("input", handler);
      input.addEventListener("change", handler);
    });
    el.querySelectorAll("[data-toggle-set]").forEach((btn) => {
      btn.addEventListener("click", () => {
        toggleTrainingSet(this.core, Number(btn.dataset.ex), Number(btn.dataset.set));
        this.render();
        this.onChange();
      });
    });
  }

  renderStatsOnly() {
    const T = this.core.state.training;
    const counts = trainingSessionCounts(T.currentSession);
    this.root.querySelector("[data-train-sets]").textContent = counts.pct + "%";
    this.root.querySelector("[data-active-train-tag]").textContent = T.currentSession ? counts.done + " / " + counts.total + " SETS SYNCED" : "NO ACTIVE CONTRACT";
  }

  renderHistory() {
    const list = (this.core.state.training.sessionHistory || []).slice().reverse().slice(0, 10);
    const el = this.root.querySelector("[data-training-history]");
    el.innerHTML = list.length
      ? list.map((x) => `
        <div class="histItem"><button class="x" data-del-session="${x.id}">✕</button>
        <b>${escapeHtml(x.name || trainingDay(x.key).name)}</b>
        <div class="meta">${escapeHtml(x.date)} · ${escapeHtml(String(x.completedSets || 0))} / ${escapeHtml(String(x.totalSets || 0))} SETS · ${escapeHtml(x.key)}</div></div>
      `).join("")
      : `<p class="small">No closed training contracts yet.</p>`;
    el.querySelectorAll("[data-del-session]").forEach((btn) => {
      btn.addEventListener("click", () => {
        deleteTrainingSession(this.core, btn.dataset.delSession);
        this.renderHistory();
      });
    });
  }

  renderProgress() {
    const T = this.core.state.training;
    const photosEl = this.root.querySelector("[data-training-photos]");
    photosEl.innerHTML = `<button class="photoCell add" data-add-photo>+</button>` +
      (T.photos || []).slice().reverse().map((p) => `
        <div class="photoCell"><img src="${p.data}" alt="Progress photo"><span class="date">${escapeHtml(p.date)}</span><button class="del" data-del-photo="${p.id}">✕</button></div>
      `).join("");
    photosEl.querySelector("[data-add-photo]").addEventListener("click", () => {
      this.root.querySelector("[data-training-photo-input]").click();
    });
    photosEl.querySelectorAll("[data-del-photo]").forEach((btn) => {
      btn.addEventListener("click", () => {
        deleteTrainingPhoto(this.core, btn.dataset.delPhoto);
        this.renderProgress();
      });
    });

    const rows = (T.measurements || []).slice().reverse();
    const measEl = this.root.querySelector("[data-training-measures]");
    measEl.innerHTML = rows.length
      ? rows.map((m) => `
        <tr><td>${escapeHtml(m.date)}</td><td>${escapeHtml(m.weight || "—")}</td><td>${escapeHtml(m.hips || "—")}</td><td>${escapeHtml(m.thigh || "—")}</td>
        <td><button class="x" data-del-measurement="${m.id}">✕</button></td></tr>
      `).join("")
      : `<tr><td colspan="5" style="text-align:center;color:var(--dim);padding:14px">No biometric readings yet.</td></tr>`;
    measEl.querySelectorAll("[data-del-measurement]").forEach((btn) => {
      btn.addEventListener("click", () => {
        deleteTrainingMeasurement(this.core, btn.dataset.delMeasurement);
        this.renderProgress();
      });
    });
  }
}
