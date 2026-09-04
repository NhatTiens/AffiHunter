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

const baseProducts: readonly Product[] = [
  {
    id: productId("product-1"),
    source: "tiktok-shop",
    externalId: "tt-1001",
    title: "Máy massage cổ thông minh",
    category: "Sức khỏe",
    market: "VN",
    currency: "VND",
    priceMinor: 329000,
    commissionRateBps: 1800,
    sales30d: 14281,
    growthBps: 2860,
    competitionScore: 24,
    imageUrl: "/product-images/neck-massager.svg",
    ratingTenths: 48,
    reviewCount: 3421,
    creatorCount: 184,
    videoCount: 12,
    trendPoints: [42, 46, 48, 47, 53, 58, 56, 62, 68, 72, 70, 78],
  },
  {
    id: productId("product-2"),
    source: "cj-dropshipping",
    externalId: "cj-2002",
    title: "Máy hút bụi mini không dây",
    category: "Gia dụng",
    market: "VN",
    currency: "VND",
    priceMinor: 359000,
    commissionRateBps: 2000,
    sales30d: 12456,
    growthBps: 3670,
    competitionScore: 31,
    imageUrl: "/product-images/mini-vacuum.svg",
    ratingTenths: 46,
    reviewCount: 2187,
    creatorCount: 156,
    videoCount: 9,
    trendPoints: [38, 44, 43, 51, 55, 52, 60, 66, 63, 70, 74, 80],
  },
  {
    id: productId("product-3"),
    source: "aliexpress",
    externalId: "ae-3003",
    title: "Bình nước thông minh",
    category: "Gia dụng",
    market: "TH",
    currency: "VND",
    priceMinor: 299000,
    commissionRateBps: 1600,
    sales30d: 9876,
    growthBps: 2840,
    competitionScore: 45,
    imageUrl: "/product-images/smart-bottle.svg",
    ratingTenths: 45,
    reviewCount: 1765,
    creatorCount: 122,
    videoCount: 7,
    trendPoints: [35, 39, 41, 44, 43, 48, 52, 49, 57, 61, 58, 64],
  },
  {
    id: productId("product-4"),
    source: "amazon",
    externalId: "am-4004",
    title: "Đèn ngủ cảm ứng cute",
    category: "Trang trí",
    market: "ID",
    currency: "VND",
    priceMinor: 189000,
    commissionRateBps: 1700,
    sales30d: 8765,
    growthBps: 3120,
    competitionScore: 52,
    imageUrl: "/product-images/night-lamp.svg",
    ratingTenths: 47,
    reviewCount: 1432,
    creatorCount: 98,
    videoCount: 6,
    trendPoints: [31, 33, 37, 35, 42, 45, 44, 50, 55, 53, 59, 62],
  },
];

export const fixtureProducts: readonly Product[] = [
  ...baseProducts,
  ...Array.from({ length: 8 }, (_, index) => {
    const template = baseProducts[index % baseProducts.length];
    const number = index + 5;
    return {
      ...template,
      id: productId(`product-${number}`),
      externalId: `${template.source}-${number}005`,
      title: `Sản phẩm trend ${number}`,
      category: number % 2 === 0 ? "Gia dụng" : "Sức khỏe",
      market: (number % 3 === 0 ? "TH" : "VN") as Product["market"],
      priceMinor: template.priceMinor + number * 7000,
      commissionRateBps: template.commissionRateBps + (number % 3) * 100,
      sales30d: template.sales30d - number * 230,
      growthBps: template.growthBps - number * 80,
      competitionScore: Math.min(80, template.competitionScore + number * 3),
      imageUrl: `/product-images/${["neck-massager", "mini-vacuum", "smart-bottle", "night-lamp"][index % 4]}.svg`,
      ratingTenths: Math.max(40, template.ratingTenths - (number % 3)),
      reviewCount: template.reviewCount - number * 37,
      creatorCount: template.creatorCount - number * 5,
      videoCount: Math.max(3, template.videoCount - (number % 4)),
      trendPoints: template.trendPoints.map((point) => Math.max(20, point - number)),
    };
  }),
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
    grossMinor: 329000,
    currency: "VND",
  },
  {
    id: "order-2" as OrderRecord["id"],
    source: "tiktok-shop" as ProductSource,
    productId: productId("product-1"),
    publicationId: publicationId("publication-1"),
    status: "processing",
    orderedAt: utc("2026-07-07T02:00:00.000Z"),
    grossMinor: 329000,
    currency: "VND",
  },
  {
    id: "order-3" as OrderRecord["id"],
    source: "cj-dropshipping",
    productId: productId("product-2"),
    publicationId: publicationId("publication-2"),
    status: "completed",
    orderedAt: utc("2026-07-05T05:00:00.000Z"),
    grossMinor: 359000,
    currency: "VND",
  },
];

export const fixtureCommissions: readonly CommissionRecord[] = [
  { id: "commission-1" as CommissionRecord["id"], orderId: "order-1" as CommissionRecord["orderId"], status: "paid", amountMinor: 59220, currency: "VND" },
  { id: "commission-2" as CommissionRecord["id"], orderId: "order-2" as CommissionRecord["orderId"], status: "pending", amountMinor: 59220, currency: "VND" },
  { id: "commission-3" as CommissionRecord["id"], orderId: "order-3" as CommissionRecord["orderId"], status: "approved", amountMinor: 71800, currency: "VND" },
];

export const fixtureMarkets: readonly Market[] = ["VN", "TH", "ID", "PH", "MY"];
