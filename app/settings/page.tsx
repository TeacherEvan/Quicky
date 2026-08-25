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
      <main id="main-content" className="container" tabIndex={-1}>
        <Breadcrumb items={[{ label: t("app.nav.dashboard"), href: "/" }, { label: t("settings.title") }]} />
        <h1>{t("settings.title")}</h1>

        <section className="section">
          <div className="section-heading">
            <Icon name="info" size={20} aria-hidden />
            <h2>{t("settings.appearance")}</h2>
          </div>
          <div className="card stack">
            <div className="field">
              <label className="field-label" htmlFor="settings-theme">
                {t("settings.theme")}
              </label>
              <select
                id="settings-theme"
                value={themeMode}
                onChange={(e) => setThemeMode(e.target.value as ThemeMode)}
              >
                <option value="system">{t("settings.theme.system")}</option>
                <option value="light">{t("settings.theme.light")}</option>
                <option value="dark">{t("settings.theme.dark")}</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="settings-language">
                {t("settings.language")}
              </label>
              <select
                id="settings-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
              >
                <option value="en">{t("settings.language.en")}</option>
                <option value="th">{t("settings.language.th")}</option>
              </select>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <Icon name="sun" size={20} aria-hidden />
            <h2>{t("settings.weather")}</h2>
          </div>
          <div className="card stack">
            <div className="field">
              <label className="field-label" htmlFor="settings-units">
                {t("settings.units")}
              </label>
              <select
                id="settings-units"
                value={units}
                onChange={(e) => setUnits(e.target.value as Units)}
              >
                <option value="C">{t("settings.units.c")}</option>
                <option value="F">{t("settings.units.f")}</option>
              </select>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <Icon name="info" size={20} aria-hidden />
            <h2>{t("settings.about")}</h2>
          </div>
          <div className="card">
            <p className="muted" style={{ margin: 0 }}>{t("settings.about.body")}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
