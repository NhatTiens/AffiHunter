import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  FilterX,
  RefreshCw,
  Search,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ProductSearchFilters, ProductSort, ProductSortKey } from "../../../shared/contracts";
import { Badge, Button, DataTable, Input, Panel, PanelContent, PanelHeader, PanelTitle, Select, Skeleton, Tooltip } from "../../components/ui";
import { useAppServices } from "../../services/useAppServices";
import { formatGrowth, formatMoneyMinor, formatNumber, formatPercentBps, formatRating, productSourceLabel } from "./formatters";
import { useProductDiscovery } from "./useProductDiscovery";

const categories = ["", "Sức khỏe", "Gia dụng", "Trang trí"] as const;
const markets = [
  ["", "Tất cả thị trường"],
  ["VN", "Việt Nam"],
  ["TH", "Thái Lan"],
  ["ID", "Indonesia"],
  ["PH", "Philippines"],
  ["MY", "Malaysia"],
] as const;
const sources = [
  ["", "Tất cả nguồn"],
  ["tiktok-shop", "TikTok Shop"],
  ["cj-dropshipping", "CJ Dropshipping"],
  ["aliexpress", "AliExpress"],
  ["amazon", "Amazon"],
] as const;
const sortOptions: readonly [ProductSortKey, string][] = [
  ["opportunity", "Điểm cơ hội"],
  ["growth", "Tăng trưởng"],
  ["sales", "Đã bán"],
  ["commission", "Hoa hồng"],
  ["price", "Giá bán"],
  ["competition", "Cạnh tranh thấp"],
];

