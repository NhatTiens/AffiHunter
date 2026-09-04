import type { AppServices, JobReference } from "../../../shared/contracts";
import { MockCommerceService } from "./commerce-service";
import { MockJobService } from "./job-service";
import { MockOnboardingService } from "./onboarding-service";
import { MockProductService, type MockScenario } from "./product-service";
import {
  unavailableContentService,
  unavailableMediaService,
  unavailableNotificationService,
  unavailablePerformanceService,
  unavailablePublishingService,
  unavailableReportService,
  unavailableSettingsService,
  unavailableVideoService,
} from "./unavailable-services";

export interface MockCompositionOptions {
  commerceScenario?: MockScenario;
  productScenario?: MockScenario;
}

export function createMockAppServices(options: MockCompositionOptions = {}): AppServices {
  const jobs = new MockJobService();
  const createJob = (type: "sync-orders" | "import-products" | "render-video" | "generation"): JobReference => jobs.enqueue(type);
  return {
    onboarding: new MockOnboardingService(),
    products: new MockProductService({ scenario: options.productScenario, onImport: () => createJob("import-products") }),
    commerce: new MockCommerceService({ scenario: options.commerceScenario, createJob: () => createJob("sync-orders") }),
    jobs,
    content: unavailableContentService,
    media: unavailableMediaService,
    videos: unavailableVideoService,
    publishing: unavailablePublishingService,
    performance: unavailablePerformanceService,
    reports: unavailableReportService,
    notifications: unavailableNotificationService,
    settings: unavailableSettingsService,
  };
}

export const mockAppServices = createMockAppServices();
