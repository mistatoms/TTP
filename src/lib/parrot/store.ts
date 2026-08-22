import { create } from "zustand";
import { persist } from "zustand/middleware";
import { classifyScene, makeDemoDetections } from "@/lib/vision/classify";
import { pickOpening, sceneSummary } from "@/lib/parrot/openings";
import { furby } from "@/lib/furby/controller";
import { PRESET_ANTENNA, type AntennaColor, type SensorReading } from "@/lib/furby/protocol";
import type { SceneContext, SceneId } from "@/lib/vision/types";
import type {
  CameraMode,
  ChatMessage,
  FurbyMode,
  ReasoningEvent,
  RoastIntensity,
  SessionLog,
  VoiceStatus,
} from "./types";
import { DEFAULT_VOICE, type ParrotVoiceId } from "./persona";

const uid = () => Math.random().toString(36).slice(2, 10);

interface ParrotState {
  roastIntensity: RoastIntensity;
  autoEngage: boolean;
  voiceId: ParrotVoiceId;
  furbyMode: FurbyMode;
  furbyConnected: boolean;
  furbyName: string;
  furbyDetail: string;
  lastAction: string | null;
  antenna: AntennaColor;
  sensors: SensorReading | null;
  pyfluffUrl: string;
  cameraMode: CameraMode;
  demoScene: SceneId;
  overlays: boolean;
  scene: SceneContext | null;
  pendingOpening: string | null;
  messages: ChatMessage[];
  reasoning: ReasoningEvent[];
  logs: SessionLog[];
  voiceStatus: VoiceStatus;
  voiceError: string | null;
  transcriptIn: string;
  transcriptOut: string;
  micLevel: number;
  parrotLevel: number;
  aiAvailable: boolean | null;

  setRoast: (v: RoastIntensity) => void;
  setAutoEngage: (v: boolean) => void;
  setVoiceId: (v: ParrotVoiceId) => void;
  setFurbyMode: (v: FurbyMode) => void;
  setPyfluffUrl: (v: string) => void;
  setCameraMode: (v: CameraMode) => void;
  setOverlays: (v: boolean) => void;
  setDemoScene: (id: SceneId) => void;
  applyScene: (scene: SceneContext, source: "live" | "demo") => void;
  pushMessage: (role: ChatMessage["role"], text: string) => void;
  pushReason: (kind: ReasoningEvent["kind"], title: string, detail: string) => void;
  setVoiceStatus: (s: VoiceStatus, error?: string | null) => void;
  setLevels: (mic: number, parrot: number) => void;
  setTranscripts: (input?: string, output?: string) => void;
  setAiAvailable: (v: boolean) => void;
  logSession: (turns: number) => void;
  clearConversation: () => void;
  forceNewOpening: () => string;
}

function reasonCap(list: ReasoningEvent[]) {
  return list.slice(-80);
}

