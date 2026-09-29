import { supabase } from '@/lib/supabase';
import type { Organism, Trait, Allele, GenotypePhenotypeRule, Phenotype } from '@/types/genetics';

export async function fetchOrganisms(): Promise<Organism[]> {
  const { data, error } = await supabase
    .from('organisms')
    .select('*')
    .order('common_name');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchTraitsForOrganism(organismId: string): Promise<Trait[]> {
  const { data, error } = await supabase
    .from('traits')
    .select('*')
    .eq('organism_id', organismId)
    .order('name');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchRulesForTrait(traitId: string): Promise<GenotypePhenotypeRule[]> {
  const { data, error } = await supabase
    .from('genotype_phenotype_rules')
    .select('*, phenotypes(*)')
    .eq('trait_id', traitId);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchPhenotypesForTrait(traitId: string): Promise<Phenotype[]> {
  const { data, error } = await supabase
    .from('phenotypes')
    .select('*')
    .eq('trait_id', traitId);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchAllelesForTrait(traitId: string): Promise<Allele[]> {
  const { data, error } = await supabase
    .from('traits')
    .select('gene_id')
    .eq('id', traitId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return [];

  const { data: alleles, error: aErr } = await supabase
    .from('alleles')
    .select('*')
    .eq('gene_id', data.gene_id);
  if (aErr) throw new Error(aErr.message);
  return alleles ?? [];
}
