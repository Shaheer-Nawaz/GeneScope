import { describe, it, expect } from 'vitest';
import { safeDiv, pctChange, calcEbit, calcEbitda, calcGrossProfit, calcNetIncome, calcOperatingCashFlow, calcFreeCashFlow, calcNetDebt, calcWorkingCapital, analyzeHistorical } from '@/engine/historical';
import type { PeriodFinancials, FinancialLineItem } from '@/types/finance';

function li(value: number | null): FinancialLineItem {
  return { value, unit: 'millions', source: 'test', status: 'actual', asOf: '2024-12-31' };
}

// independently derived expected values, not copies of production logic
describe('historical analysis — safeDiv', () => {
  it('returns null on zero denominator', () => {
    expect(safeDiv(100, 0)).toBeNull();
  });
  it('returns null on null inputs', () => {
    expect(safeDiv(null, 5)).toBeNull();
    expect(safeDiv(5, null)).toBeNull();
  });
  it('divides correctly', () => {
    expect(safeDiv(10, 4)).toBeCloseTo(2.5, 6);
  });
});

describe('historical analysis — pctChange', () => {
  it('computes growth from 100 to 120 as 0.2', () => {
    expect(pctChange(120, 100)).toBeCloseTo(0.2, 6);
  });
  it('returns null when prior is zero', () => {
    expect(pctChange(100, 0)).toBeNull();
  });
  it('handles decline', () => {
    expect(pctChange(80, 100)).toBeCloseTo(-0.2, 6);
  });
});

describe('income statement derivations', () => {
  const income = {
    revenue: li(1000),
    cogs: li(400),
    rdExpense: li(100),
    sgaExpense: li(200),
    otherOpEx: li(50),
    depreciationAmortization: li(60),
    interestIncome: li(5),
    interestExpense: li(10),
    incomeTaxExpense: li(58.5),
    basicShares: li(100),
    dilutedShares: li(105),
  };
  it('gross profit = 600', () => {
    expect(calcGrossProfit(income)).toBeCloseTo(600, 6);
  });
  // EBIT = GP - opex = 600 - 350 = 250
  it('EBIT = 250', () => {
    expect(calcEbit(income)).toBeCloseTo(250, 6);
  });
  // EBITDA = EBIT + DA = 250 + 60 = 310
  it('EBITDA = 310', () => {
    expect(calcEbitda(income)).toBeCloseTo(310, 6);
  });
  // Net income: pretax = 250 + 5 - 10 = 245; tax 58.5 -> NI = 186.5
  it('net income = 186.5', () => {
    expect(calcNetIncome(income)).toBeCloseTo(186.5, 6);
  });
});

describe('cash flow derivations', () => {
  const period: PeriodFinancials = {
    fiscalYear: 2024,
    income: {
      revenue: li(1000),
      cogs: li(400),
      rdExpense: li(100),
      sgaExpense: li(200),
      otherOpEx: li(50),
      depreciationAmortization: li(60),
      interestIncome: li(5),
      interestExpense: li(10),
      incomeTaxExpense: li(58.5),
      basicShares: li(100),
      dilutedShares: li(105),
    },
    cashFlow: {
      stockBasedComp: li(20),
      changeReceivables: li(-15),
      changeInventory: li(-5),
      changePayables: li(8),
      changeOtherWorkingCapital: li(-2),
      capitalExpenditure: li(-80),
      acquisitions: li(0),
      debtIssuance: li(0),
      debtRepayment: li(-20),
      dividendsPaid: li(-30),
      shareRepurchases: li(0),
    },
    balance: {
      cash: li(150),
      shortTermInvestments: li(50),
      receivables: li(120),
      inventory: li(40),
      otherCurrentAssets: li(20),
      ppe: li(300),
      intangibleAssets: li(80),
      goodwill: li(50),
      otherNonCurrentAssets: li(30),
      accountsPayable: li(80),
      accruedExpenses: li(40),
      shortTermDebt: li(60),
      longTermDebt: li(120),
      leaseLiabilities: li(20),
      otherLiabilities: li(30),
      shareholdersEquity: li(400),
      minorityInterests: li(0),
    },
    other: { marketPrice: li(50), preferredEquity: li(0), nonOperatingAssets: li(0), nonOperatingLiabilities: li(0), segmentRevenue: [], segmentMargins: [] },
  };
  // OCF = NI 186.5 + DA 60 + SBC 20 + (-15) + (-5) + 8 + (-2) = 252.5
  it('operating cash flow = 252.5', () => {
    expect(calcOperatingCashFlow(period)).toBeCloseTo(252.5, 6);
  });
  // FCF = OCF + capex (-80) = 172.5
  it('free cash flow = 172.5', () => {
    expect(calcFreeCashFlow(period)).toBeCloseTo(172.5, 6);
  });
  // net debt = 60+120+20 - 150 - 50 = 0
  it('net debt = 0', () => {
    expect(calcNetDebt(period.balance)).toBeCloseTo(0, 6);
  });
  // working capital = (120+40+20+150+50) - (80+40+60) = 380 - 180 = 200
  it('working capital = 200', () => {
    expect(calcWorkingCapital(period.balance)).toBeCloseTo(200, 6);
  });
});

