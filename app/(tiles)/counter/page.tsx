"use client";

import { useEffect, useState } from "react";

const KEY = "quicky.counter.v1";

interface Persisted {
  target: string;
}

function load(): Persisted {
  if (typeof window === "undefined") return { target: "" };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { target: "" };
    return JSON.parse(raw) as Persisted;
  } catch {
    return { target: "" };
  }
}

function diffDays(iso: string): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const now = Date.now();
  return Math.ceil((t - now) / (1000 * 60 * 60 * 24));
}

export default function CounterPage() {
  const [target, setTarget] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTarget(load().target);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ target }));
    } catch {
      // ignore
    }
  }, [target, hydrated]);

  const days = hydrated ? diffDays(target) : null;

  return (
    <article>
      <h2>Day counter</h2>
      <p className="muted">
        Pick a future date. Days remaining is computed locally in your
        browser.
      </p>
      <p>
        <label>
          Target date:&nbsp;
          <input
            type="date"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </label>
      </p>
      {days === null ? (
        <p className="muted">No target set.</p>
      ) : days > 0 ? (
        <section className="card" aria-live="polite">
          <p style={{ fontSize: 64, margin: 0, fontWeight: 600 }}>{days}</p>
          <p className="muted">days remaining</p>
        </section>
      ) : days === 0 ? (
        <section className="card">
          <p style={{ fontSize: 28, margin: 0 }}>Today is the day.</p>
        </section>
      ) : (
        <section className="card">
          <p className="muted">
            That date is {Math.abs(days)} day{Math.abs(days) === 1 ? "" : "s"}{" "}
            in the past.
          </p>
        </section>
      )}
    </article>
  );
}
