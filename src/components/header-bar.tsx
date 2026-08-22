import { Bluetooth, BluetoothOff, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ParrotMascot } from "@/components/parrot-mascot";
import { furby } from "@/lib/furby/controller";
import { PARROT_VOICE_IDS } from "@/lib/parrot/persona";
import { useParrotStore } from "@/lib/parrot/store";
import type { RoastIntensity } from "@/lib/parrot/types";
import { voiceSession } from "@/lib/voice/session";
import { toast } from "sonner";

const ROASTS: RoastIntensity[] = ["mild", "medium", "unhinged"];

export function HeaderBar() {
  const antenna = useParrotStore((s) => s.antenna);
  const voiceStatus = useParrotStore((s) => s.voiceStatus);
  const furbyConnected = useParrotStore((s) => s.furbyConnected);
  const furbyName = useParrotStore((s) => s.furbyName);
  const furbyDetail = useParrotStore((s) => s.furbyDetail);
  const furbyMode = useParrotStore((s) => s.furbyMode);
  const roast = useParrotStore((s) => s.roastIntensity);
  const setRoast = useParrotStore((s) => s.setRoast);
  const autoEngage = useParrotStore((s) => s.autoEngage);
  const setAutoEngage = useParrotStore((s) => s.setAutoEngage);
  const scene = useParrotStore((s) => s.scene);
  const pendingOpening = useParrotStore((s) => s.pendingOpening);
  const voiceId = useParrotStore((s) => s.voiceId);
  const setVoiceId = useParrotStore((s) => s.setVoiceId);
  const aiAvailable = useParrotStore((s) => s.aiAvailable);
  const setFurbyMode = useParrotStore((s) => s.setFurbyMode);
  const live = voiceStatus !== "idle" && voiceStatus !== "error";
  const bleOn = furbyConnected && furbyMode === "bluetooth";

  async function onConnect() {
    try {
      if (furbyMode === "bluetooth" && furbyConnected) {
        await furby.disconnect();
        return;
      }
      if (!furby.bluetoothAvailable()) {
        toast.error("FurBLE needs Chrome with Web Bluetooth.");
        return;
      }
      if (furbyMode !== "bluetooth") setFurbyMode("bluetooth");
      await furby.connect();
      toast.success(`FurBLE linked to ${useParrotStore.getState().furbyName}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not connect");
    }
  }

  async function onVoice() {
    if (live) {
      voiceSession.stop();
      return;
    }
    try {
      await voiceSession.start({
        voice: voiceId,
        intensity: roast,
        scene,
        opening: pendingOpening,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Voice failed");
    }
  }

  function cycleVoice() {
    const i = PARROT_VOICE_IDS.indexOf(voiceId);
    setVoiceId(PARROT_VOICE_IDS[(i + 1) % PARROT_VOICE_IDS.length]!);
  }

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <ParrotMascot antenna={antenna} speaking={voiceStatus === "speaking"} status={voiceStatus} />
        <div className="min-w-0">
          <p className="font-display text-xl leading-tight tracking-tight text-fg md:text-2xl">TTPFTTP</p>
          <p className="truncate text-xs text-muted">Trash Talking Parrot for the Tow Path</p>
        </div>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <div className="flex rounded-sm bg-surface-2 p-0.5 shadow-[var(--shadow-border)]">
          {ROASTS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setRoast(level)}
              className={`min-h-8 rounded-xs px-3 text-xs font-medium capitalize ${
                roast === level
                  ? level === "unhinged"
                    ? "bg-danger/20 text-danger shadow-[var(--shadow-border)]"
                    : "bg-surface text-fg shadow-[var(--shadow-border)]"
                  : "text-muted"
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={cycleVoice}
          className="min-h-8 rounded-sm px-3 text-xs capitalize text-muted shadow-[var(--shadow-border)] hover:text-fg"
        >
          Voice {voiceId}
        </button>

        <label className="flex min-h-10 items-center gap-2 rounded-sm px-2 text-xs text-muted">
          <Switch checked={autoEngage} onCheckedChange={setAutoEngage} />
          Auto-engage
        </label>

        <Button variant={live ? "canal" : "default"} onClick={() => void onVoice()} disabled={aiAvailable === false}>
          <Radio />
          {live ? "End talk" : "Start talk"}
        </Button>

        <Button variant={bleOn ? "canal" : "outline"} onClick={() => void onConnect()}>
          {bleOn ? <Bluetooth /> : <BluetoothOff />}
          {bleOn ? "Disconnect" : "Connect Furby"}
        </Button>
      </div>

      <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
        <Badge variant={furbyConnected ? "live" : "outline"}>{furbyName}</Badge>
        <span className="truncate text-xs text-subtle">{furbyDetail}</span>
        <Badge variant={voiceStatus === "error" ? "danger" : voiceStatus === "idle" ? "outline" : "canal"}>
          {voiceStatus}
        </Badge>
        {aiAvailable === false && <Badge variant="warn">Voice API offline</Badge>}
      </div>
    </header>
  );
}
