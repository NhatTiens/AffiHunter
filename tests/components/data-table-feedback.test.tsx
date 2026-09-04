import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  DataTable,
  type DataTableColumn,
  FeedbackState,
} from "../../src/renderer/components/ui";

type Row = { id: string; name: string; amount: number };
const rows: readonly Row[] = [{ id: "one", name: "Example", amount: 1250 }];
const columns: readonly DataTableColumn<Row>[] = [
  { id: "name", header: "Name", cell: (row) => row.name },
  {
    id: "amount",
    header: "Amount",
    align: "numeric",
    cell: (row) => row.amount.toLocaleString("en-US"),
  },
];

const baseProps = {
  caption: "Example records",
  columns,
  getRowKey: (row: Row) => row.id,
};

describe("DataTable", () => {
  it("renders data and an accessible action column", async () => {
    const inspect = vi.fn();
    render(
      <DataTable
        {...baseProps}
        rows={rows}
        actions={{
          header: "Actions",
          render: (row) => (
            <button type="button" onClick={() => inspect(row.id)}>
              Inspect {row.name}
            </button>
          ),
        }}
      />,
    );

    expect(screen.getByRole("table", { name: "Example records" })).toBeVisible();
    expect(screen.getByRole("cell", { name: "1,250" })).toBeVisible();
    await userEvent.click(
      screen.getByRole("button", { name: "Inspect Example" }),
    );
    expect(inspect).toHaveBeenCalledWith("one");
  });

  it("announces loading and empty states", () => {
    const { rerender } = render(
      <DataTable {...baseProps} rows={[]} loading loadingLabel="Loading rows" />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading rows");
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");

    rerender(
      <DataTable
        {...baseProps}
        rows={[]}
        emptyTitle="Nothing here"
        emptyDescription="Adjust the filters"
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Nothing hereAdjust the filters",
    );
  });

  it("announces errors and allows retry", async () => {
    const retry = vi.fn();
    render(
      <DataTable
        {...baseProps}
        rows={[]}
        error="Could not load records"
        onRetry={retry}
        retryLabel="Retry loading"
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Could not load records");
    await userEvent.click(
      screen.getByRole("button", { name: "Retry loading" }),
    );
    expect(retry).toHaveBeenCalledOnce();
  });
});

it("exposes feedback actions as observable behavior", async () => {
  const retry = vi.fn();
  render(
    <FeedbackState
      status="error"
      title="Something went wrong"
      description="The operation can be retried"
      actionLabel="Try again"
      onAction={retry}
    />,
  );

  expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
  await userEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(retry).toHaveBeenCalledOnce();
});
