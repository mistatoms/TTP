import { useEffect, useRef } from "react";
import { IDLE_ACTIONS } from "@/lib/furby/actions";
import { furby } from "@/lib/furby/controller";
import { classifyScene, makeDemoDetections } from "@/lib/vision/classify";
import { useParrotStore } from "@/lib/parrot/store";
import { checkAiAvailable } from "@/lib/server/voice";
import { voiceSession } from "@/lib/voice/session";

export function Boot() {
  const lastEngage = useRef(0);

  useEffect(() => {
    void useParrotStore.persist.rehydrate();
    const unsub = useParrotStore.persist.onFinishHydration(() => {
      const s = useParrotStore.getState();
      furby.setPyfluffUrl(s.pyfluffUrl);
      if (s.furbyMode !== "simulator") furby.setMode(s.furbyMode);
      if (!s.scene) {
        s.applyScene(classifyScene(makeDemoDetections(s.demoScene)), "demo");
      }
    });
    void checkAiAvailable()
      .then((r) => useParrotStore.getState().setAiAvailable(r.ok))
      .catch(() => useParrotStore.getState().setAiAvailable(false));
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const s = useParrotStore.getState();
      if (s.scene?.id !== "empty") return;
      if (s.voiceStatus === "speaking" || s.voiceStatus === "connecting") return;
      const act = IDLE_ACTIONS[Math.floor(Math.random() * IDLE_ACTIONS.length)];
      if (act) void furby.trigger(act.id).catch(() => undefined);
      void furby.setAntennaPreset("sleepy").catch(() => undefined);
      s.pushReason("idle", "Idle mutter", act?.hint ?? "perch");
    }, 14000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    return useParrotStore.subscribe((state, prev) => {
      if (!state.autoEngage) return;
      if (state.voiceStatus !== "idle") return;
      if (!state.scene || state.scene.id === "empty") return;
      if (prev.scene?.id === state.scene.id) return;
      if (Date.now() - lastEngage.current < 20000) return;
      lastEngage.current = Date.now();
      void voiceSession
        .start({
          voice: state.voiceId,
          intensity: state.roastIntensity,
          scene: state.scene,
          opening: state.pendingOpening,
        })
        .catch(() => undefined);
    });
  }, []);

  return null;
}
