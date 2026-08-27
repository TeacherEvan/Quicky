"use client";

import { useEffect, useRef, useState } from "react";

const SESSION_KEY = "quicky_splash_seen";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function SplashVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [show, setShow] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Respect user motion preference: skip overlay entirely, do NOT mark seen,
    // so a non-reduced-motion session (or another device) still gets the splash.
    if (prefersReducedMotion()) return;

    try {
      const seen = sessionStorage.getItem(SESSION_KEY);
      if (seen) return;
    } catch {
      // sessionStorage blocked: still try to show.
    }
    setShow(true);
  }, []);

  // Mark seen only on successful dismiss/end — NOT on mount.
  // This way, refresh-during-splash replays; autoplay failure does not lock it out.
  const dismiss = (reason: "ended" | "click" | "escape" | "fallback") => {
    if (reason !== "fallback") {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // ignore
      }
    }
    setShow(false);
  };

  useEffect(() => {
    if (!show || !videoRef.current) return;
    const v = videoRef.current;
    const p = v.play();
    if (p && typeof p.catch === "function") {
      p.catch((err) => {
        // Autoplay blocked or codec error — log so it's debuggable.
        // eslint-disable-next-line no-console
        console.warn("[SplashVideo] play() rejected:", err);
        setFailed(true);
      });
    }
    return () => {
      v.pause();
    };
  }, [show]);

  // Fallback: if the video errors or fails to start, dismiss after 5s so the
  // user is not trapped on a black overlay.
  useEffect(() => {
    if (!show || !failed) return;
    const t = window.setTimeout(() => dismiss("fallback"), 5000);
    return () => window.clearTimeout(t);
  }, [show, failed]);

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Intro splash"
      className="splash-overlay"
      onClick={() => dismiss("click")}
      onKeyDown={(e) => {
        if (e.key === "Escape") dismiss("escape");
      }}
      tabIndex={-1}
    >
      <video
        ref={videoRef}
        src="/videos/startup.mp4"
        muted
        playsInline
        autoPlay
        preload="auto"
        className="splash-video"
        onEnded={() => dismiss("ended")}
        onError={(e) => {
          // eslint-disable-next-line no-console
          console.warn("[SplashVideo] video error:", e);
          setFailed(true);
        }}
        aria-label="Quicky intro — international travel tools"
      />
      <button
        className="splash-dismiss"
        onClick={(e) => {
          e.stopPropagation();
          dismiss("click");
        }}
        aria-label="Close splash"
        type="button"
      >
        Close
      </button>
    </div>
  );
}
