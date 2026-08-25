"use client";

import { useEffect, useState } from "react";

const KEY = "quicky.bathroom.v1";

export default function BathroomPage() {
  const [isMale, setIsMale] = useState<boolean>(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw === "f") setIsMale(false);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, isMale ? "m" : "f");
    } catch {
      // ignore
    }
  }, [isMale, hydrated]);

  function toggle() {
    setIsMale((m) => !m);
  }

  return (
    <article>
      <h2>Bathroom</h2>
      <p className="muted">Tap the card or the swap button to toggle.</p>
      <button
        type="button"
        className="card"
        onClick={toggle}
        style={{
          width: "100%",
          cursor: "pointer",
          fontSize: 24,
          padding: 40,
        }}
        aria-label={`Switch to ${isMale ? "female" : "male"} bathroom`}
      >
        <div style={{ fontSize: 72 }} aria-hidden>
          {isMale ? "♂" : "♀"}
        </div>
        <div style={{ marginTop: 8 }}>
          Currently set to <strong>{isMale ? "Male" : "Female"}</strong>.
        </div>
      </button>
      <p>
        <button className="button secondary" type="button" onClick={toggle}>
          Swap
        </button>
      </p>
    </article>
  );
}
