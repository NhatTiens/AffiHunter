export interface CalculatorInput {
  commissionRateBps: number;
  platformFeeBps: number;
  priceMinor: number;
  productCostMinor: number;
}

export interface CalculatorResult {
  commissionMinor: number;
  profitMinor: number;
  roiPercent: number;
}

export function calculateUnitEconomics(input: CalculatorInput): CalculatorResult {
  const commissionMinor = Math.round((input.priceMinor * input.commissionRateBps) / 10000);
  const platformFeeMinor = Math.round((input.priceMinor * input.platformFeeBps) / 10000);
  const profitMinor = input.priceMinor - input.productCostMinor - platformFeeMinor + commissionMinor;
  const investedMinor = input.productCostMinor + platformFeeMinor;
  return { commissionMinor, profitMinor, roiPercent: investedMinor > 0 ? (profitMinor / investedMinor) * 100 : 0 };
}
