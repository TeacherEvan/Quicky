"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Icon } from "./Icon";
import {
  canInstall,
  isIosSafari,
  promptInstall,
  type InstallOutcome,
} from "@/lib/pwa";

type Status = "idle" | "pending" | "accepted" | "dismissed" | "unavailable";

export function InstallButton() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [showIosHint, setShowIosHint] = useState(false);
  const hintId = useId();
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const compute = () => {
      if (cancelled) return;
      setVisible(canInstall());
    };
    compute();
    const interval = window.setInterval(compute, 500);
    const timeout = window.setTimeout(
      () => window.clearInterval(interval),
      10_000,
    );
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
    if (outcome === "accepted") setStatus("accepted");
    else if (outcome === "dismissed") setStatus("dismissed");
    else setStatus("unavailable");
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
      <span
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          aria-label="Install Quicky"
          aria-describedby={showIosHint ? hintId : undefined}
          onClick={onIosClick}
        >
          <Icon name="install" size={14} aria-hidden />
          Install
        </button>
        {showIosHint ? (
          <span
            id={hintId}
            role="tooltip"
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              background: "var(--bg-elev)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-sm)",
              padding: "8px 10px",
              fontSize: 12,
              whiteSpace: "nowrap",
              boxShadow: "var(--shadow-2)",
              zIndex: 60,
            }}
          >
            Open in Safari → Share → Add to Home Screen
          </span>
        ) : null}
        {message ? (
          <span
            role="status"
            aria-live="polite"
            className="muted"
            style={{ fontSize: 12 }}
          >
            {message}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-primary btn-sm"
      aria-label="Install Quicky"
      onClick={onInstall}
      disabled={status === "pending"}
    >
      <Icon
        name="install"
        size={14}
        aria-hidden
      />
      {status === "pending" ? "Installing…" : message || "Install"}
    </button>
  );
}
