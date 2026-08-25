/**
 * Convex weather handler — exercises the proxied Open-Meteo path with mocked
 * fetch. Confirms C/F math, condition mapping, dual-base fallback, and
 * 502 when all upstreams fail.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SAMPLE_OPEN_METEO = {
  latitude: 13.75,
  longitude: 100.5,
  current: { temperature_2m: 30.5, weather_code: 1 },
  daily: {
    temperature_2m_max: [31, 32, 31],
    temperature_2m_min: [24, 25, 24],
  },
};

function upstream(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function call(
  url = "https://x/api/weather?lat=13.75&lng=100.5&units=C",
): Promise<Response> {
  const { weatherHandler } = await import("@/convex/weather");
  return (weatherHandler as unknown as (
    ctx: unknown,
    req: Request,
  ) => Promise<Response>)({}, new Request(url));
}

describe("convex/weather handler", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns Celsius by default", async () => {
    fetchMock.mockResolvedValueOnce(upstream(SAMPLE_OPEN_METEO));
    const res = await call();
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      tempC: number;
      tempF: number;
      condition: string;
      forecast: string[];
    };
    expect(body.tempC).toBeCloseTo(30.5, 1);
    expect(body.tempF).toBeCloseTo(86.9, 1);
    expect(body.condition).toBe("Cloudy");
    expect(body.forecast).toEqual(["31°", "32°", "31°"]);
  });

  it("requests fahrenheit units when units=F", async () => {
    fetchMock.mockResolvedValueOnce(upstream(SAMPLE_OPEN_METEO));
    await call("https://x/api/weather?lat=13.75&lng=100.5&units=F");
    const upstreamUrl = String(fetchMock.mock.calls[0][0]);
    expect(upstreamUrl).toContain("api.open-meteo.com");
    expect(upstreamUrl).toContain("temperature_unit=fahrenheit");
  });

  it("maps weather code 0 to Clear", async () => {
    fetchMock.mockResolvedValueOnce(
      upstream({
        current: { temperature_2m: 28, weather_code: 0 },
        daily: { temperature_2m_max: [29] },
      }),
    );
    const res = await call();
    const body = (await res.json()) as { condition: string };
    expect(body.condition).toBe("Clear");
  });

  it("falls back to ensemble-api when the primary base returns 5xx", async () => {
    fetchMock
      .mockResolvedValueOnce(upstream({}, 500))
      .mockResolvedValueOnce(upstream(SAMPLE_OPEN_METEO));
    const res = await call();
    expect(res.status).toBe(200);
    const urls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(urls[0]).toContain("api.open-meteo.com");
    expect(urls[1]).toContain("ensemble-api.open-meteo.com");
  });

  it("returns 502 when both bases fail", async () => {
    fetchMock.mockResolvedValue(upstream({}, 500));
    const res = await call();
    expect(res.status).toBe(502);
  });

  it("returns 400 when units is not C or F", async () => {
    const res = await call("https://x/api/weather?lat=13.75&lng=100.5&units=K");
    expect(res.status).toBe(400);
  });

  it("returns 400 when lat is missing", async () => {
    const res = await call("https://x/api/weather?lng=100.5&units=C");
    expect(res.status).toBe(400);
  });
});
