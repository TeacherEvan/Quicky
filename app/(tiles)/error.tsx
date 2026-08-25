"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function TilesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[quicky] tile error", error);
  }, [error]);

  return (
    <article>
      <h2>Couldn&apos;t load this tile</h2>
      <p className="muted">
        Something broke while rendering this tool. Try again, or pick a
        different one.
      </p>
      {error?.message ? (
        <div className="alert-error" role="alert" style={{ marginTop: 12 }}>
          <p>{error.message}</p>
        </div>
      ) : null}
      <div className="row" style={{ marginTop: 12 }}>
        <button className="button" type="button" onClick={reset}>
          Try again
        </button>
        <Link className="button secondary" href="/">
          Go home
        </Link>
      </div>
    </article>
  );
}
