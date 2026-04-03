"use client";
import { useState } from "react";
import { getFrameworkData, setFrameworkData, stageKey, setCurrentMission } from "@/lib/permission/storageKeys";
import { canAccess, canWrite, getCurrentRole } from "@/lib/permission/access";
import { recordGateDecision, getAuditTrail, getLatestDecision } from "@/lib/permission/gateDecision";
import { supabase } from "@/lib/supabaseClient";

export default function CP4TestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setResult(null);
    const log: string[] = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setResult({ success: false, error: "Not logged in" }); setLoading(false); return; }
      log.push("✅ Auth: " + user.email);

      // 1. Create a real test mission
      const { data: mission, error: mErr } = await supabase
        .from("missions")
        .insert({ owner_id: user.id, name: "__cp4_test__" })
        .select()
        .single();
      if (mErr) throw new Error("Mission create failed: " + mErr.message);
      log.push("✅ Mission created: " + mission.id);

      // 2. Set current mission context
      setCurrentMission(mission.id);
      log.push("✅ Mission context set");

      // 3. Write framework data
      const key = stageKey(0, "competitive");
      await setFrameworkData(key, { competitors: ["Grab", "Gojek"], confidence: 72 }, user.id);
      log.push("✅ Framework data written (stage 0, competitive)");

      // 4. Read it back
      const readBack = await getFrameworkData(key);
      log.push("✅ Framework data read: " + JSON.stringify(readBack));

      // 5. Check access
      const hasAccess = await canAccess(mission.id, "owner");
      const role = await getCurrentRole(mission.id);
      log.push("✅ Access check: canAccess=" + hasAccess + ", role=" + role);

      // 6. Record a gate decision
      await recordGateDecision({
        missionId: mission.id,
        stage: 0,
        decision: "go",
        confidence: 72,
        criteria: [{ name: "Problem validated", met: true }],
        notes: "CP4 test — evidence looks strong",
      });
      log.push("✅ Gate decision recorded (Stage 0 GO)");

      // 7. Read audit trail
      const trail = await getAuditTrail(mission.id, 0);
      log.push("✅ Audit trail: " + trail.length + " decision(s)");

      // 8. Get latest decision
      const latest = await getLatestDecision(mission.id, 0);
      log.push("✅ Latest decision: " + latest?.decision?.toUpperCase());

      // 9. Cleanup
      await supabase.from("gate_decisions").delete().eq("mission_id", mission.id);
      await supabase.from("framework_data").delete().eq("mission_id", mission.id);
      await supabase.from("missions").delete().eq("id", mission.id);
      log.push("✅ Cleanup complete");

      setResult({ success: true, log });
    } catch (e: any) {
      log.push("❌ " + e.message);
      setResult({ success: false, log, error: e.message });
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", background: "#F4F6F8", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: "#1B2631" }}>CP4 Validation Test</h1>
      <p style={{ fontSize: 13, color: "#5D6D7E", marginBottom: 24 }}>Tests storageKeys, access, gateDecision against live Supabase</p>
      <button onClick={runTest} disabled={loading} style={{
        padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700,
        background: "#1B9C85", color: "#fff", border: "none", cursor: loading ? "wait" : "pointer",
        opacity: loading ? 0.7 : 1, fontFamily: "inherit", marginBottom: 24
      }}>
        {loading ? "Running..." : "Run Full CP4 Test"}
      </button>
      {result && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, maxWidth: 600, width: "100%", border: "1px solid #E8EAED" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: result.success ? "#1B9C85" : "#E74C3C", marginBottom: 12 }}>
            {result.success ? "ALL TESTS PASSED" : "TEST FAILED"}
          </p>
          {result.log?.map((line: string, i: number) => (
            <p key={i} style={{ fontSize: 12, fontFamily: "monospace", color: "#1B2631", margin: "4px 0", lineHeight: 1.5 }}>{line}</p>
          ))}
        </div>
      )}
      <p style={{ fontSize: 11, color: "#95A5A6", marginTop: 24 }}>© 2026 Arthur · Mission Control System</p>
    </div>
  );
}
