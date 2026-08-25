"use client";

/**
 * Last-resort error boundary. Renders when the root layout itself errors or
 * cannot render. Per Next.js docs, this file must include its own
 * <html><body> because the normal root layout is unavailable. Do not import
 * anything that depends on `lib/settings`, the NetworkProvider, or i18n —
 * those contexts may themselves be the cause of the error.
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          background: "#ffffff",
          color: "#14111f",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 22, margin: 0 }}>Quicky failed to load</h1>
        <p style={{ color: "#5a5469", maxWidth: 480, margin: "8px 0 0" }}>
          The application hit a fatal error. You can try reloading the page.
        </p>
        {error?.message ? (
          <p
            style={{
              color: "#5a5469",
              maxWidth: 480,
              margin: "8px 0 0",
              fontSize: 13,
              fontFamily: "monospace",
            }}
          >
            {error.message}
          </p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 16,
            padding: "10px 16px",
            background: "#5b3df5",
            color: "#ffffff",
            border: "1px solid #5b3df5",
            borderRadius: 8,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
