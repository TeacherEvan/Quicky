import { httpAction } from "./_generated/server";

import { appendAccessLog } from "./accessLog";
import {
  badRequest,
  getClientIp,
  jsonResponse,
  logRequest,
  rateLimit,
  rateLimited,
  rangeError,
  upstreamError,
  validateParams,
} from "./weather";

/**
 * Nominatim (primary) and Photon (fallback) reverse geocoders. We try
 * Nominatim first; on any non-2xx / network error / empty `display_name`
 * we fall through to Photon and normalize its `FeatureCollection` shape
 * to a 3-part comma-separated label.
 */
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
const PHOTON_URL = "https://photon.komoot.io/reverse";

interface ReverseLabel {
  label: string;
  source: "nominatim" | "photon";
}

function labelFromNominatim(data: unknown): string | null {
  const displayName = String(
    (data as { display_name?: string }).display_name ?? "",
  ).trim();
  if (displayName === "") return null;
  return displayName.split(",").slice(0, 3).join(",").trim();
}

function labelFromPhoton(data: unknown): string | null {
  const features = (data as { features?: unknown[] }).features;
  if (!Array.isArray(features) || features.length === 0) return null;
  const first = features[0] as {
    properties?: Record<string, unknown>;
  };
  const props = first.properties ?? {};
  const name = (props.name as string | undefined) ?? "";
  const city =
    (props.city as string | undefined) ??
    (props.town as string | undefined) ??
    (props.village as string | undefined) ??
    (props.county as string | undefined) ??
    "";
  const country = (props.country as string | undefined) ?? "";
  const parts = [name, city, country]
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  if (parts.length === 0) return null;
  return parts.slice(0, 3).join(", ");
}

async function fetchReverse(
  lat: number,
  lng: number,
): Promise<ReverseLabel> {
  // Primary: Nominatim.
  try {
    const url =
      `${NOMINATIM_URL}?format=jsonv2` +
      `&lat=${lat.toFixed(6)}&lon=${lng.toFixed(6)}&zoom=16`;
    const res = await fetch(url, {
      headers: { "User-Agent": "QuickyTravelHub/1.0" },
    });
    if (res.ok) {
      const data = (await res.json()) as unknown;
      const label = labelFromNominatim(data);
      if (label) return { label, source: "nominatim" };
    }
  } catch {
    // fall through to Photon
  }

  // Fallback: Photon (Komoot).
  const url =
    `${PHOTON_URL}?lon=${lng.toFixed(6)}&lat=${lat.toFixed(6)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "QuickyTravelHub/1.0" },
  });
  if (!res.ok) throw new Error("photon_upstream");
  const data = (await res.json()) as unknown;
  const label = labelFromPhoton(data);
  if (!label) throw new Error("photon_empty");
  return { label, source: "photon" };
}

interface ReverseParams extends Record<string, unknown> {
  lat: number;
  lng: number;
}

/**
 * GET /api/reverse?lat=..&lng=..
 * Proxies Nominatim reverse geocoding (no API key needed). Pure proxy — no DB.
 */
export const reverseHandler = httpAction(async (_ctx, request) => {
  const start = Date.now();
  const ip = getClientIp(request);

  const rl = rateLimit(ip);
  if (!rl.allowed) {
    logRequest({ ip, endpoint: "geocode", status: 429, ms: Date.now() - start });
    void appendAccessLog({ ts: Date.now(), ip, endpoint: "geocode", status: 429, ms: Date.now() - start });
    return rateLimited(request, rl.retryAfter);
  }

  const url = new URL(request.url);
  const v = validateParams<ReverseParams>(url, {
    lat: "number",
    lng: "number",
  });
  if (!v.ok) {
    logRequest({ ip, endpoint: "geocode", status: 400, ms: Date.now() - start });
    void appendAccessLog({ ts: Date.now(), ip, endpoint: "geocode", status: 400, ms: Date.now() - start });
    return badRequest(request, v.field, v.reason);
  }
  const { lat, lng } = v.value;

  const latRange = rangeError("lat", lat, -90, 90);
  if (latRange) {
    logRequest({ ip, endpoint: "geocode", status: 400, ms: Date.now() - start });
    void appendAccessLog({ ts: Date.now(), ip, endpoint: "geocode", status: 400, ms: Date.now() - start });
    return badRequest(request, "lat", latRange);
  }
  const lngRange = rangeError("lng", lng, -180, 180);
  if (lngRange) {
    logRequest({ ip, endpoint: "geocode", status: 400, ms: Date.now() - start });
    void appendAccessLog({ ts: Date.now(), ip, endpoint: "geocode", status: 400, ms: Date.now() - start });
    return badRequest(request, "lng", lngRange);
  }

  try {
    const { label } = await fetchReverse(lat, lng);
    logRequest({ ip, endpoint: "geocode", status: 200, ms: Date.now() - start });
    void appendAccessLog({ ts: Date.now(), ip, endpoint: "geocode", status: 200, ms: Date.now() - start });
    return jsonResponse(request, { label }, 200);
  } catch {
    logRequest({ ip, endpoint: "geocode", status: 502, ms: Date.now() - start });
    void appendAccessLog({ ts: Date.now(), ip, endpoint: "geocode", status: 502, ms: Date.now() - start });
    return upstreamError(request, "geocode");
  }
});
