"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";

const KEY = "quicky.bathroom.v1";

export default function BathroomPage() {
  const t = useT();
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
    <article className="page">
      <Breadcrumb
        items={[
          { label: t("app.nav.dashboard"), href: "/" },
          { label: t("tile.bathroom.title") },
        ]}
      />

      <header className="page-header">
        <div className="page-header__top">
          <span
            className="page-header__icon"
            style={{
              background: "var(--cat-utility-bg)",
              border: "1px solid var(--cat-utility-border)",
              color: "var(--cat-utility-ink)",
            }}
            aria-hidden="true"
          >
            <Icon name="wc" size={24} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="page-header__title">{t("tile.bathroom.title")}</h1>
            <p className="page-header__lede">{t("tile.bathroom.intro")}</p>
          </div>
        </div>
      </header>

      <section className="section" aria-labelledby="bathroom-current">
        <div className="section-heading">
          <h2 id="bathroom-current">{t("tile.bathroom.current")}</h2>
        </div>
        <div className="bath-grid" role="group" aria-label={t("tile.bathroom.title")}>
          <button
            type="button"
            className="bath-card"
            onClick={toggle}
            aria-pressed={isMale}
            aria-label={isMale
              ? t("tile.bathroom.toggleToFemale")
              : t("tile.bathroom.toggleToMale")}
          >
            <span className="bath-card__icon" aria-hidden="true">
              <Icon name={isMale ? "wc" : "wc"} size={28} />
            </span>
            <span className="bath-card__title">
              {isMale ? t("tile.bathroom.male") : t("tile.bathroom.female")}
            </span>
            <span className="bath-card__sub">
              {isMale
                ? t("tile.bathroom.currentlyMale")
                : t("tile.bathroom.currentlyFemale")}
            </span>
          </button>
          <button
            type="button"
            className="bath-card"
            onClick={toggle}
            aria-pressed={!isMale}
            aria-label={!isMale
              ? t("tile.bathroom.toggleToMale")
              : t("tile.bathroom.toggleToFemale")}
          >
            <span className="bath-card__icon" aria-hidden="true">
              <Icon name={isMale ? "wc" : "wc"} size={28} />
            </span>
            <span className="bath-card__title">
              {!isMale ? t("tile.bathroom.male") : t("tile.bathroom.female")}
            </span>
            <span className="bath-card__sub">
              {!isMale
                ? t("tile.bathroom.currentlyMale")
                : t("tile.bathroom.currentlyFemale")}
            </span>
          </button>
        </div>
      </section>

      <div className="row mt-3">
        <Button variant="secondary" onClick={toggle} className="btn-block">
          {t("tile.bathroom.swap")}
        </Button>
      </div>
    </article>
  );
}