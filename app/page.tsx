"use client";

import { Topbar } from "@/components/Topbar";
import { Tile, type TileSlug } from "@/components/Tile";
import type { IconName } from "@/components/Icon";
import { usePrefetch } from "@/lib/perf";

const TILES: ReadonlyArray<{ slug: TileSlug; icon: IconName }> = [
  { slug: "cost", icon: "counter" },
  { slug: "location", icon: "pin" },
  { slug: "bathroom", icon: "wc" },
  { slug: "attractions", icon: "museum" },
  { slug: "counter", icon: "counter" },
  { slug: "bolt", icon: "bolt" },
  { slug: "banking", icon: "bank" },
  { slug: "weather", icon: "sun" },
];

export default function DashboardPage() {
  usePrefetch(TILES.map((t) => `/${t.slug}`));

  return (
    <div className="app-shell">
      <Topbar />
      <main id="main-content" className="container" tabIndex={-1}>
        <h1>Quicky</h1>
        <p className="muted">
          Eight handy tools for travelers in Thailand. All data fetched live
          from real APIs — no mocks, no sample data.
        </p>
        <nav className="dashboard mt-4" aria-label="Quick tools">
          {TILES.map((t) => (
            <Tile key={t.slug} slug={t.slug} icon={t.icon} />
          ))}
        </nav>
      </main>
    </div>
  );
}
