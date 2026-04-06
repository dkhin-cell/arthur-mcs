// OpportunitySolutionTree.tsx — Ported from Level 1 OpportunitySolutionTree.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage2-ost";
const EMPTY_SOLUTION = { name: "", experiments: [""] };
const EMPTY_OPP = { name: "", solutions: [{ ...EMPTY_SOLUTION }] };
const EMPTY_STATE = { outcome: "", opportunities: [{ ...EMPTY_OPP }] };

function useAutoSave(s) { const t = useRef(null); useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [s]); }
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

export default function OpportunitySolutionTree() {
  const [theme] = useState(getTheme); const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  const [state, setState] = useState(() => loadSaved() || { ...EMPTY_STATE });
  const [toast, setToast] = useState(null);
  const [expanded, setExpanded] = useState({});
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  const fieldStyle = { width: "100%", padding: "8px 10px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.text, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif" };

  const updateOutcome = (v) => setState(prev => ({ ...prev, outcome: v }));
  const updateOpp = (oi, v) => setState(prev => { const o = [...prev.opportunities]; o[oi] = { ...o[oi], name: v }; return { ...prev, opportunities: o }; });
  const addOpp = () => setState(prev => ({ ...prev, opportunities: [...prev.opportunities, { name: "", solutions: [{ name: "", experiments: [""] }] }] }));
  const removeOpp = (oi) => setState(prev => ({ ...prev, opportunities: prev.opportunities.filter((_, i) => i !== oi) }));
  const updateSol = (oi, si, v) => setState(prev => { const o = [...prev.opportunities]; const s = [...o[oi].solutions]; s[si] = { ...s[si], name: v }; o[oi] = { ...o[oi], solutions: s }; return { ...prev, opportunities: o }; });
  const addSol = (oi) => setState(prev => { const o = [...prev.opportunities]; o[oi] = { ...o[oi], solutions: [...o[oi].solutions, { name: "", experiments: [""] }] }; return { ...prev, opportunities: o }; });
  const updateExp = (oi, si, ei, v) => setState(prev => { const o = [...prev.opportunities]; const s = [...o[oi].solutions]; const e = [...s[si].experiments]; e[ei] = v; s[si] = { ...s[si], experiments: e }; o[oi] = { ...o[oi], solutions: s }; return { ...prev, opportunities: o }; });
  const addExp = (oi, si) => setState(prev => { const o = [...prev.opportunities]; const s = [...o[oi].solutions]; s[si] = { ...s[si], experiments: [...s[si].experiments, ""] }; o[oi] = { ...o[oi], solutions: s }; return { ...prev, opportunities: o }; });

  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 2, framework: "ost", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 28, borderBottom: "3px solid #F1C40F", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#F1C40F", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 2 · Opportunity Scout</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Opportunity Solution Tree</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>Outcome → Opportunities → Solutions → Experiments</p>
      </div>

      {/* Outcome */}
      <div style={{ marginBottom: 16, padding: "14px 16px", background: "#1B9C8510", border: "1px solid #1B9C8530", borderRadius: 14 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: THEMES[theme].textDim, margin: "0 0 6px", textTransform: "uppercase", fontWeight: 600 }}>🎯 Desired Outcome</p>
        <input value={state.outcome} onChange={e => updateOutcome(e.target.value)} placeholder="What outcome are you optimizing for?" style={{ ...fieldStyle, fontSize: 16, fontWeight: 700, background: "transparent", border: "none", padding: "4px 0" }} />
      </div>

      {/* Tree */}
      {state.opportunities.map((opp, oi) => (
        <div key={oi} style={{ marginBottom: 12, marginLeft: mobile ? 0 : 20, borderLeft: `3px solid #F1C40F`, paddingLeft: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <button onClick={() => toggle(`opp-${oi}`)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: t.textMuted, width: 24 }}>{expanded[`opp-${oi}`] !== false ? "▾" : "▸"}</button>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#F1C40F", fontFamily: "'DM Mono',monospace" }}>O{oi + 1}</span>
            <input value={opp.name} onChange={e => updateOpp(oi, e.target.value)} placeholder="Opportunity..." style={{ ...fieldStyle, flex: 1, fontWeight: 600, fontSize: 14 }} />
            {state.opportunities.length > 1 && <button onClick={() => removeOpp(oi)} style={{ background: "none", border: "none", color: "#E74C3C60", cursor: "pointer", fontSize: 14 }}>×</button>}
          </div>
          {expanded[`opp-${oi}`] !== false && (
            <div style={{ marginLeft: mobile ? 16 : 32 }}>
              {opp.solutions.map((sol, si) => (
                <div key={si} style={{ marginBottom: 10, borderLeft: `2px solid #3498DB`, paddingLeft: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <button onClick={() => toggle(`sol-${oi}-${si}`)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: t.textMuted, width: 20 }}>{expanded[`sol-${oi}-${si}`] !== false ? "▾" : "▸"}</button>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#3498DB", fontFamily: "'DM Mono',monospace" }}>S{si + 1}</span>
                    <input value={sol.name} onChange={e => updateSol(oi, si, e.target.value)} placeholder="Solution..." style={{ ...fieldStyle, flex: 1, fontSize: 13 }} />
                  </div>
                  {expanded[`sol-${oi}-${si}`] !== false && (
                    <div style={{ marginLeft: mobile ? 12 : 28 }}>
                      {sol.experiments.map((exp, ei) => (
                        <div key={ei} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 9, fontWeight: 600, color: "#8E44AD", fontFamily: "'DM Mono',monospace" }}>E{ei + 1}</span>
                          <input value={exp} onChange={e => updateExp(oi, si, ei, e.target.value)} placeholder="Experiment to validate..." style={{ ...fieldStyle, flex: 1, fontSize: 12 }} />
                        </div>
                      ))}
                      <button onClick={() => addExp(oi, si)} style={{ fontSize: 11, color: t.textMuted, background: "none", border: "none", cursor: "pointer", paddingLeft: 20 }}>+ experiment</button>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={() => addSol(oi)} style={{ fontSize: 11, color: t.textMuted, background: "none", border: "none", cursor: "pointer", paddingLeft: 16 }}>+ solution</button>
            </div>
          )}
        </div>
      ))}
      <button onClick={addOpp} style={{ width: "100%", padding: "12px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 10, fontSize: 13, color: t.textMuted, cursor: "pointer", marginBottom: 18 }}>+ Add Opportunity</button>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#F1C40F", color: "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={() => { const raw = prompt("Paste JSON:"); if (!raw) return; try { setState({ ...JSON.parse(raw) }); setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } }} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
