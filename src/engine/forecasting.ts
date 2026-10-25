import type { PeriodFinancials } from '@/types/finance';

// Statistical and simple forecasting methods for revenue, evaluated with
// chronological train/test splits. These are kept separate from the
// assumption-driven financial statement forecasts.

export interface ForecastPoint {
  year: number;
  value: number;
}

/** Naive forecast: next value = last observed value. */
export function naiveForecast(history: number[], horizon: number): number[] {
  if (history.length === 0) return [];
  const last = history[history.length - 1];
  return Array.from({ length: horizon }, () => last);
}

/** Moving average forecast: average of last `window` observations. */
export function movingAverageForecast(history: number[], horizon: number, window = 3): number[] {
  if (history.length === 0) return [];
  const w = Math.min(window, history.length);
  const avg = history.slice(-w).reduce((a, b) => a + b, 0) / w;
  return Array.from({ length: horizon }, () => avg);
}

/** Average historical growth rate, applied compoundingly. */
export function averageGrowthForecast(history: number[], horizon: number): number[] {
  if (history.length < 2) return history.length ? Array.from({ length: horizon }, () => history[0]) : [];
  const growthRates: number[] = [];
  for (let i = 1; i < history.length; i++) {
    if (history[i - 1] !== 0) {
      growthRates.push(history[i] / history[i - 1] - 1);
    }
  }
  if (growthRates.length === 0) return Array.from({ length: horizon }, () => history[history.length - 1]);
  const avgGrowth = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
  let last = history[history.length - 1];
  return Array.from({ length: horizon }, () => {
    last = last * (1 + avgGrowth);
    return last;
  });
}

/** Linear regression forecast (least squares on time index). */
export function linearRegressionForecast(history: number[], horizon: number): number[] {
  const n = history.length;
  if (n < 2) return history.length ? Array.from({ length: horizon }, () => history[0]) : [];
  // x = 0..n-1
  const xs = Array.from({ length: n }, (_, i) => i);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = history.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (history[i] - yMean);
    den += (xs[i] - xMean) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;
  return Array.from({ length: horizon }, (_, i) => intercept + slope * (n + i));
}

/** Simple exponential smoothing (Holt's with no trend, SES). */
export function exponentialSmoothingForecast(
  history: number[],
  horizon: number,
  alpha = 0.5
): number[] {
  if (history.length === 0) return [];
  let level = history[0];
  for (let i = 1; i < history.length; i++) {
    level = alpha * history[i] + (1 - alpha) * level;
  }
  return Array.from({ length: horizon }, () => level);
}

export type ForecastMethod =
  | 'naive'
  | 'moving_average'
  | 'average_growth'
  | 'linear_regression'
  | 'exponential_smoothing';

export const FORECAST_METHODS: ForecastMethod[] = [
  'naive',
  'moving_average',
  'average_growth',
  'linear_regression',
  'exponential_smoothing',
];

export function runForecast(
  method: ForecastMethod,
  history: number[],
  horizon: number
): number[] {
  switch (method) {
    case 'naive':
      return naiveForecast(history, horizon);
    case 'moving_average':
      return movingAverageForecast(history, horizon);
    case 'average_growth':
      return averageGrowthForecast(history, horizon);
    case 'linear_regression':
      return linearRegressionForecast(history, horizon);
    case 'exponential_smoothing':
      return exponentialSmoothingForecast(history, horizon);
    default:
      return naiveForecast(history, horizon);
  }
}

// ── Evaluation metrics ──────────────────────────────────────────────────────

/** Mean Absolute Error. */
export function mae(actual: number[], predicted: number[]): number {
  if (actual.length === 0) return 0;
  const n = Math.min(actual.length, predicted.length);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += Math.abs(actual[i] - predicted[i]);
  return sum / n;
}

/** Root Mean Squared Error. */
export function rmse(actual: number[], predicted: number[]): number {
  if (actual.length === 0) return 0;
  const n = Math.min(actual.length, predicted.length);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += (actual[i] - predicted[i]) ** 2;
  return Math.sqrt(sum / n);
}

/** Mean Absolute Percentage Error (null when any actual is 0). */
export function mape(actual: number[], predicted: number[]): number | null {
  if (actual.length === 0) return null;
  if (actual.some((a) => a === 0)) return null;
  const n = Math.min(actual.length, predicted.length);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += Math.abs((actual[i] - predicted[i]) / actual[i]);
  return sum / n;
}

/** Symmetric MAPE — defined to handle zero values symmetrically. */
export function smape(actual: number[], predicted: number[]): number | null {
  if (actual.length === 0) return null;
  const n = Math.min(actual.length, predicted.length);
  let sum = 0;
  let counted = 0;
  for (let i = 0; i < n; i++) {
    const denom = (Math.abs(actual[i]) + Math.abs(predicted[i])) / 2;
    if (denom === 0) continue;
    sum += Math.abs(actual[i] - predicted[i]) / denom;
    counted++;
  }
  if (counted === 0) return null;
  return sum / counted;
}

/**
 * Chronological train/test evaluation. Never shuffles time-series data.
 * Trains on `trainYears[0..split]` and tests predictions against the
 * held-out tail, re-fitting per method on the expanding window (rolling origin).
 */
export function evaluateForecasts(
  history: number[],
  trainEndIndex: number
): {
  method: ForecastMethod;
  mae: number;
  rmse: number;
  mape: number | null;
  smape: number | null;
}[] {
  if (trainEndIndex < 1 || trainEndIndex >= history.length) {
    throw new Error('trainEndIndex must be within history bounds.');
  }
  const train = history.slice(0, trainEndIndex);
  const test = history.slice(trainEndIndex);
  const horizon = test.length;

  return FORECAST_METHODS.map((method) => {
    const preds = runForecast(method, train, horizon);
    return {
      method,
      mae: mae(test, preds),
      rmse: rmse(test, preds),
      mape: mape(test, preds),
      smape: smape(test, preds),
    };
  });
}

/** Extract a revenue series from historical periods (nulls filtered to 0 only for stat methods). */
export function revenueSeries(periods: PeriodFinancials[]): number[] {
  return periods
    .sort((a, b) => a.fiscalYear - b.fiscalYear)
    .map((p) => p.income.revenue.value ?? 0);
}
