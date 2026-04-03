// src/lib/permission/access.ts
// CP4 — Level 2 upgrade. Matches Supabase schema exactly.
// Roles in mission_members: 'owner' | 'editor' | 'viewer'
// Also checks missions.owner_id as fallback (owner doesn't need a member row)

import { supabase } from '../supabaseClient';

export type MemberRole = 'owner' | 'editor' | 'viewer';

const ROLE_HIERARCHY: Record<MemberRole, number> = {
  viewer: 1,
  editor: 2,
  owner: 3,
};

// ─── CORE ACCESS CHECK ───
export async function canAccess(missionId: string, requiredRole: MemberRole = 'viewer'): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Check if user is mission owner (always has full access)
  const { data: mission } = await supabase
    .from('missions')
    .select('owner_id')
    .eq('id', missionId)
    .single();

  if (mission?.owner_id === user.id) return true;

  // Check mission_members for team access (Level 3)
  const { data: member } = await supabase
    .from('mission_members')
    .select('role')
    .eq('mission_id', missionId)
    .eq('user_id', user.id)
    .single();

  if (!member) return false;
  return ROLE_HIERARCHY[member.role as MemberRole] >= ROLE_HIERARCHY[requiredRole];
}

// ─── CONVENIENCE FUNCTIONS ───
export async function canWrite(missionId: string): Promise<boolean> {
  return canAccess(missionId, 'editor');
}

export async function canDecide(missionId: string): Promise<boolean> {
  return canAccess(missionId, 'owner');
}

export async function canExport(missionId: string): Promise<boolean> {
  return canAccess(missionId, 'viewer');
}

// ─── ROLE HELPERS ───
export async function getCurrentRole(missionId: string): Promise<MemberRole | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: mission } = await supabase
    .from('missions')
    .select('owner_id')
    .eq('id', missionId)
    .single();

  if (mission?.owner_id === user.id) return 'owner';

  const { data: member } = await supabase
    .from('mission_members')
    .select('role')
    .eq('mission_id', missionId)
    .eq('user_id', user.id)
    .single();

  return (member?.role as MemberRole) || null;
}
