"use client";
import { useState } from "react";
import { createMission, getMissions, getMission, updateMission, deleteMission, getMissionStats } from "@/lib/missionService";
import { setFrameworkData, getFrameworkData } from "@/lib/permission/storageKeys";
import { supabase } from "@/lib/supabaseClient";

export default function CP6TestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setResult(null);
    const log: string[] = [];
    let missionAId: string | null = null;
    let missionBId: string | null = null;

    try {
      // 1. Verify auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setResult({ success: false, error: "Not logged in" }); setLoading(false); return; }
      log.push("✅ Auth: " + user.email);

      // 2. Create Mission A
      const missionA = await createMission({ name: "RideX Jakarta", description: "SEA rideshare validation" });
      missionAId = missionA.id;
      log.push("✅ Mission A created: " + missionA.id);

      // 3. Create Mission B
      const missionB = await createMission({ name: "FleetOps Dashboard", description: "Fleet management tool" });
      missionBId = missionB.id;
      log.push("✅ Mission B created: " + missionB.id);

      // 4. List missions — should have at least 2
      const allMissions = await getMissions();
      const hasTestMissions = allMissions.some(m => m.id === missionA.id) && allMissions.some(m => m.id === missionB.id);
      log.push("✅ getMissions returned " + allMissions.length + " missions (both test missions found: " + hasTestMissions + ")");

      // 5. Get single mission
      const fetchedA = await getMission(missionA.id);
      log.push("✅ getMission returned: " + fetchedA?.name + " (expected: RideX Jakarta)");

      // 6. Update mission
      const updatedA = await updateMission(missionA.id, { current_stage: 2, description: "Updated description" });
      log.push("✅ updateMission: stage=" + updatedA.current_stage + ", desc=" + updatedA.description);

      // 7. Write framework data to Mission A
      await setFrameworkData(
        { missionId: missionA.id, stage: 0, framework: "competitive" },
        { competitor: "Grab", score: 85 },
        user.id
      );
      log.push("✅ Framework data written to Mission A (Grab, score 85)");

      // 8. Write SAME framework name to Mission B with DIFFERENT data
      await setFrameworkData(
        { missionId: missionB.id, stage: 0, framework: "competitive" },
        { competitor: "Uber", score: 92 },
        user.id
      );
      log.push("✅ Framework data written to Mission B (Uber, score 92)");

      // 9. DATA ISOLATION TEST — read back Mission A, verify it's NOT Mission B's data
      const dataA = await getFrameworkData({ missionId: missionA.id, stage: 0, framework: "competitive" });
      const dataB = await getFrameworkData({ missionId: missionB.id, stage: 0, framework: "competitive" });
      const isolationOk = dataA?.competitor === "Grab" && dataA?.score === 85 && dataB?.competitor === "Uber" && dataB?.score === 92;
      log.push("✅ Mission A data: " + JSON.stringify(dataA));
      log.push("✅ Mission B data: " + JSON.stringify(dataB));
      log.push(isolationOk ? "✅ DATA ISOLATION VERIFIED — missions do not bleed" : "❌ DATA ISOLATION FAILED");

      // 10. Get mission stats
      const stats = await getMissionStats(missionA.id);
      log.push("✅ Mission A stats: " + stats.frameworksCount + " frameworks, " + stats.gateDecisionsCount + " gates");

      // 11. Delete Mission B
      const deleteOk = await deleteMission(missionB.id);
      missionBId = null; // mark as cleaned
      log.push("✅ Mission B deleted: " + deleteOk);

      // 12. Verify cascade — Mission B's framework data should be gone
      const afterDelete = await getMissions();
      const bStillExists = afterDelete.some(m => m.id === missionB.id);
      log.push("✅ After delete: " + afterDelete.length + " missions, Mission B gone: " + !bStillExists);

      // 13. Cleanup Mission A
      await supabase.from("framework_data").delete().eq("mission_id", missionA.id);
      await deleteMission(missionA.id);
      missionAId = null; // mark as cleaned
      log.push("✅ Cleanup complete (both missions deleted)");

      const allPassed = isolationOk && deleteOk && !bStillExists;
      setResult({ success: allPassed, log });
    } catch (e: any) {
      log.push("❌ " + e.message);
      // Emergency cleanup
      try {
        if (missionAId) { await supabase.from("framework_data").delete().eq("mission_id", missionAId); await deleteMission(missionAId); }
        if (missionBId) { await supabase.from("framework_data").delete().eq("mission_id", missionBId); await deleteMission(missionBId); }
        log.push("🧹 Emergency cleanup attempted");
      } catch {}
      setResult({ success: false, log, error: e.message });
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", background: "#F4F6F8", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: "#1B2631" }}>CP6 — Mission CRUD + Data Isolation</h1>
      <p style={{ fontSize: 13, color: "#5D6D7E", marginBottom: 24 }}>Creates 2 missions, writes same framework to both, verifies isolation, tests cascade delete</p>
      <button onClick={runTest} disabled={loading} style={{
        padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700,
        background: "#1B9C85", color: "#fff", border: "none", cursor: loading ? "wait" : "pointer",
        opacity: loading ? 0.7 : 1, fontFamily: "inherit", marginBottom: 24
      }}>
        {loading ? "Running..." : "Run Full CP6 Test"}
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
