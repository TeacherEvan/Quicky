"use client";

import { useEffect, useState } from "react";
import { translateToThai } from "@/lib/translate";

interface RecognizedText {
  raw: string;
  thai: string;
  match: number;
}

const PHRASEBOOK: ReadonlyArray<{
  category: RegExp;
  thai: string;
  romanization: string;
}> = [
  {
    category: /\b(water|coffee|tea|drink)\b/i,
    thai: "ขอน้ำดื่มหน่อยครับ/ค่ะ",
    romanization: "khor naam deum noi khrap/kha",
  },
  {
    category: /\b(bill|check|how much)\b/i,
    thai: "ค่าเท่าไหร่ครับ/คะ?",
    romanization: "khaa thao rai khrap/kha?",
  },
  {
    category: /\b(toilet|restroom|bathroom)\b/i,
    thai: "ห้องน้ำอยู่ที่ไหนครับ/คะ?",
    romanization: "hong nam yoo tee nai khrap/kha?",
  },
  {
    category: /\b(taxi|tuk|bolt|grab|ride)\b/i,
    thai: "ไปที่นี่ครับ/คะ",
    romanization: "pai tee nee khrap/kha",
  },
  {
    category: /\b(menu|order|food|rice|noodle)\b/i,
    thai: "ขอสั่งอาหารหน่อยครับ/ค่ะ",
    romanization: "khor sang ahan noi khrap/kha",
  },
  {
    category: /\b(price|total)\b/i,
    thai: "ราคาเท่าไหร่ครับ/คะ?",
    romanization: "rakaa thao rai khrap/kha?",
  },
  {
    category: /\b(hotel|room|bed)\b/i,
    thai: "ขอเช็คอินหน่อยครับ/ค่ะ",
    romanization: "khor check-in noi khrap/kha",
  },
];

function lookupPhrasebook(text: string): { thai: string; romanization: string } | null {
  for (const entry of PHRASEBOOK) {
    if (entry.category.test(text)) {
      return { thai: entry.thai, romanization: entry.romanization };
    }
  }
  return null;
}

export default function CostPage() {
  const [text, setText] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [result, setResult] = useState<RecognizedText | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    setProgress("Loading OCR engine…");
    try {
      const Tesseract = (await import("tesseract.js")).default;
      setProgress("Recognising text…");
      const { data } = await Tesseract.recognize(f, "eng", {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setProgress(`Recognising text… ${Math.round(m.progress * 100)}%`);
          }
        },
      });
      const raw = data.text.trim();
      if (!raw) {
        setError(
          "OCR returned no text. Try a clearer, well-lit photo of printed text.",
        );
        return;
      }
      setText(raw);
      setProgress("Translating…");
      const match = lookupPhrasebook(raw);
      if (match) {
        setResult({ raw, thai: match.thai, match: 1 });
      } else {
        try {
          const t = await translateToThai(raw);
          setResult({ raw, thai: t.translatedText, match: t.match / 100 });
        } catch (e: unknown) {
          setError(
            e instanceof Error
              ? `Translation failed: ${e.message}`
              : "Translation failed.",
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

  return (
    <article>
      <h2>Cost translator</h2>
      <p className="muted">
        Take a photo of any price tag or menu. Text is recognised in your
        browser with Tesseract.js (no upload, no API key), then translated
        to Thai via MyMemory. No mocks.
      </p>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onPick}
        aria-label="Pick a photo"
        disabled={running}
      />
      {error ? <p className="error">{error}</p> : null}
      {running ? <p className="muted">{progress}</p> : null}
      {text ? (
        <section>
          <h3>Recognised text</h3>
          <p className="card" style={{ whiteSpace: "pre-wrap" }}>
            {text}
          </p>
        </section>
      ) : null}
      {result ? (
        <section>
          <h3>Thai</h3>
          <p className="thai">{result.thai}</p>
          <p className="muted">
            Match confidence: {Math.round(result.match * 100)}%
          </p>
        </section>
      ) : null}
    </article>
  );
}
