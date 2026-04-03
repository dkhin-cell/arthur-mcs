"use client";
import { useState } from "react";
import { migrateLocalStorageToSupabase } from "@/lib/permission/migrateKeys";
import { supabase } from "@/lib/supabaseClient";

export default function CP5TestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setResult(null);
    const log: string[] = [];

    try {
      // 1. Verify auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setResult({ success: false, error: "Not logged in" }); setLoading(false); return; }
      log.push("✅ Auth: " + user.email);

      // 2. Create a real test mission
      const { data: mission, error: mErr } = await supabase
        .from("missions")
        .insert({ owner_id: user.id, name: "__cp5_migration_test__" })
        .select()
        .single();
      if (mErr) throw new Error("Mission create failed: " + mErr.message);
      log.push("✅ Test mission created: " + mission.id);

      // 3. Seed localStorage with fake Level 1 data
      localStorage.setItem("dk-stage0-competitive", JSON.stringify({
        competitors: ["Grab", "Gojek"],
        lastUpdated: "2026-03-15"
      }));
      localStorage.setItem("dk-stage0-gate", JSON.stringify({
        decision: "go",
        human_decision: "go",
        decidedBy: "DK",
        decidedAt: "2026-03-15T00:00:00Z",
        _auditTrail: [{
          decision: "go",
          decidedAt: "2026-03-15T00:00:00Z",
          evidence: {
            confidenceAtDecision: 72,
            criteriaSnapshot: [{ name: "Problem validated", met: true }],
            notes: "Test migration from Level 1"
          }
        }]
      }));
      localStorage.setItem("dk-stage1-northstar", JSON.stringify({
        metric: "Driver utilization rate",
        score: 85
      }));
      localStorage.setItem("dk-company-context", JSON.stringify({
        company: "RideX",
        market: "Jakarta"
      }));
      // Clear any previous migration marker for this test mission
      localStorage.removeItem(`arthur-migration-complete-${mission.id}`);
      log.push("✅ localStorage seeded with 4 test keys");

      // 4. Run migration
      const migrationResult = await migrateLocalStorageToSupabase(mission.id);
      log.push("✅ Migration ran — migrated: " + migrationResult.migrated);
      log.push("   Frameworks: " + migrationResult.frameworksCount);
      log.push("   Gate decisions: " + migrationResult.gateDecisionsCount);
      log.push("   Company context: " + migrationResult.companyContextMigrated);
      if (migrationResult.errors.length > 0) {
        log.push("   ⚠️ Errors: " + migrationResult.errors.join(", "));
      }

      // 5. Verify framework_data in Supabase
      const { data: frameworks } = await supabase
        .from("framework_data")
        .select("stage, framework, data")
        .eq("mission_id", mission.id);
      log.push("✅ Supabase framework_data rows: " + (frameworks?.length || 0));
      if (frameworks) {
        for (const f of frameworks) {
          log.push("   → stage " + f.stage + " / " + f.framework);
        }
      }

      // 6. Verify gate_decisions in Supabase
      const { data: gates } = await supabase
        .from("gate_decisions")
        .select("stage, decision, confidence_at_decision, notes")
        .eq("mission_id", mission.id);
      log.push("✅ Supabase gate_decisions rows: " + (gates?.length || 0));
      if (gates) {
        for (const g of gates) {
          log.push("   → stage " + g.stage + " / " + g.decision.toUpperCase() + " / confidence: " + g.confidence_at_decision);
        }
      }

      // 7. Verify company_context on mission
      const { data: updatedMission } = await supabase
        .from("missions")
        .select("company_context")
        .eq("id", mission.id)
        .single();
      const hasContext = updatedMission?.company_context && Object.keys(updatedMission.company_context).length > 0;
      log.push("✅ Mission company_context populated: " + hasContext);

      // 8. Test re-run — should return already_complete
      const rerunResult = await migrateLocalStorageToSupabase(mission.id);
      log.push("✅ Re-run result: " + (rerunResult.reason === "already_complete" ? "correctly blocked (already_complete)" : "ERROR — should have been blocked"));

      // 9. Validate counts
      const expectedFrameworks = 2; // competitive + northstar
      const expectedGates = 1; // stage 0 GO
      const frameworksOk = (frameworks?.length || 0) === expectedFrameworks;
      const gatesOk = (gates?.length || 0) === expectedGates;
      const contextOk = hasContext === true;
      const rerunOk = rerunResult.reason === "already_complete";

      if (frameworksOk && gatesOk && contextOk && rerunOk) {
        log.push("✅ ALL VALIDATIONS PASSED");
      } else {
        log.push("❌ Some validations failed — check counts above");
      }

      // 10. Cleanup
      await supabase.from("gate_decisions").delete().eq("mission_id", mission.id);
      await supabase.from("framework_data").delete().eq("mission_id", mission.id);
      await supabase.from("missions").delete().eq("id", mission.id);
      localStorage.removeItem("dk-stage0-competitive");
      localStorage.removeItem("dk-stage0-gate");
      localStorage.removeItem("dk-stage1-northstar");
      localStorage.removeItem("dk-company-context");
      localStorage.removeItem(`arthur-migration-complete-${mission.id}`);
      log.push("✅ Cleanup complete (Supabase + localStorage)");

      setResult({ success: frameworksOk && gatesOk && contextOk && rerunOk, log });
    } catch (e: any) {
      log.push("❌ " + e.message);
      setResult({ success: false, log, error: e.message });
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", background: "#F4F6F8", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: "#1B2631" }}>CP5 Migration Test</h1>
      <p style={{ fontSize: 13, color: "#5D6D7E", marginBottom: 24 }}>Seeds localStorage, migrates to Supabase, verifies, tests re-run, cleans up</p>
      <button onClick={runTest} disabled={loading} style={{
        padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700,
        background: "#1B9C85", color: "#fff", border: "none", cursor: loading ? "wait" : "pointer",
        opacity: loading ? 0.7 : 1, fontFamily: "inherit", marginBottom: 24
      }}>
        {loading ? "Running..." : "Run Full CP5 Migration Test"}
      </button>
      {result && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, maxWidth: 640, width: "100%", border: "1px solid #E8EAED" }}>
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
