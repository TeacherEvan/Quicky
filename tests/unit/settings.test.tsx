/**
 * lib/settings.tsx — SettingsProvider + useSettings.
 *
 * Renders the provider in jsdom and asserts:
 *  - default values are exposed via context
 *  - changing themeMode writes to localStorage after hydration
 *  - changing units persists across remount (unmount + re-render)
 */
import { act, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SettingsProvider, useSettings } from "@/lib/settings";

function ReadPanel() {
  const { themeMode, language, units, setThemeMode, setLanguage, setUnits } =
    useSettings();
  return (
    <div>
      <span data-testid="theme">{themeMode}</span>
      <span data-testid="language">{language}</span>
      <span data-testid="units">{units}</span>
      <button onClick={() => setThemeMode("dark")}>to-dark</button>
      <button onClick={() => setLanguage("th")}>to-th</button>
      <button onClick={() => setUnits("F")}>to-F</button>
    </div>
  );
}

describe("SettingsProvider", () => {
  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.style.colorScheme = "";
  });

  it("exposes defaults before hydration", () => {
    render(
      <SettingsProvider>
        <ReadPanel />
      </SettingsProvider>,
    );
    expect(screen.getByTestId("theme").textContent).toBe("system");
    expect(screen.getByTestId("language").textContent).toBe("en");
    expect(screen.getByTestId("units").textContent).toBe("C");
  });

  it("persists theme/units/language to localStorage after change", () => {
    render(
      <SettingsProvider>
        <ReadPanel />
      </SettingsProvider>,
    );
    act(() => {
      screen.getByText("to-dark").click();
      screen.getByText("to-th").click();
      screen.getByText("to-F").click();
    });
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(screen.getByTestId("language").textContent).toBe("th");
    expect(screen.getByTestId("units").textContent).toBe("F");
    const raw = window.localStorage.getItem("quicky.settings.v1");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string);
    expect(parsed).toEqual({ themeMode: "dark", language: "th", units: "F" });
  });

  it("applies dark theme to <html> via colorScheme", () => {
    render(
      <SettingsProvider>
        <ReadPanel />
      </SettingsProvider>,
    );
    act(() => {
      screen.getByText("to-dark").click();
    });
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("persists units across remount", () => {
    const { unmount } = render(
      <SettingsProvider>
        <ReadPanel />
      </SettingsProvider>,
    );
    act(() => {
      screen.getByText("to-F").click();
    });
    unmount();
    render(
      <SettingsProvider>
        <ReadPanel />
      </SettingsProvider>,
    );
    expect(screen.getByTestId("units").textContent).toBe("F");
  });

  it("ignores malformed localStorage and falls back to defaults", () => {
    window.localStorage.setItem("quicky.settings.v1", "{not json");
    render(
      <SettingsProvider>
        <ReadPanel />
      </SettingsProvider>,
    );
    expect(screen.getByTestId("theme").textContent).toBe("system");
    expect(screen.getByTestId("units").textContent).toBe("C");
  });

  it("useSettings throws outside of a provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ReadPanel />)).toThrow(/SettingsProvider/i);
    spy.mockRestore();
  });
});
