import { useEffect, useRef } from "react";
import { IDLE_ACTIONS } from "@/lib/furby/actions";
import { furby } from "@/lib/furby/controller";
import { classifyScene, makeDemoDetections } from "@/lib/vision/classify";
import { fetchWeather } from "@/lib/vision/weather";
import { pickIdleLine } from "@/lib/parrot/idle-talk";
import { useParrotStore } from "@/lib/parrot/store";
import { checkAiAvailable, synthesizeSpeech } from "@/lib/server/voice";
import { PcmPlayer } from "@/lib/voice/audio";
import { voiceSession } from "@/lib/voice/session";

const idlePlayer = new PcmPlayer();

export function Boot() {
  const lastEngage = useRef(0);
  const lastIdleVoice = useRef(0);

  useEffect(() => {
    void useParrotStore.persist.rehydrate();
    const unsub = useParrotStore.persist.onFinishHydration(() => {
      const s = useParrotStore.getState();
      if (s.furbyMode !== "simulator") furby.setMode(s.furbyMode);
      if (!s.scene) {
        s.applyScene(classifyScene({ ...makeDemoDetections(s.demoScene), weather: s.weather }), "demo");
      }
    });
    void checkAiAvailable()
      .then((r) => useParrotStore.getState().setAiAvailable(r.ok))
      .catch(() => useParrotStore.getState().setAiAvailable(false));
    void fetchWeather()
      .then((w) => {
        const s = useParrotStore.getState();
        s.setWeather(w);
        s.pushReason("scene", "Weather", `${w.label}${w.tempC != null ? ` ${Math.round(w.tempC)}°` : ""}`);
      })
      .catch(() => undefined);
    const wxTimer = window.setInterval(() => {
      void fetchWeather()
        .then((w) => useParrotStore.getState().setWeather(w))
        .catch(() => undefined);
    }, 10 * 60_000);
    return () => {
      unsub();
      window.clearInterval(wxTimer);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const s = useParrotStore.getState();
      if (s.scene?.id !== "empty") return;
      if (s.voiceStatus === "speaking" || s.voiceStatus === "connecting") return;
      if (voiceSession.isBusy) return;

      const act = IDLE_ACTIONS[Math.floor(Math.random() * IDLE_ACTIONS.length)];
      if (act) void furby.trigger(act.id).catch(() => undefined);
      s.setMood("muttering");

      const now = Date.now();
      if (now - lastIdleVoice.current < 16000) {
        s.pushReason("idle", "Idle perch", act?.hint ?? "perch");
        return;
      }
      lastIdleVoice.current = now;
      const line = pickIdleLine(now);
      s.pushReason("idle", line.kind === "song" ? "Idle song" : "Idle mutter", line.text);

      if (voiceSession.active) {
        voiceSession.mutter(line.text, line.kind);
        return;
      }
      if (s.aiAvailable === false) {
        s.pushMessage("parrot", line.text);
        return;
      }
      void (async () => {
        try {
          await idlePlayer.insertNoise(line.kind === "song" ? "rawk" : "rasp", true);
          const res = await synthesizeSpeech({ data: { text: line.text, voice: s.voiceId } });
          if (!res.ok) {
            s.pushMessage("parrot", line.text);
            return;
          }
          s.pushMessage("parrot", line.text);
          await idlePlayer.playBase64Audio(res.audio);
        } catch {
          s.pushMessage("parrot", line.text);
        }
      })();
    }, 18000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    return useParrotStore.subscribe((state, prev) => {
      if (!state.autoEngage) return;
      if (state.voiceStatus !== "idle") return;
      if (voiceSession.isBusy) return;
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
