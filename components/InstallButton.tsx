"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  canInstall,
  isIosSafari,
  promptInstall,
  type InstallOutcome,
} from "@/lib/pwa";

type Status = "idle" | "pending" | "accepted" | "dismissed" | "unavailable";

const wrapStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  position: "relative",
};

const btnBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  background: "var(--brand, #5b3df5)",
  color: "var(--brand-on, #ffffff)",
  border: "1px solid var(--brand, #5b3df5)",
  borderRadius: "var(--radius-sm, 8px)",
  padding: "6px 12px",
  fontWeight: 500,
  fontSize: 14,
};

const btnSecondary: React.CSSProperties = {
  ...btnBase,
  background: "transparent",
  color: "var(--text, #14111f)",
  borderColor: "var(--border, #e0dceb)",
};

const messageStyle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--text-muted, #5a5469)",
};

const hintStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 6px)",
  right: 0,
  background: "var(--bg-elev, #f7f5ff)",
  color: "var(--text, #14111f)",
  border: "1px solid var(--border, #e0dceb)",
  borderRadius: "var(--radius-sm, 8px)",
  padding: "8px 10px",
  fontSize: 12,
  whiteSpace: "nowrap",
  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  zIndex: 20,
};

export function InstallButton() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [showIosHint, setShowIosHint] = useState(false);
  const messageId = useId();
  const hintId = useId();
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // canInstall depends on `window.__quickyInstallPrompt`, which the
    // inline script in app/layout.tsx may set asynchronously. Poll
    // briefly so the button appears once the event fires.
    let cancelled = false;
    const compute = () => {
      if (cancelled) return;
      setVisible(canInstall());
    };
    compute();
    const interval = window.setInterval(compute, 500);
    const timeout = window.setTimeout(() => window.clearInterval(interval), 10_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.clearTimeout(timeout);
      if (hintTimer.current) {
        clearTimeout(hintTimer.current);
        hintTimer.current = null;
      }
    };
  }, []);

  const onInstall = useCallback(async () => {
    setStatus("pending");
    const outcome: InstallOutcome = await promptInstall();
    if (outcome === "accepted") {
      setStatus("accepted");
    } else if (outcome === "dismissed") {
      setStatus("dismissed");
    } else {
      setStatus("unavailable");
    }
  }, []);

  const onIosClick = useCallback(() => {
    setShowIosHint((v) => !v);
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setShowIosHint(false), 6_000);
  }, []);

  if (!visible) return null;

  const isIos = isIosSafari();
  const message =
    status === "accepted"
      ? "Install started"
      : status === "dismissed"
        ? "Install dismissed"
        : status === "unavailable"
          ? "Install unavailable"
          : "";

  if (isIos) {
    return (
      <span style={wrapStyle}>
        <button
          type="button"
          style={btnSecondary}
          aria-label="Install Quicky"
          aria-describedby={showIosHint ? hintId : undefined}
          onClick={onIosClick}
        >
          Install
        </button>
        {showIosHint ? (
          <span id={hintId} role="tooltip" style={hintStyle}>
            Open in Safari → Share → Add to Home Screen
          </span>
        ) : null}
        {message ? (
          <span
            id={messageId}
            role="status"
            aria-live="polite"
            style={messageStyle}
          >
            {message}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <span style={wrapStyle}>
      <button
        type="button"
        style={btnBase}
        aria-label="Install Quicky"
        onClick={onInstall}
        disabled={status === "pending"}
      >
        {status === "pending" ? "Installing…" : "Install"}
      </button>
      {message ? (
        <span
          id={messageId}
          role="status"
          aria-live="polite"
          style={messageStyle}
        >
          {message}
        </span>
      ) : null}
    </span>
  );
}
