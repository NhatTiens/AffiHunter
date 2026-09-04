import type { Key, ReactNode } from "react";
import { Button } from "./button";
import { Skeleton } from "./skeleton";
import { cn } from "./utils";

export type DataTableAlignment = "start" | "center" | "end" | "numeric";

export interface DataTableColumn<Row> {
  align?: DataTableAlignment;
  cell: (row: Row) => ReactNode;
  header: ReactNode;
  headerLabel?: string;
  id: string;
}

export interface DataTableActions<Row> {
  header?: ReactNode;
  headerLabel?: string;
  render: (row: Row) => ReactNode;
}

export interface DataTableProps<Row> {
  actions?: DataTableActions<Row>;
  caption: string;
  className?: string;
  columns: readonly DataTableColumn<Row>[];
  emptyDescription?: ReactNode;
  emptyTitle?: ReactNode;
  error?: ReactNode;
  getRowKey: (row: Row, index: number) => Key;
  loading?: boolean;
  loadingLabel?: string;
  onRetry?: () => void;
  retryLabel?: string;
  rows: readonly Row[];
}

const alignmentStyles: Record<DataTableAlignment, string> = {
  start: "text-left",
  center: "text-center",
  end: "text-right",
  numeric: "text-right tabular-nums",
};

export function DataTable<Row>({
  actions,
  caption,
  className,
  columns,
  emptyDescription,
  emptyTitle = "No results",
  error,
  getRowKey,
  loading = false,
  loadingLabel = "Loading data",
  onRetry,
  retryLabel = "Try again",
  rows,
}: DataTableProps<Row>) {
  const columnCount = columns.length + (actions ? 1 : 0);

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border border-border-subtle bg-surface-panel",
        className,
      )}
    >
      <table className="w-full border-collapse text-sm" aria-busy={loading}>
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-surface-elevated text-xs text-content-secondary">
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                aria-label={column.headerLabel}
                className={cn(
                  "h-control whitespace-nowrap border-b border-border-subtle px-4 font-medium",
                  alignmentStyles[column.align ?? "start"],
                )}
              >
                {column.header}
              </th>
            ))}
            {actions ? (
              <th
                scope="col"
                aria-label={actions.headerLabel}
                className="h-control whitespace-nowrap border-b border-border-subtle px-4 text-right font-medium"
              >
                {actions.header ?? "Actions"}
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <LoadingRows
              columnCount={columnCount}
              columns={columns}
              hasActions={Boolean(actions)}
              label={loadingLabel}
            />
          ) : error ? (
            <tr>
              <td colSpan={columnCount}>
                <div role="alert" className="px-6 py-12 text-center">
                  <p className="text-sm font-semibold text-content-primary">
                    {error}
                  </p>
                  {onRetry ? (
                    <Button
                      className="mt-4"
                      size="sm"
                      variant="outline"
                      onClick={onRetry}
                    >
                      {retryLabel}
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columnCount}>
                <div role="status" className="px-6 py-12 text-center">
                  <p className="text-sm font-semibold text-content-primary">
                    {emptyTitle}
                  </p>
                  {emptyDescription ? (
                    <p className="mt-1 text-xs text-content-muted">
                      {emptyDescription}
                    </p>
                  ) : null}
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr
                key={getRowKey(row, rowIndex)}
                className="border-b border-border-subtle last:border-b-0 hover:bg-surface-elevated/60"
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      "h-12 px-4 text-content-secondary",
                      alignmentStyles[column.align ?? "start"],
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
                {actions ? (
                  <td className="h-12 px-4 text-right">{actions.render(row)}</td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

interface LoadingRowsProps<Row> {
  columnCount: number;
  columns: readonly DataTableColumn<Row>[];
  hasActions: boolean;
  label: string;
}

function LoadingRows<Row>({
  columnCount,
  columns,
  hasActions,
  label,
}: LoadingRowsProps<Row>) {
  return (
    <>
      <tr className="sr-only">
        <td colSpan={columnCount} role="status">
          {label}
        </td>
      </tr>
      {[0, 1, 2].map((row) => (
        <tr key={row} className="border-b border-border-subtle last:border-b-0">
          {columns.map((column) => (
            <td key={column.id} className="h-12 px-4">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
          {hasActions ? (
            <td className="h-12 px-4">
              <Skeleton className="ml-auto size-8" />
            </td>
          ) : null}
        </tr>
      ))}
    </>
  );
}
