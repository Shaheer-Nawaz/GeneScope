import { useState } from 'react';
import { Zap, AlertCircle } from 'lucide-react';
import Disclaimer from '@/components/Disclaimer';
import { applyMutation, VALID_BASES } from '@/services/mutationEngine';
import type { MutationType, MutationResult } from '@/types/genetics';

const MUTATION_TYPES: { value: MutationType; label: string; description: string }[] = [
  {
    value: 'substitution',
    label: 'Substitution',
    description: 'Replace one nucleotide with another. The sequence length stays the same.',
  },
  {
    value: 'insertion',
    label: 'Insertion',
    description: 'Insert a new nucleotide at a position. This shifts all downstream bases (frameshift).',
  },
  {
    value: 'deletion',
    label: 'Deletion',
    description: 'Remove a nucleotide at a position. This shifts all downstream bases (frameshift).',
  },
];

const EXAMPLE_SEQUENCES = [
  { label: 'Simple example', value: 'ATGCCTGAA' },
  { label: 'Longer sequence', value: 'ATGGCCTTCGAAGTACTTCGG' },
  { label: 'Codon chain', value: 'ATGATGCGTACTTAG' },
];

export default function MutationLab() {
  const [sequence, setSequence] = useState('ATGCCTGAA');
  const [mutationType, setMutationType] = useState<MutationType>('substitution');
  const [position, setPosition] = useState('3');
  const [base, setBase] = useState('A');
  const [result, setResult] = useState<MutationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleApply() {
    setError(null);
    setResult(null);
    const pos = parseInt(position);
    if (isNaN(pos) || pos < 1) {
      setError('Position must be a positive integer.');
      return;
    }
    const outcome = applyMutation(sequence.toUpperCase(), mutationType, pos, base);
    if ('error' in outcome) {
      setError(outcome.error);
    } else {
      setResult(outcome);
    }
  }

  const needsBase = mutationType === 'substitution' || mutationType === 'insertion';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center border border-amber-500/25 shrink-0 mt-0.5">
          <Zap size={18} className="text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Mutation Lab</h1>
          <p className="text-sm text-slate-400 mt-1">
            Apply point mutations to a DNA sequence and observe how the sequence changes.
            This is an educational demonstration — not a clinical mutation predictor.
          </p>
        </div>
      </div>

      <Disclaimer compact />

      {/* Conceptual chain */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Conceptual Chain
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {['DNA sequence change', 'Possible codon change', 'Possible amino acid change', 'Possible protein change', 'Possible phenotype effect'].map((step, i, arr) => (
            <span key={step} className="flex items-center gap-2">
              <span className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-300">{step}</span>
              {i < arr.length - 1 && <span className="text-slate-600">→</span>}
            </span>
          ))}
        </div>
        <p className="text-xs text-amber-400/70 mt-3">
          Each step is conditional and depends on many biological factors not modelled here.
          A mutation does NOT automatically change a phenotype.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        {/* Sequence input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Original DNA Sequence (use A, T, G, C only)
            </label>
            <div className="flex items-center gap-1.5">
              {EXAMPLE_SEQUENCES.map((ex) => (
                <button
                  key={ex.value}
                  onClick={() => { setSequence(ex.value); setResult(null); }}
                  className="text-xs text-teal-400 hover:text-teal-300 underline underline-offset-2"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 font-mono uppercase focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 placeholder-slate-600"
            placeholder="e.g. ATGCCTGAA"
            value={sequence}
            onChange={(e) => { setSequence(e.target.value.toUpperCase()); setResult(null); }}
          />
          <p className="text-xs text-slate-500">Length: {sequence.length} bases</p>
        </div>

        {/* Mutation type */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Mutation Type
          </label>
          <div className="grid sm:grid-cols-3 gap-3">
            {MUTATION_TYPES.map((mt) => (
              <button
                key={mt.value}
                onClick={() => { setMutationType(mt.value); setResult(null); }}
                className={`rounded-lg border p-3 text-left transition-all ${
                  mutationType === mt.value
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <p className="font-semibold text-sm mb-1">{mt.label}</p>
                <p className="text-xs opacity-75 leading-relaxed">{mt.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Position + base */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Position (1-indexed)
            </label>
            <input
              type="number"
              min="1"
              max={sequence.length}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              value={position}
              onChange={(e) => { setPosition(e.target.value); setResult(null); }}
            />
            <p className="text-xs text-slate-500">
              Current base at position {position || '?'}: {sequence[parseInt(position) - 1] ?? '—'}
            </p>
          </div>

          {needsBase && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {mutationType === 'substitution' ? 'Replacement Base' : 'Base to Insert'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {VALID_BASES.map((b) => (
                  <button
                    key={b}
                    onClick={() => { setBase(b); setResult(null); }}
                    className={`py-2.5 rounded-lg border text-sm font-mono font-bold transition-all ${
                      base === b
                        ? 'bg-amber-500 border-amber-400 text-slate-900'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-amber-500/50 hover:text-slate-200'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-300">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <button
          onClick={handleApply}
          disabled={!sequence}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 disabled:cursor-not-allowed font-semibold py-2.5 rounded-lg text-sm transition-colors"
        >
          Apply Mutation
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="font-semibold text-amber-300 text-sm uppercase tracking-wider">Mutation Result</h2>
          </div>

          {/* Sequence diff */}
          <div className="space-y-3">
            <SequenceDisplay label="Original Sequence" sequence={result.original} highlightPos={result.position - 1} highlightColor="slate" />
            <SequenceDisplay
              label="Mutated Sequence"
              sequence={result.mutated}
              highlightPos={result.position - 1}
              highlightColor={result.mutationType === 'deletion' ? 'red' : 'amber'}
              mutationType={result.mutationType}
            />
          </div>

          {/* Details */}
          <div className="grid sm:grid-cols-2 gap-4 border-t border-slate-800 pt-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Mutation Type</p>
              <p className="text-sm text-slate-100 capitalize">{result.mutationType}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Change at Position {result.position}</p>
              <p className="text-sm font-mono text-amber-300">{result.changedBase}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Computational Consequence</p>
              <p className="text-sm text-slate-300 leading-relaxed">{result.consequence}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Explanation</p>
              <p className="text-sm text-slate-400 leading-relaxed">{result.explanation}</p>
            </div>
          </div>

          <div className="bg-amber-500/8 border border-amber-500/15 rounded-lg p-3 text-xs text-amber-300/70">
            Remember: this shows the raw sequence change only. Whether this mutation affects a phenotype
            depends on where in the genome it occurs, whether it falls in a coding region, and many other
            factors not modelled in this educational simulator.
          </div>
        </div>
      )}
    </div>
  );
}

function SequenceDisplay({
  label,
  sequence,
  highlightPos,
  highlightColor,
  mutationType,
}: {
  label: string;
  sequence: string;
  highlightPos: number;
  highlightColor: 'amber' | 'red' | 'slate';
  mutationType?: MutationType;
}) {
  const colorMap = {
    amber: 'bg-amber-400 text-slate-900',
    red: 'text-red-400 line-through opacity-60',
    slate: 'bg-slate-600 text-slate-100',
  };

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <div className="bg-slate-800 rounded-lg p-3 font-mono text-sm flex flex-wrap gap-0.5">
        {Array.from(sequence).map((base, i) => {
          const isHighlight = mutationType === 'deletion' ? i === highlightPos : i === highlightPos;
          return (
            <span
              key={i}
              className={`inline-flex flex-col items-center ${isHighlight ? colorMap[highlightColor] + ' rounded px-0.5' : 'text-slate-300'}`}
            >
              {base}
            </span>
          );
        })}
      </div>
      <div className="bg-slate-800 rounded-lg px-3 py-1 font-mono text-xs flex flex-wrap gap-0.5">
        {Array.from(sequence).map((_, i) => (
          <span key={i} className={`inline-flex items-center justify-center w-[14px] ${i === highlightPos ? 'text-amber-400 font-bold' : 'text-slate-600'}`}>
            {i + 1}
          </span>
        ))}
      </div>
    </div>
  );
}
