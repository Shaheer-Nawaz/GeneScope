import { useEffect, useState } from 'react';
import { BarChart3, Play, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
import OrganismTraitSelector from '@/components/OrganismTraitSelector';
import SimulationChart from '@/components/SimulationChart';
import Disclaimer from '@/components/Disclaimer';
import { fetchRulesForTrait, fetchAllelesForTrait } from '@/services/dataService';
import { performCross, INHERITANCE_MODEL_LABELS } from '@/services/geneticsEngine';
import { runMonteCarloSimulation, SIMULATION_SIZES } from '@/services/simulationEngine';
import type {
  Organism,
  Trait,
  GenotypePhenotypeRule,
  Allele,
  SimulationResult,
  PhenotypeProbability,
} from '@/types/genetics';

export default function MonteCarlo() {
  const [selectedOrganism, setSelectedOrganism] = useState<Organism | null>(null);
  const [selectedTrait, setSelectedTrait] = useState<Trait | null>(null);
  const [rules, setRules] = useState<GenotypePhenotypeRule[]>([]);
  const [alleles, setAlleles] = useState<Allele[]>([]);
  const [parent1, setParent1] = useState('');
  const [parent2, setParent2] = useState('');
  const [sampleSize, setSampleSize] = useState<number>(1000);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [theoretical, setTheoretical] = useState<PhenotypeProbability[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRules([]);
    setAlleles([]);
    setParent1('');
    setParent2('');
    setResults([]);
    setError(null);
    if (!selectedTrait) return;
    setLoading(true);
    Promise.all([fetchRulesForTrait(selectedTrait.id), fetchAllelesForTrait(selectedTrait.id)])
      .then(([r, a]) => { setRules(r); setAlleles(a); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedTrait]);

  function handleRun() {
    if (!parent1 || !parent2 || !selectedTrait) return;
    setError(null);
    setRunning(true);
    // Small timeout to let React render the loading state
    setTimeout(() => {
      try {
        const alleleSymbols = alleles.map((a) => a.symbol);
        const crossResult = performCross(parent1, parent2, rules, alleleSymbols);
        if (!crossResult) {
          setError('Could not parse parental genotypes. Please check your selections.');
          return;
        }
        setTheoretical(crossResult.phenotypeProbabilities);
        const simResults = runMonteCarloSimulation(crossResult.phenotypeProbabilities, sampleSize);
        setResults(simResults);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Simulation error');
      } finally {
        setRunning(false);
      }
    }, 50);
  }

  const genotypes = rules.map((r) => r.genotype);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center border border-violet-500/25 shrink-0 mt-0.5">
          <BarChart3 size={18} className="text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Monte Carlo Simulation</h1>
          <p className="text-sm text-slate-400 mt-1">
            Randomly generate thousands of offspring to observe how simulated populations converge
            on theoretical probabilities as sample size increases.
          </p>
        </div>
      </div>

      <Disclaimer compact />

      {/* Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <OrganismTraitSelector
          selectedOrganism={selectedOrganism}
          selectedTrait={selectedTrait}
          onOrganismChange={(o) => { setSelectedOrganism(o); setSelectedTrait(null); setResults([]); }}
          onTraitChange={(t) => { setSelectedTrait(t); setResults([]); setParent1(''); setParent2(''); }}
        />

        {selectedTrait && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Model:</span>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 text-xs font-medium">
                {INHERITANCE_MODEL_LABELS[selectedTrait.inheritance_model] ?? selectedTrait.inheritance_model}
              </span>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <GenotypeSelect label="Parent 1" value={parent1} genotypes={genotypes} loading={loading} onChange={setParent1} />
              <GenotypeSelect label="Parent 2" value={parent2} genotypes={genotypes} loading={loading} onChange={setParent2} />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Sample Size
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 appearance-none focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                    value={sampleSize}
                    onChange={(e) => setSampleSize(Number(e.target.value))}
                  >
                    {SIMULATION_SIZES.map((s) => (
                      <option key={s} value={s}>{s.toLocaleString()} offspring</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-300">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <button
          onClick={handleRun}
          disabled={!parent1 || !parent2 || !selectedTrait || running}
          className="w-full flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-400 disabled:bg-slate-700 disabled:text-slate-500 text-white disabled:cursor-not-allowed font-semibold py-2.5 rounded-lg text-sm transition-colors"
        >
          {running ? (
            <><Loader2 size={15} className="animate-spin" /> Running Simulation…</>
          ) : (
            <><Play size={15} /> Run Monte Carlo Simulation</>
          )}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && selectedTrait && (
        <div className="space-y-6">
          {/* Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Theoretical vs Simulated
              </h3>
              <span className="text-xs text-slate-500">n = {sampleSize.toLocaleString()} offspring</span>
            </div>
            <SimulationChart results={results} />
          </div>

          {/* Data table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Simulation Results</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-5 py-3 text-left text-slate-400 font-semibold uppercase tracking-wider">Phenotype</th>
                    <th className="px-5 py-3 text-right text-slate-400 font-semibold uppercase tracking-wider">Expected %</th>
                    <th className="px-5 py-3 text-right text-slate-400 font-semibold uppercase tracking-wider">Expected Count</th>
                    <th className="px-5 py-3 text-right text-slate-400 font-semibold uppercase tracking-wider">Simulated %</th>
                    <th className="px-5 py-3 text-right text-slate-400 font-semibold uppercase tracking-wider">Simulated Count</th>
                    <th className="px-5 py-3 text-right text-slate-400 font-semibold uppercase tracking-wider">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => {
                    const diff = r.difference * 100;
                    return (
                      <tr key={r.phenotype.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            {r.phenotype.color_hex && (
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.phenotype.color_hex }} />
                            )}
                            <span className="text-slate-200">{r.phenotype.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right text-teal-300 font-medium">
                          {(r.theoretical * 100).toFixed(1)}%
                        </td>
                        <td className="px-5 py-3 text-right text-slate-400">{r.theoreticalCount}</td>
                        <td className="px-5 py-3 text-right text-amber-300 font-medium">
                          {(r.simulated * 100).toFixed(1)}%
                        </td>
                        <td className="px-5 py-3 text-right text-slate-400">{r.simulatedCount}</td>
                        <td className={`px-5 py-3 text-right font-medium ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                          {diff > 0 ? '+' : ''}{diff.toFixed(2)} pp
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">How to Read This</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-teal-300">Expected %</strong> is the mathematically derived Mendelian probability from the Punnett square.
              <strong className="text-amber-300"> Simulated %</strong> is the proportion observed after randomly generating {sampleSize.toLocaleString()} offspring.
              The <strong className="text-slate-300">Difference</strong> shows how far the simulation deviates.
              Try increasing the sample size — as <em>n</em> grows, simulated results converge on the theoretical values (the Law of Large Numbers).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function GenotypeSelect({
  label, value, genotypes, loading, onChange,
}: { label: string; value: string; genotypes: string[]; loading: boolean; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <select
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 appearance-none focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50"
          disabled={loading || genotypes.length === 0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select genotype…</option>
          {genotypes.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading ? <Loader2 size={14} className="animate-spin text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
        </div>
      </div>
    </div>
  );
}
