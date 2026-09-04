import type {
  Collection,
  CollectionId,
  CommissionRecord,
  ContentProjectId,
  JsonObject,
  Market,
  OrderRecord,
  Product,
  ProductId,
  ProductSnapshot,
  ProductSource,
  PublicationId,
  UtcTimestamp,
  VideoProjectId,
} from "../../../shared/contracts";

const utc = (value: string) => value as UtcTimestamp;
const productId = (value: string) => value as ProductId;
const collectionId = (value: string) => value as CollectionId;
const contentProjectId = (value: string) => value as ContentProjectId;
const videoProjectId = (value: string) => value as VideoProjectId;
const publicationId = (value: string) => value as PublicationId;

export const FIXTURE_NOW = utc("2026-07-07T03:30:00.000Z");

export const fixtureProducts: readonly Product[] = [
  {
    id: productId("product-1"),
    source: "tiktok-shop",
    externalId: "tt-1001",
    title: "Máy massage cổ thông minh",
    category: "Sức khỏe",
    market: "VN",
    currency: "VND",
    priceMinor: 32900000,
    commissionRateBps: 1800,
    sales30d: 14281,
    growthBps: 2860,
    competitionScore: 24,
  },
  {
    id: productId("product-2"),
    source: "cj-dropshipping",
    externalId: "cj-2002",
    title: "Máy hút bụi mini không dây",
    category: "Gia dụng",
    market: "VN",
    currency: "VND",
    priceMinor: 35900000,
    commissionRateBps: 2000,
    sales30d: 12456,
    growthBps: 3670,
    competitionScore: 31,
  },
  {
    id: productId("product-3"),
    source: "aliexpress",
    externalId: "ae-3003",
    title: "Bình nước thông minh",
    category: "Gia dụng",
    market: "TH",
    currency: "VND",
    priceMinor: 29900000,
    commissionRateBps: 1600,
    sales30d: 9876,
    growthBps: 2840,
    competitionScore: 45,
  },
  {
    id: productId("product-4"),
    source: "amazon",
    externalId: "am-4004",
    title: "Đèn ngủ cảm ứng cute",
    category: "Trang trí",
    market: "ID",
    currency: "VND",
    priceMinor: 18900000,
    commissionRateBps: 1700,
    sales30d: 8765,
    growthBps: 3120,
    competitionScore: 52,
  },
];

export const fixtureCollections: readonly Collection[] = [
  { id: collectionId("collection-1"), name: "Đang thử nghiệm", position: 0 },
];

export const fixtureSaved: Readonly<Record<string, {
  collectionIds: readonly CollectionId[];
  notes: string;
  priority: number;
  productId: ProductId;
  savedAt: UtcTimestamp;
  status: "watching" | "testing" | "paused" | "tested" | "archived";
}>> = {
  "product-1": {
    productId: productId("product-1"),
    status: "testing",
    priority: 1,
    notes: "Kiểm tra creator ngách sức khỏe.",
    savedAt: utc("2026-07-01T03:00:00.000Z"),
    collectionIds: [collectionId("collection-1")],
  },
};

export const fixtureSnapshots: readonly ProductSnapshot[] = fixtureProducts.flatMap(
  (product) => [
    {
      productId: product.id,
      capturedAt: utc("2026-07-01T03:30:00.000Z"),
      priceMinor: product.priceMinor,
      sales30d: product.sales30d - 800,
      estimatedRevenueMinor: (product.sales30d - 800) * product.priceMinor,
      competitionScore: product.competitionScore + 3,
    },
    {
      productId: product.id,
      capturedAt: FIXTURE_NOW,
      priceMinor: product.priceMinor,
      sales30d: product.sales30d,
      estimatedRevenueMinor: product.sales30d * product.priceMinor,
      competitionScore: product.competitionScore,
    },
  ],
);

export const fixtureContentProjects: readonly JsonObject[] = [
  {
    id: contentProjectId("content-project-1"),
    productId: productId("product-1"),
    title: "Massage cổ thông minh - test hook",
  },
  {
    id: contentProjectId("content-project-2"),
    productId: productId("product-2"),
    title: "Máy hút bụi mini - test demo",
  },
];

export const fixtureVideoProjects: readonly JsonObject[] = [
  {
    id: videoProjectId("video-project-1"),
    contentProjectId: contentProjectId("content-project-1"),
    versionId: "video-version-1",
  },
  {
    id: videoProjectId("video-project-2"),
    contentProjectId: contentProjectId("content-project-2"),
    versionId: "video-version-2",
  },
];

export const fixturePublications: readonly JsonObject[] = [
  {
    id: publicationId("publication-1"),
    videoProjectId: videoProjectId("video-project-1"),
    productId: productId("product-1"),
    platform: "tiktok-shop",
    status: "published",
  },
  {
    id: publicationId("publication-2"),
    videoProjectId: videoProjectId("video-project-2"),
    productId: productId("product-2"),
    platform: "tiktok-shop",
    status: "published",
  },
];

export const fixtureOrders: readonly OrderRecord[] = [
  {
    id: "order-1" as OrderRecord["id"],
    source: "tiktok-shop" as ProductSource,
    productId: productId("product-1"),
    publicationId: publicationId("publication-1"),
    status: "completed",
    orderedAt: utc("2026-07-06T04:00:00.000Z"),
    grossMinor: 32900000,
    currency: "VND",
  },
  {
    id: "order-2" as OrderRecord["id"],
    source: "tiktok-shop" as ProductSource,
    productId: productId("product-1"),
    publicationId: publicationId("publication-1"),
    status: "processing",
    orderedAt: utc("2026-07-07T02:00:00.000Z"),
    grossMinor: 32900000,
    currency: "VND",
  },
  {
    id: "order-3" as OrderRecord["id"],
    source: "cj-dropshipping",
    productId: productId("product-2"),
    publicationId: publicationId("publication-2"),
    status: "completed",
    orderedAt: utc("2026-07-05T05:00:00.000Z"),
    grossMinor: 35900000,
    currency: "VND",
  },
];

export const fixtureCommissions: readonly CommissionRecord[] = [
  { id: "commission-1" as CommissionRecord["id"], orderId: "order-1" as CommissionRecord["orderId"], status: "paid", amountMinor: 5922000, currency: "VND" },
  { id: "commission-2" as CommissionRecord["id"], orderId: "order-2" as CommissionRecord["orderId"], status: "pending", amountMinor: 5922000, currency: "VND" },
  { id: "commission-3" as CommissionRecord["id"], orderId: "order-3" as CommissionRecord["orderId"], status: "approved", amountMinor: 7180000, currency: "VND" },
];

export const fixtureMarkets: readonly Market[] = ["VN", "TH", "ID", "PH", "MY"];
