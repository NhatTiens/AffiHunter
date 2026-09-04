import {
  AlertCircle,
  CheckCircle2,
  Inbox,
  LoaderCircle,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./button";
import { cn } from "./utils";

export type FeedbackStatus = "loading" | "empty" | "error" | "success";

const icons: Record<FeedbackStatus, LucideIcon> = {
  loading: LoaderCircle,
  empty: Inbox,
  error: AlertCircle,
  success: CheckCircle2,
};

const iconStyles: Record<FeedbackStatus, string> = {
  loading: "animate-spin text-content-muted motion-reduce:animate-none",
  empty: "text-content-muted",
  error: "text-status-danger",
  success: "text-status-success",
};

export interface FeedbackStateProps {
  actionLabel?: string;
  className?: string;
  description?: ReactNode;
  onAction?: () => void;
  status: FeedbackStatus;
  title: ReactNode;
}

export function FeedbackState({
  actionLabel,
  className,
  description,
  onAction,
  status,
  title,
}: FeedbackStateProps) {
  const Icon = icons[status];
  const isError = status === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={cn(
        "flex min-h-feedback flex-col items-center justify-center px-6 py-12 text-center",
        className,
      )}
    >
      <Icon className={cn("mb-3 size-8", iconStyles[status])} aria-hidden="true" />
      <p className="text-sm font-semibold text-content-primary">{title}</p>
      {description ? (
        <p className="mt-1 max-w-copy text-xs text-content-muted">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <Button className="mt-4" variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
