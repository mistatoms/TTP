export type SceneId =
  | "empty"
  | "walker_single"
  | "walker_multiple"
  | "walker_child_pram"
  | "walker_dog"
  | "cyclist_jogger"
  | "unknown";

export type DayPart = "morning" | "afternoon" | "evening" | "night";

export type WeatherKind = "clear" | "cloudy" | "rain" | "drizzle" | "storm" | "fog" | "snow" | "wind";

export interface WeatherSnapshot {
  kind: WeatherKind;
  label: string;
  tempC: number | null;
  windKph: number | null;
  code: number | null;
  at: number;
}

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
  hasPram: boolean;
  hasChild: boolean;
  closeUp: boolean;
  dayPart: DayPart;
  weekday: string;
  clock: string;
  weather: WeatherSnapshot | null;
  notes: string[];
  people: DetectedPerson[];
  objects: DetectedObject[];
  at: number;
}

export const SCENE_LABELS: Record<SceneId, string> = {
  empty: "Empty path",
  walker_single: "Walker single",
  walker_multiple: "Walker multiple",
  walker_child_pram: "Walker + child/pram",
  walker_dog: "Walker + dog",
  cyclist_jogger: "Cyclist / jogger",
  unknown: "Unclear scene",
};

export const DEMO_SCENES: SceneId[] = [
  "empty",
  "walker_single",
  "walker_multiple",
  "walker_child_pram",
  "walker_dog",
  "cyclist_jogger",
];

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

export function migrateSceneId(id: unknown): SceneId {
  switch (id) {
    case "empty":
    case "walker_single":
    case "walker_multiple":
    case "walker_child_pram":
    case "walker_dog":
    case "cyclist_jogger":
    case "unknown":
      return id;
    case "single_adult":
    case "single_adult_male":
    case "single_adult_female":
    case "close_sitter":
      return "walker_single";
    case "multiple_adults":
      return "walker_multiple";
    case "walker_child":
    case "walker_pram":
    case "adult_child":
      return "walker_child_pram";
    case "adult_dog":
      return "walker_dog";
    case "single_jogger":
    case "multiple_joggers":
    case "cyclist":
    case "multiple_cyclists":
      return "cyclist_jogger";
    default:
      return "walker_single";
  }
}
