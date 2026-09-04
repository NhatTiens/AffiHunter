import { ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "./utils";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ children, className, ...props }, ref) => (
  <span className="relative block">
    <select
      ref={ref}
      className={cn(
        "h-control w-full appearance-none rounded-md border border-input bg-surface-control px-3 pr-8 text-sm text-content-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-content-muted"
      aria-hidden="true"
    />
  </span>
));
Select.displayName = "Select";
