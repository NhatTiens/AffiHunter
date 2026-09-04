import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { allNavigationItems } from "../src/renderer/app/navigation";
import { AppRouter } from "../src/renderer/app/router";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRouter />
    </MemoryRouter>,
  );
}

function HistoryControls() {
  const navigate = useNavigate();
  return (
    <div>
      <button type="button" onClick={() => navigate(-1)}>
        Browser back
      </button>
      <button type="button" onClick={() => navigate(1)}>
        Browser forward
      </button>
    </div>
  );
}

describe("AppShell navigation", () => {
  it("renders one semantic primary navigation and the shared topbar", () => {
    renderAt("/dashboard");

    expect(screen.getAllByRole("navigation")).toHaveLength(1);
    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
    expect(screen.getByRole("banner")).toBeVisible();
    expect(screen.getByRole("main")).toHaveAttribute(
      "id",
      "main-content",
    );
    expect(screen.getByRole("link", { name: "Tổng quan" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      within(
        screen.getByRole("navigation", { name: "Primary navigation" }),
      ).getAllByRole("link"),
    ).toHaveLength(allNavigationItems.length);
  });

  it("updates active navigation after clicking a route link", async () => {
    const user = userEvent.setup();
    renderAt("/dashboard");

    await user.click(screen.getByRole("link", { name: "Doanh thu" }));

    expect(screen.getByRole("heading", { name: "Doanh thu" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Doanh thu" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Tổng quan" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it.each([
    ["/products/abc-123/analysis", "Phân tích sản phẩm"],
    ["/content-lab/product-42", "Content Lab"],
    ["/video-factory/project-7", "Video Factory"],
    ["/reports/videos/video-7", "Báo cáo"],
  ])("marks dynamic route %s active as %s", (path, label) => {
    renderAt(path);

    const primaryNav = screen.getByRole("navigation", {
      name: "Primary navigation",
    });
    expect(within(primaryNav).getByRole("link", { name: label })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("supports keyboard collapse and expansion without losing navigation access", async () => {
    const user = userEvent.setup();
    renderAt("/settings");

    const primaryNav = screen.getByRole("navigation", {
      name: "Primary navigation",
    });
    const collapse = within(primaryNav).getByRole("button", {
      name: "Collapse navigation",
    });
    collapse.focus();
    await user.keyboard("{Enter}");

    expect(within(primaryNav).getByRole("button", { name: "Expand navigation" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();

    await user.keyboard("{Enter}");
    expect(within(primaryNav).getByRole("button", { name: "Collapse navigation" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("preserves route rendering across browser back and forward history", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/dashboard", "/revenue"]} initialIndex={1}>
        <HistoryControls />
        <AppRouter />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Doanh thu" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Browser back" }));
    expect(screen.getByRole("heading", { name: "Tổng quan" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Browser forward" }));
    expect(screen.getByRole("heading", { name: "Doanh thu" })).toBeVisible();
  });

  it("exposes keyboard-accessible date and account menus", async () => {
    const user = userEvent.setup();
    renderAt("/dashboard");

    const dateButton = screen.getByRole("button", { name: "Select date range" });
    await user.click(dateButton);
    expect(screen.getByRole("menu", { name: "Select date range" })).toBeVisible();
    await user.click(screen.getByRole("menuitemradio", { name: "30 ngày" }));
    expect(dateButton).toHaveTextContent("30 ngày");

    const accountButton = screen.getByRole("button", { name: "Open account menu" });
    accountButton.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("menu", { name: "Open account menu" })).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "Cài đặt" })).toBeVisible();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu", { name: "Open account menu" })).not.toBeInTheDocument();
  });
});

describe("route boundaries", () => {
  it("keeps onboarding outside AppShell", () => {
    renderAt("/onboarding");

    expect(screen.getByRole("heading", { name: "Onboarding" })).toBeVisible();
    expect(screen.getByText("Onboarding boundary")).toBeVisible();
    expect(screen.queryByRole("navigation", { name: "Primary navigation" })).not.toBeInTheDocument();
  });

  it("renders NotFound for unknown routes with a recovery link", async () => {
    const user = userEvent.setup();
    renderAt("/not-a-real-route");

    expect(screen.getByRole("heading", { name: "Không tìm thấy trang" })).toBeVisible();
    await user.click(screen.getByRole("link", { name: "Về tổng quan" }));
    expect(screen.getByRole("heading", { name: "Tổng quan" })).toBeVisible();
  });

  it("redirects the root path to the dashboard placeholder", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { name: "Tổng quan" })).toBeVisible();
  });
});

describe("canonical route registry", () => {
  it.each([
    ["/dashboard", "Tổng quan"],
    ["/products/discover", "Tìm sản phẩm"],
    ["/products/saved", "Sản phẩm đã lưu"],
    ["/products/product-1/analysis", "Phân tích sản phẩm"],
    ["/content-lab", "Content Lab"],
    ["/content-lab/product-1", "Content Lab"],
    ["/ideas", "Ý tưởng"],
    ["/scripts", "Script & Hook"],
    ["/ai/script", "AI viết script"],
    ["/ai/voice", "AI tạo voice"],
    ["/ai/image", "AI tạo ảnh"],
    ["/ai/video", "AI tạo video"],
    ["/video-factory", "Video Factory"],
    ["/video-factory/project-1", "Video Factory"],
    ["/publishing", "Đăng & Lên lịch"],
    ["/orders", "Theo dõi đơn hàng"],
    ["/revenue", "Doanh thu"],
    ["/reports", "Báo cáo"],
    ["/reports/videos/video-1", "Phân tích chi tiết video"],
    ["/notifications", "Thông báo"],
    ["/settings", "Cài đặt"],
  ])("renders %s as %s", (path, title) => {
    renderAt(path);
    expect(screen.getByRole("heading", { name: title })).toBeVisible();
    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
  });
});
