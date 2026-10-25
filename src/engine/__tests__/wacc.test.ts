import { describe, it, expect } from 'vitest';
import { calculateWACC, validateWACC } from '@/engine/wacc';
import type { WACCInputs } from '@/types/finance';

describe('WACC calculation — CAPM known answer', () => {
  // rf=4%, beta=1.2, ERP=5%, pretax debt=6%, tax=25%
  // Cost of equity = 0.04 + 1.2*0.05 = 0.10
  // After-tax debt = 0.06 * 0.75 = 0.045
  // E=600, D=400 -> wE=0.6, wD=0.4
  // WACC = 0.6*0.10 + 0.4*0.045 = 0.06 + 0.018 = 0.078
  const inputs: WACCInputs = {
    riskFreeRate: 0.04,
    equityBeta: 1.2,
    equityRiskPremium: 0.05,
    preTaxCostOfDebt: 0.06,
    taxRate: 0.25,
    marketValueOfEquity: 600,
    marketValueOfDebt: 400,
    useDirectEntry: false,
    directWACC: 0,
  };
  const result = calculateWACC(inputs);
  it('cost of equity = 0.10', () => {
    expect(result.costOfEquity).toBeCloseTo(0.10, 6);
  });
  it('after-tax cost of debt = 0.045', () => {
    expect(result.afterTaxCostOfDebt).toBeCloseTo(0.045, 6);
  });
  it('equity weight = 0.6', () => {
    expect(result.equityWeight).toBeCloseTo(0.6, 6);
  });
  it('WACC = 0.078', () => {
    expect(result.wacc).toBeCloseTo(0.078, 6);
  });
});

describe('WACC direct entry', () => {
  it('uses directWACC when useDirectEntry is true', () => {
    const result = calculateWACC({
      riskFreeRate: 0.04, equityBeta: 1, equityRiskPremium: 0.05, preTaxCostOfDebt: 0.05, taxRate: 0.21, marketValueOfEquity: 100, marketValueOfDebt: 0, useDirectEntry: true, directWACC: 0.09,
    });
    expect(result.wacc).toBeCloseTo(0.09, 6);
  });
});

describe('WACC validation', () => {
  it('flags zero total capital', () => {
    const issues = validateWACC({ riskFreeRate: 0.04, equityBeta: 1, equityRiskPremium: 0.05, preTaxCostOfDebt: 0.05, taxRate: 0.21, marketValueOfEquity: 0, marketValueOfDebt: 0, useDirectEntry: false, directWACC: 0 });
    expect(issues.some((m) => m.includes('At least one'))).toBe(true);
  });
  it('flags direct WACC out of range', () => {
    const issues = validateWACC({ riskFreeRate: 0, equityBeta: 0, equityRiskPremium: 0, preTaxCostOfDebt: 0, taxRate: 0, marketValueOfEquity: 0, marketValueOfDebt: 0, useDirectEntry: true, directWACC: 1.5 });
    expect(issues.some((m) => m.includes('Direct WACC'))).toBe(true);
  });
});

describe('WACC — all-equity firm', () => {
  // E=1000, D=0 -> WACC = cost of equity
  it('WACC = cost of equity when no debt', () => {
    const result = calculateWACC({
      riskFreeRate: 0.03, equityBeta: 1.1, equityRiskPremium: 0.06, preTaxCostOfDebt: 0.05, taxRate: 0.21, marketValueOfEquity: 1000, marketValueOfDebt: 0, useDirectEntry: false, directWACC: 0,
    });
    expect(result.wacc).toBeCloseTo(result.costOfEquity, 6);
    expect(result.costOfEquity).toBeCloseTo(0.03 + 1.1 * 0.06, 6);
  });
});
