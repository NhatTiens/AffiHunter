import type { HTMLAttributes } from "react";
import { cn } from "./utils";

export type BadgeVariant =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-surface-elevated text-content-secondary",
  primary: "bg-action-subtle text-content-primary",
  success: "bg-status-success-subtle text-status-success",
  warning: "bg-status-warning-subtle text-status-warning",
  danger: "bg-status-danger-subtle text-status-danger",
  info: "bg-status-info-subtle text-status-info",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-5 items-center rounded-sm px-2 text-2xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
