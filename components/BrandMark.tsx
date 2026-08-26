"use client";

import { Icon } from "./Icon";

export interface BrandMarkProps {
  size?: number;
  className?: string;
}

export function BrandMark({ size = 32, className }: BrandMarkProps) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: size / 4,
        background:
          "linear-gradient(135deg, var(--brand) 0%, var(--brand-strong) 100%)",
        color: "var(--brand-on)",
        boxShadow: "var(--shadow-1)",
      }}
      aria-hidden="true"
    >
      <Icon name="bolt" size={Math.round(size * 0.55)} />
    </span>
  );
}
