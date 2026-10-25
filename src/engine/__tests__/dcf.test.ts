import { describe, it, expect } from 'vitest';
import { buildForecast, calculateDCF } from '@/engine/dcf';
import type { PeriodFinancials, Assumptions, FinancialLineItem } from '@/types/finance';

function li(value: number | null): FinancialLineItem {
  return { value, unit: 'millions', source: 'test', status: 'actual', asOf: '2024-12-31' };
}

// A minimal but complete single-year history so the forecast has a starting point.
function basePeriod(year = 2024, revenue = 1000): PeriodFinancials {
  return {
    fiscalYear: year,
    income: {
      revenue: li(revenue),
      cogs: li(revenue * 0.4),
      rdExpense: li(revenue * 0.1),
      sgaExpense: li(revenue * 0.2),
      otherOpEx: li(revenue * 0.05),
      depreciationAmortization: li(revenue * 0.03),
      interestIncome: li(0),
      interestExpense: li(revenue * 0.01),
      incomeTaxExpense: li(revenue * 0.05),
      basicShares: li(100),
      dilutedShares: li(100),
    },
    cashFlow: {
      stockBasedComp: li(0),
      changeReceivables: li(0),
      changeInventory: li(0),
      changePayables: li(0),
      changeOtherWorkingCapital: li(0),
      capitalExpenditure: li(-revenue * 0.03),
      acquisitions: li(0),
      debtIssuance: li(0),
      debtRepayment: li(0),
      dividendsPaid: li(0),
      shareRepurchases: li(0),
    },
    balance: {
      cash: li(revenue * 0.2),
      shortTermInvestments: li(0),
      receivables: li(revenue * 0.1),
      inventory: li(0),
      otherCurrentAssets: li(0),
      ppe: li(revenue * 0.3),
      intangibleAssets: li(0),
      goodwill: li(0),
      otherNonCurrentAssets: li(0),
      accountsPayable: li(revenue * 0.05),
      accruedExpenses: li(revenue * 0.03),
      shortTermDebt: li(revenue * 0.1),
      longTermDebt: li(revenue * 0.2),
      leaseLiabilities: li(0),
      otherLiabilities: li(0),
      shareholdersEquity: li(revenue * 0.4),
      minorityInterests: li(0),
    },
    other: { marketPrice: li(50), preferredEquity: li(0), nonOperatingAssets: li(0), nonOperatingLiabilities: li(0), segmentRevenue: [], segmentMargins: [] },
  };
}

function baseAssumptions(years: number[], overrides: Partial<Assumptions> = {}): Assumptions {
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
    ...overrides,
  };
}

describe('forecast — revenue growth', () => {
  it('grows revenue by 10% from 1000 to 1100', () => {
    const a = baseAssumptions([2025]);
    const forecast = buildForecast({ historical: [basePeriod()], assumptions: a, wacc: 0.10, marketPrice: null });
    expect(forecast[0].revenue).toBeCloseTo(1100, 6);
  });
  it('applies per-year growth rates (10% then 5%)', () => {
    const a = baseAssumptions([2025, 2026]);
    a.revenueGrowth[1].value = 0.05;
    const forecast = buildForecast({ historical: [basePeriod()], assumptions: a, wacc: 0.10, marketPrice: null });
    expect(forecast[0].revenue).toBeCloseTo(1100, 6);
    expect(forecast[1].revenue).toBeCloseTo(1155, 6);
  });
});

describe('forecast — margins and EBITDA', () => {
  it('EBITDA = grossProfit - opex', () => {
    const a = baseAssumptions([2025]);
    const forecast = buildForecast({ historical: [basePeriod()], assumptions: a, wacc: 0.10, marketPrice: null });
    // revenue 1100, gross margin 0.6 -> GP 660; rd+sga+other = 0.1+0.2+0.05=0.35 -> 385
    // EBITDA = 660 - 385 = 275
    expect(forecast[0].ebitda).toBeCloseTo(275, 6);
  });
  it('EBIT = EBITDA - DA', () => {
    const a = baseAssumptions([2025]);
    const forecast = buildForecast({ historical: [basePeriod()], assumptions: a, wacc: 0.10, marketPrice: null });
    // EBITDA 275, DA = 0.03*1100 = 33 -> EBIT = 242
    expect(forecast[0].ebit).toBeCloseTo(242, 6);
  });
});

describe('forecast — NOPAT and FCFF', () => {
  it('NOPAT = EBIT * (1 - tax)', () => {
    const a = baseAssumptions([2025]);
    const forecast = buildForecast({ historical: [basePeriod()], assumptions: a, wacc: 0.10, marketPrice: null });
    // EBIT 242, tax 0.21 -> NOPAT = 242 * 0.79 = 191.18
    expect(forecast[0].nopat).toBeCloseTo(242 * 0.79, 4);
  });
});

describe('DCF — discount factor (mid-year)', () => {
  it('year 1 discount factor = 1/(1.1)^0.5', () => {
    const a = baseAssumptions([2025]);
    const forecast = buildForecast({ historical: [basePeriod()], assumptions: a, wacc: 0.10, marketPrice: null });
    expect(forecast[0].discountPeriod).toBeCloseTo(0.5, 6);
    expect(forecast[0].discountFactor).toBeCloseTo(1 / Math.pow(1.1, 0.5), 6);
  });
  it('year 3 discount factor = 1/(1.1)^2.5', () => {
    const a = baseAssumptions([2025, 2026, 2027]);
    const forecast = buildForecast({ historical: [basePeriod()], assumptions: a, wacc: 0.10, marketPrice: null });
    expect(forecast[2].discountPeriod).toBeCloseTo(2.5, 6);
    expect(forecast[2].discountFactor).toBeCloseTo(1 / Math.pow(1.1, 2.5), 6);
  });
});

