import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "./utils";

export const Checkbox = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "flex size-4 shrink-0 items-center justify-center rounded-sm border border-border-strong bg-surface-control text-content-inverse",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:border-action-primary data-[state=checked]:bg-action-primary",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator>
      <Check className="size-3" aria-hidden="true" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export interface CheckboxFieldProps
  extends Omit<ComponentPropsWithoutRef<typeof Checkbox>, "id"> {
  description?: ReactNode;
  label: ReactNode;
}

export function CheckboxField({
  description,
  label,
  ...props
}: CheckboxFieldProps) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div className="flex items-start gap-3">
      <Checkbox id={id} aria-describedby={descriptionId} {...props} />
      <div className="grid gap-1">
        <label htmlFor={id} className="text-sm text-content-primary">
          {label}
        </label>
        {description ? (
          <p id={descriptionId} className="text-xs text-content-muted">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
