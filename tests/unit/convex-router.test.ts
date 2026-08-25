/**
 * convex/http.ts — module load + route registration.
 *
 * This file is mostly a Convex bundler-side effect (it registers the
 * routes on httpRouter when the bundler loads it). At runtime in a
 * regular Node test process, the only thing we can assert is that the
 * file imports cleanly and the default export is an httpRouter-shaped
 * object.
 */
import { describe, expect, it } from "vitest";

describe("convex/http module load", () => {
  it("imports without throwing and exports an httpRouter-shaped default", async () => {
    const mod = await import("@/convex/http");
    const def = mod.default as unknown;
    expect(def).toBeTruthy();
    expect((def as { isRouter?: boolean }).isRouter).toBe(true);
    // exactRoutes / prefixRoutes are internal Maps we don't reach into,
    // but the function-shaped object should expose the route() method.
    expect(typeof (def as { route?: unknown }).route).toBe("function");
  });
});
