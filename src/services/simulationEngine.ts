/**
 * Monte Carlo Simulation Engine
 *
 * Randomly generates offspring genotypes according to theoretical Mendelian
 * probabilities, then tallies phenotype counts. The larger the sample size,
 * the closer the simulated distribution approaches the theoretical one —
 * demonstrating the law of large numbers in a genetics context.
 */

import type { PhenotypeProbability, SimulationResult } from '@/types/genetics';

export const SIMULATION_SIZES = [100, 500, 1000, 5000, 10000] as const;
export type SimulationSize = (typeof SIMULATION_SIZES)[number];

export function runMonteCarloSimulation(
  phenotypeProbabilities: PhenotypeProbability[],
  sampleSize: number,
): SimulationResult[] {
  if (phenotypeProbabilities.length === 0 || sampleSize <= 0) return [];

  // Build cumulative probability thresholds
  const thresholds: Array<{ upper: number; phenotypeId: string }> = [];
  let cumulative = 0;
  for (const pp of phenotypeProbabilities) {
    cumulative += pp.probability;
    thresholds.push({ upper: cumulative, phenotypeId: pp.phenotype.id });
  }

  // Count simulated offspring per phenotype
  const simulatedCounts: Record<string, number> = {};
  for (const pp of phenotypeProbabilities) simulatedCounts[pp.phenotype.id] = 0;

  for (let i = 0; i < sampleSize; i++) {
    const roll = Math.random();
    for (const t of thresholds) {
      if (roll < t.upper) {
        simulatedCounts[t.phenotypeId]++;
        break;
      }
    }
  }

  return phenotypeProbabilities.map((pp) => {
    const simulatedCount = simulatedCounts[pp.phenotype.id] ?? 0;
    const simulated = simulatedCount / sampleSize;
    return {
      phenotype: pp.phenotype,
      theoretical: pp.probability,
      simulated,
      difference: simulated - pp.probability,
      simulatedCount,
      theoreticalCount: Math.round(pp.probability * sampleSize),
    };
  });
}
