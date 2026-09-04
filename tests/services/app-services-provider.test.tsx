import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppServicesProvider } from "../../src/renderer/services/AppServicesProvider";
import { useAppServices } from "../../src/renderer/services/useAppServices";
import { createMockAppServices } from "../../src/renderer/services/mock/composition";

function ServiceProbe() {
  const services = useAppServices();
  return <output>{typeof services.products.searchProducts === "function" ? "ready" : "missing"}</output>;
}

describe("AppServicesProvider", () => {
  it("exposes one facade to renderer consumers", () => {
    render(
      <AppServicesProvider services={createMockAppServices()}>
        <ServiceProbe />
      </AppServicesProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("ready");
  });

  it("fails clearly when a consumer is outside the provider", () => {
    expect(() => render(<ServiceProbe />)).toThrow(
      "useAppServices must be used within AppServicesProvider",
    );
  });
});
