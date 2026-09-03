import type { WeatherKind, WeatherSnapshot } from "./types";

const DEFAULT_LAT = 52.4862;
const DEFAULT_LON = -1.8904;

const WMO: { codes: number[]; kind: WeatherKind; label: string }[] = [
  { codes: [0], kind: "clear", label: "Clear" },
  { codes: [1, 2], kind: "clear", label: "Mostly clear" },
  { codes: [3], kind: "cloudy", label: "Overcast" },
  { codes: [45, 48], kind: "fog", label: "Fog" },
  { codes: [51, 53, 55, 56, 57], kind: "drizzle", label: "Drizzle" },
  { codes: [61, 63, 65, 66, 67, 80, 81, 82], kind: "rain", label: "Rain" },
  { codes: [71, 73, 75, 77, 85, 86], kind: "snow", label: "Snow" },
  { codes: [95, 96, 99], kind: "storm", label: "Storm" },
];

export function weatherFromCode(code: number, windKph: number | null): { kind: WeatherKind; label: string } {
  if ((windKph ?? 0) >= 40 && code <= 3) return { kind: "wind", label: "Blowy" };
  for (const row of WMO) {
    if (row.codes.includes(code)) return { kind: row.kind, label: row.label };
  }
  return { kind: "cloudy", label: "Grey" };
}

export async function fetchWeather(): Promise<WeatherSnapshot> {
  let lat = DEFAULT_LAT;
  let lon = DEFAULT_LON;
  if (typeof navigator !== "undefined" && navigator.geolocation) {
    const pos = await new Promise<GeolocationPosition | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (p) => resolve(p),
        () => resolve(null),
        { timeout: 2500, maximumAge: 30 * 60_000 },
      );
    });
    if (pos) {
      lat = pos.coords.latitude;
      lon = pos.coords.longitude;
    }
  }
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,precipitation,wind_speed_10m&wind_speed_unit=kmh`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather ${res.status}`);
  const body = (await res.json()) as {
    current?: { temperature_2m?: number; weather_code?: number; wind_speed_10m?: number };
  };
  const code = Number(body.current?.weather_code ?? 3);
  const wind = body.current?.wind_speed_10m ?? null;
  const parsed = weatherFromCode(code, wind);
  return {
    kind: parsed.kind,
    label: parsed.label,
    tempC: body.current?.temperature_2m ?? null,
    windKph: wind,
    code,
    at: Date.now(),
  };
}
