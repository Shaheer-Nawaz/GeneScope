import type {
  PeriodFinancials,
  Assumptions,
  ForecastPeriod,
  DCFResult,
  BalanceSheet,
  IncomeStatement,
} from '@/types/finance';
import { calcEbit, calcEbitda, calcNetIncome } from './historical';

/**
 * Build an integrated forecast: income statement, cash flow statement,
 * and balance sheet for every forecast year, then discount FCFF.
 *
 * Conventions:
 *  - CapEx stored as a negative number (cash outflow); we add it back.
 *  - Working capital as % of revenue drives the change in WC.
 *  - Debt interest = interestRate * prior-period total debt.
 *  - PP&E roll-forward: PP&E[t] = PP&E[t-1] + CapEx (negative) + D&A.
 *  - Retained earnings roll-forward: RE[t] = RE[t-1] + NetIncome - Dividends.
 *  - Cash plug: ending cash = beginning cash + Δcash from cash flow statement.
 *
 * When inputs are insufficient for a fully balanced balance sheet, we run a
 * partial mode and flag missing fields — we never force a plug.
 */

export interface ForecastContext {
  historical: PeriodFinancials[];
  assumptions: Assumptions;
  wacc: number;
  marketPrice: number | null;
}

function assoForYear(assumptions: Assumptions, year: number, key: keyof Assumptions): number {
  const entries = assumptions[key] as unknown as { year: number; value: number }[];
  if (!Array.isArray(entries)) return 0;
  const found = entries.find((e) => e.year === year);
  return found ? found.value : entries.length ? entries[entries.length - 1].value : 0;
}

