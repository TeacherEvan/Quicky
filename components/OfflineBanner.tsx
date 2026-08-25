"use client";

import { useEffect, useState } from "react";
import { useNetwork } from "./NetworkProvider";

const DISMISS_KEY = "quicky.offlineBanner.dismissed.v1";

export function OfflineBanner() {
  const { isOnline } = useNetwork();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) === "1") {
        setDismissed(true);
      }
    } catch {
      // sessionStorage may be blocked; default to visible.
    }
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  }

  if (isOnline || dismissed) return null;

  return (
    <div
      className="offline-banner"
      role="status"
      aria-live="polite"
    >
      <span className="offline-banner__msg">
        You&apos;re offline. Showing the last cached view.
      </span>
      <button
        type="button"
        className="offline-banner__close"
        aria-label="Dismiss offline notice"
        onClick={dismiss}
      >
        &times;
      </button>
    </div>
  );
}
