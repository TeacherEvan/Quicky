"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface NetworkContextValue {
  isOnline: boolean;
  lastError: Error | null;
  reportError: (error: Error) => void;
  clearError: () => void;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return navigator.onLine;
  });
  const [lastError, setLastError] = useState<Error | null>(null);
  const ingestUrl = "/api/ingest";

  useEffect(() => {
    function onOnline() {
      setIsOnline(true);
    }
    function onOffline() {
      setIsOnline(false);
    }
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const reportError = useCallback(
    (error: Error) => {
      setLastError(error);
      if (typeof window === "undefined") return;
      try {
        const payload = {
          message: error.message,
          name: error.name,
          stack: error.stack,
          url: window.location.pathname,
          ts: Date.now(),
        };
        void fetch(ingestUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          cache: "no-store",
          keepalive: true,
        }).catch(() => {
          // Best-effort: 404 from a not-yet-built route is expected.
        });
      } catch {
        // Swallow — telemetry must never throw into the UI.
      }
    },
    [ingestUrl],
  );

  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  const value = useMemo<NetworkContextValue>(
    () => ({ isOnline, lastError, reportError, clearError }),
    [isOnline, lastError, reportError, clearError],
  );

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

export function useNetwork(): NetworkContextValue {
  const ctx = useContext(NetworkContext);
  if (!ctx) {
    throw new Error("useNetwork must be used inside NetworkProvider");
  }
  return ctx;
}
