/**
 * Convex geocode handler — exercises the reverse-geocode parser end-to-end
 * with mocked fetch. Asserts the handler:
 *  - extracts display_name, returns the first 3 comma-separated parts
 *  - calls Nominatim with format=jsonv2 and the right coords
 *  - returns a User-Agent header
 *  - falls back to Photon when Nominatim returns empty / fails
 *  - returns 502 when both upstreams fail
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SAMPLE_NOMINATIM = {
  place_id: 123,
  licence: "Data © OpenStreetMap contributors",
  osm_type: "way",
  osm_id: 456,
  lat: "13.751",
  lon: "100.501",
  display_name: "วัดโพธิ์, Sanam Chai Road, Phra Nakhon, Bangkok, Thailand",
  type: "attraction",
  importance: 0.6,
};

const SAMPLE_PHOTON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Wat Pho",
        city: "Bangkok",
        country: "Thailand",
      },
      geometry: { type: "Point", coordinates: [100.501, 13.751] },
    },
  ],
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function call(
  url = "https://x/api/reverse?lat=13.75&lng=100.5",
): Promise<Response> {
  const { reverseHandler } = await import("@/convex/geocode");
  return (reverseHandler as unknown as (
    ctx: unknown,
    req: Request,
  ) => Promise<Response>)({}, new Request(url));
}

describe("convex/geocode handler", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("extracts display_name and returns the first 3 comma-separated parts", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(SAMPLE_NOMINATIM));
    const res = await call();
    expect(res.status).toBe(200);
    const body = (await res.json()) as { label: string };
    expect(body.label).toBe("วัดโพธิ์, Sanam Chai Road, Phra Nakhon");
  });

  it("calls Nominatim with format=jsonv2 and the supplied coords", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(SAMPLE_NOMINATIM));
    await call("https://x/api/reverse?lat=13.7563&lng=100.5018");
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("nominatim.openstreetmap.org/reverse");
    expect(url).toContain("format=jsonv2");
    expect(url).toContain("lat=13.756300");
    expect(url).toContain("lon=100.501800");
    expect(url).toContain("zoom=16");
  });

  it("uses a User-Agent header identifying the app", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(SAMPLE_NOMINATIM));
    await call();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string> | undefined;
    expect(headers?.["User-Agent"]).toContain("Quicky");
  });

  it("falls back to Photon when Nominatim returns an empty display_name", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ display_name: "" }))
      .mockResolvedValueOnce(jsonResponse(SAMPLE_PHOTON));
    const res = await call();
    expect(res.status).toBe(200);
    const body = (await res.json()) as { label: string };
    // Photon normalises to "name, city, country" with at most 3 parts.
    expect(body.label.length).toBeGreaterThan(0);
  });

  it("falls back to Photon when Nominatim returns a 5xx", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, 500))
      .mockResolvedValueOnce(jsonResponse(SAMPLE_PHOTON));
    const res = await call();
    expect(res.status).toBe(200);
  });

  it("returns 502 when both Nominatim and Photon fail", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, 500))
      .mockResolvedValueOnce(jsonResponse({}, 500));
    const res = await call();
    expect(res.status).toBe(502);
  });

  it("returns 400 when lat is missing", async () => {
    const res = await call("https://x/api/reverse?lng=100.5");
    expect(res.status).toBe(400);
  });

  it("returns 400 when lat is out of range", async () => {
    const res = await call("https://x/api/reverse?lat=999&lng=0");
    expect(res.status).toBe(400);
  });
});
