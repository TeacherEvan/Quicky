/**
 * lib/apiErrors.ts — error classification + user message.
 */
import { describe, expect, it } from "vitest";
import {
  classify,
  getStatus,
  isAbort,
  isApiError,
  userMessage,
} from "@/lib/apiErrors";
import { ConvexError } from "@/lib/convex";
import { TranslateError } from "@/lib/translate";

describe("apiErrors", () => {
  it("isApiError returns true for any Error subclass", () => {
    expect(isApiError(new Error("x"))).toBe(true);
    expect(isApiError(new ConvexError("x", 500))).toBe(true);
    expect(isApiError(new TranslateError("x", 429))).toBe(true);
    expect(isApiError("string")).toBe(false);
    expect(isApiError(null)).toBe(false);
    expect(isApiError(undefined)).toBe(false);
  });

  it("getStatus reads .status from Error subclasses", () => {
    expect(getStatus(new ConvexError("x", 502))).toBe(502);
    expect(getStatus(new TranslateError("x", 429))).toBe(429);
    expect(getStatus(new Error("no status"))).toBeNull();
  });

  it("classify returns offline when navigator is offline", () => {
    expect(classify(new ConvexError("x", 500), false)).toBe("offline");
  });

  it("classify returns offline for status=0 (unconfigured backend)", () => {
    expect(classify(new ConvexError("x", 0), true)).toBe("offline");
  });

  it("classify returns network for TypeError (e.g. Failed to fetch)", () => {
    expect(classify(new TypeError("Failed to fetch"), true)).toBe("network");
  });

  it("classify returns server for 5xx", () => {
    expect(classify(new ConvexError("x", 502), true)).toBe("server");
    expect(classify(new ConvexError("x", 500), true)).toBe("server");
  });

  it("classify returns client for 4xx", () => {
    expect(classify(new ConvexError("x", 400), true)).toBe("client");
    expect(classify(new ConvexError("x", 429), true)).toBe("client");
  });

  it("classify returns unknown for plain Error with no status", () => {
    expect(classify(new Error("weird"), true)).toBe("unknown");
  });

  it("userMessage picks a friendly string per kind", () => {
    expect(userMessage(new ConvexError("x", 0), false)).toMatch(/offline/i);
    expect(userMessage(new TypeError("Failed to fetch"), true)).toMatch(/reach the server/i);
    expect(userMessage(new ConvexError("custom 502", 502), true)).toBe("custom 502");
    expect(userMessage("weird string", true)).toBe("weird string");
  });

  it("isAbort only matches AbortError", () => {
    const e = new Error("aborted");
    e.name = "AbortError";
    expect(isAbort(e)).toBe(true);
    expect(isAbort(new Error("other"))).toBe(false);
    expect(isAbort("string")).toBe(false);
  });
});
