/**
 * lib/logger.ts — clientLogger.error / clientLogger.info.
 *
 * Exercises the safe-to-call contract: never throws, swallows fetch
 * errors, debounces. The actual network send is hard to assert without a
 * real `/api/ingest` endpoint, so we verify the public surface instead.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clientLogger } from "@/lib/logger";

describe("clientLogger", () => {
  let originalNodeEnv: string | undefined;
  let originalBeacon: unknown;
  let originalFetch: unknown;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    // Force the development branch so the console.* calls fire.
    process.env.NODE_ENV = "development";
    originalBeacon = (navigator as Navigator & { sendBeacon?: unknown })
      .sendBeacon;
    originalFetch = globalThis.fetch;
    // The module's debounce window is 1s of wall time. Use fake timers
    // so each test starts from a clean debounce clock.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
    Object.defineProperty(navigator, "sendBeacon", {
      value: originalBeacon,
      configurable: true,
      writable: true,
    });
    globalThis.fetch = originalFetch as typeof globalThis.fetch;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("error() does not throw even with a broken sendBeacon", () => {
    Object.defineProperty(navigator, "sendBeacon", {
      value: () => {
        throw new Error("nope");
      },
      configurable: true,
      writable: true,
    });
    globalThis.fetch = (() => {
      throw new Error("fetch down");
    }) as typeof globalThis.fetch;
    expect(() => clientLogger.error("boom")).not.toThrow();
  });

  it("info() does not throw", () => {
    expect(() => clientLogger.info("hello")).not.toThrow();
  });

  it("emits to console.error in development for the error level", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    clientLogger.error("test-error", { foo: "bar" });
    expect(spy).toHaveBeenCalled();
    const [prefix, msg, ctx] = spy.mock.calls[0] as [string, string, unknown];
    expect(prefix).toBe("[quicky]");
    expect(msg).toBe("test-error");
    expect(ctx).toEqual({ foo: "bar" });
  });

  it("emits to console.info in development for the info level", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    clientLogger.info("hello-info", { k: 1 });
    expect(spy).toHaveBeenCalled();
  });

  it("forwards to sendBeacon when available", async () => {
    // The module has a 1s debounce and a module-level lastSentAt. Reset
    // the module cache so the new instance sees a clean clock.
    vi.resetModules();
    const { clientLogger: fresh } = await import("@/lib/logger");
    const beacon = vi.fn(() => true);
    Object.defineProperty(navigator, "sendBeacon", {
      value: beacon,
      configurable: true,
      writable: true,
    });
    fresh.info("via-beacon");
    expect(beacon).toHaveBeenCalled();
    const [url, blob] = beacon.mock.calls[0] as [string, Blob];
    expect(url).toBe("/api/ingest");
    expect(blob).toBeInstanceOf(Blob);
  });
});
