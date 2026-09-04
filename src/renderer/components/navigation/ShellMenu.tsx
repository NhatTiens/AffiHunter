import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../ui/utils";

export interface ShellMenuProps {
  align?: "start" | "end";
  children: ReactNode;
  label: string;
  trigger: ReactNode;
  triggerClassName?: string;
  triggerIcon?: ReactNode;
}

export function ShellMenu({
  align = "end",
  children,
  label,
  trigger,
  triggerClassName,
  triggerIcon,
}: ShellMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    menuRef.current
      ?.querySelector<HTMLElement>("[role='menuitem'], [role='menuitemradio']")
      ?.focus();
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const moveFocus = (direction: 1 | -1) => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(
        "[role='menuitem'], [role='menuitemradio']",
      ) ?? [],
    );
    if (!items.length) return;
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    items[(currentIndex + direction + items.length) % items.length]?.focus();
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={triggerClassName}
      >
        {trigger}
        {triggerIcon}
      </button>
      {open ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={label}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("[role='menuitem'], [role='menuitemradio']")) {
              setOpen(false);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
              triggerRef.current?.focus();
            } else if (event.key === "ArrowDown") {
              event.preventDefault();
              moveFocus(1);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              moveFocus(-1);
            }
          }}
          className={cn(
            "absolute top-menu z-50 min-w-menu rounded-md border border-border-default bg-surface-elevated p-1 text-sm text-content-primary shadow-overlay",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export interface ShellMenuItemProps {
  checked?: boolean;
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  role?: "menuitem" | "menuitemradio";
}

export function ShellMenuItem({
  checked,
  children,
  href,
  onClick,
  role = "menuitem",
}: ShellMenuItemProps) {
  return (
    href ? (
      <Link
        to={href}
        role={role}
        aria-checked={role === "menuitemradio" ? checked : undefined}
        tabIndex={-1}
        className="flex min-h-control w-full items-center justify-between rounded-sm px-3 py-1.5 text-left text-sm outline-none hover:bg-action-primary-subtle focus:bg-action-primary-subtle"
      >
        {children}
      </Link>
    ) : (
      <button
        type="button"
      role={role}
      aria-checked={role === "menuitemradio" ? checked : undefined}
      tabIndex={-1}
      onClick={onClick}
      className="flex min-h-control w-full items-center justify-between rounded-sm px-3 py-1.5 text-left text-sm outline-none hover:bg-action-primary-subtle focus:bg-action-primary-subtle"
      >
        {children}
      </button>
    )
  );
}
