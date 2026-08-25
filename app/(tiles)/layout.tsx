import Link from "next/link";
import type { ReactNode } from "react";

export default function TileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>
          <Link href="/">← Quicky</Link>
        </h1>
        <Link href="/settings">Settings</Link>
      </header>
      <main className="page">{children}</main>
    </div>
  );
}
