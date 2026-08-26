"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getPlaces, type Attraction } from "@/lib/convex";
import { useT } from "@/lib/i18n";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/Button";
import { Loading } from "@/components/Loading";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { LiveDot } from "@/components/LiveDot";

const RADII = [10, 40, 100] as const;

/** Evaluate a simple subset of OSM opening_hours.
 *  Handles: "24/7", "Mo-Fr 08:00-20:00", "Sa-Su 10:00-18:00", "09:00-22:00"
 *  Returns null if unparseable (treat as unknown, not false).
 */
function isOpenNow(openingHours?: string): boolean {
  if (!openingHours) return false;
  const s = openingHours.trim();
  if (!s) return false;
  if (s === "24/7") return true;

  const now = new Date();
  const dow = now.getDay(); // 0=Sun .. 6=Sat
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Split by semicolon for multiple rules
  const rules = s.split(";").map((r) => r.trim());
  for (const rule of rules) {
    // Try "Mo-Fr 08:00-20:00" or "09:00-22:00"
    const match = rule.match(
      /^((?:Mo|Tu|We|Th|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))?\s*)?(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/,
    );
    if (match) {
      const dayPart = match[1]?.trim() ?? "";
      const start = parseTime(match[2]);
      const end = parseTime(match[3]);
      if (start === null || end === null) continue;

      const applies = dayPart === "" || dayMatches(dow, dayPart);
      if (!applies) continue;

      // Handle overnight (e.g., 22:00-02:00)
      if (end <= start) {
        if (currentMinutes >= start || currentMinutes < end) return true;
      } else {
        if (currentMinutes >= start && currentMinutes < end) return true;
      }
    }
  }
return false;
}

