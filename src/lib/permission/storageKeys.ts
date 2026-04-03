// src/lib/permission/storageKeys.ts
// CP4 — Level 2 upgrade. Matches Supabase schema exactly.
// Column: framework (not framework_name)
// UNIQUE constraint: (mission_id, stage, framework)
// Includes localStorage fallback per Sprint 11 spec.

import { supabase } from '../supabaseClient';

export type FrameworkKey = {
  missionId: string;
  stage: number;
  framework: string;
};

// ─── READ ───
export async function getFrameworkData(key: FrameworkKey): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('framework_data')
      .select('data')
      .eq('mission_id', key.missionId)
      .eq('stage', key.stage)
      .eq('framework', key.framework)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.data || null;
  } catch (e) {
    // Fallback: try localStorage
    const fallbackKey = `dk-stage${key.stage}-${key.framework}`;
    try {
      const raw = localStorage.getItem(fallbackKey);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}

// ─── WRITE ───
export async function setFrameworkData(key: FrameworkKey, data: any, userId?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('framework_data')
      .upsert({
        mission_id: key.missionId,
        stage: key.stage,
        framework: key.framework,
        data,
        updated_by: userId || null,
      }, { onConflict: 'mission_id,stage,framework' });

    if (error) throw error;
    return true;
  } catch (e) {
    // Fallback: write to localStorage + log for future sync
    const fallbackKey = `dk-stage${key.stage}-${key.framework}`;
    try {
      localStorage.setItem(fallbackKey, JSON.stringify(data));
      console.warn(`[storageKeys] Supabase write failed, saved to localStorage: ${fallbackKey}`);
      return true;
    } catch { return false; }
  }
}

// ─── DELETE ───
export async function deleteFrameworkData(key: FrameworkKey): Promise<boolean> {
  const { error } = await supabase
    .from('framework_data')
    .delete()
    .eq('mission_id', key.missionId)
    .eq('stage', key.stage)
    .eq('framework', key.framework);

  if (error) { console.error('[storageKeys] Delete failed:', error.message); return false; }
  return true;
}

// ─── MISSION CONTEXT ───
let _currentMissionId: string = 'default';
export function setCurrentMission(id: string) { _currentMissionId = id; }
export function getCurrentMission(): string { return _currentMissionId; }

// ─── CONVENIENCE: build key from current mission ───
export function stageKey(stageNum: number, framework: string): FrameworkKey {
  return { missionId: _currentMissionId, stage: stageNum, framework };
}
