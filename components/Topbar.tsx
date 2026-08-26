"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "./BrandMark";
import { Icon } from "./Icon";
import { InstallButton } from "./InstallButton";
import { useT } from "@/lib/i18n";
import { useSettings, type Language } from "@/lib/settings";
import { cn } from "@/lib/cn";

export function Topbar() {
  const pathname = usePathname() ?? "/";
  const t = useT();
  const { language, setLanguage } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);

  const onSettings = pathname.startsWith("/settings");
  const onHome = pathname === "/";

  function close() {
    setMenuOpen(false);
  }

  return (
    <header className="topbar" role="banner">
      <div className="topbar__inner">
        <Link
          href="/"
          className="topbar__brand"
          aria-label={t("app.brandName")}
          onClick={close}
        >
          <BrandMark size={32} />
          <span>{t("app.brandName")}</span>
        </Link>

        <nav className="topbar__nav" aria-label={t("app.brandTagline")}>
          <Link
            href="/"
            className="topbar__link"
            aria-current={onHome ? "page" : undefined}
          >
            <Icon name="compass" size={16} aria-hidden />
            {t("app.nav.dashboard")}
          </Link>
          <Link
            href="/settings"
            className="topbar__link"
            aria-current={onSettings ? "page" : undefined}
          >
            <Icon name="info" size={16} aria-hidden />
            {t("app.nav.settings")}
          </Link>
        </nav>

        <div className="topbar__actions">
          <div
            className="segmented"
            role="group"
            aria-label={t("settings.language")}
          >
            <button
              type="button"
              className="segmented__btn"
              aria-pressed={language === "en"}
              aria-label="English"
              onClick={() => setLanguage("en" as Language)}
            >
              EN
            </button>
            <button
              type="button"
              className="segmented__btn"
              aria-pressed={language === "th"}
              aria-label="ไทย"
              onClick={() => setLanguage("th" as Language)}
            >
              TH
            </button>
          </div>
          <InstallButton />
          <button
            type="button"
            className="btn btn-ghost btn-icon topbar__menu-btn"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Icon name={menuOpen ? "cross" : "chevron-right"} size={18} />
          </button>
        </div>
      </div>

      <div
        className={cn("topbar__drawer", menuOpen && "topbar__drawer--open")}
        role="menu"
        hidden={!menuOpen}
      >
        <Link
          href="/"
          className="topbar__drawer-link"
          aria-current={onHome ? "page" : undefined}
          onClick={close}
          role="menuitem"
        >
          <Icon name="compass" size={18} aria-hidden />
          {t("app.nav.dashboard")}
        </Link>
        <Link
          href="/settings"
          className="topbar__drawer-link"
          aria-current={onSettings ? "page" : undefined}
          onClick={close}
          role="menuitem"
        >
          <Icon name="info" size={18} aria-hidden />
          {t("app.nav.settings")}
        </Link>
      </div>
    </header>
  );
}
