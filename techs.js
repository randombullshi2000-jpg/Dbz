export const TECHS = [
  {
    id:"meditation",
    name:"Meditation",
    desc:"Boosts Ki regen and max Ki. The boring stuff that makes everything else work.",
    unlock: (s) => true,
    cost: (lvl) => 12 * Math.pow(1.65, lvl),
    maxLevel: 25,
    effect: (lvl) => ({ kiRegenMult: 1 + 0.09*lvl, kiMaxFlat: 6*lvl })
  },
  {
    id:"kamehameha",
    name:"Kamehameha",
    desc:"More damage from Power Level. A clean beam beats wild punches.",
    unlock: (s) => s.player.level >= 3,
    cost: (lvl) => 18 * Math.pow(1.7, lvl),
    maxLevel: 30,
    effect: (lvl) => ({ atkMult: 1 + 0.065*lvl })
  },
  {
    id:"kaioken",
    name:"Kaioken",
    desc:"Big DPS boost but increases Ki drain in fights. Risk/reward.",
    unlock: (s) => s.progress.sagaTier >= 4,
    cost: (lvl) => 45 * Math.pow(1.85, lvl),
    maxLevel: 20,
    effect: (lvl) => ({ kaioken: lvl })
  },
  {
    id:"instant_transmission",
    name:"Instant Transmission",
    desc:"Adds crit chance and reduces incoming pressure. Movement becomes a weapon.",
    unlock: (s) => s.progress.sagaTier >= 8,
    cost: (lvl) => 90 * Math.pow(2.0, lvl),
    maxLevel: 20,
    effect: (lvl) => ({ critBonus: 0.45*lvl, incomingMult: 1 - 0.01*lvl })
  },
  {
    id:"iron_body",
    name:"Iron Body",
    desc:"More defense from Durability and Ki Control. You stop flinching.",
    unlock: (s) => s.player.tough >= 90,
    cost: (lvl) => 35 * Math.pow(1.8, lvl),
    maxLevel: 25,
    effect: (lvl) => ({ defMult: 1 + 0.05*lvl })
  },
  {
    id:"focus",
    name:"Focus",
    desc:"Training efficiency increases (all stat gains). You waste less effort.",
    unlock: (s) => s.player.level >= 10,
    cost: (lvl) => 70 * Math.pow(2.0, lvl),
    maxLevel: 20,
    effect: (lvl) => ({ trainingMult: 1 + 0.04*lvl })
  }
];
