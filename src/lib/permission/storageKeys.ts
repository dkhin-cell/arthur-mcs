// src/lib/permission/storageKeys.ts
import { supabase } from '../supabaseClient';
import { logSupabaseOperation } from '../supabaseLogger';

export type FrameworkKey = {
  missionId: string;
  stage: number;
  frameworkName: string;
};

export async function getFrameworkData(key: FrameworkKey, userId?: string) {
  const start = Date.now();
  const { data, error } = await supabase
    .from('framework_data')
    .select('data')
    .eq('mission_id', key.missionId)
    .eq('stage', key.stage)
    .eq('framework_name', key.frameworkName)
    .single();

  await logSupabaseOperation({
    operation: 'select',
    table: 'framework_data',
    missionId: key.missionId,
    userId: userId || 'unknown',
    success: !error,
    durationMs: Date.now() - start,
    error: error?.message,
  });

  if (error && error.code !== 'PGRST116') throw error;
  return data?.data || null;
}

export async function setFrameworkData(key: FrameworkKey, data: any, userId?: string) {
  const start = Date.now();
  const { error } = await supabase
    .from('framework_data')
    .upsert({
      mission_id: key.missionId,
      stage: key.stage,
      framework_name: key.frameworkName,
      data,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'mission_id,stage,framework_name' });

  await logSupabaseOperation({
    operation: 'upsert',
    table: 'framework_data',
    missionId: key.missionId,
    userId: userId || 'unknown',
    success: !error,
    durationMs: Date.now() - start,
    error: error?.message,
  });

  if (error) throw error;
  return true;
}
