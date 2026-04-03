// src/lib/supabaseLogger.ts
export interface LogEntry {
  operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert';
  table: string;
  missionId?: string;
  userId: string;
  success: boolean;
  durationMs: number;
  error?: string;
}

export async function logSupabaseOperation(entry: LogEntry) {
  try {
    console.log(`[SUPABASE] ${entry.operation.toUpperCase()} ${entry.table} | mission:${entry.missionId || '—'} | user:${entry.userId} | ${entry.success ? 'OK' : 'FAIL'} (${entry.durationMs}ms)${entry.error ? ' | ' + entry.error : ''}`);
    return true;
  } catch (e) {
    console.error('[SUPABASE LOG ERROR]', e);
    return false;
  }
}
