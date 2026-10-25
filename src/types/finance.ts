// Core financial domain types for OpenValuation.
// All monetary values are stored in the model's reporting currency as plain numbers
// (no string formatting here — formatting lives in the UI layer).

export type CurrencyCode = string; // ISO 4217, e.g. "USD"
export type Scale = 'units' | 'thousands' | 'millions' | 'billions';

export type CompanyType = 'public' | 'private' | 'startup' | 'other';

export interface CompanyProfile {
  id: string;
  name: string;
  ticker: string | null; // null for private/non-listed companies
  industry: string;
  country: string;
  currency: CurrencyCode;
  fiscalYearEndMonth: number; // 1-12
  companyType: CompanyType;
  businessModel: string;
  valuationDate: string; // ISO date
  forecastHorizonYears: number; // 1-10
  historicalPeriodYears: number;
  forecastMethod: ForecastMethod;
  valuationMethod: ValuationMethod;
  createdAt: string;
  updatedAt: string;
}

export type ForecastMethod =
  | 'manual'
  | 'historical_average'
  | 'historical_trend'
  | 'driver'
  | 'segment'
  | 'statistical';

export type ValuationMethod = 'perpetual_growth' | 'exit_multiple';

export type LineItemStatus = 'actual' | 'estimated' | 'forecast' | 'missing';

export interface FinancialLineItem {
  value: number | null;
  unit: Scale;
  source: string;
  status: LineItemStatus;
  asOf: string; // ISO date the value was reported/entered
}

// One fiscal year of historical or reported data.
export interface PeriodFinancials {
  fiscalYear: number;
  income: IncomeStatement;
  cashFlow: CashFlowStatement;
  balance: BalanceSheet;
  other: OtherInfo;
}

export interface IncomeStatement {
  revenue: FinancialLineItem;
  cogs: FinancialLineItem;
  rdExpense: FinancialLineItem;
  sgaExpense: FinancialLineItem;
  otherOpEx: FinancialLineItem;
  depreciationAmortization: FinancialLineItem;
  interestIncome: FinancialLineItem;
  interestExpense: FinancialLineItem;
  incomeTaxExpense: FinancialLineItem;
  basicShares: FinancialLineItem;
  dilutedShares: FinancialLineItem;
}

export interface CashFlowStatement {
  stockBasedComp: FinancialLineItem;
  changeReceivables: FinancialLineItem;
  changeInventory: FinancialLineItem;
  changePayables: FinancialLineItem;
  changeOtherWorkingCapital: FinancialLineItem;
  capitalExpenditure: FinancialLineItem;
  acquisitions: FinancialLineItem;
  debtIssuance: FinancialLineItem;
  debtRepayment: FinancialLineItem;
  dividendsPaid: FinancialLineItem;
  shareRepurchases: FinancialLineItem;
}

export interface BalanceSheet {
  cash: FinancialLineItem;
  shortTermInvestments: FinancialLineItem;
  receivables: FinancialLineItem;
  inventory: FinancialLineItem;
  otherCurrentAssets: FinancialLineItem;
  ppe: FinancialLineItem;
  intangibleAssets: FinancialLineItem;
  goodwill: FinancialLineItem;
  otherNonCurrentAssets: FinancialLineItem;
  accountsPayable: FinancialLineItem;
  accruedExpenses: FinancialLineItem;
  shortTermDebt: FinancialLineItem;
  longTermDebt: FinancialLineItem;
  leaseLiabilities: FinancialLineItem;
  otherLiabilities: FinancialLineItem;
  shareholdersEquity: FinancialLineItem;
  minorityInterests: FinancialLineItem;
}

export interface OtherInfo {
  marketPrice: FinancialLineItem;
  preferredEquity: FinancialLineItem;
  nonOperatingAssets: FinancialLineItem;
  nonOperatingLiabilities: FinancialLineItem;
  segmentRevenue: SegmentEntry[];
  segmentMargins: SegmentEntry[];
}

export interface SegmentEntry {
  name: string;
  value: number;
}

// ── Assumptions ──────────────────────────────────────────────────────────────

export type AssumptionMethod =
  | 'manual'
  | 'historical_average'
  | 'historical_trend'
  | 'driver'
  | 'segment'
  | 'scenario_linked';

export interface AssumptionEntry {
  year: number;
  value: number;
  method: AssumptionMethod;
  rationale: string;
  overridden: boolean;
}

export interface Assumptions {
  revenueGrowth: AssumptionEntry[];
  grossMargin: AssumptionEntry[];
  rdPercentOfRevenue: AssumptionEntry[];
  sgaPercentOfRevenue: AssumptionEntry[];
  otherOpExPercentOfRevenue: AssumptionEntry[];
  daPercentOfRevenue: AssumptionEntry[];
  capexPercentOfRevenue: AssumptionEntry[];
  taxRate: AssumptionEntry[];
  workingCapitalPercentOfRevenue: AssumptionEntry[];
  interestRateOnDebt: AssumptionEntry[];
  stockBasedCompPercentOfRevenue: AssumptionEntry[];
  shareCountChange: AssumptionEntry[]; // annual % change
  dividendsPayoutRatio: AssumptionEntry[];
  terminalGrowthRate: number;
  wacc: number;
  terminalMethod: ValuationMethod;
  exitMultiple: number; // EV/EBITDA
  discountingConvention: 'mid_year' | 'year_end';
}

// ── Forecast results ────────────────────────────────────────────────────────

