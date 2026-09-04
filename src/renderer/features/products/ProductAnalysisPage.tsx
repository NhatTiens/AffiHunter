import { ArrowLeft, Bookmark, Calculator, ExternalLink, Plus, ShieldAlert, Users, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import type { DateRange, ProductAnalysis, ProductId, Result, UtcTimestamp } from "../../../shared/contracts";
import { Badge, Button, FeedbackState, Input, Panel, PanelContent, PanelHeader, PanelTitle, Skeleton } from "../../components/ui";
import { useAppServices } from "../../services/useAppServices";
import { calculateUnitEconomics } from "./analysis-calculations";
import { formatGrowth, formatMoneyMinor, formatNumber, formatPercentBps, formatRating } from "./formatters";

const range: DateRange = { fromUtc: "2026-07-01T00:00:00.000Z" as UtcTimestamp, toUtc: "2026-07-07T23:59:59.999Z" as UtcTimestamp, timezone: "Asia/Ho_Chi_Minh" };

export function ProductAnalysisPage() {
  const { productId } = useParams<{ productId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { products } = useAppServices();
  const [state, setState] = useState<{ status: "loading" | "ready" | "error"; data: ProductAnalysis | null; error: string | null }>({ status: "loading", data: null, error: null });
  const [retry, setRetry] = useState(0);
  const [saved, setSaved] = useState(false);
  const [cost, setCost] = useState(150000);
  const [fee, setFee] = useState(500);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", data: null, error: null });
    const resolvedProductId = productId ?? location.pathname.match(/^\/products\/([^/]+)\/analysis$/)?.[1];
    if (!resolvedProductId) { setState({ status: "error", data: null, error: "Product ID is missing." }); return () => { cancelled = true; }; }
    void products.getProductAnalysis(resolvedProductId as ProductId, range).then((result: Result<ProductAnalysis>) => {
      if (cancelled) return;
      if (result.ok) setState({ status: "ready", data: result.value, error: null });
      else setState({ status: result.error.code === "PRODUCT_NOT_FOUND" ? "error" : "error", data: null, error: result.error.message });
    });
    return () => { cancelled = true; };
  }, [products, productId, location.pathname, retry]);

  const economics = useMemo(() => state.data ? calculateUnitEconomics({ priceMinor: state.data.product.priceMinor, productCostMinor: cost, platformFeeBps: fee, commissionRateBps: state.data.product.commissionRateBps }) : null, [state.data, cost, fee]);

  if (state.status === "loading") return <AnalysisLoading />;
  if (!state.data) return <FeedbackState status="error" title={state.error === "Product was not found." ? "Không tìm thấy sản phẩm" : "Không thể tải phân tích sản phẩm"} description={state.error ?? "Thử lại sau."} actionLabel="Thử lại" onAction={() => setRetry((value) => value + 1)} />;
  const { product, score, snapshots, competition, creators, videos, riskFactors } = state.data;

  return (
    <div className="space-y-panel-gap">
      <header className="flex flex-wrap items-start justify-between gap-4"><div><Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="size-4" aria-hidden="true" />Quay lại danh sách</Button><p className="mt-4 text-xs font-medium uppercase text-action-primary">Product analysis</p><h1 className="mt-2 text-2xl font-semibold text-content-primary">Phân tích sản phẩm</h1></div><div className="flex gap-2"><Button variant={saved ? "secondary" : "outline"} size="sm" disabled={saved} onClick={async () => { const result = await products.saveProduct(product.id, { status: "watching" }); if (result.ok) setSaved(true); }}><Bookmark className="size-4" aria-hidden="true" />{saved ? "Đã lưu" : "Lưu sản phẩm"}</Button><Button asChild size="sm"><Link to={`/content-lab/${product.id}`}><Plus className="size-4" aria-hidden="true" />Tạo nội dung</Link></Button></div></header>

      <Panel><PanelContent><div className="grid gap-6 desktop-md:grid-cols-[auto_1fr_auto] items-center"><img src={product.imageUrl} alt={`${product.title} product`} className="size-36 rounded-lg border border-border-default bg-surface-control object-cover" /><div><div className="flex flex-wrap items-center gap-2"><Badge variant="success">HOT</Badge><h2 className="text-lg font-semibold text-content-primary">{product.title}</h2></div><div className="mt-2 flex flex-wrap gap-2"><Badge>{product.category}</Badge><Badge>{productSource(product.source)}</Badge><Badge>{product.market}</Badge></div><dl className="mt-5 grid grid-cols-2 gap-4 text-sm desktop-md:grid-cols-4"><Metric label="Giá bán" value={formatMoneyMinor(product.priceMinor, product.currency)} /><Metric label="Hoa hồng" value={formatPercentBps(product.commissionRateBps)} /><Metric label="Đã bán (30 ngày)" value={formatNumber(product.sales30d)} /><Metric label="Đánh giá" value={`${formatRating(product.ratingTenths)} · ${formatNumber(product.reviewCount)}`} /></dl></div><a href="#source" className="text-xs text-content-muted underline-offset-4 hover:underline">Xem nguồn dữ liệu <ExternalLink className="inline size-3" aria-hidden="true" /></a></div></PanelContent></Panel>

      <div className="grid gap-panel-gap desktop-md:grid-cols-[1.5fr_1fr]"><Panel><PanelHeader><PanelTitle>Điểm cơ hội</PanelTitle></PanelHeader><PanelContent><div className="grid gap-6 desktop-md:grid-cols-[12rem_1fr] items-center"><ScoreGauge score={score.total} /><div className="space-y-3">{Object.entries(score.factors).map(([key, value]) => <div key={key}><div className="flex justify-between text-xs text-content-secondary"><span>{factorLabel(key)}</span><span className="tabular-nums text-content-primary">{value}</span></div><div className="mt-1 h-2 rounded-full bg-surface-control"><div className="h-full rounded-full bg-action-primary" style={{ width: `${value}%` }} /></div></div>)}</div></div><p className="mt-4 text-xs text-content-muted">Thuật toán {score.algorithmVersion} · cập nhật {new Date(score.calculatedAt).toLocaleDateString("vi-VN")}</p></PanelContent></Panel><Panel><PanelHeader><PanelTitle>Cạnh tranh</PanelTitle></PanelHeader><PanelContent><div className="flex items-center gap-4"><div className="text-4xl font-semibold tabular-nums text-content-primary">{competition.score}<span className="text-sm text-content-muted">/100</span></div><div className="space-y-2 text-sm text-content-secondary"><p><Users className="mr-2 inline size-4 text-content-muted" aria-hidden="true" />{formatNumber(competition.relatedCreators)} creators</p><p><Video className="mr-2 inline size-4 text-content-muted" aria-hidden="true" />{formatNumber(competition.relatedVideos)} videos</p></div></div><Badge className="mt-4" variant={competition.score <= 40 ? "success" : competition.score <= 65 ? "warning" : "danger"}>{competition.score <= 40 ? "Thấp" : competition.score <= 65 ? "Trung bình" : "Cao"}</Badge></PanelContent></Panel></div>

      <div className="grid gap-panel-gap desktop-md:grid-cols-[1.5fr_1fr]"><Panel><PanelHeader><PanelTitle>Xu hướng doanh số (7 ngày)</PanelTitle></PanelHeader><PanelContent><TrendChart snapshots={snapshots} title={product.title} growthBps={state.data.trendGrowthBps} /></PanelContent></Panel><Panel><PanelHeader><PanelTitle>Rủi ro</PanelTitle></PanelHeader><PanelContent><div className="space-y-3">{riskFactors.map((risk) => <div key={risk.label} className="flex gap-3"><ShieldAlert className={`mt-0.5 size-4 ${risk.level === "low" ? "text-status-success" : risk.level === "medium" ? "text-status-warning" : "text-status-danger"}`} aria-hidden="true" /><div><p className="text-sm text-content-primary">{risk.label}</p><p className="text-xs text-content-muted">{risk.detail}</p></div></div>)}</div></PanelContent></Panel></div>

      <div className="grid gap-panel-gap desktop-md:grid-cols-2"><Panel><PanelHeader><PanelTitle>Top creator đang quảng bá</PanelTitle></PanelHeader><PanelContent><div className="space-y-3">{creators.map((creator, index) => <div key={creator.handle} className="flex items-center justify-between gap-3 border-b border-border-subtle pb-3 last:border-0 last:pb-0"><div className="flex items-center gap-3"><span className="text-xs tabular-nums text-content-muted">{index + 1}</span><div><p className="text-sm text-content-primary">{creator.handle}</p><p className="text-xs text-content-muted">{formatNumber(creator.followers)} followers · {creator.videoCount} videos</p></div></div><span className="text-sm tabular-nums text-status-success">{formatNumber(creator.sales30d)}</span></div>)}</div></PanelContent></Panel><Panel><PanelHeader><PanelTitle>Top video đang bán chạy</PanelTitle></PanelHeader><PanelContent><div className="space-y-3">{videos.map((video) => <div key={video.id} className="flex items-center justify-between gap-3 border-b border-border-subtle pb-3 last:border-0 last:pb-0"><div className="min-w-0"><p className="truncate text-sm text-content-primary">{video.title}</p><p className="text-xs text-content-muted">{video.durationSeconds}s · {formatNumber(video.views)} lượt xem</p></div><span className="text-sm tabular-nums text-status-success">{formatNumber(video.orders)} đơn</span></div>)}</div></PanelContent></Panel></div>

      <Panel><PanelHeader><PanelTitle>Ước tính lợi nhuận</PanelTitle></PanelHeader><PanelContent><div className="grid gap-3 desktop-md:grid-cols-4"><label className="text-xs text-content-secondary">Giá vốn<Input type="number" min={0} value={cost} onChange={(event) => setCost(Math.max(0, Number(event.target.value) || 0))} className="mt-2" /></label><label className="text-xs text-content-secondary">Phí nền tảng (%)<Input type="number" min={0} max={100} value={fee / 100} onChange={(event) => setFee(Math.max(0, Number(event.target.value) * 100 || 0))} className="mt-2" /></label><Metric label="Lợi nhuận / đơn" value={economics ? formatMoneyMinor(economics.profitMinor, product.currency) : "—"} /><Metric label="ROI ước tính" value={economics ? `${economics.roiPercent.toFixed(1)}%` : "—"} /></div><p className="mt-3 text-xs text-content-muted"><Calculator className="mr-1 inline size-3" aria-hidden="true" />Các giá trị là ước tính, dùng integer minor units.</p></PanelContent></Panel>
    </div>
  );
}

