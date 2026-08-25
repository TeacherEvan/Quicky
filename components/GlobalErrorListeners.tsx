"use client";

import { clientLogger } from "@/lib/logger";

declare global {
  interface Window {
    __quickyLoggerAttached?: boolean;
    __quickyErrorListener?: (event: ErrorEvent) => void;
    __quickyRejectionListener?: (event: PromiseRejectionEvent) => void;
  }
}

export default function GlobalErrorListeners() {
  if (typeof window !== "undefined") {
    if (!window.__quickyErrorListener) {
      window.__quickyErrorListener = (event: ErrorEvent) => {
        try {
          const err =
            event.error instanceof Error
              ? event.error
              : new Error(event.message || "Unknown error");
          clientLogger.error(err.message, {
            kind: "error",
            stack: err.stack,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            url: window.location.pathname,
          });
        } catch {
          // Never let the error handler itself throw.
        }
      };
      window.addEventListener("error", window.__quickyErrorListener);
    }
    if (!window.__quickyRejectionListener) {
      window.__quickyRejectionListener = (event: PromiseRejectionEvent) => {
        try {
          const reason = event.reason;
          const message =
            reason instanceof Error
              ? reason.message
              : typeof reason === "string"
                ? reason
                : (() => {
                    try {
                      return JSON.stringify(reason);
                    } catch {
                      return "unhandledrejection";
                    }
                  })();
          const stack = reason instanceof Error ? reason.stack : undefined;
          clientLogger.error(message, {
            kind: "rejection",
            stack,
            url: window.location.pathname,
          });
        } catch {
          // Never let the rejection handler itself throw.
        }
      };
      window.addEventListener(
        "unhandledrejection",
        window.__quickyRejectionListener,
      );
    }
    window.__quickyLoggerAttached = true;
  }
  return null;
}
