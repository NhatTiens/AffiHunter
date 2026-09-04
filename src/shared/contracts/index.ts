export type Id<T extends string> = string & { readonly __type: T };
export type ProductId = Id<"ProductId">;
export type CollectionId = Id<"CollectionId">;
export type SavedProductId = Id<"SavedProductId">;
export type ContentProjectId = Id<"ContentProjectId">;
export type MediaAssetId = Id<"MediaAssetId">;
export type VideoProjectId = Id<"VideoProjectId">;
export type VideoVersionId = Id<"VideoVersionId">;
export type PublicationId = Id<"PublicationId">;
export type OrderId = Id<"OrderId">;
export type CommissionId = Id<"CommissionId">;
export type JobId = Id<"JobId">;
export type FileHandle = Id<"FileHandle">;
export type DirectoryHandle = Id<"DirectoryHandle">;
export type UtcTimestamp = string & { readonly __type: "UtcTimestamp" };

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | readonly JsonValue[];
export type JsonObject = { readonly [key: string]: JsonValue };

export interface AppError {
  code: string;
  fieldErrors?: Readonly<Record<string, readonly string[]>>;
  message: string;
  retryable: boolean;
}

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: AppError };

export interface PageRequest {
  page: number;
  pageSize: number;
}

export interface Page<T> {
  items: readonly T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface DateRange {
  fromUtc: UtcTimestamp;
  toUtc: UtcTimestamp;
  timezone: string;
}

export interface Money {
  amountMinor: number;
  currency: string;
}

export type ProductSource = "tiktok-shop" | "cj-dropshipping" | "aliexpress" | "amazon";
export type Market = "VN" | "TH" | "ID" | "PH" | "MY";
export type SavedProductStatus = "watching" | "testing" | "paused" | "tested" | "archived";

export interface Product {
  category: string;
  commissionMinor?: number;
  commissionRateBps: number;
  competitionScore: number;
  currency: string;
  externalId: string;
  growthBps: number;
  id: ProductId;
  imageUrl: string;
  market: Market;
  creatorCount: number;
  priceMinor: number;
  ratingTenths: number;
  reviewCount: number;
  sales30d: number;
  source: ProductSource;
  title: string;
  trendPoints: readonly number[];
  videoCount: number;
  opportunityScore?: number;
}

export interface ProductScore {
  algorithmVersion: string;
  calculatedAt: UtcTimestamp;
  factors: Readonly<{
    competition: number;
    growth: number;
    marketDemand: number;
    sales: number;
  }>;
  productId: ProductId;
  total: number;
}

export interface ProductSnapshot {
  capturedAt: UtcTimestamp;
  competitionScore: number;
  estimatedRevenueMinor: number;
  priceMinor: number;
  productId: ProductId;
  sales30d: number;
}

export interface ProductAnalysis {
  competition: CompetitionBreakdown;
  creators: readonly CreatorActivity[];
  product: Product;
  riskFactors: readonly RiskFactor[];
  score: ProductScore;
  snapshots: readonly ProductSnapshot[];
  trendGrowthBps: number;
  videos: readonly VideoActivity[];
}

export interface CompetitionBreakdown {
  relatedCreators: number;
  relatedVideos: number;
  score: number;
}

export interface CreatorActivity {
  handle: string;
  followers: number;
  sales30d: number;
  videoCount: number;
}

export interface VideoActivity {
  id: Id<"VideoId">;
  title: string;
  views: number;
  orders: number;
  durationSeconds: number;
}

export interface RiskFactor {
  label: string;
  level: "low" | "medium" | "high";
  detail: string;
}

export interface ProductSearchFilters {
  category?: string;
  commissionMinBps?: number;
  competitionMax?: number;
  growthMinBps?: number;
  market?: Market;
  opportunityScoreMax?: number;
  opportunityScoreMin?: number;
  priceMaxMinor?: number;
  priceMinMinor?: number;
  query?: string;
  salesMin?: number;
  savedStatus?: SavedProductStatus;
  source?: ProductSource;
}

export type ProductSortKey =
  | "opportunity"
  | "price"
  | "commission"
  | "sales"
  | "growth"
  | "competition";

export interface ProductSort {
  direction: "asc" | "desc";
  key: ProductSortKey;
}

export interface ProductSearchRequest {
  filters: ProductSearchFilters;
  page: PageRequest;
  sort?: ProductSort;
}

export interface DiscoverySummary {
  averageCommissionRateBps: number;
  lowCompetitionPercent: number;
  risingProducts: number;
  totalProducts: number;
}

export interface SaveProductInput {
  collectionIds?: readonly CollectionId[];
  notes?: string;
  priority?: number;
  status?: SavedProductStatus;
}

export interface SavedProductRecord {
  collectionIds: readonly CollectionId[];
  notes: string;
  priority: number;
  productId: ProductId;
  savedAt: UtcTimestamp;
  status: SavedProductStatus;
}

export interface UpdateSavedProductPatch {
  collectionIds?: readonly CollectionId[];
  notes?: string;
  priority?: number;
  status?: SavedProductStatus;
}

export interface SavedProductView {
  product: Product;
  saved: SavedProductRecord;
}

export interface Collection {
  id: CollectionId;
  name: string;
  position: number;
}

export interface CreateCollectionInput {
  name: string;
}

export interface OnboardingState {
  completed: boolean;
  currentStep: number;
  totalSteps: number;
}

export interface OnboardingStepInput {
  data: JsonObject;
  step: number;
}

export interface JobReference {
  jobId: JobId;
}

export type JobStatus = "queued" | "running" | "retry_wait" | "succeeded" | "failed" | "cancelled";
export type JobType = "sync-orders" | "import-products" | "render-video" | "generation";

export interface JobRecord {
  attempt: number;
  createdAt: UtcTimestamp;
  errorCode?: string;
  id: JobId;
  input: JsonObject;
  progress: number;
  status: JobStatus;
  type: JobType;
  updatedAt: UtcTimestamp;
}

export interface JobFilters {
  status?: JobStatus;
  type?: JobType;
}

export interface JobProgressEvent {
  errorCode?: string;
  jobId: JobId;
  progress: number;
  status: JobStatus;
}

export type JobListener = (event: JobProgressEvent) => void;

export type OrderStatus = "processing" | "completed" | "cancelled" | "returned" | "refunded";
export type CommissionStatus = "pending" | "approved" | "rejected" | "paid" | "reversed";

export interface OrderRecord {
  currency: string;
  grossMinor: number;
  id: OrderId;
  orderedAt: UtcTimestamp;
  productId: ProductId;
  publicationId: PublicationId;
  source: ProductSource;
  status: OrderStatus;
}

export interface CommissionRecord {
  amountMinor: number;
  currency: string;
  id: CommissionId;
  orderId: OrderId;
  status: CommissionStatus;
}

export interface OrderFilters {
  productId?: ProductId;
  source?: ProductSource;
  status?: OrderStatus;
}

export interface OrderSummary {
  completedOrders: number;
  grossRevenue: Money;
  orderCount: number;
  pendingOrders: number;
}

export interface RevenueOverview {
  commission: Money;
  grossRevenue: Money;
  orderCount: number;
  paidCommission: Money;
}

export interface CommerceSyncInput {
  source: ProductSource;
}

export interface AppServices {
  commerce: CommerceService;
  content: ContentService;
  jobs: JobService;
  media: MediaService;
  notifications: NotificationService;
  onboarding: OnboardingService;
  performance: PerformanceService;
  products: ProductService;
  publishing: PublishingService;
  reports: ReportService;
  settings: SettingsService;
  videos: VideoFactoryService;
}

export interface OnboardingService {
  complete(): Promise<Result<OnboardingState>>;
  getState(): Promise<Result<OnboardingState>>;
  reset(): Promise<Result<OnboardingState>>;
  saveStep(input: OnboardingStepInput): Promise<Result<OnboardingState>>;
}

export interface ProductService {
  createCollection(input: CreateCollectionInput): Promise<Result<Collection>>;
  getDiscoverySummary(range: DateRange): Promise<Result<DiscoverySummary>>;
  getProductAnalysis(productId: ProductId, range: DateRange): Promise<Result<ProductAnalysis>>;
  importProducts(fileHandle: FileHandle): Promise<Result<JobReference>>;
  listCollections(): Promise<Result<readonly Collection[]>>;
  listSavedProducts(filters: ProductSearchFilters, page: PageRequest): Promise<Result<Page<SavedProductView>>>;
  saveProduct(productId: ProductId, input: SaveProductInput): Promise<Result<SavedProductRecord>>;
  searchProducts(request: ProductSearchRequest): Promise<Result<Page<Product>>>;
  updateSavedProduct(productId: ProductId, patch: UpdateSavedProductPatch): Promise<Result<SavedProductRecord>>;
}

export interface ContentService {
  buildStoryboard(scriptId: Id<"ScriptId">): Promise<Result<JsonObject>>;
  createIdea(input: JsonObject): Promise<Result<JsonObject>>;
  generateIdeas(input: JsonObject): Promise<Result<JobReference>>;
  generateScript(input: JsonObject): Promise<Result<JobReference>>;
  getWorkspace(productId?: ProductId): Promise<Result<JsonObject>>;
  listIdeas(filters: JsonObject, page: PageRequest): Promise<Result<Page<JsonObject>>>;
  listScripts(filters: JsonObject, page: PageRequest): Promise<Result<Page<JsonObject>>>;
  optimizeScript(scriptId: Id<"ScriptId">, instruction: string): Promise<Result<JobReference>>;
  saveContentVersion(input: JsonObject): Promise<Result<JsonObject>>;
  updateIdea(ideaId: Id<"IdeaId">, patch: JsonObject): Promise<Result<JsonObject>>;
}

export interface MediaService {
  downloadAsset(assetId: MediaAssetId, destinationHandle: DirectoryHandle): Promise<Result<JobReference>>;
  generateImages(input: JsonObject): Promise<Result<JobReference>>;
  generateVideo(input: JsonObject): Promise<Result<JobReference>>;
  generateVoice(input: JsonObject): Promise<Result<JobReference>>;
  getGenerationHistory(filters: JsonObject, page: PageRequest): Promise<Result<Page<JsonObject>>>;
  importAssets(fileHandles: readonly FileHandle[]): Promise<Result<readonly JobReference[]>>;
  listAssets(filters: JsonObject, page: PageRequest): Promise<Result<Page<JsonObject>>>;
}

export interface VideoFactoryService {
  approveVersion(versionId: VideoVersionId): Promise<Result<JsonObject>>;
  createProject(input: JsonObject): Promise<Result<JsonObject>>;
  createVersion(projectId: VideoProjectId): Promise<Result<JsonObject>>;
  getProject(projectId: VideoProjectId): Promise<Result<JsonObject>>;
  listRenderQueue(): Promise<Result<readonly JsonObject[]>>;
  queueRender(versionId: VideoVersionId, settings: JsonObject): Promise<Result<JobReference>>;
  updateTimeline(projectId: VideoProjectId, expectedRevision: number, patch: JsonObject): Promise<Result<JsonObject>>;
}

export interface PublishingService {
  cancelSchedule(scheduleId: Id<"ScheduleId">): Promise<Result<JsonObject>>;
  getComposer(draftId: Id<"PublishDraftId">): Promise<Result<JsonObject>>;
  getSuggestedSlots(input: JsonObject): Promise<Result<readonly JsonObject[]>>;
  listCalendar(range: DateRange, platforms: readonly string[]): Promise<Result<readonly JsonObject[]>>;
  publishNow(input: JsonObject): Promise<Result<JobReference>>;
  retryPublication(publicationId: PublicationId): Promise<Result<JobReference>>;
  saveDraft(input: JsonObject): Promise<Result<JsonObject>>;
  schedule(input: JsonObject): Promise<Result<JsonObject>>;
}

export interface PerformanceService {
  getRecommendations(subject: JsonObject): Promise<Result<readonly JsonObject[]>>;
  getVideoAnalysis(videoId: Id<"VideoId">, range: DateRange): Promise<Result<JsonObject>>;
  listVideoPerformance(filters: JsonObject, page: PageRequest): Promise<Result<Page<JsonObject>>>;
  syncVideoMetrics(input: JsonObject): Promise<Result<JobReference>>;
}

export interface CommerceService {
  getOrderSummary(range: DateRange): Promise<Result<OrderSummary>>;
  getRevenueOverview(range: DateRange): Promise<Result<RevenueOverview>>;
  importOrders(fileHandle: FileHandle): Promise<Result<JobReference>>;
  listOrders(filters: OrderFilters, page: PageRequest): Promise<Result<Page<OrderRecord>>>;
  rebuildRevenueProjection(range: DateRange): Promise<Result<RevenueOverview>>;
  syncOrders(input: CommerceSyncInput): Promise<Result<JobReference>>;
}

export interface ReportService {
  createExport(input: JsonObject): Promise<Result<JobReference>>;
  downloadExport(exportId: Id<"ReportExportId">, destinationHandle: DirectoryHandle): Promise<Result<JobReference>>;
  getDashboard(range: DateRange): Promise<Result<JsonObject>>;
  getReportOverview(range: DateRange): Promise<Result<JsonObject>>;
  listExports(page: PageRequest): Promise<Result<Page<JsonObject>>>;
}

export interface NotificationService {
  getSummary(range: DateRange): Promise<Result<JsonObject>>;
  list(filters: JsonObject, page: PageRequest): Promise<Result<Page<JsonObject>>>;
  markAllRead(): Promise<Result<{ updated: number }>>;
  markRead(ids: readonly Id<"NotificationId">[]): Promise<Result<{ updated: number }>>;
  updatePreferences(input: JsonObject): Promise<Result<JsonObject>>;
}

export interface SettingsService {
  chooseManagedDirectory(kind: string): Promise<Result<DirectoryHandle>>;
  connectPlatform(input: JsonObject): Promise<Result<JsonObject>>;
  createBackup(destinationHandle: DirectoryHandle): Promise<Result<JobReference>>;
  disconnectPlatform(connectionId: Id<"PlatformConnectionId">): Promise<Result<JsonObject>>;
  getSettings(): Promise<Result<JsonObject>>;
  listConnections(): Promise<Result<readonly JsonObject[]>>;
  restoreBackup(fileHandle: FileHandle): Promise<Result<JobReference>>;
  storeProviderCredential(input: JsonObject): Promise<Result<JsonObject>>;
  testProviderConnection(input: JsonObject): Promise<Result<JsonObject>>;
  updatePreferences(patch: JsonObject): Promise<Result<JsonObject>>;
}

export interface JobService {
  cancel(jobId: JobId): Promise<Result<JobRecord>>;
  get(jobId: JobId): Promise<Result<JobRecord>>;
  list(filters: JobFilters, page: PageRequest): Promise<Result<Page<JobRecord>>>;
  retry(jobId: JobId): Promise<Result<JobRecord>>;
  subscribe(listener: JobListener): () => void;
}
