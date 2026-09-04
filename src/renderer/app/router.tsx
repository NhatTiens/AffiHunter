import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "../layouts/AppShell";
import { NotFound } from "../layouts/NotFound";
import { PlaceholderPage } from "../layouts/PlaceholderPage";
import { ProductHunterPage } from "../features/products/ProductHunterPage";
import { ProductAnalysisPage } from "../features/products/ProductAnalysisPage";

const pages = {
  dashboard: { title: "Tổng quan" },
  discover: { title: "Tìm sản phẩm" },
  saved: { title: "Sản phẩm đã lưu" },
  analysis: { title: "Phân tích sản phẩm" },
  contentLab: { title: "Content Lab" },
  ideas: { title: "Ý tưởng" },
  scripts: { title: "Script & Hook" },
  aiScript: { title: "AI viết script" },
  aiVoice: { title: "AI tạo voice" },
  aiImage: { title: "AI tạo ảnh" },
  aiVideo: { title: "AI tạo video" },
  videoFactory: { title: "Video Factory" },
  publishing: { title: "Đăng & Lên lịch" },
  orders: { title: "Theo dõi đơn hàng" },
  revenue: { title: "Doanh thu" },
  reports: { title: "Báo cáo" },
  videoReport: { title: "Phân tích chi tiết video" },
  notifications: { title: "Thông báo" },
  settings: { title: "Cài đặt" },
} as const;

function page(title: string) {
  return <PlaceholderPage title={title} />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/onboarding" element={<PlaceholderPage boundary="onboarding" title="Onboarding" />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={page(pages.dashboard.title)} />
        <Route path="/products/discover" element={<ProductHunterPage />} />
        <Route path="/products/saved" element={page(pages.saved.title)} />
        <Route path="/products/:productId/analysis" element={<ProductAnalysisPage />} />
        <Route path="/content-lab/:productId?" element={page(pages.contentLab.title)} />
        <Route path="/ideas" element={page(pages.ideas.title)} />
        <Route path="/scripts" element={page(pages.scripts.title)} />
        <Route path="/ai/script" element={page(pages.aiScript.title)} />
        <Route path="/ai/voice" element={page(pages.aiVoice.title)} />
        <Route path="/ai/image" element={page(pages.aiImage.title)} />
        <Route path="/ai/video" element={page(pages.aiVideo.title)} />
        <Route path="/video-factory/:projectId?" element={page(pages.videoFactory.title)} />
        <Route path="/publishing" element={page(pages.publishing.title)} />
        <Route path="/orders" element={page(pages.orders.title)} />
        <Route path="/revenue" element={page(pages.revenue.title)} />
        <Route path="/reports" element={page(pages.reports.title)} />
        <Route path="/reports/videos/:videoId" element={page(pages.videoReport.title)} />
        <Route path="/notifications" element={page(pages.notifications.title)} />
        <Route path="/settings" element={page(pages.settings.title)} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
