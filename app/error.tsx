"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console so dev tools / Sentry-style ingest see the failure.
    console.error("[quicky] route error", error);
  }, [error]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>
          <Link href="/">Quicky</Link>
        </h1>
      </header>
      <main className="page">
        <div className="error-page" role="alert">
          <h2>Something went wrong</h2>
          <p>
            We hit an unexpected problem rendering this page. You can try
            again, or head back home.
          </p>
          {error?.message ? (
            <p className="muted">{error.message}</p>
          ) : null}
          <div className="row" style={{ marginTop: 12 }}>
            <button className="button" type="button" onClick={reset}>
              Try again
            </button>
            <Link className="button secondary" href="/">
              Go home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
