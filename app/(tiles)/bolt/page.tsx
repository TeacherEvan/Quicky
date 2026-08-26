"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { InstallButton } from "@/components/InstallButton";

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
    <article className="page">
      <Breadcrumb
        items={[
          { label: t("app.nav.dashboard"), href: "/" },
          { label: t("tile.bolt.title") },
        ]}
      />

      <header className="page-header">
        <div className="page-header__top">
          <span
            className="page-header__icon"
            style={{
              background: "var(--cat-mobility-bg)",
              border: "1px solid var(--cat-mobility-border)",
              color: "var(--cat-mobility-ink)",
            }}
            aria-hidden="true"
          >
            <Icon name="bolt" size={24} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="page-header__title">{t("tile.bolt.title")}</h1>
            <p className="page-header__lede">{t("tile.bolt.intro")}</p>
          </div>
        </div>
      </header>

      <section className="section" aria-labelledby="bolt-action">
        <div className="section-heading">
          <h2 id="bolt-action">{t("tile.bolt.action")}</h2>
        </div>
        <div className="row" style={{ gap: "var(--s-3)" }}>
          <Button onClick={launch} iconName="bolt" className="btn-block btn-lg">
            {t("tile.bolt.open")}
          </Button>
          <InstallButton />
        </div>
      </section>

      {attempted ? (
        <div className="banner banner-info mt-4" role="status" aria-live="polite">
          <Icon name="info" size={18} aria-hidden />
          <span>{t("tile.bolt.afterLaunch")}</span>
        </div>
      ) : null}

      <section className="section mt-6" aria-labelledby="bolt-help">
        <div className="section-heading">
          <h2 id="bolt-help">{t("tile.bolt.howItWorks")}</h2>
        </div>
        <div className="card-quiet">
          <p className="muted" style={{ margin: 0 }}>
            {t("tile.bolt.helpText")}
          </p>
        </div>
      </section>
    </article>
  );
}