describe('analyzeHistorical — growth and margins', () => {
  const periods: PeriodFinancials[] = [
    {
      fiscalYear: 2022,
      income: { revenue: li(1000), cogs: li(400), rdExpense: li(100), sgaExpense: li(200), otherOpEx: li(50), depreciationAmortization: li(60), interestIncome: li(0), interestExpense: li(0), incomeTaxExpense: li(54), basicShares: li(100), dilutedShares: li(100) },
      cashFlow: { stockBasedComp: li(0), changeReceivables: li(0), changeInventory: li(0), changePayables: li(0), changeOtherWorkingCapital: li(0), capitalExpenditure: li(-60), acquisitions: li(0), debtIssuance: li(0), debtRepayment: li(0), dividendsPaid: li(0), shareRepurchases: li(0) },
      balance: { cash: li(100), shortTermInvestments: li(0), receivables: li(80), inventory: li(40), otherCurrentAssets: li(0), ppe: li(300), intangibleAssets: li(0), goodwill: li(0), otherNonCurrentAssets: li(0), accountsPayable: li(60), accruedExpenses: li(40), shortTermDebt: li(50), longTermDebt: li(100), leaseLiabilities: li(0), otherLiabilities: li(20), shareholdersEquity: li(250), minorityInterests: li(0) },
      other: { marketPrice: li(null), preferredEquity: li(0), nonOperatingAssets: li(0), nonOperatingLiabilities: li(0), segmentRevenue: [], segmentMargins: [] },
    },
    {
      fiscalYear: 2023,
      income: { revenue: li(1200), cogs: li(480), rdExpense: li(120), sgaExpense: li(240), otherOpEx: li(60), depreciationAmortization: li(72), interestIncome: li(0), interestExpense: li(0), incomeTaxExpense: li(72), basicShares: li(100), dilutedShares: li(100) },
      cashFlow: { stockBasedComp: li(0), changeReceivables: li(0), changeInventory: li(0), changePayables: li(0), changeOtherWorkingCapital: li(0), capitalExpenditure: li(-72), acquisitions: li(0), debtIssuance: li(0), debtRepayment: li(0), dividendsPaid: li(0), shareRepurchases: li(0) },
      balance: { cash: li(120), shortTermInvestments: li(0), receivables: li(96), inventory: li(48), otherCurrentAssets: li(0), ppe: li(320), intangibleAssets: li(0), goodwill: li(0), otherNonCurrentAssets: li(0), accountsPayable: li(72), accruedExpenses: li(48), shortTermDebt: li(50), longTermDebt: li(100), leaseLiabilities: li(0), otherLiabilities: li(20), shareholdersEquity: li(300), minorityInterests: li(0) },
      other: { marketPrice: li(null), preferredEquity: li(0), nonOperatingAssets: li(0), nonOperatingLiabilities: li(0), segmentRevenue: [], segmentMargins: [] },
    },
  ];
  const result = analyzeHistorical(periods);
  it('revenue growth 2023 = 20%', () => {
    expect(result.revenueGrowth[1]).toBeCloseTo(0.2, 6);
  });
  // 2022 gross margin = 600/1000 = 0.6
  it('gross margin 2022 = 0.6', () => {
    expect(result.grossMargin[0]).toBeCloseTo(0.6, 6);
  });
  // 2022 EBIT = 600 - 350 = 250; EBITDA = 310
  it('ebitda 2022 = 310', () => {
    expect(result.ebitda[0]).toBeCloseTo(310, 6);
  });
  it('ebitda margin 2022 = 0.31', () => {
    expect(result.ebitdaMargin[0]).toBeCloseTo(0.31, 6);
  });
});
