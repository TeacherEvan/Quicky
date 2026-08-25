"use client";

import { useState } from "react";

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
  const [tried, setTried] = useState<string | null>(null);

  function launch(b: Bank) {
    setTried(b.name);
    const t = Date.now();
    const onBlur = () => {
      window.removeEventListener("blur", onBlur);
      void t;
    };
    window.addEventListener("blur", onBlur);
    window.location.href = b.scheme;
  }

  return (
    <article>
      <h2>Banking</h2>
      <p className="muted">
        Tap a bank to open its app. On a device where the app is installed,
        the bank&apos;s URL scheme is invoked. On desktop or where the app is
        not installed, nothing happens.
      </p>
      <ul className="list">
        {BANKS.map((b) => (
          <li key={b.package}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <strong>{b.name}</strong>
                <div className="muted" style={{ fontFamily: "monospace" }}>
                  {b.scheme}
                </div>
              </div>
              <button
                className="button"
                onClick={() => launch(b)}
                type="button"
              >
                Open
              </button>
            </div>
          </li>
        ))}
      </ul>
      {tried ? (
        <p className="muted">
          Tried to open {tried}. If nothing happened, the app is not
          installed.
        </p>
      ) : null}
    </article>
  );
}
