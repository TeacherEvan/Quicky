import { httpAction } from "./_generated/server";

import { corsHeaders } from "./weather";

/**
 * GET /api/reverse?lat=..&lng=..
 * Proxies Nominatim reverse geocoding (no API key needed). Pure proxy — no DB.
 */
export const reverseHandler = httpAction(async (_ctx, request) => {
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat") ?? "0");
  const lng = Number(url.searchParams.get("lng") ?? "0");
  try {
    const target =
      `https://nominatim.openstreetmap.org/reverse` +
      `?format=jsonv2&lat=${lat.toFixed(6)}&lon=${lng.toFixed(6)}&zoom=16`;
    const res = await fetch(target, {
      headers: { "User-Agent": "QuickyTravelHub/1.0" },
    });
    if (!res.ok) throw new Error("upstream");
    const data = (await res.json()) as { display_name?: string };
    const displayName = String(data.display_name ?? "");
    if (displayName === "") throw new Error("empty");
    const label = displayName.split(",").slice(0, 3).join(",").trim();
    return new Response(JSON.stringify({ label }), {
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
