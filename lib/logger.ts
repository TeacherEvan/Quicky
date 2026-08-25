"use client";

type LogLevel = "error" | "info";

interface LoggerPayload {
  kind: "error" | "rejection" | "info";
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  ts: number;
  ua: string;
  url: string;
}

const ENDPOINT = "/api/ingest";
const MIN_INTERVAL_MS = 1000;

let lastSentAt = 0;

function now(): number {
  return Date.now();
}

function getPayload(
  level: LogLevel,
  msg: string,
  ctx?: Record<string, unknown>,
): LoggerPayload {
  const ua =
    typeof navigator !== "undefined" ? navigator.userAgent : "node";
  const url = typeof window !== "undefined" ? window.location.pathname : "";
  const base: LoggerPayload = {
    kind: level === "error" ? "error" : "info",
    message: String(msg),
    ts: now(),
    ua,
    url,
  };
  if (level === "info" && ctx && typeof ctx === "object") {
    base.kind = "info";
    base.context = ctx;
  } else if (level === "error" && ctx && typeof ctx === "object") {
    const c = ctx as Record<string, unknown>;
    if (typeof c.kind === "string" && (c.kind === "error" || c.kind === "rejection")) {
      base.kind = c.kind;
    }
    if (typeof c.stack === "string") base.stack = c.stack;
    const {
      kind: _k,
      stack: _s,
      message: _m,
      ...rest
    } = c as Record<string, unknown>;
    if (Object.keys(rest).length > 0) base.context = rest;
  }
  return base;
}

function send(body: LoggerPayload): void {
  try {
    const blob = new Blob([JSON.stringify(body)], {
      type: "application/json",
    });
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function"
    ) {
      try {
        const ok = navigator.sendBeacon(ENDPOINT, blob);
        if (ok) return;
      } catch {
        // fall through to fetch
      }
    }
    if (typeof fetch === "function") {
      try {
        void fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          keepalive: true,
          cache: "no-store",
        }).catch(() => {
          // best effort
        });
        return;
      } catch {
        // swallow
      }
    }
  } catch {
    // last-resort swallow: logging must never break the app
  }
}

function emit(level: LogLevel, msg: string, ctx?: Record<string, unknown>) {
  if (typeof window === "undefined") {
    // Server-side: just mirror to console so the log line shows up in
    // process logs (useful during SSR or in scripts that import this).
    if (process.env.NODE_ENV === "development") {
      if (level === "error") {
        console.error("[quicky]", msg, ctx ?? "");
      } else {
        console.info("[quicky]", msg, ctx ?? "");
      }
    }
    return;
  }
  const ts = now();
  if (ts - lastSentAt < MIN_INTERVAL_MS) {
    // Debounce: skip — but still log to console so dev visibility is preserved.
    if (process.env.NODE_ENV === "development") {
      if (level === "error") {
        console.error("[quicky]", msg, ctx ?? "");
      } else {
        console.info("[quicky]", msg, ctx ?? "");
      }
    }
    return;
  }
  lastSentAt = ts;
  if (process.env.NODE_ENV === "development") {
    if (level === "error") {
      console.error("[quicky]", msg, ctx ?? "");
    } else {
      console.info("[quicky]", msg, ctx ?? "");
    }
  }
  try {
    send(getPayload(level, msg, ctx));
  } catch {
    // swallow
  }
}

export const clientLogger = {
  error(msg: string, ctx?: Record<string, unknown>) {
    try {
      emit("error", msg, ctx);
    } catch {
      // never throw
    }
  },
  info(msg: string, ctx?: Record<string, unknown>) {
    try {
      emit("info", msg, ctx);
    } catch {
      // never throw
    }
  },
};

export type { LoggerPayload };
