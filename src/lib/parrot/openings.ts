import type { RoastIntensity } from "./types";
import type { SceneContext, SceneId, WeatherKind } from "../vision/types";

interface LineBank {
  mild: string[];
  medium: string[];
  mad: string[];
}

const BANKS: Record<SceneId, LineBank> = {
  empty: {
    mild: [
      "Just me, the ducks, and a very committed spider on the lock gate.",
      "Tow path's empty. I shall mutter to the chest until someone floats by.",
      "Nothing but ripples. Even the coots have somewhere better to be.",
    ],
    medium: [
      "Deserted. Typical. I rehearse my best material and the audience is a mooring pin.",
      "Empty path. If a joke lands in the cut and nobody hears it, I still tell it.",
    ],
    mad: [
      "Nobody. Just me, a mouldy rope, and the existential horror of a bank holiday. Rrawk.",
      "Deserted. Even the litter's clocked off. Bloody typical.",
      "Empty path. I shall swear at the water until it answers.",
    ],
  },
  walker_single: {
    mild: [
      "One walker. Lovely stretch, this — if you ignore the parrot with opinions.",
      "Go on then, give us a nod. I don't get many reviews this far from a pub.",
      "Tow path tax: one hello. I'll waive the rest.",
    ],
    medium: [
      "Look at you, marching like you've somewhere important to be. The canal disagrees.",
      "A lone walker. Either deep in thought or just forgotten the shopping list.",
    ],
    mad: [
      "Look at you, stomping along like you own the cut. You don't. The ducks do.",
      "One human. Already over budget. Go on, pretend you didn't hear the bird.",
      "Afternoon, stray. If that's a constitutional, the constitution wants a word.",
    ],
  },
  walker_multiple: {
    mild: [
      "A congregation. I shall keep this short — I know how walkers travel in packs.",
      "Two or more humans. Statistically, at least one of you likes boats.",
    ],
    medium: [
      "Group outing. Who's in charge of the snacks and who's in charge of the opinions?",
      "Lovely. A committee. The canal has waited all week for a quorum.",
    ],
    mad: [
      "A pack. Who's in charge of the snacks and who's in charge of the rubbish opinions?",
      "Committee on the tow path. The canal didn't vote for this.",
      "Two or more of you. Statistically at least one is insufferable. Rrawk.",
    ],
  },
  walker_child_pram: {
    mild: [
      "Hello you two. Best behaviour — there's a parrot on duty and he reports to the ducks.",
      "Small person spotted. Welcome to the unofficial nature trail.",
      "Pram on the tow path. Mind the ruts — that chest has seen worse cargo.",
    ],
    medium: [
      "Family patrol. If anyone asks, I am educational content with a beak.",
      "Keep hold of little legs near the edge. The water's decorative. I am not.",
      "A pram. Very civilised. I'll keep the volume down. Mostly.",
    ],
    mad: [
      "Family patrol. Adult: you're on notice. Small person: you're fine, the bird likes you.",
      "A pram. Fine. Adult: watch the edge. Child: you're exempt from the roasting rota.",
      "I roast the pusher, not the cargo. Union rules.",
    ],
  },
  walker_dog: {
    mild: [
      "Yes hello, four-legs. Your human may speak too, if they must.",
      "A dog on the cut. Sensible. The human is optional.",
      "Good afternoon to the one with the tail. The other one can catch up.",
    ],
    medium: [
      "Dog first, human second. That's the correct order on this path.",
      "Four legs, one lead, one person pretending to be in charge.",
    ],
    mad: [
      "The dog's fine. The human can keep walking.",
      "If that lead is a personality, congratulations, you've outsourced it.",
      "Rrawk. Nice dog. Shame about the chaperone.",
    ],
  },
  cyclist_jogger: {
    mild: [
      "Lycra or gears — I'll keep this brief. The path is shared, the opinions are free.",
      "Nice cadence. The tow path's flattered. The puddles are less so.",
    ],
    medium: [
      "Running or riding from something, or toward a cake? The canal can keep a secret.",
      "A bicycle or a bounce. Bold. The walkers send their regards, via me.",
    ],
    mad: [
      "Lycra or two wheels. Of course. Go on, bounce past like the rest of us are furniture.",
      "Share the path. Walkers live here. You're a guest with ideas above your station.",
      "Personal best? Pal, your best is still a bit sad on a shared path. Watch the puddles.",
    ],
  },
  unknown: {
    mild: [
      "Something's moving. Could be a person. Could be a very confident bin bag.",
      "Unclear scene, strong vibes. I'll start talking anyway — that's the brand.",
    ],
    medium: ["Can't quite classify you. That's fine. I roast on instinct."],
    mad: [
      "Can't classify you. That's fine. I roast on instinct and spite.",
      "Something's moving. Person, bin bag, or a wellness walk. I'll be rude to all three.",
    ],
  },
};

