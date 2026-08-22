export type SceneId =
  | "empty"
  | "single_adult"
  | "single_adult_male"
  | "single_adult_female"
  | "multiple_adults"
  | "adult_child"
  | "adult_dog"
  | "single_jogger"
  | "multiple_joggers"
  | "cyclist"
  | "multiple_cyclists"
  | "close_sitter"
  | "unknown";

export type DayPart = "morning" | "afternoon" | "evening" | "night";

export type ApparentPresentation = "masculine" | "feminine" | "unspecified";

export interface DetectedPerson {
  id: number;
  bbox: [number, number, number, number];
  closeness: number;
  motion: number;
  likelyChild: boolean;
}

export interface DetectedObject {
  label: string;
  score: number;
  bbox: [number, number, number, number];
}

export interface SceneContext {
  id: SceneId;
  label: string;
  confidence: number;
  peopleCount: number;
  groupSize: number;
  activity: "still" | "strolling" | "brisk" | "running";
  hasDog: boolean;
  hasBicycle: boolean;
  hasChild: boolean;
  closeUp: boolean;
  presentation: ApparentPresentation;
  dayPart: DayPart;
  weekday: string;
  clock: string;
  notes: string[];
  people: DetectedPerson[];
  objects: DetectedObject[];
  at: number;
}

export const SCENE_LABELS: Record<SceneId, string> = {
  empty: "Empty path",
  single_adult: "Single adult walker",
  single_adult_male: "Single adult walker (male)",
  single_adult_female: "Single adult walker (female)",
  multiple_adults: "Multiple adult walkers",
  adult_child: "Adult + child",
  adult_dog: "Adult + dog",
  single_jogger: "Single jogger / runner",
  multiple_joggers: "Multiple joggers / runners",
  cyclist: "Cyclist",
  multiple_cyclists: "Multiple cyclists",
  close_sitter: "Person sitting close (desk)",
  unknown: "Unclear scene",
};

export function dayPartFromDate(d = new Date()): DayPart {
  const h = d.getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

export function weekdayName(d = new Date()) {
  return d.toLocaleDateString("en-GB", { weekday: "long" });
}

export function clockLabel(d = new Date()) {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
