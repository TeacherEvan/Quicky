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

function formatDateForInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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
    <article className="page">
      <Breadcrumb
        items={[
          { label: t("app.nav.dashboard"), href: "/" },
          { label: t("tile.counter.title") },
        ]}
      />

      <header className="page-header">
        <div className="page-header__top">
          <span
            className="page-header__icon"
            style={{
              background: "var(--cat-time-bg)",
              border: "1px solid var(--cat-time-border)",
              color: "var(--cat-time-ink)",
            }}
            aria-hidden="true"
          >
            <Icon name="calendar" size={24} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="page-header__title">{t("tile.counter.title")}</h1>
            <p className="page-header__lede">{t("tile.counter.intro")}</p>
          </div>
        </div>
      </header>

      <section className="section" aria-labelledby="counter-input">
        <div className="section-heading">
          <h2 id="counter-input">{t("tile.counter.targetLabel")}</h2>
        </div>
        <div className="field" style={{ maxWidth: 280 }}>
          <label className="field-label" htmlFor="counter-target">
            {t("tile.counter.targetLabel")}
          </label>
          <input
            id="counter-target"
            type="date"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            min={formatDateForInput(new Date())}
          />
        </div>
      </section>

      {days === null ? (
        <p className="muted mt-3">{t("tile.counter.noTarget")}</p>
      ) : days > 0 ? (
        <section
          className="hero mt-3"
          aria-live="polite"
          aria-atomic="true"
          aria-label={t("tile.counter.daysRemaining")}
        >
          <div className="hero__row">
            <p className="hero__num tabular">{days}</p>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="hero__label">{t("tile.counter.daysRemaining")}</p>
              <p className="muted" style={{ marginTop: "var(--s-2)" }}>
                {target && new Date(target).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </section>
      ) : days === 0 ? (
        <section className="hero mt-3" aria-live="polite" aria-atomic="true">
          <div className="hero__row">
            <p className="hero__num" style={{ fontSize: "var(--fs-3xl)" }}>
              {t("tile.counter.today")}
            </p>
          </div>
        </section>
      ) : (
        <section className="hero mt-3" aria-live="polite" aria-atomic="true">
          <div className="hero__row">
            <p className="muted tabular" style={{ fontSize: "var(--fs-xl)" }}>
              {t(
                Math.abs(days) === 1
                  ? "tile.counter.pastOne"
                  : "tile.counter.pastMany",
                { n: Math.abs(days) },
              )}
            </p>
          </div>
        </section>
      )}
    </article>
  );
}