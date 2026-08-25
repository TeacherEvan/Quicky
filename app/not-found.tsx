import Link from "next/link";

export default function NotFound() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>
          <Link href="/">← Quicky</Link>
        </h1>
      </header>
      <main className="page">
        <article>
          <h2>Not found</h2>
          <p className="muted">That page does not exist.</p>
          <p>
            <Link className="button" href="/">
              Go home
            </Link>
          </p>
        </article>
      </main>
    </div>
  );
}
