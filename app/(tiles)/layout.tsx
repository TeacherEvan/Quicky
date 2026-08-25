"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Topbar } from "@/components/Topbar";
import { useT } from "@/lib/i18n";

export default function TileLayout({ children }: { children: ReactNode }) {
  const t = useT();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Move focus to <main> after a route change so screen-reader users hear
    // the new page's H1 first, not the previous page's topbar link.
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash && document.getElementById(hash.slice(1))) return;
    mainRef.current?.focus();
  }, []);

  return (
    <div className="app-shell">
      <Topbar />
      <main
        id="main-content"
        ref={mainRef}
        className="container"
        tabIndex={-1}
        aria-label={t("app.brandTagline")}
      >
        {children}
      </main>
    </div>
  );
}
