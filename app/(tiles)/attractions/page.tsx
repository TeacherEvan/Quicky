"use client";

import { useEffect, useRef, useState } from "react";
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

  return (
    <article>
      <Breadcrumb
        items={[
          { label: t("app.nav.dashboard"), href: "/" },
          { label: t("tile.attractions.title") },
        ]}
      />
      <header className="row" style={{ marginBottom: "var(--space-2)" }}>
        <Icon name="museum" size={28} aria-hidden />
        <h1 style={{ margin: 0 }}>{t("tile.attractions.title")}</h1>
        <span className="spacer" />
        <LiveDot label={t("tile.weather.live")} />
      </header>
      <p className="muted">{t("tile.attractions.intro")}</p>

      <div className="row mt-3">
        <Button onClick={useMyLocation} iconName="pin">
          {t("tile.attractions.useLocation")}
        </Button>
        <Button
          variant="secondary"
          onClick={() => setCoords({ lat: 13.7563, lng: 100.5018 })}
        >
          {t("tile.attractions.bangkok")}
        </Button>
      </div>

      <fieldset
        className="mt-3"
        style={{ border: 0, padding: 0, margin: "12px 0 0" }}
      >
        <legend className="field-label" style={{ marginBottom: 4 }}>
          {t("tile.attractions.radius")}
        </legend>
        <div
          role="radiogroup"
          aria-label={t("tile.attractions.radius")}
          className="row"
        >
          {RADII.map((r) => (
            <Button
              key={r}
              variant={r === radius ? "primary" : "secondary"}
              size="sm"
              pressed={r === radius}
              onClick={() => setRadius(r)}
            >
              {r} km
            </Button>
          ))}
        </div>
      </fieldset>

      <div className="mt-4" role="status" aria-live="polite">
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

      {places && !loading ? (
        places.length === 0 ? (
          <EmptyState
            className="mt-3"
            iconName="museum"
            body={t("tile.attractions.empty", { radius })}
          />
        ) : (
          <section className="mt-3" aria-labelledby="attractions-results">
            <h2 id="attractions-results" className="sr-only">
              {t("tile.attractions.title")}
            </h2>
            <p className="muted" aria-live="polite">
              {t("tile.attractions.found", { count: places.length })}
            </p>
            <ul className="list" aria-label={t("tile.attractions.title")}>
              {places.map((p, i) => (
                <li key={`${p.name}-${i}`} className="list-item">
                  <div className="row" style={{ alignItems: "flex-start" }}>
                    <Icon name="pin" size={18} aria-hidden />
                    <div style={{ flex: 1 }}>
                      <div className="list-item-title">{p.name}</div>
                      <div className="list-item-meta">
                        {p.type} · {p.distanceKm.toFixed(1)} km
                        {p.openNow ? ` · ${t("tile.attractions.openNow")}` : ""}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )
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
