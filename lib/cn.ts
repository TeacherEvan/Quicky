/**
 * Tiny className combinator. Accepts strings, numbers, falsy values and
 * records of { className: condition }.
 *
 *   cn("a", cond && "b", { c: x, d: y }) // "a b c" or "a b d"
 */
export type ClassValue =
  | string
  | number
  | null
  | false
  | undefined
  | Record<string, boolean | null | undefined>;

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const v of inputs) {
    if (!v) continue;
    if (typeof v === "string" || typeof v === "number") {
      out.push(String(v));
    } else if (typeof v === "object") {
      for (const key of Object.keys(v)) {
        if (v[key]) out.push(key);
      }
    }
  }
  return out.join(" ");
}
