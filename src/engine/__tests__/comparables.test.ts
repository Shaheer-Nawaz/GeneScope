import { describe, it, expect } from 'vitest';
import { analyzeComparables } from '@/engine/comparables';
import type { ComparableCompany } from '@/types/finance';

const peers: ComparableCompany[] = [
  { name: 'A', ticker: 'A', source: 'test', asOf: '2025-01-01', marketCap: 1000, enterpriseValue: 1200, revenue: 400, ebitda: 120, ebit: 90, netIncome: 60 },
  { name: 'B', ticker: 'B', source: 'test', asOf: '2025-01-01', marketCap: 2000, enterpriseValue: 2500, revenue: 500, ebitda: 150, ebit: 110, netIncome: 90 },
  { name: 'C', ticker: 'C', source: 'test', asOf: '2025-01-01', marketCap: 1500, enterpriseValue: 1800, revenue: 300, ebitda: 100, ebit: 70, netIncome: 40 },
];

const subject = { revenue: 600, ebitda: 180, ebit: 130, netIncome: 80, totalDebt: 300, cash: 100, minorityInterests: 0, preferredEquity: 0, nonOperatingAssets: 0, nonOperatingLiabilities: 0, dilutedShares: 50 };

describe('comparables — multiples', () => {
  const result = analyzeComparables(peers, subject);
  // EV/Revenue: 1200/400=3, 2500/500=5, 1800/300=6 -> mean 4.667, median 5
  it('EV/Revenue mean = 4.667', () => {
    expect(result.evRevenueMean).toBeCloseTo((3 + 5 + 6) / 3, 3);
  });
  it('EV/Revenue median = 5', () => {
    expect(result.evRevenueMedian).toBeCloseTo(5, 3);
  });
  // EV/EBITDA: 10, 16.67, 18 -> median 16.67
  it('EV/EBITDA median = 16.67', () => {
    expect(result.evEbitdaMedian).toBeCloseTo((2500 / 150), 3);
  });
  // P/E: 1000/60=16.67, 2000/90=22.22, 1500/40=37.5 -> median 22.22
  it('P/E median = 22.22', () => {
    expect(result.peMedian).toBeCloseTo(2000 / 90, 3);
  });
});

describe('comparables — implied range', () => {
  const result = analyzeComparables(peers, subject);
  // implied EV by revenue (median 5): 5 * 600 = 3000
  // implied EV by ebitda (median ~16.67): 16.67 * 180 = 3000
  // implied EV by ebit (median 18): wait calc: 1200/90=13.33, 2500/110=22.73, 1800/70=25.71 -> median 22.73; * 130 = 2955
  it('implied EV mid > 0', () => {
    expect(result.impliedEVRange.mid).toBeGreaterThan(0);
  });
  it('implied equity mid = EV mid - debt + cash', () => {
    const expected = result.impliedEVRange.mid - 300 + 100;
    expect(result.impliedEquityRange.mid).toBeCloseTo(expected, 4);
  });
});

describe('comparables — excludes negative denominators', () => {
  const badPeers: ComparableCompany[] = [
    ...peers,
    { name: 'D', ticker: 'D', source: 'test', asOf: '2025-01-01', marketCap: 100, enterpriseValue: 100, revenue: -50, ebitda: 0, ebit: -10, netIncome: 0 },
  ];
  const result = analyzeComparables(badPeers, subject);
  it('does not include invalid multiples in mean', () => {
    // The negative-revenue peer should be excluded from EV/Revenue
    expect(result.evRevenueMean).toBeCloseTo((3 + 5 + 6) / 3, 3);
  });
});
