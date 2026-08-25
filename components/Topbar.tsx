"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { useT } from "@/lib/i18n";

export function Topbar() {
  const pathname = usePathname() ?? "/";
  const t = useT();
  const onSettings = pathname.startsWith("/settings");
  const onHome = pathname === "/";
  return (
    <header className="topbar" role="banner">
      <Link
        href="/"
        className="topbar-brand"
        aria-label={t("app.brandName")}
      >
        <Icon name="bolt" size={20} aria-hidden />
        <span>{t("app.brandName")}</span>
      </Link>
      <div className="topbar-actions">
        <Link
          href="/"
          className="topbar-link"
          aria-current={onHome ? "page" : undefined}
        >
          {t("app.nav.dashboard")}
        </Link>
        <Link
          href="/settings"
          className="topbar-link"
          aria-current={onSettings ? "page" : undefined}
        >
          {t("app.nav.settings")}
        </Link>
      </div>
    </header>
  );
}
