import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FURBY_ACTIONS } from "@/lib/furby/actions";
import { furby } from "@/lib/furby/controller";
import { PRESET_ANTENNA } from "@/lib/furby/protocol";
import { useParrotStore } from "@/lib/parrot/store";
import { toast } from "sonner";

export function FurbyPanel() {
  const mode = useParrotStore((s) => s.furbyMode);
  const setFurbyMode = useParrotStore((s) => s.setFurbyMode);
  const pyfluffUrl = useParrotStore((s) => s.pyfluffUrl);
  const setPyfluffUrl = useParrotStore((s) => s.setPyfluffUrl);
  const antenna = useParrotStore((s) => s.antenna);
  const lastAction = useParrotStore((s) => s.lastAction);
  const sensors = useParrotStore((s) => s.sensors);
  const connected = useParrotStore((s) => s.furbyConnected);
  const [custom, setCustom] = useState("29 0 0 0");

  async function run(id: string) {
    try {
      await furby.trigger(id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  }

  async function runCustom() {
    const parts = custom.split(/[,\s]+/).map((n) => Number(n));
    if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
      toast.error("Need four numbers: input, index, subindex, specific");
      return;
    }
    try {
      await furby.trigger({
        input: parts[0]!,
        index: parts[1]!,
        subindex: parts[2]!,
        specific: parts[3]!,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  }

  return (
    <Card className="p-3">
      <CardHeader className="mb-2">
        <CardTitle>Furby control</CardTitle>
        <span className="text-[11px] text-subtle">{connected ? "linked" : "offline"}</span>
      </CardHeader>

      <div className="mb-3 flex rounded-sm bg-surface-2 p-0.5">
        {(["simulator", "bluetooth", "pyfluff"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setFurbyMode(m)}
            className={`min-h-8 flex-1 rounded-xs px-2 text-[11px] capitalize ${
              mode === m ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted"
            }`}
          >
            {m === "pyfluff" ? "PyFluff" : m === "bluetooth" ? "Web BLE" : "Sim"}
          </button>
        ))}
      </div>

      {mode === "bluetooth" && (
        <p className="mb-3 text-xs text-muted">
          Chrome on a machine next to the Furby. Pairing needs a tap — use Connect in the header.
        </p>
      )}
      {mode === "pyfluff" && (
        <div className="mb-3 flex gap-2">
          <Input
            placeholder="http://raspberrypi.local:8080"
            value={pyfluffUrl}
            onChange={(e) => setPyfluffUrl(e.target.value)}
          />
        </div>
      )}

      <Tabs defaultValue="actions">
        <TabsList className="w-full">
          <TabsTrigger value="actions" className="flex-1">
            Actions
          </TabsTrigger>
          <TabsTrigger value="antenna" className="flex-1">
            Antenna
          </TabsTrigger>
          <TabsTrigger value="sensors" className="flex-1">
            Sensors
          </TabsTrigger>
        </TabsList>
        <TabsContent value="actions">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {FURBY_ACTIONS.map((a) => (
              <Button key={a.id} variant="secondary" size="sm" onClick={() => void run(a.id)}>
                {a.label}
              </Button>
            ))}
          </div>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void runCustom();
            }}
          >
            <Input
              defaultValue="29 0 0 0"
              onChange={(e) => setCustom(e.target.value)}
              placeholder="input index subindex specific"
              className="font-mono text-xs"
              autoComplete="off"
            />
            <Button type="submit" variant="outline" size="sm">
              Send
            </Button>
          </form>
          {lastAction && <p className="mt-2 text-xs text-muted">Last: {lastAction}</p>}
        </TabsContent>
        <TabsContent value="antenna">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {Object.keys(PRESET_ANTENNA).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => void furby.setAntennaPreset(name)}
                className="flex min-h-8 items-center gap-2 rounded-full bg-surface-2 px-3 text-[11px] capitalize text-muted hover:text-fg"
              >
                <span
                  className="size-3 rounded-full"
                  style={{
                    background: `rgb(${PRESET_ANTENNA[name]!.r},${PRESET_ANTENNA[name]!.g},${PRESET_ANTENNA[name]!.b})`,
                  }}
                />
                {name}
              </button>
            ))}
          </div>
          {(["r", "g", "b"] as const).map((ch) => (
            <label key={ch} className="mb-2 block">
              <span className="mb-1 flex justify-between text-[11px] uppercase tracking-[0.14em] text-muted">
                {ch}
                <span className="tabular-nums">{antenna[ch]}</span>
              </span>
              <Slider
                max={255}
                value={[antenna[ch]]}
                onValueChange={([v]) => void furby.setAntenna({ ...antenna, [ch]: v ?? 0 })}
              />
            </label>
          ))}
          <div className="mt-3 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void furby.setLcd(true)}>
              LCD on
            </Button>
            <Button variant="outline" size="sm" onClick={() => void furby.setLcd(false)}>
              LCD off
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void furby.debug()}>
              Debug
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="sensors">
          {sensors ? (
            <dl className="grid grid-cols-2 gap-2 text-xs">
              <Row k="Antenna X" v={String(sensors.antennaX)} />
              <Row k="Antenna Y" v={String(sensors.antennaY)} />
              <Row k="Motion" v={String(sensors.motion)} />
              <Row k="Tickle" v={String(sensors.tickle)} />
              <Row k="Raw" v={sensors.raw.slice(0, 8).join(" ")} />
            </dl>
          ) : (
            <p className="text-sm text-muted">
              No sensor stream yet. Simulator stays quiet; BLE and PyFluff push packets when linked.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-subtle">{k}</dt>
      <dd className="font-mono text-fg">{v}</dd>
    </div>
  );
}
