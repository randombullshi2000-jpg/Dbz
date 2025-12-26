import { TRAINING } from "../data/training.js";
import { TECHS } from "../data/techs.js";
import { FORMS } from "../data/forms.js";

export function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

export function fmtFactory(state){
  return function fmt(n){
    if(!state.settings.formatNumbers) return String(Math.floor(n*100)/100);
    const abs = Math.abs(n);
    if(abs < 1000) return (Math.floor(n*100)/100).toFixed(abs < 10 ? 2 : abs < 100 ? 1 : 0);
    const units = ["K","M","B","T","Qa","Qi","Sx","Sp","Oc","No"];
    let u=-1, x=abs;
    while(x>=1000 && u<units.length-1){ x/=1000; u++; }
    const sign = n<0? "-" : "";
    return sign + x.toFixed(x < 10 ? 2 : x < 100 ? 1 : 0) + units[u];
  };
}

export function getTechLevel(state, id){ return state.player.techLevels[id] || 0; }

export function techEffects(state){
  let eff = { kiRegenMult:1, kiMaxFlat:0, atkMult:1, defMult:1, trainingMult:1, critBonus:0, incomingMult:1, kaioken:0 };
  for(const t of TECHS){
    const lvl = getTechLevel(state, t.id);
    if(lvl <= 0) continue;
    const e = t.effect(lvl);
    if(e.critBonus) eff.critBonus += e.critBonus;
    if(e.incomingMult) eff.incomingMult *= e.incomingMult;
    if(e.kaioken) eff.kaioken = Math.max(eff.kaioken, e.kaioken);
    if(e.kiRegenMult) eff.kiRegenMult *= e.kiRegenMult;
    if(e.atkMult) eff.atkMult *= e.atkMult;
    if(e.defMult) eff.defMult *= e.defMult;
    if(e.trainingMult) eff.trainingMult *= e.trainingMult;
    if(e.kiMaxFlat) eff.kiMaxFlat += e.kiMaxFlat;
  }
  return eff;
}

export function permMult(state){
  const z = state.player.zeni;
  return 1 + 0.0008*Math.sqrt(z) + 0.0000007*z;
}

export function form(state){ return FORMS.find(x => x.id === state.player.activeForm) || FORMS[0]; }
export function formMult(state){ return form(state).mult(state); }
export function formDrain(state){ return form(state).drain(state); }

export function updateKiMax(state){
  const eff = techEffects(state);
  const base = 12 + state.player.level*2 + state.player.control*0.38;
  state.player.kiMax = Math.max(12, base + eff.kiMaxFlat);
  state.player.ki = clamp(state.player.ki, 0, state.player.kiMax);
}

export function trainingRatesPerSecond(state){
  const t = TRAINING.find(x => x.id === state.player.activeTraining) || TRAINING[0];
  const eff = techEffects(state);
  const pm = permMult(state);
  const fm = formMult(state);
  const mult = pm * eff.trainingMult * fm;
  const kiRegen = (0.28 + state.player.control * 0.0022) * pm * eff.kiRegenMult;
  return {
    power:  t.base.power * mult,
    speed:  t.base.speed * mult,
    tough:  t.base.tough * mult,
    control:t.base.control * mult,
    ki:     (t.base.ki * mult) + kiRegen - formDrain(state),
  };
}

export function combatStats(state){
  const eff = techEffects(state);
  const pm = permMult(state);
  const fm = formMult(state);
  const p = state.player.power, s = state.player.speed, t = state.player.tough, c = state.player.control;
  const kLvl = eff.kaioken;
  const kaiokenMult = (kLvl > 0) ? (1 + 0.08*kLvl) : 1;
  const atk = (p*0.58 + s*0.32 + c*0.10) * pm * fm * eff.atkMult * kaiokenMult;
  const def = (t*0.65 + c*0.35) * pm * fm * eff.defMult;
  const crit = clamp(2 + c*0.03 + eff.critBonus, 0, 40);
  return { atk, def, crit, kaiokenLevel: kLvl };
}

