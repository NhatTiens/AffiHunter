import { describe, expect, it } from "vitest";
import type {
  DateRange,
  FileHandle,
  JobId,
  JobReference,
  ProductId,
  UtcTimestamp,
} from "../../src/shared/contracts";
import {
  fixtureCommissions,
  fixtureContentProjects,
  fixtureOrders,
  fixturePublications,
  fixtureVideoProjects,
  FIXTURE_NOW,
} from "../../src/renderer/services/mock/fixtures";
import { calculateOpportunityScore, calculateRevenueOverview } from "../../src/renderer/services/mock/calculations";
import { MockCommerceService } from "../../src/renderer/services/mock/commerce-service";
import { MockJobService } from "../../src/renderer/services/mock/job-service";
import { MockOnboardingService } from "../../src/renderer/services/mock/onboarding-service";
import { MockProductService } from "../../src/renderer/services/mock/product-service";
import { createMockAppServices } from "../../src/renderer/services/mock/composition";

const range: DateRange = {
  fromUtc: "2026-07-01T00:00:00.000Z" as UtcTimestamp,
  toUtc: "2026-07-07T23:59:59.999Z" as UtcTimestamp,
  timezone: "Asia/Ho_Chi_Minh",
};

const page = { page: 1, pageSize: 20 };

describe("mock service composition", () => {
  it("exposes one typed facade with separate capability implementations", () => {
    const services = createMockAppServices();
    expect(Object.keys(services).sort()).toEqual([
      "commerce",
      "content",
      "jobs",
      "media",
      "notifications",
      "onboarding",
      "performance",
      "products",
      "publishing",
      "reports",
      "settings",
      "videos",
    ]);
    expect(services.products).not.toBe(services.commerce);
    expect(services.jobs).not.toBe(services.products);
  });
});

describe("MockProductService", () => {
  it("filters by query, category, market, source, price, commission, sales, growth, and competition", async () => {
    const service = new MockProductService();
    const result = await service.searchProducts({
      filters: {
        query: "bụi",
        category: "Gia dụng",
        market: "VN",
        source: "cj-dropshipping",
        priceMinMinor: 30000000,
        priceMaxMinor: 40000000,
        commissionMinBps: 1900,
        salesMin: 12000,
        growthMinBps: 3000,
        competitionMax: 40,
      },
      page,
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        total: 1,
        items: [expect.objectContaining({ id: "product-2" })],
      }),
    });
  });

  it("sorts and paginates deterministically", async () => {
    const service = new MockProductService();
    const result = await service.searchProducts({
      filters: {},
      sort: { key: "price", direction: "asc" },
      page: { page: 2, pageSize: 2 },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toMatchObject({ page: 2, pageSize: 2, total: 4 });
      expect(result.value.items.map((item) => item.id)).toEqual(["product-1", "product-2"]);
    }
  });

  it("returns a reproducible opportunity score and analysis snapshots", async () => {
    const service = new MockProductService();
    const result = await service.getProductAnalysis("product-1" as ProductId, range);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.score).toEqual(calculateOpportunityScore(result.value.product, FIXTURE_NOW));
      expect(result.value.snapshots).toHaveLength(2);
      expect(result.value.product.priceMinor % 1).toBe(0);
    }
  });

  it("updates saved query results after save and status mutation", async () => {
    const service = new MockProductService();
    const before = await service.listSavedProducts({}, page);
    expect(before.ok && before.value.total).toBe(1);

    const saved = await service.saveProduct("product-2" as ProductId, { status: "watching", priority: 2 });
    expect(saved.ok).toBe(true);
    const updated = await service.updateSavedProduct("product-2" as ProductId, { status: "tested" });
    expect(updated.ok && updated.value.status).toBe("tested");
    const after = await service.listSavedProducts({ savedStatus: "tested" }, page);
    expect(after.ok && after.value.items.map((item) => item.product.id)).toEqual(["product-2"]);
  });

  it("supports collection creation and rejects duplicate names", async () => {
    const service = new MockProductService();
    const created = await service.createCollection({ name: "Watch later" });
    expect(created.ok && created.value.id).toBe("collection-2");
    const duplicate = await service.createCollection({ name: " watch later " });
    expect(duplicate).toMatchObject({ ok: false, error: { code: "COLLECTION_EXISTS" } });
  });

  it("accepts opaque handles and rejects raw filesystem paths", async () => {
    const service = new MockProductService({ onImport: (fileHandle) => ({ jobId: `imported:${fileHandle}` as JobReference["jobId"] }) });
    await expect(service.importProducts("file-handle-1" as FileHandle)).resolves.toEqual({ ok: true, value: { jobId: "imported:file-handle-1" } });
    await expect(service.importProducts("C:/Users/user/products.csv" as FileHandle)).resolves.toMatchObject({ ok: false, error: { code: "INVALID_FILE_HANDLE" } });
  });

  it("supports deterministic empty and error scenarios", async () => {
    const empty = new MockProductService({ scenario: "empty" });
    const emptyResult = await empty.searchProducts({ filters: {}, page });
    expect(emptyResult.ok && emptyResult.value.total).toBe(0);
    const error = new MockProductService({ scenario: "error" });
    await expect(error.searchProducts({ filters: {}, page })).resolves.toMatchObject({ ok: false, error: { retryable: true } });
    await expect(error.getDiscoverySummary(range)).resolves.toMatchObject({ ok: false, error: { code: "DISCOVERY_SUMMARY_FAILED" } });
  });
});

