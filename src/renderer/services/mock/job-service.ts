import type {
  JobFilters,
  JobId,
  JobReference,
  JobListener,
  JobRecord,
  JobService,
  JobStatus,
  Page,
  PageRequest,
  Result,
} from "../../../shared/contracts";
import { FIXTURE_NOW } from "./fixtures";
import { fail, ok, validPageRequest } from "./result";

const nextTimestamp = FIXTURE_NOW;

export class MockJobService implements JobService {
  private readonly jobs = new Map<string, JobRecord>([
    ["job-1", { id: "job-1" as JobId, type: "sync-orders", status: "running", progress: 42, attempt: 1, input: { source: "tiktok-shop" }, createdAt: nextTimestamp, updatedAt: nextTimestamp }],
    ["job-2", { id: "job-2" as JobId, type: "generation", status: "failed", progress: 35, attempt: 1, errorCode: "PROVIDER_TIMEOUT", input: { capability: "text" }, createdAt: nextTimestamp, updatedAt: nextTimestamp }],
  ]);
  private readonly listeners = new Set<JobListener>();
  private nextJobNumber = 3;

  enqueue(type: JobRecord["type"], input: JobRecord["input"] = {}): JobReference {
    const id = `job-${this.nextJobNumber++}` as JobId;
    this.jobs.set(id, {
      id,
      type,
      status: "queued",
      progress: 0,
      attempt: 0,
      input,
      createdAt: nextTimestamp,
      updatedAt: nextTimestamp,
    });
    return { jobId: id };
  }

  async get(jobId: JobId): Promise<Result<JobRecord>> {
    const job = this.jobs.get(jobId);
    return job ? ok({ ...job }) : fail("JOB_NOT_FOUND", "Job was not found.");
  }

  async list(filters: JobFilters, page: PageRequest): Promise<Result<Page<JobRecord>>> {
    const validPage = validPageRequest(page);
    if (!validPage.ok) return validPage;
    const jobs = [...this.jobs.values()].filter((job) => (!filters.status || job.status === filters.status) && (!filters.type || job.type === filters.type));
    const pageSize = Math.min(100, Math.max(1, page.pageSize));
    const start = (page.page - 1) * pageSize;
    return ok({ items: jobs.slice(start, start + pageSize).map((job) => ({ ...job })), page: page.page, pageSize, total: jobs.length });
  }

  async cancel(jobId: JobId): Promise<Result<JobRecord>> {
    const job = this.jobs.get(jobId);
    if (!job) return fail("JOB_NOT_FOUND", "Job was not found.");
    if (job.status !== "queued" && job.status !== "running" && job.status !== "retry_wait") return fail("JOB_NOT_CANCELLABLE", "Job cannot be cancelled in its current state.");
    return this.transition(job, "cancelled", 0);
  }

  async retry(jobId: JobId): Promise<Result<JobRecord>> {
    const job = this.jobs.get(jobId);
    if (!job) return fail("JOB_NOT_FOUND", "Job was not found.");
    if (job.status !== "failed" && job.status !== "cancelled") return fail("JOB_NOT_RETRYABLE", "Only failed or cancelled jobs can be retried.");
    return this.transition(job, "queued", 0, job.attempt + 1);
  }

  subscribe(listener: JobListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private transition(job: JobRecord, status: JobStatus, progress: number, attempt = job.attempt): Result<JobRecord> {
    const updated: JobRecord = { ...job, status, progress, attempt, updatedAt: nextTimestamp };
    this.jobs.set(job.id, updated);
    const event = { jobId: updated.id, status: updated.status, progress: updated.progress, ...(updated.errorCode ? { errorCode: updated.errorCode } : {}) };
    this.listeners.forEach((listener) => listener(event));
    return ok({ ...updated });
  }
}
