"use client";

import { useRef, useState } from "react";
import { getReverse } from "@/lib/convex";
import { useT } from "@/lib/i18n";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Loading } from "@/components/Loading";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";

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
  const t = useT();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
        setError(t("tile.location.noExif"));
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

  function pickAgain() {
    setError(null);
    setLabel(null);
    setCoords(null);
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.click();
  }

  return (
    <article>
      <Breadcrumb
        items={[
          { label: t("app.nav.dashboard"), href: "/" },
          { label: t("tile.location.title") },
        ]}
      />
      <header className="row" style={{ marginBottom: "var(--space-2)" }}>
        <Icon name="pin" size={28} aria-hidden />
        <h1 style={{ margin: 0 }}>{t("tile.location.title")}</h1>
      </header>
      <p className="muted">{t("tile.location.intro")}</p>

      <div className="field mt-3">
        <label className="field-label" htmlFor="location-photo">
          {t("tile.location.pickPhoto")}
        </label>
        <input
          ref={inputRef}
          id="location-photo"
          type="file"
          accept="image/*"
          onChange={onPick}
          aria-describedby="location-help"
        />
        <span id="location-help" className="field-hint sr-only">
          {t("tile.location.intro")}
        </span>
      </div>

      <div className="mt-4" role="status" aria-live="polite">
        {error ? (
          <ErrorState
            title={t("common.errorTitle")}
            detail={error}
            onRetry={pickAgain}
          />
        ) : loading ? (
          <Loading size="lg" label={t("tile.location.reading")} />
        ) : null}
      </div>

      {preview ? (
        <p>
          <img
            src={preview}
            alt={file ? t("tile.location.previewAlt") : t("tile.location.previewAlt")}
            className="preview-img"
          />
        </p>
      ) : null}

      {coords && label ? (
        <section className="card mt-3" aria-labelledby="location-result">
          <h2 id="location-result" style={{ margin: 0 }}>{label}</h2>
          <p className="muted" style={{ margin: "var(--space-2) 0 0" }}>
            {t("tile.location.coords")}: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </p>
        </section>
      ) : null}

      {!preview && !loading && !error ? (
        <EmptyState
          className="mt-4"
          iconName="camera"
          title={t("tile.location.pickPhoto")}
          body={t("tile.location.intro")}
        />
      ) : null}
    </article>
  );
}
