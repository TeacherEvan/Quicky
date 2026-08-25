import { Icon, type IconName } from "./Icon";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  title?: string;
  body?: string;
  iconName?: IconName;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  title,
  body,
  iconName = "info",
  className,
  children,
}: EmptyStateProps) {
  const t = useT();
  return (
    <div className={cn("state-block", className)} role="status">
      <div className="icon-bubble" aria-hidden="true">
        <Icon name={iconName} size={28} />
      </div>
      <p className="state-title">{title ?? t("common.emptyTitle")}</p>
      {body ? <p className="state-body">{body}</p> : null}
      {children}
    </div>
  );
}
