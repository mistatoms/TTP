import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParrotStore } from "@/lib/parrot/store";
import { voiceSession } from "@/lib/voice/session";
import { synthesizeSpeech } from "@/lib/server/voice";
import { PcmPlayer } from "@/lib/voice/audio";
import { toast } from "sonner";

const ttsPlayer = new PcmPlayer();

export function ConversationPanel() {
  const messages = useParrotStore((s) => s.messages);
  const voiceStatus = useParrotStore((s) => s.voiceStatus);
  const pendingOpening = useParrotStore((s) => s.pendingOpening);
  const voiceId = useParrotStore((s) => s.voiceId);
  const pushMessage = useParrotStore((s) => s.pushMessage);
  const clearConversation = useParrotStore((s) => s.clearConversation);
  const [draft, setDraft] = useState("");
  const [speakingLine, setSpeakingLine] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    if (voiceSession.active) {
      voiceSession.sendText(text);
    } else {
      pushMessage("user", text);
      pushMessage(
        "system",
        "Start talk to let the parrot answer in voice. You can still preview openings below.",
      );
    }
  }

  async function speakOpening() {
    if (!pendingOpening) return;
    if (speakingLine || voiceSession.isBusy || voiceStatus === "speaking") return;
    if (voiceSession.active) {
      voiceSession.sendText(`(speak this opening, then wait) ${pendingOpening}`);
      return;
    }
    setSpeakingLine(true);
    try {
      await ttsPlayer.insertNoise("rawk", true);
      const res = await synthesizeSpeech({ data: { text: pendingOpening, voice: voiceId } });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      pushMessage("parrot", pendingOpening);
      await ttsPlayer.playBase64Audio(res.audio);
      await ttsPlayer.insertNoise("rasp");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not speak");
    } finally {
      setSpeakingLine(false);
    }
  }

  const locked = speakingLine || voiceSession.isBusy || voiceStatus === "speaking";

  return (
    <Card className="flex h-80 flex-col overflow-hidden p-3 md:h-96">
      <CardHeader className="mb-2 shrink-0">
        <CardTitle>Conversation</CardTitle>
        <div className="flex gap-2">
          <button
            type="button"
            className="text-[11px] text-muted hover:text-fg"
            onClick={() => void speakOpening()}
            disabled={!pendingOpening || locked}
          >
            {locked && voiceStatus === "speaking" ? "Speaking…" : "Speak opening"}
          </button>
          <button type="button" className="text-[11px] text-muted hover:text-fg" onClick={clearConversation}>
            Clear
          </button>
        </div>
      </CardHeader>
      <ScrollArea className="min-h-0 flex-1 pr-2">
        {messages.length === 0 ? (
          <p className="px-1 py-6 text-sm text-muted">
            No banter yet. Pick a tow-path scene, then start talk — or speak the opening on its own.
          </p>
        ) : (
          <ul className="space-y-2">
            {messages.map((m) => (
              <li
                key={m.id}
                className={
                  m.role === "parrot"
                    ? "rounded-md bg-canal/10 px-3 py-2 text-sm"
                    : m.role === "user"
                      ? "rounded-md bg-surface-2 px-3 py-2 text-sm"
                      : "px-1 text-xs text-subtle"
                }
              >
                <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-muted">
                  {m.role === "parrot" ? "Parrot" : m.role === "user" ? "Passer-by" : "System"}
                </span>
                {m.text}
              </li>
            ))}
          </ul>
        )}
        <div ref={endRef} />
      </ScrollArea>
      <form
        className="mt-3 flex shrink-0 gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={voiceSession.active ? "Talk back, or type…" : "Type a reply (start talk for voice)"}
        />
        <Button type="submit" size="icon" variant="secondary" aria-label="Send">
          <Send />
        </Button>
      </form>
      <p className="mt-2 shrink-0 text-[11px] text-subtle">
        {voiceStatus === "listening"
          ? "Listening on the tow path…"
          : voiceStatus === "speaking"
            ? "Parrot is talking."
            : "Voice idle."}
      </p>
    </Card>
  );
}
