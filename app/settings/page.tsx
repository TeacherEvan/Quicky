"use client";

import { useSettings } from "@/lib/settings";

export default function SettingsPage() {
  const { themeMode, setThemeMode, language, setLanguage, units, setUnits } =
    useSettings();
  return (
    <article>
      <h2>Settings</h2>
      <section className="card">
        <h3>Appearance</h3>
        <p>
          <label>
            Theme:&nbsp;
            <select
              value={themeMode}
              onChange={(e) =>
                setThemeMode(e.target.value as "system" | "light" | "dark")
              }
            >
              <option value="system">Match system</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </p>
        <p>
          <label>
            Language:&nbsp;
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "th")}
            >
              <option value="en">English</option>
              <option value="th">ไทย (Thai) — labels coming soon</option>
            </select>
          </label>
        </p>
      </section>
      <section className="card">
        <h3>Weather</h3>
        <p>
          <label>
            Units:&nbsp;
            <select
              value={units}
              onChange={(e) => setUnits(e.target.value as "C" | "F")}
            >
              <option value="C">Celsius</option>
              <option value="F">Fahrenheit</option>
            </select>
          </label>
        </p>
      </section>
      <section className="card">
        <h3>About</h3>
        <p className="muted">
          Quicky is a pure Next.js webapp. Weather, places, and reverse
          geocoding are live from Open-Meteo, OpenStreetMap Overpass, and
          Nominatim via the Convex backend. The Cost translator runs OCR in
          your browser and translates via MyMemory. No mocks, no sample
          data.
        </p>
      </section>
    </article>
  );
}
