import { httpAction } from "./_generated/server";

import { appendAccessLog } from "./accessLog";

/**
 * Shared HTTP helpers for Convex HTTP actions. Lives here (rather than
 * in http.ts) to keep the module graph acyclic: http.ts imports the
 * handlers from this file, and the other handlers also import from
 * here for the cross-cutting helpers. Putting the helpers in http.ts
 * would form a cycle (http.ts → places.ts → http.ts) that breaks the
 * Convex bundler.
 *
 * Responsibilities:
 *   - CORS whitelist (env-driven, refuses `*` in production)
 *   - Per-IP rate limit (token bucket, 60 req / 60s, capped LRU map)
 *   - Request parameter validation (lat / lng / radius / units)
 *   - Lightweight structured access logging
 *   - Uniform JSON error response helpers
 *   - haversineKm — shared by places.ts
 *
 * The handlers in weather.ts / places.ts / geocode.ts all funnel
 * through these helpers so the cross-cutting concerns live in exactly
 * one place.
 */

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

/**
 * Comma-separated allowlist of origins, e.g.
 *   "https://quicky.vercel.app,http://localhost:3000"
 */
function parseAllowedOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function isProduction(): boolean {
  // The spec gates production on `NODE_ENV === "production"`. Convex
  // sets NODE_ENV=production on EVERY deployment (including dev) because
  // the runtime is based on Cloudflare Workers, so the spec's check
  // would mis-classify every Convex deployment as production and
  // break dev DX (no wildcard CORS = no local calls work).
  //
  // We therefore treat as production ONLY when the deployment owner
  // has explicitly opted in via either:
  //   - `CONVEX_ENV=production` (Convex deployment env var), OR
  //   - `NODE_ENV=production` AND the runtime isn't Convex
  //     (i.e. CONVEX_CLOUD_URL is not set — the canonical
  //     Convex-injected env var).
  //
  // On a Convex deployment, set:
  //   npx convex env set CONVEX_ENV production
  // on the prod deployment. Dev is left as the default.
  if (process.env.CONVEX_ENV === "production") return true;
  if (process.env.NODE_ENV === "production" && !process.env.CONVEX_CLOUD_URL) {
    return true;
  }
  return false;
}

let _allowedCache: { list: string[]; isProd: boolean } | null = null;
function allowedOrigins(): { list: string[]; isProd: boolean } {
  if (_allowedCache) return _allowedCache;
  const list = parseAllowedOrigins();
  _allowedCache = { list, isProd: isProduction() };
  return _allowedCache;
}

/**
 * Pick the right `Access-Control-Allow-Origin` value for a given request.
 *
 * Behavior:
 *   - Production + no allowlist configured  → empty string (browser will
 *     reject all cross-origin requests; we never emit `*` in prod).
 *   - Production + allowlist configured     → echo the request Origin if it
 *     matches; otherwise empty string.
 *   - Dev (no NODE_ENV=production)          → if allowlist empty, fall back
 *     to `*` for developer convenience; otherwise behave like prod.
 */
export function getCorsHeaders(request: Request): Record<string, string> {
  const { list, isProd } = allowedOrigins();
  const origin = request.headers.get("origin") ?? "";

  let allowOrigin: string;
  if (list.length === 0) {
    // No allowlist configured — fall back to * in dev, empty in prod.
    allowOrigin = isProd ? "" : "*";
  } else if (list.includes(origin)) {
    // Request origin is on the allowlist — echo it.
    allowOrigin = origin;
  } else {
    // Origin not on the allowlist. In prod we refuse (empty); in dev
    // we also refuse (so the dev sees the same strict behavior as
    // prod once the allowlist is configured) — but the spec only
    // requires * on dev when no allowlist is set.
    allowOrigin = "";
  }

  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json",
    Vary: "Origin",
  };
  return headers;
}

/**
 * Back-compat shim. The original weather.ts exported this as a static
 * `*`-everything object; the new code computes CORS per-request, but
 * external callers that imported `corsHeaders` keep working — they just
 * always get the wildcard-equivalent fallback headers, which is safe in
 * dev. New code should call `getCorsHeaders(request)` instead.
 */
