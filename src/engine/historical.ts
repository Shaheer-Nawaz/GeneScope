import type {
  PeriodFinancials,
  IncomeStatement,
  BalanceSheet,
  OtherInfo,
  DataQualityIssue,
} from '@/types/finance';

/** Extract a numeric line item value, returning null when missing. */
export function v(item: { value: number | null }): number | null {
  return item.value;
}

/** Safe division returning null when denominator is zero or inputs missing. */
export function safeDiv(num: number | null, den: number | null): number | null {
  if (num === null || den === null) return null;
  if (den === 0) return null;
  return num / den;
}

/** Percent change; null when prior is zero/missing (avoid div-by-zero and -100% traps). */
export function pctChange(curr: number | null, prior: number | null): number | null {
  if (curr === null || prior === null) return null;
  if (prior === 0) return null;
  return curr / prior - 1;
}

export interface HistoricalAnalysis {
  years: number[];
  revenue: (number | null)[];
  revenueGrowth: (number | null)[];
  grossProfit: (number | null)[];
  grossMargin: (number | null)[];
  ebitda: (number | null)[];
  ebitdaMargin: (number | null)[];
  ebit: (number | null)[];
  ebitMargin: (number | null)[];
  netIncome: (number | null)[];
  netMargin: (number | null)[];
  effectiveTaxRate: (number | null)[];
  capexPercentOfRevenue: (number | null)[];
  daPercentOfRevenue: (number | null)[];
  operatingCashFlow: (number | null)[];
  freeCashFlow: (number | null)[];
  workingCapital: (number | null)[];
  netDebt: (number | null)[];
  debtToEquity: (number | null)[];
  netDebtToEbitda: (number | null)[];
  roic: (number | null)[];
  assetTurnover: (number | null)[];
  issues: DataQualityIssue[];
  accountingConsistency: { year: number; balanced: boolean; delta: number }[];
}

/** Derive EBITDA from an income statement (EBIT + D&A). */
export function calcEbitda(income: IncomeStatement): number | null {
  const ebit = calcEbit(income);
  const da = v(income.depreciationAmortization);
  if (ebit === null || da === null) return null;
  return ebit + da;
}

/** Derive EBIT from an income statement. */
export function calcEbit(income: IncomeStatement): number | null {
  const rev = v(income.revenue);
  const cogs = v(income.cogs);
  const rd = v(income.rdExpense);
  const sga = v(income.sgaExpense);
  const other = v(income.otherOpEx);
  if (rev === null || cogs === null) return null;
  const gp = rev - cogs;
  const opex = (rd ?? 0) + (sga ?? 0) + (other ?? 0);
  return gp - opex;
}

/** Derive gross profit. */
export function calcGrossProfit(income: IncomeStatement): number | null {
  const rev = v(income.revenue);
  const cogs = v(income.cogs);
  if (rev === null || cogs === null) return null;
  return rev - cogs;
}

export function calcNetIncome(income: IncomeStatement): number | null {
  const ebit = calcEbit(income);
  if (ebit === null) return null;
  const intIncome = v(income.interestIncome) ?? 0;
  const intExp = v(income.interestExpense) ?? 0;
  const preTax = ebit + intIncome - intExp;
  const tax = v(income.incomeTaxExpense);
  if (tax === null) return null;
  return preTax - tax;
}

export function calcOperatingCashFlow(period: PeriodFinancials): number | null {
  const ni = calcNetIncome(period.income);
  if (ni === null) return null;
  const da = v(period.income.depreciationAmortization) ?? 0;
  const sbc = v(period.cashFlow.stockBasedComp) ?? 0;
  const dRec = v(period.cashFlow.changeReceivables) ?? 0;
  const dInv = v(period.cashFlow.changeInventory) ?? 0;
  const dPay = v(period.cashFlow.changePayables) ?? 0;
  const dOther = v(period.cashFlow.changeOtherWorkingCapital) ?? 0;
  return ni + da + sbc + dRec + dInv + dPay + dOther;
}

export function calcFreeCashFlow(period: PeriodFinancials): number | null {
  const ocf = calcOperatingCashFlow(period);
  if (ocf === null) return null;
  const capex = v(period.cashFlow.capitalExpenditure);
  if (capex === null) return null;
  return ocf + capex; // capex stored as negative number convention
}

