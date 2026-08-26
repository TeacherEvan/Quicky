import { httpAction } from "./_generated/server";

import { appendAccessLog } from "./accessLog";
import {
  badRequest,
  getClientIp,
  haversineKm,
  jsonResponse,
  logRequest,
  rateLimit,
  rateLimited,
  rangeError,
  upstreamError,
  validateParams,
} from "./weather";

interface OverpassElement {
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

const TOURISM = "attraction|museum|temple|viewpoint|zoo|gallery";
const LEISURE = "park|marketplace";

// Mirror list; Overpass has uptime problems — race all of them in parallel
// and take the first non-empty response. The losers are aborted so we
// don't waste their upstream quota.
const MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

interface Place {
  name: string;
  type: string;
  distanceKm: number;
  openingHours: string | null;
}

function buildQuery(lat: number, lng: number, radiusKm: number): string {
  return (
    `[out:json][timeout:10];` +
    `nwr["tourism"~"^(${TOURISM})$"](around:${(radiusKm * 1000).toFixed(0)},${lat.toFixed(2)},${lng.toFixed(2)});` +
    `nwr["leisure"~"^(${LEISURE})$"](around:${(radiusKm * 1000).toFixed(0)},${lat.toFixed(2)},${lng.toFixed(2)});` +
    `out center 20;`
  );
}

function parseElements(data: unknown, lat: number, lng: number): Place[] {
  const elements =
    (data as { elements?: OverpassElement[] }).elements ?? [];
  return (elements as OverpassElement[])
    .map((el) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      const tags = el.tags ?? {};
      return {
        name: tags.name ?? "",
        type: tags.tourism ?? tags.leisure ?? "",
        distanceKm:
          elLat !== undefined && elLon !== undefined
            ? Math.round(haversineKm(lat, lng, elLat, elLon) * 10) / 10
            : -1,
        openingHours: tags.opening_hours ?? null,
      };
    })
    .filter((p) => p.name !== "" && p.type !== "" && p.distanceKm >= 0);
}

interface MirrorAttempt {
  mirror: string;
  controller: AbortController;
  promise: Promise<Place[]>;
}

/**
 * Race all mirrors; resolve with the first non-empty parse. Abort losers
 * via AbortController so they don't keep burning the upstream's quota.
 *
 * Each mirror is given a hard per-request timeout (8s) so a single slow
 * mirror can't blow past the Convex HTTP action's wall-clock budget.
 * We use the platform `AbortSignal.timeout()` because Convex's V8
 * isolate doesn't expose `setTimeout` (only `Date.now` / `performance`).
 */
function raceMirrors(
  query: string,
  lat: number,
  lng: number,
): Promise<{ places: Place[]; mirror: string }> {
  const PER_MIRROR_TIMEOUT_MS = 8_000;
  const attempts: MirrorAttempt[] = MIRRORS.map((mirror) => {
    const controller = new AbortController();
    const timeoutSignal = AbortSignal.timeout(PER_MIRROR_TIMEOUT_MS);
    // Combine the caller's signal with the timeout signal so a slow
    // mirror is cancelled even if it's still receiving body bytes.
    const signal = AbortSignal.any
      ? AbortSignal.any([controller.signal, timeoutSignal])
      : (() => {
          const combined = new AbortController();
          const onAbort = () => combined.abort();
          controller.signal.addEventListener("abort", onAbort);
          timeoutSignal.addEventListener("abort", onAbort);
          if (controller.signal.aborted || timeoutSignal.aborted) {
            combined.abort();
          }
          return combined.signal;
        })();
    const promise: Promise<Place[]> = (async () => {
      const res = await fetch(mirror, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal,
      });
      if (!res.ok) throw new Error(`status_${res.status}`);
      const data = (await res.json()) as unknown;
      return parseElements(data, lat, lng);
    })();
    return { mirror, controller, promise };
  });

  return new Promise((resolve, reject) => {
    let resolved = false;
    let pending = attempts.length;
    for (const a of attempts) {
      a.promise
        .then((places) => {
          if (resolved) return;
          if (places.length === 0) {
            pending -= 1;
            if (pending === 0 && !resolved) {
              resolved = true;
              reject(new Error("all_mirrors_empty"));
            }
            return;
          }
          resolved = true;
          // Best-effort abort of losers so they stop burning upstream
          // quota. We don't await the abort — the race is already
          // won — but we attach an empty catch so the abort call
          // doesn't surface as an unhandled rejection.
          for (const b of attempts) {
            if (b !== a) {
              try {
                b.controller.abort();
              } catch {
                /* ignore */
              }
            }
          }
          resolve({ places, mirror: a.mirror });
        })
        .catch(() => {
          if (resolved) return;
          pending -= 1;
          if (pending === 0 && !resolved) {
            resolved = true;
            reject(new Error("all_mirrors_failed"));
          }
        });
    }
  });
}

