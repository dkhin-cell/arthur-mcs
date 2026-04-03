"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { THEMES, getTheme, STAGES_NAV } from "@/lib/theme";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const router = useRouter();

  useEffect(() => {
    setTheme(getTheme());
    
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/auth"); return; }
      setUser(session.user);
      setLoading(false);
    }
    init();
  }, [router]);

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>Loading...</div>;

  const t = THEMES[theme];

  return (
    <div style={{ minHeight: "100vh", background: t.bg, padding: "40px 24px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: t.text, marginBottom: 8 }}>
          Arthur PM MCS — Cockpit
        </h1>
        <p style={{ fontSize: 14, color: t.textMuted, marginBottom: 32 }}>
          Logged in as <strong>{user?.email}</strong>
        </p>
        
        <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, padding: 32, marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: t.text, marginBottom: 16 }}>
            CP7 Phase 1B In Progress
          </h2>
          <p style={{ fontSize: 14, color: t.text, marginBottom: 16, lineHeight: 1.6 }}>
            Full Cockpit component is being ported from Level 1. For now, you can:
          </p>
          <ul style={{ fontSize: 14, color: t.textMuted, lineHeight: 1.8, marginBottom: 16 }}>
            <li>Test cross-cutting modules: <a href="/situation-room" style={{ color: t.accent }}>Situation Room</a> | <a href="/intelligence" style={{ color: t.accent }}>Intelligence</a></li>
            <li>View route map: <a href="/test/cp7" style={{ color: t.accent }}>All 95 Routes</a></li>
            <li>Check test pages: <a href="/test/cp4" style={{ color: t.accent }}>CP4</a> | <a href="/test/cp5" style={{ color: t.accent }}>CP5</a> | <a href="/test/cp6" style={{ color: t.accent }}>CP6</a></li>
          </ul>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
          {STAGES_NAV.map(stage => (
            <div 
              key={stage.id}
              onClick={() => router.push(`/stage/${stage.id}`)}
              style={{
                background: `${stage.color}12`,
                border: `2px solid ${stage.color}40`,
                borderRadius: 14,
                padding: 20,
                cursor: "pointer",
                transition: "transform 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{stage.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 4 }}>{stage.title}</h3>
              <p style={{ fontSize: 12, color: t.textMuted, margin: 0 }}>Stage {stage.id} · {stage.total} artifacts</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
