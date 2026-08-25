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

/**
 * GET /api/places?lat=..&lng=..&radius=..
 * Proxies Overpass API (no API key needed). Pure proxy — no DB.
 */
export const placesHandler = httpAction(async (_ctx, request) => {
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat") ?? "0");
  const lng = Number(url.searchParams.get("lng") ?? "0");
  const radiusKm = Number(url.searchParams.get("radius") ?? "10");
  try {
    const q =
      `[out:json][timeout:10];` +
      `nwr["tourism"~"^(${TOURISM})$"](around:${(radiusKm * 1000).toFixed(0)},${lat.toFixed(2)},${lng.toFixed(2)});` +
      `nwr["leisure"~"^(${LEISURE})$"](around:${(radiusKm * 1000).toFixed(0)},${lat.toFixed(2)},${lng.toFixed(2)});` +
      `out center 20;`;
    // Overpass rate-limits aggressively; fall back to a mirror endpoint.
    let data: unknown = null;
    for (const host of ["overpass-api.de", "overpass.kumi.systems"]) {
      try {
        const res = await fetch(`https://${host}/api/interpreter`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `data=${encodeURIComponent(q)}`,
        });
        if (!res.ok) continue;
        data = await res.json();
        break;
      } catch {
        // Try the next mirror.
      }
    }
    if (data === null) throw new Error("upstream");
    const places = ((data.elements ?? []) as OverpassElement[])
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
      .filter((p) => p.name !== "" && p.type !== "" && p.distanceKm >= 0)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 20);
    return new Response(JSON.stringify({ places }), {
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
