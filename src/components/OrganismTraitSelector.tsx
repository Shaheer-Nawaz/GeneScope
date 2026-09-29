import { useEffect, useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { fetchOrganisms, fetchTraitsForOrganism } from '@/services/dataService';
import type { Organism, Trait } from '@/types/genetics';

interface Props {
  selectedOrganism: Organism | null;
  selectedTrait: Trait | null;
  onOrganismChange: (o: Organism | null) => void;
  onTraitChange: (t: Trait | null) => void;
}

export default function OrganismTraitSelector({
  selectedOrganism,
  selectedTrait,
  onOrganismChange,
  onTraitChange,
}: Props) {
  const [organisms, setOrganisms] = useState<Organism[]>([]);
  const [traits, setTraits] = useState<Trait[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [loadingTraits, setLoadingTraits] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganisms()
      .then(setOrganisms)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingOrgs(false));
  }, []);

  useEffect(() => {
    if (!selectedOrganism) {
      setTraits([]);
      return;
    }
    setLoadingTraits(true);
    fetchTraitsForOrganism(selectedOrganism.id)
      .then(setTraits)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingTraits(false));
  }, [selectedOrganism]);

  if (error) {
    return (
      <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">
        Failed to load data: {error}
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {/* Organism */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Organism
        </label>
        <div className="relative">
          <select
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 appearance-none focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50"
            disabled={loadingOrgs}
            value={selectedOrganism?.id ?? ''}
            onChange={(e) => {
              const org = organisms.find((o) => o.id === e.target.value) ?? null;
              onOrganismChange(org);
              onTraitChange(null);
            }}
          >
            <option value="">Select organism…</option>
            {organisms.map((o) => (
              <option key={o.id} value={o.id}>
                {o.common_name} ({o.scientific_name})
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {loadingOrgs ? (
              <Loader2 size={14} className="text-slate-400 animate-spin" />
            ) : (
              <ChevronDown size={14} className="text-slate-400" />
            )}
          </div>
        </div>
      </div>

      {/* Trait */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Trait
        </label>
        <div className="relative">
          <select
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 appearance-none focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50"
            disabled={!selectedOrganism || loadingTraits}
            value={selectedTrait?.id ?? ''}
            onChange={(e) => {
              const trait = traits.find((t) => t.id === e.target.value) ?? null;
              onTraitChange(trait);
            }}
          >
            <option value="">Select trait…</option>
            {traits.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {loadingTraits ? (
              <Loader2 size={14} className="text-slate-400 animate-spin" />
            ) : (
              <ChevronDown size={14} className="text-slate-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
