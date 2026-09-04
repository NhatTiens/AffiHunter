import type {
  CommerceService,
  CommerceSyncInput,
  DateRange,
  FileHandle,
  JobReference,
  OrderFilters,
  OrderRecord,
  OrderSummary,
  Page,
  PageRequest,
  Result,
  RevenueOverview,
} from "../../../shared/contracts";
import { calculateRevenueOverview, isInDateRange, paginate } from "./calculations";
import { fixtureCommissions, fixtureOrders } from "./fixtures";
import { assertUtcRange, fail, ok, validPageRequest } from "./result";

interface MockCommerceServiceOptions {
  createJob?: (type: "sync-orders") => JobReference;
  scenario?: "normal" | "empty" | "error";
}

export class MockCommerceService implements CommerceService {
  private readonly orders: OrderRecord[];
  private readonly scenario: MockCommerceServiceOptions["scenario"];
  private readonly createJob: (type: "sync-orders") => JobReference;

  constructor(options: MockCommerceServiceOptions = {}) {
    this.orders = fixtureOrders.map((order) => ({ ...order }));
    this.scenario = options.scenario ?? "normal";
    this.createJob = options.createJob ?? (() => ({ jobId: "job-sync-orders" as JobReference["jobId"] }));
  }

  async getOrderSummary(range: DateRange): Promise<Result<OrderSummary>> {
    const valid = assertUtcRange(range);
    if (!valid.ok) return valid;
    const orders = this.filteredOrders(range);
    return ok({
      orderCount: orders.length,
      completedOrders: orders.filter((order) => order.status === "completed").length,
      pendingOrders: orders.filter((order) => order.status === "processing").length,
      grossRevenue: { amountMinor: orders.reduce((sum, order) => sum + order.grossMinor, 0), currency: "VND" },
    });
  }

  async listOrders(filters: OrderFilters, page: PageRequest): Promise<Result<Page<OrderRecord>>> {
    if (this.scenario === "error") return fail("ORDERS_UNAVAILABLE", "Orders are unavailable in this scenario.", true);
    const validPage = validPageRequest(page);
    if (!validPage.ok) return validPage;
    const orders = this.scenario === "empty" ? [] : this.orders.filter((order) =>
      (!filters.productId || order.productId === filters.productId) &&
      (!filters.source || order.source === filters.source) &&
      (!filters.status || order.status === filters.status),
    );
    return ok(paginate(orders.map((order) => ({ ...order })), page));
  }

  async getRevenueOverview(range: DateRange): Promise<Result<RevenueOverview>> {
    const valid = assertUtcRange(range);
    if (!valid.ok) return valid;
    return ok(calculateRevenueOverview(this.scenario === "empty" ? [] : this.filteredOrders(range), fixtureCommissions, "VND"));
  }

  async rebuildRevenueProjection(range: DateRange): Promise<Result<RevenueOverview>> {
    return this.getRevenueOverview(range);
  }

  async syncOrders(input: CommerceSyncInput): Promise<Result<JobReference>> {
    if (!input.source) return fail("INVALID_SOURCE", "An order source is required.");
    return ok(this.createJob("sync-orders"));
  }

  async importOrders(fileHandle: FileHandle): Promise<Result<JobReference>> {
    if (!fileHandle || fileHandle.includes("\\") || fileHandle.includes("/")) return fail("INVALID_FILE_HANDLE", "Import requires an opaque file handle.");
    return ok(this.createJob("sync-orders"));
  }

  private filteredOrders(range: DateRange) {
    return (this.scenario === "empty" ? [] : this.orders).filter((order) => isInDateRange(order.orderedAt, range));
  }
}
