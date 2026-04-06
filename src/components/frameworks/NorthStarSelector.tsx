// NorthStarSelector.tsx — Ported from Level 1 NorthStarSelector.jsx
'use client';
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage1-northstar";
const STAGE1_KEY = "dk-stage1-session";
const CRITERIA = [
  { key: "user_value", label: "Reflects User Value", hint: "Does this metric directly measure value delivered to users?" },
  { key: "product_growth", label: "Measures Product Growth", hint: "Does growth in this metric indicate the product is succeeding?" },
  { key: "business_health", label: "Indicates Business Health", hint: "Does this metric connect to revenue, retention, or sustainability?" },
];

function useAutoSave(state) {
  const t = useRef(null);
  useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [state]);
}
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

function loadCandidates() {
  try { const r = JSON.parse(localStorage.getItem(STAGE1_KEY) || "{}"); return (r.north_star_candidates || []).filter(c => c.trim()); } catch (e) {} return [];
}

export default function NorthStarSelector() {
  const [theme] = useState(getTheme);
  const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);

  const [state, setState] = useState(() => {
    const saved = loadSaved();
    if (saved) return saved;
    const candidates = loadCandidates();
    const metrics = candidates.length > 0 ? candidates.map(c => ({ name: c, scores: { user_value: 3, product_growth: 3, business_health: 3 } })) : [
      { name: "Completed multimodal trips/week", scores: { user_value: 3, product_growth: 3, business_health: 3 } },
      { name: "Average commute time saved (minutes)", scores: { user_value: 3, product_growth: 3, business_health: 3 } },
    ];
    return { title: "North Star Selector", metrics, selected: null, rationale: "" };
  });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const updateScore = (mi, crit, val) => setState(prev => {
    const m = [...prev.metrics]; m[mi] = { ...m[mi], scores: { ...m[mi].scores, [crit]: val } }; return { ...prev, metrics: m };
  });
  const updateName = (mi, val) => setState(prev => {
    const m = [...prev.metrics]; m[mi] = { ...m[mi], name: val }; return { ...prev, metrics: m };
  });
  const addMetric = () => setState(prev => ({ ...prev, metrics: [...prev.metrics, { name: "", scores: { user_value: 3, product_growth: 3, business_health: 3 } }] }));
  const removeMetric = (mi) => setState(prev => ({ ...prev, metrics: prev.metrics.filter((_, i) => i !== mi) }));

  const getTotal = (m) => CRITERIA.reduce((s, c) => s + (m.scores[c.key] || 0), 0);
  const maxTotal = state.metrics.length > 0 ? Math.max(...state.metrics.map(getTotal)) : 0;

  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 1, framework: "north_star", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); };
  const importJSON = () => { const raw = prompt("Paste JSON data:"); if (!raw) return; try { const d = JSON.parse(raw); setState(prev => ({ ...prev, ...d })); setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 28, borderBottom: "3px solid #2980B9", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#2980B9", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 1 · Strategy Architect</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>North Star Metric Selector</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>Score each candidate metric. The highest scorer becomes your North Star.</p>
      </div>

      {/* Scoring table */}
      {state.metrics.map((metric, mi) => {
        const total = getTotal(metric);
        const isWinner = total === maxTotal && total > 0 && state.metrics.filter(m => getTotal(m) === maxTotal).length === 1;
        return (
          <div key={mi} style={{ marginBottom: 14, background: isWinner ? `#1B9C8510` : t.card, border: `1px solid ${isWinner ? "#1B9C85" : t.cardBorder}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${t.cardBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
              {isWinner && <span style={{ fontSize: 16 }}>⭐</span>}
              <input value={metric.name} onChange={e => updateName(mi, e.target.value)} placeholder="Metric name..."
                style={{ flex: 1, padding: "6px 0", background: "transparent", border: "none", fontSize: 15, fontWeight: 700, color: t.text, outline: "none", fontFamily: "'DM Sans',sans-serif" }} />
              <span style={{ fontSize: 18, fontWeight: 800, color: isWinner ? "#1B9C85" : t.textMuted, fontFamily: "'DM Mono',monospace" }}>{total}/15</span>
              {state.metrics.length > 1 && <button onClick={() => removeMetric(mi)} style={{ background: "none", border: "none", color: "#E74C3C80", cursor: "pointer", fontSize: 16 }}>×</button>}
            </div>
            <div style={{ padding: "12px 16px" }}>
              {CRITERIA.map(crit => (
                <div key={crit.key} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{crit.label}</span>
                    <span style={{ fontSize: 12, fontFamily: "'DM Mono',monospace", color: "#2980B9", fontWeight: 600 }}>{metric.scores[crit.key]}/5</span>
                  </div>
                  <p style={{ fontSize: 11, color: t.textDim, margin: "0 0 6px" }}>{crit.hint}</p>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(v => (
                      <button key={v} onClick={() => updateScore(mi, crit.key, v)} style={{
                        flex: 1, padding: "8px 0", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none",
                        background: metric.scores[crit.key] >= v ? "#2980B9" : t.input,
                        color: metric.scores[crit.key] >= v ? "#fff" : t.textMuted,
                      }}>{v}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {state.metrics.length < 5 && (
        <button onClick={addMetric} style={{ width: "100%", padding: "12px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 10, fontSize: 13, color: t.textMuted, cursor: "pointer", marginBottom: 18 }}>+ Add Candidate Metric</button>
      )}

      {/* Selection + Rationale */}
      <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, padding: "16px 18px", marginBottom: 18 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: "0 0 10px" }}>Selected North Star</h3>
        <select value={state.selected || ""} onChange={e => setState(prev => ({ ...prev, selected: e.target.value }))}
          style={{ width: "100%", padding: "10px 12px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 14, color: t.text, marginBottom: 10 }}>
          <option value="">Choose your North Star...</option>
          {state.metrics.filter(m => m.name.trim()).map((m, i) => <option key={i} value={m.name}>{m.name} ({getTotal(m)}/15)</option>)}
        </select>
        <textarea value={state.rationale} onChange={e => setState(prev => ({ ...prev, rationale: e.target.value }))} rows={3} placeholder="Why did you choose this metric? What does it tell you about product-market fit?"
          style={{ width: "100%", padding: "10px 12px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 13, color: t.text, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif" }} />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#2980B9", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={importJSON} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import</button>
        <button onClick={() => { const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `north-star-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setToast("Saved"); }} style={{ padding: "12px 20px", background: "#1B9C85", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 48 }}>💾</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
