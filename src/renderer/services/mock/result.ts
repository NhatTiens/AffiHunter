import type { AppError, Result } from "../../../shared/contracts";

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function fail<T = never>(
  code: string,
  message: string,
  retryable = false,
): Result<T> {
  const error: AppError = { code, message, retryable };
  return { ok: false, error };
}

export function assertUtcRange(range: { fromUtc: string; toUtc: string }): Result<true> {
  const from = Date.parse(range.fromUtc);
  const to = Date.parse(range.toUtc);
  if (!range.fromUtc.endsWith("Z") || !range.toUtc.endsWith("Z") || !Number.isFinite(from) || !Number.isFinite(to) || from > to) {
    return fail("INVALID_DATE_RANGE", "Date range must contain ordered UTC timestamps.");
  }
  return ok(true);
}

export function validPageRequest(request: { page: number; pageSize: number }): Result<true> {
  if (!Number.isInteger(request.page) || request.page < 1 || !Number.isInteger(request.pageSize) || request.pageSize < 1 || request.pageSize > 100) {
    return fail("INVALID_PAGE", "Page must be a positive integer and pageSize must be between 1 and 100.");
  }
  return ok(true);
}