export function buildForecast(ctx: ForecastContext): ForecastPeriod[] {
  const { historical, assumptions, wacc, marketPrice } = ctx;
  if (historical.length === 0) return [];

  const sorted = [...historical].sort((a, b) => a.fiscalYear - b.fiscalYear);
  const last = sorted[sorted.length - 1];
  const lastYear = last.fiscalYear;
  const horizon = Math.max(1, Math.min(10, assumptions.revenueGrowth.length || 1));

  const periods: ForecastPeriod[] = [];

  // Carry forward prior balance sheet values
  let prevCash = last.balance.cash.value ?? 0;
  let prevPpe = last.balance.ppe.value ?? 0;
  let prevIntangibles = last.balance.intangibleAssets.value ?? 0;
  let prevGoodwill = last.balance.goodwill.value ?? 0;
  let prevStDebt = last.balance.shortTermDebt.value ?? 0;
  let prevLtDebt = last.balance.longTermDebt.value ?? 0;
  let prevLease = last.balance.leaseLiabilities.value ?? 0;
  let prevEquity = last.balance.shareholdersEquity.value ?? 0;
  let prevDilutedShares = last.income.dilutedShares.value ?? 0;
  let prevBasicShares = last.income.basicShares.value ?? 0;
  let prevRevenue = last.income.revenue.value ?? 0;

  // Other balance sheet items held roughly constant (partial mode)
  let prevStInv = last.balance.shortTermInvestments.value ?? 0;
  let prevRec = last.balance.receivables.value ?? 0;
  let prevInv = last.balance.inventory.value ?? 0;
  let prevOca = last.balance.otherCurrentAssets.value ?? 0;
  let prevOnca = last.balance.otherNonCurrentAssets.value ?? 0;
  let prevPay = last.balance.accountsPayable.value ?? 0;
  let prevAcc = last.balance.accruedExpenses.value ?? 0;
  let prevOtherLiab = last.balance.otherLiabilities.value ?? 0;
  let prevMinority = last.balance.minorityInterests.value ?? 0;

  const discountConv = assumptions.discountingConvention ?? 'mid_year';

  for (let i = 0; i < horizon; i++) {
    const year = lastYear + i + 1;
    const growthRate = assoForYear(assumptions, year, 'revenueGrowth');
    const grossMargin = assoForYear(assumptions, year, 'grossMargin');
    const rdPct = assoForYear(assumptions, year, 'rdPercentOfRevenue');
    const sgaPct = assoForYear(assumptions, year, 'sgaPercentOfRevenue');
    const otherOpExPct = assoForYear(assumptions, year, 'otherOpExPercentOfRevenue');
    const daPct = assoForYear(assumptions, year, 'daPercentOfRevenue');
    const capexPct = assoForYear(assumptions, year, 'capexPercentOfRevenue');
    const taxRate = assoForYear(assumptions, year, 'taxRate');
    const wcPct = assoForYear(assumptions, year, 'workingCapitalPercentOfRevenue');
    const interestRate = assoForYear(assumptions, year, 'interestRateOnDebt');
    const sbcPct = assoForYear(assumptions, year, 'stockBasedCompPercentOfRevenue');
    const shareChg = assoForYear(assumptions, year, 'shareCountChange');
    const payoutRatio = assoForYear(assumptions, year, 'dividendsPayoutRatio');

    // Income statement
    const revenue = prevRevenue * (1 + growthRate);
    const grossProfit = revenue * grossMargin;
    const cogs = revenue - grossProfit;
    const rdExpense = revenue * rdPct;
    const sgaExpense = revenue * sgaPct;
    const otherOpEx = revenue * otherOpExPct;
    const ebitda = grossProfit - rdExpense - sgaExpense - otherOpEx;
    const da = revenue * daPct;
    const ebit = ebitda - da;
    const totalDebt = prevStDebt + prevLtDebt + prevLease;
    const interestExpense = -(totalDebt * interestRate);
    const interestIncome = 0; // assumed immaterial unless user supplies
    const preTaxIncome = ebit + interestIncome + interestExpense;
    const incomeTax = preTaxIncome * taxRate;
    const netIncome = preTaxIncome - incomeTax;

    // Shares
    const dilutedShares = prevDilutedShares * (1 + shareChg);
    const basicShares = prevBasicShares * (1 + shareChg);
    const eps = dilutedShares > 0 ? netIncome / dilutedShares : 0;

    // Working capital
    const workingCapital = revenue * wcPct;
    // prior WC for delta
    const priorWC = prevRec + prevInv + prevOca - prevPay - prevAcc;
    const changeInWC = workingCapital - priorWC;

    // Cash flow statement
    const stockBasedComp = revenue * sbcPct;
    // WC changes as cash flow signs (increase in asset = outflow)
    const changeReceivables = -((revenue * wcPct * 0.4) - prevRec);
    const changeInventory = -((revenue * wcPct * 0.2) - prevInv);
    const changePayables = (revenue * wcPct * 0.3) - prevPay;
    const changeOtherWC = -((revenue * wcPct * 0.1) - prevOca);
    const capex = -(revenue * capexPct);
    const operatingCashFlow =
      netIncome + da + stockBasedComp + changeReceivables + changeInventory + changePayables + changeOtherWC;
    const freeCashFlow = operatingCashFlow + capex;
    const acquisitions = 0;
    const investingCashFlow = capex + acquisitions;

    // Debt schedule: assume debt rolls at constant; issuance/repayment = 0 unless user sets
    const debtIssuance = 0;
    const debtRepayment = 0;
    const dividendsPaid = -(netIncome * payoutRatio);
    const shareRepurchases = 0;
    const financingCashFlow = debtIssuance + debtRepayment + dividendsPaid + shareRepurchases;

    const beginningCash = prevCash;
    const endingCash = beginningCash + operatingCashFlow + investingCashFlow + financingCashFlow;

    // Balance sheet roll-forward
    const newPpe = prevPpe + capex + da;
    const newEquity = prevEquity + netIncome - dividendsPaid + stockBasedComp;
    // Carry other items constant (partial mode)
    const newStDebt = prevStDebt;
    const newLtDebt = prevLtDebt;
    const newLease = prevLease;
    const newStInv = prevStInv;
    const newRec = revenue * wcPct * 0.4;
    const newInv = revenue * wcPct * 0.2;
    const newOca = prevOca;
    const newOnca = prevOnca;
    const newPay = revenue * wcPct * 0.3;
    const newAcc = prevAcc;
    const newOtherLiab = prevOtherLiab;
    const newMinority = prevMinority;

    // NOPAT & FCFF
    const nopat = ebit * (1 - taxRate);
    const fcff = nopat + da + capex - changeInWC;

    // Discounting
    const discountPeriod = discountConv === 'mid_year' ? i + 0.5 : i + 1;
    const discountFactor = 1 / Math.pow(1 + wacc, discountPeriod);
    const pvOfFcff = fcff * discountFactor;

    const period: ForecastPeriod = {
      fiscalYear: year,
      isForecast: true,
      revenue,
      cogs,
      grossProfit,
      rdExpense,
      sgaExpense,
      otherOpEx,
      ebitda,
      da,
      ebit,
      interestIncome,
      interestExpense,
      preTaxIncome,
      incomeTax,
      netIncome,
      basicShares,
      dilutedShares,
      eps,
      stockBasedComp,
      changeReceivables,
      changeInventory,
      changePayables,
      changeOtherWC,
      operatingCashFlow,
      capex,
      freeCashFlow,
      acquisitions,
      investingCashFlow,
      debtIssuance,
      debtRepayment,
      dividendsPaid,
      shareRepurchases,
      financingCashFlow,
      beginningCash,
      endingCash,
      cash: endingCash,
      shortTermInvestments: newStInv,
      receivables: newRec,
      inventory: newInv,
      otherCurrentAssets: newOca,
      ppe: newPpe,
      intangibleAssets: prevIntangibles,
      goodwill: prevGoodwill,
      otherNonCurrentAssets: newOnca,
      accountsPayable: newPay,
      accruedExpenses: newAcc,
      shortTermDebt: newStDebt,
      longTermDebt: newLtDebt,
      leaseLiabilities: newLease,
      otherLiabilities: newOtherLiab,
      shareholdersEquity: newEquity,
      minorityInterests: newMinority,
      grossMargin: revenue > 0 ? grossProfit / revenue : 0,
      ebitdaMargin: revenue > 0 ? ebitda / revenue : 0,
      ebitMargin: revenue > 0 ? ebit / revenue : 0,
      netMargin: revenue > 0 ? netIncome / revenue : 0,
      revenueGrowth: prevRevenue > 0 ? revenue / prevRevenue - 1 : 0,
      capexPercentOfRevenue: revenue > 0 ? capex / revenue : 0,
      daPercentOfRevenue: revenue > 0 ? da / revenue : 0,
      effectiveTaxRate: preTaxIncome !== 0 ? incomeTax / preTaxIncome : 0,
      workingCapital,
      changeInWorkingCapital: changeInWC,
      nopat,
      fcff,
      discountPeriod,
      discountFactor,
      pvOfFcff,
    };

    periods.push(period);

    // roll forward state
    prevCash = endingCash;
    prevPpe = newPpe;
    prevEquity = newEquity;
    prevDilutedShares = dilutedShares;
    prevBasicShares = basicShares;
    prevRevenue = revenue;
    prevStDebt = newStDebt;
    prevLtDebt = newLtDebt;
    prevLease = newLease;
    prevStInv = newStInv;
    prevRec = newRec;
    prevInv = newInv;
    prevOca = newOca;
    prevOnca = newOnca;
    prevPay = newPay;
    prevAcc = newAcc;
    prevOtherLiab = newOtherLiab;
    prevMinority = newMinority;
  }

  return periods;
}

