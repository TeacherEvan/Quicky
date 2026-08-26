"use client";

import Link from "next/link";
import { Icon, type IconName } from "./Icon";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export type TileSlug =
  | "cost"
  | "location"
  | "bathroom"
  | "attractions"
  | "counter"
  | "bolt"
  | "banking"
  | "weather";

export type TileCategory =
  | "utility"
  | "photo"
  | "nearby"
  | "time"
  | "mobility"
  | "finance"
  | "weather";

export interface TileProps {
  slug: TileSlug;
  icon: IconName;
  category: TileCategory;
  className?: string;
  /** Live status text shown under the description (e.g. "Bangkok · 31°"). */
  status?: string;
}

export function Tile({ slug, icon, category, className, status }: TileProps) {
  const t = useT();
  return (
    <Link
      href={`/${slug}`}
      className={cn("tile", `tile--cat-${category}`, className)}
      aria-label={`${t(`tile.${slug}.label`)} — ${t(`tile.${slug}.desc`)}`}
    >
      <span className="tile__icon" aria-hidden="true">
        <Icon name={icon} size={22} />
      </span>
      <span className="tile__chev" aria-hidden="true">
        <Icon name="chevron-right" size={16} />
      </span>
      <span style={{ display: "block" }}>
        <span className="tile__label">{t(`tile.${slug}.label`)}</span>
        <span className="tile__desc">
          {status ?? t(`tile.${slug}.desc`)}
        </span>
      </span>
    </Link>
  );
}
