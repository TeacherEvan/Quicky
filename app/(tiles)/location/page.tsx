"use client";

import { useRef, useState } from "react";
import { getReverse } from "@/lib/convex";
import { useT } from "@/lib/i18n";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/Button";
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
    <article className="page">
      <Breadcrumb
        items={[
          { label: t("app.nav.dashboard"), href: "/" },
          { label: t("tile.location.title") },
        ]}
      />

      <header className="page-header">
        <div className="page-header__top">
          <span
            className="page-header__icon"
            style={{
              background: "var(--cat-photo-bg)",
              border: "1px solid var(--cat-photo-border)",
              color: "var(--cat-photo-ink)",
            }}
            aria-hidden="true"
          >
            <Icon name="pin" size={24} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="page-header__title">{t("tile.location.title")}</h1>
            <p className="page-header__lede">{t("tile.location.intro")}</p>
          </div>
        </div>
      </header>

      <section className="section" aria-labelledby="location-input">
        <div className="section-heading">
          <h2 id="location-input">{t("tile.location.pickPhoto")}</h2>
        </div>
        <div className="field">
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
            disabled={loading}
          />
          <span id="location-help" className="field-hint">
            {t("tile.location.intro")}
          </span>
        </div>
      </section>

      <div className="mt-3" role="status" aria-live="polite">
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
        <figure style={{ margin: "var(--s-4) 0 0" }}>
          <img
            src={preview}
            alt={t("tile.location.previewAlt")}
            className="preview-img"
          />
          <figcaption className="muted" style={{ marginTop: "var(--s-2)", fontSize: "var(--fs-xs)" }}>
            {file?.name} · {Math.round((file?.size ?? 0) / 1024)} KB
          </figcaption>
        </figure>
      ) : null}

      {coords && label ? (
        <section className="card-elevated mt-4" aria-labelledby="location-result">
          <div className="row" style={{ gap: "var(--s-4)", alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 id="location-result" style={{ margin: 0, fontSize: "var(--fs-xl)" }}>
                {label}
              </h2>
              <p className="muted tabular" style={{ marginTop: "var(--s-2)" }}>
                {t("tile.location.coords")}: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
              </p>
              <p className="muted" style={{ marginTop: "var(--s-2)" }}>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=16/${coords.lat}/${coords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("tile.location.openInOsm")}
                >
                  <Icon name="globe" size={14} aria-hidden />
                  {t("tile.location.openInOsm")}
                </a>
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={pickAgain}
              iconName="refresh"
              className="btn-sm"
              style={{ flex: "none" }}
            >
              {t("common.retry")}
            </Button>
          </div>
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