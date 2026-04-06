// RWWEnhanced.tsx — Ported from Level 1 RWWEnhanced.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage2-rww";
const DIMS = [
  { key: "real", label: "Real", icon: "🌍", color: "#3498DB", question: "Is the market real? Is the need real? Can users articulate it?" },
  { key: "win", label: "Win", icon: "🏆", color: "#1B9C85", question: "Can we win? Do we have a defensible advantage? Can we execute?" },
  { key: "worth", label: "Worth", icon: "💰", color: "#E67E22", question: "Is it worth doing? Are the unit economics viable? Does it align with strategy?" },
];
const EMPTY_OPP = { name: "", real: { score: 3, evidence: "" }, win: { score: 3, evidence: "" }, worth: { score: 3, evidence: "" } };

function useAutoSave(s) { const t = useRef(null); useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [s]); }
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

export default function RWWEnhanced() {
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
  const getTotal = (opp) => DIMS.reduce((s, d) => s + (opp[d.key]?.score || 0), 0);

  const fieldStyle = { width: "100%", padding: "8px 10px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.text, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif", resize: "vertical" };
  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 2, framework: "rww", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 28, borderBottom: "3px solid #F1C40F", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#F1C40F", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 2 · Opportunity Scout</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>RWW Enhanced</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>Real, Win, Worth — score each opportunity with evidence.</p>
      </div>
      {state.opportunities.map((opp, i) => (
        <div key={i} style={{ marginBottom: 16, background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.cardBorder}`, display: "flex", alignItems: "center", gap: 10 }}>
            <input value={opp.name} onChange={e => update(i, null, "name", e.target.value)} placeholder="Opportunity name..." style={{ flex: 1, padding: "6px 0", background: "transparent", border: "none", fontSize: 16, fontWeight: 700, color: t.text, outline: "none" }} />
            <span style={{ fontSize: 18, fontWeight: 800, color: getTotal(opp) >= 12 ? "#1B9C85" : getTotal(opp) >= 8 ? "#E67E22" : "#E74C3C", fontFamily: "'DM Mono',monospace" }}>{getTotal(opp)}/15</span>
            {state.opportunities.length > 1 && <button onClick={() => remove(i)} style={{ background: "none", border: "none", color: "#E74C3C80", cursor: "pointer", fontSize: 16 }}>×</button>}
          </div>
          <div style={{ padding: "12px 16px" }}>
            {DIMS.map(dim => (
              <div key={dim.key} style={{ marginBottom: 12, padding: "10px 12px", background: t.input, borderRadius: 10, border: `1px solid ${t.cardBorder}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 16 }}>{dim.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: dim.color }}>{dim.label}</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: dim.color, fontFamily: "'DM Mono',monospace", marginLeft: "auto" }}>{opp[dim.key]?.score || 0}/5</span>
                </div>
                <p style={{ fontSize: 11, color: t.textDim, margin: "0 0 6px" }}>{dim.question}</p>
                <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                  {[1, 2, 3, 4, 5].map(v => (
                    <button key={v} onClick={() => update(i, dim.key, "score", v)} style={{ flex: 1, padding: "8px 0", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: (opp[dim.key]?.score || 0) >= v ? dim.color : t.card, color: (opp[dim.key]?.score || 0) >= v ? "#fff" : t.textMuted }}>{v}</button>
                  ))}
                </div>
                <textarea value={opp[dim.key]?.evidence || ""} onChange={e => update(i, dim.key, "evidence", e.target.value)} rows={2} placeholder={`Evidence for ${dim.label}...`} style={fieldStyle} />
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
