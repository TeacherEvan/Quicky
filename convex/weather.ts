import { httpAction } from "./_generated/server";

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

export function conditionForCode(code: number): string {
  if (code === 0) return "Clear";
  if (code >= 1 && code <= 3) return "Cloudy";
  if (code >= 45 && code <= 48) return "Fog";
  if (code >= 51 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 95) return "Storm";
  return "Cloudy";
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const r = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * GET /api/weather?lat=..&lng=..&units=C|F
 * Proxies Open-Meteo (no API key needed). Pure proxy — no DB.
 */
export const weatherHandler = httpAction(async (_ctx, request) => {
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat") ?? "0");
  const lng = Number(url.searchParams.get("lng") ?? "0");
  const units = (url.searchParams.get("units") ?? "C").toUpperCase();
  try {
    const params = new URLSearchParams({
      latitude: lat.toFixed(2),
      longitude: lng.toFixed(2),
      current: "temperature_2m,weather_code",
      daily: "temperature_2m_max,temperature_2m_min",
      timezone: "auto",
    });
    if (units === "F") params.set("temperature_unit", "fahrenheit");
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!res.ok) throw new Error("upstream");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await res.json()) as any;
    const value = Number(data.current.temperature_2m);
    const code = Number(data.current.weather_code);
    const maxes: number[] = ((data.daily.temperature_2m_max ?? []) as unknown[])
      .slice(0, 3)
      .map(Number);
    const tempC = units === "F" ? ((value - 32) * 5) / 9 : value;
    const tempF = units === "F" ? value : (value * 9) / 5 + 32;
    const body = {
      tempC: Math.round(tempC * 10) / 10,
      tempF: Math.round(tempF * 10) / 10,
      condition: conditionForCode(code),
      forecast: maxes.map((m) => `${Math.round(m)}°`),
    };
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: corsHeaders,
    });
  } catch {
    return new Response(JSON.stringify({ error: "upstream" }), {
      status: 502,
      headers: corsHeaders,
    });
  }
});

export { haversineKm };
