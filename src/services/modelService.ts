import type { CompanyProfile, PeriodFinancials, Assumptions, ComparableCompany } from '@/types/finance';
import { supabase } from '@/lib/supabase';

export interface SavedModel {
  id: string;
  name: string;
  profile: CompanyProfile;
  periods: PeriodFinancials[];
  assumptions: Assumptions;
  comparables: ComparableCompany[];
  created_at: string;
  updated_at: string;
}

const TABLE = 'models';

export async function listModels(): Promise<SavedModel[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, name, profile, periods, assumptions, comparables, created_at, updated_at')
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as SavedModel[];
}

export async function getModel(id: string): Promise<SavedModel | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, name, profile, periods, assumptions, comparables, created_at, updated_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as SavedModel | null;
}

export async function createModel(input: { name: string; profile: CompanyProfile; periods: PeriodFinancials[]; assumptions: Assumptions; comparables: ComparableCompany[] }): Promise<SavedModel> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      name: input.name,
      profile: input.profile,
      periods: input.periods,
      assumptions: input.assumptions,
      comparables: input.comparables,
    })
    .select('id, name, profile, periods, assumptions, comparables, created_at, updated_at')
    .single();
  if (error) throw new Error(error.message);
  return data as SavedModel;
}

export async function updateModel(id: string, patch: Partial<{ name: string; profile: CompanyProfile; periods: PeriodFinancials[]; assumptions: Assumptions; comparables: ComparableCompany[] }>): Promise<SavedModel> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, name, profile, periods, assumptions, comparables, created_at, updated_at')
    .single();
  if (error) throw new Error(error.message);
  return data as SavedModel;
}

export async function deleteModel(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function logImport(modelId: string, filename: string, format: 'csv' | 'xlsx' | 'manual', rowCount: number, status = 'success'): Promise<void> {
  await supabase.from('imports').insert({ model_id: modelId, filename, format, row_count: rowCount, status });
}

export async function listImports(modelId: string): Promise<{ id: string; filename: string; format: string; row_count: number; status: string; created_at: string }[]> {
  const { data, error } = await supabase
    .from('imports')
    .select('id, filename, format, row_count, status, created_at')
    .eq('model_id', modelId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
