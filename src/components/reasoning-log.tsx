import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParrotStore } from "@/lib/parrot/store";

export function ReasoningLog() {
  const reasoning = useParrotStore((s) => s.reasoning);
  const logs = useParrotStore((s) => s.logs);

  return (
    <Card className="flex min-h-0 flex-col p-3">
      <CardHeader className="mb-2">
        <CardTitle>Why that line</CardTitle>
      </CardHeader>
      <ScrollArea className="max-h-48 pr-2">
        {reasoning.length === 0 ? (
          <p className="text-sm text-muted">Scene analysis will land here.</p>
        ) : (
          <ol className="space-y-2">
            {[...reasoning].reverse().map((r) => (
              <li key={r.id} className="border-l border-border pl-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-subtle">
                  {r.kind} · {new Date(r.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </p>
                <p className="text-sm text-fg">{r.title}</p>
                <p className="text-xs text-muted">{r.detail}</p>
              </li>
            ))}
          </ol>
        )}
      </ScrollArea>
      {logs.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-subtle">Recent sessions</p>
          <ul className="space-y-1 text-xs text-muted">
            {logs.slice(0, 5).map((l) => (
              <li key={l.id} className="truncate">
                {l.sceneLabel} — {l.opening}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
