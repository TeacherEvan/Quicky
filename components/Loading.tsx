import { cn } from "@/lib/cn";

export interface LoadingProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loading({ label, size = "md", className }: LoadingProps) {
  return (
    <div
      className={cn("loading", className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span
        className={cn("spinner", size === "lg" && "spinner-lg")}
        aria-hidden="true"
      />
      {label ? <span>{label}</span> : <span className="sr-only">{label ?? "Loading"}</span>}
    </div>
  );
}
