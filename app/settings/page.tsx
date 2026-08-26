"use client";

import { useSettings, type Language, type ThemeMode, type Units } from "@/lib/settings";
import { useT } from "@/lib/i18n";
import { Topbar } from "@/components/Topbar";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Icon } from "@/components/Icon";

export default function SettingsPage() {
  const { themeMode, setThemeMode, language, setLanguage, units, setUnits } =
    useSettings();
  const t = useT();

  return (
    <div className="app-shell">
      <Topbar />
      <main
        id="main-content"
        className="container"
        tabIndex={-1}
        aria-label={t("app.brandTagline")}
      >
        <Breadcrumb
          items={[
            { label: t("app.nav.dashboard"), href: "/" },
            { label: t("settings.title") },
          ]}
        />
        <h1 style={{ marginBottom: "var(--s-6)" }}>{t("settings.title")}</h1>

        <section className="section">
          <div className="section-heading">
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: "var(--r-sm)",
                background: "var(--brand-soft)",
                color: "var(--brand-strong)",
              }}
              aria-hidden="true"
            >
              <Icon name="info" size={18} />
            </span>
            <h2>{t("settings.appearance")}</h2>
          </div>
          <div className="card stack">
            <div className="field">
              <label className="field-label" htmlFor="settings-theme">
                {t("settings.theme")}
              </label>
              <div
                className="segmented"
                role="group"
                aria-label={t("settings.theme")}
              >
                <button
                  type="button"
                  className="segmented__btn"
                  aria-pressed={themeMode === "system"}
                  onClick={() => setThemeMode("system" as ThemeMode)}
                >
                  <Icon name="monitor" size={14} aria-hidden />
                  {t("settings.theme.system")}
                </button>
                <button
                  type="button"
                  className="segmented__btn"
                  aria-pressed={themeMode === "light"}
                  onClick={() => setThemeMode("light" as ThemeMode)}
                >
                  <Icon name="sun" size={14} aria-hidden />
                  {t("settings.theme.light")}
                </button>
                <button
                  type="button"
                  className="segmented__btn"
                  aria-pressed={themeMode === "dark"}
                  onClick={() => setThemeMode("dark" as ThemeMode)}
                >
                  <Icon name="moon" size={14} aria-hidden />
                  {t("settings.theme.dark")}
                </button>
              </div>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="settings-language">
                {t("settings.language")}
              </label>
              <div
                className="segmented"
                role="group"
                aria-label={t("settings.language")}
              >
                <button
                  type="button"
                  className="segmented__btn"
                  aria-pressed={language === "en"}
                  onClick={() => setLanguage("en" as Language)}
                >
                  <Icon name="language" size={14} aria-hidden />
                  {t("settings.language.en")}
                </button>
                <button
                  type="button"
                  className="segmented__btn"
                  aria-pressed={language === "th"}
                  onClick={() => setLanguage("th" as Language)}
                >
                  <Icon name="language" size={14} aria-hidden />
                  {t("settings.language.th")}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: "var(--r-sm)",
                background: "var(--cat-weather-bg)",
                border: "1px solid var(--cat-weather-border)",
                color: "var(--cat-weather-ink)",
              }}
              aria-hidden="true"
            >
              <Icon name="sun" size={18} />
            </span>
            <h2>{t("settings.weather")}</h2>
          </div>
          <div className="card stack">
            <div className="field">
              <label className="field-label" htmlFor="settings-units">
                {t("settings.units")}
              </label>
              <div
                className="segmented"
                role="group"
                aria-label={t("settings.units")}
              >
                <button
                  type="button"
                  className="segmented__btn"
                  aria-pressed={units === "C"}
                  onClick={() => setUnits("C" as Units)}
                >
                  °C {t("settings.units.c")}
                </button>
                <button
                  type="button"
                  className="segmented__btn"
                  aria-pressed={units === "F"}
                  onClick={() => setUnits("F" as Units)}
                >
                  °F {t("settings.units.f")}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: "var(--r-sm)",
                background: "var(--cat-utility-bg)",
                border: "1px solid var(--cat-utility-border)",
                color: "var(--cat-utility-ink)",
              }}
              aria-hidden="true"
            >
              <Icon name="info" size={18} />
            </span>
            <h2>{t("settings.about")}</h2>
          </div>
          <div className="card-quiet">
            <p className="muted" style={{ margin: 0 }}>
              {t("settings.about.body")}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}