import { createVoiceClientSecret } from "@/lib/server/voice";
import { furby } from "@/lib/furby/controller";
import { PRESET_ANTENNA } from "@/lib/furby/protocol";
import { buildSystemPrompt, FURBY_TOOLS, type ParrotVoiceId } from "@/lib/parrot/persona";
import { useParrotStore } from "@/lib/parrot/store";
import type { RoastIntensity } from "@/lib/parrot/types";
import type { SceneContext } from "@/lib/vision/types";
import { PcmPlayer, base64ToPcm16, createCapture, rms } from "./audio";

const MODEL = "grok-voice-latest";
const REALTIME_URL = `wss://api.x.ai/v1/realtime?model=${MODEL}`;

type ToolArgs = Record<string, unknown>;

export class VoiceSession {
  private ws: WebSocket | null = null;
  private player = new PcmPlayer();
  private captureStop: (() => void) | null = null;
  private turns = 0;
  private outputBuf = "";

  get active() {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  async start(opts: {
    voice: ParrotVoiceId;
    intensity: RoastIntensity;
    scene: SceneContext | null;
    opening: string | null;
  }) {
    const store = useParrotStore.getState();
    store.setVoiceStatus("connecting");
    store.pushReason("voice", "Connecting", "Opening a Grok Voice session…");

    const secret = await createVoiceClientSecret();
    if (!secret.ok) {
      store.setVoiceStatus("error", secret.error);
      store.pushReason("error", "Voice", secret.error);
      throw new Error(secret.error);
    }

    const protocol = secret.value.startsWith("xai-client-secret.")
      ? secret.value
      : `xai-client-secret.${secret.value}`;

    await this.player.ensure();

    const ws = new WebSocket(REALTIME_URL, [protocol]);
    this.ws = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "session.update",
          session: {
            voice: opts.voice,
            instructions: buildSystemPrompt({
              intensity: opts.intensity,
              scene: opts.scene,
              opening: opts.opening ?? undefined,
            }),
            tools: FURBY_TOOLS,
            turn_detection: { type: "server_vad", silence_duration_ms: 700 },
            audio: {
              input: { format: { type: "audio/pcm", rate: 24000 } },
              output: { format: { type: "audio/pcm", rate: 24000 } },
            },
          },
        }),
      );
      store.setVoiceStatus("listening");
      store.pushReason("voice", "Live", "Parrot is listening.");
      if (opts.opening) {
        this.speakOpening(opts.opening);
      }
      void this.startMic();
    };

    ws.onmessage = (ev) => {
      if (typeof ev.data !== "string") return;
      let event: { type: string; [k: string]: unknown };
      try {
        event = JSON.parse(ev.data) as { type: string; [k: string]: unknown };
      } catch {
        return;
      }
      void this.handleEvent(event);
    };

    ws.onerror = () => {
      useParrotStore.getState().setVoiceStatus("error", "Voice socket error");
    };
    ws.onclose = () => {
      this.ws = null;
      this.captureStop?.();
      this.captureStop = null;
      const s = useParrotStore.getState();
      if (s.voiceStatus !== "error") s.setVoiceStatus("idle");
      s.logSession(this.turns);
    };
  }

  private speakOpening(line: string) {
    const ws = this.ws;
    if (!ws) return;
    useParrotStore.getState().pushMessage("parrot", line);
    useParrotStore.getState().setTranscripts(undefined, line);
    ws.send(
      JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "assistant",
          content: [{ type: "output_text", text: line }],
        },
      }),
    );
    ws.send(
      JSON.stringify({
        type: "response.create",
        response: {
          instructions: `Speak this opening line in your croaky parrot voice, then wait for the human: "${line}"`,
        },
      }),
    );
    void furby.trigger("greet").catch(() => undefined);
    void furby.setAntennaPreset("cheeky").catch(() => undefined);
  }

  sendText(text: string) {
    const ws = this.ws;
    if (!ws || !text.trim()) return;
    useParrotStore.getState().pushMessage("user", text.trim());
    this.turns += 1;
    ws.send(
      JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: text.trim() }],
        },
      }),
    );
    ws.send(JSON.stringify({ type: "response.create" }));
  }

  interrupt() {
    this.ws?.send(JSON.stringify({ type: "response.cancel" }));
    this.player.interrupt();
  }

  stop() {
    this.captureStop?.();
    this.captureStop = null;
    this.ws?.close();
    this.ws = null;
    void this.player.close();
    useParrotStore.getState().setVoiceStatus("idle");
    useParrotStore.getState().setLevels(0, 0);
  }

  private async startMic() {
    try {
      const capture = await createCapture((b64, level) => {
        useParrotStore.getState().setLevels(level, useParrotStore.getState().parrotLevel);
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: "input_audio_buffer.append", audio: b64 }));
        }
      });
      this.captureStop = capture.stop;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Microphone unavailable";
      useParrotStore.getState().pushReason("voice", "No microphone", `${message}. Type to talk instead.`);
    }
  }

  private async handleEvent(event: { type: string; [k: string]: unknown }) {
    const store = useParrotStore.getState();
    switch (event.type) {
      case "input_audio_buffer.speech_started":
        store.setVoiceStatus("listening");
        this.player.interrupt();
        break;
      case "input_audio_buffer.speech_stopped":
        break;
      case "conversation.item.input_audio_transcription.completed":
      case "conversation.item.input_audio_transcription.updated": {
        const transcript = String(event.transcript ?? "");
        if (transcript) {
          store.setTranscripts(transcript, undefined);
          if (event.type.endsWith("completed")) {
            store.pushMessage("user", transcript);
            this.turns += 1;
          }
        }
        break;
      }
      case "response.output_audio.delta": {
        store.setVoiceStatus("speaking");
        const delta = String(event.delta ?? "");
        if (delta) {
          const pcm = base64ToPcm16(delta);
          store.setLevels(store.micLevel, Math.min(1, rms(pcm) * 3));
          await this.player.playPcm16(pcm);
        }
        break;
      }
      case "response.output_audio_transcript.delta":
      case "response.output_text.delta":
      case "response.text.delta": {
        const d = String(event.delta ?? "");
        this.outputBuf += d;
        store.setTranscripts(undefined, this.outputBuf);
        break;
      }
      case "response.output_audio_transcript.done":
      case "response.output_text.done":
      case "response.content_part.done": {
        if (this.outputBuf.trim()) {
          store.pushMessage("parrot", this.outputBuf.trim());
          this.outputBuf = "";
        }
        break;
      }
      case "response.function_call_arguments.done": {
        const name = String(event.name ?? "");
        const callId = String(event.call_id ?? "");
        let args: ToolArgs = {};
        try {
          args = JSON.parse(String(event.arguments ?? "{}")) as ToolArgs;
        } catch {
          args = {};
        }
        const result = await this.runTool(name, args);
        this.ws?.send(
          JSON.stringify({
            type: "conversation.item.create",
            item: { type: "function_call_output", call_id: callId, output: JSON.stringify(result) },
          }),
        );
        this.ws?.send(JSON.stringify({ type: "response.create" }));
        break;
      }
      case "response.done":
        store.setVoiceStatus("listening");
        store.setLevels(store.micLevel, 0);
        break;
      case "error": {
        const err = event.error as { message?: string } | undefined;
        const message = err?.message || "Voice error";
        store.setVoiceStatus("error", message);
        store.pushReason("error", "Voice", message);
        break;
      }
      default:
        break;
    }
  }

  private async runTool(name: string, args: ToolArgs) {
    const store = useParrotStore.getState();
    try {
      if (name === "trigger_furby_action") {
        const action = String(args.action ?? "surprised");
        await furby.trigger(action);
        store.pushReason("tool", "Motion", action);
        return { ok: true, action };
      }
      if (name === "set_antenna_colour") {
        const preset = args.preset ? String(args.preset) : null;
        if (preset && PRESET_ANTENNA[preset]) {
          await furby.setAntennaPreset(preset);
          return { ok: true, preset };
        }
        await furby.setAntenna({
          r: Number(args.r ?? 40),
          g: Number(args.g ?? 180),
          b: Number(args.b ?? 120),
        });
        return { ok: true };
      }
      if (name === "set_emotion") {
        const type = String(args.type ?? "excitedness") as
          | "excitedness"
          | "displeasedness"
          | "tiredness"
          | "fullness"
          | "wellness";
        const value = Number(args.value ?? 50);
        await furby.setMood(type, value);
        store.pushReason("tool", "Mood", `${type} → ${value}`);
        return { ok: true, type, value };
      }
      return { ok: false, error: `Unknown tool ${name}` };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "tool failed" };
    }
  }
}

export const voiceSession = new VoiceSession();
