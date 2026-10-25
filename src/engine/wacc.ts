import type { WACCInputs, WACCResult } from '@/types/finance';

/**
 * Calculate the Weighted Average Cost of Capital.
 *
 * Cost of Equity = RiskFreeRate + Beta * EquityRiskPremium   (CAPM)
 * After-tax Cost of Debt = PreTaxCostOfDebt * (1 - TaxRate)
 * WACC = E/(E+D) * CostOfEquity + D/(E+D) * AfterTaxCostOfDebt
 *
 * When the user lacks market data, they may enter WACC directly via
 * useDirectEntry=true with directWACC set.
 */
export function calculateWACC(inputs: WACCInputs): WACCResult {
  if (inputs.useDirectEntry) {
    return {
      costOfEquity: 0,
      afterTaxCostOfDebt: 0,
      equityWeight: 0,
      debtWeight: 0,
      wacc: inputs.directWACC,
      inputs,
    };
  }

  const costOfEquity = inputs.riskFreeRate + inputs.equityBeta * inputs.equityRiskPremium;
  const afterTaxCostOfDebt = inputs.preTaxCostOfDebt * (1 - inputs.taxRate);

  const totalCapital = inputs.marketValueOfEquity + inputs.marketValueOfDebt;
  if (totalCapital === 0) {
    throw new Error('WACC cannot be computed when both equity and debt market values are zero.');
  }

  const equityWeight = inputs.marketValueOfEquity / totalCapital;
  const debtWeight = inputs.marketValueOfDebt / totalCapital;

  const wacc = equityWeight * costOfEquity + debtWeight * afterTaxCostOfDebt;

  return {
    costOfEquity,
    afterTaxCostOfDebt,
    equityWeight,
    debtWeight,
    wacc,
    inputs,
  };
}

/** Validate WACC inputs, returning a list of human-readable issues. */
export function validateWACC(inputs: WACCInputs): string[] {
  const issues: string[] = [];
  if (inputs.useDirectEntry) {
    if (inputs.directWACC <= 0 || inputs.directWACC > 1) {
      issues.push('Direct WACC must be between 0% and 100%.');
    }
    return issues;
  }
  if (inputs.riskFreeRate < 0) issues.push('Risk-free rate should not be negative.');
  if (inputs.equityBeta <= 0) issues.push('Equity beta should be positive.');
  if (inputs.equityRiskPremium <= 0) issues.push('Equity risk premium should be positive.');
  if (inputs.preTaxCostOfDebt < 0) issues.push('Pre-tax cost of debt should not be negative.');
  if (inputs.taxRate < 0 || inputs.taxRate > 1) issues.push('Tax rate must be between 0% and 100%.');
  if (inputs.marketValueOfEquity < 0 || inputs.marketValueOfDebt < 0) {
    issues.push('Market values must not be negative.');
  }
  if (inputs.marketValueOfEquity + inputs.marketValueOfDebt === 0) {
    issues.push('At least one of equity or debt market value must be positive.');
  }
  return issues;
}