export function calcNetDebt(balance: BalanceSheet): number | null {
  const cash = v(balance.cash) ?? 0;
  const stInv = v(balance.shortTermInvestments) ?? 0;
  const stDebt = v(balance.shortTermDebt);
  const ltDebt = v(balance.longTermDebt);
  const lease = v(balance.leaseLiabilities) ?? 0;
  if (stDebt === null || ltDebt === null) return null;
  return stDebt + ltDebt + lease - cash - stInv;
}

export function calcWorkingCapital(balance: BalanceSheet): number | null {
  const rec = v(balance.receivables);
  const inv = v(balance.inventory);
  const oca = v(balance.otherCurrentAssets) ?? 0;
  const cash = v(balance.cash) ?? 0;
  const stInv = v(balance.shortTermInvestments) ?? 0;
  const pay = v(balance.accountsPayable);
  const acc = v(balance.accruedExpenses) ?? 0;
  const stDebt = v(balance.shortTermDebt) ?? 0;
  if (rec === null || inv === null || pay === null) return null;
  const currentAssets = rec + inv + oca + cash + stInv;
  const currentLiab = pay + acc + stDebt;
  return currentAssets - currentLiab;
}

export function calcROIC(period: PeriodFinancials): number | null {
  const ebit = calcEbit(period.income);
  const tax = v(period.income.incomeTaxExpense);
  const preTax = ebit !== null ? ebit + (v(period.income.interestIncome) ?? 0) - (v(period.income.interestExpense) ?? 0) : null;
  if (ebit === null || tax === null || preTax === null) return null;
  if (preTax === 0) return null;
  const nopat = ebit * (1 - tax / preTax);
  const debt = v(period.balance.shortTermDebt) ?? 0;
  const ltDebt = v(period.balance.longTermDebt) ?? 0;
  const lease = v(period.balance.leaseLiabilities) ?? 0;
  const equity = v(period.balance.shareholdersEquity) ?? 0;
  const investedCapital = debt + ltDebt + lease + equity;
  if (investedCapital === 0) return null;
  return nopat / investedCapital;
}

