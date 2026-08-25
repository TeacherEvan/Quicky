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
}

// URL schemes + Android package IDs are community-reported for the 6
// biggest Thai banks. They are best-effort: each bank controls its own
// scheme and may change it without notice.
const BANKS: ReadonlyArray<Bank> = [
  {
    name: "Bualuang mBanking (BBL)",
    scheme: "bualuangmbanking://",
    package: "com.bbl.mobilebanking",
  },
  {
    name: "K PLUS (KBank)",
    scheme: "kplus://",
    package: "com.kasikorn.retail.mbanking.wap",
  },
  {
    name: "Krungthai NEXT (KTB)",
    scheme: "ktbnext://",
    package: "ktbcs.netbank",
  },
  {
    name: "SCB EASY",
    scheme: "scbeasy://",
    package: "com.scb.phone",
  },
  {
    name: "TTB touch",
    scheme: "ttbtouch://",
    package: "com.TMBTOUCH.PRODUCTION",
  },
  {
    name: "Bolt (ride payments)",
    scheme: "boltd://wallet",
    package: "ee.mtakso.client",
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
    <article>
      <Breadcrumb
        items={[
          { label: t("app.nav.dashboard"), href: "/" },
          { label: t("tile.banking.title") },
        ]}
      />
      <header className="row" style={{ marginBottom: "var(--space-2)" }}>
        <Icon name="bank" size={28} aria-hidden />
        <h1 style={{ margin: 0 }}>{t("tile.banking.title")}</h1>
      </header>
      <p className="muted">{t("tile.banking.intro")}</p>

      <ul className="list mt-3" aria-label={t("tile.banking.title")}>
        {BANKS.map((b) => (
          <li key={b.package} className="list-item">
            <div className="row" style={{ alignItems: "center" }}>
              <Icon name="bank" size={22} aria-hidden />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="list-item-title">{b.name}</div>
                <div
                  className="list-item-meta"
                  style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
                >
                  {b.scheme}
                </div>
              </div>
              <Button onClick={() => launch(b)} size="sm">
                {t("tile.banking.open")}
              </Button>
            </div>
          </li>
        ))}
      </ul>

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
    </article>
  );
}
