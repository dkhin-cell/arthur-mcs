// BeachheadMarket.tsx — Ported from Level 1 BeachheadMarket.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage2-beachhead";
const CRITERIA = [
  { key: "size", label: "Market Size", icon: "📐", hint: "How large is this segment?" },
  { key: "accessibility", label: "Accessibility", icon: "🚪", hint: "Can you reach them through existing channels?" },
  { key: "urgency", label: "Urgency", icon: "⏱", hint: "How urgently do they need a solution?" },
  { key: "willingness", label: "Willingness to Pay", icon: "💳", hint: "Will they pay for this? Evidence?" },
  { key: "strategic", label: "Strategic Value", icon: "🎯", hint: "Does winning here unlock adjacent markets?" },
];
const EMPTY_MARKET = { name: "", scores: { size: 3, accessibility: 3, urgency: 3, willingness: 3, strategic: 3 }, notes: "" };

function useAutoSave(s) { const t = useRef(null); useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [s]); }
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

export default function BeachheadMarket() {
  const [theme] = useState(getTheme); const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  const [state, setState] = useState(() => loadSaved() || { markets: [{ ...EMPTY_MARKET, scores: { ...EMPTY_MARKET.scores } }], selected: null, rationale: "" });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const updateMarket = (i, k, v) => setState(prev => { const m = [...prev.markets]; m[i] = { ...m[i], [k]: v }; return { ...prev, markets: m }; });
  const updateScore = (i, crit, v) => setState(prev => { const m = [...prev.markets]; m[i] = { ...m[i], scores: { ...m[i].scores, [crit]: v } }; return { ...prev, markets: m }; });
  const add = () => setState(prev => ({ ...prev, markets: [...prev.markets, { ...EMPTY_MARKET, scores: { ...EMPTY_MARKET.scores } }] }));
  const remove = (i) => setState(prev => ({ ...prev, markets: prev.markets.filter((_, j) => j !== i) }));
  const getTotal = (m) => CRITERIA.reduce((s, c) => s + (m.scores[c.key] || 0), 0);
  const maxTotal = state.markets.length > 0 ? Math.max(...state.markets.map(getTotal)) : 0;

  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 2, framework: "beachhead", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 28, borderBottom: "3px solid #F1C40F", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#F1C40F", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 2 · Opportunity Scout</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Beachhead Market Selector</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>Which market segment do you dominate first?</p>
      </div>

      {state.markets.map((market, mi) => {
        const total = getTotal(market);
        const isWinner = total === maxTotal && total > 0 && state.markets.filter(m => getTotal(m) === maxTotal).length === 1;
        return (
          <div key={mi} style={{ marginBottom: 14, background: isWinner ? "#1B9C8508" : t.card, border: `1px solid ${isWinner ? "#1B9C8540" : t.cardBorder}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${t.cardBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
              {isWinner && <span style={{ fontSize: 16 }}>🏁</span>}
              <input value={market.name} onChange={e => updateMarket(mi, "name", e.target.value)} placeholder="Market segment name..." style={{ flex: 1, padding: "6px 0", background: "transparent", border: "none", fontSize: 15, fontWeight: 700, color: t.text, outline: "none" }} />
              <span style={{ fontSize: 18, fontWeight: 800, color: isWinner ? "#1B9C85" : t.textMuted, fontFamily: "'DM Mono',monospace" }}>{total}/25</span>
              {state.markets.length > 1 && <button onClick={() => remove(mi)} style={{ background: "none", border: "none", color: "#E74C3C80", cursor: "pointer", fontSize: 16 }}>×</button>}
            </div>
            <div style={{ padding: "12px 16px" }}>
              {CRITERIA.map(crit => (
                <div key={crit.key} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 14 }}>{crit.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{crit.label}</span>
                    <span style={{ fontSize: 12, fontFamily: "'DM Mono',monospace", color: "#F1C40F", fontWeight: 600, marginLeft: "auto" }}>{market.scores[crit.key]}/5</span>
                  </div>
                  <p style={{ fontSize: 10, color: t.textDim, margin: "0 0 4px" }}>{crit.hint}</p>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(v => (
                      <button key={v} onClick={() => updateScore(mi, crit.key, v)} style={{ flex: 1, padding: "7px 0", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: market.scores[crit.key] >= v ? "#F1C40F" : t.input, color: market.scores[crit.key] >= v ? "#000" : t.textMuted }}>{v}</button>
                    ))}
                  </div>
                </div>
              ))}
              <textarea value={market.notes} onChange={e => updateMarket(mi, "notes", e.target.value)} rows={2} placeholder="Notes — why this segment? What evidence?" style={{ width: "100%", padding: "8px 10px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.text, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif", resize: "vertical", marginTop: 6 }} />
            </div>
          </div>
        );
      })}
      {state.markets.length < 6 && <button onClick={add} style={{ width: "100%", padding: "14px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 10, fontSize: 13, color: t.textMuted, cursor: "pointer", marginBottom: 18 }}>+ Add Market Segment</button>}

      {/* Selection */}
      <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, padding: "16px 18px", marginBottom: 18 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: "0 0 10px" }}>🏁 Selected Beachhead</h3>
        <select value={state.selected || ""} onChange={e => setState(prev => ({ ...prev, selected: e.target.value }))} style={{ width: "100%", padding: "10px 12px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 14, color: t.text, marginBottom: 10 }}>
          <option value="">Choose your beachhead market...</option>
          {state.markets.filter(m => m.name.trim()).map((m, i) => <option key={i} value={m.name}>{m.name} ({getTotal(m)}/25)</option>)}
        </select>
        <textarea value={state.rationale} onChange={e => setState(prev => ({ ...prev, rationale: e.target.value }))} rows={2} placeholder="Why this market first? What makes it the right beachhead?" style={{ width: "100%", padding: "10px 12px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 13, color: t.text, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif" }} />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#F1C40F", color: "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={() => { const raw = prompt("Paste JSON data:"); if (!raw) return; try { setState(prev => ({ ...prev, ...JSON.parse(raw) })); setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } }} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