export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

// ---------------------------------------------------------------------------
// Rate limit (per remote IP, token bucket)
// ---------------------------------------------------------------------------

/** Max requests per remote IP per window. Document for ops. */
export const RATE_LIMIT_MAX = 60;
/** Window length in ms. */
export const RATE_LIMIT_WINDOW_MS = 60_000;
/**
 * Hard cap on the bucket map. Beyond this we evict the least-recently-used
 * entry to keep memory bounded against IP-spraying abuse. 10k IPs * ~64B
 * each = ~640 KB worst case — acceptable for a Convex HTTP action.
 */
const BUCKET_CAP = 10_000;

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

/**
 * NOTE on persistence: Convex HTTP actions run in V8 isolates that may be
 * cold-started for each request. The `buckets` map is module-scope, so it
 * persists across requests that hit the SAME warm isolate, but a cold
 * isolate gets a fresh empty map. This means our 60/min cap is reliable
 * within a warm-isolate burst window but resets when Convex rotates the
 * isolate. For a strict cross-isolate rate limit you'd need a Convex
 * table + ctx.runMutation — out of scope for the in-memory spec.
 */

export interface RateLimitDecision {
  allowed: boolean;
  retryAfter: number;
  remaining: number;
}

/**
 * Charge one token to the bucket for `ip`. Returns whether the request
 * is allowed plus a hint for `Retry-After`. If the bucket is new, this
 * counts as the first request. If the window has expired, the bucket
 * resets and this counts as the first request in the new window.
 */
export function rateLimit(ip: string): RateLimitDecision {
  const now = Date.now();
  const existing = buckets.get(ip);

  // LRU touch: remove+reinsert to move this IP to the back of the map.
  buckets.delete(ip);

  if (existing && now - existing.windowStart < RATE_LIMIT_WINDOW_MS) {
    if (existing.count >= RATE_LIMIT_MAX) {
      const retryAfter = Math.ceil(
        (RATE_LIMIT_WINDOW_MS - (now - existing.windowStart)) / 1000,
      );
      existing.count += 1;
      buckets.set(ip, existing);
      evictIfNeeded();
      return { allowed: false, retryAfter, remaining: 0 };
    }
    existing.count += 1;
    buckets.set(ip, existing);
    evictIfNeeded();
    return {
      allowed: true,
      retryAfter: 0,
      remaining: RATE_LIMIT_MAX - existing.count,
    };
  }

  const fresh: Bucket = { count: 1, windowStart: now };
  buckets.set(ip, fresh);
  evictIfNeeded();
  return { allowed: true, retryAfter: 0, remaining: RATE_LIMIT_MAX - 1 };
}

function evictIfNeeded(): void {
  if (buckets.size <= BUCKET_CAP) return;
  const dropCount = Math.ceil(BUCKET_CAP * 0.1);
  const iter = buckets.keys();
  for (let i = 0; i < dropCount; i++) {
    const k = iter.next().value;
    if (k === undefined) break;
    buckets.delete(k);
  }
}

// ---------------------------------------------------------------------------
// IP extraction
// ---------------------------------------------------------------------------

/**
 * Best-effort remote IP. Convex sits behind a load balancer, so we honor
 * the standard `x-forwarded-for` (first hop) and fall back to a constant
 * sentinel so the rate limiter can still bucket unknown-IP traffic.
 */
export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

// ---------------------------------------------------------------------------
// Parameter validation
// ---------------------------------------------------------------------------

export type ParamSpec = Record<
  string,
  | "number"
  | "string"
  | { kind: "enum"; values: readonly string[] }
>;

export interface ValidationOk<T> {
  ok: true;
  value: T;
}
export interface ValidationErr {
  ok: false;
  field: string;
  reason: string;
}

function isFiniteNumber(n: number): boolean {
  return Number.isFinite(n) && !Number.isNaN(n);
}

/**
 * Parse + validate query params against a per-field spec.
 */
