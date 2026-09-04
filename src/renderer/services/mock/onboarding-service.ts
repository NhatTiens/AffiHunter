import type {
  OnboardingService,
  OnboardingState,
  OnboardingStepInput,
  Result,
} from "../../../shared/contracts";
import { fail, ok } from "./result";

export class MockOnboardingService implements OnboardingService {
  private state: OnboardingState = { currentStep: 1, totalSteps: 8, completed: false };

  async getState(): Promise<Result<OnboardingState>> {
    return ok({ ...this.state });
  }

  async saveStep(input: OnboardingStepInput): Promise<Result<OnboardingState>> {
    if (!Number.isInteger(input.step) || input.step < 1 || input.step > this.state.totalSteps) return fail("INVALID_ONBOARDING_STEP", "Onboarding step is outside the allowed range.");
    this.state = { ...this.state, currentStep: input.step };
    return ok({ ...this.state });
  }

  async complete(): Promise<Result<OnboardingState>> {
    this.state = { ...this.state, currentStep: this.state.totalSteps, completed: true };
    return ok({ ...this.state });
  }

  async reset(): Promise<Result<OnboardingState>> {
    this.state = { currentStep: 1, totalSteps: 8, completed: false };
    return ok({ ...this.state });
  }
}
