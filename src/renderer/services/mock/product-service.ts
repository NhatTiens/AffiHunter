import type {
  Collection,
  CollectionId,
  CreateCollectionInput,
  DateRange,
  DiscoverySummary,
  FileHandle,
  JobReference,
  Page,
  PageRequest,
  Product,
  ProductAnalysis,
  ProductId,
  ProductSearchFilters,
  ProductSearchRequest,
  ProductService,
  Result,
  SaveProductInput,
  SavedProductRecord,
  SavedProductView,
  UpdateSavedProductPatch,
} from "../../../shared/contracts";
import { calculateOpportunityScore, isInDateRange, paginate } from "./calculations";
import {
  fixtureCollections,
  fixtureProducts,
  fixtureSaved,
  fixtureSnapshots,
  FIXTURE_NOW,
} from "./fixtures";
import { assertUtcRange, fail, ok, validPageRequest } from "./result";

export type MockScenario = "normal" | "empty" | "error";

interface MockProductServiceOptions {
  scenario?: MockScenario;
  onImport?: (fileHandle: FileHandle) => JobReference;
}

export class MockProductService implements ProductService {
  private readonly products: Product[];
  private readonly saved = new Map<string, SavedProductRecord>();
  private collections: Collection[];
  private readonly scenario: MockScenario;
  private readonly onImport: (fileHandle: FileHandle) => JobReference;
  private nextCollectionNumber = 2;

  constructor(options: MockProductServiceOptions = {}) {
    this.products = fixtureProducts.map((product) => ({ ...product }));
    this.collections = fixtureCollections.map((collection) => ({ ...collection }));
    Object.entries(fixtureSaved).forEach(([id, value]) => this.saved.set(id, { ...value, collectionIds: [...value.collectionIds] }));
    this.scenario = options.scenario ?? "normal";
    this.onImport = options.onImport ?? (() => ({ jobId: "job-import-products" as JobReference["jobId"] }));
  }

  async getDiscoverySummary(range: DateRange): Promise<Result<DiscoverySummary>> {
    if (this.scenario === "error") return fail("DISCOVERY_SUMMARY_FAILED", "Discovery summary is unavailable in this scenario.", true);
    const valid = assertUtcRange(range);
    if (!valid.ok) return valid;
    const products = this.availableProducts();
    if (this.scenario === "empty") return ok({ totalProducts: 0, risingProducts: 0, averageCommissionRateBps: 0, lowCompetitionPercent: 0 });
    return ok({
      totalProducts: products.length,
      risingProducts: products.filter((product) => product.growthBps > 0).length,
      averageCommissionRateBps: products.length ? Math.round(products.reduce((sum, product) => sum + product.commissionRateBps, 0) / products.length) : 0,
      lowCompetitionPercent: products.length ? Math.round((products.filter((product) => product.competitionScore <= 40).length / products.length) * 100) : 0,
    });
  }

  async searchProducts(request: ProductSearchRequest): Promise<Result<Page<Product>>> {
    if (this.scenario === "error") return fail("PRODUCT_SEARCH_FAILED", "Product search is unavailable in this scenario.", true);
    const validPage = validPageRequest(request.page);
    if (!validPage.ok) return validPage;
    const products = this.availableProducts().filter((product) => this.matches(product, request.filters));
    const sorted = [...products].sort((left, right) => this.compare(left, right, request.sort));
    return ok(paginate(sorted, request.page));
  }

  async getProductAnalysis(productId: ProductId, range: DateRange): Promise<Result<ProductAnalysis>> {
    if (this.scenario === "error") return fail("PRODUCT_ANALYSIS_FAILED", "Product analysis is unavailable in this scenario.", true);
    const valid = assertUtcRange(range);
    if (!valid.ok) return valid;
    const product = this.products.find((item) => item.id === productId);
    if (!product) return fail("PRODUCT_NOT_FOUND", "Product was not found.");
    const snapshots = fixtureSnapshots.filter((snapshot) => snapshot.productId === productId && isInDateRange(snapshot.capturedAt, range));
    return ok({ product: { ...product }, score: calculateOpportunityScore(product, FIXTURE_NOW), snapshots });
  }

  async saveProduct(productId: ProductId, input: SaveProductInput): Promise<Result<SavedProductRecord>> {
    if (this.scenario === "error") return fail("PRODUCT_SAVE_FAILED", "Saving products is unavailable in this scenario.", true);
    const product = this.products.find((item) => item.id === productId);
    if (!product) return fail("PRODUCT_NOT_FOUND", "Product was not found.");
    const existing = this.saved.get(productId);
    const record: SavedProductRecord = {
      productId,
      status: input.status ?? existing?.status ?? "watching",
      priority: input.priority ?? existing?.priority ?? 0,
      notes: input.notes ?? existing?.notes ?? "",
      collectionIds: input.collectionIds ? [...input.collectionIds] : existing?.collectionIds ?? [],
      savedAt: existing?.savedAt ?? FIXTURE_NOW,
    };
    this.saved.set(productId, record);
    return ok({ ...record, collectionIds: [...record.collectionIds] });
  }

