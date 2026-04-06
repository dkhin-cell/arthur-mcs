// PestleAnalysis.tsx — Ported from Level 1 PestleAnalysis.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage1-pestle";
const CATEGORIES = [
  { key: "political", title: "Political", icon: "🏛", color: "#E74C3C", hint: "Government policies, regulations, political stability, trade restrictions." },
  { key: "economic", title: "Economic", icon: "💹", color: "#E67E22", hint: "GDP growth, inflation, exchange rates, consumer spending, unemployment." },
  { key: "social", title: "Social", icon: "👥", color: "#F1C40F", hint: "Demographics, cultural trends, lifestyle changes, education, health consciousness." },
  { key: "technological", title: "Technological", icon: "💻", color: "#2ECC71", hint: "Innovation, R&D, automation, technology adoption, digital infrastructure." },
  { key: "legal", title: "Legal", icon: "⚖️", color: "#3498DB", hint: "Employment law, consumer protection, data privacy, intellectual property, industry regulations." },
  { key: "environmental", title: "Environmental", icon: "🌍", color: "#8E44AD", hint: "Climate change, sustainability, carbon footprint, natural disasters, resource scarcity." },
];

const IMPACT_OPTIONS = ["high", "medium", "low"];
const TIMEFRAME_OPTIONS = ["now", "6mo", "12mo"];
const IMPACT_COLORS = { high: "#E74C3C", medium: "#E67E22", low: "#1B9C85" };

function useAutoSave(state) {
  const t = useRef(null);
  useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [state]);
}

function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

const EMPTY_FACTOR = { text: "", impact: "medium", timeframe: "now" };

export default function PestleAnalysis() {
  const [theme] = useState(getTheme);
  const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);

  const [state, setState] = useState(() => {
    const saved = loadSaved();
    if (saved) return saved;
    const init = { title: "PESTLE Analysis" };
    CATEGORIES.forEach(c => { init[c.key] = [{ ...EMPTY_FACTOR }]; });
    return init;
  });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const addFactor = (catKey) => setState(prev => ({ ...prev, [catKey]: [...(prev[catKey] || []), { ...EMPTY_FACTOR }] }));
  const updateFactor = (catKey, idx, field, val) => setState(prev => {
    const arr = [...(prev[catKey] || [])]; arr[idx] = { ...arr[idx], [field]: val }; return { ...prev, [catKey]: arr };
  });
  const removeFactor = (catKey, idx) => setState(prev => ({
    ...prev, [catKey]: (prev[catKey] || []).filter((_, i) => i !== idx),
  }));

  const totalFactors = CATEGORIES.reduce((sum, c) => sum + (state[c.key] || []).filter(f => f.text.trim()).length, 0);
  const highImpact = CATEGORIES.reduce((sum, c) => sum + (state[c.key] || []).filter(f => f.text.trim() && f.impact === "high").length, 0);

  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 1, framework: "pestle", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied to clipboard"); };
  const importJSON = () => { const raw = prompt("Paste JSON data:"); if (!raw) return; try { const d = JSON.parse(raw); if (d.pestle) { CATEGORIES.forEach(c => { if (d.pestle[c.key]) setState(prev => ({ ...prev, [c.key]: d.pestle[c.key] })); }); } else { setState(prev => ({ ...prev, ...d })); } setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      <div style={{ marginBottom: 28, borderBottom: "3px solid #E67E22", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#E67E22", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 1 · Strategy Architect</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>PESTLE Analysis</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: "0 0 8px" }}>Macro-environment scan — six forces shaping your market.</p>
        <div style={{ display: "flex", gap: 16, fontSize: 12, fontFamily: "'DM Mono',monospace", color: t.textMuted }}>
          <span>{totalFactors} factors identified</span>
          <span style={{ color: "#E74C3C" }}>{highImpact} high impact</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 14 }}>
        {CATEGORIES.map(cat => (
          <div key={cat.key} style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${t.cardBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>{cat.icon}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: cat.color, margin: 0 }}>{cat.title}</h3>
                <p style={{ fontSize: 11, color: t.textMuted, margin: "1px 0 0" }}>{cat.hint}</p>
              </div>
              <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: t.textDim }}>{(state[cat.key] || []).filter(f => f.text.trim()).length}</span>
            </div>
            <div style={{ padding: "10px 14px" }}>
              {(state[cat.key] || []).map((factor, fi) => (
                <div key={fi} style={{ marginBottom: 8, padding: "8px 10px", background: t.input, borderRadius: 8, border: `1px solid ${t.cardBorder}` }}>
                  <input value={factor.text} onChange={e => updateFactor(cat.key, fi, "text", e.target.value)} placeholder="Describe the factor..."
                    style={{ width: "100%", padding: "6px 0", background: "transparent", border: "none", fontSize: 13, color: t.text, outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" }} />
                  <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: t.textDim, width: 40 }}>Impact:</span>
                    {IMPACT_OPTIONS.map(imp => (
                      <button key={imp} onClick={() => updateFactor(cat.key, fi, "impact", imp)} style={{
                        padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer", border: "none",
                        background: factor.impact === imp ? IMPACT_COLORS[imp] : t.input,
                        color: factor.impact === imp ? "#fff" : t.textMuted,
                      }}>{imp}</button>
                    ))}
                    <span style={{ fontSize: 10, color: t.textDim, marginLeft: 8, width: 30 }}>When:</span>
                    {TIMEFRAME_OPTIONS.map(tf => (
                      <button key={tf} onClick={() => updateFactor(cat.key, fi, "timeframe", tf)} style={{
                        padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer", border: "none",
                        background: factor.timeframe === tf ? `${cat.color}` : t.input,
                        color: factor.timeframe === tf ? "#fff" : t.textMuted,
                      }}>{tf}</button>
                    ))}
                    <button onClick={() => removeFactor(cat.key, fi)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#E74C3C80", cursor: "pointer", fontSize: 14, padding: "2px 6px" }}>×</button>
                  </div>
                </div>
              ))}
              <button onClick={() => addFactor(cat.key)} style={{ width: "100%", padding: "8px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 8, fontSize: 11, color: t.textMuted, cursor: "pointer" }}>+ Add Factor</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#E67E22", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={importJSON} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import JSON</button>
        <button onClick={() => { const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `pestle-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setToast("Saved"); }} style={{ padding: "12px 20px", background: "#1B9C85", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 48 }}>💾 Save</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
