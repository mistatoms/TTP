export type RoastIntensity = "mild" | "medium" | "mad";
export type FurbyMode = "simulator" | "bluetooth";
export type VoiceStatus = "idle" | "connecting" | "listening" | "speaking" | "error";
export type CameraMode = "off" | "live" | "demo";
export type ParrotMood =
  | "amused"
  | "surprised"
  | "excited"
  | "curious"
  | "sleepy"
  | "warm"
  | "cheeky"
  | "annoyed"
  | "neutral"
  | "muttering";

export const MOOD_LABEL: Record<ParrotMood, string> = {
  amused: "Amused",
  surprised: "Surprised",
  excited: "Excited",
  curious: "Curious",
  sleepy: "Sleepy",
  warm: "Warm",
  cheeky: "Cheeky",
  annoyed: "Annoyed",
  neutral: "Perched",
  muttering: "Muttering",
};

export const MOOD_ANTENNA: Record<ParrotMood, string> = {
  amused: "cheeky",
  surprised: "surprise",
  excited: "green",
  curious: "canal",
  sleepy: "sleepy",
  warm: "moss",
  cheeky: "cheeky",
  annoyed: "red",
  neutral: "moss",
  muttering: "canal",
};

export interface ChatMessage {
  id: string;
  role: "user" | "parrot" | "system";
  text: string;
  at: number;
}

export interface ReasoningEvent {
  id: string;
  at: number;
  kind: "scene" | "opening" | "tool" | "voice" | "idle" | "error";
  title: string;
  detail: string;
}

export interface SessionLog {
  id: string;
  at: number;
  sceneId: string;
  sceneLabel: string;
  opening: string;
  intensity: RoastIntensity;
  turns: number;
}
