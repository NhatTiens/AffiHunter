import { cloneElement, useId, type ReactElement, type ReactNode } from "react";

export interface FormFieldProps {
  children: ReactElement<{
    id?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
  }>;
  description?: ReactNode;
  error?: ReactNode;
  label: ReactNode;
  optionalLabel?: ReactNode;
}

export function FormField({
  children,
  description,
  error,
  label,
  optionalLabel,
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = children.props.id ?? generatedId;
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [
    children.props["aria-describedby"],
    descriptionId,
    errorId,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="grid gap-2">
      <label
        htmlFor={fieldId}
        className="flex items-center justify-between gap-3 text-xs font-medium text-content-secondary"
      >
        <span>{label}</span>
        {optionalLabel ? (
          <span className="font-normal text-content-muted">{optionalLabel}</span>
        ) : null}
      </label>
      {cloneElement(children, {
        id: fieldId,
        "aria-describedby": describedBy || undefined,
        "aria-invalid": Boolean(error) || undefined,
      })}
      {description ? (
        <p id={descriptionId} className="text-xs text-content-muted">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs text-status-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
