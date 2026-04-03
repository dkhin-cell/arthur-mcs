"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [status, setStatus] = useState("Checking Supabase connection...");
  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    async function testConnection() {
      try {
        const { error } = await supabase.from("missions").select("id").limit(1);
        if (error) {
          setStatus("✅ Connected to Supabase! (RLS correctly blocking unauthenticated reads)");
        } else {
          setStatus("✅ Connected to Supabase!");
        }
        const tableNames = [
          "profiles", "missions", "mission_members", "framework_data",
          "gate_decisions", "evidence", "situation_room_logs", "document_imports"
        ];
        const found: string[] = [];
        for (const t of tableNames) {
          const { error: e } = await supabase.from(t).select("*").limit(0);
          if (!e || e.code === "PGRST301") found.push(t);
        }
        setTables(found);
      } catch (err) {
        setStatus("❌ Connection failed: " + String(err));
      }
    }
    testConnection();
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", background: "#F4F6F8", padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Arthur MCS — Level 2</h1>
      <p style={{ fontSize: 16, marginBottom: 24, color: "#5D6D7E" }}>Supabase Connection Test</p>
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, maxWidth: 500, width: "100%", border: "1px solid #E8EAED" }}>
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{status}</p>
        {tables.length > 0 && (
          <>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#5D6D7E", marginBottom: 8 }}>Tables found ({tables.length}/8):</p>
            {tables.map(t => (
              <span key={t} style={{ display: "inline-block", padding: "4px 10px", margin: "2px 4px", background: "#1B9C8510", color: "#1B9C85", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{t}</span>
            ))}
          </>
        )}
      </div>
      <p style={{ fontSize: 11, color: "#95A5A6", marginTop: 24 }}>© 2026 Arthur · Mission Control System</p>
    </div>
  );
}
