import { defaultState, normalizeState, load, save, exportSave, importSave, SAVE_KEY } from "./engine/state.js";
import { simTick, startFight, flee, zenkaiGainPreview } from "./engine/sim.js";
import { makeLogger, makeStoryLogger, rebuildTraining, rebuildTechs, rebuildForms, render, setSettingsButtons } from "./engine/ui.js";
import { STORY_EVENTS, storyRecap } from "./story/story.js";

// Register service worker (works on https/localhost)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

let state = normalizeState(load() ?? defaultState());

const mainLogEl = document.getElementById("log");
const storyLogEl = document.getElementById("storyLog");
const log = makeLogger(mainLogEl);
const storyLog = makeStoryLogger(storyLogEl);

// Tabs
function setTab(name){
  for(const btn of document.querySelectorAll(".tab")){
    btn.classList.toggle("active", btn.dataset.tab === name);
  }
  const tabs = ["train","tech","forms","fight","story","settings"];
  for(const t of tabs){
    document.getElementById(`tab-${t}`).classList.toggle("hidden", t !== name);
  }
}
document.querySelectorAll(".tab").forEach(btn => btn.addEventListener("click", () => setTab(btn.dataset.tab)));

// Save / Export / Import
document.getElementById("btnSave").onclick = () => { save(state); log("Saved."); };
document.getElementById("btnExport").onclick = () => prompt("Copy your save string:", exportSave(state));
document.getElementById("btnImport").onclick = () => {
  const txt = prompt("Paste your save string:");
  if(!txt) return;
  try{
    state = normalizeState(importSave(txt));
    rebuildAll();
    render(state);
    log("Imported save.", "good");
    save(state);
  }catch{ alert("Invalid save string."); }
};
document.getElementById("btnHardReset").onclick = () => {
  if(!confirm("Hard reset? This deletes everything.")) return;
  state = defaultState();
  localStorage.removeItem(SAVE_KEY);
  rebuildAll();
  render(state);
  log("Hard reset complete.", "warn");
  save(state);
};

// Settings
document.getElementById("btnToggleOffline").onclick = () => { state.settings.offlineProgress = !state.settings.offlineProgress; setSettingsButtons(state); log(`Offline progress: ${state.settings.offlineProgress ? "ON" : "OFF"}.`); save(state); };
document.getElementById("btnToggleAutosave").onclick = () => { state.settings.autosave = !state.settings.autosave; setSettingsButtons(state); log(`Autosave: ${state.settings.autosave ? "ON" : "OFF"}.`); save(state); };
document.getElementById("btnToggleFormat").onclick = () => { state.settings.formatNumbers = !state.settings.formatNumbers; setSettingsButtons(state); log(`Formatting: ${state.settings.formatNumbers ? "ON" : "OFF"}.`); save(state); };

// Fight / Zenkai
document.getElementById("btnFight").onclick = () => startFight(state, log);
document.getElementById("btnFlee").onclick = () => flee(state, log);
document.getElementById("btnRebirth").onclick = () => {
  const gain = zenkaiGainPreview(state);
  if(gain <= 0){ log("Zenkai not worth it yet. Push Saga ~11+ for real gains.", "warn"); return; }
  if(!confirm(`Rebirth now for +${gain} Zeni bonus? (Resets stats, keeps Zeni)`)) return;

  const keepZeni = state.player.zeni + gain;
  const keepSettings = {...state.settings};

  state = defaultState();
  state.settings = keepSettings;
  state.player.zeni = keepZeni;

  rebuildAll();
  render(state);
  log(`Zenkai complete. Total Zeni is now ${state.player.zeni}.`, "good");
  save(state);
};

// Story
const storyTitleEl = document.getElementById("storyTitle");
const storyTextEl = document.getElementById("storyText");

function nextStoryEvent(){
  for(let i=0;i<STORY_EVENTS.length;i++){
    const e = STORY_EVENTS[i];
    if(state.player.storySeen[e.id]) continue;
    if(e.condition(state)){
      storyTitleEl.textContent = e.title;
      storyTextEl.textContent = e.text(state);
      e.apply(state);
      state.player.storyChapter = i;
      storyLog(e.title);
      save(state);
      return true;
    }
  }
  storyTitleEl.textContent = "No new story yet";
  storyTextEl.textContent = "Train and fight. Story unlocks are tied to power/level/saga tier.\n\nTip: Advance Saga by winning fights.";
  return false;
}
document.getElementById("btnStoryContinue").onclick = () => { setTab("story"); const ok = nextStoryEvent(); if(!ok) log("No new story event yet. Keep training/fighting.", "warn"); };
document.getElementById("btnStoryRecap").onclick = () => alert(storyRecap(state));

// Rebuild cards
function rebuildAll(){
  rebuildTraining(state, log);
  rebuildTechs(state, log);
  rebuildForms(state, log);
  setSettingsButtons(state);
}
rebuildAll();

// Offline progress
function applyOfflineProgress(){
  if(!state.settings.offlineProgress) return;
  const t0 = state.lastTick || Date.now();
  const dt = (Date.now() - t0) / 1000;
  if(dt <= 1.5) return;

  const capped = Math.min(dt, 60*60*8);
  const steps = Math.min(1200, Math.floor(capped / 0.25));
  const stepDt = capped / steps;

  for(let i=0;i<steps;i++) simTick(state, stepDt, null);
  log(`Offline progress: simulated ${Math.floor(capped)}s.`, "good");
}
applyOfflineProgress();

// Default tab
if(Object.keys(state.player.storySeen).length === 0){ setTab("story"); nextStoryEvent(); }
else setTab("train");

// Main loop
let autosaveTimer = 0;
let last = Date.now();
let refreshTimer = 0;

function tick(){
  const t = Date.now();
  const dt = Math.max(0, Math.min(0.5, (t - last)/1000));
  last = t;

  simTick(state, dt, log);
  render(state);

  refreshTimer += dt;
  if(refreshTimer >= 0.8){ refreshTimer = 0; rebuildAll(); }

  if(state.settings.autosave){
    autosaveTimer += dt;
    if(autosaveTimer >= 20){ autosaveTimer = 0; save(state); }
  }
}

document.addEventListener("visibilitychange", () => { if(document.visibilityState === "hidden") save(state); });

render(state);
log("Welcome. Train, buy techniques, transform, fight saga bosses. Story in the Story tab.");
setInterval(tick, 50);
