import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "./utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-textarea w-full resize-y rounded-md border border-input bg-surface-control px-3 py-2 text-sm text-content-primary",
      "placeholder:text-content-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-status-danger aria-invalid:ring-status-danger",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
