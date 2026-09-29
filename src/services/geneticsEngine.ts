/**
 * Genetics Engine
 *
 * Implements the core biological rule processing:
 *  - Genotype validation and normalisation
 *  - Genotype → phenotype prediction (via database rules)
 *  - Punnett square generation
 *  - Genotype and phenotype probability calculation
 *
 * All biological rules come from the database — nothing is hard-coded here.
 */

import type {
  GenotypePhenotypeRule,
  PredictionResult,
  PunnettSquare,
  PunnettCell,
  CrossResult,
  GenotypeProbability,
  PhenotypeProbability,
  Phenotype,
  Trait,
} from '@/types/genetics';

// ── Genotype validation ──────────────────────────────────────────────────────

export function isValidGenotype(genotype: string, validGenotypes: string[]): boolean {
  return validGenotypes.includes(genotype);
}

// ── Genotype → Phenotype prediction ─────────────────────────────────────────

export function predictPhenotype(
  genotype: string,
  rules: GenotypePhenotypeRule[],
  trait: Trait,
): PredictionResult | null {
  const rule = rules.find((r) => r.genotype === genotype);
  if (!rule || !rule.phenotypes) return null;
  return {
    genotype,
    phenotype: rule.phenotypes as Phenotype,
    inheritance_model: rule.inheritance_model,
    explanation: rule.explanation,
    assumptions: rule.assumptions,
    trait,
  };
}

// ── Allele extraction ────────────────────────────────────────────────────────

/**
 * Splits a genotype string into its individual alleles.
 * Handles both single-character alleles (Aa, RR) and multi-character ones (w+w, CRCW).
 * Strategy: the valid allele symbols are known from the rules, so we derive
 * parental alleles by finding which known alleles are present.
 */
export function extractAlleles(genotype: string, allAlleles: string[]): [string, string] | null {
  // Sort alleles longest-first to avoid partial matches
  const sorted = [...allAlleles].sort((a, b) => b.length - a.length);

  for (const a of sorted) {
    if (genotype.startsWith(a)) {
      const remainder = genotype.slice(a.length);
      if (sorted.includes(remainder)) {
        return [a, remainder];
      }
    }
  }
  return null;
}

// ── Punnett square ────────────────────────────────────────────────────────────

export function buildPunnettSquare(
  parent1Genotype: string,
  parent2Genotype: string,
  allAlleles: string[],
): PunnettSquare | null {
  const p1Alleles = extractAlleles(parent1Genotype, allAlleles);
  const p2Alleles = extractAlleles(parent2Genotype, allAlleles);
  if (!p1Alleles || !p2Alleles) return null;

  const cells: PunnettCell[][] = p1Alleles.map((a1) =>
    p2Alleles.map((a2) => ({
      allele1: a1,
      allele2: a2,
      genotype: a1 + a2,
    })),
  );

  return {
    parentAlleles1: p1Alleles,
    parentAlleles2: p2Alleles,
    cells,
  };
}

// ── Genotype probability ──────────────────────────────────────────────────────

export function calcGenotypeProbabilities(
  punnett: PunnettSquare,
  rules: GenotypePhenotypeRule[],
): GenotypeProbability[] {
  const total = 4; // always 2×2 for a monohybrid cross
  const counts: Record<string, number> = {};

  for (const row of punnett.cells) {
    for (const cell of row) {
      const raw = cell.genotype;
      // Normalise order: try both orderings against the rules
      const normalised = normaliseGenotype(raw, rules);
      counts[normalised] = (counts[normalised] ?? 0) + 1;
    }
  }

  return Object.entries(counts).map(([genotype, count]) => {
    const rule = rules.find((r) => r.genotype === genotype);
    return {
      genotype,
      count,
      probability: count / total,
      phenotype: rule?.phenotypes ? (rule.phenotypes as Phenotype) : null,
    };
  });
}

/**
 * Tries both orderings of two alleles and returns the one that matches a rule.
 * Falls back to the original string if neither matches.
 */
function normaliseGenotype(raw: string, rules: GenotypePhenotypeRule[]): string {
  if (rules.find((r) => r.genotype === raw)) return raw;

  // Collect known alleles from rules
  const knownAlleles = new Set<string>();
  for (const r of rules) {
    knownAlleles.add(r.genotype.slice(0, Math.ceil(r.genotype.length / 2)));
    knownAlleles.add(r.genotype.slice(Math.ceil(r.genotype.length / 2)));
  }
  const allSymbols = Array.from(knownAlleles).sort((a, b) => b.length - a.length);

  for (const a of allSymbols) {
    if (raw.startsWith(a)) {
      const b = raw.slice(a.length);
      const flipped = b + a;
      if (rules.find((r) => r.genotype === flipped)) return flipped;
    }
  }
  return raw;
}

// ── Phenotype probability ─────────────────────────────────────────────────────

export function calcPhenotypeProbabilities(
  genotypeProbabilities: GenotypeProbability[],
): PhenotypeProbability[] {
  const map = new Map<string, PhenotypeProbability>();

  for (const gp of genotypeProbabilities) {
    if (!gp.phenotype) continue;
    const key = gp.phenotype.id;
    const existing = map.get(key);
    if (existing) {
      existing.probability += gp.probability;
      existing.genotypes.push(gp.genotype);
    } else {
      map.set(key, {
        phenotype: gp.phenotype,
        probability: gp.probability,
        genotypes: [gp.genotype],
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.probability - a.probability);
}

// ── Full cross ────────────────────────────────────────────────────────────────

export function performCross(
  parent1: string,
  parent2: string,
  rules: GenotypePhenotypeRule[],
  allAlleles: string[],
): CrossResult | null {
  const punnett = buildPunnettSquare(parent1, parent2, allAlleles);
  if (!punnett) return null;

  const genotypeProbabilities = calcGenotypeProbabilities(punnett, rules);
  const phenotypeProbabilities = calcPhenotypeProbabilities(genotypeProbabilities);

  return { punnettSquare: punnett, genotypeProbabilities, phenotypeProbabilities };
}

export const INHERITANCE_MODEL_LABELS: Record<string, string> = {
  complete_dominance: 'Complete Dominance',
  incomplete_dominance: 'Incomplete Dominance',
  codominance: 'Codominance',
  recessive: 'Recessive Inheritance',
};
