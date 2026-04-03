"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { THEMES, getTheme, setThemeStorage, STAGES_NAV, USER } from "@/lib/theme";
import ArthurLogo from "./ArthurLogo";

function getTelemetryQuick() {
  if (typeof window === 'undefined') return { confidence: { score: 0.72 }, timer: { days: 12 }, radar: { high: 3 } };
  try {
    const vt = JSON.parse(localStorage.getItem("dk-ridex-vt-confidence") || "{}");
    const timer = JSON.parse(localStorage.getItem("dk-ridex-vt-timer") || "{}");
    const radar = JSON.parse(localStorage.getItem("dk-ridex-radar-signals") || "{}");
    const highAlerts = (radar.signals || []).filter((s: any) => s.severity === "high").length;
    return { confidence: { score: vt.score || 0.72 }, timer: { days: timer.dayCount || 12 }, radar: { high: highAlerts || 3 } };
  } catch (e) { return { confidence: { score: 0.72 }, timer: { days: 12 }, radar: { high: 3 } }; }
}

export default function AppSidebar({ theme, setTheme }: { theme: 'light' | 'dark', setTheme: (theme: 'light' | 'dark') => void }) {
  const router = useRouter();
  const t = THEMES[theme];
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    // Initialize mobile state
    setMobile(window.innerWidth < 768);
    setOpen(window.innerWidth >= 768);
    
    const handleResize = () => { 
      setMobile(window.innerWidth < 768); 
      if (window.innerWidth >= 768 && !open) setOpen(true); 
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open]);

  const close = () => { setOpen(false); };
  const vtStats = getTelemetryQuick();
  const sidebarWpx = mobile ? "85vw" : "288px";

  const nav = (path: string) => { 
    router.push(path); 
    if (mobile) close(); 
  };

  const sidebarContent = (
    <div style={{ width: sidebarWpx, maxWidth: 340, height: "100%", background: t.sidebar || t.card, borderRight: `1px solid ${t.cardBorder}`, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <div style={{ padding: "18px 18px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${t.cardBorder}` }}>
        <div onClick={() => nav("/")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <ArthurLogo size={24} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: t.text, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.1 }}>Arthur PM MCS</div>
            <div style={{ fontSize: 9, color: t.textDim, fontFamily: "'DM Sans',sans-serif", marginTop: 2, opacity: 0.7 }}>A System for Product Managers</div>
          </div>
        </div>
        {mobile && <button onClick={close} style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer", fontSize: 20, padding: 4, minWidth: 36, minHeight: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>}
        {!mobile && <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer", fontSize: 16, padding: 4, minWidth: 36, minHeight: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>◀</button>}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
        {/* Cross-cutting modules */}
        <div style={{ padding: "0 14px 10px" }}>
          <button onClick={() => nav("/intelligence")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 10, cursor: "pointer", marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>📡</span>
            <div style={{ flex: 1, textAlign: "left" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: t.text, display: "block" }}>Intelligence Radar</span>
              <span style={{ fontSize: 9, color: t.textDim, fontFamily: "'DM Mono',monospace" }}>Competitors → Signals → Alerts</span>
            </div>
            {vtStats.radar.high > 0 && <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#E74C3C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", fontFamily: "'DM Mono',monospace" }}>{vtStats.radar.high}</div>}
          </button>

          <button onClick={() => nav("/situation-room")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 10, cursor: "pointer", marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>🎖️</span>
            <div style={{ flex: 1, textAlign: "left" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: t.text, display: "block" }}>Situation Room</span>
              <span style={{ fontSize: 9, color: t.textDim, fontFamily: "'DM Mono',monospace" }}>Situation → Questions → Path</span>
            </div>
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <div style={{ gridColumn: "1 / -1", padding: "4px 10px", marginBottom: 2 }}>
              <span style={{ fontSize: 9, color: t.textDim, fontFamily: "'DM Mono',monospace" }}>⚡ Telemetry · Data → Confidence → Readiness → Decision</span>
            </div>
            <div style={{ padding: "8px 10px", background: t.input, borderRadius: 8, border: `1px solid ${t.cardBorder}` }}>
              <p style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: t.textDim, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>⚡ Evidence</p>
              <span style={{ fontSize: 18, fontWeight: 800, color: vtStats.confidence.score >= 0.7 ? "#1B9C85" : vtStats.confidence.score >= 0.5 ? "#E67E22" : "#E74C3C", fontFamily: "'DM Mono',monospace" }}>{(vtStats.confidence.score * 100).toFixed(0)}%</span>
            </div>
            <div style={{ padding: "8px 10px", background: t.input, borderRadius: 8, border: `1px solid ${t.cardBorder}` }}>
              <p style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: t.textDim, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>⚡ Day</p>
              <span style={{ fontSize: 18, fontWeight: 800, color: vtStats.timer.days >= 21 ? "#E74C3C" : vtStats.timer.days >= 14 ? "#E67E22" : "#1B9C85", fontFamily: "'DM Mono',monospace" }}>{vtStats.timer.days}</span>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: t.cardBorder, margin: "4px 18px 8px" }} />

        <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: t.textDim, padding: "4px 18px", margin: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>Stages</p>
        {STAGES_NAV.map(stage => {
          const isActive = stage.status === "active";
          const isComing = stage.status === "coming";
          const statusLabel = isActive ? `${stage.progress}/${stage.total}` : isComing ? "Soon" : `0/${stage.total}`;
          return (
            <button key={stage.id} onClick={() => {
              if (isComing) return;
              nav(`/stage/${stage.id}`);
            }} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "11px 18px",
              background: isActive ? `${stage.color}12` : "transparent", border: "none",
              borderLeft: isActive ? `3px solid ${stage.color}` : "3px solid transparent",
              cursor: isComing ? "default" : "pointer", opacity: isComing ? 0.35 : 1,
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: isActive ? `${stage.color}18` : t.input, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18, border: isActive ? `1px solid ${stage.color}40` : `1px solid ${t.cardBorder}` }}>{stage.icon}</div>
              <span style={{ fontSize: 15, fontWeight: 600, color: isActive ? t.text : t.textMuted, fontFamily: "'DM Sans',sans-serif", textAlign: "left", flex: 1 }}>{stage.title}</span>
              <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: isActive ? stage.color : t.textDim, flexShrink: 0 }}>{statusLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom */}
      <div style={{ borderTop: `1px solid ${t.cardBorder}`, padding: "8px 14px" }}>
        <button onClick={() => { const next = theme === "dark" ? "light" : "dark"; setTheme(next); setThemeStorage(next); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 4px", background: "transparent", border: "none", cursor: "pointer" }}>
          <span style={{ fontSize: 16 }}>{theme === "dark" ? "🌙" : "☀️"}</span>
          <span style={{ fontSize: 13, color: t.textMuted, flex: 1, textAlign: "left" }}>{theme === "dark" ? "Dark" : "Light"} Mode</span>
          <div style={{ width: 36, height: 20, borderRadius: 10, background: theme === "dark" ? (t.accent || "#1B9C85") : "#D5D8DC", padding: 2, display: "flex", alignItems: "center" }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", transform: theme === "dark" ? "translateX(16px)" : "translateX(0)", transition: "transform 0.3s" }} />
          </div>
        </button>
        <button onClick={() => nav("/")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 4px", background: "transparent", border: "none", cursor: "pointer" }}>
          <span style={{ fontSize: 16 }}>🏠</span><span style={{ fontSize: 13, color: t.textMuted }}>Mission Control</span>
        </button>
      </div>
    </div>
  );

  // Mobile: overlay drawer
  if (mobile) {
    return (
      <>
        {!open && (
          <button onClick={() => setOpen(true)} style={{ position: "fixed", top: 10, left: 10, zIndex: 997, background: t.card || "#fff", border: `1px solid ${t.cardBorder}`, borderRadius: 8, cursor: "pointer", padding: "8px 10px", display: "flex", flexDirection: "column", gap: 3, minWidth: 42, minHeight: 42, alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <div style={{ width: 18, height: 2, background: t.textMuted, borderRadius: 1 }} />
            <div style={{ width: 18, height: 2, background: t.textMuted, borderRadius: 1 }} />
            <div style={{ width: 18, height: 2, background: t.textMuted, borderRadius: 1 }} />
          </button>
        )}
        {open && <div onClick={close} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 998 }} />}
        <div style={{ position: "fixed", top: 0, left: open ? 0 : "-90vw", bottom: 0, width: "85vw", maxWidth: 340, zIndex: 999, transition: "left 0.3s ease", boxShadow: open ? "4px 0 24px rgba(0,0,0,0.2)" : "none" }}>
          {sidebarContent}
        </div>
      </>
    );
  }

  // Desktop collapsed
  if (!open) {
    return (
      <div style={{ width: 64, height: "100vh", background: t.sidebar || t.card, borderRight: `1px solid ${t.cardBorder}`, display: "flex", flexDirection: "column", alignItems: "center", position: "sticky", top: 0, overflow: "auto", flexShrink: 0, padding: "10px 0" }}>
        <button onClick={() => setOpen(true)} style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer", fontSize: 20, marginBottom: 8, padding: 8, minWidth: 40, minHeight: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>☰</button>
        <div onClick={() => nav("/intelligence")} style={{ cursor: "pointer", padding: "3px 0" }}><div style={{ width: 36, height: 36, borderRadius: 10, background: t.input, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${t.cardBorder}` }}><span style={{ fontSize: 16 }}>📡</span></div></div>
        <div onClick={() => nav("/situation-room")} style={{ cursor: "pointer", padding: "3px 0" }}><div style={{ width: 36, height: 36, borderRadius: 10, background: t.input, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${t.cardBorder}` }}><span style={{ fontSize: 16 }}>🎖️</span></div></div>
        <div style={{ height: 1, width: 24, background: t.cardBorder, margin: "6px 0" }} />
        {STAGES_NAV.map((stage, i) => (
          <div key={stage.id}>
            <div onClick={() => { if (stage.status !== "coming") nav(`/stage/${stage.id}`); }} style={{ cursor: stage.status === "coming" ? "default" : "pointer", opacity: stage.status === "coming" ? 0.3 : 1, padding: "3px 0" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: stage.status === "active" ? `${stage.color}18` : t.input, display: "flex", alignItems: "center", justifyContent: "center", border: stage.status === "active" ? `1px solid ${stage.color}40` : `1px solid ${t.cardBorder}` }}><span style={{ fontSize: 18 }}>{stage.icon}</span></div>
            </div>
            {i < STAGES_NAV.length - 1 && <div style={{ display: "flex", justifyContent: "center", padding: "2px 0" }}><div style={{ width: 2, height: 8, background: t.cardBorder }} /></div>}
          </div>
        ))}
      </div>
    );
  }

  // Desktop open
  return <div style={{ position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>{sidebarContent}</div>;
}
