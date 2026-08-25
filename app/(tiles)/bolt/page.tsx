"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";

const SCHEME = "boltd://";
const TARGET = "home";

export default function BoltPage() {
  const t = useT();
  const [attempted, setAttempted] = useState(false);

  function launch() {
    setAttempted(true);
    const url = `${SCHEME}${TARGET}`;
    const t0 = Date.now();
    const onBlur = () => {
      void t0;
      window.removeEventListener("blur", onBlur);
    };
    window.addEventListener("blur", onBlur);
    window.location.href = url;
  }

  return (
    <article>
      <Breadcrumb
        items={[
          { label: t("app.nav.dashboard"), href: "/" },
          { label: t("tile.bolt.title") },
        ]}
      />
      <header className="row" style={{ marginBottom: "var(--space-2)" }}>
        <Icon name="bolt" size={28} aria-hidden />
        <h1 style={{ margin: 0 }}>{t("tile.bolt.title")}</h1>
      </header>
      <p className="muted">{t("tile.bolt.intro")}</p>

      <div className="mt-3">
        <Button onClick={launch} iconName="bolt">
          {t("tile.bolt.open")}
        </Button>
      </div>

      {attempted ? (
        <div
          className="banner banner-info mt-4"
          role="status"
          aria-live="polite"
        >
          <Icon name="info" size={18} aria-hidden />
          <span>{t("tile.bolt.afterLaunch")}</span>
        </div>
      ) : null}
    </article>
  );
}
