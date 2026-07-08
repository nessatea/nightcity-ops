import { ApartmentState } from "./apartment/apartmentState.js";
import { ApartmentView } from "./apartment/apartmentView.js";
import { MarketView } from "./apartment/marketView.js";
import { ConsoleView } from "./core/consoleView.js";
import { GigsView } from "./core/gigsView.js";
import { LogView } from "./core/logView.js";
import { SettingsView } from "./core/settingsView.js";
import { CoreState } from "./core/state.js";
import { TrainingView } from "./core/trainingView.js";

const core = new CoreState();
const apartmentState = new ApartmentState(core);

const appShell = document.querySelector("#app-shell");
const bootEl = document.querySelector("#boot");
const bootTerm = document.querySelector("#bootterm");
const levelupEl = document.querySelector("#levelup");
const luNum = document.querySelector("#luNum");
const luUnlock = document.querySelector("#luUnlock");

let lastLevel = core.state.level;

function onGlobalChange() {
  renderWallet();
  checkLevelUp();
}

function renderWallet() {
  document.querySelector("[data-w-lvl]").textContent = core.state.level;
  document.querySelector("[data-w-eddies]").textContent = core.state.eddies.toLocaleString();
  document.querySelector("[data-w-streak]").textContent = core.state.streak.cur;
}

function checkLevelUp() {
  if (core.state.level <= lastLevel) return;
  const newLevel = core.state.level;
  lastLevel = newLevel;
  const unlocks = core.state.npcs.filter((n) => n.lvl === newLevel).map((n) => n.nm + " moved in");
  luNum.textContent = newLevel;
  luUnlock.innerHTML = unlocks.length ? "► " + unlocks.join("<br>► ") : "Keep the uptime going.";
  levelupEl.classList.add("show");
}

document.querySelector("#levelupContinue").addEventListener("click", () => {
  levelupEl.classList.remove("show");
});

const views = {
  console: new ConsoleView(document.querySelector('[data-view="console"]'), core, onGlobalChange),
  gigs: new GigsView(document.querySelector('[data-view="gigs"]'), core, onGlobalChange),
  training: new TrainingView(document.querySelector('[data-view="training"]'), core, onGlobalChange),
  apartment: new ApartmentView(document.querySelector('[data-view="apartment"]'), apartmentState, onGlobalChange),
  market: new MarketView(document.querySelector('[data-view="market"]'), apartmentState, onGlobalChange),
  log: new LogView(document.querySelector('[data-view="log"]'), core, onGlobalChange),
  settings: new SettingsView(document.querySelector('[data-view="settings"]'), core, onGlobalChange),
};

Object.values(views).forEach((view) => view.mount());
renderWallet();

document.querySelector(".tabs").addEventListener("click", (e) => {
  const button = e.target.closest("button[data-tab]");
  if (!button) return;
  const tab = button.dataset.tab;
  document.querySelectorAll(".tabs .tab").forEach((b) => b.classList.remove("is-active"));
  button.classList.add("is-active");
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
  document.querySelector(`[data-view="${tab}"]`).classList.add("is-active");
  core.rollover();
  views[tab].render();
  renderWallet();
});

function runBoot() {
  const lines = [
    ["> ESTABLISHING UPLINK...", 350],
    ["> AUTHENTICATING NETRUNNER CREDENTIALS...", 450],
    ['> <span class="ok">ACCESS GRANTED</span>', 400],
    ["> LOADING BIOMETRIC SYNC PROTOCOLS...", 400],
    ["> COMPILING FIXER CONTRACTS...", 300],
    ["> LOADING TRAINING CONTRACT ROTATION...", 320],
    ["> MOUNTING APARTMENT INSTANCE...", 350],
    ['> <span class="ok">NIGHT CITY // UPLINK OPS ONLINE</span>', 500],
  ];
  let i = 0;
  let acc = "";
  (function step() {
    if (i >= lines.length) {
      setTimeout(finishBoot, 300);
      return;
    }
    acc += lines[i][0] + "<br>";
    bootTerm.innerHTML = acc + '<span class="cur"></span>';
    const delay = lines[i][1];
    i++;
    setTimeout(step, delay);
  })();
}

function finishBoot() {
  core.state.bootSeen = true;
  core.persist();
  bootEl.style.transition = "opacity .4s";
  bootEl.style.opacity = "0";
  setTimeout(() => { bootEl.style.display = "none"; }, 400);
  appShell.style.display = "";
}

core.rollover();
if (core.state.bootSeen) {
  bootEl.style.display = "none";
  appShell.style.display = "";
} else {
  runBoot();
}
