import { useId, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "./utils";

export interface ChartContainerProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  children: ReactNode;
  description?: ReactNode;
  summary: ReactNode;
  title: ReactNode;
}

export function ChartContainer({
  children,
  className,
  description,
  summary,
  title,
  ...props
}: ChartContainerProps) {
  const titleId = useId();
  const summaryId = useId();

  return (
    <figure
      aria-labelledby={titleId}
      aria-describedby={summaryId}
      className={cn(
        "rounded-lg border border-border-subtle bg-surface-panel p-4",
        className,
      )}
      {...props}
    >
      <figcaption className="mb-4">
        <h2 id={titleId} className="text-sm font-semibold text-content-primary">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-xs text-content-muted">{description}</p>
        ) : null}
        <p id={summaryId} className="sr-only">
          {summary}
        </p>
      </figcaption>
      <div className="h-chart w-full" aria-hidden="true">
        {children}
      </div>
    </figure>
  );
}
