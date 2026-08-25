/**
 * Convex HTTP access log.
 *
 * Each call to `appendAccessLog` writes one JSON line to stdout. Convex
 * HTTP actions run in the V8 isolate, so there is no `node:fs` to write
 * a file — the function log stream IS the access log. The shape and
 * privacy guarantees are identical to the previous file-based design.
 *
 * Format (one JSON object per line):
 *   { ts: number, ip: string, endpoint: string, status: number, ms: number }
 *
 * - `ts`     — epoch milliseconds at end of handler
 * - `ip`     — request IP from `x-forwarded-for` (or "unknown")
 * - `endpoint` — short endpoint name (`weather` | `places` | `geocode`)
 * - `status` — HTTP status code returned to the caller
 * - `ms`     — wall-clock handler duration in milliseconds
 *
 * No request params are logged. PII beyond the client IP is intentionally
 * omitted.
 */

export interface AccessLogEntry {
  ts: number;
  ip: string;
  endpoint: string;
  status: number;
  ms: number;
}

export function appendAccessLog(entry: AccessLogEntry): void {
  console.log(JSON.stringify(entry));
}
