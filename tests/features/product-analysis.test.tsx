import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { AppServices, ProductAnalysis, ProductId, Result } from "../../src/shared/contracts";
import { AppServicesProvider } from "../../src/renderer/services/AppServicesProvider";
import { createMockAppServices } from "../../src/renderer/services/mock/composition";
import { calculateUnitEconomics } from "../../src/renderer/features/products/analysis-calculations";
import { AppRouter } from "../../src/renderer/app/router";

function renderAnalysis(path = "/products/product-1/analysis", services: AppServices = createMockAppServices()) {
  return render(<MemoryRouter initialEntries={[path]}><AppServicesProvider services={services}><AppRouter /></AppServicesProvider></MemoryRouter>);
}

describe("Product Analysis", () => {
  it("loads the product from the URL and displays service-backed overview, score, and breakdown", async () => {
    renderAnalysis("/products/product-2/analysis");
    await waitFor(() => expect(screen.getByRole("heading", { name: "Phân tích sản phẩm" })).toBeVisible());
    expect(screen.getByText("Máy hút bụi mini không dây")).toBeVisible();
    expect(screen.getByText(/359\.000/)).toBeVisible();
    expect(screen.getByText("20%")).toBeVisible();
    expect(screen.getAllByText("12.456")[0]).toBeVisible();
    expect(screen.getByText(/4,6\/5/)).toBeVisible();
    expect(screen.getByText("Điểm cơ hội")).toBeVisible();
    expect(screen.getByText("Nhu cầu thị trường")).toBeVisible();
    expect(screen.getByRole("img", { name: /Biểu đồ doanh số của Máy hút bụi mini không dây/ })).toBeVisible();
  });

  it("supports save, create-content, and back actions with the URL product ID", async () => {
    const user = userEvent.setup();
    const services = createMockAppServices();
    render(<MemoryRouter initialEntries={["/products/product-3/analysis"]}><AppServicesProvider services={services}><AppRouter /></AppServicesProvider></MemoryRouter>);
    await waitFor(() => expect(screen.getByText("Bình nước thông minh")).toBeVisible());
    await user.click(screen.getByRole("button", { name: "Lưu sản phẩm" }));
    expect(screen.getByRole("button", { name: "Đã lưu" })).toBeDisabled();
    const saved = await services.products.listSavedProducts({ savedStatus: "watching" }, { page: 1, pageSize: 100 });
    expect(saved.ok && saved.value.items.some((item) => item.product.id === "product-3")).toBe(true);
    await user.click(screen.getByRole("link", { name: "Tạo nội dung" }));
    expect(screen.getByRole("heading", { name: "Content Lab" })).toBeVisible();
  });

  it("renders not-found and retryable error states without crashing", async () => {
    renderAnalysis("/products/unknown/analysis");
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Không tìm thấy sản phẩm"));
    expect(screen.getByRole("button", { name: "Thử lại" })).toBeVisible();
    cleanup();
    const services = createMockAppServices();
    services.products.getProductAnalysis = vi.fn(async () => ({ ok: false, error: { code: "ANALYSIS_FAILED", message: "Analysis unavailable", retryable: true } })) as AppServices["products"]["getProductAnalysis"];
    renderAnalysis("/products/product-1/analysis", services);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Analysis unavailable"));
    const retry = screen.getByRole("button", { name: "Thử lại" });
    await userEvent.click(retry);
    expect(services.products.getProductAnalysis).toHaveBeenCalledTimes(2);
  });

  it("keeps partial snapshot data valid and gives the chart an accessible summary", async () => {
    const services = createMockAppServices();
    const original = services.products.getProductAnalysis;
    services.products.getProductAnalysis = vi.fn(async (id: ProductId, range): Promise<Result<ProductAnalysis>> => {
      const result = await original.call(services.products, id, range);
      if (!result.ok) return result;
      return { ok: true, value: { ...result.value, snapshots: result.value.snapshots.slice(0, 1), trendGrowthBps: 0, creators: [], videos: [], riskFactors: [] } };
    });
    renderAnalysis("/products/product-1/analysis", services);
    await waitFor(() => expect(screen.getByRole("heading", { name: "Phân tích sản phẩm" })).toBeVisible());
    expect(screen.getByRole("img", { name: /1 điểm dữ liệu/ })).toBeVisible();
    expect(screen.getByText("Top creator đang quảng bá")).toBeVisible();
  });
});

describe("analysis calculator", () => {
  it("is deterministic, uses minor units, and handles zero investment", () => {
    const input = { priceMinor: 329000, productCostMinor: 150000, commissionRateBps: 1800, platformFeeBps: 500 };
    expect(calculateUnitEconomics(input)).toEqual(calculateUnitEconomics(input));
    expect(calculateUnitEconomics(input)).toMatchObject({ commissionMinor: 59220, profitMinor: 221770 });
    expect(calculateUnitEconomics({ ...input, productCostMinor: 0, platformFeeBps: 0 })).toMatchObject({ roiPercent: 0 });
  });
});
