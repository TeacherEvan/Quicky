/**
 * lib/translate.ts — translateToThai(...)
 *
 * Mocks the global fetch to assert: happy path returns a parsed Translation,
 * 4xx throws TranslateError, empty input throws without a network call.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TranslateError, translateToThai } from "@/lib/translate";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("translateToThai", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a Translation on the happy path", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        responseData: { translatedText: "สวัสดี", match: 0.9 },
        responseStatus: 200,
      }),
    );
    const result = await translateToThai("Hello");
    expect(result.translatedText).toBe("สวัสดี");
    expect(result.match).toBe(0.9);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = String(fetchMock.mock.calls[0][0]);
    expect(calledUrl).toContain("mymemory.translated.net/get");
    expect(calledUrl).toContain("q=Hello");
    expect(calledUrl).toContain("langpair=en%7Cth");
  });

  it("trims input before sending", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        responseData: { translatedText: "ลาก่อน", match: 1 },
        responseStatus: 200,
      }),
    );
    await translateToThai("   bye   ");
    const calledUrl = String(fetchMock.mock.calls[0][0]);
    expect(calledUrl).toContain("q=bye");
    expect(calledUrl).not.toContain("q=%20%20%20bye%20%20%20");
  });

  it("appends the polite-identifier email when set", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        responseData: { translatedText: "โอเค", match: 0.8 },
        responseStatus: 200,
      }),
    );
    const prev = process.env.NEXT_PUBLIC_TRANSLATE_EMAIL;
    process.env.NEXT_PUBLIC_TRANSLATE_EMAIL = "me@example.com";
    try {
      await translateToThai("OK");
      const calledUrl = String(fetchMock.mock.calls[0][0]);
      expect(calledUrl).toContain("de=me%40example.com");
    } finally {
      if (prev === undefined) {
        delete process.env.NEXT_PUBLIC_TRANSLATE_EMAIL;
      } else {
        process.env.NEXT_PUBLIC_TRANSLATE_EMAIL = prev;
      }
    }
  });

  it("throws TranslateError on 4xx", async () => {
    fetchMock.mockResolvedValue(
      new Response("rate limit", {
        status: 429,
        statusText: "Too Many Requests",
      }),
    );
    await expect(translateToThai("hi")).rejects.toBeInstanceOf(TranslateError);
    await expect(translateToThai("hi")).rejects.toMatchObject({ status: 429 });
  });

  it("throws TranslateError on 5xx", async () => {
    fetchMock.mockResolvedValue(
      new Response("boom", {
        status: 503,
        statusText: "Service Unavailable",
      }),
    );
    await expect(translateToThai("hi")).rejects.toBeInstanceOf(TranslateError);
  });

  it("throws TranslateError on empty input without making a network call", async () => {
    await expect(translateToThai("   ")).rejects.toBeInstanceOf(TranslateError);
    await expect(translateToThai("")).rejects.toBeInstanceOf(TranslateError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws when the API returns an empty translatedText", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ responseData: { translatedText: "" }, responseStatus: 200 }),
    );
    await expect(translateToThai("hi")).rejects.toBeInstanceOf(TranslateError);
  });
});
