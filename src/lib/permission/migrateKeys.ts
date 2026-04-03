// src/lib/permission/migrateKeys.ts
// CP5 — One-time localStorage → Supabase migration
// Runs once on first authenticated login.
// Scans dk-stage* keys, writes to framework_data + gate_decisions.
// Does NOT delete localStorage keys (kept as backup).

import { supabase } from '../supabaseClient';
import { setFrameworkData } from './storageKeys';

export interface MigrationResult {
  migrated: boolean;
  reason?: string;
  frameworksCount: number;
  gateDecisionsCount: number;
  companyContextMigrated: boolean;
  errors: string[];
}

export async function migrateLocalStorageToSupabase(missionId: string): Promise<MigrationResult> {
  const result: MigrationResult = {
    migrated: false,
    frameworksCount: 0,
    gateDecisionsCount: 0,
    companyContextMigrated: false,
    errors: [],
  };

  try {
    // Step 1: Check if migration already ran
    const migrationKey = `arthur-migration-complete-${missionId}`;
    if (localStorage.getItem(migrationKey)) {
      result.reason = 'already_complete';
      return result;
    }

    // Step 2: Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to run migration');
    }
    const userId = user.id;

    // Step 3: Scan localStorage for dk-stage* keys
    const keysToMigrate: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('dk-stage')) keysToMigrate.push(key);
    }

    // Step 4: Process each key
    for (const key of keysToMigrate) {
      try {
        const value = localStorage.getItem(key);
        if (!value) continue;

        const parsed = JSON.parse(value);

        // Parse key: dk-stage{N}-{framework}
        const match = key.match(/^dk-stage(\d+)-(.+)$/);
        if (!match) continue;

        const stage = parseInt(match[1], 10);
        const framework = match[2];

        if (framework === 'gate') {
          // Special handling for gate decisions
          const auditTrail = parsed._auditTrail || [];
          if (auditTrail.length > 0) {
            // Insert each historical entry
            for (const entry of auditTrail) {
              const { error } = await supabase.from('gate_decisions').insert({
                mission_id: missionId,
                stage,
                decision: (entry.decision || 'go').toLowerCase(),
                decided_by: userId, // Always use authenticated user UUID — Level 1 decidedBy is a display name string, not a UUID
                decided_at: entry.decidedAt || new Date().toISOString(),
                confidence_at_decision: entry.evidence?.confidenceAtDecision ?? null,
                criteria_snapshot: entry.evidence?.criteriaSnapshot || [],
                notes: entry.evidence?.notes || '',
              });
              if (error) throw error;
              result.gateDecisionsCount++;
            }
          } else if (parsed.decision) {
            // Single legacy gate (no audit trail)
            const { error } = await supabase.from('gate_decisions').insert({
              mission_id: missionId,
              stage,
              decision: (parsed.decision || 'go').toLowerCase(),
              decided_by: userId, // Always use authenticated user UUID
              decided_at: parsed.decidedAt || new Date().toISOString(),
              confidence_at_decision: parsed.confidenceAtDecision ?? null,
              criteria_snapshot: parsed.criteriaSnapshot || [],
              notes: parsed.notes || '',
            });
            if (error) throw error;
            result.gateDecisionsCount++;
          }
        } else {
          // Regular framework data
          await setFrameworkData(
            { missionId, stage, framework },
            parsed,
            userId
          );
          result.frameworksCount++;
        }
      } catch (err: any) {
        console.warn(`[MIGRATION] Failed to migrate key ${key}:`, err.message);
        result.errors.push(`${key}: ${err.message}`);
      }
    }

    // Step 5: Migrate company context if present
    const companyContext = localStorage.getItem('dk-company-context');
    if (companyContext) {
      try {
        const parsed = JSON.parse(companyContext);
        const { error } = await supabase
          .from('missions')
          .update({ company_context: parsed })
          .eq('id', missionId);
        if (error) throw error;
        result.companyContextMigrated = true;
      } catch (err: any) {
        result.errors.push(`dk-company-context: ${err.message}`);
      }
    }

    // Step 6: Mark migration complete (do NOT delete localStorage keys)
    localStorage.setItem(migrationKey, new Date().toISOString());

    result.migrated = true;
  } catch (err: any) {
    result.errors.push(`Fatal: ${err.message}`);
  }

  return result;
}
