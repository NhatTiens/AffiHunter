import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/navigation/Sidebar";
import { TooltipProvider } from "../components/ui/tooltip";
import { Topbar } from "../components/navigation/Topbar";
import { cn } from "../components/ui/utils";

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
        <div
          className={cn(
            "min-h-screen transition-[padding] duration-standard ease-standard",
            collapsed ? "pl-sidebar-collapsed" : "pl-sidebar",
          )}
        >
          <Topbar collapsed={collapsed} onToggleSidebar={() => setCollapsed((value) => !value)} />
          <main id="main-content" className="p-gutter">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
