import { Slot } from "@radix-ui/react-slot";
import { LoaderCircle } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "./utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";
export type ButtonSize = "sm" | "md" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-action-primary text-content-inverse hover:bg-action-hover active:bg-action-pressed",
  secondary:
    "border border-border-default bg-surface-elevated text-content-primary hover:bg-surface-control",
  outline:
    "border border-border-strong bg-transparent text-content-primary hover:bg-surface-elevated",
  ghost:
    "bg-transparent text-content-secondary hover:bg-surface-elevated hover:text-content-primary",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-status-danger/90",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-control px-4 text-sm",
  icon: "size-control p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild = false,
      children,
      className,
      disabled,
      loading = false,
      loadingLabel = "Loading",
      size = "md",
      type = "button",
      variant = "primary",
      ...props
    },
    ref,
  ) => {
    const Component = asChild ? Slot : "button";

    return (
      <Component
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(
          "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium transition-colors duration-fast ease-standard",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          variants[variant],
          sizes[size],
          className,
        )}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            <span>{loadingLabel}</span>
          </>
        ) : (
          children
        )}
      </Component>
    );
  },
);
Button.displayName = "Button";
