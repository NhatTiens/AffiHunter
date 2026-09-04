import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ComponentPropsWithoutRef, ReactElement } from "react";

export const TooltipProvider = TooltipPrimitive.Provider;

export interface TooltipProps
  extends Omit<
    ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>,
    "children"
  > {
  children: ReactElement;
  label: string;
  side?: "top" | "right" | "bottom" | "left";
}

export function Tooltip({
  children,
  label,
  side = "top",
  ...rootProps
}: TooltipProps) {
  return (
    <TooltipPrimitive.Root {...rootProps}>
      <TooltipPrimitive.Trigger asChild aria-label={label}>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          className="z-50 rounded-sm border border-border-default bg-surface-elevated px-2 py-1 text-xs text-content-primary shadow-overlay"
        >
          {label}
          <TooltipPrimitive.Arrow className="fill-surface-elevated" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