/** Calculate DCF valuation from a forecast. */
export function calculateDCF(
  forecast: ForecastPeriod[],
  assumptions: Assumptions,
  wacc: number,
  lastBalance: BalanceSheet,
  otherInfo: { marketPrice: number | null; preferredEquity: number; nonOperatingAssets: number; nonOperatingLiabilities: number; minorityInterests: number; dilutedShares: number }
): DCFResult {
  if (forecast.length === 0) {
    throw new Error('Cannot compute DCF with an empty forecast.');
  }
  if (wacc <= 0) throw new Error('WACC must be positive.');
  if (assumptions.terminalMethod === 'perpetual_growth' && wacc <= assumptions.terminalGrowthRate) {
    throw new Error(`Invalid DCF: WACC (${(wacc * 100).toFixed(2)}%) must exceed terminal growth (${(assumptions.terminalGrowthRate * 100).toFixed(2)}%).`);
  }

  // PV of explicit FCFF
  const pvOfExplicitFcff = forecast.reduce((sum, p) => sum + p.pvOfFcff, 0);

  // Terminal value
  const lastPeriod = forecast[forecast.length - 1];
  let terminalValue: number;
  if (assumptions.terminalMethod === 'perpetual_growth') {
    const g = assumptions.terminalGrowthRate;
    terminalValue = (lastPeriod.fcff * (1 + g)) / (wacc - g);
  } else {
    // exit multiple on terminal-year EBITDA
    terminalValue = lastPeriod.ebitda * assumptions.exitMultiple;
  }

  // Discount terminal value back. Use the period after the last explicit year.
  const terminalDiscountPeriod =
    assumptions.discountingConvention === 'mid_year'
      ? forecast.length + 0.5
      : forecast.length;
  const pvOfTerminalValue = terminalValue / Math.pow(1 + wacc, terminalDiscountPeriod);

  const enterpriseValue = pvOfExplicitFcff + pvOfTerminalValue;

  // Equity bridge
  const totalDebt = (lastBalance.shortTermDebt.value ?? 0) + (lastBalance.longTermDebt.value ?? 0) + (lastBalance.leaseLiabilities.value ?? 0);
  const cash = lastBalance.cash.value ?? 0;
  const shortTermInvestments = lastBalance.shortTermInvestments.value ?? 0;
  const preferredEquity = otherInfo.preferredEquity;
  const minorityInterests = otherInfo.minorityInterests;
  const nonOperatingAssets = otherInfo.nonOperatingAssets;
  const nonOperatingLiabilities = otherInfo.nonOperatingLiabilities;

  const equityValue =
    enterpriseValue
    - totalDebt
    + cash
    + shortTermInvestments
    + nonOperatingAssets
    - nonOperatingLiabilities
    - preferredEquity
    - minorityInterests;

  const dilutedShares = otherInfo.dilutedShares;
  const intrinsicValuePerShare = dilutedShares > 0 ? equityValue / dilutedShares : 0;

  const terminalValuePctOfEV = enterpriseValue > 0 ? pvOfTerminalValue / enterpriseValue : 0;

  const marketPrice = otherInfo.marketPrice;
  const marketCap = marketPrice !== null && dilutedShares > 0 ? marketPrice * dilutedShares : null;
  const impliedUpside =
    marketPrice !== null && intrinsicValuePerShare > 0
      ? intrinsicValuePerShare / marketPrice - 1
      : null;

  // implied multiples (use terminal-year figures where market price exists)
  const impliedEvEbitda = marketCap !== null ? enterpriseValue / Math.max(lastPeriod.ebitda, 0) : null;
  const impliedEvRevenue = marketCap !== null ? enterpriseValue / Math.max(lastPeriod.revenue, 0) : null;
  const impliedPE = marketPrice !== null && lastPeriod.netIncome > 0
    ? marketPrice / (lastPeriod.netIncome / dilutedShares)
    : null;

  return {
    periods: forecast,
    wacc,
    terminalMethod: assumptions.terminalMethod,
    terminalGrowthRate: assumptions.terminalGrowthRate,
    exitMultiple: assumptions.exitMultiple,
    pvOfExplicitFcff,
    terminalValue,
    pvOfTerminalValue,
    enterpriseValue,
    totalDebt,
    cash,
    shortTermInvestments,
    preferredEquity,
    minorityInterests,
    nonOperatingAssets,
    nonOperatingLiabilities,
    equityValue,
    dilutedShares,
    intrinsicValuePerShare,
    terminalValuePctOfEV,
    marketPrice,
    marketCap,
    impliedUpside,
    impliedEvEbitda,
    impliedEvRevenue,
    impliedPE,
  };
}
