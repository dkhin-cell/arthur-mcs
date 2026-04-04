// Stage2Input.tsx — Ported from Level 1 Stage2InputPanel.jsx
'use client';
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage2-session";
const STAGE1_INPUT_KEY = "dk-stage1-session";
const STAGE1_NORTHSTAR_KEY = "dk-stage1-northstar";
const STAGE1_OKR_KEY = "dk-stage1-okr";
const STAGE0_SESSION_KEY = "dk-stage0-session";

function useAutoSave(state) {
  const t = useRef(null);
  useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [state]);
}
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

function loadCarryForward() {
  const cf = {};
  try {
    const s0 = JSON.parse(localStorage.getItem(STAGE0_SESSION_KEY) || "{}");
    cf.problem = s0.problem_hypothesis || "";
    cf.jtbd = s0.jtbd || "";
    cf.target_segment = s0.target_segment || "";
    cf.competitors = s0.competitors || "";
  } catch (e) {}
  try {
    const s1 = JSON.parse(localStorage.getItem(STAGE1_INPUT_KEY) || "{}");
    cf.vision = s1.vision_statement || "";
    cf.where_to_play = s1.where_to_play || "";
    cf.how_to_win = s1.how_to_win || "";
    cf.what_not_to_do = s1.what_not_to_do || "";
  } catch (e) {}
  try {
    const ns = JSON.parse(localStorage.getItem(STAGE1_NORTHSTAR_KEY) || "{}");
    cf.north_star = ns.selected || "";
  } catch (e) {}
  try {
    const okr = JSON.parse(localStorage.getItem(STAGE1_OKR_KEY) || "{}");
    cf.okr_count = (okr.objectives || []).length;
  } catch (e) {}
  return cf;
}

const EMPTY_HYPOTHESIS = { segment: "", unmet_need: "", evidence: "" };
const EMPTY_SIGNAL = { signal: "", expected: "" };

