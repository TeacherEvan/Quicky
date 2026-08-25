"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "system" | "light" | "dark";
export type Language = "en" | "th";
export type Units = "C" | "F";

interface Settings {
  themeMode: ThemeMode;
  language: Language;
  units: Units;
}

interface SettingsContextValue extends Settings {
  setThemeMode: (m: ThemeMode) => void;
  setLanguage: (l: Language) => void;
  setUnits: (u: Units) => void;
}

const DEFAULTS: Settings = {
  themeMode: "system",
  language: "en",
  units: "C",
};

const STORAGE_KEY = "quicky.settings.v1";

const SettingsContext = createContext<SettingsContextValue | null>(null);

function applyTheme(themeMode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (themeMode === "dark") {
    root.style.colorScheme = "dark";
  } else if (themeMode === "light") {
    root.style.colorScheme = "light";
  } else {
    root.style.colorScheme = "";
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Settings>;
        setSettings({ ...DEFAULTS, ...parsed });
      }
    } catch {
      // ignore parse errors, fall back to defaults
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    applyTheme(settings.themeMode);
  }, [settings.themeMode]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // localStorage may be unavailable in private mode; fail silently
    }
  }, [settings, hydrated]);

  const setThemeMode = useCallback((themeMode: ThemeMode) => {
    setSettings((s) => ({ ...s, themeMode }));
  }, []);
  const setLanguage = useCallback((language: Language) => {
    setSettings((s) => ({ ...s, language }));
  }, []);
  const setUnits = useCallback((units: Units) => {
    setSettings((s) => ({ ...s, units }));
  }, []);

  const value = useMemo(
    () => ({ ...settings, setThemeMode, setLanguage, setUnits }),
    [settings, setThemeMode, setLanguage, setUnits],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }
  return ctx;
}