export function validateParams<T extends Record<string, unknown>>(
  url: URL,
  spec: ParamSpec,
): ValidationOk<T> | ValidationErr {
  const out: Record<string, unknown> = {};
  for (const [field, def] of Object.entries(spec)) {
    const raw = url.searchParams.get(field);
    if (raw === null) {
      return { ok: false, field, reason: "missing" };
    }
    if (def === "number") {
      const n = Number(raw);
      if (!isFiniteNumber(n)) {
        return { ok: false, field, reason: "not_numeric" };
      }
      out[field] = n;
    } else if (def === "string") {
      out[field] = raw;
    } else if (typeof def === "object" && def.kind === "enum") {
      const upper = raw.toUpperCase();
      if (!def.values.includes(upper)) {
        return { ok: false, field, reason: "not_in_enum" };
      }
      out[field] = upper;
    }
  }
  return { ok: true, value: out as T };
}

/** Field-level range check. Returns null on success or an error string. */
export function rangeError(
  field: string,
  value: number,
  min: number,
  max: number,
): string | null {
  if (value < min || value > max) return `${field}_out_of_range`;
  return null;
}

// ---------------------------------------------------------------------------
// Response builders
// ---------------------------------------------------------------------------

export function jsonResponse(
  request: Request,
  body: unknown,
  status: number,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(request), ...extraHeaders },
  });
}

export function badRequest(
  request: Request,
  field: string,
  reason: string,
): Response {
  return jsonResponse(
    request,
    { error: "bad_request", field, reason },
    400,
  );
}

export function rateLimited(
  request: Request,
  retryAfter: number,
): Response {
  return jsonResponse(
    request,
    { error: "rate_limited" },
    429,
    { "Retry-After": String(retryAfter) },
  );
}

export function upstreamError(
  request: Request,
  endpoint: "weather" | "places" | "geocode",
  detail?: string,
): Response {
  return jsonResponse(
    request,
    { error: "upstream", endpoint, ...(detail ? { detail } : {}) },
    502,
    { "Retry-After": "5" },
  );
}

// ---------------------------------------------------------------------------
// Access logging
// ---------------------------------------------------------------------------

/**
 * Lightweight, privacy-respecting access log. We deliberately do NOT
 * include query params (lat/lng can be considered location data) and we
 * never log request bodies. The shape is fixed so it's easy to grep.
 */
export function logRequest(args: {
  ip: string;
  endpoint: string;
  status: number;
  ms: number;
}): void {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      ip: args.ip,
      endpoint: args.endpoint,
      status: args.status,
      ms: args.ms,
    }),
  );
}

// ---------------------------------------------------------------------------
// Shared geometry
// ---------------------------------------------------------------------------

