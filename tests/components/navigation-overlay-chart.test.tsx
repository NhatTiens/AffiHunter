import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Button,
  ChartContainer,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../src/renderer/components/ui";

describe("Tabs", () => {
  it("changes the active panel with arrow keys", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="overview">
        <TabsList aria-label="Report sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview panel</TabsContent>
        <TabsContent value="activity">Activity panel</TabsContent>
      </Tabs>,
    );

    const overview = screen.getByRole("tab", { name: "Overview" });
    overview.focus();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Activity panel");
  });
});

describe("overlays", () => {
  it("opens a named modal dialog, traps semantics, and closes with Escape", async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open settings</Button>
        </DialogTrigger>
        <DialogContent closeLabel="Close settings">
          <DialogTitle>Workspace settings</DialogTitle>
          <DialogDescription>Update local display preferences.</DialogDescription>
          <Button>Save changes</Button>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByRole("button", { name: "Open settings" }));
    const dialog = screen.getByRole("dialog", { name: "Workspace settings" });
    expect(dialog).toHaveAccessibleDescription(
      "Update local display preferences.",
    );
    expect(screen.getByRole("button", { name: "Close settings" })).toBeVisible();

    await user.keyboard("{Escape}");
    expect(dialog).not.toBeInTheDocument();
  });
});

it("gives charts a text alternative while hiding visual marks", () => {
  render(
    <ChartContainer
      title="Weekly activity"
      description="Last seven days"
      summary="Activity rose from 10 to 20 events."
    >
      <svg data-testid="visual-chart" />
    </ChartContainer>,
  );

  const figure = screen.getByRole("figure", { name: "Weekly activity" });
  expect(figure).toHaveAccessibleDescription(
    "Activity rose from 10 to 20 events.",
  );
  expect(screen.getByTestId("visual-chart").parentElement).toHaveAttribute(
    "aria-hidden",
    "true",
  );
});
