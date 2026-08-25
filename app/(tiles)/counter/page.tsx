"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Icon } from "@/components/Icon";

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
  const t = useT();
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
      <Breadcrumb
        items={[
          { label: t("app.nav.dashboard"), href: "/" },
          { label: t("tile.counter.title") },
        ]}
      />
      <header className="row" style={{ marginBottom: "var(--space-2)" }}>
        <Icon name="counter" size={28} aria-hidden />
        <h1 style={{ margin: 0 }}>{t("tile.counter.title")}</h1>
      </header>
      <p className="muted">{t("tile.counter.intro")}</p>

      <div className="field mt-3" style={{ maxWidth: 280 }}>
        <label className="field-label" htmlFor="counter-target">
          {t("tile.counter.targetLabel")}
        </label>
        <input
          id="counter-target"
          type="date"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
      </div>

      {days === null ? (
        <p className="muted mt-3">{t("tile.counter.noTarget")}</p>
      ) : days > 0 ? (
        <section
          className="card mt-3"
          aria-live="polite"
          aria-atomic="true"
          aria-label={t("tile.counter.daysRemaining")}
        >
          <p className="hero-number">{days}</p>
          <p className="muted">{t("tile.counter.daysRemaining")}</p>
        </section>
      ) : days === 0 ? (
        <section className="card mt-3" aria-live="polite" aria-atomic="true">
          <p className="hero-number" style={{ fontSize: "var(--fs-6)" }}>
            {t("tile.counter.today")}
          </p>
        </section>
      ) : (
        <section className="card mt-3" aria-live="polite" aria-atomic="true">
          <p className="muted">
            {t(
              Math.abs(days) === 1
                ? "tile.counter.pastOne"
                : "tile.counter.pastMany",
              { n: Math.abs(days) },
            )}
          </p>
        </section>
      )}
    </article>
  );
}
