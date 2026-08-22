import {
  clockLabel,
  dayPartFromDate,
  weekdayName,
  type ApparentPresentation,
  type DetectedObject,
  type DetectedPerson,
  type SceneContext,
  type SceneId,
  SCENE_LABELS,
} from "./types";

export interface ClassifyInput {
  people: DetectedPerson[];
  objects: DetectedObject[];
  presentation?: ApparentPresentation;
}

export function classifyScene(input: ClassifyInput, now = new Date()): SceneContext {
  const people = input.people;
  const objects = input.objects;
  const hasDog = objects.some((o) => o.label === "dog" || o.label === "cat");
  const bikeCount = objects.filter((o) => o.label === "bicycle" || o.label === "motorcycle").length;
  const hasBicycle = bikeCount > 0;
  const closeUp = people.some((p) => p.closeness >= 0.42);
  const hasChild = people.some((p) => p.likelyChild);
  const adults = people.filter((p) => !p.likelyChild);
  const meanMotion =
    people.length === 0 ? 0 : people.reduce((s, p) => s + p.motion, 0) / people.length;

  let activity: SceneContext["activity"] = "still";
  if (meanMotion > 0.28) activity = "running";
  else if (meanMotion > 0.14) activity = "brisk";
  else if (meanMotion > 0.04) activity = "strolling";

  const presentation = input.presentation ?? "unspecified";
  const notes: string[] = [];

  let id: SceneId = "empty";
  let confidence = 0.55;

  if (people.length === 0 && !hasDog && !hasBicycle) {
    id = "empty";
    confidence = 0.9;
    notes.push("No person, dog or bicycle in frame.");
  } else if (closeUp && people.length >= 1) {
    id = "close_sitter";
    confidence = Math.min(0.95, 0.55 + people[0]!.closeness);
    notes.push("Large subject filling the frame — treating as a desk / close sit.");
  } else if (hasBicycle) {
    id = bikeCount > 1 || people.length > 1 ? "multiple_cyclists" : "cyclist";
    confidence = 0.78;
    notes.push(`Bicycle-class object ×${bikeCount}.`);
  } else if (activity === "running") {
    id = people.length > 1 ? "multiple_joggers" : "single_jogger";
    confidence = 0.74;
    notes.push("High landmark motion — jogging / running gait.");
  } else if (hasDog) {
    id = "adult_dog";
    confidence = 0.8;
    notes.push("Companion animal detected alongside a person.");
  } else if (hasChild && adults.length >= 1) {
    id = "adult_child";
    confidence = 0.72;
    notes.push("One smaller figure beside a larger adult-scale pose.");
  } else if (people.length >= 2) {
    id = "multiple_adults";
    confidence = 0.76;
    notes.push(`${people.length} people, walking pace.`);
  } else if (people.length === 1) {
    if (presentation === "masculine") id = "single_adult_male";
    else if (presentation === "feminine") id = "single_adult_female";
    else id = "single_adult";
    confidence = 0.7;
    notes.push("Single pedestrian, modest motion.");
  } else {
    id = "unknown";
    confidence = 0.4;
  }

  return {
    id,
    label: SCENE_LABELS[id],
    confidence,
    peopleCount: people.length,
    groupSize: Math.max(people.length, hasDog ? people.length + 1 : people.length),
    activity,
    hasDog,
    hasBicycle,
    hasChild,
    closeUp,
    presentation,
    dayPart: dayPartFromDate(now),
    weekday: weekdayName(now),
    clock: clockLabel(now),
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
    bbox: [0.48, 0.42, 0.12, 0.32],
    closeness: 0.12,
    motion: 0.06,
    likelyChild: true,
  };

  switch (id) {
    case "empty":
      return { people: [], objects: [] };
    case "single_adult":
      return { people: [adult(0, 0.07)], objects: [] };
    case "single_adult_male":
      return { people: [adult(0, 0.07)], objects: [], presentation: "masculine" };
    case "single_adult_female":
      return { people: [adult(0, 0.06)], objects: [], presentation: "feminine" };
    case "multiple_adults":
      return { people: [adult(0, 0.08), adult(1, 0.07)], objects: [] };
    case "adult_child":
      return { people: [adult(0, 0.05), child], objects: [] };
    case "adult_dog":
      return {
        people: [adult(0, 0.06)],
        objects: [{ label: "dog", score: 0.88, bbox: [0.55, 0.62, 0.16, 0.18] }],
      };
    case "single_jogger":
      return { people: [adult(0, 0.36)], objects: [] };
    case "multiple_joggers":
      return { people: [adult(0, 0.4), adult(1, 0.38)], objects: [] };
    case "cyclist":
      return {
        people: [adult(0, 0.22)],
        objects: [{ label: "bicycle", score: 0.9, bbox: [0.28, 0.5, 0.3, 0.28] }],
      };
    case "multiple_cyclists":
      return {
        people: [adult(0, 0.2), adult(1, 0.21)],
        objects: [
          { label: "bicycle", score: 0.86, bbox: [0.22, 0.5, 0.24, 0.26] },
          { label: "bicycle", score: 0.81, bbox: [0.5, 0.52, 0.24, 0.24] },
        ],
      };
    case "close_sitter":
      return { people: [adult(0, 0.02, 0.62)], objects: [] };
    default:
      return { people: [adult(0, 0.05)], objects: [] };
  }
}
