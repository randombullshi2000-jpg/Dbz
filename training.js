export const TRAINING = [
  {
    id:"weighted_clothing",
    name:"Weighted Clothing",
    location:"Capsule Corp Yard",
    flavor:[
      "You strap on heavy clothes until your joints ache.",
      "Goku grins: “This is the good kind of tired!”",
      "Each step becomes a rep. Each breath becomes a set."
    ],
    desc:"Steady Power Level gains. Safe, consistent foundation.",
    unlock: (s) => true,
    base: { power: 1.55, ki: 0.20, speed: 0.25, tough: 0.25, control: 0.10 }
  },
  {
    id:"ki_control",
    name:"Ki Control Drills",
    location:"Kami’s Lookout",
    flavor:[
      "You hold your hands steady while energy tries to leak out.",
      "The point isn’t power — it’s precision.",
      "One clean pulse beats ten sloppy blasts."
    ],
    desc:"Boosts Ki Control and Ki regeneration.",
    unlock: (s) => s.player.level >= 5 || s.progress.sagaTier >= 2,
    base: { power: 0.70, ki: 0.60, speed: 0.25, tough: 0.15, control: 0.95 }
  },
  {
    id:"gravity_training",
    name:"Gravity Training",
    location:"Capsule Corp Gravity Room",
    flavor:[
      "Gravity crushes you into the floor like a judgement.",
      "Every movement is a fight. Every second is a victory.",
      "You learn to stand up anyway."
    ],
    desc:"Huge Speed/Power spike, but costs more Ki.",
    unlock: (s) => s.player.power >= 350 || s.progress.sagaTier >= 3,
    base: { power: 1.20, ki: -0.10, speed: 1.25, tough: 0.20, control: 0.15 }
  },
  {
    id:"hyperbolic_time_chamber",
    name:"Hyperbolic Time Chamber",
    location:"The Room of Spirit and Time",
    flavor:[
      "The air is heavy, dry, and endless.",
      "Every day stretches into a week. Every week stretches into a war.",
      "You train until you forget what “normal” felt like."
    ],
    desc:"Elite training. Great overall gains. Requires higher saga.",
    unlock: (s) => s.progress.sagaTier >= 6,
    base: { power: 1.05, ki: 0.35, speed: 0.80, tough: 0.80, control: 0.55 }
  }
];
