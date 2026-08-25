/**
 * Typed helpers for classifying errors thrown by the data layer.
 *
 * The network layer (`lib/convex.ts`, `lib/translate.ts`) throws `ConvexError`
 * and `TranslateError` with a `status` field. The browser also surfaces raw
 * `TypeError: Failed to fetch` for network failures. This module centralises
 * the rules that turn an arbitrary thrown value into a user-facing message
 * + retry decision that the UI can act on.
 */

export interface ApiErrorShape {
  name?: string;
  status?: number;
  message?: string;
}

export function isApiError(e: unknown): e is ApiErrorShape {
  return e instanceof Error;
}

export function getStatus(e: unknown): number | null {
  if (e instanceof Error) {
    const s = (e as ApiErrorShape).status;
    if (typeof s === "number") return s;
  }
  return null;
}

export type ErrorKind = "offline" | "network" | "server" | "client" | "unknown";

export function classify(e: unknown, isOnline: boolean): ErrorKind {
  const status = getStatus(e);
  if (!isOnline) return "offline";
  if (status === 0) return "offline";
  if (e instanceof TypeError) return "network";
  if (status !== null) {
    if (status >= 500) return "server";
    if (status >= 400) return "client";
  }
  return "unknown";
}

export function userMessage(e: unknown, isOnline: boolean): string {
  const kind = classify(e, isOnline);
  if (kind === "offline") {
    return "Service is offline. Try again when you're back online.";
  }
  if (kind === "network") {
    return "Couldn't reach the server. Check your connection.";
  }
  if (e instanceof Error) return e.message;
  return String(e);
}

export function isAbort(e: unknown): boolean {
  return e instanceof Error && e.name === "AbortError";
}
