"use client";

import { useEffect, useRef, useState } from "react";
import { getPlaces, type Attraction } from "@/lib/convex";

const RADII = [10, 40, 100] as const;

export default function AttractionsPage() {
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

  return (
    <article>
      <h2>Attractions</h2>
      <p className="muted">
        Live data from OpenStreetMap (Overpass) via your Convex backend. No
        cached or sample values.
      </p>
      <div className="row">
        <button className="button" onClick={useMyLocation} type="button">
          Use my location
        </button>
        <button
          className="button secondary"
          onClick={() => setCoords({ lat: 13.7563, lng: 100.5018 })}
          type="button"
        >
          Bangkok
        </button>
      </div>
      <p>
        Radius:&nbsp;
        {RADII.map((r) => (
          <button
            key={r}
            className={r === radius ? "button" : "button secondary"}
            onClick={() => setRadius(r)}
            type="button"
            style={{ marginRight: 4 }}
          >
            {r} km
          </button>
        ))}
      </p>
      {error ? <p className="error">{error}</p> : null}
      {loading ? <p className="muted">Loading…</p> : null}
      {places && !loading ? (
        places.length === 0 ? (
          <p className="muted">
            No attractions found in {radius} km. Try a larger radius.
          </p>
        ) : (
          <ul className="list">
            {places.map((p, i) => (
              <li key={`${p.name}-${i}`}>
                <strong>{p.name}</strong>
                <div className="muted">
                  {p.type} · {p.distanceKm.toFixed(1)} km
                  {p.openNow ? " · open now" : ""}
                </div>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </article>
  );
}
