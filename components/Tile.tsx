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

export interface TileProps {
  slug: TileSlug;
  icon: IconName;
  className?: string;
}

export function Tile({ slug, icon, className }: TileProps) {
  const t = useT();
  return (
    <Link
      href={`/${slug}`}
      className={cn("tile", `tile-${slug}`, className)}
      aria-label={t(`tile.${slug}.label`)}
    >
      <span className="tile-icon" aria-hidden="true">
        <Icon name={icon} size={22} />
      </span>
      <span>
        <span className="tile-label">{t(`tile.${slug}.label`)}</span>
        <span
          className="tile-desc"
          style={{ display: "block", marginTop: 2 }}
        >
          {t(`tile.${slug}.desc`)}
        </span>
      </span>
    </Link>
  );
}
