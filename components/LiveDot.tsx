export interface LiveDotProps {
  label?: string;
  className?: string;
}

export function LiveDot({ label, className }: LiveDotProps) {
  return (
    <span
      className={`live-dot ${className ?? ""}`.trim()}
      role="status"
      aria-label={label}
    />
  );
}