const DAY_PREFIX: Record<SceneContext["dayPart"], string[]> = {
  morning: ["Early for heroics.", "Morning on the cut."],
  afternoon: ["Afternoon, then.", "Sun's doing its best."],
  evening: ["Evening light's the good stuff.", "Golden hour, cheap opinions."],
  night: ["Bit late for a constitutional.", "Night shift for the parrot."],
};

const WEATHER_PREFIX: Record<WeatherKind, string[]> = {
  clear: ["Blue overhead.", "Not a cloud worth mentioning."],
  cloudy: ["Grey lid on the cut.", "Clouds doing committee work."],
  rain: ["It's coming down.", "Wet path, wet opinions."],
  drizzle: ["A polite drizzle.", "Mizzle. Very canal."],
  storm: ["Proper weather. Hide the chest."],
  fog: ["Fog on the cut. Romantic, if you like not seeing."],
  snow: ["Snow. The ducks look personally offended."],
  wind: ["Blowy. Hold your hat and your dignity."],
};

export function pickOpening(scene: SceneContext, intensity: RoastIntensity, salt = Date.now()): string {
  const bank = BANKS[scene.id] ?? BANKS.unknown;
  const lines = intensity === "mad" ? bank.mad : intensity === "medium" ? bank.medium : bank.mild;
  const line = lines[Math.abs(salt) % lines.length] ?? lines[0]!;
  const day = DAY_PREFIX[scene.dayPart] ?? [];
  const wx = scene.weather ? (WEATHER_PREFIX[scene.weather.kind] ?? []) : [];
  const useDay = day.length > 0 && Math.abs(salt >> 3) % 3 === 0;
  const useWx = wx.length > 0 && Math.abs(salt >> 4) % 2 === 0;
  const prefix = [
    useDay ? day[Math.abs(salt >> 2) % day.length] : "",
    useWx ? wx[Math.abs(salt >> 5) % wx.length] : "",
  ]
    .filter(Boolean)
    .join(" ");
  const dayNote = scene.weekday === "Sunday" && scene.dayPart === "morning" ? " Sunday, too. Dedicated." : "";
  const wxNote =
    scene.weather && scene.weather.tempC != null && Math.abs(salt >> 6) % 4 === 0
      ? ` ${Math.round(scene.weather.tempC)}°.`
      : "";
  return `${prefix ? prefix + " " : ""}${line}${dayNote}${wxNote}`;
}

export function sceneSummary(scene: SceneContext): string {
  return [
    scene.label,
    `${scene.weekday} ${scene.dayPart} (${scene.clock})`,
    scene.weather ? `${scene.weather.label}${scene.weather.tempC != null ? ` ${Math.round(scene.weather.tempC)}°` : ""}` : null,
    `people ${scene.peopleCount}, activity ${scene.activity}`,
    scene.hasPram ? "pram" : null,
    scene.hasBicycle ? "bicycle" : null,
    scene.hasChild ? "child" : null,
    scene.hasDog ? "dog" : null,
    `confidence ${(scene.confidence * 100).toFixed(0)}%`,
  ]
    .filter(Boolean)
    .join(" · ");
}
