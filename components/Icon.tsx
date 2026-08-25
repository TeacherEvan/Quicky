import type { CSSProperties, ReactElement } from "react";
import { cn } from "@/lib/cn";

export type IconName =
  | "sun"
  | "cloud"
  | "rain"
  | "bolt"
  | "pin"
  | "wc"
  | "museum"
  | "counter"
  | "bank"
  | "camera"
  | "arrow-left"
  | "arrow-right"
  | "check"
  | "cross"
  | "warning"
  | "info"
  | "wifi-off"
  | "refresh"
  | "install";

export interface IconProps {
  name: IconName;
  size?: number | string;
  label?: string;
  className?: string;
  strokeWidth?: number;
}

const PATHS: Record<IconName, ReactElement> = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </>
  ),
  cloud: (
    <path d="M17.5 19a4.5 4.5 0 1 0-1.6-8.74A6 6 0 0 0 4 12.5 4.5 4.5 0 0 0 6.5 21H17.5z" />
  ),
  rain: (
    <>
      <path d="M16 14a4 4 0 0 0 0-8 6 6 0 0 0-11.6 1.5A4 4 0 0 0 5 15" />
      <path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3" />
    </>
  ),
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
  pin: (
    <>
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  wc: (
    <>
      <path d="M7 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
      <path d="M5 22V14l-1.5-3 1-4h5l1 4L9 14v8" />
      <path d="M17 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
      <path d="M14 12l-1 4h2v6h4v-6h2l-1-4-2-4h-2l-2 4z" />
    </>
  ),
  museum: (
    <>
      <path d="M3 21h18" />
      <path d="M3 10h18" />
      <path d="M5 10l7-7 7 7" />
      <path d="M5 10v11M9 10v11M15 10v11M19 10v11" />
    </>
  ),
  counter: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M9 2h6" />
      <path d="M12 2v3" />
    </>
  ),
  bank: (
    <>
      <path d="M3 10l9-6 9 6" />
      <path d="M5 10v8M9 10v8M15 10v8M19 10v8" />
      <path d="M3 18h18" />
      <path d="M3 21h18" />
    </>
  ),
  camera: (
    <>
      <path d="M3 7h4l2-3h6l2 3h4v13H3z" />
      <circle cx="12" cy="13" r="4" />
    </>
  ),
  "arrow-left": (
    <>
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </>
  ),
  "arrow-right": (
    <>
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </>
  ),
  check: <path d="M5 12l5 5L20 7" />,
  cross: <path d="M6 6l12 12M18 6L6 18" />,
  warning: (
    <>
      <path d="M10.3 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),
  "wifi-off": (
    <>
      <path d="M1 1l22 22" />
      <path d="M16.7 13.7a5 5 0 0 0-6.4-6.4" />
      <path d="M2 9a14 14 0 0 1 7.4-4" />
      <path d="M8.5 16.5a5 5 0 0 1 7 0" />
      <path d="M2 2a18 18 0 0 1 18 18" />
      <path d="M12 20h.01" />
    </>
  ),
  refresh: (
    <>
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.5 9a9 9 0 0 1 14.85-3.36L23 10" />
      <path d="M20.5 15a9 9 0 0 1-14.85 3.36L1 14" />
    </>
  ),
  install: (
    <>
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </>
  ),
};

export function Icon({
  name,
  size = 24,
  label,
  className,
  strokeWidth = 2,
}: IconProps) {
  const isDecorative = !label;
  const numeric = typeof size === "number";
  const style: CSSProperties = {
    width: numeric ? `${size}px` : size,
    height: numeric ? `${size}px` : size,
    flex: "none",
  };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={isDecorative ? "presentation" : "img"}
      aria-hidden={isDecorative ? "true" : undefined}
      aria-label={label}
      className={cn("icon", className)}
      style={style}
      data-icon={name}
    >
      {PATHS[name]}
    </svg>
  );
}
