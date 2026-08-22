import { ACTION_BY_ID, type NamedAction } from "./actions";
import {
  PRESET_ANTENNA,
  type ActionTuple,
  type AntennaColor,
  type MoodType,
  type SensorReading,
} from "./protocol";
import { BleFurby } from "./ble";
import { SimulatedFurby } from "./simulator";
import type { FurbyMode } from "@/lib/parrot/types";

export type FurbyEvent =
  | { type: "status"; connected: boolean; name: string; detail: string }
  | { type: "sensor"; reading: SensorReading }
  | { type: "action"; label: string }
  | { type: "antenna"; color: AntennaColor }
  | { type: "error"; message: string };

type Listener = (e: FurbyEvent) => void;

class FurbyController {
  mode: FurbyMode = "simulator";
  private ble = new BleFurby();
  private sim = new SimulatedFurby();
  private listeners = new Set<Listener>();
  lastAction: string | null = null;
  antenna: AntennaColor = { ...PRESET_ANTENNA.moss };
  connected = true;
  name = "Simulator";

  on(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(e: FurbyEvent) {
    this.listeners.forEach((fn) => fn(e));
  }

  setMode(mode: FurbyMode) {
    if (this.mode === mode) return;
    void this.disconnect();
    this.mode = mode;
    if (mode === "simulator") {
      this.connected = true;
      this.name = "Simulator";
      this.emit({ type: "status", connected: true, name: this.name, detail: "Simulator online" });
    } else {
      this.connected = false;
      this.name = "FurBLE";
      this.emit({ type: "status", connected: false, name: this.name, detail: "FurBLE idle" });
    }
  }

  async connect() {
    if (this.mode === "simulator") {
      this.connected = true;
      this.name = "Simulator";
      this.emit({ type: "status", connected: true, name: this.name, detail: "Simulator ready" });
      return;
    }
    this.emit({ type: "status", connected: false, name: "FurBLE", detail: "Requesting Furby…" });
    try {
      const name = await this.ble.connect({
        onSensor: (r) => this.emit({ type: "sensor", reading: r }),
        onDisconnect: () => {
          this.connected = false;
          this.emit({
            type: "status",
            connected: false,
            name: this.name,
            detail: "Dropped — reconnecting…",
          });
        },
        onReconnect: () => {
          this.connected = true;
          this.emit({
            type: "status",
            connected: true,
            name: this.name,
            detail: "FurBLE reconnected",
          });
        },
      });
      this.connected = true;
      this.name = name;
      this.emit({ type: "status", connected: true, name, detail: "FurBLE connected" });
      await this.setAntenna(this.antenna);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bluetooth failed";
      this.emit({ type: "error", message });
      throw err;
    }
  }

  async disconnect() {
    if (this.mode === "bluetooth") await this.ble.disconnect();
    if (this.mode !== "simulator") {
      this.connected = false;
      this.emit({ type: "status", connected: false, name: this.name, detail: "Disconnected" });
    }
  }

  async trigger(idOrTuple: string | ActionTuple) {
    const named: NamedAction | undefined =
      typeof idOrTuple === "string" ? ACTION_BY_ID[idOrTuple] : undefined;
    const tuple = named?.tuple ?? (typeof idOrTuple === "string" ? undefined : idOrTuple);
    if (!tuple) throw new Error(`Unknown action ${String(idOrTuple)}`);
    const label = named?.label ?? `${tuple.input}.${tuple.index}.${tuple.subindex}.${tuple.specific}`;
    this.lastAction = label;
    this.sim.play(label);
    if (this.mode === "bluetooth") {
      try {
        await this.ble.ensureConnected();
        await this.ble.writeAction(tuple);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Action failed";
        this.emit({ type: "error", message });
      }
    }
    this.emit({ type: "action", label });
  }

  async setAntenna(color: AntennaColor) {
    this.antenna = { ...color };
    this.sim.setAntenna(color);
    if (this.mode === "bluetooth") {
      try {
        await this.ble.ensureConnected();
        await this.ble.writeAntenna(color);
      } catch {
        /* keep local colour */
      }
    }
    this.emit({ type: "antenna", color });
  }

  async setAntennaPreset(name: string) {
    const c = PRESET_ANTENNA[name] ?? PRESET_ANTENNA.moss;
    await this.setAntenna(c);
  }

  async setMood(type: MoodType, value: number) {
    if (this.mode === "bluetooth") {
      try {
        await this.ble.ensureConnected();
        await this.ble.writeMood(type, value);
      } catch {
        /* ignore */
      }
    }
  }

  async setLcd(on: boolean) {
    if (this.mode === "bluetooth") {
      try {
        await this.ble.ensureConnected();
        await this.ble.writeLcd(on);
      } catch {
        /* ignore */
      }
    }
  }

  async debug() {
    if (this.mode === "bluetooth") {
      try {
        await this.ble.ensureConnected();
        await this.ble.writeDebug();
      } catch {
        /* ignore */
      }
    }
  }

  bluetoothAvailable() {
    return typeof navigator !== "undefined" && !!navigator.bluetooth;
  }
}

export const furby = new FurbyController();
