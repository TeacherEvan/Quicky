"use client";

import { SplashVideo } from "@/components/SplashVideo";
import { Topbar } from "@/components/Topbar";
import { Tile, type TileSlug, type TileCategory } from "@/components/Tile";
import type { IconName } from "@/components/Icon";
import { usePrefetch } from "@/lib/perf";
import { useT, type StringKey } from "@/lib/i18n";

interface TileDef {
  slug: TileSlug;
  icon: IconName;
  category: TileCategory;
}

const GROUPS: ReadonlyArray<{
  id: string;
  tiles: ReadonlyArray<TileDef>;
}> = [
  {
    id: "live",
    tiles: [
      { slug: "weather", icon: "sun", category: "weather" },
      { slug: "attractions", icon: "museum", category: "nearby" },
    ],
  },
  {
    id: "tools",
    tiles: [
      { slug: "cost", icon: "camera", category: "photo" },
      { slug: "location", icon: "pin", category: "photo" },
      { slug: "bathroom", icon: "wc", category: "utility" },
      { slug: "counter", icon: "calendar", category: "time" },
    ],
  },
  {
    id: "apps",
    tiles: [
      { slug: "bolt", icon: "bolt", category: "mobility" },
      { slug: "banking", icon: "bank", category: "finance" },
    ],
  },
];

export default function DashboardPage() {
  usePrefetch(GROUPS.flatMap((g) => g.tiles.map((t) => `/${t.slug}`)));
  const t = useT();

  return (
    <>
      <SplashVideo />
      <div className="app-shell">
      <Topbar />
      <main
        id="main-content"
        className="container"
        tabIndex={-1}
        aria-label={t("app.brandTagline")}
      >
        <section className="page-header">
          <span className="brand-eyebrow">
            <span className="live-dot" aria-hidden="true" />
            {t("dashboard.eyebrow")}
          </span>
          <h1>{t("dashboard.heading")}</h1>
          <p className="page-header__lede">{t("dashboard.intro")}</p>
        </section>

        <nav aria-label={t("dashboard.navLabel")} className="stack-loose">
          {GROUPS.map((g) => (
            <section
              key={g.id}
              className="tile-group"
              aria-labelledby={`group-${g.id}`}
            >
              <div className="tile-group__head">
                <h2 id={`group-${g.id}`}>
                  {t(`dashboard.group.${g.id}.label.explicit` as StringKey)}
                </h2>
                <p>{t(`dashboard.group.${g.id}.hint.explicit` as StringKey)}</p>
              </div>
              <div className="tile-grid" role="list">
                {g.tiles.map((tdef) => (
                  <div key={tdef.slug} role="listitem">
                    <Tile
                      slug={tdef.slug}
                      icon={tdef.icon}
                      category={tdef.category}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </nav>
      </main>
    </div>
    </>
  );
}
