/**
 * lib/cn.ts — className combinator.
 */
import { describe, expect, it } from "vitest";
import { cn } from "@/lib/cn";

describe("cn", () => {
  it("joins truthy string inputs with a space", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("drops falsy values (null, false, undefined, 0, empty string)", () => {
    expect(cn("a", null, false, undefined, 0, "")).toBe("a");
  });

  it("coerces numbers to strings", () => {
    expect(cn("w-", 12)).toBe("w- 12");
  });

  it("expands records with truthy values", () => {
    expect(cn({ a: true, b: false, c: true })).toBe("a c");
  });

  it("combines strings, conditionals, and records", () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn("base", isActive && "active", { disabled: isDisabled, primary: true })).toBe(
      "base active primary",
    );
  });
});
