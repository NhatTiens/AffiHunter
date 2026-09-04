import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "./utils";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "h-control w-full rounded-md border border-input bg-surface-control px-3 text-sm text-content-primary",
      "placeholder:text-content-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-status-danger aria-invalid:ring-status-danger",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
