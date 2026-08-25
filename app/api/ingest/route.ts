import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOG_DIR = path.join(process.cwd(), ".logs");
const LOG_FILE = path.join(LOG_DIR, "ingest.log");

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;

interface RateEntry {
  hits: number[];
}

const rateMap: Map<string, RateEntry> =
  (globalThis as unknown as { __ingestRateMap?: Map<string, RateEntry> })
    .__ingestRateMap ??
  new Map<string, RateEntry>();
(
  globalThis as unknown as { __ingestRateMap?: Map<string, RateEntry> }
).__ingestRateMap = rateMap;

function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(key) ?? { hits: [] };
  const recent = entry.hits.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    rateMap.set(key, { hits: recent });
    return true;
  }
  recent.push(now);
  rateMap.set(key, { hits: recent });
  return false;
}

async function ensureLogDir(): Promise<void> {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
  } catch (e) {
    console.error("[ingest] mkdir failed", e);
  }
}

async function appendLine(line: string): Promise<void> {
  try {
    await ensureLogDir();
    await fs.appendFile(LOG_FILE, line + "\n", "utf8");
  } catch (e) {
    console.error("[ingest] append failed", e);
  }
}

interface IngestBody {
  kind?: unknown;
  message?: unknown;
  stack?: unknown;
  context?: unknown;
  ts?: unknown;
  ua?: unknown;
  url?: unknown;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export async function POST(req: Request): Promise<NextResponse> {
  const key = clientKey(req);
  if (isRateLimited(key)) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429 },
    );
  }

  let body: IngestBody;
  try {
    body = (await req.json()) as IngestBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  if (!isPlainObject(body)) {
    return NextResponse.json(
      { ok: false, error: "invalid_body" },
      { status: 400 },
    );
  }

  const message = body.message;
  if (typeof message !== "string" || message.length === 0) {
    return NextResponse.json(
      { ok: false, error: "missing_message" },
      { status: 400 },
    );
  }

  const kind =
    body.kind === "error" || body.kind === "rejection" || body.kind === "info"
      ? body.kind
      : "error";

  const safeContext = isPlainObject(body.context)
    ? (body.context as Record<string, unknown>)
    : undefined;

  const record: Record<string, unknown> = {
    kind,
    message,
    ts: typeof body.ts === "number" ? body.ts : Date.now(),
    ua: typeof body.ua === "string" ? body.ua : "",
    url: typeof body.url === "string" ? body.url : "",
    server_ts: Date.now(),
    ip: key,
  };
  if (typeof body.stack === "string" && body.stack.length > 0) {
    record.stack = body.stack;
  }
  if (safeContext) record.context = safeContext;

  // Fire-and-forget: don't block the response on disk I/O.
  void appendLine(JSON.stringify(record));

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function GET(): Promise<NextResponse> {
  // Plain GET on /api/ingest is not a write; tell callers to POST.
  // The /api/ingest/health endpoint is a separate route file.
  return NextResponse.json(
    { ok: false, error: "method_not_allowed" },
    { status: 405 },
  );
}
