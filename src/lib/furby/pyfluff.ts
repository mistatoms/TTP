import type { ActionTuple, AntennaColor, MoodType, SensorReading } from "./protocol";

/** Talks to a PyFluff FastAPI host (Raspberry Pi, laptop, etc.). */
export class PyFluffClient {
  baseUrl = "";
  private sensorWs: WebSocket | null = null;

  private url(path: string) {
    if (!this.baseUrl) throw new Error("Set a PyFluff URL first");
    return `${this.baseUrl}${path}`;
  }

  async connect(address?: string) {
    const res = await fetch(this.url("/connect"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(address ? { address } : {}),
    });
    if (!res.ok) throw new Error(`PyFluff connect failed (${res.status})`);
    const body = (await res.json().catch(() => ({}))) as { name?: string; message?: string };
    return { name: body.name ?? "Furby Connect" };
  }

  async disconnect() {
    this.sensorWs?.close();
    this.sensorWs = null;
    if (!this.baseUrl) return;
    await fetch(this.url("/disconnect"), { method: "POST" }).catch(() => undefined);
  }

  async action(tuple: ActionTuple) {
    const res = await fetch(this.url("/action"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tuple),
    });
    if (!res.ok) throw new Error(`Action failed (${res.status})`);
  }

  async sequence(actions: ActionTuple[], delay = 1.2) {
    const res = await fetch(this.url("/actions/sequence"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actions, delay }),
    });
    if (!res.ok) throw new Error(`Sequence failed (${res.status})`);
  }

  async antenna(c: AntennaColor) {
    await fetch(this.url("/antenna"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ red: c.r, green: c.g, blue: c.b }),
    });
  }

  async mood(type: MoodType, value: number) {
    await fetch(this.url("/mood"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, value, action: 1 }),
    });
  }

  async lcd(on: boolean) {
    await fetch(this.url(`/lcd/${on}`), { method: "POST" });
  }

  async debug() {
    await fetch(this.url("/debug"), { method: "POST" });
  }

  async status() {
    const res = await fetch(this.url("/status"));
    return res.json();
  }

  watchSensors(onReading: (r: SensorReading) => void) {
    if (!this.baseUrl) return;
    const wsUrl = this.baseUrl.replace(/^http/, "ws") + "/ws/sensors";
    const ws = new WebSocket(wsUrl);
    this.sensorWs = ws;
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(String(ev.data)) as Partial<SensorReading> & { raw?: number[] };
        onReading({
          at: Date.now(),
          raw: data.raw ?? [],
          antennaX: data.antennaX ?? 0,
          antennaY: data.antennaY ?? 0,
          motion: data.motion ?? 0,
          tickle: data.tickle ?? 0,
        });
      } catch {
        /* ignore */
      }
    };
  }
}
