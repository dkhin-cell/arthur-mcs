// HypothesisTemplate.tsx — Ported from Level 1 HypothesisTemplate.jsx
'use client';
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage2-hypothesis";
const EMPTY_HYP = { belief: "", test: "", metric: "", successCriteria: "", timeframe: "", result: "", status: "draft" };

function useAutoSave(s) { const t = useRef(null); useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [s]); }
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

export default function HypothesisTemplate() {
  const [theme] = useState(getTheme); const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  const [state, setState] = useState(() => loadSaved() || { hypotheses: [{ ...EMPTY_HYP }] });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const update = (i, k, v) => setState(prev => { const h = [...prev.hypotheses]; h[i] = { ...h[i], [k]: v }; return { ...prev, hypotheses: h }; });
  const add = () => setState(prev => ({ ...prev, hypotheses: [...prev.hypotheses, { ...EMPTY_HYP }] }));
  const remove = (i) => setState(prev => ({ ...prev, hypotheses: prev.hypotheses.filter((_, j) => j !== i) }));
  const fieldStyle = { width: "100%", padding: "8px 10px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.text, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif", resize: "vertical" };
  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 2, framework: "hypothesis", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); };

  const statusOpts = [
    { key: "draft", label: "Draft", color: "#95A5A6" },
    { key: "running", label: "Running", color: "#3498DB" },
    { key: "validated", label: "Validated", color: "#1B9C85" },
    { key: "invalidated", label: "Invalidated", color: "#E74C3C" },
    { key: "pivoted", label: "Pivoted", color: "#F1C40F" },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 28, borderBottom: "3px solid #F1C40F", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#F1C40F", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 2 · Opportunity Scout</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Hypothesis Template</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>We believe → We test → We measure → We know if.</p>
      </div>

      {state.hypotheses.map((hyp, i) => {
        const st = statusOpts.find(s => s.key === hyp.status) || statusOpts[0];
        return (
          <div key={i} style={{ marginBottom: 14, background: t.card, border: `1px solid ${st.color}30`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${t.cardBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#F1C40F", fontFamily: "'DM Mono',monospace" }}>H{i + 1}</span>
              <div style={{ display: "flex", gap: 3, marginLeft: "auto" }}>
                {statusOpts.map(s => (
                  <button key={s.key} onClick={() => update(i, "status", s.key)} style={{ padding: "4px 8px", borderRadius: 5, fontSize: 10, fontWeight: 600, cursor: "pointer", border: `1px solid ${s.color}30`, background: hyp.status === s.key ? `${s.color}20` : "transparent", color: hyp.status === s.key ? s.color : t.textDim }}>{s.label}</button>
                ))}
              </div>
              {state.hypotheses.length > 1 && <button onClick={() => remove(i)} style={{ background: "none", border: "none", color: "#E74C3C60", cursor: "pointer", fontSize: 14 }}>×</button>}
            </div>
            <div style={{ padding: "12px 16px" }}>
              <div style={{ marginBottom: 8 }}>
                <p style={{ fontSize: 10, color: "#F1C40F", margin: "0 0 3px", fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>WE BELIEVE</p>
                <textarea value={hyp.belief} onChange={e => update(i, "belief", e.target.value)} rows={2} placeholder="We believe that [user segment] will [behavior] because [reason]..." style={fieldStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <div>
                  <p style={{ fontSize: 10, color: "#3498DB", margin: "0 0 3px", fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>WE WILL TEST BY</p>
                  <textarea value={hyp.test} onChange={e => update(i, "test", e.target.value)} rows={2} placeholder="Experiment design..." style={fieldStyle} />
                </div>
                <div>
                  <p style={{ fontSize: 10, color: "#E67E22", margin: "0 0 3px", fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>WE WILL MEASURE</p>
                  <textarea value={hyp.metric} onChange={e => update(i, "metric", e.target.value)} rows={2} placeholder="Key metric to track..." style={fieldStyle} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <div>
                  <p style={{ fontSize: 10, color: "#1B9C85", margin: "0 0 3px", fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>WE KNOW WE ARE RIGHT IF</p>
                  <textarea value={hyp.successCriteria} onChange={e => update(i, "successCriteria", e.target.value)} rows={1} placeholder="Success threshold..." style={fieldStyle} />
                </div>
                <div>
                  <p style={{ fontSize: 10, color: t.textDim, margin: "0 0 3px", fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>TIMEFRAME</p>
                  <input value={hyp.timeframe} onChange={e => update(i, "timeframe", e.target.value)} placeholder="e.g., 30 days, 100 users..." style={fieldStyle} />
                </div>
              </div>
              {(hyp.status === "validated" || hyp.status === "invalidated" || hyp.status === "pivoted") && (
                <div>
                  <p style={{ fontSize: 10, color: st.color, margin: "0 0 3px", fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>RESULT</p>
                  <textarea value={hyp.result} onChange={e => update(i, "result", e.target.value)} rows={2} placeholder="What happened? What did you learn?" style={fieldStyle} />
                </div>
              )}
            </div>
          </div>
        );
      })}
      <button onClick={add} style={{ width: "100%", padding: "12px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 10, fontSize: 13, color: t.textMuted, cursor: "pointer", marginBottom: 18 }}>+ Add Hypothesis</button>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#F1C40F", color: "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={() => { const raw = prompt("Paste JSON:"); if (!raw) return; try { setState({ ...JSON.parse(raw) }); setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } }} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
