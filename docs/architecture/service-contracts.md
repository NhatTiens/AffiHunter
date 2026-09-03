# Service Contracts

## 1. Contract rule

Every renderer feature depends on a typed service interface. Frontend phases bind those interfaces to deterministic mock implementations. Electron phases bind the same interfaces to the typed preload API backed by real application services.

```text
Feature component -> feature hook -> AppServices interface
                                      |-> MockAppServices
                                      +-> PreloadAppServices -> window.affiHunter
```

Components do not switch on mock versus real mode.

## 2. Shared primitives

The concrete implementation may use a schema validation library selected in Phase 2. The public shape must preserve these semantics.

```ts
type Id<T extends string> = string & { readonly __type: T };

type AppError = {
  code: string;
  message: string;
  retryable: boolean;
  fieldErrors?: Readonly<Record<string, readonly string[]>>;
};

type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: AppError };

type PageRequest = {
  page: number;
  pageSize: number;
};

type Page<T> = {
  items: readonly T[];
  page: number;
  pageSize: number;
  total: number;
};

type DateRange = {
  fromUtc: string;
  toUtc: string;
  timezone: string;
};
```

Use branded identifiers only in shared/domain code, not as a reason to cast arbitrary strings in UI components. All boundary input is validated at runtime as well as compile time.

## 3. Renderer service facade

```ts
interface AppServices {
  onboarding: OnboardingService;
  products: ProductService;
  content: ContentService;
  media: MediaService;
  videos: VideoFactoryService;
  publishing: PublishingService;
  performance: PerformanceService;
  commerce: CommerceService;
  reports: ReportService;
  notifications: NotificationService;
  settings: SettingsService;
  jobs: JobService;
}
```

The facade is exposed through one React provider. Feature hooks may narrow it, such as `useProductService`, without creating separate service instances.

## 4. Capability contracts

The following operations define the minimum behavioral surface implied by the approved UI. Names may be refined before implementation, but ownership and direction must remain stable.

### OnboardingService

- `getState()`
- `saveStep(input)`
- `complete()`
- `reset()`

### ProductService

- `getDiscoverySummary(range)`
- `searchProducts(filters, page)`
- `getProductAnalysis(productId, range)`
- `saveProduct(productId, input)`
- `listSavedProducts(filters, page)`
- `updateSavedProduct(productId, patch)`
- `listCollections()`
- `createCollection(input)`
- `importProducts(fileHandle)`

### ContentService

- `getWorkspace(productId)`
- `listIdeas(filters, page)`
- `createIdea(input)`
- `updateIdea(ideaId, patch)`
- `generateIdeas(input)`
- `generateScript(input)`
- `optimizeScript(scriptId, instruction)`
- `listScripts(filters, page)`
- `saveContentVersion(input)`
- `buildStoryboard(scriptId)`

### MediaService

- `listAssets(filters, page)`
- `importAssets(fileHandles)`
- `generateVoice(input)`
- `generateImages(input)`
- `generateVideo(input)`
- `getGenerationHistory(filters, page)`
- `downloadAsset(assetId, destinationHandle)`

All generation commands return a job reference, not a promise held open for the entire provider operation.

### VideoFactoryService

- `getProject(projectId)`
- `createProject(input)`
- `updateTimeline(projectId, expectedRevision, patch)`
- `createVersion(projectId)`
- `queueRender(versionId, settings)`
- `approveVersion(versionId)`
- `listRenderQueue()`

Timeline writes use an expected revision to prevent stale editor state from overwriting newer edits.

### PublishingService

- `getComposer(draftId)`
- `saveDraft(input)`
- `getSuggestedSlots(input)`
- `schedule(input)`
- `publishNow(input)`
- `cancelSchedule(scheduleId)`
- `listCalendar(range, platforms)`
- `retryPublication(publicationId)`

### PerformanceService

- `getVideoAnalysis(videoId, range)`
- `listVideoPerformance(filters, page)`
- `syncVideoMetrics(input)`
- `getRecommendations(subject)`

### CommerceService

- `getOrderSummary(range)`
- `listOrders(filters, page)`
- `getRevenueOverview(range)`
- `syncOrders(input)`
- `importOrders(fileHandle)`
- `rebuildRevenueProjection(range)`

### ReportService

- `getDashboard(range)`
- `getReportOverview(range)`
- `createExport(input)`
- `listExports(page)`
- `downloadExport(exportId, destinationHandle)`

### NotificationService

- `list(filters, page)`
- `markRead(ids)`
- `markAllRead()`
- `getSummary(range)`
- `updatePreferences(input)`

### SettingsService

- `getSettings()`
- `updatePreferences(patch)`
- `listConnections()`
- `connectPlatform(input)`
- `disconnectPlatform(connectionId)`
- `testProviderConnection(input)`
- `storeProviderCredential(input)`
- `chooseManagedDirectory(kind)`
- `createBackup(destinationHandle)`
- `restoreBackup(fileHandle)`

File and directory handles above are opaque application handles. The renderer never supplies or receives unrestricted raw filesystem access.

### JobService

- `get(jobId)`
- `list(filters, page)`
- `cancel(jobId)`
- `retry(jobId)`
- `subscribe(listener)`

Subscriptions expose normalized progress events only. They never expose child-process output or provider payloads.

## 5. Infrastructure ports

Application services depend on interfaces grouped by capability:

- Repositories: products, content, assets, videos, publishing, metrics, commerce, jobs, notifications, preferences.
- AI: `TextGenerationPort`, `ImageGenerationPort`, `SpeechSynthesisPort`, `VideoGenerationPort`.
- Platforms: `CatalogSourcePort`, `PublishingPort`, `VideoMetricsPort`, `OrderSourcePort`.
- Local resources: `ManagedFileStore`, `VideoRendererPort`, `SecureCredentialStore`, `Clock`, `IdGenerator`.

Adapters normalize provider errors into categories such as authentication, quota, rate limit, validation, policy rejection, network, timeout, and unavailable. Raw error bodies are retained only in sanitized diagnostic storage when needed.

## 6. Mock behavior rules

Mocks are an executable contract, not static page decoration.

- Fixtures are centralized and typed.
- IDs and dates are deterministic under test.
- Filters, pagination, sorting, state transitions, optimistic failures, empty states, and loading delays behave realistically.
- Mutation results update the mock repository so navigation demonstrates a closed loop.
- Business calculations use the same pure domain functions planned for real services.
- A development-only scenario selector may expose normal, loading, empty, and error states without entering production UI.

## 7. IPC contract rules

- Channels are allowlisted and capability-named, never arbitrary strings supplied by the renderer.
- Every request and response is runtime validated on the main-process boundary.
- Events return an unsubscribe function and are cleaned up when React effects unmount.
- IPC handlers delegate immediately to application services; they contain no business calculations.
- Contract-breaking changes require a coordinated preload and renderer update. A version field is included in the top-level bridge.

