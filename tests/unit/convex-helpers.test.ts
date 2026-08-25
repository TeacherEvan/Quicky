/**
 * convex/weather.ts — shared helpers (CORS, rate limit, IP, validation,
 * range check, response builders, access log, haversine, conditionForCode).
 *
 * These functions live in weather.ts because the other handlers import
 * them and we want the import graph acyclic (see comment in
 * convex/http.ts). The handler itself is covered by tests/unit/weather.test.ts;
 * this file is the unit-level coverage for the helpers.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
  badRequest,
  conditionForCode,
  getClientIp,
  getCorsHeaders,
  haversineKm,
  jsonResponse,
  logRequest,
  rangeError,
  rateLimit,
  rateLimited,
  upstreamError,
  validateParams,
} from "@/convex/weather";

describe("convex/weather helpers", () => {
  afterEach(() => {
    delete process.env.ALLOWED_ORIGINS;
    delete process.env.NODE_ENV;
    delete process.env.CONVEX_DEPLOYMENT;
  });

  it("conditionForCode maps WMO weather codes to a string label", () => {
    expect(conditionForCode(0)).toBe("Clear");
    expect(conditionForCode(1)).toBe("Cloudy");
    expect(conditionForCode(2)).toBe("Cloudy");
    expect(conditionForCode(3)).toBe("Cloudy");
    expect(conditionForCode(45)).toBe("Fog");
    expect(conditionForCode(48)).toBe("Fog");
    expect(conditionForCode(51)).toBe("Rain");
    expect(conditionForCode(67)).toBe("Rain");
    expect(conditionForCode(71)).toBe("Snow");
    expect(conditionForCode(77)).toBe("Snow");
    expect(conditionForCode(80)).toBe("Showers");
    expect(conditionForCode(82)).toBe("Showers");
    expect(conditionForCode(95)).toBe("Storm");
    // Out-of-spec codes fall through to the default "Cloudy".
    expect(conditionForCode(50)).toBe("Cloudy");
    expect(conditionForCode(78)).toBe("Cloudy");
    expect(conditionForCode(90)).toBe("Cloudy");
  });

  it("haversineKm computes a great-circle distance in km", () => {
    // Bangkok to Phuket — about 660 km.
    const d = haversineKm(13.7563, 100.5018, 7.8804, 98.3923);
    expect(d).toBeGreaterThan(650);
    expect(d).toBeLessThan(700);
  });

  it("haversineKm returns 0 for identical points", () => {
    expect(haversineKm(0, 0, 0, 0)).toBe(0);
  });

  it("getClientIp prefers the first x-forwarded-for hop", () => {
    const req = new Request("https://x", {
      headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("getClientIp falls back to x-real-ip", () => {
    const req = new Request("https://x", {
      headers: { "x-real-ip": "5.6.7.8" },
    });
    expect(getClientIp(req)).toBe("5.6.7.8");
  });

  it("getClientIp returns 'unknown' when no header is set", () => {
    expect(getClientIp(new Request("https://x"))).toBe("unknown");
  });

  it("validateParams parses and validates a number spec", () => {
    const url = new URL("https://x?lat=13.75&lng=100.5");
    const r = validateParams<{ lat: number; lng: number }>(url, {
      lat: "number",
      lng: "number",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.lat).toBe(13.75);
      expect(r.value.lng).toBe(100.5);
    }
  });

  it("validateParams returns missing when a field is absent", () => {
    const url = new URL("https://x?lat=13.75");
    const r = validateParams<{ lat: number; lng: number }>(url, {
      lat: "number",
      lng: "number",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.field).toBe("lng");
      expect(r.reason).toBe("missing");
    }
  });

  it("validateParams returns not_numeric for non-numeric input", () => {
    const url = new URL("https://x?lat=abc");
    const r = validateParams<{ lat: number }>(url, { lat: "number" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("not_numeric");
  });

  it("validateParams uppercases enum values and rejects unknowns", () => {
    const ok = validateParams<{ u: "C" | "F" }>(
      new URL("https://x?u=c"),
      { u: { kind: "enum", values: ["C", "F"] } },
    );
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.value.u).toBe("C");

    const bad = validateParams<{ u: "C" | "F" }>(
      new URL("https://x?u=K"),
      { u: { kind: "enum", values: ["C", "F"] } },
    );
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.reason).toBe("not_in_enum");
  });

  it("rangeError returns null on success and a string on out-of-range", () => {
    expect(rangeError("lat", 13, -90, 90)).toBeNull();
    expect(rangeError("lat", 200, -90, 90)).toBe("lat_out_of_range");
    expect(rangeError("lat", -200, -90, 90)).toBe("lat_out_of_range");
  });

  it("jsonResponse returns a Response with the right status + CORS headers", () => {
    const req = new Request("https://x");
    const res = jsonResponse(req, { hello: "world" }, 200);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeTruthy();
  });

  it("badRequest returns a 400 with a field+reason payload", async () => {
    const res = badRequest(new Request("https://x"), "lat", "not_numeric");
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string; field: string; reason: string };
    expect(body.error).toBe("bad_request");
    expect(body.field).toBe("lat");
    expect(body.reason).toBe("not_numeric");
  });

  it("rateLimited returns a 429 with a Retry-After header", async () => {
    const res = rateLimited(new Request("https://x"), 30);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("30");
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("rate_limited");
  });

  it("upstreamError returns a 502 with a short Retry-After", async () => {
    const res = upstreamError(new Request("https://x"), "weather");
    expect(res.status).toBe(502);
    expect(res.headers.get("Retry-After")).toBe("5");
    const body = (await res.json()) as { error: string; endpoint: string };
    expect(body.error).toBe("upstream");
    expect(body.endpoint).toBe("weather");
  });

  it("logRequest emits a single JSON line with the agreed shape", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logRequest({ ip: "1.2.3.4", endpoint: "weather", status: 200, ms: 5 });
    expect(spy).toHaveBeenCalledTimes(1);
    const line = String(spy.mock.calls[0][0]);
    const parsed = JSON.parse(line);
    expect(parsed.ip).toBe("1.2.3.4");
    expect(parsed.endpoint).toBe("weather");
    expect(parsed.status).toBe(200);
    expect(parsed.ms).toBe(5);
    expect(typeof parsed.ts).toBe("string");
  });

  describe("rateLimit", () => {
    beforeEach(() => {
      // Each test gets a fresh module instance so the bucket map is empty.
      vi.resetModules();
    });

    it("allows a fresh IP", async () => {
      const { rateLimit: fresh } = await import("@/convex/weather");
      const d = fresh("9.9.9.9");
      expect(d.allowed).toBe(true);
      expect(d.remaining).toBe(RATE_LIMIT_MAX - 1);
    });

    it("counts down remaining on repeat hits", async () => {
      const { rateLimit: fresh } = await import("@/convex/weather");
      const a = fresh("9.9.9.8");
      const b = fresh("9.9.9.8");
      expect(a.remaining).toBe(RATE_LIMIT_MAX - 1);
      expect(b.remaining).toBe(RATE_LIMIT_MAX - 2);
    });

    it("blocks once the bucket fills, with a positive Retry-After", async () => {
      const mod = await import("@/convex/weather");
      const ip = "9.9.9.7";
      for (let i = 0; i < mod.RATE_LIMIT_MAX; i++) {
        mod.rateLimit(ip);
      }
      const blocked = mod.rateLimit(ip);
      expect(blocked.allowed).toBe(false);
      expect(blocked.retryAfter).toBeGreaterThan(0);
      expect(blocked.remaining).toBe(0);
    });
  });

  describe("getCorsHeaders", () => {
    it("uses * in dev when no allowlist is configured", async () => {
      vi.resetModules();
      delete process.env.ALLOWED_ORIGINS;
      const { getCorsHeaders: fresh } = await import("@/convex/weather");
      const req = new Request("https://x");
      const h = fresh(req);
      expect(h["Access-Control-Allow-Origin"]).toBe("*");
    });

    it("echoes the origin when it matches the allowlist", async () => {
      vi.resetModules();
      process.env.ALLOWED_ORIGINS = "https://app.example,https://other.example";
      const { getCorsHeaders: fresh } = await import("@/convex/weather");
      // Build a Request and attach the origin header via Headers init.
      // The happy-dom Request polyfill used by the jsdom-equivalent
      // env drops headers from the constructor; we attach them after.
      const req = new Request("https://x");
      Object.defineProperty(req, "headers", {
        value: new Headers({ origin: "https://app.example" }),
        configurable: true,
      });
      const h = fresh(req);
      expect(h["Access-Control-Allow-Origin"]).toBe("https://app.example");
    });

    it("returns an empty allow-origin for non-matching origins when an allowlist is set", async () => {
      vi.resetModules();
      process.env.ALLOWED_ORIGINS = "https://app.example,https://other.example";
      const { getCorsHeaders: fresh } = await import("@/convex/weather");
      const req = new Request("https://x");
      Object.defineProperty(req, "headers", {
        value: new Headers({ origin: "https://evil.example" }),
        configurable: true,
      });
      const h = fresh(req);
      // Per the spec, an allowlist is strict: non-matching origins are
      // refused (browser will reject). The implementation returns an empty
      // string in this case.
      expect(h["Access-Control-Allow-Origin"]).toBe("");
    });

    it("sets Vary: Origin so caches don't mix", () => {
      const req = new Request("https://x");
      const h = getCorsHeaders(req);
      expect(h["Vary"]).toBe("Origin");
    });
  });

  it("exports a reasonable RATE_LIMIT_MAX / WINDOW", () => {
    expect(RATE_LIMIT_MAX).toBeGreaterThan(0);
    expect(RATE_LIMIT_WINDOW_MS).toBeGreaterThan(0);
  });
});
