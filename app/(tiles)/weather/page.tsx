"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getWeather, type WeatherSnapshot } from "@/lib/convex";
import { useSettings, type Units } from "@/lib/settings";
import { useT } from "@/lib/i18n";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/Button";
import { Loading } from "@/components/Loading";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { Icon, type IconName } from "@/components/Icon";
import { LiveDot } from "@/components/LiveDot";

type WxCode = number;

/** WMO weather interpretation → display label, icon, and severity. */
function describeCode(code: WxCode): {
  label: string;
  icon: IconName;
} {
  if (code === 0) return { label: "Clear", icon: "sun" };
  if (code === 1) return { label: "Mostly clear", icon: "cloud-sun" };
  if (code === 2) return { label: "Partly cloudy", icon: "cloud-sun" };
  if (code === 3) return { label: "Overcast", icon: "cloud" };
  if (code >= 45 && code <= 48) return { label: "Fog", icon: "fog" };
  if (code >= 51 && code <= 55) return { label: "Drizzle", icon: "drizzle" };
  if (code >= 56 && code <= 57) return { label: "Freezing drizzle", icon: "drizzle" };
  if (code >= 61 && code <= 65) return { label: "Rain", icon: "rain" };
  if (code >= 66 && code <= 67) return { label: "Freezing rain", icon: "rain" };
  if (code >= 71 && code <= 75) return { label: "Snow", icon: "snow" };
  if (code === 77) return { label: "Snow grains", icon: "snow" };
  if (code >= 80 && code <= 82) return { label: "Showers", icon: "showers" };
  if (code === 85 || code === 86) return { label: "Snow showers", icon: "snow" };
  if (code === 95) return { label: "Thunderstorm", icon: "storm" };
  if (code === 96 || code === 99) return { label: "Hail storm", icon: "storm" };
  return { label: "Cloudy", icon: "cloud" };
}

