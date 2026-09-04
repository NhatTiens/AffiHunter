import type {
  CommissionRecord,
  DateRange,
  Money,
  OrderRecord,
  Product,
  ProductScore,
  UtcTimestamp,
} from "../../../shared/contracts";

export function calculateOpportunityScore(product: Product, calculatedAt: UtcTimestamp): ProductScore {
  const factors = {
    marketDemand: product.market === "VN" ? 92 : 76,
    sales: Math.min(100, Math.round(product.sales30d / 160)),
    growth: Math.min(100, Math.round(product.growthBps / 40)),
    competition: Math.max(0, 100 - product.competitionScore),
  };
  const total = Math.round(
    factors.marketDemand * 0.25 +
      factors.sales * 0.25 +
      factors.growth * 0.25 +
      factors.competition * 0.25,
  );
  return { productId: product.id, calculatedAt, algorithmVersion: "mock-v1", factors, total };
}

export function isInDateRange(timestamp: UtcTimestamp, range: DateRange): boolean {
  const value = Date.parse(timestamp);
  const from = Date.parse(range.fromUtc);
  const to = Date.parse(range.toUtc);
  return Number.isFinite(value) && Number.isFinite(from) && Number.isFinite(to) && value >= from && value <= to;
}

export function calculateRevenueOverview(
  orders: readonly OrderRecord[],
  commissions: readonly CommissionRecord[],
  currency: string,
): { commission: Money; grossRevenue: Money; orderCount: number; paidCommission: Money } {
  const activeOrders = orders.filter((order) => order.status !== "cancelled" && order.status !== "refunded");
  const grossRevenue = activeOrders.reduce((total, order) => total + order.grossMinor, 0);
  const orderIds = new Set(activeOrders.map((order) => order.id));
  const activeCommissions = commissions.filter((commission) => orderIds.has(commission.orderId) && commission.status !== "rejected" && commission.status !== "reversed");
  const commission = activeCommissions.reduce((total, item) => total + item.amountMinor, 0);
  const paidCommission = activeCommissions
    .filter((item) => item.status === "paid")
    .reduce((total, item) => total + item.amountMinor, 0);
  return {
    grossRevenue: { amountMinor: grossRevenue, currency },
    commission: { amountMinor: commission, currency },
    paidCommission: { amountMinor: paidCommission, currency },
    orderCount: activeOrders.length,
  };
}

export function paginate<T>(items: readonly T[], request: { page: number; pageSize: number }) {
  const pageSize = Number.isFinite(request.pageSize) ? Math.min(100, Math.max(1, Math.floor(request.pageSize))) : 20;
  const page = Number.isFinite(request.page) ? Math.max(1, Math.floor(request.page)) : 1;
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page, pageSize, total: items.length };
}
