/**
 * lib/convex.ts — ConvexError, getWeather, getPlaces, getReverse.
 *
 * Verifies: happy path returns parsed JSON, 4xx throws with the right status,
 * 5xx throws, missing NEXT_PUBLIC_CONVEX_SITE_URL throws. The module-level
 * 30s cache is busted between tests so cache state can't leak.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_SITE = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

async function loadConvex() {
  // Dynamic import after env mutation so module-level SITE_URL is fresh.
  const mod = await import("@/lib/convex");
  return mod;
}

async function bustCache() {
  const mod = await loadConvex();
  mod._cacheBust();
  return mod;
}

describe("lib/convex", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL = "https://example.convex.site";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (ORIGINAL_SITE === undefined) {
      delete process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_CONVEX_SITE_URL = ORIGINAL_SITE;
    }
    vi.resetModules();
  });

  it("getWeather returns parsed data on success", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ tempC: 30.1, tempF: 86.2, condition: "Cloudy", forecast: ["30°", "31°", "30°"] }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    const { getWeather } = await bustCache();
    const snap = await getWeather(13.75, 100.5, "C");
    expect(snap.tempC).toBe(30.1);
    expect(snap.condition).toBe("Cloudy");
    expect(snap.forecast).toHaveLength(3);
    const calledUrl = String(fetchMock.mock.calls[0][0]);
    expect(calledUrl).toContain("/api/weather");
    expect(calledUrl).toContain("lat=13.75");
    expect(calledUrl).toContain("lng=100.5");
    expect(calledUrl).toContain("units=C");
  });

  it("getPlaces returns parsed places", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          places: [{ name: "Wat Pho", type: "temple", distanceKm: 1.2, openNow: false }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    const { getPlaces } = await bustCache();
    const r = await getPlaces(13.75, 100.5, 10);
    expect(r.places).toHaveLength(1);
    expect(r.places[0].name).toBe("Wat Pho");
    const calledUrl = String(fetchMock.mock.calls[0][0]);
    expect(calledUrl).toContain("/api/places");
    expect(calledUrl).toContain("radius=10");
  });

  it("getReverse returns parsed label", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ label: "Bangkok, Thailand" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    const { getReverse } = await bustCache();
    const r = await getReverse(13.75, 100.5);
    expect(r.label).toBe("Bangkok, Thailand");
    const calledUrl = String(fetchMock.mock.calls[0][0]);
    expect(calledUrl).toContain("/api/reverse");
  });

  it("throws ConvexError on 4xx with the upstream status", async () => {
    fetchMock.mockResolvedValue(
      new Response("bad coords", { status: 400, statusText: "Bad Request" }),
    );
    const { getWeather, ConvexError } = await bustCache();
    await expect(getWeather(99, 99, "C")).rejects.toBeInstanceOf(ConvexError);
    await expect(getWeather(99, 99, "C")).rejects.toMatchObject({ status: 400 });
  });

  it("throws ConvexError on 5xx", async () => {
    fetchMock.mockResolvedValue(
      new Response("upstream", { status: 502, statusText: "Bad Gateway" }),
    );
    const { getWeather, ConvexError } = await bustCache();
    await expect(getWeather(77, 77, "C")).rejects.toBeInstanceOf(ConvexError);
    await expect(getWeather(77, 77, "C")).rejects.toMatchObject({ status: 502 });
  });

  it("throws ConvexError when NEXT_PUBLIC_CONVEX_SITE_URL is missing", async () => {
    delete process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
    vi.resetModules();
    const { getWeather, ConvexError } = await loadConvex();
    await expect(getWeather(0, 0, "C")).rejects.toBeInstanceOf(ConvexError);
    await expect(getWeather(0, 0, "C")).rejects.toMatchObject({ status: 0 });
  });

  it("forwards an AbortSignal to fetch", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ tempC: 0, tempF: 32, condition: "Clear", forecast: [] }),
        { status: 200 },
      ),
    );
    const { getWeather } = await bustCache();
    const ctl = new AbortController();
    await getWeather(0, 0, "C", ctl.signal);
    const init = fetchMock.mock.calls[0][1] as RequestInit | undefined;
    expect(init?.signal).toBe(ctl.signal);
  });

  it("dedupes in-flight identical requests to a single fetch call", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ tempC: 1, tempF: 33.8, condition: "Clear", forecast: [] }),
        { status: 200 },
      ),
    );
    const { getWeather } = await bustCache();
    // Fire two identical requests back-to-back; the module-level cache
    // should collapse them into a single fetch.
    const [a, b] = await Promise.all([
      getWeather(50, 50, "C"),
      getWeather(50, 50, "C"),
    ]);
    expect(a.tempC).toBe(1);
    expect(b.tempC).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
