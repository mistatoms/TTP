import {
  FLUFF_SERVICE,
  GENERALPLUS_LISTEN,
  GENERALPLUS_WRITE,
  NORDIC_WRITE,
  buildActionCommand,
  buildAntennaCommand,
  buildDebugCommand,
  buildLcdCommand,
  buildMoodCommand,
  buildNordicAckCommand,
  buildSensorStreamCommand,
  parseSensorPacket,
  type ActionTuple,
  type AntennaColor,
  type MoodType,
  type SensorReading,
} from "./protocol";

/** Chrome GC of BluetoothDevice drops GATT. Pin it. */
const pinned: BluetoothDevice[] = [];

function pinDevice(device: BluetoothDevice) {
  if (!pinned.includes(device)) pinned.push(device);
}

export class BleFurby {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private writeChar: BluetoothRemoteGATTCharacteristic | null = null;
  private listenChar: BluetoothRemoteGATTCharacteristic | null = null;
  private nordicWrite: BluetoothRemoteGATTCharacteristic | null = null;
  private onSensor: ((r: SensorReading) => void) | null = null;
  private onDisconnect: (() => void) | null = null;
  private onReconnect: (() => void) | null = null;
  private wantOpen = false;
  private reconnectTimer: number | null = null;
  private reconnectAttempt = 0;
  private keepAliveTimer: number | null = null;
  private writeChain: Promise<void> = Promise.resolve();
  private notifying = false;
  private lastAntenna: AntennaColor | null = null;

  get isConnected() {
    return !!this.server?.connected && !!this.writeChar;
  }

  async connect(hooks: {
    onSensor?: (r: SensorReading) => void;
    onDisconnect?: () => void;
    onReconnect?: () => void;
  }): Promise<string> {
    if (!navigator.bluetooth) {
      throw new Error("Web Bluetooth is not available in this browser");
    }
    this.onSensor = hooks.onSensor ?? null;
    this.onDisconnect = hooks.onDisconnect ?? null;
    this.onReconnect = hooks.onReconnect ?? null;
    this.wantOpen = true;
    this.reconnectAttempt = 0;

    if (!this.device) {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: "Furby" }, { namePrefix: "FURBY" }],
        optionalServices: [FLUFF_SERVICE],
      });
      this.device = device;
      pinDevice(device);
      device.addEventListener("gattserverdisconnected", () => this.handleDrop());
    }

    await this.openGatt();
    return this.device.name || "Furby Connect";
  }

  async ensureConnected() {
    if (this.isConnected) return;
    if (!this.device) throw new Error("Furby is not paired. Tap Connect first.");
    this.wantOpen = true;
    await this.openGatt();
  }

  async disconnect() {
    this.wantOpen = false;
    this.stopKeepAlive();
    this.clearReconnect();
    try {
      await this.listenChar?.stopNotifications();
    } catch {
      /* ignore */
    }
    this.notifying = false;
    try {
      this.server?.disconnect();
    } catch {
      /* ignore */
    }
    this.server = null;
    this.writeChar = null;
    this.listenChar = null;
    this.nordicWrite = null;
    this.device = null;
  }

  async writeAction(tuple: ActionTuple) {
    await this.write(buildActionCommand(tuple));
  }
  async writeAntenna(c: AntennaColor) {
    this.lastAntenna = c;
    await this.write(buildAntennaCommand(c));
  }
  async writeMood(type: MoodType, value: number) {
    await this.write(buildMoodCommand(type, value, true));
  }
  async writeLcd(on: boolean) {
    await this.write(buildLcdCommand(on));
  }
  async writeDebug() {
    await this.write(buildDebugCommand());
  }

  private async openGatt() {
    const device = this.device;
    if (!device?.gatt) throw new Error("Furby GATT is unavailable");
    this.server = device.gatt.connected ? device.gatt : await device.gatt.connect();
    const service = await this.server.getPrimaryService(FLUFF_SERVICE);
    this.writeChar = await service.getCharacteristic(GENERALPLUS_WRITE);
    this.listenChar = await service.getCharacteristic(GENERALPLUS_LISTEN);
    try {
      this.nordicWrite = await service.getCharacteristic(NORDIC_WRITE);
    } catch {
      this.nordicWrite = null;
    }
    if (!this.notifying) {
      await this.listenChar.startNotifications();
      this.listenChar.addEventListener("characteristicvaluechanged", (ev) => {
        const target = ev.target as BluetoothRemoteGATTCharacteristic;
        const value = target.value;
        if (!value) return;
        const bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
        const reading = parseSensorPacket(bytes);
        if (reading) this.onSensor?.(reading);
      });
      this.notifying = true;
    }
    if (this.nordicWrite) {
      await this.writeRaw(this.nordicWrite, buildNordicAckCommand(true));
    }
    await this.write(buildLcdCommand(true));
    await this.write(buildSensorStreamCommand(true));
    if (this.lastAntenna) await this.write(buildAntennaCommand(this.lastAntenna));
    this.reconnectAttempt = 0;
    this.startKeepAlive();
  }

  private handleDrop() {
    this.server = null;
    this.writeChar = null;
    this.listenChar = null;
    this.nordicWrite = null;
    this.notifying = false;
    this.stopKeepAlive();
    this.onDisconnect?.();
    if (!this.wantOpen || !this.device) return;
    this.scheduleReconnect();
  }

  private scheduleReconnect() {
    this.clearReconnect();
    const delay = Math.min(8000, 400 * 2 ** this.reconnectAttempt);
    this.reconnectAttempt += 1;
    this.reconnectTimer = window.setTimeout(() => {
      void this.tryReconnect();
    }, delay);
  }

  private async tryReconnect() {
    if (!this.wantOpen || !this.device) return;
    try {
      await this.openGatt();
      this.onReconnect?.();
    } catch {
      if (this.wantOpen) this.scheduleReconnect();
    }
  }

  private startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveTimer = window.setInterval(() => {
      if (!this.isConnected) return;
      void this.write(buildSensorStreamCommand(true)).catch(() => undefined);
    }, 2500);
  }

  private stopKeepAlive() {
    if (this.keepAliveTimer != null) {
      window.clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  private clearReconnect() {
    if (this.reconnectTimer != null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private write(bytes: Uint8Array) {
    this.writeChain = this.writeChain
      .then(async () => {
        if (!this.writeChar) {
          if (this.wantOpen && this.device) await this.openGatt();
        }
        if (!this.writeChar) throw new Error("Furby is not connected over Bluetooth");
        await this.writeRaw(this.writeChar, bytes);
      })
      .catch((err) => {
        if (this.wantOpen && this.device && !this.isConnected) this.scheduleReconnect();
        throw err;
      });
    return this.writeChain;
  }

  private async writeRaw(char: BluetoothRemoteGATTCharacteristic, bytes: Uint8Array) {
    const copy = new Uint8Array(bytes);
    try {
      if (char.properties.writeWithoutResponse) {
        await char.writeValueWithoutResponse(copy);
      } else {
        await char.writeValue(copy);
      }
    } catch {
      await new Promise((r) => setTimeout(r, 80));
      if (char.properties.writeWithoutResponse) {
        await char.writeValueWithoutResponse(copy);
      } else {
        await char.writeValue(copy);
      }
    }
  }
}
