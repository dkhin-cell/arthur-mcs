// DVUFPlanner.tsx — Ported from Level 1 DVUFPlanner.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage2-dvuf";
const DIMS = [
  { key: "desirability", label: "Desirability", icon: "❤️", color: "#E74C3C", question: "Do users want this? Is there demand?", pretotypes: ["Fake Door Test", "Landing Page MVP", "Explainer Video", "Survey / Waitlist"] },
  { key: "viability", label: "Viability", icon: "💰", color: "#1B9C85", question: "Does the business model work? Can we make money?", pretotypes: ["Price Sensitivity Test", "Unit Economics Model", "Pre-order / Letter of Intent", "Sponsor Pilot"] },
  { key: "usability", label: "Usability", icon: "🎨", color: "#3498DB", question: "Can users figure it out? Is the experience intuitive?", pretotypes: ["Paper Prototype", "Wizard of Oz", "Clickable Mockup", "5-Second Test"] },
  { key: "feasibility", label: "Feasibility", icon: "⚙️", color: "#8E44AD", question: "Can we build it? Do we have the tech and team?", pretotypes: ["Technical Spike", "API Proof of Concept", "Mechanical Turk", "Off-the-shelf Assembly"] },
];
const EMPTY_DIM = { score: 3, hypothesis: "", experiment: "", success_criteria: "", result: "" };
const EMPTY_OPP = { name: "", desirability: { ...EMPTY_DIM }, viability: { ...EMPTY_DIM }, usability: { ...EMPTY_DIM }, feasibility: { ...EMPTY_DIM } };

function useAutoSave(s) { const t = useRef(null); useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [s]); }
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

export default function DVUFPlanner() {
  const [theme] = useState(getTheme); const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  const [state, setState] = useState(() => loadSaved() || { opportunities: [{ ...EMPTY_OPP }] });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const update = (i, dim, field, val) => setState(prev => { const o = [...prev.opportunities]; if (dim) { o[i] = { ...o[i], [dim]: { ...o[i][dim], [field]: val } }; } else { o[i] = { ...o[i], [field]: val }; } return { ...prev, opportunities: o }; });
  const add = () => setState(prev => ({ ...prev, opportunities: [...prev.opportunities, { ...EMPTY_OPP }] }));
  const remove = (i) => setState(prev => ({ ...prev, opportunities: prev.opportunities.filter((_, j) => j !== i) }));

  const fieldStyle = { width: "100%", padding: "8px 10px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.text, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif", resize: "vertical" };
  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 2, framework: "dvuf", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 28, borderBottom: "3px solid #F1C40F", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#F1C40F", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 2 · Opportunity Scout</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>DVUF Validation Planner</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>Design experiments for each dimension. Pretotype before you prototype.</p>
      </div>
      {state.opportunities.map((opp, oi) => (
        <div key={oi} style={{ marginBottom: 20, background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.cardBorder}`, display: "flex", alignItems: "center", gap: 10 }}>
            <input value={opp.name} onChange={e => update(oi, null, "name", e.target.value)} placeholder="Opportunity name..." style={{ flex: 1, padding: "6px 0", background: "transparent", border: "none", fontSize: 16, fontWeight: 700, color: t.text, outline: "none" }} />
            {state.opportunities.length > 1 && <button onClick={() => remove(oi)} style={{ background: "none", border: "none", color: "#E74C3C80", cursor: "pointer", fontSize: 16 }}>×</button>}
          </div>
          <div style={{ padding: "12px 16px" }}>
            {DIMS.map(dim => (
              <div key={dim.key} style={{ marginBottom: 14, padding: "12px 14px", background: t.input, borderRadius: 10, border: `1px solid ${t.cardBorder}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 16 }}>{dim.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: dim.color }}>{dim.label}</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: dim.color, fontFamily: "'DM Mono',monospace", marginLeft: "auto" }}>{opp[dim.key]?.score || 0}/5</span>
                </div>
                <p style={{ fontSize: 11, color: t.textDim, margin: "0 0 6px" }}>{dim.question}</p>
                <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                  {[1, 2, 3, 4, 5].map(v => (
                    <button key={v} onClick={() => update(oi, dim.key, "score", v)} style={{ flex: 1, padding: "7px 0", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: (opp[dim.key]?.score || 0) >= v ? dim.color : t.card, color: (opp[dim.key]?.score || 0) >= v ? "#fff" : t.textMuted }}>{v}</button>
                  ))}
                </div>
                {/* Pretotype suggestions */}
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                  {dim.pretotypes.map(p => (
                    <button key={p} onClick={() => update(oi, dim.key, "experiment", p)} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer", border: `1px solid ${dim.color}30`, background: opp[dim.key]?.experiment === p ? `${dim.color}20` : "transparent", color: opp[dim.key]?.experiment === p ? dim.color : t.textDim }}>{p}</button>
                  ))}
                </div>
                <textarea value={opp[dim.key]?.hypothesis || ""} onChange={e => update(oi, dim.key, "hypothesis", e.target.value)} rows={1} placeholder="Hypothesis: We believe..." style={{ ...fieldStyle, marginBottom: 4 }} />
                <textarea value={opp[dim.key]?.experiment || ""} onChange={e => update(oi, dim.key, "experiment", e.target.value)} rows={1} placeholder="Experiment design..." style={{ ...fieldStyle, marginBottom: 4 }} />
                <textarea value={opp[dim.key]?.success_criteria || ""} onChange={e => update(oi, dim.key, "success_criteria", e.target.value)} rows={1} placeholder="Success criteria..." style={fieldStyle} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={add} style={{ width: "100%", padding: "14px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 10, fontSize: 13, color: t.textMuted, cursor: "pointer", marginBottom: 18 }}>+ Add Opportunity</button>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#F1C40F", color: "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={() => { const raw = prompt("Paste JSON data:"); if (!raw) return; try { setState(prev => ({ ...prev, ...JSON.parse(raw) })); setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } }} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
