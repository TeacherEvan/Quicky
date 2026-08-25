"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Prefetch a list of routes when the component mounts. Uses the browser's
 * idle callback so the prefetch work doesn't compete with the initial
 * paint; falls back to setTimeout in environments without
 * requestIdleCallback.
 *
 * The Next.js router deduplicates prefetch calls, so calling this on
 * every mount of the dashboard is cheap.
 */
export function usePrefetch(hrefs: ReadonlyArray<string>): void {
  const router = useRouter();

  useEffect(() => {
    if (!hrefs || hrefs.length === 0) return;

    const type =
      typeof window !== "undefined" &&
      typeof (window as Window & {
        requestIdleCallback?: (
          cb: () => void,
          opts?: { timeout: number },
        ) => number;
      }).requestIdleCallback === "function"
        ? "idle"
        : "timeout";

    const run = () => {
      for (const href of hrefs) {
        if (typeof href === "string" && href.length > 0) {
          router.prefetch(href);
        }
      }
    };

    let handle: number | undefined;
    if (type === "idle") {
      handle = (
        window as Window & {
          requestIdleCallback: (
            cb: () => void,
            opts?: { timeout: number },
          ) => number;
        }
      ).requestIdleCallback(run, { timeout: 1500 });
    } else {
      handle = window.setTimeout(run, 200);
    }

    return () => {
      if (handle !== undefined) {
        if (type === "idle") {
          (
            window as Window & {
              cancelIdleCallback?: (id: number) => void;
            }
          ).cancelIdleCallback?.(handle);
        } else {
          window.clearTimeout(handle);
        }
      }
    };
  }, [hrefs, router]);
}
