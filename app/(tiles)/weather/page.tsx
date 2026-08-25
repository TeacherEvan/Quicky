"use client";

import { useEffect, useRef, useState } from "react";
import { getWeather, type WeatherSnapshot } from "@/lib/convex";
import { useSettings, type Units } from "@/lib/settings";
import { useT } from "@/lib/i18n";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/Button";
import { Loading } from "@/components/Loading";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { LiveDot } from "@/components/LiveDot";

export default function WeatherPage() {
  const { units, setUnits } = useSettings();
  const t = useT();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [snapshot, setSnapshot] = useState<WeatherSnapshot | null>(null);
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
    setSnapshot(null);
    getWeather(coords.lat, coords.lng, units, ctl.signal)
      .then((s) => {
        if (!ctl.signal.aborted) setSnapshot(s);
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
  }, [coords, units]);

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setError(t("tile.weather.error.geoUnsupported"));
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
      (err) => {
        setLoading(false);
        setError(t("tile.weather.error.geoFailed", { message: err.message }));
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  function useBangkok() {
    setCoords({ lat: 13.7563, lng: 100.5018 });
  }

  function retry() {
    if (coords) {
      setCoords({ ...coords });
    } else {
      useBangkok();
    }
  }

  const forecastIcon = (c: string): React.ReactNode => {
    const l = c.toLowerCase();
    if (l.includes("rain") || l.includes("shower")) return <Icon name="rain" size={22} aria-hidden />;
    if (l.includes("cloud") || l.includes("overcast")) return <Icon name="cloud" size={22} aria-hidden />;
    return <Icon name="sun" size={22} aria-hidden />;
  };

  return (
    <article>
      <Breadcrumb
        items={[
          { label: t("app.nav.dashboard"), href: "/" },
          { label: t("tile.weather.title") },
        ]}
      />
      <header className="row" style={{ marginBottom: "var(--space-2)" }}>
        <Icon name="sun" size={28} aria-hidden />
        <h1 style={{ margin: 0 }}>{t("tile.weather.title")}</h1>
        <span className="spacer" />
        <LiveDot label={t("tile.weather.live")} />
      </header>
      <p className="muted">{t("tile.weather.intro")}</p>

      <div className="row mt-3">
        <Button onClick={useMyLocation} iconName="pin">
          {t("tile.weather.useLocation")}
        </Button>
        <Button variant="secondary" onClick={useBangkok}>
          {t("tile.weather.bangkok")}
        </Button>
      </div>

      <div className="field mt-3" style={{ maxWidth: 280 }}>
        <label className="field-label" htmlFor="weather-units">
          {t("tile.weather.units")}
        </label>
        <select
          id="weather-units"
          value={units}
          onChange={(e) => setUnits(e.target.value as Units)}
        >
          <option value="C">{t("tile.weather.celsius")}</option>
          <option value="F">{t("tile.weather.fahrenheit")}</option>
        </select>
      </div>

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

      {snapshot && !loading ? (
        <section className="card mt-3" aria-labelledby="weather-now">
          <h2 id="weather-now" className="sr-only">
            {t("tile.weather.title")}
          </h2>
          <p className="hero-number" aria-label={`${t("tile.weather.title")} ${
            units === "F" ? Math.round(snapshot.tempF) : Math.round(snapshot.tempC)
          } ${units === "F" ? t("tile.weather.fahrenheit") : t("tile.weather.celsius")}`}>
            {units === "F"
              ? `${Math.round(snapshot.tempF)}°F`
              : `${Math.round(snapshot.tempC)}°C`}
          </p>
          <p className="muted" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {forecastIcon(snapshot.condition)}
            <span>{snapshot.condition}</span>
          </p>
          {coords ? (
            <p className="muted">
              {t("tile.weather.coords")}: {coords.lat}, {coords.lng}
            </p>
          ) : null}
        </section>
      ) : null}

      {snapshot && !loading ? (
        <section className="mt-3" aria-labelledby="weather-forecast">
          <h2 id="weather-forecast">{t("tile.weather.forecast")}</h2>
          <div className="forecast">
            {snapshot.forecast.map((f, i) => (
              <div key={i} className="forecast-day">
                <div className="forecast-day-label">
                  {t("tile.weather.dayN", { n: i + 1 })}
                </div>
                <div className="forecast-day-value">{f}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {!coords && !loading && !error ? (
        <EmptyState
          className="mt-4"
          iconName="pin"
          title={t("tile.weather.useLocation")}
          body={t("tile.weather.bangkok")}
        />
      ) : null}
    </article>
  );
}
