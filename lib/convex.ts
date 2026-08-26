/**
 * Convex backend client. All requests go to the user's deployed Convex
 * site. URLs come from NEXT_PUBLIC_CONVEX_SITE_URL; if unset, callers get
 * a clear error rather than a silent mock.
 *
 * No mocks. No fallbacks. If the network call fails, the error propagates
 * to the UI which displays it to the user.
 *
 * A small module-level cache (30s TTL) deduplicates identical in-flight
 * requests and reuses fresh data across components. Callers may still
 * pass their own AbortSignal — the signal is not cached.
 */

const SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

if (!SITE_URL) {
  // Surface at build time; production deploys must set this in Vercel.
  console.warn(
    "[convex] NEXT_PUBLIC_CONVEX_SITE_URL is not set — API calls will fail.",
  );
}

const CACHE_TTL_MS = 30_000;

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

function stableHash(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableHash).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableHash(obj[k])}`).join(",")}}`;
}

interface CacheEntry<T> {
  expiresAt: number;
  promise: Promise<T>;
  data?: T;
}

const cache = new Map<string, CacheEntry<unknown>>();

export function _cacheBust(): void {
  cache.clear();
}

function dedupedFetch<T>(
  cacheKey: string,
  path: string,
  params?: Record<string, string | number>,
  signal?: AbortSignal,
): Promise<T> {
  const now = Date.now();
  const existing = cache.get(cacheKey) as CacheEntry<T> | undefined;

  if (existing && existing.expiresAt > now) {
    if (existing.data !== undefined) {
      return Promise.resolve(existing.data);
    }
    return existing.promise;
  }

  const promise = (async () => {
    const res = await fetch(url(path, params), { signal, cache: "no-store" });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new ConvexError(
        `Backend ${res.status}: ${text || res.statusText}`,
        res.status,
      );
    }
    return (await res.json()) as T;
  })();

  promise
    .then((data) => {
      const entry = cache.get(cacheKey) as CacheEntry<T> | undefined;
      if (entry && entry.promise === promise) {
        entry.data = data;
        entry.expiresAt = Date.now() + CACHE_TTL_MS;
      }
    })
    .catch(() => {
      const entry = cache.get(cacheKey) as CacheEntry<T> | undefined;
      if (entry && entry.promise === promise) {
        cache.delete(cacheKey);
      }
    });

  cache.set(cacheKey, { promise, expiresAt: now + CACHE_TTL_MS });
  return promise;
}

export interface DayForecast {
  code: number;
  condition: string;
  maxC: number;
  maxF: number;
  minC: number;
  minF: number;
}

export interface WeatherSnapshot {
  tempC: number;
  tempF: number;
  weatherCode: number;
  condition: string;
  forecast: DayForecast[];
}

export function getWeather(
  lat: number,
  lng: number,
  units: "C" | "F",
  signal?: AbortSignal,
): Promise<WeatherSnapshot> {
  const params = { lat, lng, units };
  return dedupedFetch<WeatherSnapshot>(
    `weather:${stableHash(params)}`,
    "/api/weather",
    params,
    signal,
  );
}

export interface Attraction {
  name: string;
  type: string;
  distanceKm: number;
  openingHours: string | null;
}

export function getPlaces(
  lat: number,
  lng: number,
  radiusKm: number,
  signal?: AbortSignal,
): Promise<{ places: Attraction[] }> {
  const params = { lat, lng, radius: radiusKm };
  return dedupedFetch<{ places: Attraction[] }>(
    `places:${stableHash(params)}`,
    "/api/places",
    params,
    signal,
  );
}

export function getReverse(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<{ label: string }> {
  const params = { lat, lng };
  return dedupedFetch<{ label: string }>(
    `reverse:${stableHash(params)}`,
    "/api/reverse",
    params,
    signal,
  );
}