export function ProductHunterPage() {
  const { products } = useAppServices();
  const [filters, setFilters] = useState<ProductSearchFilters>({});
  const [sort, setSort] = useState<ProductSort>({ key: "opportunity", direction: "desc" });
  const [pageNumber, setPageNumber] = useState(1);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { error, page, reload, savedIds, setSavedIds, status, summary } = useProductDiscovery(filters, sort, pageNumber, 6);

  const hasFilters = Object.values(filters).some((value) => value !== undefined && value !== "");
  const updateFilter = <Key extends keyof ProductSearchFilters>(key: Key, value: ProductSearchFilters[Key]) => {
    setPageNumber(1);
    setFilters((previous) => ({ ...previous, [key]: value === "" ? undefined : value }));
  };
  const resetFilters = () => {
    setPageNumber(1);
    setFilters({});
  };
  const sortLabel = sortOptions.find(([key]) => key === sort.key)?.[1] ?? "Điểm cơ hội";

  const columns = useMemo(() => [
    {
      id: "product",
      header: "Sản phẩm",
      cell: (product: NonNullable<typeof page>["items"][number]) => (
        <div className="flex min-w-56 items-center gap-3 text-left">
          <img src={product.imageUrl} alt={`${product.title} thumbnail`} className="size-12 shrink-0 rounded-md border border-border-default bg-surface-control object-cover" />
          <div className="min-w-0">
            <p className="truncate font-medium text-content-primary">{product.title}</p>
            <p className="mt-1 truncate text-xs text-content-muted">{productSourceLabel(product.source)} · {product.category}</p>
            <p className="mt-1 text-2xs text-content-secondary">★ {formatRating(product.ratingTenths)} · {formatNumber(product.reviewCount)} đánh giá · {formatNumber(product.creatorCount)} creators · {formatNumber(product.videoCount)} videos</p>
          </div>
        </div>
      ),
    },
    {
      id: "price",
      header: "Giá bán",
      align: "numeric" as const,
      cell: (product: NonNullable<typeof page>["items"][number]) => <span className="font-medium text-content-primary">{formatMoneyMinor(product.priceMinor, product.currency)}</span>,
    },
    {
      id: "commission",
      header: "Hoa hồng",
      align: "numeric" as const,
      cell: (product: NonNullable<typeof page>["items"][number]) => <div><span className="font-medium text-content-primary">{formatPercentBps(product.commissionRateBps)}</span><span className="mt-1 block text-2xs text-content-muted">{formatMoneyMinor(product.commissionMinor ?? 0, product.currency)}</span></div>,
    },
    {
      id: "sales",
      header: "Đã bán (30 ngày)",
      align: "numeric" as const,
      cell: (product: NonNullable<typeof page>["items"][number]) => <div><span className="font-medium text-content-primary">{formatNumber(product.sales30d)}</span><span className="mt-1 block text-2xs text-status-success">{formatGrowth(product.growthBps)}</span></div>,
    },
    {
      id: "trend",
      header: "Trend 7 ngày",
      align: "center" as const,
      cell: (product: NonNullable<typeof page>["items"][number]) => <TrendCell title={product.title} points={product.trendPoints} growthBps={product.growthBps} />,
    },
    {
      id: "competition",
      header: "Cạnh tranh",
      align: "center" as const,
      cell: (product: NonNullable<typeof page>["items"][number]) => <Badge variant={product.competitionScore <= 40 ? "success" : product.competitionScore <= 65 ? "warning" : "danger"}>{product.competitionScore <= 40 ? "Thấp" : product.competitionScore <= 65 ? "Trung bình" : "Cao"}</Badge>,
    },
    {
      id: "opportunity",
      header: "Điểm cơ hội",
      align: "numeric" as const,
      cell: (product: NonNullable<typeof page>["items"][number]) => <ScoreCell score={product.opportunityScore ?? 0} />,
    },
  ], []);

  const handleSave = async (productId: NonNullable<typeof page>["items"][number]["id"]) => {
    setSavingId(productId);
    setSaveError(null);
    const result = await products.saveProduct(productId as NonNullable<typeof page>["items"][number]["id"], { status: "watching" });
    if (result.ok) setSavedIds(new Set([...savedIds, result.value.productId]));
    else setSaveError(result.error.message);
    setSavingId(null);
  };

  const totalPages = page ? Math.max(1, Math.ceil(page.total / page.pageSize)) : 1;

  return (
    <div className="space-y-panel-gap">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase text-action-primary">Product intelligence</p>
          <h1 className="mt-2 text-2xl font-semibold text-content-primary">Săn sản phẩm</h1>
          <p className="mt-2 text-sm text-content-secondary">Tìm và chấm điểm sản phẩm tiềm năng để bắt đầu kiểm chứng.</p>
        </div>
        <Button variant="outline" size="sm" onClick={reload}><RefreshCw className="size-4" aria-hidden="true" />Làm mới</Button>
      </header>

      <section aria-label="Discovery summary" className="grid grid-cols-2 gap-panel-gap desktop-md:grid-cols-4">
        <SummaryCard label="Sản phẩm tiềm năng" value={summary?.totalProducts} icon={PackageIcon} loading={status === "loading"} />
        <SummaryCard label="Sản phẩm đang tăng" value={summary?.risingProducts} icon={TrendingIcon} loading={status === "loading"} />
        <SummaryCard label="Hoa hồng trung bình" value={summary ? formatPercentBps(summary.averageCommissionRateBps) : undefined} icon={PercentIcon} loading={status === "loading"} />
        <SummaryCard label="Tỷ lệ cạnh tranh thấp" value={summary ? `${summary.lowCompetitionPercent}%` : undefined} icon={ShieldIcon} loading={status === "loading"} />
      </section>

      <Panel>
        <PanelHeader action={<Button variant="ghost" size="sm" onClick={resetFilters} disabled={!hasFilters}><FilterX className="size-4" aria-hidden="true" />Xóa bộ lọc</Button>}>
          <PanelTitle>Bộ lọc sản phẩm</PanelTitle>
        </PanelHeader>
        <PanelContent>
          <div className="grid gap-3 desktop-md:grid-cols-4">
            <label className="relative desktop-md:col-span-2"><span className="sr-only">Tìm kiếm sản phẩm</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-content-muted" aria-hidden="true" /><Input type="search" aria-label="Tìm kiếm sản phẩm" value={filters.query ?? ""} onChange={(event) => updateFilter("query", event.target.value)} placeholder="Tìm sản phẩm, keyword, danh mục, shop..." className="pl-9" /></label>
            <label><span className="sr-only">Danh mục</span><Select aria-label="Danh mục" value={filters.category ?? ""} onChange={(event) => updateFilter("category", event.target.value)}>{categories.map((category) => <option key={category} value={category}>{category || "Tất cả danh mục"}</option>)}</Select></label>
            <label><span className="sr-only">Thị trường</span><Select aria-label="Thị trường" value={filters.market ?? ""} onChange={(event) => updateFilter("market", event.target.value as ProductSearchFilters["market"])}>{markets.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></label>
            <label><span className="sr-only">Nguồn</span><Select aria-label="Nguồn" value={filters.source ?? ""} onChange={(event) => updateFilter("source", event.target.value as ProductSearchFilters["source"])}>{sources.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></label>
            <label><span className="sr-only">Giá tối thiểu</span><Input type="number" min={0} value={filters.priceMinMinor ?? ""} onChange={(event) => updateFilter("priceMinMinor", event.target.value ? Number(event.target.value) : undefined)} placeholder="Giá từ (đ)" aria-label="Giá tối thiểu" /></label>
            <label><span className="sr-only">Giá tối đa</span><Input type="number" min={0} value={filters.priceMaxMinor ?? ""} onChange={(event) => updateFilter("priceMaxMinor", event.target.value ? Number(event.target.value) : undefined)} placeholder="Giá đến (đ)" aria-label="Giá tối đa" /></label>
            <label><span className="sr-only">Hoa hồng tối thiểu</span><Input type="number" min={0} value={filters.commissionMinBps ? filters.commissionMinBps / 100 : ""} onChange={(event) => updateFilter("commissionMinBps", event.target.value ? Number(event.target.value) * 100 : undefined)} placeholder="Hoa hồng từ (%)" aria-label="Hoa hồng tối thiểu" /></label>
            <label><span className="sr-only">Đã bán tối thiểu</span><Input type="number" min={0} value={filters.salesMin ?? ""} onChange={(event) => updateFilter("salesMin", event.target.value ? Number(event.target.value) : undefined)} placeholder="Đã bán từ" aria-label="Đã bán tối thiểu" /></label>
            <label><span className="sr-only">Tăng trưởng tối thiểu</span><Input type="number" min={0} value={filters.growthMinBps ? filters.growthMinBps / 100 : ""} onChange={(event) => updateFilter("growthMinBps", event.target.value ? Number(event.target.value) * 100 : undefined)} placeholder="Tăng trưởng từ (%)" aria-label="Tăng trưởng tối thiểu" /></label>
            <label><span className="sr-only">Cạnh tranh tối đa</span><Input type="number" min={0} max={100} value={filters.competitionMax ?? ""} onChange={(event) => updateFilter("competitionMax", event.target.value ? Number(event.target.value) : undefined)} placeholder="Cạnh tranh tối đa" aria-label="Cạnh tranh tối đa" /></label>
            <label><span className="sr-only">Điểm cơ hội tối thiểu</span><Input type="number" min={0} max={100} value={filters.opportunityScoreMin ?? ""} onChange={(event) => updateFilter("opportunityScoreMin", event.target.value ? Number(event.target.value) : undefined)} placeholder="Điểm cơ hội từ" aria-label="Điểm cơ hội tối thiểu" /></label>
            <label><span className="sr-only">Điểm cơ hội tối đa</span><Input type="number" min={0} max={100} value={filters.opportunityScoreMax ?? ""} onChange={(event) => updateFilter("opportunityScoreMax", event.target.value ? Number(event.target.value) : undefined)} placeholder="Điểm cơ hội đến" aria-label="Điểm cơ hội tối đa" /></label>
          </div>
        </PanelContent>
      </Panel>

      <Panel>
        <PanelHeader action={<div className="flex items-center gap-2"><Select aria-label="Sort products" value={sort.key} onChange={(event) => { setPageNumber(1); setSort((previous) => ({ ...previous, key: event.target.value as ProductSortKey })); }}>{sortOptions.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Select><Tooltip label={`Sort ${sort.direction === "desc" ? "ascending" : "descending"}`}><Button variant="outline" size="icon" aria-label={`Sort ${sort.direction === "desc" ? "ascending" : "descending"}`} onClick={() => setSort((previous) => ({ ...previous, direction: previous.direction === "desc" ? "asc" : "desc" }))}>{sort.direction === "desc" ? <ArrowDown className="size-4" aria-hidden="true" /> : <ArrowUp className="size-4" aria-hidden="true" />}</Button></Tooltip></div>}>
          <PanelTitle>{sortLabel}</PanelTitle>
        </PanelHeader>
        {saveError ? <div role="alert" className="border-b border-border-subtle px-4 py-3 text-sm text-status-danger">{saveError}</div> : null}
        <DataTable
          caption="Product discovery results"
          columns={columns}
          rows={page?.items ?? []}
          loading={status === "loading"}
          error={status === "error" ? error : undefined}
          onRetry={reload}
          emptyTitle={hasFilters ? "Không tìm thấy sản phẩm phù hợp" : "Chưa có sản phẩm"}
          emptyDescription={hasFilters ? "Thử nới rộng bộ lọc để xem thêm kết quả." : "Sản phẩm sẽ xuất hiện khi nguồn dữ liệu sẵn sàng."}
          getRowKey={(product) => product.id}
          actions={{ header: "Thao tác", headerLabel: "Product actions", render: (product) => <div className="flex items-center justify-end gap-1"><Button asChild size="sm" variant="primary"><Link to={`/products/${product.id}/analysis`}>Phân tích</Link></Button><Tooltip label={savedIds.has(product.id) ? "Đã lưu sản phẩm" : `Lưu ${product.title}`}><Button variant="ghost" size="icon" aria-label={savedIds.has(product.id) ? `Đã lưu ${product.title}` : `Lưu ${product.title}`} disabled={savedIds.has(product.id) || savingId === product.id} loading={savingId === product.id} onClick={() => void handleSave(product.id)}><Bookmark className="size-4" aria-hidden="true" /></Button></Tooltip><Tooltip label={`Tạo nội dung cho ${product.title}`}><Button asChild size="icon" variant="ghost" aria-label={`Tạo nội dung cho ${product.title}`}><Link to={`/content-lab/${product.id}`}><WandSparkles className="size-4" aria-hidden="true" /></Link></Button></Tooltip></div>}}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle px-4 py-3 text-xs text-content-muted"><span>{page ? `Hiển thị ${page.items.length} trong ${formatNumber(page.total)} sản phẩm` : "Đang tải sản phẩm..."}</span><div className="flex items-center gap-2"><Button variant="outline" size="icon" aria-label="Previous page" disabled={pageNumber <= 1 || status !== "ready"} onClick={() => setPageNumber((value) => Math.max(1, value - 1))}><ChevronLeft className="size-4" aria-hidden="true" /></Button><span className="min-w-20 text-center tabular-nums">Trang {pageNumber} / {totalPages}</span><Button variant="outline" size="icon" aria-label="Next page" disabled={pageNumber >= totalPages || status !== "ready"} onClick={() => setPageNumber((value) => value + 1)}><ChevronRight className="size-4" aria-hidden="true" /></Button></div></div>
      </Panel>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, loading, value }: { icon: typeof Sparkles; label: string; loading: boolean; value?: number | string }) {
  return <Panel><PanelContent><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-content-secondary">{label}</p>{loading ? <Skeleton className="mt-2 h-7 w-20" /> : <p className="mt-2 text-xl font-semibold tabular-nums text-content-primary">{value ?? "—"}</p>}</div><span className="inline-flex size-9 items-center justify-center rounded-full bg-action-primary-subtle text-action-primary"><Icon className="size-4" aria-hidden="true" /></span></div></PanelContent></Panel>;
}

function TrendCell({ growthBps, points, title }: { growthBps: number; points: readonly number[]; title: string }) {
  return <div className="grid justify-items-center gap-1"><div role="img" aria-label={`Trend của ${title}`} className="flex h-8 w-20 items-end gap-0.5">{points.map((point, index) => <span key={`${title}-${index}`} className="w-1.5 rounded-t-sm bg-status-success" style={{ height: `${point}%` }} />)}</div><span className="text-2xs text-status-success">{formatGrowth(growthBps)}</span></div>;
}

function ScoreCell({ score }: { score: number }) {
  const variant = score >= 80 ? "success" : score >= 60 ? "warning" : "danger";
  return <div className="inline-grid justify-items-end gap-1"><span className="text-lg font-semibold tabular-nums text-content-primary">{score}</span><Badge variant={variant}>{score >= 80 ? "Rất cao" : score >= 60 ? "Trung bình" : "Thấp"}</Badge></div>;
}

const PackageIcon = Sparkles;
const TrendingIcon = ArrowUpDown;
const PercentIcon = Sparkles;
const ShieldIcon = Sparkles;
