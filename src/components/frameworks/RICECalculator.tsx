// RICECalculator.tsx — Ported from Level 1 RICECalculator.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage2-rice";
const EMPTY_ITEM = { name: "", reach: 0, impact: 1, confidence: 50, effort: 1 };

function useAutoSave(s) { const t = useRef(null); useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [s]); }
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

function riceScore(item) { return item.effort > 0 ? Math.round((item.reach * item.impact * (item.confidence / 100)) / item.effort) : 0; }

export default function RICECalculator() {
  const [theme] = useState(getTheme); const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  const [state, setState] = useState(() => loadSaved() || { items: [{ ...EMPTY_ITEM }], sort: "score_desc" });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const update = (i, k, v) => setState(prev => { const items = [...prev.items]; items[i] = { ...items[i], [k]: v }; return { ...prev, items }; });
  const add = () => setState(prev => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }));
  const remove = (i) => setState(prev => ({ ...prev, items: prev.items.filter((_, j) => j !== i) }));

  const sorted = [...state.items].sort((a, b) => riceScore(b) - riceScore(a));
  const topScore = sorted.length > 0 ? riceScore(sorted[0]) : 0;

  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 2, framework: "rice", data: state, scores: state.items.map(i => ({ name: i.name, score: riceScore(i) })), exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 28, borderBottom: "3px solid #F1C40F", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#F1C40F", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 2 · Opportunity Scout</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>RICE Calculator</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>Reach × Impact × Confidence ÷ Effort. Ranked by score.</p>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap", fontSize: 11, fontFamily: "'DM Mono',monospace" }}>
        <span style={{ color: "#3498DB" }}>R = users reached/quarter</span>
        <span style={{ color: "#1B9C85" }}>I = impact (1-3)</span>
        <span style={{ color: "#E67E22" }}>C = confidence (0-100%)</span>
        <span style={{ color: "#E74C3C" }}>E = person-months</span>
      </div>

      {state.items.map((item, i) => {
        const score = riceScore(item);
        const isTop = score === topScore && score > 0 && state.items.filter(x => riceScore(x) === topScore).length === 1;
        return (
          <div key={i} style={{ marginBottom: 12, background: isTop ? "#1B9C8508" : t.card, border: `1px solid ${isTop ? "#1B9C8540" : t.cardBorder}`, borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              {isTop && <span style={{ fontSize: 16 }}>🏆</span>}
              <input value={item.name} onChange={e => update(i, "name", e.target.value)} placeholder="Opportunity name..." style={{ flex: 1, padding: "6px 0", background: "transparent", border: "none", fontSize: 15, fontWeight: 700, color: t.text, outline: "none" }} />
              <span style={{ fontSize: 22, fontWeight: 800, color: isTop ? "#1B9C85" : score > 0 ? t.text : t.textDim, fontFamily: "'DM Mono',monospace" }}>{score}</span>
              {state.items.length > 1 && <button onClick={() => remove(i)} style={{ background: "none", border: "none", color: "#E74C3C60", cursor: "pointer", fontSize: 14 }}>×</button>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: 10 }}>
              {[
                { key: "reach", label: "Reach", color: "#3498DB", type: "number", hint: "Users/quarter", min: 0, max: 999999, step: 100 },
                { key: "impact", label: "Impact", color: "#1B9C85", type: "select", options: [{ v: 0.25, l: "0.25 — Minimal" }, { v: 0.5, l: "0.5 — Low" }, { v: 1, l: "1 — Medium" }, { v: 2, l: "2 — High" }, { v: 3, l: "3 — Massive" }] },
                { key: "confidence", label: "Confidence", color: "#E67E22", type: "range", min: 0, max: 100, step: 10 },
                { key: "effort", label: "Effort", color: "#E74C3C", type: "number", hint: "Person-months", min: 0.5, max: 100, step: 0.5 },
              ].map(f => (
                <div key={f.key} style={{ padding: "8px 10px", background: t.input, borderRadius: 8, border: `1px solid ${t.cardBorder}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: f.color }}>{f.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: f.color, fontFamily: "'DM Mono',monospace" }}>{f.key === "confidence" ? `${item[f.key]}%` : item[f.key]}</span>
                  </div>
                  {f.type === "number" && <input type="number" value={item[f.key]} onChange={e => update(i, f.key, parseFloat(e.target.value) || 0)} min={f.min} max={f.max} step={f.step} style={{ width: "100%", padding: "6px 8px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 6, fontSize: 13, color: t.text, outline: "none", boxSizing: "border-box" }} />}
                  {f.type === "select" && <select value={item[f.key]} onChange={e => update(i, f.key, parseFloat(e.target.value))} style={{ width: "100%", padding: "6px 8px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 6, fontSize: 12, color: t.text }}>{f.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}</select>}
                  {f.type === "range" && <input type="range" min={f.min} max={f.max} step={f.step} value={item[f.key]} onChange={e => update(i, f.key, parseInt(e.target.value))} style={{ width: "100%", height: 4 }} />}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <button onClick={add} style={{ width: "100%", padding: "14px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 10, fontSize: 13, color: t.textMuted, cursor: "pointer", marginBottom: 18 }}>+ Add Opportunity</button>

      {/* Ranking */}
      {sorted.filter(s => s.name.trim()).length > 1 && (
        <div style={{ padding: "14px 16px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 12, marginBottom: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: t.text, margin: "0 0 10px" }}>📊 Ranked by RICE Score</h3>
          {sorted.filter(s => s.name.trim()).map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: i < sorted.length - 1 ? `1px solid ${t.cardBorder}` : "none" }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: i === 0 ? "#1B9C85" : t.textDim, fontFamily: "'DM Mono',monospace", width: 24 }}>#{i + 1}</span>
              <span style={{ flex: 1, fontSize: 13, color: t.text, fontWeight: i === 0 ? 700 : 400 }}>{item.name}</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: i === 0 ? "#1B9C85" : t.textMuted, fontFamily: "'DM Mono',monospace" }}>{riceScore(item)}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#F1C40F", color: "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={() => { const raw = prompt("Paste JSON data:"); if (!raw) return; try { setState(prev => ({ ...prev, ...JSON.parse(raw) })); setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } }} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
