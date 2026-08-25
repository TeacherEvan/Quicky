/**
 * lib/perf.ts — usePrefetch hook.
 *
 * Renders the hook in jsdom, asserts the router.prefetch is called for
 * each non-empty href once on mount, and that the cleanup callback
 * cancels the scheduled idle work.
 */
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePrefetch } from "@/lib/perf";

let prefetchMock: ReturnType<typeof vi.fn>;

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: (...args: unknown[]) => prefetchMock(...args),
  }),
}));

function Harness({ hrefs }: { hrefs: ReadonlyArray<string> }) {
  usePrefetch(hrefs);
  return null;
}

describe("usePrefetch", () => {
  beforeEach(() => {
    prefetchMock = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does nothing when hrefs is empty", () => {
    render(<Harness hrefs={[]} />);
    expect(prefetchMock).not.toHaveBeenCalled();
  });

  it("prefetch-es each non-empty href on mount (timeout path)", async () => {
    // No requestIdleCallback in jsdom, so the setTimeout branch fires.
    render(<Harness hrefs={["/a", "/b", "/c"]} />);
    // The setTimeout is 200ms — fast-forward the world clock.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 250));
    });
    expect(prefetchMock).toHaveBeenCalledTimes(3);
    expect(prefetchMock).toHaveBeenCalledWith("/a");
    expect(prefetchMock).toHaveBeenCalledWith("/b");
    expect(prefetchMock).toHaveBeenCalledWith("/c");
  });

  it("skips empty-string hrefs", async () => {
    render(<Harness hrefs={["/a", "", "/b"]} />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 250));
    });
    expect(prefetchMock).toHaveBeenCalledTimes(2);
  });

  it("uses requestIdleCallback when available and cancels on unmount", async () => {
    const idle = vi.fn((_cb: () => void) => 42);
    const cancel = vi.fn((_id: number) => {});
    Object.defineProperty(window, "requestIdleCallback", {
      value: idle,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, "cancelIdleCallback", {
      value: cancel,
      configurable: true,
      writable: true,
    });
    const { unmount } = render(<Harness hrefs={["/a"]} />);
    expect(idle).toHaveBeenCalledTimes(1);
    unmount();
    expect(cancel).toHaveBeenCalledWith(42);
    // Cleanup: restore jsdom defaults.
    delete (window as unknown as { requestIdleCallback?: unknown })
      .requestIdleCallback;
    delete (window as unknown as { cancelIdleCallback?: unknown })
      .cancelIdleCallback;
  });
});
