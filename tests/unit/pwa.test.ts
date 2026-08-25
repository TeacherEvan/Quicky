/**
 * lib/pwa.ts — PWA install prompt helpers.
 *
 * jsdom doesn't ship beforeinstallprompt, so we drive the helpers via
 * window globals + a stubbed userAgent.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { canInstall, isIosSafari, promptInstall } from "@/lib/pwa";

function setUserAgent(ua: string) {
  Object.defineProperty(navigator, "userAgent", {
    value: ua,
    configurable: true,
    writable: true,
  });
}

describe("pwa", () => {
  afterEach(() => {
    delete (window as unknown as { __quickyInstallPrompt?: unknown })
      .__quickyInstallPrompt;
    setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
    );
    vi.restoreAllMocks();
  });

  it("canInstall returns true when a beforeinstallprompt event is stashed", () => {
    (window as unknown as { __quickyInstallPrompt: Event }).__quickyInstallPrompt =
      new Event("beforeinstallprompt");
    setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
    );
    expect(canInstall()).toBe(true);
  });

  it("canInstall returns false when no event and not iOS", () => {
    expect(canInstall()).toBe(false);
  });

  it("canInstall returns false when already standalone (matchMedia matches)", () => {
    setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
    );
    Object.defineProperty(window, "matchMedia", {
      value: (q: string) => ({
        matches: q === "(display-mode: standalone)",
        media: q,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
        onchange: null,
      }),
      configurable: true,
    });
    expect(canInstall()).toBe(false);
  });

  it("isIosSafari returns true for iPhone Safari UA", () => {
    setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    );
    expect(isIosSafari()).toBe(true);
  });

  it("isIosSafari returns false for iOS Chrome (CriOS)", () => {
    setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/108.0.0.0 Mobile/15E148 Safari/604.1",
    );
    expect(isIosSafari()).toBe(false);
  });

  it("isIosSafari returns false for Android Chrome", () => {
    expect(isIosSafari()).toBe(false);
  });

  it("promptInstall returns 'unavailable' when no event is stashed", async () => {
    expect(await promptInstall()).toBe("unavailable");
  });

  it("promptInstall returns 'accepted' when the user accepts", async () => {
    let resolveChoice: (v: { outcome: string }) => void = () => {};
    const evt = new Event("beforeinstallprompt") as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: string; platform: string }>;
    };
    evt.prompt = () => Promise.resolve();
    evt.userChoice = new Promise((r) => {
      resolveChoice = r;
    });
    (window as unknown as { __quickyInstallPrompt: unknown }).__quickyInstallPrompt =
      evt;
    const p = promptInstall();
    resolveChoice({ outcome: "accepted", platform: "web" });
    expect(await p).toBe("accepted");
  });

  it("promptInstall returns 'dismissed' when the user dismisses", async () => {
    let resolveChoice: (v: { outcome: string }) => void = () => {};
    const evt = new Event("beforeinstallprompt") as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: string; platform: string }>;
    };
    evt.prompt = () => Promise.resolve();
    evt.userChoice = new Promise((r) => {
      resolveChoice = r;
    });
    (window as unknown as { __quickyInstallPrompt: unknown }).__quickyInstallPrompt =
      evt;
    const p = promptInstall();
    resolveChoice({ outcome: "dismissed", platform: "web" });
    expect(await p).toBe("dismissed");
  });

  it("promptInstall returns 'unavailable' when prompt() throws", async () => {
    const evt = new Event("beforeinstallprompt") as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: string; platform: string }>;
    };
    evt.prompt = () => Promise.reject(new Error("prompt failed"));
    evt.userChoice = Promise.resolve({ outcome: "accepted", platform: "web" });
    (window as unknown as { __quickyInstallPrompt: unknown }).__quickyInstallPrompt =
      evt;
    expect(await promptInstall()).toBe("unavailable");
  });
});
