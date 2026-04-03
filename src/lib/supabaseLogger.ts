// src/lib/supabaseLogger.ts
import { supabase } from './supabaseClient';

export interface LogEntry {
  operation: 'select' | 'insert' | 'update' | 'delete' | 'rpc';
  table: string;
  missionId?: string;
  userId: string;
  success: boolean;
  durationMs: number;
  error?: string;
}

export async function logSupabaseOperation(entry: LogEntry) {
  const start = Date.now();
  try {
    console.log(`[SUPABASE LOG] ${entry.operation.toUpperCase()} ${entry.table} | mission:${entry.missionId || '—'} | user:${entry.userId} | ${entry.success ? 'OK' : 'FAIL'} (${Date.now() - start}ms)`);
    return true;
  } catch (e) {
    console.error('[SUPABASE LOG ERROR]', e);
    return false;
  }
}
