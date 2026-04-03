// src/lib/permission/gateDecision.ts
import { supabase } from '../supabaseClient';
import { logSupabaseOperation } from '../supabaseLogger';

export type GateDecision = 'GO' | 'PIVOT' | 'KILL';

export async function recordGateDecision(missionId: string, stage: number, decision: GateDecision, evidenceSnapshot: any, alignmentScore: number, userId?: string) {
  const finalUserId = userId || (await supabase.auth.getUser()).data.user?.id;
  if (!finalUserId) throw new Error('Not authenticated');

  const start = Date.now();
  const { error } = await supabase
    .from('gate_decisions')
    .insert({
      mission_id: missionId,
      stage,
      decision,
      decided_by: finalUserId,
      evidence_snapshot: evidenceSnapshot,
      alignment_score: alignmentScore,
      created_at: new Date().toISOString(),
    });

  await logSupabaseOperation({
    operation: 'insert',
    table: 'gate_decisions',
    missionId,
    userId: finalUserId,
    success: !error,
    durationMs: Date.now() - start,
    error: error?.message,
  });

  if (error) throw error;
  return true;
}
