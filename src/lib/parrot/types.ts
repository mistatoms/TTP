export type RoastIntensity = "mild" | "medium" | "unhinged";
export type FurbyMode = "simulator" | "bluetooth";
export type VoiceStatus = "idle" | "connecting" | "listening" | "speaking" | "error";
export type CameraMode = "off" | "live" | "demo";

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