function AnalysisLoading() { return <div className="space-y-panel-gap" aria-busy="true"><Skeleton className="h-10 w-64" /><Skeleton className="h-36 w-full" /><div className="grid grid-cols-2 gap-panel-gap"><Skeleton className="h-64" /><Skeleton className="h-64" /></div><Skeleton className="h-64 w-full" /></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs text-content-muted">{label}</dt><dd className="mt-1 text-lg font-semibold tabular-nums text-content-primary">{value}</dd></div>; }
function ScoreGauge({ score }: { score: number }) { return <div className="grid size-40 place-items-center rounded-full border-score border-action-primary-subtle"><div className="text-center"><div className="text-4xl font-semibold tabular-nums text-content-primary">{score}</div><div className="text-xs font-medium text-status-success">{score >= 80 ? "RẤT CAO" : score >= 60 ? "TRUNG BÌNH" : "THẤP"}</div></div></div>; }
function TrendChart({ snapshots, title, growthBps }: { snapshots: ProductAnalysis["snapshots"]; title: string; growthBps: number }) { const max = Math.max(...snapshots.map((item) => item.sales30d), 1); return <div><div role="img" aria-label={`Biểu đồ doanh số của ${title}, ${snapshots.length} điểm dữ liệu`} className="flex h-48 items-end gap-3 border-b border-l border-border-subtle px-4 py-3">{snapshots.map((snapshot) => <div key={snapshot.capturedAt} className="flex flex-1 flex-col items-center justify-end gap-2"><div className="w-full max-w-16 rounded-t-sm bg-data-2" style={{ height: `${Math.max(10, (snapshot.sales30d / max) * 100)}%` }} /><span className="text-2xs tabular-nums text-content-muted">{formatNumber(snapshot.sales30d)}</span></div>)}</div><p className="mt-3 text-xs text-content-secondary">Doanh số tăng {formatGrowth(growthBps)}</p></div>; }
function factorLabel(key: string) { return { marketDemand: "Nhu cầu thị trường", sales: "Số đơn hàng", growth: "Tăng trưởng", competition: "Cạnh tranh" }[key] ?? key; }
function productSource(source: string) { return { "tiktok-shop": "TikTok Shop", "cj-dropshipping": "CJ Dropshipping", aliexpress: "AliExpress", amazon: "Amazon" }[source] ?? source; }
