"use client";

import Link from "next/link";
import { Icon } from "./Icon";
import { useT } from "@/lib/i18n";

export interface Crumb {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: Crumb[];
  /**
   * If true (the default), the last item is rendered as a plain
   * `aria-current="page"` label. If false, the last item is omitted —
   * callers usually pass the full path and rely on the page's own `<h1>`
   * to carry the current page name (avoids a duplicate heading).
   */
  showLast?: boolean;
}

export function Breadcrumb({ items, showLast = false }: BreadcrumbProps) {
  const t = useT();
  const visible = showLast ? items : items.slice(0, -1);
  if (visible.length === 0) return null;
  return (
    <nav aria-label={t("app.brandTagline")}>
      <ol className="breadcrumb" role="list">
        {visible.map((c, i) => {
          const isLast = i === visible.length - 1;
          if (!c.href || isLast) {
            return (
              <li key={`${c.label}-${i}`} aria-current="page">
                {i > 0 ? (
                  <Icon name="arrow-right" size={14} aria-hidden />
                ) : null}
                <span>{c.label}</span>
              </li>
            );
          }
          return (
            <li key={`${c.label}-${i}`}>
              <Link href={c.href}>
                {i === 0 ? (
                  <Icon name="arrow-left" size={14} aria-hidden />
                ) : (
                  <Icon name="arrow-right" size={14} aria-hidden />
                )}
                <span>{c.label}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