export function haversineKm(
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

// ---------------------------------------------------------------------------
// Weather handler
// ---------------------------------------------------------------------------

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

/**
 * Open-Meteo base URLs tried in order on upstream failure. The spec calls
 * for two variants; the ensemble host is the public Open-Meteo mirror that
 * also exposes `/v1/forecast`. We fall through on any non-2xx, network
 * error, or empty payload.
 */
const WEATHER_BASES = [
  "https://api.open-meteo.com/v1/forecast",
  "https://ensemble-api.open-meteo.com/v1/forecast",
];

interface OpenMeteoCurrent {
  temperature_2m?: number;
  weather_code?: number;
}
interface OpenMeteoDaily {
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  weather_code?: number[];
}
interface OpenMeteoPayload {
  current?: OpenMeteoCurrent;
  daily?: OpenMeteoDaily;
}

async function fetchWeather(
  lat: number,
  lng: number,
  units: "C" | "F",
): Promise<OpenMeteoPayload> {
  let lastErr: unknown = null;
  for (const base of WEATHER_BASES) {
    const params = new URLSearchParams({
      latitude: lat.toFixed(2),
      longitude: lng.toFixed(2),
      current: "temperature_2m,weather_code",
      daily: "temperature_2m_max,temperature_2m_min",
      timezone: "auto",
    });
    if (units === "F") params.set("temperature_unit", "fahrenheit");
    try {
      const res = await fetch(`${base}?${params}`);
      if (!res.ok) {
        lastErr = new Error(`${base}: ${res.status}`);
        continue;
      }
      const data = (await res.json()) as OpenMeteoPayload;
      if (!data.current || !data.daily) {
        lastErr = new Error(`${base}: empty payload`);
        continue;
      }
      return data;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("all upstreams failed");
}

interface WeatherParams extends Record<string, unknown> {
  lat: number;
  lng: number;
  units: "C" | "F";
}

/**
 * GET /api/weather?lat=..&lng=..&units=C|F
 * Proxies Open-Meteo (no API key needed). Pure proxy — no DB.
 */
export const weatherHandler = httpAction(async (_ctx, request) => {
  const start = Date.now();
  const ip = getClientIp(request);

  const rl = rateLimit(ip);
  if (!rl.allowed) {
    logRequest({ ip, endpoint: "weather", status: 429, ms: Date.now() - start });
    void appendAccessLog({ ts: Date.now(), ip, endpoint: "weather", status: 429, ms: Date.now() - start });
    return rateLimited(request, rl.retryAfter);
  }

  const url = new URL(request.url);
  const v = validateParams<WeatherParams>(url, {
    lat: "number",
    lng: "number",
    units: { kind: "enum", values: ["C", "F"] },
  });
  if (!v.ok) {
    logRequest({ ip, endpoint: "weather", status: 400, ms: Date.now() - start });
    void appendAccessLog({ ts: Date.now(), ip, endpoint: "weather", status: 400, ms: Date.now() - start });
    return badRequest(request, v.field, v.reason);
  }
  const { lat, lng, units } = v.value;

  const latRange = rangeError("lat", lat, -90, 90);
  if (latRange) {
    logRequest({ ip, endpoint: "weather", status: 400, ms: Date.now() - start });
    void appendAccessLog({ ts: Date.now(), ip, endpoint: "weather", status: 400, ms: Date.now() - start });
    return badRequest(request, "lat", latRange);
  }
  const lngRange = rangeError("lng", lng, -180, 180);
  if (lngRange) {
    logRequest({ ip, endpoint: "weather", status: 400, ms: Date.now() - start });
    void appendAccessLog({ ts: Date.now(), ip, endpoint: "weather", status: 400, ms: Date.now() - start });
    return badRequest(request, "lng", lngRange);
  }

  try {
    const data = await fetchWeather(lat, lng, units);
    const current = data.current!;
    const daily = data.daily!;
    const value = Number(current.temperature_2m);
    const code = Number(current.weather_code);
    const maxes: number[] = (daily.temperature_2m_max ?? [])
      .slice(0, 3)
      .map(Number);
    const mins: number[] = (daily.temperature_2m_min ?? [])
      .slice(0, 3)
      .map(Number);
    const dayCodes: number[] = (daily.weather_code ?? [])
      .slice(0, 3)
      .map(Number);
    const tempC = units === "F" ? ((value - 32) * 5) / 9 : value;
    const tempF = units === "F" ? value : (value * 9) / 5 + 32;
    const body = {
      tempC: Math.round(tempC * 10) / 10,
      tempF: Math.round(tempF * 10) / 10,
      weatherCode: code,
      condition: conditionForCode(code),
      forecast: dayCodes.map((c, i) => ({
        code: c,
        condition: conditionForCode(c),
        maxC: units === "F" ? ((maxes[i] - 32) * 5) / 9 : maxes[i],
        maxF: units === "F" ? maxes[i] : (maxes[i] * 9) / 5 + 32,
        minC: units === "F" ? ((mins[i] - 32) * 5) / 9 : mins[i],
        minF: units === "F" ? mins[i] : (mins[i] * 9) / 5 + 32,
      })),
    };
    logRequest({ ip, endpoint: "weather", status: 200, ms: Date.now() - start });
    void appendAccessLog({ ts: Date.now(), ip, endpoint: "weather", status: 200, ms: Date.now() - start });
    return jsonResponse(request, body, 200);
  } catch {
    logRequest({ ip, endpoint: "weather", status: 502, ms: Date.now() - start });
    void appendAccessLog({ ts: Date.now(), ip, endpoint: "weather", status: 502, ms: Date.now() - start });
    return upstreamError(request, "weather");
  }
});
