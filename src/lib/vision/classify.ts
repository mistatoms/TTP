import {
  clockLabel,
  dayPartFromDate,
  weekdayName,
  type DetectedObject,
  type DetectedPerson,
  type SceneContext,
  type SceneId,
  SCENE_LABELS,
  type WeatherSnapshot,
} from "./types";
import { associate, isPramLike, relativeSizeChildren } from "./supervision";

export interface ClassifyInput {
  people: DetectedPerson[];
  objects: DetectedObject[];
  weather?: WeatherSnapshot | null;
}

export function classifyScene(input: ClassifyInput, now = new Date()): SceneContext {
  const people = relativeSizeChildren(input.people);
  const objects = input.objects;
  const hasDog = objects.some((o) => o.label === "dog" || o.label === "cat");
  const bikes = objects.filter((o) => o.label === "bicycle" || o.label === "motorcycle");
  const hasBicycle = bikes.length > 0;
  const prams = objects.filter(isPramLike);
  const hasPramObj = prams.length > 0;
  const closeUp = people.some((p) => p.closeness >= 0.42);
  const hasChild = people.some((p) => p.likelyChild);
  const adults = people.filter((p) => !p.likelyChild);
  const meanMotion =
    people.length === 0 ? 0 : people.reduce((s, p) => s + p.motion, 0) / people.length;

  let activity: SceneContext["activity"] = "still";
  if (meanMotion > 0.28) activity = "running";
  else if (meanMotion > 0.14) activity = "brisk";
  else if (meanMotion > 0.04) activity = "strolling";

  const bikeAssoc = associate(people, objects, ["bicycle", "motorcycle"]);
  const pramAssoc = associate(people, prams, prams.map((p) => p.label));
  const notes: string[] = [];

  let id: SceneId = "empty";
  let confidence = 0.55;

  if (people.length === 0 && !hasBicycle) {
    id = "empty";
    confidence = 0.9;
    notes.push("No person or bicycle in frame.");
  } else if (pramAssoc.size > 0 || hasPramObj || (hasChild && adults.length >= 1) || (hasChild && people.length >= 1)) {
    id = "walker_child_pram";
    confidence = 0.78;
    notes.push(
      hasPramObj || pramAssoc.size > 0
        ? "Person with a pram-like object."
        : "Child beside an adult-scale figure.",
    );
  } else if (hasDog && people.length >= 1) {
    id = "walker_dog";
    confidence = 0.8;
    notes.push("Companion animal detected alongside a person.");
  } else if (bikeAssoc.size > 0 || hasBicycle || activity === "running") {
    id = "cyclist_jogger";
    confidence = hasBicycle ? 0.8 : 0.72;
    notes.push(hasBicycle ? "Person associated with a bicycle." : "High motion — jogging gait.");
  } else if (people.length >= 2) {
    id = "walker_multiple";
    confidence = 0.76;
    notes.push(`${people.length} walkers, walking pace.`);
  } else if (people.length === 1) {
    id = "walker_single";
    confidence = 0.74;
    notes.push("Single walker.");
  } else {
    id = "unknown";
    confidence = 0.4;
  }

  if (hasDog && id !== "walker_dog") notes.push("Dog in frame.");
  if (input.weather) notes.push(`Weather ${input.weather.label}.`);

  return {
    id,
    label: SCENE_LABELS[id],
    confidence,
    peopleCount: people.length,
    groupSize: people.length,
    activity,
    hasDog,
    hasBicycle,
    hasPram: hasPramObj || id === "walker_child_pram",
    hasChild,
    closeUp,
    dayPart: dayPartFromDate(now),
    weekday: weekdayName(now),
    clock: clockLabel(now),
    weather: input.weather ?? null,
    notes,
    people,
    objects,
    at: now.getTime(),
  };
}

export function makeDemoDetections(id: SceneId): ClassifyInput {
  const adult = (n: number, motion: number, closeness = 0.18): DetectedPerson => ({
    id: n,
    bbox: [0.2 + n * 0.15, 0.25, 0.18, 0.55],
    closeness,
    motion,
    likelyChild: false,
  });
  const child: DetectedPerson = {
    id: 2,
    bbox: [0.48, 0.48, 0.1, 0.28],
    closeness: 0.12,
    motion: 0.06,
    likelyChild: true,
  };

  switch (id) {
    case "empty":
      return { people: [], objects: [] };
    case "walker_single":
      return { people: [adult(0, 0.07)], objects: [] };
    case "walker_multiple":
      return { people: [adult(0, 0.08), adult(1, 0.07)], objects: [] };
    case "walker_child_pram":
      return {
        people: [adult(0, 0.05), child],
        objects: [{ label: "suitcase", score: 0.82, bbox: [0.34, 0.58, 0.16, 0.18] }],
      };
    case "walker_dog":
      return {
        people: [adult(0, 0.06)],
        objects: [{ label: "dog", score: 0.88, bbox: [0.46, 0.62, 0.14, 0.16] }],
      };
    case "cyclist_jogger":
      return {
        people: [adult(0, 0.32)],
        objects: [{ label: "bicycle", score: 0.9, bbox: [0.22, 0.5, 0.28, 0.26] }],
      };
    default:
      return { people: [adult(0, 0.05)], objects: [] };
  }
}
