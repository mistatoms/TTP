import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useParrotStore } from "@/lib/parrot/store";

export function AudioMonitors() {
  const mic = useParrotStore((s) => s.micLevel);
  const parrot = useParrotStore((s) => s.parrotLevel);
  const transcriptIn = useParrotStore((s) => s.transcriptIn);
  const transcriptOut = useParrotStore((s) => s.transcriptOut);

  return (
    <Card className="p-3">
      <CardHeader className="mb-2">
        <CardTitle>Audio</CardTitle>
      </CardHeader>
      <Meter label="Mic" value={mic} />
      <p className="mt-1 min-h-8 text-xs text-muted">{transcriptIn || "—"}</p>
      <Meter label="Parrot" value={parrot} className="mt-3" />
      <p className="mt-1 min-h-8 text-xs text-fg/80">{transcriptOut || "—"}</p>
      <Waveform value={Math.max(mic, parrot)} />
    </Card>
  );
}

function Meter({ label, value, className = "" }: { label: string; value: number; className?: string }) {
  return (
    <div className={className}>
      <div className="mb-1 flex justify-between text-[11px] uppercase tracking-[0.14em] text-muted">
        <span>{label}</span>
        <span className="tabular-nums">{Math.round(value * 100)}</span>
      </div>
      <div className="flex h-2 gap-0.5">
        {Array.from({ length: 24 }, (_, i) => {
          const on = value > i / 24;
          return <span key={i} className={`flex-1 rounded-full ${on ? "bg-canal" : "bg-surface-2"}`} />;
        })}
      </div>
    </div>
  );
}

function Waveform({ value }: { value: number }) {
  const bars = 32;
  return (
    <div className="mt-4 flex h-10 items-end gap-px">
      {Array.from({ length: bars }, (_, i) => {
        const phase = Math.abs(Math.sin(i * 0.45 + value * 8));
        const h = 4 + phase * value * 34;
        return (
          <span
            key={i}
            className="flex-1 rounded-full bg-canal/70"
            style={{ height: `${h}px` }}
          />
        );
      })}
    </div>
  );
}
