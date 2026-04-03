// src/app/test/cp4/page.tsx
'use client';
import { useState } from 'react';
import { getFrameworkData, setFrameworkData } from '@/lib/permission/storageKeys';
import { canAccess, canWrite } from '@/lib/permission/access';
import { recordGateDecision } from '@/lib/permission/gateDecision';
import { supabase } from '@/lib/supabaseClient';

export default function CP4TestPage() {
  const [result, setResult] = useState<any>(null);

  const runTest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id || 'unknown';
      const testKey = { missionId: 'test-mission-123', stage: 0, frameworkName: 'problem-validator' };

      await setFrameworkData(testKey, { status: 'validated', confidence: 85 }, uid);
      const data = await getFrameworkData(testKey, uid);

      const accessOk = await canAccess(testKey.missionId, 'owner', uid);
      await recordGateDecision(testKey.missionId, 0, 'GO', { test: true }, 92, uid);

      setResult({ success: true, data, accessOk });
      console.log('✅ CP4 full test passed');
    } catch (e: any) {
      setResult({ success: false, error: e.message });
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">CP4 Validation Test</h1>
      <button 
        onClick={runTest}
        className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl text-lg font-medium"
      >
        Run Full CP4 Test
      </button>
      {result && (
        <pre className="mt-8 p-6 bg-gray-900 text-green-400 rounded-2xl overflow-auto text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
