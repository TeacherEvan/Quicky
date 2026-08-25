import { httpAction } from "./_generated/server";

import { corsHeaders, haversineKm } from "./weather";

interface OverpassElement {
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

const TOURISM = "attraction|museum|temple|viewpoint|zoo|gallery";
const LEISURE = "park|marketplace";

// Mirror list; Overpass has uptime problems — try several in order. The
// first to return a non-empty list wins.
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
  openNow: boolean;
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
        openNow: tags.opening_hours === "24/7",
      };
    })
    .filter((p) => p.name !== "" && p.type !== "" && p.distanceKm >= 0);
}

/**
 * GET /api/places?lat=..&lng=..&radius=..
 * Proxies Overpass API (no API key needed). Pure proxy — no DB.
 */
export const placesHandler = httpAction(async (_ctx, request) => {
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat") ?? "0");
  const lng = Number(url.searchParams.get("lng") ?? "0");
  const radiusKm = Number(url.searchParams.get("radius") ?? "10");
  const query = buildQuery(lat, lng, radiusKm);

  const errors: string[] = [];
  for (const mirror of MIRRORS) {
    try {
      const res = await fetch(mirror, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (!res.ok) {
        errors.push(`${mirror}: ${res.status}`);
        continue;
      }
      const data = (await res.json()) as unknown;
      const places = parseElements(data, lat, lng);
      if (places.length === 0) {
        errors.push(`${mirror}: empty`);
        continue;
      }
      places.sort((a, b) => a.distanceKm - b.distanceKm);
      return new Response(JSON.stringify({ places: places.slice(0, 20) }), {
        status: 200,
        headers: corsHeaders,
      });
    } catch (e) {
      errors.push(`${mirror}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return new Response(
    JSON.stringify({ error: "upstream", mirrors: errors }),
    { status: 502, headers: corsHeaders },
  );
});
