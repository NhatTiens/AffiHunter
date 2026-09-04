import { useCallback, useEffect, useMemo, useState } from "react";
import type { DateRange, DiscoverySummary, Page, Product, ProductSearchFilters, ProductSearchRequest, ProductSort, Result, SavedProductView, UtcTimestamp } from "../../../shared/contracts";
import { useAppServices } from "../../services/useAppServices";

export type DiscoveryStatus = "loading" | "ready" | "error";

export interface ProductDiscoveryState {
  error: string | null;
  page: Page<Product> | null;
  savedIds: ReadonlySet<Product["id"]>;
  status: DiscoveryStatus;
  summary: DiscoverySummary | null;
}

export const DEFAULT_DISCOVERY_RANGE: DateRange = {
  fromUtc: "2026-07-01T00:00:00.000Z" as UtcTimestamp,
  toUtc: "2026-07-07T23:59:59.999Z" as UtcTimestamp,
  timezone: "Asia/Ho_Chi_Minh",
};

export function useProductDiscovery(filters: ProductSearchFilters, sort: ProductSort, pageNumber: number, pageSize: number): ProductDiscoveryState & { reload: () => void; setSavedIds: (ids: ReadonlySet<Product["id"]>) => void } {
  const { products } = useAppServices();
  const [state, setState] = useState<ProductDiscoveryState>({ status: "loading", page: null, error: null, savedIds: new Set(), summary: null });
  const [reloadToken, setReloadToken] = useState(0);
  const stableFilters = useMemo(() => ({ ...filters }), [filters]);
  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState((previous) => ({ ...previous, status: "loading", page: null, error: null }));
    const request: ProductSearchRequest = { filters: stableFilters, sort, page: { page: pageNumber, pageSize } };
    void Promise.all([
      products.searchProducts(request) as Promise<Result<Page<Product>>>,
      products.listSavedProducts({}, { page: 1, pageSize: 100 }) as Promise<Result<Page<SavedProductView>>>,
      products.getDiscoverySummary(DEFAULT_DISCOVERY_RANGE),
    ]).then(([result, savedResult, summaryResult]) => {
      if (cancelled) return;
      if (result.ok) {
        setState((previous) => ({ status: "ready", page: result.value, error: null, savedIds: savedResult.ok ? new Set(savedResult.value.items.map((item) => item.product.id)) : previous.savedIds, summary: summaryResult.ok ? summaryResult.value : previous.summary }));
      } else setState((previous) => ({ ...previous, status: "error", page: null, error: result.error.message }));
    });
    return () => { cancelled = true; };
  }, [products, stableFilters, sort, pageNumber, pageSize, reloadToken]);

  return { ...state, reload, setSavedIds: (ids) => setState((previous) => ({ ...previous, savedIds: ids })) };
}