  async listSavedProducts(filters: ProductSearchFilters, page: PageRequest): Promise<Result<Page<SavedProductView>>> {
    if (this.scenario === "error") return fail("SAVED_PRODUCTS_FAILED", "Saved products are unavailable in this scenario.", true);
    const validPage = validPageRequest(page);
    if (!validPage.ok) return validPage;
    const views = this.products
      .filter((product) => this.saved.has(product.id) && this.matches(product, filters))
      .filter((product) => !filters.savedStatus || this.saved.get(product.id)?.status === filters.savedStatus)
      .map((product) => ({ product: { ...product }, saved: { ...this.saved.get(product.id)!, collectionIds: [...this.saved.get(product.id)!.collectionIds] } }));
    return ok(paginate(views, page));
  }

  async updateSavedProduct(productId: ProductId, patch: UpdateSavedProductPatch): Promise<Result<SavedProductRecord>> {
    const existing = this.saved.get(productId);
    if (!existing) return fail("SAVED_PRODUCT_NOT_FOUND", "Product is not saved yet.");
    return this.saveProduct(productId, { ...existing, ...patch });
  }

  async listCollections(): Promise<Result<readonly Collection[]>> {
    if (this.scenario === "error") return fail("COLLECTIONS_FAILED", "Collections are unavailable in this scenario.", true);
    return ok(this.collections.map((collection) => ({ ...collection })));
  }

  async createCollection(input: CreateCollectionInput): Promise<Result<Collection>> {
    if (this.scenario === "error") return fail("COLLECTION_CREATE_FAILED", "Creating collections is unavailable in this scenario.", true);
    const name = input.name.trim();
    if (!name) return fail("INVALID_COLLECTION_NAME", "Collection name is required.");
    if (this.collections.some((collection) => collection.name.toLocaleLowerCase() === name.toLocaleLowerCase())) return fail("COLLECTION_EXISTS", "Collection name already exists.");
    const collection: Collection = { id: `collection-${this.nextCollectionNumber++}` as CollectionId, name, position: this.collections.length };
    this.collections = [...this.collections, collection];
    return ok({ ...collection });
  }

  async importProducts(fileHandle: FileHandle): Promise<Result<JobReference>> {
    if (this.scenario === "error") return fail("PRODUCT_IMPORT_FAILED", "Product import is unavailable in this scenario.", true);
    if (!fileHandle || fileHandle.includes("\\") || fileHandle.includes("/")) return fail("INVALID_FILE_HANDLE", "Import requires an opaque file handle.");
    return ok(this.onImport(fileHandle));
  }

  private availableProducts() {
    return this.scenario === "empty" ? [] : this.products;
  }

  private matches(product: Product, filters: ProductSearchFilters): boolean {
    const query = filters.query?.trim().toLocaleLowerCase();
    return (!query || `${product.title} ${product.category}`.toLocaleLowerCase().includes(query)) &&
      (!filters.category || product.category === filters.category) &&
      (!filters.market || product.market === filters.market) &&
      (!filters.source || product.source === filters.source) &&
      (filters.priceMinMinor === undefined || product.priceMinor >= filters.priceMinMinor) &&
      (filters.priceMaxMinor === undefined || product.priceMinor <= filters.priceMaxMinor) &&
      (filters.commissionMinBps === undefined || product.commissionRateBps >= filters.commissionMinBps) &&
      (filters.salesMin === undefined || product.sales30d >= filters.salesMin) &&
      (filters.growthMinBps === undefined || product.growthBps >= filters.growthMinBps) &&
      (filters.competitionMax === undefined || product.competitionScore <= filters.competitionMax);
  }

  private compare(left: Product, right: Product, sort: ProductSearchRequest["sort"]): number {
    const key = sort?.key ?? "opportunity";
    const score = (product: Product) => key === "opportunity" ? calculateOpportunityScore(product, FIXTURE_NOW).total : key === "price" ? product.priceMinor : key === "commission" ? product.commissionRateBps : key === "sales" ? product.sales30d : key === "growth" ? product.growthBps : product.competitionScore;
    const result = score(left) - score(right);
    return (sort?.direction ?? "desc") === "asc" ? result : -result;
  }
}
