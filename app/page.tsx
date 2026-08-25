import Link from "next/link";

const TILES = [
  { slug: "cost", label: "Cost", icon: "$", accent: "#2E9E5B" },
  { slug: "location", label: "Location", icon: "📍", accent: "#2D7FF9" },
  { slug: "bathroom", label: "Bathroom", icon: "🚻", accent: "#15A0A0" },
  { slug: "attractions", label: "Attractions", icon: "🎯", accent: "#E8821E" },
  { slug: "counter", label: "Day Counter", icon: "⏱", accent: "#D6453D" },
  { slug: "bolt", label: "Bolt", icon: "⚡", accent: "#E0A800" },
  { slug: "banking", label: "Banking", icon: "🏛", accent: "#6C4BE0" },
  { slug: "weather", label: "Weather", icon: "☀", accent: "#1FA8C9" },
] as const;

export default function DashboardPage() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>Quicky</h1>
        <Link href="/settings">Settings</Link>
      </header>
      <main className="page">
        <p className="muted">
          Eight handy tools for travelers in Thailand. All data fetched live
          from real APIs — no mocks, no sample data.
        </p>
      </main>
      <nav className="dashboard" aria-label="Quick tools">
        {TILES.map((t) => (
          <Link
            key={t.slug}
            href={`/${t.slug}`}
            className="tile"
            style={{
              borderColor: `${t.accent}55`,
              color: "var(--text)",
            }}
          >
            <span className="icon" aria-hidden>
              {t.icon}
            </span>
            <span>{t.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
