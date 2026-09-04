import type { LucideIcon } from "lucide-react";
import { matchPath } from "react-router-dom";
import {
  Bell,
  ChartNoAxesCombined,
  CircleDollarSign,
  FileBarChart,
  FolderKanban,
  Gauge,
  Image,
  Lightbulb,
  ListVideo,
  Megaphone,
  Mic2,
  PackageSearch,
  PenLine,
  Settings,
  ShoppingBag,
  Store,
  Video,
  WandSparkles,
} from "lucide-react";

export interface NavigationItem {
  description: string;
  href: string;
  icon: LucideIcon;
  id: string;
  label: string;
  match?: string;
  end?: boolean;
}

export interface NavigationSection {
  id: string;
  label?: string;
  items: readonly NavigationItem[];
}

export const navigationSections: readonly NavigationSection[] = [
  {
    id: "overview",
    items: [
      {
        id: "dashboard",
        label: "Tổng quan",
        href: "/dashboard",
        icon: Gauge,
        description: "Tổng quan workspace",
      },
    ],
  },
  {
    id: "products",
    label: "Sản phẩm",
    items: [
      {
        id: "product-discover",
        label: "Tìm sản phẩm",
        href: "/products/discover",
        icon: PackageSearch,
        description: "Tìm sản phẩm tiềm năng",
      },
      {
        id: "product-analysis",
        label: "Phân tích sản phẩm",
        href: "/products/example/analysis",
        match: "/products/:productId/analysis",
        icon: ChartNoAxesCombined,
        description: "Phân tích một sản phẩm",
      },
      {
        id: "product-saved",
        label: "Sản phẩm đã lưu",
        href: "/products/saved",
        icon: ShoppingBag,
        description: "Sản phẩm đã lưu",
      },
    ],
  },
  {
    id: "content",
    label: "Content Lab",
    items: [
      {
        id: "content-lab",
        label: "Content Lab",
        href: "/content-lab",
        match: "/content-lab/*",
        icon: PenLine,
        description: "Không gian nội dung",
      },
      {
        id: "video-factory",
        label: "Video Factory",
        href: "/video-factory",
        match: "/video-factory/*",
        icon: FolderKanban,
        description: "Lắp ráp video",
      },
      {
        id: "scripts",
        label: "Script & Hook",
        href: "/scripts",
        icon: ListVideo,
        description: "Thư viện Script & Hook",
      },
    ],
  },
  {
    id: "publish-track",
    label: "Publish & Track",
    items: [
      {
        id: "publishing",
        label: "Đăng & Lên lịch",
        href: "/publishing",
        icon: Megaphone,
        description: "Đăng và lên lịch",
      },
      {
        id: "orders",
        label: "Theo dõi đơn hàng",
        href: "/orders",
        icon: Store,
        description: "Theo dõi đơn hàng",
      },
      {
        id: "revenue",
        label: "Doanh thu",
        href: "/revenue",
        icon: CircleDollarSign,
        description: "Doanh thu",
      },
    ],
  },
  {
    id: "insights",
    items: [
      {
        id: "ideas",
        label: "Ý tưởng",
        href: "/ideas",
        icon: Lightbulb,
        description: "Ý tưởng nội dung",
      },
      {
        id: "reports",
        label: "Báo cáo",
        href: "/reports",
        match: "/reports/*",
        icon: FileBarChart,
        description: "Báo cáo hiệu quả",
      },
    ],
  },
  {
    id: "ai-tools",
    label: "AI Tools",
    items: [
      {
        id: "ai-script",
        label: "AI viết script",
        href: "/ai/script",
        icon: WandSparkles,
        description: "AI viết script",
      },
      {
        id: "ai-voice",
        label: "AI tạo voice",
        href: "/ai/voice",
        icon: Mic2,
        description: "AI tạo voice",
      },
      {
        id: "ai-video",
        label: "AI tạo video",
        href: "/ai/video",
        icon: Video,
        description: "AI tạo video",
      },
      {
        id: "ai-image",
        label: "AI tạo ảnh",
        href: "/ai/image",
        icon: Image,
        description: "AI tạo ảnh",
      },
    ],
  },
  {
    id: "account",
    items: [
      {
        id: "notifications",
        label: "Thông báo",
        href: "/notifications",
        icon: Bell,
        description: "Thông báo workspace",
      },
      {
        id: "settings",
        label: "Cài đặt",
        href: "/settings",
        icon: Settings,
        description: "Cài đặt tài khoản",
      },
    ],
  },
];

export const allNavigationItems = navigationSections.flatMap(
  (section) => section.items,
);

export function getNavigationItem(pathname: string): NavigationItem | undefined {
  return allNavigationItems.find((item) => {
    const pattern = item.match ?? item.href;
    return Boolean(
      matchPath(
        { path: pattern, end: item.end ?? !item.match },
        pathname,
      ),
    );
  });
}
