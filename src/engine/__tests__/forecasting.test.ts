import { describe, it, expect } from 'vitest';
import {
  naiveForecast,
  movingAverageForecast,
  averageGrowthForecast,
  linearRegressionForecast,
  exponentialSmoothingForecast,
  mae,
  rmse,
  mape,
  smape,
  evaluateForecasts,
} from '@/engine/forecasting';

describe('naive forecast', () => {
  it('returns last value repeated', () => {
    expect(naiveForecast([10, 20, 30], 3)).toEqual([30, 30, 30]);
  });
  it('empty history returns empty', () => {
    expect(naiveForecast([], 3)).toEqual([]);
  });
});

describe('moving average', () => {
  it('averages last `window` observations', () => {
    expect(movingAverageForecast([10, 20, 30, 40], 2, 2)).toEqual([35, 35]);
  });
  it('falls back to all history when window > length', () => {
    expect(movingAverageForecast([10, 20], 1, 5)).toEqual([15]);
  });
});

describe('average growth forecast', () => {
  it('compounds average growth', () => {
    // 100 -> 110 (10%) -> 121 (10%); avg = 10%
    const out = averageGrowthForecast([100, 110, 121], 2);
    expect(out[0]).toBeCloseTo(121 * 1.1, 4);
    expect(out[1]).toBeCloseTo(121 * 1.1 * 1.1, 4);
  });
  it('returns last when only one period', () => {
    expect(averageGrowthForecast([50], 2)).toEqual([50, 50]);
  });
});

describe('linear regression', () => {
  it('fits a perfect line', () => {
    // y = 2x + 1 for x=0..4 -> y = 1,3,5,7,9
    const out = linearRegressionForecast([1, 3, 5, 7, 9], 2);
    expect(out[0]).toBeCloseTo(11, 6);
    expect(out[1]).toBeCloseTo(13, 6);
  });
});

describe('exponential smoothing', () => {
  it('returns smoothed level', () => {
    const out = exponentialSmoothingForecast([10, 20, 30], 1, 0.5);
    // level: 10 -> 15 -> 22.5
    expect(out[0]).toBeCloseTo(22.5, 4);
  });
});

describe('error metrics', () => {
  it('MAE', () => {
    expect(mae([100, 110], [90, 120])).toBeCloseTo(10, 6);
  });
  it('RMSE', () => {
    // errors: 10, 10; mean squared = 100; sqrt = 10
    expect(rmse([100, 110], [90, 120])).toBeCloseTo(10, 6);
  });
  it('MAPE returns null when any actual is 0', () => {
    expect(mape([0, 100], [50, 110])).toBeNull();
  });
  it('MAPE computes when all actuals nonzero', () => {
    // mean of |100-90|/100 and |110-120|/110 = (0.1 + 0.0909)/2 = 0.09545
    expect(mape([100, 110], [90, 120])).toBeCloseTo((0.1 + 10 / 110) / 2, 4);
  });
  it('sMAPE handles zero values', () => {
    expect(smape([0, 100], [50, 110])).not.toBeNull();
  });
});

describe('evaluateForecasts — chronological split', () => {
  it('trains on first half, tests on second half', () => {
    const history = [100, 110, 121, 133, 146];
    const results = evaluateForecasts(history, 3);
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => {
      expect(r.rmse).toBeGreaterThanOrEqual(0);
    });
  });
  it('throws on invalid split index', () => {
    expect(() => evaluateForecasts([100, 110], 0)).toThrow();
    expect(() => evaluateForecasts([100, 110], 5)).toThrow();
  });
});
