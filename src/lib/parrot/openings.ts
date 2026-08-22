import type { RoastIntensity } from "./persona";
import type { SceneContext, SceneId } from "../vision/types";

interface LineBank {
  mild: string[];
  medium: string[];
}

const BANKS: Record<SceneId, LineBank> = {
  empty: {
    mild: [
      "Just me, the ducks, and a very committed spider on the lock gate. Riveting Saturday programming.",
      "Tow path's empty. I shall mutter to the canal until someone interesting floats by.",
      "Nothing but ripples. Even the coots have somewhere better to be.",
    ],
    medium: [
      "Deserted. Typical. I rehearse my best material and the audience is a mooring pin.",
      "Empty path. If a joke lands in the cut and nobody hears it, I still tell it.",
    ],
  },
  single_adult: {
    mild: [
      "Afternoon. Lovely stretch, this — if you ignore the parrot with opinions.",
      "Go on then, give us a nod. I don't get many reviews this far from a pub.",
      "Tow path tax: one hello. I'll waive the rest.",
    ],
    medium: [
      "Look at you, marching like you've somewhere important to be. The canal disagrees.",
      "A lone walker. Either deep in thought or just forgotten the shopping list. Both honourable.",
    ],
  },
  single_adult_male: {
    mild: [
      "Alright mate. If you're lost, the next lock's that way and my advice is free but unsound.",
      "Easy now — the path's older than your trainers and twice as stubborn.",
    ],
    medium: [
      "Hands in pockets, purpose in the stride. Very canal-coded. I respect it, barely.",
      "If that's a power-walk, the ducks remain unimpressed. Same, if I'm honest.",
    ],
  },
  single_adult_female: {
    mild: [
      "Good day to you. The heron's off-shift so I'm covering greetings.",
      "Mind the puddle by the bench. It's been there since Thursday and has tenure.",
    ],
    medium: [
      "Purposeful walk, excellent posture, and somehow still slower than that spaniel yesterday.",
      "If you're counting steps, add one for nodding at the local parrot. Union rules.",
    ],
  },
  multiple_adults: {
    mild: [
      "A congregation. I shall keep this short — I know how walkers travel in packs.",
      "Two or more humans. Statistically, at least one of you likes boats. I can tell.",
    ],
    medium: [
      "Group outing. Who's in charge of the snacks and who's in charge of the opinions?",
      "Lovely. A committee. The canal has waited all week for a quorum.",
    ],
  },
  adult_child: {
    mild: [
      "Hello you two. Best behaviour — there's a parrot on duty and he reports to the ducks.",
      "Small person spotted. Welcome to the unofficial nature trail. The fish are shy; I am not.",
    ],
    medium: [
      "Family patrol. If anyone asks, I am educational content with a beak.",
      "Keep hold of little legs near the edge. The water's decorative. I am not.",
    ],
  },
  adult_dog: {
    mild: [
      "Oh brilliant, a dog. Finally, someone who understands the assignment.",
      "Yes hello, four-legs. Your human may speak too, if they must.",
      "That tail's doing more cardio than most joggers I see.",
    ],
    medium: [
      "The dog's in charge. We all know it. Don't embarrass yourself by pretending otherwise.",
      "If that's a 'quick walk', the spaniel's press officer would like a word.",
    ],
  },
  single_jogger: {
    mild: [
      "Lycra at twelve o'clock. I'll keep this brief — you've got a personal best to miss.",
      "Nice cadence. The tow path's flattered. The puddles are less so.",
    ],
    medium: [
      "Running from something, or toward a cake? Be honest, the canal can keep a secret.",
      "Impressive commitment to bouncing past a parrot. Form: chaotic. Spirit: strong.",
    ],
  },
  multiple_joggers: {
    mild: [
      "A peloton of trainers. I'll just… perch here and not get involved.",
      "Group run. Remember: chatting counts as recovery. I read that on a bin.",
    ],
    medium: [
      "Pack of joggers. If you're racing, the winner buys the loser a sit-down.",
      "Synchronised panting. Very modern ballet, very little canal etiquette.",
    ],
  },
  cyclist: {
    mild: [
      "Bell's optional, charm is not. Afternoon, two-wheels.",
      "Share the path — I've got claws and a public, you've got gears.",
    ],
    medium: [
      "A bicycle. On a tow path. Bold. The walkers send their regards, via me.",
      "If you ping the bell I shall consider a nod. Maybe.",
    ],
  },
  multiple_cyclists: {
    mild: [
      "A small peloton. The ducks have formed a union about this, just so you know.",
      "Two bikes. One path. Let's all pretend we planned this.",
    ],
    medium: [
      "Club ride energy on a public footpath. I admire the optimism.",
      "If this is a time trial, the time is 'please remember people exist'.",
    ],
  },
  close_sitter: {
    mild: [
      "Oh. You're one of those 'sits at a computer' people. Same. Different perch.",
      "Hello, indoor human. The canal is closed; I am working from home.",
      "I can see you. You can see me. This is already more honest than most meetings.",
    ],
    medium: [
      "Desk posture like a question mark. The parrot notices. The parrot will mention it.",
      "If you're debugging, I can offer unsolicited comments. It's my whole job.",
      "Webcam's on, brain's halfway down the cut. Relatable.",
    ],
  },
  unknown: {
    mild: [
      "Something's moving. Could be a person. Could be a very confident bin bag.",
      "Unclear scene, strong vibes. I'll start talking anyway — that's the brand.",
    ],
    medium: [
      "Can't quite classify you. That's fine. I roast on instinct.",
    ],
  },
};

const DAY_PREFIX: Record<string, Partial<Record<SceneContext["dayPart"], string[]>>> = {
  any: {
    morning: [
      "Early for heroics.",
      "Morning on the cut.",
    ],
    afternoon: [
      "Afternoon, then.",
      "Sun's doing its best.",
    ],
    evening: [
      "Evening light's the good stuff.",
      "Golden hour, cheap opinions.",
    ],
    night: [
      "Bit late for a constitutional.",
      "Night shift for the parrot.",
    ],
  },
};

export function pickOpening(scene: SceneContext, intensity: RoastIntensity, salt = Date.now()): string {
  const bank = BANKS[scene.id] ?? BANKS.unknown;
  const lines = intensity === "medium" ? bank.medium : bank.mild;
  const line = lines[Math.abs(salt) % lines.length] ?? lines[0]!;
  const prefixes = DAY_PREFIX.any?.[scene.dayPart] ?? [];
  const usePrefix = prefixes.length > 0 && Math.abs(salt >> 3) % 3 === 0;
  const prefix = usePrefix ? prefixes[Math.abs(salt >> 2) % prefixes.length] : "";
  const dayNote =
    scene.weekday === "Sunday" && scene.dayPart === "morning"
      ? " Sunday, too. Dedicated."
      : "";
  return `${prefix ? prefix + " " : ""}${line}${dayNote}`;
}

export function sceneSummary(scene: SceneContext): string {
  return [
    scene.label,
    `${scene.weekday} ${scene.dayPart} (${scene.clock})`,
    `people ${scene.peopleCount}, activity ${scene.activity}`,
    scene.hasDog ? "dog" : null,
    scene.hasBicycle ? "bicycle" : null,
    scene.closeUp ? "close-up" : null,
    `confidence ${(scene.confidence * 100).toFixed(0)}%`,
  ]
    .filter(Boolean)
    .join(" · ");
}