function dayLabel(idx: number): string {
  if (idx === 0) return "Today";
  if (idx === 1) return "Tomorrow";
  const d = new Date();
  d.setDate(d.getDate() + idx);
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

function dayDate(idx: number): string {
  const d = new Date();
  d.setDate(d.getDate() + idx);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

interface DayForecast {
  label: string;
  date: string;
  icon: IconName;
  condition: string;
  hi: number | null;
  lo: number | null;
  units: Units;
}

export default function WeatherPage() {
  const { units, setUnits } = useSettings();
  const t = useT();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [snapshot, setSnapshot] = useState<WeatherSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedAt, setResolvedAt] = useState<Date | null>(null);
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
        if (!ctl.signal.aborted) {
          setSnapshot(s);
          setResolvedAt(new Date());
        }
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

  const current = useMemo(() => {
    if (!snapshot) return null;
    const d = describeCode(snapshot.weatherCode);
    return {
      icon: d.icon,
      label: d.label,
      temp: units === "F" ? snapshot.tempF : snapshot.tempC,
    };
  }, [snapshot, units]);

  const forecast: DayForecast[] = useMemo(() => {
    if (!snapshot) return [];
    const daily = snapshot.forecast;
    return (daily ?? []).map((d, i) => {
      const desc = describeCode(d.code);
      const hiVal = units === "F" ? d.maxF : d.maxC;
      const loVal = units === "F" ? d.minF : d.minC;
      return {
        label: dayLabel(i),
        date: dayDate(i),
        icon: desc.icon,
        condition: desc.label,
        hi: Number.isFinite(hiVal) ? hiVal : null,
        lo: Number.isFinite(loVal) ? loVal : null,
        units,
      };
    });
  }, [snapshot, units]);

  return (
    <article className="page">
      <Breadcrumb
        items={[
          { label: t("app.nav.dashboard"), href: "/" },
          { label: t("tile.weather.title") },
        ]}
      />

      <header className="page-header">
        <div className="page-header__top">
          <span
            className="page-header__icon"
            style={{
              background: "var(--cat-weather-bg)",
              border: "1px solid var(--cat-weather-border)",
              color: "var(--cat-weather-ink)",
            }}
            aria-hidden="true"
          >
            <Icon name="sun" size={24} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="page-header__title">{t("tile.weather.title")}</h1>
            <p className="page-header__lede">{t("tile.weather.intro")}</p>
          </div>
        </div>
      </header>

      <section className="section" aria-labelledby="weather-controls">
        <div className="section-heading">
          <h2 id="weather-controls">{t("tile.weather.location")}</h2>
          <span className="section-heading__hint">
            <LiveDot label={t("tile.weather.live")} />
          </span>
        </div>
        <div className="row">
          <Button onClick={useMyLocation} iconName="pin">
            {t("tile.weather.useLocation")}
          </Button>
          <Button variant="secondary" onClick={useBangkok} iconName="map">
            {t("tile.weather.bangkok")}
          </Button>
          <span className="spacer" />
          <div
            className="segmented"
            role="group"
            aria-label={t("tile.weather.units")}
          >
            <button
              type="button"
              className="segmented__btn"
              aria-pressed={units === "C"}
              onClick={() => setUnits("C" as Units)}
            >
              °C
            </button>
            <button
              type="button"
              className="segmented__btn"
              aria-pressed={units === "F"}
              onClick={() => setUnits("F" as Units)}
            >
              °F
            </button>
          </div>
        </div>
        {coords ? (
          <p className="muted tabular">
            {t("tile.weather.coords")}: {coords.lat.toFixed(4)},{" "}
            {coords.lng.toFixed(4)}
            {resolvedAt ? (
              <>
                {" · "}
                {t("tile.weather.fetched", {
                  time: resolvedAt.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                })}
              </>
            ) : null}
          </p>
        ) : null}
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

      {current && !loading ? (
        <section
          className="hero"
          aria-labelledby="weather-now"
        >
          <div className="hero__row">
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "var(--bg-elev)",
                color: "var(--brand)",
                border: "1px solid var(--border)",
              }}
              aria-hidden="true"
            >
              <Icon name={current.icon} size={36} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                className="hero__num hero__num--accent tabular"
                aria-label={`${current.label}, ${Math.round(current.temp)} degrees ${
                  units === "F" ? "Fahrenheit" : "Celsius"
                }`}
              >
                {Math.round(current.temp)}°
              </p>
              <p className="hero__label">{current.label}</p>
            </div>
            <span
              className="chip chip-brand"
              style={{ alignSelf: "flex-start" }}
            >
              <span className="chip-dot" aria-hidden="true" />
              {t("tile.weather.live")}
            </span>
          </div>
        </section>
      ) : null}

      {forecast.length > 0 && !loading ? (
        <section className="section" aria-labelledby="weather-forecast">
          <div className="section-heading">
            <h2 id="weather-forecast">{t("tile.weather.forecast")}</h2>
            <span className="section-heading__hint">
              {t("tile.weather.forecastHint")}
            </span>
          </div>
          <div className="forecast" role="list">
            {forecast.map((d, i) => (
              <article
                key={i}
                className="forecast-day"
                role="listitem"
                aria-label={`${d.label}: ${d.condition}, ${
                  d.hi !== null ? `${Math.round(d.hi)}°` : ""
                }${d.lo !== null ? ` / ${Math.round(d.lo)}°` : ""}`}
              >
                <div className="forecast-day__dow">{d.label}</div>
                <div className="muted" style={{ fontSize: "var(--fs-xs)" }}>
                  {d.date}
                </div>
                <span className="forecast-day__icon" aria-hidden="true">
                  <Icon name={d.icon} size={32} />
                </span>
                <div className="forecast-day__hi">
                  {d.hi !== null ? `${Math.round(d.hi)}°` : "—"}
                </div>
                <div className="forecast-day__lo">
                  {d.lo !== null
                    ? `${t("tile.weather.lo")} ${Math.round(d.lo)}°`
                    : "—"}
                </div>
              </article>
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
