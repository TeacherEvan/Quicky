"use client";

import { useEffect, useRef, useState } from "react";
import { translateToThai } from "@/lib/translate";
import { useT } from "@/lib/i18n";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Loading } from "@/components/Loading";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";

interface RecognizedText {
  raw: string;
  thai: string;
  match: number;
}

const PHRASEBOOK: ReadonlyArray<{
  category: RegExp;
  thai: string;
}> = [
  {
    category: /\b(water|coffee|tea|drink)\b/i,
    thai: "ขอน้ำดื่มหน่อยครับ/ค่ะ",
  },
  {
    category: /\b(bill|check|how much)\b/i,
    thai: "ค่าเท่าไหร่ครับ/คะ?",
  },
  {
    category: /\b(toilet|restroom|bathroom)\b/i,
    thai: "ห้องน้ำอยู่ที่ไหนครับ/คะ?",
  },
  {
    category: /\b(taxi|tuk|bolt|grab|ride)\b/i,
    thai: "ไปที่นี่ครับ/คะ",
  },
  {
    category: /\b(menu|order|food|rice|noodle)\b/i,
    thai: "ขอสั่งอาหารหน่อยครับ/ค่ะ",
  },
  {
    category: /\b(price|total)\b/i,
    thai: "ราคาเท่าไหร่ครับ/คะ?",
  },
  {
    category: /\b(hotel|room|bed)\b/i,
    thai: "ขอเช็คอินหน่อยครับ/ค่ะ",
  },
];

function lookupPhrasebook(text: string): { thai: string } | null {
  for (const entry of PHRASEBOOK) {
    if (entry.category.test(text)) {
      return { thai: entry.thai };
    }
  }
  return null;
}

export default function CostPage() {
  const t = useT();
  const [text, setText] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [result, setResult] = useState<RecognizedText | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      // tesseract.js workers are torn down with the page; no explicit cleanup.
    };
  }, []);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);
    setResult(null);
    setText("");
    setRunning(true);
    setProgress(t("tile.cost.progress.loadOcr"));
    try {
      const Tesseract = (await import("tesseract.js")).default;
      setProgress(t("tile.cost.progress.ocr"));
      const { data } = await Tesseract.recognize(f, "eng", {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setProgress(`${t("tile.cost.progress.ocr")} ${Math.round(m.progress * 100)}%`);
          }
        },
      });
      const raw = data.text.trim();
      if (!raw) {
        setError(t("tile.cost.error.emptyOcr"));
        return;
      }
      setText(raw);
      setProgress(t("tile.cost.progress.translate"));
      const match = lookupPhrasebook(raw);
      if (match) {
        setResult({ raw, thai: match.thai, match: 1 });
      } else {
        try {
          const tr = await translateToThai(raw);
          setResult({ raw, thai: tr.translatedText, match: tr.match / 100 });
        } catch (e: unknown) {
          setError(
            e instanceof Error
              ? `${t("tile.cost.error.translate")}: ${e.message}`
              : t("tile.cost.error.translate"),
          );
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
      setProgress("");
    }
  }

  function pickAgain() {
    setError(null);
    setResult(null);
    setText("");
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.click();
  }

  return (
    <article>
      <Breadcrumb
        items={[
          { label: t("app.nav.dashboard"), href: "/" },
          { label: t("tile.cost.title") },
        ]}
      />
      <header className="row" style={{ marginBottom: "var(--space-2)" }}>
        <Icon name="counter" size={28} aria-hidden />
        <h1 style={{ margin: 0 }}>{t("tile.cost.title")}</h1>
      </header>
      <p className="muted">{t("tile.cost.intro")}</p>

      <div className="field mt-3">
        <label className="field-label" htmlFor="cost-photo">
          {t("tile.cost.pickPhoto")}
        </label>
        <input
          ref={inputRef}
          id="cost-photo"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onPick}
          disabled={running}
        />
      </div>

      <div className="mt-4" role="status" aria-live="polite">
        {error ? (
          <ErrorState
            title={t("common.errorTitle")}
            detail={error}
            onRetry={pickAgain}
          />
        ) : running ? (
          <Loading size="lg" label={progress || t("tile.cost.running")} />
        ) : null}
      </div>

      {text && !error ? (
        <section className="mt-3" aria-labelledby="cost-raw">
          <h2 id="cost-raw">{t("tile.cost.recognisedHeading")}</h2>
          <p className="card" style={{ whiteSpace: "pre-wrap" }}>
            {text}
          </p>
        </section>
      ) : null}

      {result ? (
        <section className="mt-3" aria-labelledby="cost-thai">
          <h2 id="cost-thai">{t("tile.cost.thaiHeading")}</h2>
          <p
            className="thai-phrase"
            lang="th"
            aria-label={t("tile.cost.thaiLabel")}
          >
            {result.thai}
          </p>
          <p className="muted" aria-live="polite">
            {t("tile.cost.confidence")}: {Math.round(result.match * 100)}%
          </p>
        </section>
      ) : null}

      {!running && !error && !text ? (
        <EmptyState
          className="mt-4"
          iconName="camera"
          title={t("tile.cost.pickPhoto")}
          body={t("tile.cost.intro")}
        />
      ) : null}
    </article>
  );
}
