import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParrotStore } from "@/lib/parrot/store";

export function ScenePanel() {
  const scene = useParrotStore((s) => s.scene);
  const opening = useParrotStore((s) => s.pendingOpening);
  const forceNewOpening = useParrotStore((s) => s.forceNewOpening);

  if (!scene) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scene</CardTitle>
        </CardHeader>
        <p className="text-sm text-muted">Waiting for a frame…</p>
      </Card>
    );
  }

  const pct = Math.round(scene.confidence * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scene</CardTitle>
        <Badge variant="canal">{scene.dayPart}</Badge>
      </CardHeader>
      <p className="font-display text-xl leading-snug tracking-tight text-fg">{scene.label}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-canal" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs tabular-nums text-muted">{pct}% confidence</p>
      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <Row k="When" v={`${scene.weekday} · ${scene.clock}`} />
        <Row k="Group" v={`${scene.groupSize}`} />
        <Row k="Activity" v={scene.activity} />
        <Row k="Dog" v={scene.hasDog ? "yes" : "no"} />
        <Row k="Bicycle" v={scene.hasBicycle ? "yes" : "no"} />
        <Row k="Close-up" v={scene.closeUp ? "desk" : "path"} />
      </dl>
      {scene.notes.length > 0 && (
        <p className="mt-3 text-xs text-subtle">{scene.notes.join(" ")}</p>
      )}
      {opening && (
        <blockquote className="mt-4 rounded-md bg-surface-2 px-3 py-2 text-sm leading-relaxed text-fg">
          “{opening}”
        </blockquote>
      )}
      <button
        type="button"
        className="mt-3 text-xs text-muted underline-offset-2 hover:text-fg hover:underline"
        onClick={() => forceNewOpening()}
      >
        Force a new opening
      </button>
    </Card>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-subtle">{k}</dt>
      <dd className="capitalize text-fg">{v}</dd>
    </div>
  );
}