describe("commerce fixtures and calculations", () => {
  it("keeps the product-content-video-publication-order-commission trace intact", () => {
    for (const order of fixtureOrders) {
      const publication = fixturePublications.find((item) => item.id === order.publicationId);
      const video = fixtureVideoProjects.find((item) => item.id === publication?.videoProjectId);
      const content = fixtureContentProjects.find((item) => item.id === video?.contentProjectId);
      expect(publication?.productId).toBe(order.productId);
      expect(content?.productId).toBe(order.productId);
    }
    expect(fixtureCommissions.every((commission) => fixtureOrders.some((order) => order.id === commission.orderId))).toBe(true);
  });

  it("reconciles gross, commission, and paid commission totals in integer minor units", async () => {
    const calculated = calculateRevenueOverview(fixtureOrders, fixtureCommissions, "VND");
    const service = new MockCommerceService();
    const result = await service.getRevenueOverview(range);
    expect(result).toEqual({ ok: true, value: calculated });
    expect(calculated.grossRevenue.amountMinor).toBe(101700000);
    expect(calculated.commission.amountMinor).toBe(19024000);
    expect(calculated.paidCommission.amountMinor).toBe(5922000);
  });

  it("supports commerce filters and deterministic empty/error scenarios", async () => {
    const service = new MockCommerceService();
    const filtered = await service.listOrders({ status: "completed", source: "tiktok-shop" }, page);
    expect(filtered.ok && filtered.value.items).toHaveLength(1);
    const empty = new MockCommerceService({ scenario: "empty" });
    const emptyResult = await empty.listOrders({}, page);
    expect(emptyResult.ok && emptyResult.value.total).toBe(0);
    const error = new MockCommerceService({ scenario: "error" });
    await expect(error.listOrders({}, page)).resolves.toMatchObject({ ok: false, error: { retryable: true } });
  });

  it("creates queryable jobs through the composed commerce facade", async () => {
    const services = createMockAppServices();
    const queued = await services.commerce.syncOrders({ source: "tiktok-shop" });
    expect(queued.ok).toBe(true);
    if (queued.ok) {
      await expect(services.jobs.get(queued.value.jobId)).resolves.toMatchObject({ ok: true, value: { status: "queued", type: "sync-orders" } });
    }
  });
});

describe("MockJobService", () => {
  it("cancels, retries, publishes progress, and unsubscribes without timers", async () => {
    const jobs = new MockJobService();
    const events: string[] = [];
    const unsubscribe = jobs.subscribe((event) => events.push(`${event.jobId}:${event.status}:${event.progress}`));
    const cancelled = await jobs.cancel("job-1" as JobId);
    expect(cancelled.ok && cancelled.value.status).toBe("cancelled");
    const retried = await jobs.retry("job-1" as JobId);
    expect(retried.ok && retried.value.status).toBe("queued");
    expect(events).toEqual(["job-1:cancelled:0", "job-1:queued:0"]);
    unsubscribe();
    await jobs.cancel("job-3" as JobId);
    expect(events).toHaveLength(2);
  });

  it("rejects invalid state transitions", async () => {
    const jobs = new MockJobService();
    await expect(jobs.cancel("job-2" as JobId)).resolves.toMatchObject({ ok: false, error: { code: "JOB_NOT_CANCELLABLE" } });
    await expect(jobs.retry("job-1" as JobId)).resolves.toMatchObject({ ok: false, error: { code: "JOB_NOT_RETRYABLE" } });
  });
});

describe("MockOnboardingService", () => {
  it("keeps onboarding state transitions explicit and deterministic", async () => {
    const service = new MockOnboardingService();
    expect((await service.getState())).toEqual({ ok: true, value: { currentStep: 1, totalSteps: 8, completed: false } });
    expect((await service.saveStep({ step: 3, data: {} }))).toMatchObject({ ok: true, value: { currentStep: 3 } });
    expect((await service.complete())).toMatchObject({ ok: true, value: { currentStep: 8, completed: true } });
    expect((await service.saveStep({ step: 9, data: {} }))).toMatchObject({ ok: false, error: { code: "INVALID_ONBOARDING_STEP" } });
    expect((await service.reset())).toMatchObject({ ok: true, value: { currentStep: 1, completed: false } });
  });
});
