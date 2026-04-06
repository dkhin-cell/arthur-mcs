// CustomerJourneyMap.tsx — Ported from Level 1 CustomerJourneyMap.jsx
'use client';
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage3-journey";
const EMPTY_PHASE = { name: "", touchpoints: "", userAction: "", emotion: "neutral", painPoints: "", opportunities: "" };
const EMOTIONS = [
  { key: "delighted", label: "😊 Delighted", color: "#1B9C85" },
  { key: "satisfied", label: "🙂 Satisfied", color: "#2ECC71" },
  { key: "neutral", label: "😐 Neutral", color: "#F1C40F" },
  { key: "frustrated", label: "😤 Frustrated", color: "#E67E22" },
  { key: "angry", label: "😡 Angry", color: "#E74C3C" },
];

function useAutoSave(s) { const t = useRef(null); useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [s]); }
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

function loadPreFill() {
  try { const s0 = JSON.parse(localStorage.getItem("dk-stage0-session") || "{}"); return { jtbd: s0.jtbd || "", target: s0.target_segment || "" }; } catch (e) { return {}; }
}

export default function CustomerJourneyMap() {
  const [theme] = useState(getTheme); const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  const pre = loadPreFill();
  const [state, setState] = useState(() => loadSaved() || { persona: pre.target || "", scenario: pre.jtbd || "", phases: [{ ...EMPTY_PHASE }, { ...EMPTY_PHASE }, { ...EMPTY_PHASE }] });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const updatePhase = (i, k, v) => setState(prev => { const p = [...prev.phases]; p[i] = { ...p[i], [k]: v }; return { ...prev, phases: p }; });
  const addPhase = () => setState(prev => ({ ...prev, phases: [...prev.phases, { ...EMPTY_PHASE }] }));
  const removePhase = (i) => setState(prev => ({ ...prev, phases: prev.phases.filter((_, j) => j !== i) }));
  const fieldStyle = { width: "100%", padding: "8px 10px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.text, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif", resize: "vertical" };
  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 3, framework: "journey_map", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 28, borderBottom: "3px solid #2ECC71", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#2ECC71", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 3 · Design & MVP</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Customer Journey Map</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>Map the end-to-end user experience for your selected opportunity.</p>
      </div>

      {/* Context */}
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 18 }}>
        <div>
          <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#2ECC71", margin: "0 0 4px", fontWeight: 600 }}>PERSONA / TARGET USER</p>
          <input value={state.persona} onChange={e => setState(prev => ({ ...prev, persona: e.target.value }))} placeholder="Who is going through this journey?" style={fieldStyle} />
        </div>
        <div>
          <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#2ECC71", margin: "0 0 4px", fontWeight: 600 }}>SCENARIO / JTBD</p>
          <input value={state.scenario} onChange={e => setState(prev => ({ ...prev, scenario: e.target.value }))} placeholder="What are they trying to accomplish?" style={fieldStyle} />
        </div>
      </div>

      {/* Emotion legend */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {EMOTIONS.map(em => (
          <span key={em.key} style={{ padding: "3px 10px", borderRadius: 6, fontSize: 10, background: `${em.color}10`, border: `1px solid ${em.color}25`, color: em.color, fontWeight: 600 }}>{em.label}</span>
        ))}
      </div>

      {/* Journey phases */}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 12, WebkitOverflowScrolling: "touch" }}>
        {state.phases.map((phase, i) => {
          const em = EMOTIONS.find(e => e.key === phase.emotion) || EMOTIONS[2];
          return (
            <div key={i} style={{ minWidth: mobile ? 260 : 220, flex: "0 0 auto", background: t.card, border: `1px solid ${em.color}30`, borderRadius: 14, overflow: "hidden", borderTop: `4px solid ${em.color}` }}>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#2ECC71", fontFamily: "'DM Mono',monospace" }}>P{i + 1}</span>
                  <input value={phase.name} onChange={e => updatePhase(i, "name", e.target.value)} placeholder="Phase name..." style={{ ...fieldStyle, fontWeight: 700, fontSize: 14, border: "none", background: "transparent", padding: "2px 0", flex: 1 }} />
                  {state.phases.length > 1 && <button onClick={() => removePhase(i)} style={{ background: "none", border: "none", color: "#E74C3C50", cursor: "pointer", fontSize: 14 }}>×</button>}
                </div>

                <p style={{ fontSize: 10, color: t.textDim, margin: "0 0 3px", fontFamily: "'DM Mono',monospace" }}>TOUCHPOINTS</p>
                <textarea value={phase.touchpoints} onChange={e => updatePhase(i, "touchpoints", e.target.value)} rows={2} placeholder="How does the user interact? App, website, in-person..." style={{ ...fieldStyle, marginBottom: 6 }} />

                <p style={{ fontSize: 10, color: t.textDim, margin: "0 0 3px", fontFamily: "'DM Mono',monospace" }}>USER ACTION</p>
                <textarea value={phase.userAction} onChange={e => updatePhase(i, "userAction", e.target.value)} rows={2} placeholder="What does the user do in this phase?" style={{ ...fieldStyle, marginBottom: 6 }} />

                <p style={{ fontSize: 10, color: t.textDim, margin: "0 0 3px", fontFamily: "'DM Mono',monospace" }}>EMOTION</p>
                <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
                  {EMOTIONS.map(e => (
                    <button key={e.key} onClick={() => updatePhase(i, "emotion", e.key)} style={{ flex: 1, padding: "5px 0", borderRadius: 5, fontSize: 14, cursor: "pointer", border: `1px solid ${e.color}30`, background: phase.emotion === e.key ? `${e.color}20` : "transparent" }} title={e.label}>{e.label.split(" ")[0]}</button>
                  ))}
                </div>

                <p style={{ fontSize: 10, color: "#E74C3C", margin: "0 0 3px", fontFamily: "'DM Mono',monospace" }}>PAIN POINTS</p>
                <textarea value={phase.painPoints} onChange={e => updatePhase(i, "painPoints", e.target.value)} rows={2} placeholder="What frustrates the user here?" style={{ ...fieldStyle, marginBottom: 6 }} />

                <p style={{ fontSize: 10, color: "#1B9C85", margin: "0 0 3px", fontFamily: "'DM Mono',monospace" }}>OPPORTUNITIES</p>
                <textarea value={phase.opportunities} onChange={e => updatePhase(i, "opportunities", e.target.value)} rows={2} placeholder="How could we improve this phase?" style={fieldStyle} />
              </div>
            </div>
          );
        })}
        <button onClick={addPhase} style={{ minWidth: 60, flex: "0 0 auto", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 14, fontSize: 24, color: t.textDim, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#2ECC71", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={() => { const raw = prompt("Paste JSON:"); if (!raw) return; try { setState({ ...JSON.parse(raw) }); setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } }} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
