import { Icon, type IconName } from "./Icon";
import { Button } from "./Button";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export interface ErrorStateProps {
  title?: string;
  body?: string;
  detail?: string;
  onRetry?: () => void;
  iconName?: IconName;
  className?: string;
}

export function ErrorState({
  title,
  body,
  detail,
  onRetry,
  iconName = "warning",
  className,
}: ErrorStateProps) {
  const t = useT();
  return (
    <div className={cn("state-block", className)} role="alert">
      <div className="icon-bubble" aria-hidden="true">
        <Icon name={iconName} size={28} />
      </div>
      <p className="state-title">{title ?? t("common.errorTitle")}</p>
      {body ? <p className="state-body">{body}</p> : null}
      {detail ? (
        <p className="error-text" style={{ maxWidth: "44ch" }}>
          {detail}
        </p>
      ) : null}
      {onRetry ? (
        <Button variant="primary" onClick={onRetry} iconName="refresh">
          {t("common.retry")}
        </Button>
      ) : null}
    </div>
  );
}
