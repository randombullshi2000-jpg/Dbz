function seen(s, id){ return !!s.player.storySeen[id]; }
function markSeen(s, id){ s.player.storySeen[id] = true; }

export const STORY_EVENTS = [
  {
    id: "prologue_arrival",
    title: "Prologue — The Brother Who Stayed",
    condition: (s) => !seen(s,"prologue_arrival"),
    text: () => (
`You weren’t supposed to be here.

In a private alternate timeline, you and Kakarot were separated as infants — but not completely. A malfunction. A detour.
You grew up close enough to watch him become “Goku,” close enough to feel the gap between what you are and what you could be.

Bulma’s screens flicker with readings. Roshi laughs. Krillin complains. Goku smiles like the world is simple.
You don’t hate him.
You hate how easy it looks.

Your first rule becomes a ritual:
Train until the numbers stop feeling like numbers.
Train until they become a fact.

(Choose a training method in the Training tab. The story advances as you grow.)`
    ),
    apply: (s) => { markSeen(s,"prologue_arrival"); }
  },
  {
    id: "yard_routine",
    title: "Routine — Weighted Clothing",
    condition: (s) => !seen(s,"yard_routine") && s.player.power >= 60,
    text: () => (
`Capsule Corp Yard.

Goku tightens the straps on your weighted gear like it’s nothing.
“Don’t overthink it,” he says. “Just do it again.”

You run laps until your calves burn. Push-ups until your elbows feel like glass. Squats until your hips wobble.
Goku’s breathing stays calm. Yours doesn’t.

You realize something ugly:
You’re not competing with him.
You’re competing with the version of you that keeps choosing comfort.

You keep moving anyway.`
    ),
    apply: (s) => { markSeen(s,"yard_routine"); }
  },
  {
    id: "lookout_control",
    title: "Lesson — Ki Control",
    condition: (s) => !seen(s,"lookout_control") && s.player.level >= 5,
    text: () => (
`Kami’s Lookout.

Popo doesn’t praise. He doesn’t insult. He watches.
The air up here is thin and honest.

“Power is cheap,” Popo says. “Control is rare.”

You hold a sphere of Ki between your palms.
It wants to explode. It wants to leak. It wants to become noise.

You learn to compress it until it’s silent.
Not weaker. Cleaner.

From this day on, you stop calling it “energy.”
It’s Ki. And it obeys whoever is disciplined enough to command it.`
    ),
    apply: (s) => { markSeen(s,"lookout_control"); }
  },
  {
    id: "raditz_shadow",
    title: "Incoming — A Familiar Threat",
    condition: (s) => !seen(s,"raditz_shadow") && s.progress.sagaTier >= 2,
    text: () => (
`A signal hits the scouters like a knife.

A Saiyan pod enters Earth’s atmosphere.

Goku looks up and smiles out of habit — until the pressure lands.
It’s not friendly. It’s not curious.

It’s blood.

A name surfaces from fragments you never spoke aloud:
Raditz.

If he’s here… then whatever you escaped is closer than you thought.`
    ),
    apply: (s) => { markSeen(s,"raditz_shadow"); }
  },
  {
    id: "gravity_room",
    title: "Capsule Corp — Gravity Training",
    condition: (s) => !seen(s,"gravity_room") && s.player.power >= 350,
    text: () => (
`Bulma’s Gravity Room hums like a caged storm.

10x gravity makes you kneel.
20x gravity makes you crawl.
At 30x, every breath becomes a decision.

Goku is laughing again — because of course he is.
You aren’t laughing. You’re learning the habit that matters:

keep going while the body screams “stop.”

When you step out, normal gravity feels like cheating.`
    ),
    apply: (s) => { markSeen(s,"gravity_room"); }
  },
  {
    id: "ssj_unlock_story",
    title: "Breakthrough — Super Saiyan",
    condition: (s) => !seen(s,"ssj_unlock_story") && s.player.power >= 700,
    text: () => (
`It hits in a moment that’s too quiet to be dramatic.

No thunder. No prophecy.

Just a switch you didn’t know existed.

Your Ki spikes — clean, sharp, bright. The air vibrates. Your heartbeat becomes a drum.
Goku stares, then grins:
“Yo… you did it.”

Super Saiyan.

And for the first time, you understand the truth:
There are ceilings you can break only once you stop believing they’re real.`
    ),
    apply: (s) => { markSeen(s,"ssj_unlock_story"); }
  }
];

export function storyRecap(s){
  const keys = Object.keys(s.player.storySeen || {});
  if(keys.length === 0) return "No story progress yet.";
  return keys.map((k, i) => `${i+1}. ${k.replaceAll("_"," ")}`).join("\n");
}
