import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { AppServices, Page, Product } from "../../src/shared/contracts";
import { AppServicesProvider } from "../../src/renderer/services/AppServicesProvider";
import { TooltipProvider } from "../../src/renderer/components/ui";
import { createMockAppServices } from "../../src/renderer/services/mock/composition";
import { MockProductService } from "../../src/renderer/services/mock/product-service";
import { ProductHunterPage } from "../../src/renderer/features/products/ProductHunterPage";
import { AppRouter } from "../../src/renderer/app/router";

function renderPage(services: AppServices = createMockAppServices()) {
  return render(
    <MemoryRouter initialEntries={["/products/discover"]}>
      <AppServicesProvider services={services}>
        <TooltipProvider>
          <ProductHunterPage />
        </TooltipProvider>
      </AppServicesProvider>
    </MemoryRouter>,
  );
}

function renderApp(services: AppServices = createMockAppServices()) {
  return render(
    <MemoryRouter initialEntries={["/products/discover"]}>
      <AppServicesProvider services={services}>
        <AppRouter />
      </AppServicesProvider>
    </MemoryRouter>,
  );
}

describe("Product Hunter", () => {
  it("loads typed product data with sourced display fields", async () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "Săn sản phẩm" })).toBeVisible();
    await waitFor(() => expect(screen.getByText("Máy massage cổ thông minh")).toBeVisible());
    expect(screen.getByText(/329\.000/)).toBeVisible();
    expect(screen.getByText("18%")).toBeVisible();
    expect(screen.getByText("14.281")).toBeVisible();
    expect(screen.getByText(/4,8\/5/)).toBeVisible();
    expect(screen.getByText(/3\.421 đánh giá/)).toBeVisible();
    expect(screen.getByText(/184 creators/)).toBeVisible();
    expect(screen.getByRole("img", { name: "Trend của Máy massage cổ thông minh" })).toBeVisible();
  });

  it("combines filters and resets to the first page", async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(screen.getByText("Máy massage cổ thông minh")).toBeVisible());

    const search = screen.getByRole("searchbox", { name: "Tìm kiếm sản phẩm" });
    await user.clear(search);
    await user.type(search, "bụi");
    await user.selectOptions(screen.getByRole("combobox", { name: "Danh mục" }), "Gia dụng");
    await user.selectOptions(screen.getByRole("combobox", { name: "Thị trường" }), "VN");
    await user.selectOptions(screen.getByRole("combobox", { name: "Nguồn" }), "cj-dropshipping");
    await user.type(screen.getByRole("spinbutton", { name: "Giá tối thiểu" }), "300000");
    await user.type(screen.getByRole("spinbutton", { name: "Hoa hồng tối thiểu" }), "19");
    await user.type(screen.getByRole("spinbutton", { name: "Đã bán tối thiểu" }), "12000");
    await user.type(screen.getByRole("spinbutton", { name: "Tăng trưởng tối thiểu" }), "30");
    await user.type(screen.getByRole("spinbutton", { name: "Cạnh tranh tối đa" }), "40");
    await user.type(screen.getByRole("spinbutton", { name: "Điểm cơ hội tối thiểu" }), "80");
    await user.type(screen.getByRole("spinbutton", { name: "Điểm cơ hội tối đa" }), "100");

    await waitFor(() => expect(screen.getByText("Máy hút bụi mini không dây")).toBeVisible());
    expect(screen.getByText("Hiển thị 1 trong 1 sản phẩm")).toBeVisible();
    expect(screen.queryByText("Máy massage cổ thông minh")).not.toBeInTheDocument();
    expect(screen.getByText("Trang 1 / 1")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Xóa bộ lọc" }));
    await waitFor(() => expect(screen.getByText("Hiển thị 6 trong 12 sản phẩm")).toBeVisible());
    expect(screen.getByText("Trang 1 / 2")).toBeVisible();
  });

  it("sorts through every supported numeric option and direction", async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(screen.getByText("Hiển thị 6 trong 12 sản phẩm")).toBeVisible());
    const sort = screen.getByRole("combobox", { name: "Sort products" });
    for (const option of ["opportunity", "growth", "sales", "commission", "price", "competition"]) {
      await user.selectOptions(sort, option);
      expect(sort).toHaveValue(option);
    }
    await user.click(screen.getByRole("button", { name: "Sort ascending" }));
    expect(screen.getByRole("button", { name: "Sort descending" })).toBeVisible();
  });

  it("uses real page boundaries for next, previous, and last page", async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(screen.getByText("Hiển thị 6 trong 12 sản phẩm")).toBeVisible());
    const next = screen.getByRole("button", { name: "Next page" });
    await user.click(next);
    await waitFor(() => expect(screen.getByText("Trang 2 / 2")).toBeVisible());
    expect(next).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Previous page" }));
    await waitFor(() => expect(screen.getByText("Trang 1 / 2")).toBeVisible());
  });

  it("calls ProductService.saveProduct and reflects the saved mutation", async () => {
    const user = userEvent.setup();
    const products = new MockProductService();
    const services = { ...createMockAppServices(), products };
    renderPage(services);
    await waitFor(() => expect(screen.getByText("Máy hút bụi mini không dây")).toBeVisible());
    const saveButton = screen.getByRole("button", { name: "Lưu Máy hút bụi mini không dây" });
    await user.click(saveButton);
    await waitFor(() => expect(screen.getByRole("button", { name: "Đã lưu Máy hút bụi mini không dây" })).toBeDisabled());
    const saved = await products.listSavedProducts({ savedStatus: "watching" }, { page: 1, pageSize: 100 });
    expect(saved.ok && saved.value.items.some((item) => item.product.id === "product-2")).toBe(true);
  });

  it("navigates to analysis and content with the real product ID", async () => {
    const user = userEvent.setup();
    renderApp();
    await waitFor(() => expect(screen.getByText("Máy massage cổ thông minh")).toBeVisible());
    await user.click(screen.getAllByRole("link", { name: "Phân tích" })[0]);
    expect(screen.getByRole("heading", { name: "Phân tích sản phẩm" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Phân tích sản phẩm" })).toHaveAttribute("aria-current", "page");
    await user.click(screen.getByRole("link", { name: "Tìm sản phẩm" }));
    await waitFor(() => expect(screen.getByText("Máy massage cổ thông minh")).toBeVisible());
    await user.click(screen.getByRole("link", { name: "Tạo nội dung cho Máy massage cổ thông minh" }));
    expect(screen.getByRole("heading", { name: "Content Lab" })).toBeVisible();
  });

  it("shows loading, empty, empty-filter, error, and retry states", async () => {
    let resolveSearch: ((value: { ok: true; value: Page<Product> }) => void) | undefined;
    const services = createMockAppServices();
    services.products.searchProducts = vi.fn(() => new Promise((resolve) => { resolveSearch = resolve; })) as AppServices["products"]["searchProducts"];
    renderPage(services);
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    resolveSearch?.({ ok: true, value: { items: [], page: 1, pageSize: 6, total: 0 } });
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Chưa có sản phẩm"));

    cleanup();
    renderPage(createMockAppServices({ productScenario: "error" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Product search is unavailable"));
    expect(screen.getByRole("button", { name: "Try again" })).toBeVisible();

    cleanup();
    renderPage();
    await waitFor(() => expect(screen.getByText("Máy massage cổ thông minh")).toBeVisible());
    const user = userEvent.setup();
    const emptySearch = screen.getByRole("searchbox", { name: "Tìm kiếm sản phẩm" });
    await user.clear(emptySearch);
    await user.type(emptySearch, "không tồn tại");
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Không tìm thấy sản phẩm phù hợp"));
  });
});
