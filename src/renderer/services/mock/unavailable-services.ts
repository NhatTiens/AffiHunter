import type {
  ContentService,
  FileHandle,
  JobReference,
  MediaService,
  NotificationService,
  PerformanceService,
  PublishingService,
  ReportService,
  Result,
  SettingsService,
  VideoFactoryService,
} from "../../../shared/contracts";
import { fail } from "./result";

const deferred = <T>(): Promise<Result<T>> => Promise.resolve(fail("CAPABILITY_NOT_IMPLEMENTED", "This capability is reserved for a later implementation phase."));

export const unavailableContentService: ContentService = {
  buildStoryboard: () => deferred(), createIdea: () => deferred(), generateIdeas: () => deferred<JobReference>(), generateScript: () => deferred<JobReference>(), getWorkspace: () => deferred(), listIdeas: () => deferred(), listScripts: () => deferred(), optimizeScript: () => deferred<JobReference>(), saveContentVersion: () => deferred(), updateIdea: () => deferred(),
};

export const unavailableMediaService: MediaService = {
  downloadAsset: () => deferred<JobReference>(), generateImages: () => deferred<JobReference>(), generateVideo: () => deferred<JobReference>(), generateVoice: () => deferred<JobReference>(), getGenerationHistory: () => deferred(), importAssets: () => deferred(), listAssets: () => deferred(),
};

export const unavailableVideoService: VideoFactoryService = {
  approveVersion: () => deferred(), createProject: () => deferred(), createVersion: () => deferred(), getProject: () => deferred(), listRenderQueue: () => deferred(), queueRender: () => deferred<JobReference>(), updateTimeline: () => deferred(),
};

export const unavailablePublishingService: PublishingService = {
  cancelSchedule: () => deferred(), getComposer: () => deferred(), getSuggestedSlots: () => deferred(), listCalendar: () => deferred(), publishNow: () => deferred<JobReference>(), retryPublication: () => deferred<JobReference>(), saveDraft: () => deferred(), schedule: () => deferred(),
};

export const unavailablePerformanceService: PerformanceService = {
  getRecommendations: () => deferred(), getVideoAnalysis: () => deferred(), listVideoPerformance: () => deferred(), syncVideoMetrics: () => deferred<JobReference>(),
};

export const unavailableReportService: ReportService = {
  createExport: () => deferred<JobReference>(), downloadExport: () => deferred<JobReference>(), getDashboard: () => deferred(), getReportOverview: () => deferred(), listExports: () => deferred(),
};

export const unavailableNotificationService: NotificationService = {
  getSummary: () => deferred(), list: () => deferred(), markAllRead: () => deferred(), markRead: () => deferred(), updatePreferences: () => deferred(),
};

export const unavailableSettingsService: SettingsService = {
  chooseManagedDirectory: () => deferred(), connectPlatform: () => deferred(), createBackup: () => deferred<JobReference>(), disconnectPlatform: () => deferred(), getSettings: () => deferred(), listConnections: () => deferred(), restoreBackup: (fileHandle: FileHandle) => fileHandle ? deferred<JobReference>() : deferred<JobReference>(), storeProviderCredential: () => deferred(), testProviderConnection: () => deferred(), updatePreferences: () => deferred(),
};
