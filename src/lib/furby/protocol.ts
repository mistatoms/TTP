/** FurBLE / bluefluff Furby Connect BLE protocol. */

export const FLUFF_SERVICE = "dab91435-b5a1-e29c-b041-bcd562613bde";
export const GENERALPLUS_WRITE = "dab91383-b5a1-e29c-b041-bcd562613bde";
export const GENERALPLUS_LISTEN = "dab91382-b5a1-e29c-b041-bcd562613bde";
export const NORDIC_WRITE = "dab90757-b5a1-e29c-b041-bcd562613bde";
export const NORDIC_LISTEN = "dab90756-b5a1-e29c-b041-bcd562613bde";
export const RSSI_LISTEN = "dab90755-b5a1-e29c-b041-bcd562613bde";
export const FILE_WRITE = "dab90758-b5a1-e29c-b041-bcd562613bde";

export const GP = {
  TRIGGER_BY_INPUT: 0x10,
  TRIGGER_BY_INDEX: 0x11,
  TRIGGER_BY_SUBINDEX: 0x12,
  TRIGGER_SPECIFIC: 0x13,
  SET_ANTENNA: 0x14,
  FURBY_MESSAGE: 0x20,
  SET_MOODMETER: 0x23,
  LCD_DEBUG: 0xdb,
  LCD_BACKLIGHT: 0xcd,
} as const;

export const FURBY_MSG = {
  SENSOR_STREAM_ON: 0x0d,
  SENSOR_STREAM_OFF: 0x0e,
} as const;

export type MoodType = "excitedness" | "displeasedness" | "tiredness" | "fullness" | "wellness";

export const MOOD_TYPE_ID: Record<MoodType, number> = {
  excitedness: 0,
  displeasedness: 1,
  tiredness: 2,
  fullness: 3,
  wellness: 4,
};

export interface ActionTuple {
  input: number;
  index: number;
  subindex: number;
  specific: number;
}

export interface AntennaColor {
  r: number;
  g: number;
  b: number;
}

export interface SensorReading {
  at: number;
  raw: number[];
  antennaX: number;
  antennaY: number;
  motion: number;
  tickle: number;
}

export function buildActionCommand(a: ActionTuple): Uint8Array {
  return new Uint8Array([GP.TRIGGER_SPECIFIC, 0x00, a.input, a.index, a.subindex, a.specific]);
}

export function buildAntennaCommand(c: AntennaColor): Uint8Array {
  return new Uint8Array([GP.SET_ANTENNA, clampByte(c.r), clampByte(c.g), clampByte(c.b)]);
}

export function buildMoodCommand(type: MoodType, value: number, absolute = true): Uint8Array {
  return new Uint8Array([GP.SET_MOODMETER, absolute ? 1 : 0, MOOD_TYPE_ID[type], clampByte(value)]);
}

export function buildLcdCommand(on: boolean): Uint8Array {
  return new Uint8Array([GP.LCD_BACKLIGHT, on ? 0x01 : 0x00]);
}

export function buildDebugCommand(): Uint8Array {
  return new Uint8Array([GP.LCD_DEBUG]);
}

export function buildSensorStreamCommand(on: boolean): Uint8Array {
  return new Uint8Array([GP.FURBY_MESSAGE, on ? FURBY_MSG.SENSOR_STREAM_ON : FURBY_MSG.SENSOR_STREAM_OFF]);
}

export function buildNordicAckCommand(on: boolean): Uint8Array {
  return new Uint8Array([0x09, on ? 0x01 : 0x00]);
}

export function parseSensorPacket(bytes: Uint8Array): SensorReading | null {
  if (bytes.length < 2) return null;
  return {
    at: Date.now(),
    raw: Array.from(bytes),
    antennaX: bytes[1] ?? 0,
    antennaY: bytes[2] ?? 0,
    motion: bytes[3] ?? 0,
    tickle: bytes[4] ?? 0,
  };
}

function clampByte(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

export const PRESET_ANTENNA: Record<string, AntennaColor> = {
  off: { r: 0, g: 0, b: 0 },
  moss: { r: 40, g: 180, b: 120 },
  canal: { r: 30, g: 140, b: 150 },
  cheeky: { r: 220, g: 80, b: 40 },
  surprise: { r: 255, g: 210, b: 40 },
  sleepy: { r: 50, g: 40, b: 160 },
  white: { r: 255, g: 255, b: 255 },
  red: { r: 220, g: 30, b: 30 },
  green: { r: 30, g: 170, b: 70 },
  blue: { r: 40, g: 80, b: 220 },
};
