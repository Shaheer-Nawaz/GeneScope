/**
 * Mutation Engine
 *
 * Demonstrates three basic types of point mutations on a DNA sequence:
 *  - Substitution: one base is replaced by another
 *  - Insertion:    a base is inserted at a position
 *  - Deletion:     a base is removed at a position
 *
 * This is an EDUCATIONAL demonstration. It is NOT a clinical mutation predictor.
 * A mutation in a sequence does not automatically alter a phenotype — the actual
 * biological consequence depends on many factors not modelled here.
 */

import type { MutationResult, MutationType } from '@/types/genetics';

export const VALID_BASES = ['A', 'T', 'G', 'C'] as const;
export type DNABase = (typeof VALID_BASES)[number];

export function isValidDNASequence(seq: string): boolean {
  return seq.length > 0 && /^[ATGC]+$/i.test(seq);
}

export function applyMutation(
  original: string,
  type: MutationType,
  position: number, // 1-indexed
  base?: string,
): MutationResult | { error: string } {
  const seq = original.toUpperCase();

  if (!isValidDNASequence(seq)) {
    return { error: 'Sequence contains invalid characters. Use only A, T, G, C.' };
  }
  if (position < 1 || position > seq.length + (type === 'insertion' ? 0 : -1) + 1) {
    return {
      error: `Position ${position} is out of range for this sequence (length ${seq.length}).`,
    };
  }

  const idx = position - 1;

  switch (type) {
    case 'substitution': {
      const normalBase = base?.toUpperCase();
      if (!normalBase || !VALID_BASES.includes(normalBase as DNABase)) {
        return { error: 'Please provide a valid replacement base (A, T, G, or C).' };
      }
      if (seq[idx] === normalBase) {
        return { error: 'The replacement base is the same as the original — no change.' };
      }
      const mutated = seq.slice(0, idx) + normalBase + seq.slice(idx + 1);
      return {
        original: seq,
        mutated,
        mutationType: 'substitution',
        position,
        changedBase: `${seq[idx]} → ${normalBase}`,
        consequence: describeSubstitution(seq, idx, normalBase),
        explanation: substitutionExplanation(seq[idx], normalBase, position),
      };
    }
    case 'insertion': {
      const normalBase = base?.toUpperCase();
      if (!normalBase || !VALID_BASES.includes(normalBase as DNABase)) {
        return { error: 'Please provide a valid base to insert (A, T, G, or C).' };
      }
      const mutated = seq.slice(0, idx) + normalBase + seq.slice(idx);
      return {
        original: seq,
        mutated,
        mutationType: 'insertion',
        position,
        changedBase: `+${normalBase}`,
        consequence: 'Frameshift mutation: all codons after this position are shifted. This may alter the amino acid sequence significantly if located in a coding region.',
        explanation: `A ${normalBase} nucleotide was inserted before position ${position}. The reading frame downstream is shifted by one base, which typically disrupts translation from this point onward.`,
      };
    }
    case 'deletion': {
      if (position > seq.length) {
        return { error: `Position ${position} exceeds sequence length ${seq.length}.` };
      }
      const deleted = seq[idx];
      const mutated = seq.slice(0, idx) + seq.slice(idx + 1);
      return {
        original: seq,
        mutated,
        mutationType: 'deletion',
        position,
        changedBase: `-${deleted}`,
        consequence: 'Frameshift mutation: all codons after this position are shifted. This may significantly alter or truncate the encoded protein if in a coding region.',
        explanation: `The nucleotide ${deleted} at position ${position} was deleted. The reading frame is shifted by one base downstream, which typically disrupts the remainder of translation.`,
      };
    }
  }
}

function describeSubstitution(seq: string, idx: number, newBase: string): string {
  const oldBase = seq[idx];
  const codonStart = Math.floor(idx / 3) * 3;
  const codonOld = seq.slice(codonStart, codonStart + 3);
  const mutSeq = seq.slice(0, idx) + newBase + seq.slice(idx + 1);
  const codonNew = mutSeq.slice(codonStart, codonStart + 3);

  if (codonOld.length < 3 || codonNew.length < 3) {
    return 'Point mutation at codon boundary — consequence depends on reading frame.';
  }
  if (codonOld === codonNew) {
    return 'Silent (synonymous) substitution: the codon still encodes the same amino acid due to codon degeneracy. No change in protein sequence is expected.';
  }
  return `Missense substitution: codon ${codonOld} changes to ${codonNew}. This may encode a different amino acid, potentially altering the protein — or the change may be tolerated depending on the protein's function.`;
}

function substitutionExplanation(original: string, replacement: string, position: number): string {
  return `Nucleotide ${original} at position ${position} was substituted with ${replacement}. `
    + `Substitutions are the most common type of point mutation. Whether the resulting protein is affected `
    + `depends on where in the gene the change occurs and whether it alters a codon.`;
}
