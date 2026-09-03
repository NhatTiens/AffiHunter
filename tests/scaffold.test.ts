import { describe, expect, it } from "vitest";
import { isNonEmpty } from "../src/shared/validation";
describe("scaffold", () => { it("loads shared validation", () => { expect(isNonEmpty("AffiHunter")).toBe(true); }); });