describe('DCF — terminal value (perpetual growth)', () => {
  it('TV = FCFF_n * (1+g) / (WACC - g)', () => {
    const a = baseAssumptions([2025]);
    // override to known FCFF. Set growth 0, margins constant, etc.
    a.revenueGrowth[0].value = 0;
    a.terminalGrowthRate = 0.03;
    a.wacc = 0.10;
    const period = basePeriod(2024, 1000);
    const forecast = buildForecast({ historical: [period], assumptions: a, wacc: 0.10, marketPrice: null });
    const dcf = calculateDCF(forecast, a, 0.10, period.balance, {
      marketPrice: null, preferredEquity: 0, nonOperatingAssets: 0, nonOperatingLiabilities: 0, minorityInterests: 0, dilutedShares: 100,
    });
    const expectedTV = (forecast[0].fcff * 1.03) / (0.10 - 0.03);
    expect(dcf.terminalValue).toBeCloseTo(expectedTV, 4);
  });
  it('rejects WACC <= terminal growth', () => {
    const a = baseAssumptions([2025]);
    a.terminalGrowthRate = 0.12;
    a.wacc = 0.10;
    const period = basePeriod();
    const forecast = buildForecast({ historical: [period], assumptions: a, wacc: 0.10, marketPrice: null });
    expect(() => calculateDCF(forecast, a, 0.10, period.balance, {
      marketPrice: null, preferredEquity: 0, nonOperatingAssets: 0, nonOperatingLiabilities: 0, minorityInterests: 0, dilutedShares: 100,
    })).toThrow();
  });
});

describe('DCF — equity bridge', () => {
  it('equity value = EV - debt + cash - preferred - minority', () => {
    const a = baseAssumptions([2025]);
    const period = basePeriod();
    period.balance.shortTermDebt = li(100);
    period.balance.longTermDebt = li(200);
    period.balance.cash = li(150);
    period.balance.shortTermInvestments = li(50);
    const forecast = buildForecast({ historical: [period], assumptions: a, wacc: 0.10, marketPrice: null });
    const dcf = calculateDCF(forecast, a, 0.10, period.balance, {
      marketPrice: null, preferredEquity: 30, nonOperatingAssets: 20, nonOperatingLiabilities: 10, minorityInterests: 5, dilutedShares: 100,
    });
    const expectedEquity = dcf.enterpriseValue - 300 + 150 + 50 + 20 - 10 - 30 - 5;
    expect(dcf.equityValue).toBeCloseTo(expectedEquity, 4);
  });
  it('intrinsic value per share = equityValue / dilutedShares', () => {
    const a = baseAssumptions([2025]);
    const period = basePeriod();
    const forecast = buildForecast({ historical: [period], assumptions: a, wacc: 0.10, marketPrice: null });
    const dcf = calculateDCF(forecast, a, 0.10, period.balance, {
      marketPrice: null, preferredEquity: 0, nonOperatingAssets: 0, nonOperatingLiabilities: 0, minorityInterests: 0, dilutedShares: 100,
    });
    expect(dcf.intrinsicValuePerShare).toBeCloseTo(dcf.equityValue / 100, 6);
  });
});

describe('DCF — exit multiple method', () => {
  it('TV = terminal EBITDA * exit multiple', () => {
    const a = baseAssumptions([2025]);
    a.terminalMethod = 'exit_multiple';
    a.exitMultiple = 15;
    const period = basePeriod();
    const forecast = buildForecast({ historical: [period], assumptions: a, wacc: 0.10, marketPrice: null });
    const dcf = calculateDCF(forecast, a, 0.10, period.balance, {
      marketPrice: null, preferredEquity: 0, nonOperatingAssets: 0, nonOperatingLiabilities: 0, minorityInterests: 0, dilutedShares: 100,
    });
    expect(dcf.terminalValue).toBeCloseTo(forecast[0].ebitda * 15, 4);
  });
});

describe('DCF — implied upside vs market', () => {
  it('computes upside = intrinsic/market - 1', () => {
    const a = baseAssumptions([2025]);
    const period = basePeriod();
    const forecast = buildForecast({ historical: [period], assumptions: a, wacc: 0.10, marketPrice: null });
    const dcf = calculateDCF(forecast, a, 0.10, period.balance, {
      marketPrice: 40, preferredEquity: 0, nonOperatingAssets: 0, nonOperatingLiabilities: 0, minorityInterests: 0, dilutedShares: 100,
    });
    expect(dcf.impliedUpside).toBeCloseTo(dcf.intrinsicValuePerShare / 40 - 1, 6);
  });
  it('returns null upside when market price is null', () => {
    const a = baseAssumptions([2025]);
    const period = basePeriod();
    const forecast = buildForecast({ historical: [period], assumptions: a, wacc: 0.10, marketPrice: null });
    const dcf = calculateDCF(forecast, a, 0.10, period.balance, {
      marketPrice: null, preferredEquity: 0, nonOperatingAssets: 0, nonOperatingLiabilities: 0, minorityInterests: 0, dilutedShares: 100,
    });
    expect(dcf.impliedUpside).toBeNull();
  });
});
