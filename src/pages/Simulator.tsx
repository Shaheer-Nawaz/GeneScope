import { useEffect, useState } from 'react';
import { FlaskConical, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import OrganismTraitSelector from '@/components/OrganismTraitSelector';
import Disclaimer from '@/components/Disclaimer';
import { fetchRulesForTrait } from '@/services/dataService';
import { predictPhenotype, INHERITANCE_MODEL_LABELS } from '@/services/geneticsEngine';
import type { Organism, Trait, GenotypePhenotypeRule, PredictionResult } from '@/types/genetics';

export default function Simulator() {
  const [selectedOrganism, setSelectedOrganism] = useState<Organism | null>(null);
  const [selectedTrait, setSelectedTrait] = useState<Trait | null>(null);
  const [rules, setRules] = useState<GenotypePhenotypeRule[]>([]);
  const [selectedGenotype, setSelectedGenotype] = useState('');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRules([]);
    setSelectedGenotype('');
    setResult(null);
    if (!selectedTrait) return;
    setLoading(true);
    fetchRulesForTrait(selectedTrait.id)
      .then(setRules)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedTrait]);

  function handlePredict() {
    if (!selectedGenotype || !selectedTrait) return;
    setError(null);
    const prediction = predictPhenotype(selectedGenotype, rules, selectedTrait);
    if (!prediction) {
      setError(`No rule found for genotype "${selectedGenotype}" in this trait. Please check your selection.`);
      setResult(null);
    } else {
      setResult(prediction);
    }
  }

  const genotypes = rules.map((r) => r.genotype);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/25 shrink-0 mt-0.5">
          <FlaskConical size={18} className="text-teal-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Genotype → Phenotype Simulator</h1>
          <p className="text-sm text-slate-400 mt-1">
            Select an organism, trait, and genotype to predict the phenotype using the stored genetic rules.
          </p>
        </div>
      </div>

      <Disclaimer compact />

      {/* Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <OrganismTraitSelector
          selectedOrganism={selectedOrganism}
          selectedTrait={selectedTrait}
          onOrganismChange={(o) => { setSelectedOrganism(o); setSelectedTrait(null); setResult(null); }}
          onTraitChange={(t) => { setSelectedTrait(t); setResult(null); setSelectedGenotype(''); }}
        />

        {/* Trait info */}
        {selectedTrait && (
          <div className="bg-slate-800/50 rounded-lg p-4 space-y-2 border border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inheritance Model</span>
              <span className="px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/25 text-teal-300 text-xs font-medium">
                {INHERITANCE_MODEL_LABELS[selectedTrait.inheritance_model] ?? selectedTrait.inheritance_model}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{selectedTrait.educational_notes}</p>
          </div>
        )}

        {/* Genotype select */}
        {selectedTrait && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Genotype
            </label>
            <div className="relative">
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 appearance-none focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50"
                value={selectedGenotype}
                disabled={loading}
                onChange={(e) => { setSelectedGenotype(e.target.value); setResult(null); }}
              >
                <option value="">Select genotype…</option>
                {genotypes.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {loading ? <Loader2 size={14} className="animate-spin text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-300">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <button
          onClick={handlePredict}
          disabled={!selectedGenotype || !selectedTrait}
          className="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 disabled:cursor-not-allowed font-semibold py-2.5 rounded-lg text-sm transition-colors"
        >
          Predict Phenotype
        </button>
      </div>

      {/* Result card */}
      {result && (
        <div className="bg-slate-900 border border-teal-500/30 rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <h2 className="font-semibold text-teal-300 text-sm uppercase tracking-wider">Prediction Result</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <ResultField label="Genotype" value={result.genotype} mono />
            <ResultField label="Inheritance Model" value={INHERITANCE_MODEL_LABELS[result.inheritance_model] ?? result.inheritance_model} />
            <div className="sm:col-span-2 flex items-center gap-3">
              {result.phenotype.color_hex && (
                <div
                  className="w-6 h-6 rounded-full border-2 border-white/20 shrink-0"
                  style={{ backgroundColor: result.phenotype.color_hex }}
                />
              )}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Predicted Phenotype</p>
                <p className="text-lg font-bold text-slate-100">{result.phenotype.name}</p>
                <p className="text-xs text-slate-400">{result.phenotype.description}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-4">
            <ExplanationBlock title="Genetic Explanation" text={result.explanation} />
            <ExplanationBlock title="Model Assumptions" text={result.assumptions} muted />
            <ExplanationBlock title="Educational Notes" text={result.trait.educational_notes} muted />
          </div>

          <div className="bg-amber-500/8 border border-amber-500/15 rounded-lg p-3 text-xs text-amber-300/70">
            This result was determined by matching genotype <strong>{result.genotype}</strong> against
            the stored rules for <strong>{result.trait.name}</strong> using the{' '}
            <strong>{INHERITANCE_MODEL_LABELS[result.inheritance_model]}</strong> model.
            It is an educational simulation result, not a medical prediction.
          </div>
        </div>
      )}
    </div>
  );
}

function ResultField({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-sm font-medium text-slate-100 ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

function ExplanationBlock({ title, text, muted = false }: { title: string; text: string; muted?: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <p className={`text-sm leading-relaxed ${muted ? 'text-slate-500' : 'text-slate-300'}`}>{text}</p>
    </div>
  );
}
