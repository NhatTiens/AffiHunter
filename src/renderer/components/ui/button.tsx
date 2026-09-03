import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean };
export function Button({ asChild = false, className = "", ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      className={`rounded-md bg-action-primary px-3 py-2 text-sm font-medium text-content-inverse transition-colors duration-fast ease-standard hover:bg-action-hover active:bg-action-pressed ${className}`}
      {...props}
    />
  );
}
