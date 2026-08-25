/**
 * Convex backend client. All requests go to the user's deployed Convex
 * site. URLs come from NEXT_PUBLIC_CONVEX_SITE_URL; if unset, callers get
 * a clear error rather than a silent mock.
 *
 * No mocks. No fallbacks. If the network call fails, the error propagates
 * to the UI which displays it to the user.
 */

const SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

if (!SITE_URL) {
  // Surface at build time; production deploys must set this in Vercel.
  console.warn(
    "[convex] NEXT_PUBLIC_CONVEX_SITE_URL is not set — API calls will fail.",
  );
}

export class ConvexError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ConvexError";
    this.status = status;
  }
}

function url(path: string, params?: Record<string, string | number>): string {
  if (!SITE_URL) {
    throw new ConvexError(
      "Backend not configured. Set NEXT_PUBLIC_CONVEX_SITE_URL in your environment.",
      0,
    );
  }
  const u = new URL(path, SITE_URL);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      u.searchParams.set(k, String(v));
    }
  }
  return u.toString();
}

async function getJson<T>(
  path: string,
  params?: Record<string, string | number>,
  signal?: AbortSignal,
): Promise<T> {
  const res = await fetch(url(path, params), { signal, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ConvexError(
      `Backend ${res.status}: ${text || res.statusText}`,
      res.status,
    );
  }
  return (await res.json()) as T;
}

export interface WeatherSnapshot {
  tempC: number;
  tempF: number;
  condition: string;
  forecast: string[];
}

export function getWeather(
  lat: number,
  lng: number,
  units: "C" | "F",
  signal?: AbortSignal,
): Promise<WeatherSnapshot> {
  return getJson<WeatherSnapshot>(
    "/api/weather",
    { lat, lng, units },
    signal,
  );
}

export interface Attraction {
  name: string;
  type: string;
  distanceKm: number;
  openNow: boolean;
}

export function getPlaces(
  lat: number,
  lng: number,
  radiusKm: number,
  signal?: AbortSignal,
): Promise<{ places: Attraction[] }> {
  return getJson<{ places: Attraction[] }>(
    "/api/places",
    { lat, lng, radius: radiusKm },
    signal,
  );
}

export function getReverse(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<{ label: string }> {
  return getJson<{ label: string }>(
    "/api/reverse",
    { lat, lng },
    signal,
  );
}
