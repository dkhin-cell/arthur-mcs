// Stage1Input.tsx — Ported from Level 1 Stage1InputPanel.jsx
'use client';
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage1-session";
const STAGE0_KEY = "dk-stage0-session";
const STAGE0_GATE_KEY = "dk-stage0-gate";
const STAGE0_MOMTEST_KEY = "dk-stage0-momtest";

function useAutoSave(state) {
  const timeout = useRef(null);
  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    }, 500);
    return () => clearTimeout(timeout.current);
  }, [state]);
}

function loadSaved() {
  try { const r = window.localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {}
  return null;
}

function loadCarryForward() {
  const cf = { problem: "", jtbd: "", evidence: "", competitors: "" };
  try {
    const s0 = JSON.parse(window.localStorage.getItem(STAGE0_KEY) || "{}");
    cf.problem = s0.problem_hypothesis || "";
    cf.jtbd = [s0.jtbd_situation, s0.jtbd_motivation, s0.jtbd_outcome].filter(Boolean).join(" → ");
    cf.competitors = (s0.competitors || []).map(c => c.name).join(", ");
    const gate = JSON.parse(window.localStorage.getItem(STAGE0_GATE_KEY) || "{}");
    if (gate.validation_brief?.summary) cf.evidence = gate.validation_brief.summary;
    const mom = JSON.parse(window.localStorage.getItem(STAGE0_MOMTEST_KEY) || "{}");
    if (mom.interviews) cf.evidence = cf.evidence || `${mom.interviews.length} interviews conducted, ${mom.interviews.filter(i => i.commitment_level >= 3).length} at L3+`;
  } catch (e) {}
  return cf;
}

function useIsMobile() {
  const [m, setM] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setM(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  return m;
}

const INITIAL = {
  vision_statement: "",
  where_to_play: "",
  how_to_win: "",
  what_not_to_do: "",
  north_star_candidates: [""],
  time_horizon: "12_months",
};

export default function Stage1Input() {
  const [theme] = useState(getTheme);
  const t = THEMES[theme];
  const mobile = useIsMobile();
  const [state, setState] = useState(() => loadSaved() || { ...INITIAL });
  const [carryForward] = useState(() => loadCarryForward());
  const [toast, setToast] = useState(null);

  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const update = (key, val) => setState(prev => ({ ...prev, [key]: val }));

  const addCandidate = () => setState(prev => ({ ...prev, north_star_candidates: [...prev.north_star_candidates, ""] }));
  const updateCandidate = (i, val) => setState(prev => {
    const c = [...prev.north_star_candidates]; c[i] = val; return { ...prev, north_star_candidates: c };
  });
  const removeCandidate = (i) => setState(prev => ({
    ...prev, north_star_candidates: prev.north_star_candidates.filter((_, idx) => idx !== i),
  }));

  const exportPayload = () => {
    const payload = { stage: 1, carry_forward: carryForward, inputs: state, exported_at: new Date().toISOString() };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setToast("Dispatch payload copied to clipboard");
  };

  const importFromManus = () => {
    const raw = prompt("Paste Carter's JSON response:");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data.stage1_inputs) setState(prev => ({ ...prev, ...data.stage1_inputs }));
      setToast("Imported from Carter");
    } catch (e) { setToast("Invalid JSON"); }
  };

  const resetForm = () => { setState({ ...INITIAL }); setToast("Form reset"); };

  const fieldStyle = { width: "100%", padding: "12px 14px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 10, fontSize: 14, color: t.text, outline: "none", fontFamily: "'DM Sans',sans-serif", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5 };
  const labelStyle = { fontSize: 14, fontWeight: 600, color: t.text, fontFamily: "'DM Sans',sans-serif", display: "block", marginBottom: 6 };
  const hintStyle = { fontSize: 12, color: t.textMuted, fontFamily: "'DM Sans',sans-serif", marginBottom: 8, lineHeight: 1.4 };
  const sectionStyle = { marginBottom: 28 };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ marginBottom: 28, borderBottom: `3px solid #E67E22`, paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#E67E22", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 1 · Strategy Architect</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 8px" }}>Input Panel</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>Define your strategy. What does winning look like?</p>
      </div>

      {/* Carry-Forward from Stage 0 */}
      <div style={{ marginBottom: 32, padding: "18px 20px", background: `#E74C3C08`, border: `1px solid #E74C3C20`, borderRadius: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 16 }}>🔬</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>Carry-Forward from Stage 0</span>
          <span style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", marginLeft: "auto" }}>Read-only</span>
        </div>
        {[
          { label: "Validated Problem", value: carryForward.problem },
          { label: "Primary JTBD", value: carryForward.jtbd },
          { label: "Key Evidence", value: carryForward.evidence },
          { label: "Competitor Landscape", value: carryForward.competitors },
        ].map((item, i) => (
          <div key={i} style={{ marginBottom: i < 3 ? 12 : 0 }}>
            <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: t.textDim, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
            <p style={{ fontSize: 13, color: item.value ? t.text : t.textDim, margin: 0, lineHeight: 1.5, fontStyle: item.value ? "normal" : "italic", padding: "8px 12px", background: t.input, borderRadius: 8, border: `1px solid ${t.cardBorder}` }}>
              {item.value || "No data from Stage 0"}
            </p>
          </div>
        ))}
      </div>

      {/* Vision Statement */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Vision Statement</label>
        <p style={hintStyle}>Template: "In [timeframe], [product] will [outcome] for [users] by [approach]"</p>
        <textarea value={state.vision_statement} onChange={e => update("vision_statement", e.target.value)} rows={3} placeholder="In 18 months, RideX will reduce Jakarta commute times by 40% for white-collar workers by seamlessly chaining motorcycle taxis, MRT, and cars into single-booking trips..." style={fieldStyle} />
      </div>

      {/* Where to Play */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Where to Play</label>
        <p style={hintStyle}>Market segment, geography, user type. Be specific about boundaries.</p>
        <textarea value={state.where_to_play} onChange={e => update("where_to_play", e.target.value)} rows={3} placeholder="Jakarta South-Central corridor commuters aged 25-40, earning $800-2000/month, who currently use 2+ transport modes per trip..." style={fieldStyle} />
      </div>

      {/* How to Win */}
      <div style={sectionStyle}>
        <label style={labelStyle}>How to Win</label>
        <p style={hintStyle}>Competitive advantage and differentiation. Why you, why now.</p>
        <textarea value={state.how_to_win} onChange={e => update("how_to_win", e.target.value)} rows={3} placeholder="First multimodal trip-chaining platform in Jakarta. Lower per-trip cost than pure car rides. Real-time MRT integration that no competitor has..." style={fieldStyle} />
      </div>

      {/* What NOT to Do */}
      <div style={sectionStyle}>
        <label style={labelStyle}>What NOT to Do</label>
        <p style={hintStyle}>Explicit exclusions. What you are intentionally not solving, not building, not targeting.</p>
        <textarea value={state.what_not_to_do} onChange={e => update("what_not_to_do", e.target.value)} rows={3} placeholder="Not solving intercity travel. Not building a super-app. Not targeting the student segment in Year 1. Not competing on driver incentive subsidies..." style={fieldStyle} />
      </div>

      {/* North Star Candidates */}
      <div style={sectionStyle}>
        <label style={labelStyle}>North Star Metric Candidates</label>
        <p style={hintStyle}>2-5 candidate metrics. You'll score and select one in the North Star Selector framework.</p>
        {state.north_star_candidates.map((c, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, fontFamily: "'DM Mono',monospace", color: t.textDim, width: 24, textAlign: "center" }}>{i + 1}.</span>
            <input value={c} onChange={e => updateCandidate(i, e.target.value)} placeholder={`Candidate metric ${i + 1}...`}
              style={{ ...fieldStyle, flex: 1, resize: "none" }} />
            {state.north_star_candidates.length > 1 && (
              <button onClick={() => removeCandidate(i)} style={{ background: "none", border: "none", color: "#E74C3C", cursor: "pointer", fontSize: 16, padding: "4px 8px" }}>×</button>
            )}
          </div>
        ))}
        {state.north_star_candidates.length < 5 && (
          <button onClick={addCandidate} style={{ padding: "8px 16px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.textMuted, cursor: "pointer", width: "100%" }}>+ Add Candidate Metric</button>
        )}
      </div>

      {/* Time Horizon */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Time Horizon</label>
        <p style={hintStyle}>How far out is this strategy designed to work?</p>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { value: "6_months", label: "6 Months" },
            { value: "12_months", label: "12 Months" },
            { value: "18_months", label: "18 Months" },
          ].map(opt => (
            <button key={opt.value} onClick={() => update("time_horizon", opt.value)} style={{
              flex: 1, padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer",
              background: state.time_horizon === opt.value ? "#E67E22" : t.input,
              color: state.time_horizon === opt.value ? "#fff" : t.text,
              border: `1px solid ${state.time_horizon === opt.value ? "#E67E22" : t.cardBorder}`,
              fontFamily: "'DM Sans',sans-serif",
            }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#E67E22", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export Dispatch Payload</button>
        <button onClick={importFromManus} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import from Carter</button>
        <button onClick={() => {
          const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url;
          a.download = `stage1-input-${new Date().toISOString().slice(0, 10)}.json`; a.click();
          setToast("Saved to file");
        }} style={{ padding: "12px 20px", background: "#1B9C85", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 48 }}>💾 Save</button>
        <button onClick={resetForm} style={{ padding: "12px 20px", background: "none", border: `1px solid #E74C3C40`, borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#E74C3C", cursor: "pointer", minHeight: 48 }}>Reset</button>
      </div>

      {/* Auto-save indicator */}
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>

      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
