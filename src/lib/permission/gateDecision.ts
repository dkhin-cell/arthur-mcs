// src/lib/permission/gateDecision.ts
// CP4 — Level 2 upgrade. Matches Supabase gate_decisions schema exactly.
// Columns: mission_id, stage, decision, decided_by, decided_at,
//          confidence_at_decision, criteria_snapshot, notes
// Multiple rows per stage = audit trail (PIVOT → GO history preserved)

import { supabase } from '../supabaseClient';

export type GateDecisionType = 'go' | 'pivot' | 'kill';

export interface GateDecisionInput {
  missionId: string;
  stage: number;
  decision: GateDecisionType;
  confidence?: number;
  criteria?: any[];
  notes?: string;
}

// ─── RECORD A DECISION ───
export async function recordGateDecision(input: GateDecisionInput): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('gate_decisions')
    .insert({
      mission_id: input.missionId,
      stage: input.stage,
      decision: input.decision,
      decided_by: user.id,
      decided_at: new Date().toISOString(),
      confidence_at_decision: input.confidence || null,
      criteria_snapshot: input.criteria || [],
      notes: input.notes || '',
    });

  if (error) throw error;
  return true;
}

// ─── GET AUDIT TRAIL ───
export async function getAuditTrail(missionId: string, stage: number) {
  const { data, error } = await supabase
    .from('gate_decisions')
    .select('*')
    .eq('mission_id', missionId)
    .eq('stage', stage)
    .order('decided_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// ─── GET LATEST DECISION ───
export async function getLatestDecision(missionId: string, stage: number) {
  const { data, error } = await supabase
    .from('gate_decisions')
    .select('*')
    .eq('mission_id', missionId)
    .eq('stage', stage)
    .order('decided_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}
