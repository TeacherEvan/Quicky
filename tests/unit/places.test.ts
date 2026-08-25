/**
 * Convex places handler — exercises the parser end-to-end with mocked
 * fetch. Asserts:
 *  - parses elements into Place[] and sorts by distance
 *  - filters out elements missing a name or type
 *  - the multi-mirror race (parallel, not sequential) returns the first
 *    non-empty result
 *  - returns 502 when all mirrors fail
 *  - the Overpass query pins both tourism and leisure filters
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SAMPLE_OVERPASS = {
  version: 0.6,
  generator: "Overpass API",
  elements: [
    {
      type: "node",
      id: 1,
      lat: 13.7465,
      lon: 100.5021,
      tags: { name: "Wat Pho", tourism: "temple" },
    },
    {
      type: "way",
      id: 2,
      center: { lat: 13.7501, lon: 100.4888 },
      tags: { name: "Lumpini Park", leisure: "park" },
    },
    {
      type: "node",
      id: 3,
      lat: 13.7600,
      lon: 100.5000,
      tags: { name: "", tourism: "viewpoint" },
    },
    {
      type: "node",
      id: 4,
      lat: 13.7700,
      lon: 100.5000,
      tags: { name: "Anon Spot" },
    },
    {
      type: "node",
      id: 5,
      lat: 13.7800,
      lon: 100.5000,
      tags: {
        name: "24h Spot",
        tourism: "museum",
        opening_hours: "24/7",
      },
    },
    {
      type: "node",
      id: 6,
      lat: 13.7900,
      lon: 100.5000,
      tags: { name: "Gallery X", tourism: "gallery" },
    },
  ],
};

const EMPTY_OVERPASS = { version: 0.6, generator: "Overpass API", elements: [] };

function overpassResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function call(
  url = "https://x/api/places?lat=13.75&lng=100.5&radius=10",
): Promise<Response> {
  const { placesHandler } = await import("@/convex/places");
  return (placesHandler as unknown as (
    ctx: unknown,
    req: Request,
  ) => Promise<Response>)({}, new Request(url));
}

describe("convex/places handler", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parses elements into Place[] and sorts by distance", async () => {
    fetchMock.mockResolvedValue(overpassResponse(SAMPLE_OVERPASS));
    const res = await call();
    expect(res.status).toBe(200);
    const body = (await res.json()) as { places: Array<Record<string, unknown>> };
    expect(body.places.length).toBe(4);

    const names = body.places.map((p) => p.name);
    expect(names).toContain("Wat Pho");
    expect(names).toContain("Lumpini Park");
    expect(names).toContain("24h Spot");
    expect(names).toContain("Gallery X");
    expect(names).not.toContain("");
    expect(names).not.toContain("Anon Spot");

    // Distance sorting is ascending.
    const dists = body.places.map((p) => p.distanceKm as number);
    const sorted = [...dists].sort((a, b) => a - b);
    expect(dists).toEqual(sorted);

    // openNow flag for 24/7.
    const open = body.places.find((p) => p.name === "24h Spot");
    expect(open?.openNow).toBe(true);
  });

  it("filters out elements missing a name or type", async () => {
    fetchMock.mockResolvedValue(overpassResponse(SAMPLE_OVERPASS));
    const res = await call();
    const body = (await res.json()) as { places: Array<Record<string, unknown>> };
    for (const p of body.places) {
      expect(typeof p.name).toBe("string");
      expect((p.name as string).length).toBeGreaterThan(0);
      expect(typeof p.type).toBe("string");
      expect((p.type as string).length).toBeGreaterThan(0);
    }
  });

  it("races all mirrors in parallel and returns the first non-empty result", async () => {
    // Two of the four mirrors return empty; the third returns real data.
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes("overpass-api.de")) return overpassResponse(EMPTY_OVERPASS);
      if (url.includes("overpass.kumi.systems")) return overpassResponse(EMPTY_OVERPASS);
      if (url.includes("overpass.private.coffee"))
        return overpassResponse(SAMPLE_OVERPASS);
      return overpassResponse(EMPTY_OVERPASS);
    });
    const res = await call();
    expect(res.status).toBe(200);
    const body = (await res.json()) as { places: unknown[] };
    expect(body.places.length).toBeGreaterThan(0);
    // The handler fans out to all 4 mirrors in parallel.
    const urls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(urls.some((u) => u.includes("overpass-api.de"))).toBe(true);
    expect(urls.some((u) => u.includes("overpass.kumi.systems"))).toBe(true);
    expect(urls.some((u) => u.includes("overpass.private.coffee"))).toBe(true);
    expect(urls.some((u) => u.includes("maps.mail.ru"))).toBe(true);
  });

  it("returns 502 when every mirror fails", async () => {
    fetchMock.mockResolvedValue(overpassResponse({}, 500));
    const res = await call();
    expect(res.status).toBe(502);
  });

  it("returns 502 when every mirror returns an empty payload", async () => {
    fetchMock.mockResolvedValue(overpassResponse(EMPTY_OVERPASS));
    const res = await call();
    expect(res.status).toBe(502);
  });

  it("builds an Overpass query that pins both tourism and leisure filters", async () => {
    fetchMock.mockResolvedValue(overpassResponse(SAMPLE_OVERPASS));
    await call();
    // The body is sent as application/x-www-form-urlencoded with the
    // Overpass QL inside the `data=` field, so we decode that to assert
    // on the query itself.
    const bodies = fetchMock.mock.calls.map(
      (c) => String((c[1] as RequestInit).body ?? ""),
    );
    for (const body of bodies) {
      const params = new URLSearchParams(body);
      const q = params.get("data") ?? "";
      expect(q).toContain("[out:json]");
      expect(q).toContain("tourism");
      expect(q).toContain("leisure");
      expect(q).toContain("around:10000");
      expect(q).toContain("13.75,100.50");
    }
  });

  it("caps the response at 20 places", async () => {
    // 25 elements all valid.
    const big = {
      version: 0.6,
      generator: "x",
      elements: Array.from({ length: 25 }, (_, i) => ({
        type: "node",
        id: i + 1,
        lat: 13.75 + i * 0.001,
        lon: 100.5,
        tags: { name: `P${i}`, tourism: "museum" },
      })),
    };
    fetchMock.mockResolvedValue(overpassResponse(big));
    const res = await call();
    const body = (await res.json()) as { places: unknown[] };
    expect(body.places.length).toBeLessThanOrEqual(20);
  });

  it("returns 400 when radius is missing", async () => {
    const res = await call("https://x/api/places?lat=13.75&lng=100.5");
    expect(res.status).toBe(400);
  });
});
