"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Home() {
  const [status, setStatus] = useState("Checking connection...");
  const [tables, setTables] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/auth"); return; }
      setUser(session.user);

      const { data: mission, error: mErr } = await supabase
        .from("missions")
        .insert({ owner_id: session.user.id, name: "__connection_test__" })
        .select()
        .single();

      if (mErr) {
        setStatus("Auth works but cannot create mission: " + mErr.message);
        setLoading(false);
        return;
      }

      const found: string[] = [];
      const tableNames = [
        "profiles", "missions", "mission_members", "framework_data",
        "gate_decisions", "evidence", "situation_room_logs", "document_imports"
      ];
      for (const t of tableNames) {
        const { error } = await supabase.from(t).select("*").limit(0);
        if (!error) found.push(t);
      }
      setTables(found);

      await supabase.from("missions").delete().eq("id", mission.id);

      setStatus(found.length === 8
        ? "All 8 tables accessible — auth + RLS working!"
        : found.length + "/8 tables accessible");
      setLoading(false);
    }
    init();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>Loading...</div>;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", background: "#F4F6F8", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: "#1B2631" }}>Arthur MCS — Level 2</h1>
      <p style={{ fontSize: 13, color: "#5D6D7E", marginBottom: 24 }}>Logged in as <strong>{user?.email}</strong></p>
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, maxWidth: 500, width: "100%", border: "1px solid #E8EAED" }}>
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "#1B2631" }}>{status}</p>
        {tables.length > 0 && (
          <>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#5D6D7E", marginBottom: 8 }}>Tables ({tables.length}/8):</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {tables.map(t => (
                <span key={t} style={{ padding: "4px 10px", background: "#1B9C8510", color: "#1B9C85", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </>
        )}
        <button onClick={handleLogout} style={{ marginTop: 20, width: "100%", padding: "10px", borderRadius: 10, border: "1px solid #E8EAED", background: "transparent", fontSize: 13, color: "#5D6D7E", cursor: "pointer" }}>Log out</button>
      </div>
      <p style={{ fontSize: 11, color: "#95A5A6", marginTop: 24 }}>© 2026 Arthur · Mission Control System</p>
    </div>
  );
}
