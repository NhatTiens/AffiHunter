import { Bell, CalendarDays, Menu, Search, UserCircle } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getNavigationItem } from "../../app/navigation";
import { Tooltip } from "../ui/tooltip";
import { cn } from "../ui/utils";
import { ShellMenu, ShellMenuItem } from "./ShellMenu";

export interface TopbarProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
}

export function Topbar({ collapsed, onToggleSidebar }: TopbarProps) {
  const { pathname } = useLocation();
  const activeItem = getNavigationItem(pathname);
  const [dateRange, setDateRange] = useState("7d");

  return (
    <header className="sticky top-0 z-20 flex h-topbar items-center gap-4 border-b border-border-subtle bg-surface-canvas/95 px-gutter backdrop-blur-sm">
      <Tooltip label="Toggle navigation">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          aria-expanded={!collapsed}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-content-muted hover:bg-surface-elevated hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Menu className="size-4" aria-hidden="true" />
        </button>
      </Tooltip>

      <div className="hidden shrink-0 md:block">
        <p className="truncate text-sm font-semibold text-content-primary">
          {activeItem?.label ?? "AffiHunter"}
        </p>
      </div>

      <div className="relative min-w-0 max-w-search flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-content-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          aria-label="Search workspace"
          placeholder="Tìm sản phẩm, keyword, danh mục, shop..."
          className="h-control w-full rounded-md border border-border-default bg-surface-control pl-9 pr-3 text-sm text-content-primary placeholder:text-content-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <ShellMenu
        label="Select date range"
        triggerClassName="hidden h-control items-center gap-2 rounded-md border border-border-default bg-surface-control px-3 text-xs text-content-secondary hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex"
        trigger={
          <span>
            {dateRange === "7d"
              ? "01/07/2026 - 07/07/2026"
              : dateRange === "30d"
                ? "30 ngày"
                : "Tùy chỉnh"}
          </span>
        }
        triggerIcon={
          <CalendarDays className="size-4 text-content-muted" aria-hidden="true" />
        }
      >
        <p className="px-3 py-1.5 text-xs text-content-muted">Khoảng thời gian</p>
        <ShellMenuItem
          role="menuitemradio"
          checked={dateRange === "7d"}
          onClick={() => setDateRange("7d")}
        >
          7 ngày
        </ShellMenuItem>
        <ShellMenuItem
          role="menuitemradio"
          checked={dateRange === "30d"}
          onClick={() => setDateRange("30d")}
        >
          30 ngày
        </ShellMenuItem>
        <ShellMenuItem
          role="menuitemradio"
          checked={dateRange === "custom"}
          onClick={() => setDateRange("custom")}
        >
          Tùy chỉnh
        </ShellMenuItem>
      </ShellMenu>

      <Tooltip label="Notifications">
        <Link
          to="/notifications"
          aria-label="Notifications"
          className={cn(
            "relative inline-flex size-control shrink-0 items-center justify-center rounded-md text-content-muted hover:bg-surface-elevated hover:text-content-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <Bell className="size-4" aria-hidden="true" />
          <span
            className="absolute right-1 top-1 size-1.5 rounded-full bg-status-danger"
            aria-hidden="true"
          />
        </Link>
      </Tooltip>

      <ShellMenu
        label="Open account menu"
        triggerClassName="inline-flex size-control items-center justify-center rounded-full text-content-secondary hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        trigger={<UserCircle className="size-6" aria-hidden="true" />}
      >
        <p className="px-3 py-1.5 text-xs text-content-muted">AffiHunter account</p>
        <ShellMenuItem href="/settings">Cài đặt</ShellMenuItem>
      </ShellMenu>
    </header>
  );
}
