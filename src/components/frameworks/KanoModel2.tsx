// KanoModel2.tsx — Ported from Level 1 KanoModel2.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage2-kano";
const CATEGORIES = [
  { key: "must_be", label: "Must-Be", color: "#E74C3C", icon: "🔴", desc: "Expected. Absence causes dissatisfaction. Presence doesn't delight." },
  { key: "performance", label: "Performance", color: "#F1C40F", icon: "🟡", desc: "More is better. Directly correlated with satisfaction." },
  { key: "attractive", label: "Attractive", color: "#1B9C85", icon: "🟢", desc: "Unexpected delight. Absence doesn't disappoint." },
  { key: "indifferent", label: "Indifferent", color: "#95A5A6", icon: "⚪", desc: "No effect on satisfaction either way." },
  { key: "reverse", label: "Reverse", color: "#8E44AD", icon: "🟣", desc: "Presence causes dissatisfaction." },
];
const EMPTY_FEATURE = { name: "", category: "", evidence: "" };

function useAutoSave(s) { const t = useRef(null); useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [s]); }
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

export default function KanoModel2() {
  const [theme] = useState(getTheme); const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  const [state, setState] = useState(() => loadSaved() || { features: [{ ...EMPTY_FEATURE }] });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const update = (i, k, v) => setState(prev => { const f = [...prev.features]; f[i] = { ...f[i], [k]: v }; return { ...prev, features: f }; });
  const add = () => setState(prev => ({ ...prev, features: [...prev.features, { ...EMPTY_FEATURE }] }));
  const remove = (i) => setState(prev => ({ ...prev, features: prev.features.filter((_, j) => j !== i) }));
  const fieldStyle = { width: "100%", padding: "8px 10px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.text, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif", resize: "vertical" };
  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 2, framework: "kano", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); };

  const catCounts = {};
  CATEGORIES.forEach(c => { catCounts[c.key] = state.features.filter(f => f.category === c.key).length; });

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 28, borderBottom: "3px solid #F1C40F", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#F1C40F", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 2 · Opportunity Scout</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Kano Model</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>Categorize features by their impact on user satisfaction.</p>
      </div>

      {/* Category legend */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {CATEGORIES.map(c => (
          <div key={c.key} style={{ padding: "6px 12px", borderRadius: 8, background: `${c.color}10`, border: `1px solid ${c.color}30`, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12 }}>{c.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: c.color }}>{c.label}</span>
            <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: t.textDim }}>{catCounts[c.key]}</span>
          </div>
        ))}
      </div>

      {state.features.map((feat, i) => {
        const cat = CATEGORIES.find(c => c.key === feat.category);
        return (
          <div key={i} style={{ marginBottom: 10, padding: "12px 14px", background: t.card, border: `1px solid ${cat ? `${cat.color}40` : t.cardBorder}`, borderRadius: 12, borderLeft: cat ? `4px solid ${cat.color}` : `4px solid ${t.cardBorder}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <input value={feat.name} onChange={e => update(i, "name", e.target.value)} placeholder="Feature or capability..." style={{ ...fieldStyle, flex: 1, fontWeight: 600, fontSize: 14, border: "none", background: "transparent", padding: "4px 0" }} />
              {state.features.length > 1 && <button onClick={() => remove(i)} style={{ background: "none", border: "none", color: "#E74C3C60", cursor: "pointer", fontSize: 14 }}>×</button>}
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
              {CATEGORIES.map(c => (
                <button key={c.key} onClick={() => update(i, "category", c.key)} title={c.desc} style={{ padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1px solid ${c.color}30`, background: feat.category === c.key ? `${c.color}20` : "transparent", color: feat.category === c.key ? c.color : t.textDim }}>{c.icon} {c.label}</button>
              ))}
            </div>
            <textarea value={feat.evidence} onChange={e => update(i, "evidence", e.target.value)} rows={1} placeholder="Evidence — why this category?" style={fieldStyle} />
          </div>
        );
      })}
      <button onClick={add} style={{ width: "100%", padding: "12px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 10, fontSize: 13, color: t.textMuted, cursor: "pointer", marginBottom: 18 }}>+ Add Feature</button>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#F1C40F", color: "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={() => { const raw = prompt("Paste JSON:"); if (!raw) return; try { setState({ ...JSON.parse(raw) }); setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } }} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
