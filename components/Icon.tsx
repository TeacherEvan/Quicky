import type { CSSProperties, ReactElement } from "react";
import { cn } from "@/lib/cn";

export type IconName =
  | "sun"
  | "moon"
  | "cloud"
  | "cloud-sun"
  | "cloud-moon"
  | "cloud-bolt"
  | "rain"
  | "drizzle"
  | "snow"
  | "fog"
  | "showers"
  | "storm"
  | "thermometer"
  | "droplet"
  | "wind"
  | "bolt"
  | "pin"
  | "wc"
  | "museum"
  | "counter"
  | "bank"
  | "camera"
  | "compass"
  | "map"
  | "copy"
  | "monitor"
  | "arrow-left"
  | "arrow-right"
  | "chevron-right"
  | "check"
  | "cross"
  | "warning"
  | "info"
  | "wifi-off"
  | "refresh"
  | "install"
  | "globe"
  | "calendar"
  | "language";

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
  moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  cloud: (
    <path d="M17.5 19a4.5 4.5 0 1 0-1.6-8.74A6 6 0 0 0 4 12.5 4.5 4.5 0 0 0 6.5 21H17.5z" />
  ),
  "cloud-sun": (
    <>
      <path d="M12 2v2M5.6 5.6l1.4 1.4M2 12h2M17 7a5 5 0 0 0-9.7 1.5" />
      <path d="M16 16a4 4 0 1 0-1.2-7.8A6 6 0 0 0 4 11a4 4 0 0 0 4 5h8z" />
    </>
  ),
  "cloud-moon": (
    <>
      <path d="M21 9.5A5.5 5.5 0 0 1 15.5 4 5.5 5.5 0 1 0 21 9.5z" />
      <path d="M16 16a4 4 0 1 0-1.2-7.8A6 6 0 0 0 4 11a4 4 0 0 0 4 5h8z" />
    </>
  ),
  "cloud-bolt": (
    <>
      <path d="M17 17a4 4 0 1 0-1.2-7.8A6 6 0 0 0 5 12a4 4 0 0 0 4 5h1" />
      <path d="M13 12l-3 5h4l-2 5" />
    </>
  ),
  rain: (
    <>
      <path d="M16 14a4 4 0 0 0 0-8 6 6 0 0 0-11.6 1.5A4 4 0 0 0 5 15" />
      <path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3" />
    </>
  ),
  drizzle: (
    <>
      <path d="M16 14a4 4 0 0 0 0-8 6 6 0 0 0-11.6 1.5A4 4 0 0 0 5 15" />
      <path d="M8 20l-1 2M12 20l-1 2M16 20l-1 2" />
    </>
  ),
  snow: (
    <>
      <path d="M20 17.6A4.5 4.5 0 0 0 17.5 9a6 6 0 0 0-11.4 1.4A4 4 0 0 0 6.5 19H17.5a4.5 4.5 0 0 0 2.5-1.4z" />
      <path d="M8 22h.01M12 22h.01M16 22h.01" />
    </>
  ),
  fog: (
    <>
      <path d="M4 14h16M6 18h12M8 22h8" />
      <path d="M17.5 11a4.5 4.5 0 1 0-1.6-8.74A6 6 0 0 0 4 4.5" />
    </>
  ),
  showers: (
    <>
      <path d="M16 14a4 4 0 0 0 0-8 6 6 0 0 0-11.6 1.5A4 4 0 0 0 5 15" />
      <path d="M7 19l-1 3M11 19l-1 3M15 19l-1 3M19 19l-1 3" />
    </>
  ),
  storm: (
    <>
      <path d="M19 16.9A5 5 0 0 0 18 7h-1.3a8 8 0 1 0-11.5 9" />
      <path d="M13 12l-3 6h4l-2 5" />
    </>
  ),
  thermometer: (
    <>
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </>
  ),
  droplet: (
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  ),
  wind: (
    <>
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M17.5 8a2.5 2.5 0 1 0 0 5H22" />
      <path d="M2 16h17a2 2 0 1 1 0 4H4" />
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
  compass: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
    </>
  ),
  map: (
    <>
      <path d="M1 6l7-3 8 3 7-3v15l-7 3-8-3-7 3z" />
      <path d="M8 3v15M16 6v15" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
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
  "chevron-right": <path d="M9 6l6 6-6 6" />,
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
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  language: (
    <>
      <path d="M5 8h7M9 5v3M5 13c2 4 6 4 8 0M12 13c-1 4-4 6-7 7M14 13c1 4 4 6 7 7" />
    </>
  ),
  monitor: (
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <path d="M8 21h8M12 17v4" />
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
