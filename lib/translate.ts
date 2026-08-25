/**
 * Free, no-key translation via MyMemory. 5000 chars/day anonymous quota.
 * For production, set NEXT_PUBLIC_TRANSLATE_EMAIL in .env.local to lift
 * the quota (MyMemory uses the email as a polite identifier; the email
 * is not shared with third parties).
 */

const MYMEMORY = "https://api.mymemory.translated.net/get";

export interface Translation {
  translatedText: string;
  match: number;
}

export class TranslateError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "TranslateError";
    this.status = status;
  }
}

export async function translateToThai(
  text: string,
  signal?: AbortSignal,
): Promise<Translation> {
  const cleaned = text.trim();
  if (cleaned === "") {
    throw new TranslateError("Empty input", 0);
  }
  const email = process.env.NEXT_PUBLIC_TRANSLATE_EMAIL;
  const params = new URLSearchParams({ q: cleaned, langpair: "en|th" });
  if (email) params.set("de", email);

  const res = await fetch(`${MYMEMORY}?${params.toString()}`, {
    signal,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new TranslateError(
      `MyMemory ${res.status}: ${res.statusText}`,
      res.status,
    );
  }
  const data = (await res.json()) as {
    responseData?: { translatedText?: string; match?: number };
    responseStatus?: number;
  };
  const translated = data.responseData?.translatedText?.trim();
  if (!translated) {
    throw new TranslateError(
      `MyMemory returned no translation (status ${data.responseStatus ?? "?"})`,
      502,
    );
  }
  return {
    translatedText: translated,
    match: data.responseData?.match ?? 0,
  };
}
