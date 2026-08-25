/**
 * Vitest setup: shared mocks, browser shims, and a clean localStorage per
 * test. Runs before every test file in the unit suite.
 */
import { afterEach, beforeEach, vi } from "vitest";

// --- convex/server: stub out httpRouter() so we can import the Convex
// handler modules in isolation. The handlers in convex/{weather,places,
// geocode}.ts share a circular import with convex/http.ts, which calls
// `httpRouter().route({handler, ...})` at module-load time. With the real
// httpRouter, that route() call validates the handler and throws
// "route requires handler" before our tests get a chance to mock the
// handler. Stubbing httpRouter with a no-op route() keeps the side effect
// inert while preserving the real httpAction() decorator (and every other
// export) so handler functions keep their proper `isHttp: true` shape.
vi.mock("convex/server", async () => {
  const real = await vi.importActual<typeof import("convex/server")>(
    "convex/server",
  );
  return {
    ...real,
    httpRouter: () => ({
      route: () => {},
      isRouter: true,
      exactRoutes: new Map(),
      prefixRoutes: new Map(),
    }),
  };
});

// --- next/navigation & next/link: keep unit tests DOM-local -----------------
// Component tests render React nodes in jsdom; we don't want Link to try to
// be a real client-side router. A no-op <a> is enough.
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string | { pathname?: string };
    children?: unknown;
  }) => {
    const target = typeof href === "string" ? href : (href?.pathname ?? "#");
    return { type: "a", props: { href: target, ...rest, children } } as unknown;
  },
}));

// --- next/image: just render an <img> ---------------------------------------
vi.mock("next/image", () => ({
  default: ({ src, alt, ...rest }: { src: string; alt: string }) =>
    ({
      type: "img",
      props: { src, alt, ...rest },
    }) as unknown,
}));

// --- next/navigation for app router ----------------------------------------
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// --- Reset fetch + localStorage between tests ------------------------------
beforeEach(() => {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.clear();
  }
  if (typeof document !== "undefined" && document.documentElement) {
    document.documentElement.style.colorScheme = "";
  }
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// --- AbortController shim guard: jsdom ships it natively, but stub if absent -
if (typeof globalThis.AbortController === "undefined") {
  // @ts-expect-error - minimal stub for environments without AbortController
  globalThis.AbortController = class {
    signal = { aborted: false, addEventListener: () => {}, removeEventListener: () => {} };
    abort() {
      this.signal.aborted = true;
    }
  };
}
