import type { SensitivityTable, Assumptions, PeriodFinancials, BalanceSheet } from '@/types/finance';
import { buildForecast, calculateDCF } from './dcf';

/**
 * Build a two-variable sensitivity table that recalculates intrinsic value
 * per share for every combination of two assumption variables.
 * Invalid combinations (WACC <= g) produce null -> represented as NaN in cells.
 */

function mutateAssumption(
  base: Assumptions,
  variable: 'wacc' | 'terminalGrowthRate' | 'exitMultiple' | 'revenueGrowth' | 'operatingMargin',
  value: number
): Assumptions {
  if (variable === 'wacc') return { ...base, wacc: value };
  if (variable === 'terminalGrowthRate') return { ...base, terminalGrowthRate: value };
  if (variable === 'exitMultiple') return { ...base, exitMultiple: value };
  if (variable === 'revenueGrowth') {
    return {
      ...base,
      revenueGrowth: base.revenueGrowth.map((e) => ({ ...e, value })),
    };
  }
  // operating margin: adjust gross margin
  if (variable === 'operatingMargin') {
    // approximate operating margin shift via gross margin shift
    return {
      ...base,
      grossMargin: base.grossMargin.map((e) => ({ ...e, value: Math.max(0, e.value + value) })),
    };
  }
  return base;
}

export function buildSensitivity(
  rowVariable: 'wacc' | 'terminalGrowthRate' | 'exitMultiple' | 'revenueGrowth' | 'operatingMargin',
  columnVariable: 'wacc' | 'terminalGrowthRate' | 'exitMultiple' | 'revenueGrowth' | 'operatingMargin',
  rowValues: number[],
  columnValues: number[],
  base: Assumptions,
  historical: PeriodFinancials[],
  lastBalance: BalanceSheet,
  otherInfo: { marketPrice: number | null; preferredEquity: number; nonOperatingAssets: number; nonOperatingLiabilities: number; minorityInterests: number; dilutedShares: number }
): SensitivityTable {
  const cells: number[][] = [];
  for (const rowVal of rowValues) {
    const row: number[] = [];
    for (const colVal of columnValues) {
      let a = mutateAssumption(base, rowVariable, rowVal);
      a = mutateAssumption(a, columnVariable, colVal);
      try {
        const wacc = a.wacc;
        if (a.terminalMethod === 'perpetual_growth' && wacc <= a.terminalGrowthRate) {
          row.push(NaN);
          continue;
        }
        const forecast = buildForecast({ historical, assumptions: a, wacc, marketPrice: otherInfo.marketPrice });
        const dcf = calculateDCF(forecast, a, wacc, lastBalance, otherInfo);
        row.push(dcf.intrinsicValuePerShare);
      } catch {
        row.push(NaN);
      }
    }
    cells.push(row);
  }

  // base indices: find closest value to base assumption
  const baseRowVal =
    rowVariable === 'wacc' ? base.wacc
    : rowVariable === 'terminalGrowthRate' ? base.terminalGrowthRate
    : rowVariable === 'exitMultiple' ? base.exitMultiple
    : rowVariable === 'revenueGrowth' ? base.revenueGrowth[0]?.value ?? 0
    : 0;
  const baseColVal =
    columnVariable === 'wacc' ? base.wacc
    : columnVariable === 'terminalGrowthRate' ? base.terminalGrowthRate
    : columnVariable === 'exitMultiple' ? base.exitMultiple
    : columnVariable === 'revenueGrowth' ? base.revenueGrowth[0]?.value ?? 0
    : 0;

  const baseRowIndex = rowValues.findIndex((v) => Math.abs(v - baseRowVal) < 1e-9);
  const baseColIndex = columnValues.findIndex((v) => Math.abs(v - baseColVal) < 1e-9);

  return {
    rowVariable,
    columnVariable,
    rowValues,
    columnValues,
    cells,
    baseRowIndex: baseRowIndex >= 0 ? baseRowIndex : 0,
    baseColIndex: baseColIndex >= 0 ? baseColIndex : 0,
  };
}

/** Generate a default range around a center value with a step. */
export function range(center: number, step: number, count: number): number[] {
  const half = Math.floor(count / 2);
  return Array.from({ length: count }, (_, i) => +(center + (i - half) * step).toFixed(6));
}
