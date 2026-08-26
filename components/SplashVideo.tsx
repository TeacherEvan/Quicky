"use client";

import { useEffect, useRef, useState } from "react";

export function SplashVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Play once per browser session only; skip on direct/deep-link refresh.
    try {
      const seen = sessionStorage.getItem("quicky_splash_seen");
      if (seen) return;
      sessionStorage.setItem("quicky_splash_seen", "1");
      setShow(true);
    } catch {
      // sessionStorage blocked; fall back to showing it anyway.
      setShow(true);
    }
  }, []);

  useEffect(() => {
    if (!show || !videoRef.current) return;
    videoRef.current.play().catch(() => {
      // Autoplay blocked; user can click to play, or just dismiss.
    });
  }, [show]);

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Intro splash"
      className="splash-overlay"
      onClick={() => setShow(false)}
      onKeyDown={(e) => e.key === "Escape" && setShow(false)}
      tabIndex={-1}
    >
      <video
        ref={videoRef}
        src="/videos/startup.mp4"
        muted
        playsInline
        className="splash-video"
        onEnded={() => setShow(false)}
        aria-label="Quicky intro — international travel tools"
      />
      <button
        className="splash-dismiss"
        onClick={() => setShow(false)}
        aria-label="Close splash"
        type="button"
      >
        Close
      </button>
    </div>
  );
}
