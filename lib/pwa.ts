// PWA install-prompt helpers.
// `beforeinstallprompt` is captured in an inline script in app/layout.tsx
// and stashed on `window.__quickyInstallPrompt` before React hydrates.
// These helpers read that global, detect iOS Safari, and prompt the user.

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface Window {
    __quickyInstallPrompt?: BeforeInstallPromptEvent;
    __quickyIosInstallHinted?: boolean;
  }
}

export type InstallOutcome = "accepted" | "dismissed" | "unavailable";

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPadOS 13+ may report as Mac — detect via touch points.
  if (
    ua.includes("Mac") &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1
  ) {
    return true;
  }
  return false;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  if (nav.standalone === true) return true;
  if (typeof matchMedia === "function") {
    return matchMedia("(display-mode: standalone)").matches;
  }
  return false;
}

export function canInstall(): boolean {
  if (typeof window === "undefined") return false;
  if (isIos()) {
    // iOS doesn't fire beforeinstallprompt. We still surface a hint,
    // but the InstallButton shows an info tooltip instead of a real prompt.
    return !isStandalone();
  }
  return Boolean(window.__quickyInstallPrompt);
}

export function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  if (!isIos()) return false;
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  // Safari only — Chrome / Firefox on iOS would need a different flow.
  return /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
}

export async function promptInstall(): Promise<InstallOutcome> {
  if (typeof window === "undefined") return "unavailable";
  const evt = window.__quickyInstallPrompt;
  if (!evt) return "unavailable";
  try {
    await evt.prompt();
    const choice = await evt.userChoice;
    // Once consumed, the prompt event can't be reused.
    window.__quickyInstallPrompt = undefined;
    return choice.outcome === "accepted" ? "accepted" : "dismissed";
  } catch {
    window.__quickyInstallPrompt = undefined;
    return "unavailable";
  }
}
