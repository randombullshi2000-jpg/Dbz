export const SAVE_KEY = "zf_story_save_v1";

export function defaultState(now=Date.now){
  return {
    version: 1,
    lastTick: now(),
    settings: { offlineProgress:true, autosave:true, formatNumbers:true },
    player: {
      level: 1, xp: 0, xpNeed: 25,
      power: 12, ki: 12, kiMax: 12, speed: 10, tough: 10, control: 10,
      mastery: 0, zeni: 0,
      activeTraining: "weighted_clothing",
      activeForm: "base",
      techLevels: {},
      storySeen: {},
      storyChapter: 0
    },
    combat: { fighting:false, sagaTier:1, bossHP:50, bossHPMax:50 },
    progress: { sagaTier: 1 }
  };
}

export function normalizeState(state){
  const d = defaultState();
  state.settings = Object.assign(d.settings, state.settings || {});
  state.player = Object.assign(d.player, state.player || {});
  state.player.techLevels = state.player.techLevels || {};
  state.player.storySeen = state.player.storySeen || {};
  state.combat = Object.assign(d.combat, state.combat || {});
  state.progress = Object.assign(d.progress, state.progress || {});
  if(!state.player.activeForm) state.player.activeForm = "base";
  if(!state.player.activeTraining) state.player.activeTraining = "weighted_clothing";
  return state;
}

export function save(state){
  state.lastTick = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function load(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return null;
    return JSON.parse(raw);
  }catch{ return null; }
}

export function exportSave(state){
  state.lastTick = Date.now();
  return btoa(unescape(encodeURIComponent(JSON.stringify(state))));
}

export function importSave(text){
  const json = decodeURIComponent(escape(atob(text.trim())));
  return JSON.parse(json);
}
