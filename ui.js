import { TRAINING } from "../data/training.js";
import { TECHS } from "../data/techs.js";
import { FORMS } from "../data/forms.js";
import { fmtFactory, getTechLevel, permMult, trainingRatesPerSecond, combatStats, bossHPForTier, xpFromWin, zeniFromWin, zenkaiGainPreview } from "./sim.js";

export function makeLogger(mainLogEl){
  return function log(msg, kind=""){
    const line = document.createElement("div");
    line.className = "line";
    const prefix = kind === "good" ? "✅ " : kind === "bad" ? "⛔ " : kind === "warn" ? "⚠️ " : "• ";
    line.textContent = prefix + msg;
    mainLogEl.prepend(line);
    while(mainLogEl.children.length > 40) mainLogEl.removeChild(mainLogEl.lastChild);
  };
}

export function makeStoryLogger(storyLogEl){
  return function storyLog(title){
    const line = document.createElement("div");
    line.className = "line";
    line.textContent = `• ${title}`;
    storyLogEl.prepend(line);
    while(storyLogEl.children.length > 60) storyLogEl.removeChild(storyLogEl.lastChild);
  };
}

function pill(txt){
  const s = document.createElement("span");
  s.className = "pill";
  s.textContent = txt;
  return s;
}

export function rebuildTraining(state, log){
  const wrap = document.getElementById("trainingCards");
  wrap.innerHTML = "";
  for(const t of TRAINING){
    const locked = !t.unlock(state);
    const card = document.createElement("div");
    card.className = "card";

    const h = document.createElement("h3"); h.textContent = t.name;
    const p = document.createElement("p"); p.textContent = `${t.desc}  (${t.location})`;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.appendChild(pill(locked ? "Locked" : "Available"));
    meta.appendChild(pill(`Base: +${t.base.power.toFixed(2)} PL/s`));
    meta.appendChild(pill(`Ki: ${t.base.ki >= 0 ? "+" : ""}${t.base.ki.toFixed(2)}/s`));

    const flav = document.createElement("p");
    flav.textContent = t.flavor?.[0] ?? "";
    flav.style.opacity = "0.95";

    const btn = document.createElement("button");
    btn.className = "btn primary";
    btn.textContent = locked ? "Locked" : "Train";
    btn.disabled = locked;
    btn.onclick = () => {
      state.player.activeTraining = t.id;
      const idx = Math.floor(Math.random() * (t.flavor?.length || 1));
      const line = t.flavor?.[idx] ?? "";
      log(`Training set: ${t.name}. ${line}`);
    };

    card.appendChild(h); card.appendChild(p); card.appendChild(meta); card.appendChild(flav); card.appendChild(btn);
    wrap.appendChild(card);
  }
}

export function rebuildTechs(state, log){
  const wrap = document.getElementById("techCards");
  wrap.innerHTML = "";
  const fmt = fmtFactory(state);

  for(const tech of TECHS){
    const locked = !tech.unlock(state);
    const lvl = getTechLevel(state, tech.id);
    const cost = tech.cost(lvl);

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h3>${tech.name}</h3><p>${tech.desc}</p>`;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.appendChild(pill(`Level: ${lvl}/${tech.maxLevel}`));
    meta.appendChild(pill(locked ? "Locked" : "Available"));
    card.appendChild(meta);

    const btn = document.createElement("button");
    btn.className = "btn primary";
    btn.textContent = `Buy (+1) — ${fmt(cost)} Zeni`;
    btn.disabled = locked || lvl >= tech.maxLevel || state.player.zeni < cost;

    btn.onclick = () => {
      const c = tech.cost(getTechLevel(state, tech.id));
      if(state.player.zeni < c) return;
      state.player.zeni -= c;
      state.player.techLevels[tech.id] = getTechLevel(state, tech.id) + 1;
      log(`Upgraded ${tech.name} → L${getTechLevel(state, tech.id)}.`, "good");
    };

    card.appendChild(btn);
    wrap.appendChild(card);
  }
}

export function rebuildForms(state, log){
  const wrap = document.getElementById("formCards");
  wrap.innerHTML = "";
  for(const f of FORMS){
    const locked = !f.unlock(state);
    const active = state.player.activeForm === f.id;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h3>${f.name}</h3><p>${f.desc}</p>`;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.appendChild(pill(`Mult: ${f.mult(state).toFixed(2)}×`));
    meta.appendChild(pill(`Drain: ${f.drain(state).toFixed(2)}/s`));
    meta.appendChild(pill(locked ? "Locked" : active ? "Active" : "Ready"));
    card.appendChild(meta);

    const btn = document.createElement("button");
    btn.className = "btn " + (active ? "" : "primary");
    btn.textContent = active ? "Deactivate" : "Transform";
    btn.disabled = locked;

    btn.onclick = () => {
      if(active){
        state.player.activeForm = "base";
        log(`Transformation ended: ${f.name}.`, "warn");
      }else{
        state.player.activeForm = f.id;
        log(`Transformation: ${f.name}!`, "good");
      }
    };

    card.appendChild(btn);
    wrap.appendChild(card);
  }
}

