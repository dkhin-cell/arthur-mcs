// UXHypothesisCanvas.tsx — Ported from Level 1 UXHypothesisCanvas.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage3-uxhypothesis";
const EMPTY_HYP = { designDecision: "", expectedOutcome: "", userSegment: "", successMetric: "", experiment: "", status: "draft", result: "" };
const STATUSES = [
  { key: "draft", label: "Draft", color: "#95A5A6" },
  { key: "testing", label: "Testing", color: "#3498DB" },
  { key: "validated", label: "Validated", color: "#1B9C85" },
  { key: "invalidated", label: "Invalidated", color: "#E74C3C" },
];

function useAutoSave(s) { const t = useRef(null); useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [s]); }
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

function loadPreFill() {
  const suggestions = [];
  try { const am = JSON.parse(localStorage.getItem("dk-stage2-assumptions") || "{}"); (am.assumptions || []).filter(a => a.text && (a.importance === "high")).forEach(a => suggestions.push({ source: "Stage 2 Assumption", text: a.text })); } catch (e) {}
  try { const ht = JSON.parse(localStorage.getItem("dk-stage2-hypothesis") || "{}"); (ht.hypotheses || []).filter(h => h.belief).forEach(h => suggestions.push({ source: "Stage 2 Hypothesis", text: h.belief })); } catch (e) {}
  return suggestions;
}

export default function UXHypothesisCanvas() {
  const [theme] = useState(getTheme); const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  const suggestions = loadPreFill();
  const [state, setState] = useState(() => loadSaved() || { hypotheses: [{ ...EMPTY_HYP }] });
  const [toast, setToast] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(suggestions.length > 0);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const update = (i, k, v) => setState(prev => { const h = [...prev.hypotheses]; h[i] = { ...h[i], [k]: v }; return { ...prev, hypotheses: h }; });
  const add = () => setState(prev => ({ ...prev, hypotheses: [...prev.hypotheses, { ...EMPTY_HYP }] }));
  const remove = (i) => setState(prev => ({ ...prev, hypotheses: prev.hypotheses.filter((_, j) => j !== i) }));
  const fieldStyle = { width: "100%", padding: "8px 10px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.text, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif", resize: "vertical" };
  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 3, framework: "ux_hypothesis", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 28, borderBottom: "3px solid #2ECC71", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#2ECC71", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 3 · Design & MVP</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>UX Hypothesis Canvas</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>We believe [design decision] will [outcome] for [user segment].</p>
      </div>

      {/* Suggestions from carry-forward */}
      {showSuggestions && suggestions.length > 0 && (
        <div style={{ marginBottom: 16, padding: "12px 14px", background: "#2ECC7108", border: "1px solid #2ECC7125", borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#2ECC71", fontWeight: 600 }}>💡 SUGGESTED FROM STAGE 2 ASSUMPTIONS</span>
            <button onClick={() => setShowSuggestions(false)} style={{ marginLeft: "auto", background: "none", border: "none", color: t.textDim, cursor: "pointer", fontSize: 12 }}>dismiss</button>
          </div>
          {suggestions.slice(0, 4).map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
              <span style={{ fontSize: 10, color: t.textDim, fontFamily: "'DM Mono',monospace" }}>{s.source}</span>
              <span style={{ fontSize: 12, color: t.text, flex: 1 }}>{s.text.slice(0, 80)}</span>
              <button onClick={() => { add(); update(state.hypotheses.length, "designDecision", s.text); setToast("Added"); }} style={{ padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: "#2ECC7115", border: "1px solid #2ECC7130", color: "#2ECC71", cursor: "pointer" }}>+ Use</button>
            </div>
          ))}
        </div>
      )}

      {state.hypotheses.map((hyp, i) => {
        const st = STATUSES.find(s => s.key === hyp.status) || STATUSES[0];
        return (
          <div key={i} style={{ marginBottom: 12, background: t.card, border: `1px solid ${st.color}30`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${t.cardBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#2ECC71", fontFamily: "'DM Mono',monospace" }}>UX{i + 1}</span>
              <div style={{ display: "flex", gap: 3, marginLeft: "auto" }}>
                {STATUSES.map(s => (
                  <button key={s.key} onClick={() => update(i, "status", s.key)} style={{ padding: "3px 8px", borderRadius: 5, fontSize: 10, fontWeight: 600, cursor: "pointer", border: `1px solid ${s.color}30`, background: hyp.status === s.key ? `${s.color}20` : "transparent", color: hyp.status === s.key ? s.color : t.textDim }}>{s.label}</button>
                ))}
              </div>
              {state.hypotheses.length > 1 && <button onClick={() => remove(i)} style={{ background: "none", border: "none", color: "#E74C3C50", cursor: "pointer", fontSize: 14 }}>×</button>}
            </div>
            <div style={{ padding: "12px 14px" }}>
              <div style={{ marginBottom: 8 }}>
                <p style={{ fontSize: 10, color: "#2ECC71", margin: "0 0 3px", fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>WE BELIEVE THIS DESIGN DECISION</p>
                <textarea value={hyp.designDecision} onChange={e => update(i, "designDecision", e.target.value)} rows={2} placeholder="e.g., Showing estimated pickup time before confirmation..." style={fieldStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <div>
                  <p style={{ fontSize: 10, color: "#3498DB", margin: "0 0 3px", fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>WILL RESULT IN</p>
                  <textarea value={hyp.expectedOutcome} onChange={e => update(i, "expectedOutcome", e.target.value)} rows={2} placeholder="Expected user behavior or metric change..." style={fieldStyle} />
                </div>
                <div>
                  <p style={{ fontSize: 10, color: "#E67E22", margin: "0 0 3px", fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>FOR THIS USER SEGMENT</p>
                  <textarea value={hyp.userSegment} onChange={e => update(i, "userSegment", e.target.value)} rows={2} placeholder="Which users? All users, new users, power users..." style={fieldStyle} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 8 }}>
                <div>
                  <p style={{ fontSize: 10, color: "#1B9C85", margin: "0 0 3px", fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>SUCCESS METRIC</p>
                  <input value={hyp.successMetric} onChange={e => update(i, "successMetric", e.target.value)} placeholder="What metric proves this works?" style={fieldStyle} />
                </div>
                <div>
                  <p style={{ fontSize: 10, color: t.textDim, margin: "0 0 3px", fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>HOW TO TEST</p>
                  <input value={hyp.experiment} onChange={e => update(i, "experiment", e.target.value)} placeholder="A/B test, usability test, fake door..." style={fieldStyle} />
                </div>
              </div>
              {(hyp.status === "validated" || hyp.status === "invalidated") && (
                <div style={{ marginTop: 8 }}>
                  <p style={{ fontSize: 10, color: st.color, margin: "0 0 3px", fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>RESULT</p>
                  <textarea value={hyp.result} onChange={e => update(i, "result", e.target.value)} rows={2} placeholder="What happened? What did you learn?" style={fieldStyle} />
                </div>
              )}
            </div>
          </div>
        );
      })}
      <button onClick={add} style={{ width: "100%", padding: "10px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 10, fontSize: 13, color: t.textMuted, cursor: "pointer", marginBottom: 18 }}>+ Add Hypothesis</button>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#2ECC71", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={() => { const raw = prompt("Paste JSON:"); if (!raw) return; try { setState({ ...JSON.parse(raw) }); setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } }} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
