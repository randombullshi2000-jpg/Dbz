export const FORMS = [
  { id:"base", name:"Base", desc:"No multiplier, no drain.", unlock:(s)=>true, mult:(s)=>1, drain:(s)=>0 },
  {
    id:"ssj",
    name:"Super Saiyan",
    desc:"Breakthrough. Strong boost, moderate Ki drain.",
    unlock: (s) => s.player.power >= 700,
    mult: (s) => 1.65 + 0.0025*s.player.mastery,
    drain: (s) => 1.10 * Math.max(0.35, 1 - s.player.mastery*0.004)
  },
  {
    id:"ssj2",
    name:"Super Saiyan 2",
    desc:"More output, heavier drain.",
    unlock: (s) => s.player.power >= 5500 && s.progress.sagaTier >= 6,
    mult: (s) => 2.45 + 0.0033*s.player.mastery,
    drain: (s) => 2.15 * Math.max(0.30, 1 - s.player.mastery*0.0045)
  },
  {
    id:"ssj3",
    name:"Super Saiyan 3",
    desc:"Massive power, brutal Ki drain.",
    unlock: (s) => s.player.power >= 30000 && s.progress.sagaTier >= 12,
    mult: (s) => 3.85 + 0.0042*s.player.mastery,
    drain: (s) => 3.60 * Math.max(0.25, 1 - s.player.mastery*0.005)
  }
];
