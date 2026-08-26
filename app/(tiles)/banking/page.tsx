"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";

interface Bank {
  name: string;
  scheme: string;
  package: string;
  icon: string;
}

// URL schemes + Android package IDs are community-reported for the 6
// biggest Thai banks. They are best-effort: each bank controls its own
// scheme and may change it without notice.
const BANKS: ReadonlyArray<Bank> = [
  {
    name: "Bualuang mBanking (BBL)",
    scheme: "bualuangmbanking://",
    package: "com.bbl.mobilebanking",
    icon: "bank",
  },
  {
    name: "K PLUS (KBank)",
    scheme: "kplus://",
    package: "com.kasikorn.retail.mbanking.wap",
    icon: "bank",
  },
  {
    name: "Krungthai NEXT (KTB)",
    scheme: "ktbnext://",
    package: "ktbcs.netbank",
    icon: "bank",
  },
  {
    name: "SCB EASY",
    scheme: "scbeasy://",
    package: "com.scb.phone",
    icon: "bank",
  },
  {
    name: "TTB touch",
    scheme: "ttbtouch://",
    package: "com.TMBTOUCH.PRODUCTION",
    icon: "bank",
  },
  {
    name: "Bolt (ride payments)",
    scheme: "boltd://wallet",
    package: "ee.mtakso.client",
    icon: "bolt",
  },
];

export default function BankingPage() {
  const t = useT();
  const [tried, setTried] = useState<string | null>(null);

  function launch(b: Bank) {
    setTried(b.name);
    const t0 = Date.now();
    const onBlur = () => {
      void t0;
      window.removeEventListener("blur", onBlur);
    };
    window.addEventListener("blur", onBlur);
    window.location.href = b.scheme;
  }

  return (
    <article className="page">
      <Breadcrumb
        items={[
          { label: t("app.nav.dashboard"), href: "/" },
          { label: t("tile.banking.title") },
        ]}
      />

      <header className="page-header">
        <div className="page-header__top">
          <span
            className="page-header__icon"
            style={{
              background: "var(--cat-finance-bg)",
              border: "1px solid var(--cat-finance-border)",
              color: "var(--cat-finance-ink)",
            }}
            aria-hidden="true"
          >
            <Icon name="bank" size={24} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="page-header__title">{t("tile.banking.title")}</h1>
            <p className="page-header__lede">{t("tile.banking.intro")}</p>
          </div>
        </div>
      </header>

      <section className="section" aria-labelledby="banking-list">
        <div className="section-heading">
          <h2 id="banking-list">{t("tile.banking.banks")}</h2>
        </div>
        <ul className="list" aria-label={t("tile.banking.title")}>
          {BANKS.map((b) => (
            <li key={b.package} className="list-item">
              <span
                className="list-item__icon"
                aria-hidden="true"
              >
                <Icon name={b.icon as "bank" | "bolt"} size={20} />
              </span>
              <div className="list-item__body">
                <div className="list-item__title">{b.name}</div>
                <div className="list-item__meta">
                  <code className="text-mono" style={{ fontSize: "var(--fs-xs)" }}>
                    {b.scheme}
                  </code>
                </div>
              </div>
              <Button onClick={() => launch(b)} size="sm" className="list-item__actions">
                {t("tile.banking.open")}
              </Button>
            </li>
          ))}
        </ul>
      </section>

      {tried ? (
        <div
          className="banner banner-info mt-4"
          role="status"
          aria-live="polite"
        >
          <Icon name="info" size={18} aria-hidden />
          <span>{t("tile.banking.afterLaunch", { name: tried })}</span>
        </div>
      ) : null}

      <section className="section mt-6" aria-labelledby="banking-note">
        <div className="section-heading">
          <h2 id="banking-note">{t("tile.banking.note")}</h2>
        </div>
        <div className="card-quiet">
          <p className="muted" style={{ margin: 0 }}>
            {t("tile.banking.noteText")}
          </p>
        </div>
      </section>
    </article>
  );
}