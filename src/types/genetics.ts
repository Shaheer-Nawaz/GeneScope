export interface Organism {
  id: string;
  common_name: string;
  scientific_name: string;
  description: string;
}

export interface Gene {
  id: string;
  organism_id: string;
  name: string;
  symbol: string;
  description: string;
}

export interface Trait {
  id: string;
  organism_id: string;
  gene_id: string;
  name: string;
  description: string;
  inheritance_model: InheritanceModel;
  educational_notes: string;
}

export interface Allele {
  id: string;
  gene_id: string;
  symbol: string;
  description: string;
  is_dominant: boolean;
}

export interface Phenotype {
  id: string;
  trait_id: string;
  name: string;
  description: string;
  color_hex: string | null;
}

export interface GenotypePhenotypeRule {
  id: string;
  trait_id: string;
  genotype: string;
  phenotype_id: string;
  inheritance_model: InheritanceModel;
  explanation: string;
  assumptions: string;
  phenotypes?: Phenotype;
}

export type InheritanceModel =
  | 'complete_dominance'
  | 'incomplete_dominance'
  | 'codominance'
  | 'recessive';

export interface PredictionResult {
  genotype: string;
  phenotype: Phenotype;
  inheritance_model: InheritanceModel;
  explanation: string;
  assumptions: string;
  trait: Trait;
}

export interface PunnettCell {
  genotype: string;
  allele1: string;
  allele2: string;
}

export interface PunnettSquare {
  parentAlleles1: string[];
  parentAlleles2: string[];
  cells: PunnettCell[][];
}

export interface GenotypeProbability {
  genotype: string;
  count: number;
  probability: number;
  phenotype: Phenotype | null;
}

export interface PhenotypeProbability {
  phenotype: Phenotype;
  probability: number;
  genotypes: string[];
}

export interface CrossResult {
  punnettSquare: PunnettSquare;
  genotypeProbabilities: GenotypeProbability[];
  phenotypeProbabilities: PhenotypeProbability[];
}

export interface SimulationResult {
  phenotype: Phenotype;
  theoretical: number;
  simulated: number;
  difference: number;
  simulatedCount: number;
  theoreticalCount: number;
}

export interface MutationResult {
  original: string;
  mutated: string;
  mutationType: MutationType;
  position: number;
  changedBase: string;
  consequence: string;
  explanation: string;
}

export type MutationType = 'substitution' | 'insertion' | 'deletion';