export function setSettingsButtons(state){
  document.getElementById("btnToggleOffline").textContent = `Offline Progress: ${state.settings.offlineProgress ? "ON" : "OFF"}`;
  document.getElementById("btnToggleAutosave").textContent = `Autosave: ${state.settings.autosave ? "ON" : "OFF"}`;
  document.getElementById("btnToggleFormat").textContent = `Formatting: ${state.settings.formatNumbers ? "ON" : "OFF"}`;
}

export function render(state){
  const fmt = fmtFactory(state);

  document.getElementById("lvl").textContent = state.player.level;
  document.getElementById("zeni").textContent = fmt(state.player.zeni);
  document.getElementById("permMult").textContent = permMult(state).toFixed(2) + "×";
  document.getElementById("sagaTier").textContent = state.progress.sagaTier;

  const formName = (FORMS.find(x=>x.id===state.player.activeForm)?.name) ?? "Base";
  document.getElementById("activeForm").textContent = formName;

  document.getElementById("power").textContent = fmt(state.player.power);
  document.getElementById("speed").textContent = fmt(state.player.speed);
  document.getElementById("tough").textContent = fmt(state.player.tough);
  document.getElementById("control").textContent = fmt(state.player.control);
  document.getElementById("mastery").textContent = fmt(state.player.mastery);

  document.getElementById("ki").textContent = fmt(state.player.ki);
  document.getElementById("kiMax").textContent = fmt(state.player.kiMax);

  const r = trainingRatesPerSecond(state);
  document.getElementById("powerRate").textContent = `${r.power>=0?"+":""}${fmt(r.power)} /s`;
  document.getElementById("speedRate").textContent = `${r.speed>=0?"+":""}${fmt(r.speed)} /s`;
  document.getElementById("toughRate").textContent = `${r.tough>=0?"+":""}${fmt(r.tough)} /s`;
  document.getElementById("controlRate").textContent = `${r.control>=0?"+":""}${fmt(r.control)} /s`;
  document.getElementById("kiRate").textContent = `${r.ki>=0?"+":""}${fmt(r.ki)} /s`;

  document.getElementById("xp").textContent = fmt(state.player.xp);
  document.getElementById("xpNeed").textContent = fmt(state.player.xpNeed);
  const xpPct = Math.max(0, Math.min(100, (state.player.xp/state.player.xpNeed)*100));
  const xpBar = document.getElementById("xpBar");
  xpBar.style.width = xpPct + "%";
  xpBar.style.background = "linear-gradient(90deg, rgba(122,162,255,.2), rgba(122,162,255,.95))";

  const gain = zenkaiGainPreview(state);
  document.getElementById("rebirthHint").textContent = gain > 0 ? `Would gain +${gain} Zeni bonus.` : `Push Saga ~11+ to start gaining Zeni bonuses from Zenkai.`;

  const tr = TRAINING.find(x => x.id === state.player.activeTraining);
  document.getElementById("currentTraining").textContent = tr ? tr.name : "None";

  const { atk, def, crit } = combatStats(state);
  document.getElementById("atk").textContent = fmt(atk);
  document.getElementById("def").textContent = fmt(def);
  document.getElementById("crit").textContent = (Math.floor(crit*10)/10).toFixed(1);

  document.getElementById("fightRewards").textContent = xpFromWin(state);
  document.getElementById("fightZeni").textContent = zeniFromWin(state);

  const tier = state.progress.sagaTier;
  const hpMax = state.combat.fighting ? state.combat.bossHPMax : bossHPForTier(tier);
  const hp = state.combat.fighting ? state.combat.bossHP : hpMax;
  document.getElementById("bossHP").textContent = fmt(hp);
  document.getElementById("bossHPMax").textContent = fmt(hpMax);

  const critChance = crit/100, critMult=1.6;
  const dps = atk * (1 + critChance * (critMult - 1));
  document.getElementById("dps").textContent = fmt(dps);

  const pct = Math.max(0, Math.min(100, (hp/hpMax)*100));
  const bossBar = document.getElementById("bossBar");
  bossBar.style.width = pct + "%";
  bossBar.style.background = "linear-gradient(90deg, rgba(255,90,106,.25), rgba(255,90,106,.95))";

  document.getElementById("btnFight").disabled = state.combat.fighting;
  document.getElementById("btnFlee").disabled = !state.combat.fighting;
}