/** Analyze historical periods, returning derived metrics and data quality issues. */
export function analyzeHistorical(periods: PeriodFinancials[]): HistoricalAnalysis {
  const sorted = [...periods].sort((a, b) => a.fiscalYear - b.fiscalYear);
  const years = sorted.map((p) => p.fiscalYear);
  const issues: DataQualityIssue[] = [];

  const revenue = sorted.map((p) => v(p.income.revenue));
  const revenueGrowth = revenue.map((r, i) => (i === 0 ? null : pctChange(r, revenue[i - 1])));

  const grossProfit = sorted.map((p) => calcGrossProfit(p.income));
  const grossMargin = grossProfit.map((gp, i) => safeDiv(gp, revenue[i]));

  const ebitda = sorted.map((p) => calcEbitda(p.income));
  const ebitdaMargin = ebitda.map((e, i) => safeDiv(e, revenue[i]));

  const ebit = sorted.map((p) => calcEbit(p.income));
  const ebitMargin = ebit.map((e, i) => safeDiv(e, revenue[i]));

  const netIncome = sorted.map((p) => calcNetIncome(p.income));
  const netMargin = netIncome.map((n, i) => safeDiv(n, revenue[i]));

  const effectiveTaxRate = sorted.map((p) => {
    const preTax = calcEbit(p.income) !== null
      ? (calcEbit(p.income) as number) + (v(p.income.interestIncome) ?? 0) - (v(p.income.interestExpense) ?? 0)
      : null;
    const tax = v(p.income.incomeTaxExpense);
    return safeDiv(tax, preTax);
  });

  const capexPercentOfRevenue = sorted.map((p, i) =>
    safeDiv(v(p.cashFlow.capitalExpenditure), revenue[i])
  );
  const daPercentOfRevenue = sorted.map((p, i) =>
    safeDiv(v(p.income.depreciationAmortization), revenue[i])
  );

  const operatingCashFlow = sorted.map((p) => calcOperatingCashFlow(p));
  const freeCashFlow = sorted.map((p) => calcFreeCashFlow(p));

  const workingCapital = sorted.map((p) => calcWorkingCapital(p.balance));
  const netDebt = sorted.map((p) => calcNetDebt(p.balance));
  const debtToEquity = netDebt.map((nd, i) => {
    const eq = v(sorted[i].balance.shareholdersEquity);
    if (nd === null) return null;
    const totalDebt = (v(sorted[i].balance.shortTermDebt) ?? 0) + (v(sorted[i].balance.longTermDebt) ?? 0);
    return safeDiv(totalDebt, eq);
  });
  const netDebtToEbitda = netDebt.map((nd, i) => safeDiv(nd, ebitda[i]));
  const roic = sorted.map((p) => calcROIC(p));
  const assetTurnover = revenue.map((r, i) => {
    const totalAssets =
      (v(sorted[i].balance.cash) ?? 0) +
      (v(sorted[i].balance.shortTermInvestments) ?? 0) +
      (v(sorted[i].balance.receivables) ?? 0) +
      (v(sorted[i].balance.inventory) ?? 0) +
      (v(sorted[i].balance.otherCurrentAssets) ?? 0) +
      (v(sorted[i].balance.ppe) ?? 0) +
      (v(sorted[i].balance.intangibleAssets) ?? 0) +
      (v(sorted[i].balance.goodwill) ?? 0) +
      (v(sorted[i].balance.otherNonCurrentAssets) ?? 0);
    return safeDiv(r, totalAssets);
  });

  // accounting consistency: assets = liabilities + equity
  const accountingConsistency = sorted.map((p) => {
    const assets =
      (v(p.balance.cash) ?? 0) +
      (v(p.balance.shortTermInvestments) ?? 0) +
      (v(p.balance.receivables) ?? 0) +
      (v(p.balance.inventory) ?? 0) +
      (v(p.balance.otherCurrentAssets) ?? 0) +
      (v(p.balance.ppe) ?? 0) +
      (v(p.balance.intangibleAssets) ?? 0) +
      (v(p.balance.goodwill) ?? 0) +
      (v(p.balance.otherNonCurrentAssets) ?? 0);
    const liab =
      (v(p.balance.accountsPayable) ?? 0) +
      (v(p.balance.accruedExpenses) ?? 0) +
      (v(p.balance.shortTermDebt) ?? 0) +
      (v(p.balance.longTermDebt) ?? 0) +
      (v(p.balance.leaseLiabilities) ?? 0) +
      (v(p.balance.otherLiabilities) ?? 0) +
      (v(p.balance.minorityInterests) ?? 0);
    const eq = v(p.balance.shareholdersEquity) ?? 0;
    const delta = assets - liab - eq;
    return { year: p.fiscalYear, balanced: Math.abs(delta) < 1, delta };
  });

  // validation issues
  sorted.forEach((p, i) => {
    if (revenue[i] === null) {
      issues.push({ severity: 'error', field: `revenue ${p.fiscalYear}`, message: 'Revenue is missing — forecasts cannot be built without it.' });
    }
    if (revenue[i] !== null && revenue[i]! < 0) {
      issues.push({ severity: 'warning', field: `revenue ${p.fiscalYear}`, message: 'Revenue is negative; check data entry.' });
    }
    if (i > 0 && revenue[i] !== null && revenue[i - 1] !== null && revenue[i - 1] === 0) {
      issues.push({ severity: 'info', field: `revenue ${p.fiscalYear}`, message: 'Prior-year revenue is zero; growth rate cannot be computed.' });
    }
    if (grossProfit[i] !== null && grossProfit[i]! < 0) {
      issues.push({ severity: 'warning', field: `gross profit ${p.fiscalYear}`, message: 'Gross profit is negative.' });
    }
    if (!accountingConsistency[i].balanced) {
      issues.push({ severity: 'warning', field: `balance sheet ${p.fiscalYear}`, message: `Assets ≠ Liabilities + Equity (delta ${accountingConsistency[i].delta.toFixed(0)}).` });
    }
  });

  return {
    years,
    revenue,
    revenueGrowth,
    grossProfit,
    grossMargin,
    ebitda,
    ebitdaMargin,
    ebit,
    ebitMargin,
    netIncome,
    netMargin,
    effectiveTaxRate,
    capexPercentOfRevenue,
    daPercentOfRevenue,
    operatingCashFlow,
    freeCashFlow,
    workingCapital,
    netDebt,
    debtToEquity,
    netDebtToEbitda,
    roic,
    assetTurnover,
    issues,
    accountingConsistency,
  };
}
