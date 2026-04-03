"use client";

import { useRouter } from "next/navigation";
import { THEMES, getTheme } from "@/lib/theme";
import { useState, useEffect } from "react";

export default function SituationRoomPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    setTheme(getTheme());
  }, []);
  
  const t = THEMES[theme];

  return (
    <div style={{ minHeight: "100vh", background: t.bg, padding: "40px 24px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: t.text, marginBottom: 8 }}>
          🎖️ Situation Room
        </h1>
        <p style={{ fontSize: 14, color: t.textMuted, marginBottom: 32 }}>
          Situation → Questions → Path Forward
        </p>
        <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, padding: 32 }}>
          <p style={{ fontSize: 14, color: t.text }}>
            Situation Room component porting in progress (CP7 Phase 1B).
          </p>
          <button 
            onClick={() => router.push('/')}
            style={{ marginTop: 20, padding: "10px 20px", background: t.accent, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}
          >
            Back to Cockpit
          </button>
        </div>
      </div>
    </div>
  );
}
