import type { Assumptions, ScenarioAssumptions, Scenario, ScenarioSummary, DCFResult, ForecastPeriod } from '@/types/finance';
import { buildForecast, calculateDCF } from './dcf';
import type { PeriodFinancials, BalanceSheet } from '@/types/finance';

/** Apply a scenario delta to a base assumptions object, returning a new copy. */
export function applyScenario(base: Assumptions, delta: ScenarioAssumptions): Assumptions {
  const adjust = (entries: { year: number; value: number; method: string; rationale: string; overridden: boolean }[], adjFn: (v: number) => number) =>
    entries.map((e) => ({ ...e, value: adjFn(e.value) }));

  return {
    ...base,
    revenueGrowth: adjust(base.revenueGrowth, (v) => v + delta.revenueGrowthDelta),
    grossMargin: adjust(base.grossMargin, (v) => v + delta.grossMarginDelta),
    capexPercentOfRevenue: adjust(base.capexPercentOfRevenue, (v) => v + delta.capexPercentDelta),
    workingCapitalPercentOfRevenue: adjust(base.workingCapitalPercentOfRevenue, (v) => v + delta.workingCapitalPercentDelta),
    taxRate: adjust(base.taxRate, (v) => v + delta.taxRateDelta),
    wacc: base.wacc + delta.waccDelta,
    terminalGrowthRate: base.terminalGrowthRate + delta.terminalGrowthDelta,
    exitMultiple: base.exitMultiple + delta.exitMultipleDelta,
  };
}

const SCENARIO_DELTAS: Record<Scenario, ScenarioAssumptions> = {
  bear: {
    name: 'Bear',
    revenueGrowthDelta: -0.05,
    grossMarginDelta: -0.02,
    capexPercentDelta: 0.005,
    workingCapitalPercentDelta: 0.005,
    taxRateDelta: 0.02,
    waccDelta: 0.02,
    terminalGrowthDelta: -0.005,
    exitMultipleDelta: -2,
  },
  base: {
    name: 'Base',
    revenueGrowthDelta: 0,
    grossMarginDelta: 0,
    capexPercentDelta: 0,
    workingCapitalPercentDelta: 0,
    taxRateDelta: 0,
    waccDelta: 0,
    terminalGrowthDelta: 0,
    exitMultipleDelta: 0,
  },
  bull: {
    name: 'Bull',
    revenueGrowthDelta: 0.05,
    grossMarginDelta: 0.02,
    capexPercentDelta: -0.005,
    workingCapitalPercentDelta: -0.005,
    taxRateDelta: -0.02,
    waccDelta: -0.02,
    terminalGrowthDelta: 0.005,
    exitMultipleDelta: 2,
  },
};

export function getScenarioDelta(scenario: Scenario): ScenarioAssumptions {
  return SCENARIO_DELTAS[scenario];
}

export function runScenario(
  scenario: Scenario,
  base: Assumptions,
  historical: PeriodFinancials[],
  lastBalance: BalanceSheet,
  otherInfo: { marketPrice: number | null; preferredEquity: number; nonOperatingAssets: number; nonOperatingLiabilities: number; minorityInterests: number; dilutedShares: number }
): { assumptions: Assumptions; dcf: DCFResult; summary: ScenarioSummary } {
  const scenarioAssumptions = applyScenario(base, getScenarioDelta(scenario));
  const forecast = buildForecast({ historical, assumptions: scenarioAssumptions, wacc: scenarioAssumptions.wacc, marketPrice: otherInfo.marketPrice });
  const dcf = calculateDCF(forecast, scenarioAssumptions, scenarioAssumptions.wacc, lastBalance, otherInfo);
  const summary = summarizeScenario(scenario, forecast, dcf, otherInfo.marketPrice);
  return { assumptions: scenarioAssumptions, dcf, summary };
}

function summarizeScenario(
  scenario: Scenario,
  forecast: ForecastPeriod[],
  dcf: DCFResult,
  marketPrice: number | null
): ScenarioSummary {
  const years = forecast.length;
  const startRev = forecast.length > 1 ? forecast[0].revenue : forecast[0].revenue;
  const endRev = forecast[forecast.length - 1].revenue;
  const revenueCAGR = years > 0 && startRev > 0 ? Math.pow(endRev / startRev, 1 / Math.max(years - 1, 1)) - 1 : 0;
  const last = forecast[forecast.length - 1];
  return {
    scenario,
    revenueCAGR,
    terminalYearRevenue: last.revenue,
    terminalYearEbitda: last.ebitda,
    enterpriseValue: dcf.enterpriseValue,
    equityValue: dcf.equityValue,
    intrinsicValuePerShare: dcf.intrinsicValuePerShare,
    impliedUpside: marketPrice !== null && dcf.intrinsicValuePerShare > 0 ? dcf.intrinsicValuePerShare / marketPrice - 1 : null,
  };
}
