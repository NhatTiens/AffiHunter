import type { Product } from "../../../shared/contracts";

const vnd = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("vi-VN");

export function formatMoneyMinor(amountMinor: number, currency: string): string {
  if (currency === "VND") return vnd.format(amountMinor);
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(amountMinor / 100);
}

export function formatNumber(value: number): string {
  return number.format(value);
}

export function formatPercentBps(bps: number): string {
  return `${(bps / 100).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`;
}

export function formatRating(tenths: number): string {
  return `${(tenths / 10).toLocaleString("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}/5`;
}

export function formatGrowth(bps: number): string {
  return `${bps >= 0 ? "↗" : "↘"} ${formatPercentBps(Math.abs(bps))}`;
}

export function productSourceLabel(source: Product["source"]): string {
  return { "tiktok-shop": "TikTok Shop", "cj-dropshipping": "CJ Dropshipping", aliexpress: "AliExpress", amazon: "Amazon" }[source];
}