export default function Stage2Input() {
  const [theme] = useState(getTheme);
  const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);

  const cf = loadCarryForward();
  const hasCF = cf.problem || cf.vision || cf.north_star;

  const [state, setState] = useState(() => loadSaved() || {
    hypotheses: [{ ...EMPTY_HYPOTHESIS }],
    target_segments: [""],
    research_questions: [""],
    behavioral_signals: [{ ...EMPTY_SIGNAL }],
  });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const updateHyp = (i, k, v) => setState(prev => { const h = [...prev.hypotheses]; h[i] = { ...h[i], [k]: v }; return { ...prev, hypotheses: h }; });
  const addHyp = () => setState(prev => ({ ...prev, hypotheses: [...prev.hypotheses, { ...EMPTY_HYPOTHESIS }] }));
  const removeHyp = (i) => setState(prev => ({ ...prev, hypotheses: prev.hypotheses.filter((_, j) => j !== i) }));

  const updateSeg = (i, v) => setState(prev => { const s = [...prev.target_segments]; s[i] = v; return { ...prev, target_segments: s }; });
  const addSeg = () => setState(prev => ({ ...prev, target_segments: [...prev.target_segments, ""] }));

  const updateQ = (i, v) => setState(prev => { const q = [...prev.research_questions]; q[i] = v; return { ...prev, research_questions: q }; });
  const addQ = () => setState(prev => ({ ...prev, research_questions: [...prev.research_questions, ""] }));

  const updateSig = (i, k, v) => setState(prev => { const s = [...prev.behavioral_signals]; s[i] = { ...s[i], [k]: v }; return { ...prev, behavioral_signals: s }; });
  const addSig = () => setState(prev => ({ ...prev, behavioral_signals: [...prev.behavioral_signals, { ...EMPTY_SIGNAL }] }));

  const fieldStyle = { width: "100%", padding: "10px 12px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 13, color: t.text, outline: "none", fontFamily: "'DM Sans',sans-serif", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5 };

  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 2, data: state, carry_forward: cf, exported_at: new Date().toISOString() }, null, 2)); setToast("Dispatch payload copied"); };
  const importFromCarter = () => { const raw = prompt("Paste Carter's JSON:"); if (!raw) return; try { setState(prev => ({ ...prev, ...JSON.parse(raw) })); setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 24, borderBottom: "3px solid #F1C40F", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#F1C40F", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 2 · Opportunity Scout</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Input Panel</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>Define opportunity hypotheses. What do you believe exists — and why?</p>
      </div>

      {/* Carry-forward */}
      <div style={{ marginBottom: 24, padding: "16px 18px", background: `#F1C40F08`, border: `1px solid #F1C40F30`, borderRadius: 14 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#F1C40F", margin: "0 0 10px", textTransform: "uppercase", fontWeight: 600 }}>Carried Forward from Stages 0–1</p>
        {hasCF ? (
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 10 }}>
            {[
              { label: "Problem", value: cf.problem, stage: 0 },
              { label: "JTBD", value: cf.jtbd, stage: 0 },
              { label: "Target Segment", value: cf.target_segment, stage: 0 },
              { label: "Vision", value: cf.vision, stage: 1 },
              { label: "How to Win", value: cf.how_to_win, stage: 1 },
              { label: "North Star", value: cf.north_star, stage: 1 },
            ].filter(f => f.value).map((f, i) => (
              <div key={i} style={{ padding: "8px 12px", background: t.input, borderRadius: 8, border: `1px solid ${t.cardBorder}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: t.textDim, textTransform: "uppercase" }}>{f.label}</span>
                  <span style={{ fontSize: 9, color: "#1B9C85", fontFamily: "'DM Mono',monospace" }}>Stage {f.stage}</span>
                </div>
                <p style={{ fontSize: 12, color: t.text, margin: 0, lineHeight: 1.4 }}>{f.value.slice(0, 120)}{f.value.length > 120 ? "..." : ""}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 12, color: t.textDim, margin: 0 }}>No data from Stages 0–1. You can still fill in Stage 2 manually.</p>
        )}
      </div>

      {/* Opportunity Hypotheses */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: "0 0 8px" }}>Opportunity Hypotheses</h3>
        <p style={{ fontSize: 12, color: t.textMuted, margin: "0 0 12px" }}>We believe [user segment] has [unmet need] because [evidence].</p>
        {state.hypotheses.map((h, i) => (
          <div key={i} style={{ marginBottom: 10, padding: "12px 14px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#F1C40F", fontFamily: "'DM Mono',monospace" }}>H{i + 1}</span>
              {state.hypotheses.length > 1 && <button onClick={() => removeHyp(i)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#E74C3C60", cursor: "pointer", fontSize: 12 }}>Remove</button>}
            </div>
            <input value={h.segment} onChange={e => updateHyp(i, "segment", e.target.value)} placeholder="User segment..." style={{ ...fieldStyle, marginBottom: 6 }} />
            <input value={h.unmet_need} onChange={e => updateHyp(i, "unmet_need", e.target.value)} placeholder="Has this unmet need..." style={{ ...fieldStyle, marginBottom: 6 }} />
            <input value={h.evidence} onChange={e => updateHyp(i, "evidence", e.target.value)} placeholder="Because [evidence]..." style={fieldStyle} />
          </div>
        ))}
        <button onClick={addHyp} style={{ width: "100%", padding: "10px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.textMuted, cursor: "pointer" }}>+ Add Hypothesis</button>
      </div>

      {/* Target Segments */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: "0 0 8px" }}>Target User Segments</h3>
        {state.target_segments.map((s, i) => (
          <input key={i} value={s} onChange={e => updateSeg(i, e.target.value)} placeholder={`Segment ${i + 1}...`} style={{ ...fieldStyle, marginBottom: 6 }} />
        ))}
        <button onClick={addSeg} style={{ width: "100%", padding: "8px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.textMuted, cursor: "pointer" }}>+ Add Segment</button>
      </div>

      {/* Research Questions */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: "0 0 8px" }}>Research Questions</h3>
        <p style={{ fontSize: 12, color: t.textMuted, margin: "0 0 8px" }}>What do you need to learn before committing?</p>
        {state.research_questions.map((q, i) => (
          <input key={i} value={q} onChange={e => updateQ(i, e.target.value)} placeholder={`Question ${i + 1}...`} style={{ ...fieldStyle, marginBottom: 6 }} />
        ))}
        <button onClick={addQ} style={{ width: "100%", padding: "8px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.textMuted, cursor: "pointer" }}>+ Add Question</button>
      </div>

      {/* Behavioral Signals */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: "0 0 8px" }}>Behavioral Signals to Track</h3>
        <p style={{ fontSize: 12, color: t.textMuted, margin: "0 0 8px" }}>Observable behaviors that validate the opportunity.</p>
        {state.behavioral_signals.map((s, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
            <input value={s.signal} onChange={e => updateSig(i, "signal", e.target.value)} placeholder="Signal to observe..." style={fieldStyle} />
            <input value={s.expected} onChange={e => updateSig(i, "expected", e.target.value)} placeholder="Expected behavior..." style={fieldStyle} />
          </div>
        ))}
        <button onClick={addSig} style={{ width: "100%", padding: "8px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.textMuted, cursor: "pointer" }}>+ Add Signal</button>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#F1C40F", color: "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export Dispatch</button>
        <button onClick={importFromCarter} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import from Carter</button>
        <button onClick={() => { const blob = new Blob([JSON.stringify({ ...state, carry_forward: cf }, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `stage2-input-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setToast("Saved"); }} style={{ padding: "12px 20px", background: "#1B9C85", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 48 }}>💾</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
