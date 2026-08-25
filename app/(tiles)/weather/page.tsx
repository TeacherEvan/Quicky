"use client";

import { useEffect, useRef, useState } from "react";
import { getWeather, type WeatherSnapshot } from "@/lib/convex";
import { useSettings } from "@/lib/settings";

export default function WeatherPage() {
  const { units, setUnits } = useSettings();
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
      setError("Your browser does not expose geolocation.");
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
        setError(`Geolocation denied or failed: ${err.message}`);
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  function useBangkok() {
    setCoords({ lat: 13.7563, lng: 100.5018 });
  }

  return (
    <article>
      <h2>Weather</h2>
      <p className="muted">
        Live data from Open-Meteo via your Convex backend. No cached or sample
        values.
      </p>
      <div className="row">
        <button className="button" onClick={useMyLocation} type="button">
          Use my location
        </button>
        <button
          className="button secondary"
          onClick={useBangkok}
          type="button"
        >
          Bangkok
        </button>
      </div>
      <p>
        <label>
          Units:&nbsp;
          <select
            value={units}
            onChange={(e) => setUnits(e.target.value as "C" | "F")}
          >
            <option value="C">Celsius</option>
            <option value="F">Fahrenheit</option>
          </select>
        </label>
      </p>
      {error ? <p className="error">{error}</p> : null}
      {loading ? <p className="muted">Loading…</p> : null}
      {snapshot && !loading ? (
        <section className="card">
          <p style={{ fontSize: 48, margin: 0, fontWeight: 600 }}>
            {units === "F"
              ? `${Math.round(snapshot.tempF)}°F`
              : `${Math.round(snapshot.tempC)}°C`}
          </p>
          <p className="muted">{snapshot.condition}</p>
          {coords ? (
            <p className="muted">
              Lat {coords.lat}, Lng {coords.lng}
            </p>
          ) : null}
          <div className="forecast" aria-label="3-day forecast">
            {snapshot.forecast.map((f, i) => (
              <div key={i} className="day">
                <div className="muted">Day {i + 1}</div>
                <div style={{ fontSize: 20, fontWeight: 500 }}>{f}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