export const useParrotStore = create<ParrotState>()(
  persist(
    (set, get) => ({
      roastIntensity: "mild",
      autoEngage: false,
      voiceId: DEFAULT_VOICE,
      furbyMode: "simulator",
      furbyConnected: true,
      furbyName: "Simulator",
      furbyDetail: "Simulator online",
      lastAction: null,
      antenna: { ...PRESET_ANTENNA.moss },
      sensors: null,
      pyfluffUrl: "",
      cameraMode: "demo",
      demoScene: "adult_dog",
      overlays: true,
      scene: null,
      pendingOpening: null,
      messages: [],
      reasoning: [],
      logs: [],
      voiceStatus: "idle",
      voiceError: null,
      transcriptIn: "",
      transcriptOut: "",
      micLevel: 0,
      parrotLevel: 0,
      aiAvailable: null,

      setRoast: (v) => set({ roastIntensity: v }),
      setAutoEngage: (v) => set({ autoEngage: v }),
      setVoiceId: (v) => set({ voiceId: v }),
      setFurbyMode: (v) => {
        furby.setMode(v);
        set({
          furbyMode: v,
          furbyConnected: v === "simulator",
          furbyName: v === "simulator" ? "Simulator" : v === "bluetooth" ? "Furby" : "PyFluff",
          furbyDetail: v === "simulator" ? "Simulator online" : "Disconnected",
        });
      },
      setPyfluffUrl: (v) => {
        furby.setPyfluffUrl(v);
        set({ pyfluffUrl: v });
      },
      setCameraMode: (v) => set({ cameraMode: v }),
      setOverlays: (v) => set({ overlays: v }),
      setDemoScene: (id) => {
        const scene = classifyScene(makeDemoDetections(id));
        get().applyScene(scene, "demo");
        set({ demoScene: id, cameraMode: "demo" });
      },
      applyScene: (scene, source) => {
        const prev = get().scene;
        const changed = !prev || prev.id !== scene.id;
        set({ scene });
        if (changed) {
          const opening = pickOpening(scene, get().roastIntensity);
          get().pushReason(
            "scene",
            scene.label,
            `${source === "demo" ? "Demo" : "Live"} · ${sceneSummary(scene)}`,
          );
          if (scene.id === "empty") {
            set({ pendingOpening: opening });
            get().pushReason("idle", "Empty path", "Quiet muttering / idle perch.");
            void furby.setAntennaPreset("sleepy");
            return;
          }
          set({ pendingOpening: opening });
          get().pushReason("opening", "Opening line", opening);
        }
      },
      pushMessage: (role, text) =>
        set({
          messages: [...get().messages, { id: uid(), role, text, at: Date.now() }].slice(-80),
        }),
      pushReason: (kind, title, detail) =>
        set({
          reasoning: reasonCap([
            ...get().reasoning,
            { id: uid(), at: Date.now(), kind, title, detail },
          ]),
        }),
      setVoiceStatus: (s, error = null) => set({ voiceStatus: s, voiceError: error }),
      setLevels: (mic, parrot) => set({ micLevel: mic, parrotLevel: parrot }),
      setTranscripts: (input, output) =>
        set({
          transcriptIn: input ?? get().transcriptIn,
          transcriptOut: output ?? get().transcriptOut,
        }),
      setAiAvailable: (v) => set({ aiAvailable: v }),
      logSession: (turns) => {
        const scene = get().scene;
        const opening = get().pendingOpening;
        if (!scene || !opening) return;
        set({
          logs: [
            {
              id: uid(),
              at: Date.now(),
              sceneId: scene.id,
              sceneLabel: scene.label,
              opening,
              intensity: get().roastIntensity,
              turns,
            },
            ...get().logs,
          ].slice(0, 40),
        });
      },
      clearConversation: () => {
        const scene = get().scene;
        set({
          messages: [],
          transcriptIn: "",
          transcriptOut: "",
          pendingOpening: scene ? pickOpening(scene, get().roastIntensity, Date.now()) : null,
        });
      },
      forceNewOpening: () => {
        const scene = get().scene ?? classifyScene(makeDemoDetections(get().demoScene));
        const opening = pickOpening(scene, get().roastIntensity, Date.now());
        set({ pendingOpening: opening, scene });
        get().pushReason("opening", "Forced new line", opening);
        return opening;
      },
    }),
    {
      name: "ttpttp-parrot",
      skipHydration: true,
      partialize: (s) => ({
        roastIntensity: s.roastIntensity,
        autoEngage: s.autoEngage,
        voiceId: s.voiceId,
        furbyMode: s.furbyMode,
        pyfluffUrl: s.pyfluffUrl,
        overlays: s.overlays,
        logs: s.logs,
        demoScene: s.demoScene,
      }),
    },
  ),
);

if (typeof window !== "undefined") {
  furby.on((e) => {
    if (e.type === "status") {
      useParrotStore.setState({
        furbyConnected: e.connected,
        furbyName: e.name,
        furbyDetail: e.detail,
      });
    } else if (e.type === "sensor") {
      useParrotStore.setState({ sensors: e.reading });
    } else if (e.type === "action") {
      useParrotStore.setState({ lastAction: e.label });
      useParrotStore.getState().pushReason("tool", "Furby action", e.label);
    } else if (e.type === "antenna") {
      useParrotStore.setState({ antenna: e.color });
    } else if (e.type === "error") {
      useParrotStore.getState().pushReason("error", "Furby", e.message);
    }
  });
}