export interface ForecastPeriod {
  fiscalYear: number;
  isForecast: boolean;
  revenue: number;
  cogs: number;
  grossProfit: number;
  rdExpense: number;
  sgaExpense: number;
  otherOpEx: number;
  ebitda: number;
  da: number;
  ebit: number;
  interestIncome: number;
  interestExpense: number;
  preTaxIncome: number;
  incomeTax: number;
  netIncome: number;
  basicShares: number;
  dilutedShares: number;
  eps: number;
  // cash flow
  stockBasedComp: number;
  changeReceivables: number;
  changeInventory: number;
  changePayables: number;
  changeOtherWC: number;
  operatingCashFlow: number;
  capex: number;
  freeCashFlow: number;
  acquisitions: number;
  investingCashFlow: number;
  debtIssuance: number;
  debtRepayment: number;
  dividendsPaid: number;
  shareRepurchases: number;
  financingCashFlow: number;
  beginningCash: number;
  endingCash: number;
  // balance sheet
  cash: number;
  shortTermInvestments: number;
  receivables: number;
  inventory: number;
  otherCurrentAssets: number;
  ppe: number;
  intangibleAssets: number;
  goodwill: number;
  otherNonCurrentAssets: number;
  accountsPayable: number;
  accruedExpenses: number;
  shortTermDebt: number;
  longTermDebt: number;
  leaseLiabilities: number;
  otherLiabilities: number;
  shareholdersEquity: number;
  minorityInterests: number;
  // derived
  grossMargin: number;
  ebitdaMargin: number;
  ebitMargin: number;
  netMargin: number;
  revenueGrowth: number;
  capexPercentOfRevenue: number;
  daPercentOfRevenue: number;
  effectiveTaxRate: number;
  workingCapital: number;
  changeInWorkingCapital: number;
  // valuation
  nopat: number;
  fcff: number;
  discountPeriod: number;
  discountFactor: number;
  pvOfFcff: number;
}

export interface DCFResult {
  periods: ForecastPeriod[];
  wacc: number;
  terminalMethod: ValuationMethod;
  terminalGrowthRate: number;
  exitMultiple: number;
  pvOfExplicitFcff: number;
  terminalValue: number;
  pvOfTerminalValue: number;
  enterpriseValue: number;
  totalDebt: number;
  cash: number;
  shortTermInvestments: number;
  preferredEquity: number;
  minorityInterests: number;
  nonOperatingAssets: number;
  nonOperatingLiabilities: number;
  equityValue: number;
  dilutedShares: number;
  intrinsicValuePerShare: number;
  terminalValuePctOfEV: number;
  marketPrice: number | null;
  marketCap: number | null;
  impliedUpside: number | null;
  impliedEvEbitda: number | null;
  impliedEvRevenue: number | null;
  impliedPE: number | null;
}

export interface WACCInputs {
  riskFreeRate: number; // decimal, e.g. 0.0425
  equityBeta: number;
  equityRiskPremium: number; // decimal
  preTaxCostOfDebt: number; // decimal
  taxRate: number; // decimal
  marketValueOfEquity: number;
  marketValueOfDebt: number;
  useDirectEntry: boolean;
  directWACC: number;
}

export interface WACCResult {
  costOfEquity: number;
  afterTaxCostOfDebt: number;
  equityWeight: number;
  debtWeight: number;
  wacc: number;
  inputs: WACCInputs;
}

export interface ScenarioAssumptions {
  name: string;
  revenueGrowthDelta: number;
  grossMarginDelta: number;
  capexPercentDelta: number;
  workingCapitalPercentDelta: number;
  taxRateDelta: number;
  waccDelta: number;
  terminalGrowthDelta: number;
  exitMultipleDelta: number;
}

export type Scenario = 'bear' | 'base' | 'bull';

export interface ScenarioSummary {
  scenario: Scenario;
  revenueCAGR: number;
  terminalYearRevenue: number;
  terminalYearEbitda: number;
  enterpriseValue: number;
  equityValue: number;
  intrinsicValuePerShare: number;
  impliedUpside: number | null;
}

export interface SensitivityTable {
  rowVariable: string;
  columnVariable: string;
  rowValues: number[];
  columnValues: number[];
  cells: number[][]; // [row][col] -> intrinsic value per share
  baseRowIndex: number;
  baseColIndex: number;
}

export interface ComparableCompany {
  name: string;
  ticker: string | null;
  source: string;
  asOf: string;
  marketCap: number;
  enterpriseValue: number;
  revenue: number;
  ebitda: number;
  ebit: number;
  netIncome: number;
}

export interface ComparableResult {
  peers: ComparableCompany[];
  evRevenueMean: number;
  evRevenueMedian: number;
  evEbitdaMean: number;
  evEbitdaMedian: number;
  evEbitMean: number;
  evEbitMedian: number;
  peMean: number;
  peMedian: number;
  impliedEVRange: { low: number; mid: number; high: number };
  impliedEquityRange: { low: number; mid: number; high: number };
}

export interface ForecastMetricResult {
  name: string;
  mae: number;
  rmse: number;
  mape: number | null;
  smape: number | null;
  predictions: { year: number; actual: number | null; predicted: number }[];
}

export interface ForecastEvalResult {
  method: string;
  trainEndYear: number;
  testStartYear: number;
  results: ForecastMetricResult[];
  bestMethod: string;
}

export type DataQualityIssue = {
  severity: 'error' | 'warning' | 'info';
  field: string;
  message: string;
};