function parseTime(t: string): number | null {
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

function dayMatches(dow: number, spec: string): boolean {
  // Handle ranges like "Mo-Fr"
  const rangeMatch = spec.match(/^(Mo|Tu|We|Th|Fr|Sa|Su)-(Mo|Tu|We|Th|Fr|Sa|Su)$/);
  if (rangeMatch) {
    const start = dayNameToNum(rangeMatch[1]);
    const end = dayNameToNum(rangeMatch[2]);
    if (start <= end) {
      return dow >= start && dow <= end;
    }
    // Wrap-around (e.g., Fr-Mo) — unlikely in OSM but handle
    return dow >= start || dow <= end;
  }
  // Single day
  const single = spec.match(/^(Mo|Tu|We|Th|Fr|Sa|Su)$/);
  if (single) return dow === dayNameToNum(single[1]);
  return false;
}

function dayNameToNum(name: string): number {
  const map: Record<string, number> = {
    Mo: 1,
    Tu: 2,
    We: 3,
    Th: 4,
    Fr: 5,
    Sa: 6,
    Su: 0,
  };
  return map[name] ?? 0;
}

function categoryInfo(type: string): { label: string; icon: string } {
  const t = type.toLowerCase();
  if (t.includes("temple") || t === "place_of_worship") {
    return { label: "Temple", icon: "museum" };
  }
  if (t.includes("museum")) return { label: "Museum", icon: "museum" };
  if (t.includes("park")) return { label: "Park", icon: "map" };
  if (t.includes("market")) return { label: "Market", icon: "map" };
  if (t.includes("viewpoint")) return { label: "Viewpoint", icon: "map" };
  if (t.includes("zoo")) return { label: "Zoo", icon: "map" };
  if (t.includes("gallery")) return { label: "Gallery", icon: "museum" };
  if (t === "attraction") return { label: "Attraction", icon: "museum" };
  return { label: type, icon: "map" };
}

export default function AttractionsPage() {
  const t = useT();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [radius, setRadius] = useState<number>(10);
  const [places, setPlaces] = useState<Attraction[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!coords) return;
    const ctl = new AbortController();
    abortRef.current?.abort();
    abortRef.current = ctl;
    setLoading(true);
    setError(null);
    setPlaces(null);
    getPlaces(coords.lat, coords.lng, radius, ctl.signal)
      .then((r) => {
        if (!ctl.signal.aborted) setPlaces(r.places);
      })
      .catch((e: unknown) => {
        if (!ctl.signal.aborted) {
          setError(e instanceof Error ? e.message : String(e));
        }
      })
      .finally(() => {
        if (!ctl.signal.aborted) setLoading(false);
      });
    return () => ctl.abort();
  }, [coords, radius]);

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setError(t("tile.attractions.noGeolocation"));
      return;
    }
    setError(null);
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4)),
        });
      },
      () => {
        setLoading(false);
        setError(t("tile.attractions.noGeolocation"));
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  function retry() {
    if (coords) setCoords({ ...coords });
  }

  const placesWithStatus = useMemo(() => {
    if (!places) return [];
    return places.map((p) => {
      const cat = categoryInfo(p.type);
      const openNow = isOpenNow(p.openingHours ?? undefined);
      return { ...p, cat, openNow };
    });
  }, [places]);

  return (
    <article className="page">
      <Breadcrumb
        items={[
          { label: t("app.nav.dashboard"), href: "/" },
          { label: t("tile.attractions.title") },
        ]}
      />

      <header className="page-header">
        <div className="page-header__top">
          <span
            className="page-header__icon"
            style={{
              background: "var(--cat-nearby-bg)",
              border: "1px solid var(--cat-nearby-border)",
              color: "var(--cat-nearby-ink)",
            }}
            aria-hidden="true"
          >
            <Icon name="museum" size={24} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="page-header__title">{t("tile.attractions.title")}</h1>
            <p className="page-header__lede">{t("tile.attractions.intro")}</p>
          </div>
        </div>
      </header>

      <section className="section" aria-labelledby="attractions-controls">
        <div className="section-heading">
          <h2 id="attractions-controls">{t("tile.attractions.location")}</h2>
          <span className="section-heading__hint">
            <LiveDot label={t("tile.weather.live")} />
          </span>
        </div>
        <div className="row">
          <Button onClick={useMyLocation} iconName="pin">
            {t("tile.attractions.useLocation")}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setCoords({ lat: 13.7563, lng: 100.5018 })}
            iconName="map"
          >
            {t("tile.attractions.bangkok")}
          </Button>
        </div>
        {coords ? (
          <p className="muted tabular">
            {t("tile.weather.coords")}: {coords.lat.toFixed(4)},{" "}
            {coords.lng.toFixed(4)}
          </p>
        ) : null}
      </section>

      <section className="section" aria-labelledby="attractions-radius">
        <div className="section-heading">
          <h2 id="attractions-radius">{t("tile.attractions.radius")}</h2>
        </div>
        <fieldset
          className="segmented"
          role="radiogroup"
          aria-label={t("tile.attractions.radius")}
        >
          {RADII.map((r) => (
            <button
              key={r}
              type="button"
              className="segmented__btn"
              aria-pressed={r === radius}
              onClick={() => setRadius(r)}
            >
              {r} km
            </button>
          ))}
        </fieldset>
      </section>

      <div className="mt-3" role="status" aria-live="polite">
        {error ? (
          <ErrorState
            title={t("common.errorTitle")}
            detail={error}
            onRetry={retry}
          />
        ) : loading ? (
          <Loading size="lg" label={t("common.loading")} />
        ) : null}
      </div>

      {placesWithStatus.length > 0 && !loading ? (
        <section className="section" aria-labelledby="attractions-results">
          <div className="section-heading">
            <h2 id="attractions-results" className="sr-only">
              {t("tile.attractions.title")}
            </h2>
            <span className="section-heading__hint">
              {t("tile.attractions.found", { count: placesWithStatus.length })}
            </span>
          </div>
          <ul className="list" aria-label={t("tile.attractions.title")}>
            {placesWithStatus.map((p, i) => (
              <li key={`${p.name}-${i}`} className="list-item">
                <span
                  className="list-item__icon"
                  aria-hidden="true"
                >
                  <Icon name={p.cat.icon as "museum" | "map"} size={18} />
                </span>
                <div className="list-item__body">
                  <div className="list-item__title">{p.name}</div>
                  <div className="list-item__meta">
                    <span className="chip chip-muted">{p.cat.label}</span>
                    <span className="chip chip-brand tabular">
                      {p.distanceKm.toFixed(1)} km
                    </span>
                    {p.openNow === true ? (
                      <span className="chip chip-ok">
                        <span className="chip-dot" aria-hidden="true" />
                        {t("tile.attractions.openNow")}
                      </span>
                    ) : p.openNow === false ? (
                      <span className="chip chip-muted">
                        {t("tile.attractions.closedNow")}
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : places !== null && !loading ? (
        <EmptyState
          className="mt-3"
          iconName="museum"
          body={t("tile.attractions.empty", { radius })}
        />
      ) : null}

      {!coords && !loading && !error ? (
        <EmptyState
          className="mt-4"
          iconName="pin"
          title={t("tile.attractions.useLocation")}
          body={t("tile.attractions.bangkok")}
        />
      ) : null}
    </article>
  );
}