export function xpFromWin(state){ const tier = state.combat.sagaTier; return Math.floor(10 + tier*3 + Math.pow(tier,1.35)); }
export function zeniFromWin(state){ const tier = state.combat.sagaTier; return Math.floor(8 + tier*4 + Math.pow(tier,1.25)); }
export function bossHPForTier(tier){ return Math.floor(60 * Math.pow(tier, 1.47) + tier*28); }
export function bossPressure(tier){ return 2.4 * Math.pow(tier, 1.18); }

export function grantXP(state, x, log){
  state.player.xp += x;
  while(state.player.xp >= state.player.xpNeed){
    state.player.xp -= state.player.xpNeed;
    state.player.level += 1;
    state.player.xpNeed = Math.floor(25 * Math.pow(1.20, state.player.level-1));
    state.player.power += 2.2; state.player.speed += 1.6; state.player.tough += 1.6; state.player.control += 1.1; state.player.ki += 2.4;
    log?.(`Level up → ${state.player.level}!`, "good");
  }
}

export function startFight(state, log){
  if(state.combat.fighting) return;
  state.combat.fighting = true;
  state.combat.sagaTier = state.progress.sagaTier;
  state.combat.bossHPMax = bossHPForTier(state.combat.sagaTier);
  state.combat.bossHP = state.combat.bossHPMax;
  log?.(`Fight started (Saga ${state.combat.sagaTier}).`);
}

export function flee(state, log){
  if(!state.combat.fighting) return;
  state.combat.fighting = false;
  log?.("You fled the fight.", "warn");
}

export function combatTick(state, dt, log){
  if(!state.combat.fighting) return;
  const eff = techEffects(state);
  const { atk, def, crit, kaiokenLevel } = combatStats(state);
  const tier = state.combat.sagaTier;
  const critChance = crit / 100, critMult = 1.6;
  const dps = atk * (1 + critChance * (critMult - 1));
  state.combat.bossHP -= dps * dt;

  const incomingBase = bossPressure(tier) * eff.incomingMult;
  const mitigated = incomingBase * (1 - clamp(def / (def + incomingBase*35), 0.05, 0.78));
  const kaiokenDrain = (kaiokenLevel > 0) ? (1 + 0.06*kaiokenLevel) : 1;
  state.player.ki -= mitigated * dt * 0.95 * kaiokenDrain;

  if(state.player.ki <= 0){
    state.player.ki = 0;
    state.combat.fighting = false;
    log?.("Defeat. You ran out of Ki.", "bad");
    return;
  }
  if(state.combat.bossHP <= 0){
    state.combat.bossHP = 0;
    state.combat.fighting = false;
    const xp = xpFromWin(state), zeni = zeniFromWin(state);
    grantXP(state, xp, log);
    state.player.zeni += zeni;
    state.progress.sagaTier += 1;
    if(state.player.activeForm && state.player.activeForm !== "base"){
      const gain = 1 + Math.floor(tier/3);
      state.player.mastery += gain;
      log?.(`Mastery +${gain}.`, "good");
    }
    log?.(`Victory! +${xp} XP, +${zeni} Zeni. Saga → ${state.progress.sagaTier}`, "good");
  }
}

export function zenkaiGainPreview(state){
  const tier = state.progress.sagaTier, p = state.player.power;
  const gain = Math.floor(Math.pow(Math.max(0, tier-10), 1.15) * 1.1 + Math.pow(p/9000, 0.65) * 40);
  return Math.max(0, gain);
}

export function simTick(state, dt, log){
  updateKiMax(state);
  const r = trainingRatesPerSecond(state);
  state.player.power += r.power * dt;
  state.player.speed += r.speed * dt;
  state.player.tough += r.tough * dt;
  state.player.control += r.control * dt;
  state.player.ki += r.ki * dt;
  state.player.ki = clamp(state.player.ki, 0, state.player.kiMax);

  if(state.player.activeForm && state.player.activeForm !== "base"){
    if(state.player.ki > 0){
      state.player.mastery += 0.015 * dt;
    } else {
      state.player.activeForm = "base";
      log?.("Ki empty → transformation cancelled.", "warn");
    }
  }
  combatTick(state, dt, log);
}
