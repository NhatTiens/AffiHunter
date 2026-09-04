import type { ReactNode } from "react";
import { Panel, PanelContent } from "../components/ui/panel";

export interface PlaceholderPageProps {
  boundary?: "onboarding";
  description?: ReactNode;
  title: ReactNode;
}

export function PlaceholderPage({
  boundary,
  description = "This route is reserved for a later implementation phase.",
  title,
}: PlaceholderPageProps) {
  return (
    <div className="grid min-h-feedback content-center gap-6">
      <div>
        <p className="text-xs font-medium uppercase text-action-primary">
          {boundary === "onboarding" ? "Onboarding boundary" : "Foundation route"}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-content-primary">{title}</h1>
        <p className="mt-2 max-w-copy text-sm text-content-secondary">{description}</p>
      </div>
      <Panel>
        <PanelContent>
          <p className="text-sm text-content-secondary">
            Shared application shell is ready. Feature data and business actions
            are intentionally not connected in this checkpoint.
          </p>
        </PanelContent>
      </Panel>
    </div>
  );
}
