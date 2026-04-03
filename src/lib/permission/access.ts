// src/lib/permission/access.ts
import { supabase } from '../supabaseClient';
import { logSupabaseOperation } from '../supabaseLogger';

export type Role = 'owner' | 'admin' | 'pm_lead' | 'pm' | 'contributor' | 'viewer';

export async function canAccess(missionId: string, requiredRole: Role = 'viewer', userId?: string): Promise<boolean> {
  const start = Date.now();
  const finalUserId = userId || (await supabase.auth.getUser()).data.user?.id;
  if (!finalUserId) return false;

  const { data, error } = await supabase
    .from('mission_members')
    .select('role')
    .eq('mission_id', missionId)
    .eq('user_id', finalUserId)
    .single();

  await logSupabaseOperation({
    operation: 'select',
    table: 'mission_members',
    missionId,
    userId: finalUserId,
    success: !error,
    durationMs: Date.now() - start,
    error: error?.message,
  });

  if (error || !data) return false;

  const roleHierarchy: Record<Role, number> = { viewer: 1, contributor: 2, pm: 3, pm_lead: 4, admin: 5, owner: 6 };
  return roleHierarchy[data.role as Role] >= roleHierarchy[requiredRole];
}

export async function canWrite(missionId: string, userId?: string): Promise<boolean> {
  return canAccess(missionId, 'contributor', userId);
}
