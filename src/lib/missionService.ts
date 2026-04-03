// src/lib/missionService.ts
import { supabase } from './supabaseClient';

export interface Mission {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  current_stage: number;
  ownership_type: 'personal' | 'workspace';
  company_context: any;
  created_at: string;
  updated_at: string;
}

export interface MissionStats {
  frameworksCount: number;
  gateDecisionsCount: number;
  latestGate: { stage: number; decision: string; decided_at: string } | null;
}

export async function createMission(input: {
  name: string;
  description?: string;
  ownershipType?: 'personal' | 'workspace';
}): Promise<Mission> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be authenticated');

  const { data, error } = await supabase
    .from('missions')
    .insert({
      owner_id: user.id,
      name: input.name,
      description: input.description || null,
      ownership_type: input.ownershipType || 'personal',
      current_stage: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMissions(): Promise<Mission[]> {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMission(missionId: string): Promise<Mission | null> {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('id', missionId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function updateMission(
  missionId: string,
  updates: {
    name?: string;
    description?: string;
    current_stage?: number;
    company_context?: any;
  }
): Promise<Mission> {
  // Never allow changing owner_id or ownership_type
  const safeUpdates = { ...updates };
  delete (safeUpdates as any).owner_id;
  delete (safeUpdates as any).ownership_type;

  const { data, error } = await supabase
    .from('missions')
    .update(safeUpdates)
    .eq('id', missionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMission(missionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('missions')
    .delete()
    .eq('id', missionId);

  if (error) {
    console.warn('[MISSION DELETE FAILED]', error);
    return false;
  }
  return true;
}

export async function getMissionStats(missionId: string): Promise<MissionStats> {
  const { count: frameworksCount } = await supabase
    .from('framework_data')
    .select('id', { count: 'exact', head: true })
    .eq('mission_id', missionId);

  const { count: gateDecisionsCount } = await supabase
    .from('gate_decisions')
    .select('id', { count: 'exact', head: true })
    .eq('mission_id', missionId);

  const { data: latestGateData } = await supabase
    .from('gate_decisions')
    .select('stage, decision, decided_at')
    .eq('mission_id', missionId)
    .order('decided_at', { ascending: false })
    .limit(1)
    .single();

  return {
    frameworksCount: frameworksCount || 0,
    gateDecisionsCount: gateDecisionsCount || 0,
    latestGate: latestGateData || null,
  };
}
