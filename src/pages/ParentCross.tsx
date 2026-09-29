import { useEffect, useState } from 'react';
import { GitBranch, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import OrganismTraitSelector from '@/components/OrganismTraitSelector';
import PunnettSquareDisplay from '@/components/PunnettSquareDisplay';
import { GenotypeProbabilityChart, PhenotypeProbabilityChart } from '@/components/ProbabilityChart';
import Disclaimer from '@/components/Disclaimer';
import { fetchRulesForTrait, fetchAllelesForTrait } from '@/services/dataService';
import { performCross, INHERITANCE_MODEL_LABELS } from '@/services/geneticsEngine';
import type {
  Organism,
  Trait,
  GenotypePhenotypeRule,
  CrossResult,
  Allele,
} from '@/types/genetics';

export default function ParentCross() {
  const [selectedOrganism, setSelectedOrganism] = useState<Organism | null>(null);
  const [selectedTrait, setSelectedTrait] = useState<Trait | null>(null);
  const [rules, setRules] = useState<GenotypePhenotypeRule[]>([]);
  const [alleles, setAlleles] = useState<Allele[]>([]);
  const [parent1, setParent1] = useState('');
  const [parent2, setParent2] = useState('');
  const [crossResult, setCrossResult] = useState<CrossResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRules([]);
    setAlleles([]);
    setParent1('');
    setParent2('');
    setCrossResult(null);
    setError(null);
    if (!selectedTrait) return;
    setLoading(true);
    Promise.all([fetchRulesForTrait(selectedTrait.id), fetchAllelesForTrait(selectedTrait.id)])
      .then(([r, a]) => { setRules(r); setAlleles(a); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedTrait]);

  function handleCross() {
    if (!parent1 || !parent2 || !selectedTrait) return;
    setError(null);
    const alleleSymbols = alleles.map((a) => a.symbol);
    const result = performCross(parent1, parent2, rules, alleleSymbols);
    if (!result) {
      setError('Could not parse parental genotypes. Please ensure both parents have valid genotypes for this trait.');
      setCrossResult(null);
    } else {
      setCrossResult(result);
    }
  }

  const genotypes = rules.map((r) => r.genotype);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center border border-sky-500/25 shrink-0 mt-0.5">
          <GitBranch size={18} className="text-sky-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Parent Cross Simulator</h1>
          <p className="text-sm text-slate-400 mt-1">
            Cross two parent genotypes to generate the Punnett square and calculate offspring probabilities.
          </p>
        </div>
      </div>

      <Disclaimer compact />

      {/* Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <OrganismTraitSelector
          selectedOrganism={selectedOrganism}
          selectedTrait={selectedTrait}
          onOrganismChange={(o) => { setSelectedOrganism(o); setSelectedTrait(null); setCrossResult(null); }}
          onTraitChange={(t) => { setSelectedTrait(t); setCrossResult(null); setParent1(''); setParent2(''); }}
        />

        {selectedTrait && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Model:</span>
            <span className="px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/25 text-sky-300 text-xs font-medium">
              {INHERITANCE_MODEL_LABELS[selectedTrait.inheritance_model] ?? selectedTrait.inheritance_model}
            </span>
          </div>
        )}

        {selectedTrait && (
          <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-4 items-end">
            <GenotypeSelect
              label="Parent 1"
              value={parent1}
              genotypes={genotypes}
              loading={loading}
              onChange={setParent1}
            />
            <div className="flex items-center justify-center pb-2.5 text-xl font-bold text-slate-500">×</div>
            <GenotypeSelect
              label="Parent 2"
              value={parent2}
              genotypes={genotypes}
              loading={loading}
              onChange={setParent2}
            />
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-300">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <button
          onClick={handleCross}
          disabled={!parent1 || !parent2 || !selectedTrait}
          className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 disabled:cursor-not-allowed font-semibold py-2.5 rounded-lg text-sm transition-colors"
        >
          Simulate Cross
        </button>
      </div>

      {/* Results */}
      {crossResult && selectedTrait && (
        <div className="space-y-6">
          {/* Punnett Square */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <PunnettSquareDisplay
              punnett={crossResult.punnettSquare}
              genotypeProbabilities={crossResult.genotypeProbabilities}
            />
          </div>

          {/* Probabilities */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Genotype */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Genotype Probabilities</h3>
              <GenotypeProbabilityChart data={crossResult.genotypeProbabilities} />
              <div className="space-y-2">
                {crossResult.genotypeProbabilities.map((gp) => (
                  <div key={gp.genotype} className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-300">{gp.genotype}</span>
                    <div className="flex items-center gap-2">
                      {gp.phenotype?.color_hex && (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: gp.phenotype.color_hex }} />
                      )}
                      <span className="text-slate-400">{Math.round(gp.probability * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phenotype */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Phenotype Probabilities</h3>
              <PhenotypeProbabilityChart data={crossResult.phenotypeProbabilities} />
              <div className="space-y-3">
                {crossResult.phenotypeProbabilities.map((pp) => (
                  <div key={pp.phenotype.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        {pp.phenotype.color_hex && (
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pp.phenotype.color_hex }} />
                        )}
                        <span className="text-slate-300 font-medium">{pp.phenotype.name}</span>
                      </div>
                      <span className="text-teal-400 font-semibold">{Math.round(pp.probability * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${pp.probability * 100}%`, backgroundColor: pp.phenotype.color_hex ?? '#14b8a6' }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Genotypes: {pp.genotypes.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-amber-500/8 border border-amber-500/15 rounded-xl p-4 text-xs text-amber-300/70">
            Cross: <strong className="font-mono">{parent1} × {parent2}</strong> for trait <strong>{selectedTrait.name}</strong>.
            Probabilities are theoretical for an idealized Mendelian cross.
            Actual populations show statistical variation.
          </div>
        </div>
      )}
    </div>
  );
}

function GenotypeSelect({
  label,
  value,
  genotypes,
  loading,
  onChange,
}: {
  label: string;
  value: string;
  genotypes: string[];
  loading: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <select
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 appearance-none focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50"
          disabled={loading || genotypes.length === 0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
  );
}
