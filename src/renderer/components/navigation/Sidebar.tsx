import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { navigationSections, getNavigationItem } from "../../app/navigation";
import { Tooltip } from "../ui/tooltip";
import { cn } from "../ui/utils";

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { pathname } = useLocation();
  const activeItem = getNavigationItem(pathname);

  return (
    <nav
      aria-label="Primary navigation"
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border-subtle bg-surface-sidebar transition-[width] duration-standard ease-standard",
        collapsed ? "w-sidebar-collapsed" : "w-sidebar",
      )}
    >
      <div className="flex h-topbar shrink-0 items-center justify-between border-b border-border-subtle px-4">
        {collapsed ? (
          <span className="text-xl font-bold text-action-primary" aria-label="AffiHunter">
            A
          </span>
        ) : (
          <div>
            <p className="text-lg font-semibold leading-none text-content-primary">
              AffiHunter
            </p>
            <p className="mt-1 text-2xs text-content-muted">TikTok Affiliate Hunter</p>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          aria-expanded={!collapsed}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-md text-content-muted hover:bg-surface-elevated hover:text-content-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          {collapsed ? (
            <ChevronRight className="size-4" aria-hidden="true" />
          ) : (
            <ChevronLeft className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-4">
        {navigationSections.map((section) => (
          <div key={section.id} className="mb-4 last:mb-0">
            {!collapsed && section.label ? (
              <p className="mb-2 px-3 text-2xs font-medium uppercase text-content-muted">
                {section.label}
              </p>
            ) : null}
            <div className="grid gap-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem?.id === item.id;
                const link = (
                  <Link
                    key={item.id}
                    to={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "group flex min-h-control items-center gap-3 rounded-md px-3 text-sm text-content-secondary transition-colors duration-fast",
                      "hover:bg-surface-elevated hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive && "bg-action-primary text-content-inverse hover:bg-action-hover",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    {!collapsed ? <span className="truncate">{item.label}</span> : null}
                  </Link>
                );
                return collapsed ? (
                  <Tooltip key={item.id} label={item.label}>
                    {link}
                  </Tooltip>
                ) : (
                  link
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!collapsed ? (
        <div className="shrink-0 border-t border-border-subtle p-3">
          <div className="rounded-md border border-border-subtle bg-surface-panel p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-content-primary">
              <Sparkles className="size-3.5 text-action-primary" aria-hidden="true" />
              Foundation mode
            </div>
            <p className="mt-1 text-2xs text-content-muted">
              Business workflows arrive in later phases.
            </p>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
