"use client";

import { useState } from "react";
import { getReverse } from "@/lib/convex";

interface ExifGps {
  latitude: number;
  longitude: number;
}

async function readExif(file: File): Promise<ExifGps | null> {
  const exifr = (await import("exifr")).default;
  const data = await exifr.gps(file).catch(() => null);
  if (!data || typeof data.latitude !== "number" || typeof data.longitude !== "number") {
    return null;
  }
  return { latitude: data.latitude, longitude: data.longitude };
}

export default function LocationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);
    setLabel(null);
    setCoords(null);
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    setLoading(true);
    try {
      const gps = await readExif(f);
      if (!gps) {
        setError(
          "No GPS data in this image. Enable location on your camera, or pick another photo.",
        );
        return;
      }
      const c = {
        lat: Number(gps.latitude.toFixed(6)),
        lng: Number(gps.longitude.toFixed(6)),
      };
      setCoords(c);
      const r = await getReverse(c.lat, c.lng);
      setLabel(r.label);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <article>
      <h2>Location</h2>
      <p className="muted">
        Upload a photo with GPS metadata. The real coordinates are sent to
        OpenStreetMap Nominatim via your Convex backend.
      </p>
      <input
        type="file"
        accept="image/*"
        onChange={onPick}
        aria-label="Pick a photo"
      />
      {error ? (
        <p className="error">{error}</p>
      ) : null}
      {loading ? <p className="muted">Reading EXIF + reverse-geocoding…</p> : null}
      {preview ? (
        <p>
          <img
            src={preview}
            alt={file ? `Selected: ${file.name}` : "Selected"}
            style={{ maxWidth: "100%", borderRadius: 8, marginTop: 12 }}
          />
        </p>
      ) : null}
      {coords && label ? (
        <section className="card">
          <p style={{ fontSize: 18, margin: 0 }}>{label}</p>
          <p className="muted">
            {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </p>
        </section>
      ) : null}
    </article>
  );
}
