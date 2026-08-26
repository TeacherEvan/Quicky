"use client";

import { useEffect, useRef, useState } from "react";
import { translateToThai } from "@/lib/translate";
import { useT } from "@/lib/i18n";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Loading } from "@/components/Loading";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/Button";

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
  const [progressPct, setProgressPct] = useState<number>(0);
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
    setProgressPct(0);
    try {
      const Tesseract = (await import("tesseract.js")).default;
      setProgress(t("tile.cost.progress.ocr"));
      const { data } = await Tesseract.recognize(f, "eng", {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setProgressPct(Math.round(m.progress * 100));
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
      setProgressPct(50);
      const match = lookupPhrasebook(raw);
      if (match) {
        setResult({ raw, thai: match.thai, match: 1 });
        setProgressPct(100);
      } else {
        try {
          const tr = await translateToThai(raw);
          setResult({ raw, thai: tr.translatedText, match: tr.match / 100 });
          setProgressPct(100);
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
    setProgressPct(0);
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.click();
  }

  function copyToClipboard(str: string) {
    if (navigator.clipboard && window.isSecureContext) {
      (navigator.clipboard as unknown as { writeString: (s: string) => Promise<void> }).writeString(str);
    } else {
      const ta = document.createElement("textarea");
      ta.value = str;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  }

  return (
    <article className="page">
      <Breadcrumb
        items={[
          { label: t("app.nav.dashboard"), href: "/" },
          { label: t("tile.cost.title") },
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
            <Icon name="camera" size={24} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="page-header__title">{t("tile.cost.title")}</h1>
            <p className="page-header__lede">{t("tile.cost.intro")}</p>
          </div>
        </div>
      </header>

      <section className="section" aria-labelledby="cost-input">
        <div className="section-heading">
          <h2 id="cost-input">{t("tile.cost.pickPhoto")}</h2>
        </div>
        <div className="field">
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
      </section>

      <div className="mt-3" role="status" aria-live="polite">
        {error ? (
          <ErrorState
            title={t("common.errorTitle")}
            detail={error}
            onRetry={pickAgain}
          />
        ) : running ? (
          <div className="cost-progress">
            <div className="cost-progress__head">
              <span className="cost-progress__label">{progress}</span>
              <span className="cost-progress__pct">{progressPct}%</span>
            </div>
            <div className="cost-progress__bar">
              <span style={{ width: `${progressPct}%` }} />
            </div>
            <Loading size="md" label={progress} />
          </div>
        ) : null}
      </div>

      {text && !error ? (
        <section className="cost-compare" aria-labelledby="cost-raw">
          <div className="cost-compare__col">
            <div className="cost-compare__label">{t("tile.cost.recognisedHeading")}</div>
            <pre className="cost-compare__text">{text}</pre>
          </div>
          {result ? (
            <div className="cost-compare__col">
              <div className="cost-compare__label">{t("tile.cost.thaiHeading")}</div>
              <p className="cost-compare__text cost-compare__text--thai" lang="th">
                {result.thai}
              </p>
              <div className="row-tight" style={{ marginTop: "var(--s-2)" }}>
                <span className="muted">
                  {t("tile.cost.confidence")}: {Math.round(result.match * 100)}%
                </span>
                <span className="spacer" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(result.thai)}
                  iconName="copy"
                  aria-label={t("tile.cost.copyThai")}
                >
                  {t("tile.cost.copy")}
                </Button>
              </div>
            </div>
          ) : null}
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