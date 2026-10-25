import { describe, it, expect } from 'vitest';
import { buildSensitivity, range } from '@/engine/sensitivity';
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

describe('range helper', () => {
  it('produces symmetric values around center', () => {
    const r = range(0.10, 0.01, 5);
    expect(r).toHaveLength(5);
    expect(r[2]).toBeCloseTo(0.10, 6);
  });
});

describe('sensitivity table — WACC vs terminal growth', () => {
  const a = baseAssumptions([2025]);
  const period = basePeriod();
  const otherInfo = { marketPrice: null as number | null, preferredEquity: 0, nonOperatingAssets: 0, nonOperatingLiabilities: 0, minorityInterests: 0, dilutedShares: 100 };
  const waccs = [0.08, 0.10, 0.12];
  const growths = [0.02, 0.03, 0.04];
  const table = buildSensitivity('wacc', 'terminalGrowthRate', waccs, growths, a, [period], period.balance, otherInfo);

  it('has 3x3 cells', () => {
    expect(table.cells).toHaveLength(3);
    table.cells.forEach((row) => expect(row).toHaveLength(3));
  });

  it('lower WACC produces higher value at same growth', () => {
    // row 0 (wacc 8%) col 1 (g 3%) should exceed row 2 (wacc 12%) col 1
    expect(table.cells[0][1]).toBeGreaterThan(table.cells[2][1]);
  });

  it('higher growth produces higher value at same WACC', () => {
    expect(table.cells[1][2]).toBeGreaterThan(table.cells[1][0]);
  });

  it('invalid combination (WACC <= g) yields NaN', () => {
    // wacc 0.08, g 0.08 — but g 0.04 is below 0.08, so valid. Use explicit invalid: wacc 0.08, g 0.08
    const t2 = buildSensitivity('wacc', 'terminalGrowthRate', [0.05], [0.05], a, [period], period.balance, otherInfo);
    expect(Number.isNaN(t2.cells[0][0])).toBe(true);
  });
});
