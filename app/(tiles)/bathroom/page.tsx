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

  const labelKey = isMale ? "tile.bathroom.male" : "tile.bathroom.female";
  const introKey = isMale ? "tile.bathroom.currentlyMale" : "tile.bathroom.currentlyFemale";

  return (
    <article>
      <Breadcrumb
        items={[
          { label: t("app.nav.dashboard"), href: "/" },
          { label: t("tile.bathroom.title") },
        ]}
      />
      <header className="row" style={{ marginBottom: "var(--space-2)" }}>
        <Icon name="wc" size={28} aria-hidden />
        <h1 style={{ margin: 0 }}>{t("tile.bathroom.title")}</h1>
      </header>
      <p className="muted">{t("tile.bathroom.intro")}</p>

      <button
        type="button"
        className="card mt-3 full-width"
        onClick={toggle}
        aria-label={isMale ? t("tile.bathroom.toggleToFemale") : t("tile.bathroom.toggleToMale")}
        aria-live="polite"
        style={{
          cursor: "pointer",
          textAlign: "left",
          minHeight: 180,
          display: "flex",
          alignItems: "center",
          gap: "var(--space-4)",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: isMale ? "var(--tile-bathroom-bg)" : "var(--tile-bathroom-bg)",
            color: "var(--tile-bathroom)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--tile-bathroom-border)",
            flex: "none",
          }}
        >
          <Icon name="wc" size={40} />
        </span>
        <span>
          <span style={{ display: "block", fontSize: "var(--fs-4)", fontWeight: 600 }}>
            {t(introKey)} <strong>{t(labelKey)}</strong>
          </span>
          <span className="muted">{t("tile.bathroom.swap")}</span>
        </span>
      </button>

      <div className="row mt-3">
        <Button variant="secondary" onClick={toggle}>
          {t("tile.bathroom.swap")}
        </Button>
      </div>
    </article>
  );
}
