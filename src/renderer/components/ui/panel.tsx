import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "./utils";

export const Panel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <section
      ref={ref}
      className={cn(
        "rounded-lg border border-border-subtle bg-surface-panel shadow-panel",
        className,
      )}
      {...props}
    />
  ),
);
Panel.displayName = "Panel";

export function PanelHeader({
  action,
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { action?: ReactNode }) {
  return (
    <div
      className={cn(
        "flex min-h-control items-center justify-between gap-4 border-b border-border-subtle px-4 py-3",
        className,
      )}
      {...props}
    >
      <div>{children}</div>
      {action}
    </div>
  );
}

export function PanelTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-sm font-semibold text-content-primary", className)}
      {...props}
    />
  );
}

export function PanelDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("mt-1 text-xs text-content-muted", className)} {...props} />
  );
}

export function PanelContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}

export function PanelFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 border-t border-border-subtle px-4 py-3",
        className,
      )}
      {...props}
    />
  );
}
