import type { ComparableCompany, ComparableResult } from '@/types/finance';

function safeDiv(num: number, den: number): number | null {
  if (den === 0 || den < 0) return null;
  return num / den;
}

function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const sorted = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Calculate comparable-company multiples and implied valuation ranges.
 * Peers with negative or zero denominators are excluded per-metric.
 */
export function analyzeComparables(
  peers: ComparableCompany[],
  subject: { revenue: number; ebitda: number; ebit: number; netIncome: number; totalDebt: number; cash: number; minorityInterests: number; preferredEquity: number; nonOperatingAssets: number; nonOperatingLiabilities: number; dilutedShares: number }
): ComparableResult {
  const validEvRev = peers.map((p) => safeDiv(p.enterpriseValue, p.revenue)).filter((x): x is number => x !== null);
  const validEvEbitda = peers.map((p) => safeDiv(p.enterpriseValue, p.ebitda)).filter((x): x is number => x !== null);
  const validEvEbit = peers.map((p) => safeDiv(p.enterpriseValue, p.ebit)).filter((x): x is number => x !== null);
  const validPE = peers.map((p) => safeDiv(p.marketCap, p.netIncome)).filter((x): x is number => x !== null);

  const evRevenueMean = mean(validEvRev);
  const evRevenueMedian = median(validEvRev);
  const evEbitdaMean = mean(validEvEbitda);
  const evEbitdaMedian = median(validEvEbitda);
  const evEbitMean = mean(validEvEbit);
  const evEbitMedian = median(validEvEbit);
  const peMean = mean(validPE);
  const peMedian = median(validPE);

  // implied EV range: apply median multiples to subject
  const impliedEVByRevenue = subject.revenue > 0 ? evRevenueMedian * subject.revenue : 0;
  const impliedEVByEbitda = subject.ebitda > 0 ? evEbitdaMedian * subject.ebitda : 0;
  const impliedEVByEbit = subject.ebit > 0 ? evEbitMedian * subject.ebit : 0;

  const equityBridge = (ev: number) =>
    ev - subject.totalDebt + subject.cash + subject.nonOperatingAssets - subject.nonOperatingLiabilities - subject.preferredEquity - subject.minorityInterests;

  const candidates = [impliedEVByRevenue, impliedEVByEbitda, impliedEVByEbit].filter((v) => v > 0);
  const low = candidates.length ? Math.min(...candidates) : 0;
  const high = candidates.length ? Math.max(...candidates) : 0;
  const mid = candidates.length ? median(candidates) : 0;

  return {
    peers,
    evRevenueMean,
    evRevenueMedian,
    evEbitdaMean,
    evEbitdaMedian,
    evEbitMean,
    evEbitMedian,
    peMean,
    peMedian,
    impliedEVRange: { low, mid, high },
    impliedEquityRange: { low: equityBridge(low), mid: equityBridge(mid), high: equityBridge(high) },
  };
}