interface PlacesParams extends Record<string, unknown> {
  lat: number;
  lng: number;
  radius: number;
}

/**
 * GET /api/places?lat=..&lng=..&radius=..
 * Proxies Overpass API (no API key needed). Pure proxy — no DB.
 */
export const placesHandler = httpAction(async (_ctx, request) => {
  const start = Date.now();
  const ip = getClientIp(request);

  const rl = rateLimit(ip);
  if (!rl.allowed) {
    logRequest({ ip, endpoint: "places", status: 429, ms: Date.now() - start });
    void appendAccessLog({ ts: Date.now(), ip, endpoint: "places", status: 429, ms: Date.now() - start });
    return rateLimited(request, rl.retryAfter);
  }

  const url = new URL(request.url);
  const v = validateParams<PlacesParams>(url, {
    lat: "number",
    lng: "number",
    radius: "number",
  });
  if (!v.ok) {
    logRequest({ ip, endpoint: "places", status: 400, ms: Date.now() - start });
    void appendAccessLog({ ts: Date.now(), ip, endpoint: "places", status: 400, ms: Date.now() - start });
    return badRequest(request, v.field, v.reason);
  }
  const { lat, lng, radius } = v.value;

  const latRange = rangeError("lat", lat, -90, 90);
  if (latRange) {
    logRequest({ ip, endpoint: "places", status: 400, ms: Date.now() - start });
    void appendAccessLog({ ts: Date.now(), ip, endpoint: "places", status: 400, ms: Date.now() - start });
    return badRequest(request, "lat", latRange);
  }
  const lngRange = rangeError("lng", lng, -180, 180);
  if (lngRange) {
    logRequest({ ip, endpoint: "places", status: 400, ms: Date.now() - start });
    void appendAccessLog({ ts: Date.now(), ip, endpoint: "places", status: 400, ms: Date.now() - start });
    return badRequest(request, "lng", lngRange);
  }
  const radRange = rangeError("radius", radius, 0.1, 200);
  if (radRange) {
    logRequest({ ip, endpoint: "places", status: 400, ms: Date.now() - start });
    void appendAccessLog({ ts: Date.now(), ip, endpoint: "places", status: 400, ms: Date.now() - start });
    return badRequest(request, "radius", radRange);
  }

  const query = buildQuery(lat, lng, radius);
  try {
    const { places } = await raceMirrors(query, lat, lng);
    places.sort((a, b) => a.distanceKm - b.distanceKm);
    logRequest({ ip, endpoint: "places", status: 200, ms: Date.now() - start });
    void appendAccessLog({ ts: Date.now(), ip, endpoint: "places", status: 200, ms: Date.now() - start });
    return jsonResponse(request, { places: places.slice(0, 20) }, 200);
  } catch {
    logRequest({ ip, endpoint: "places", status: 502, ms: Date.now() - start });
    void appendAccessLog({ ts: Date.now(), ip, endpoint: "places", status: 502, ms: Date.now() - start });
    return upstreamError(request, "places");
  }
});
