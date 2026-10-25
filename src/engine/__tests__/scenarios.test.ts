import { describe, it, expect } from 'vitest';
import { applyScenario, runScenario, getScenarioDelta } from '@/engine/scenarios';
import type { Assumptions, PeriodFinancials, FinancialLineItem } from '@/types/finance';

function li(value: number | null): FinancialLineItem {
  return { value, unit: 'millions', source: 'test', status: 'actual', asOf: '2024-12-31' };
}

function baseAssumptions(years: number[]): Assumptions {
  const mk = (value: number) => years.map((year) => ({ year, value, method: 'manual' as const, rationale: '', overridden: false }));
  return {
    revenueGrowth: mk(0.1),
    grossMargin: mk(0.6),
    rdPercentOfRevenue: mk(0.1),
    sgaPercentOfRevenue: mk(0.2),
    otherOpExPercentOfRevenue: mk(0.05),
    daPercentOfRevenue: mk(0.03),
    capexPercentOfRevenue: mk(0.03),
    taxRate: mk(0.21),
    workingCapitalPercentOfRevenue: mk(0.05),
    interestRateOnDebt: mk(0.05),
    stockBasedCompPercentOfRevenue: mk(0),
    shareCountChange: mk(0),
    dividendsPayoutRatio: mk(0),
    terminalGrowthRate: 0.03,
    wacc: 0.10,
    terminalMethod: 'perpetual_growth',
    exitMultiple: 12,
    discountingConvention: 'mid_year',
  };
}

function basePeriod(): PeriodFinancials {
  return {
    fiscalYear: 2024,
    income: { revenue: li(1000), cogs: li(400), rdExpense: li(100), sgaExpense: li(200), otherOpEx: li(50), depreciationAmortization: li(30), interestIncome: li(0), interestExpense: li(10), incomeTaxExpense: li(50), basicShares: li(100), dilutedShares: li(100) },
    cashFlow: { stockBasedComp: li(0), changeReceivables: li(0), changeInventory: li(0), changePayables: li(0), changeOtherWorkingCapital: li(0), capitalExpenditure: li(-30), acquisitions: li(0), debtIssuance: li(0), debtRepayment: li(0), dividendsPaid: li(0), shareRepurchases: li(0) },
    balance: { cash: li(200), shortTermInvestments: li(0), receivables: li(100), inventory: li(0), otherCurrentAssets: li(0), ppe: li(300), intangibleAssets: li(0), goodwill: li(0), otherNonCurrentAssets: li(0), accountsPayable: li(50), accruedExpenses: li(30), shortTermDebt: li(100), longTermDebt: li(200), leaseLiabilities: li(0), otherLiabilities: li(0), shareholdersEquity: li(400), minorityInterests: li(0) },
    other: { marketPrice: li(50), preferredEquity: li(0), nonOperatingAssets: li(0), nonOperatingLiabilities: li(0), segmentRevenue: [], segmentMargins: [] },
  };
}

describe('applyScenario — deltas', () => {
  it('bull case increases revenue growth and reduces WACC', () => {
    const base = baseAssumptions([2025]);
    const bull = applyScenario(base, getScenarioDelta('bull'));
    expect(bull.revenueGrowth[0].value).toBeCloseTo(0.15, 6);
    expect(bull.wacc).toBeCloseTo(0.08, 6);
    expect(bull.terminalGrowthRate).toBeCloseTo(0.035, 6);
  });
  it('bear case reduces growth and raises WACC', () => {
    const base = baseAssumptions([2025]);
    const bear = applyScenario(base, getScenarioDelta('bear'));
    expect(bear.revenueGrowth[0].value).toBeCloseTo(0.05, 6);
    expect(bear.wacc).toBeCloseTo(0.12, 6);
  });
  it('base case is unchanged', () => {
    const base = baseAssumptions([2025]);
    const baseScn = applyScenario(base, getScenarioDelta('base'));
    expect(baseScn.revenueGrowth[0].value).toBeCloseTo(0.1, 6);
    expect(baseScn.wacc).toBeCloseTo(0.1, 6);
  });
});

describe('runScenario — produces distinct valuations', () => {
  const a = baseAssumptions([2025, 2026, 2027]);
  const period = basePeriod();
  const otherInfo = { marketPrice: 50, preferredEquity: 0, nonOperatingAssets: 0, nonOperatingLiabilities: 0, minorityInterests: 0, dilutedShares: 100 };
  const bear = runScenario('bear', a, [period], period.balance, otherInfo);
  const base = runScenario('base', a, [period], period.balance, otherInfo);
  const bull = runScenario('bull', a, [period], period.balance, otherInfo);
  it('bull EV > base EV > bear EV', () => {
    expect(bull.dcf.enterpriseValue).toBeGreaterThan(base.dcf.enterpriseValue);
    expect(base.dcf.enterpriseValue).toBeGreaterThan(bear.dcf.enterpriseValue);
  });
  it('bull per-share > base per-share > bear per-share', () => {
    expect(bull.summary.intrinsicValuePerShare).toBeGreaterThan(base.summary.intrinsicValuePerShare);
    expect(base.summary.intrinsicValuePerShare).toBeGreaterThan(bear.summary.intrinsicValuePerShare);
  });
});
