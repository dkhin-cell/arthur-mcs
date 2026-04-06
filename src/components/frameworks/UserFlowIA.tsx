// UserFlowIA.tsx — Ported from Level 1 UserFlowIA.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage3-userflow";
const EMPTY_STEP = { screen: "", userAction: "", systemResponse: "", notes: "", type: "screen" };
const STEP_TYPES = [
  { key: "screen", label: "Screen", color: "#3498DB" },
  { key: "decision", label: "Decision", color: "#E67E22" },
  { key: "action", label: "Action", color: "#2ECC71" },
  { key: "error", label: "Error", color: "#E74C3C" },
  { key: "exit", label: "Exit", color: "#95A5A6" },
];

function useAutoSave(s) { const t = useRef(null); useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [s]); }
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

function loadPreFill() {
  try { const s0 = JSON.parse(localStorage.getItem("dk-stage0-session") || "{}"); return { jtbd: s0.jtbd || "" }; } catch (e) { return {}; }
}

export default function UserFlowIA() {
  const [theme] = useState(getTheme); const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  const pre = loadPreFill();
  const [state, setState] = useState(() => loadSaved() || { flowName: "", jtbd: pre.jtbd || "", entryPoint: "", exitPoint: "", steps: [{ ...EMPTY_STEP }, { ...EMPTY_STEP }, { ...EMPTY_STEP }], iaStructure: "" });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const updateStep = (i, k, v) => setState(prev => { const s = [...prev.steps]; s[i] = { ...s[i], [k]: v }; return { ...prev, steps: s }; });
  const addStep = () => setState(prev => ({ ...prev, steps: [...prev.steps, { ...EMPTY_STEP }] }));
  const removeStep = (i) => setState(prev => ({ ...prev, steps: prev.steps.filter((_, j) => j !== i) }));
  const fieldStyle = { width: "100%", padding: "8px 10px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.text, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif", resize: "vertical" };
  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 3, framework: "user_flow_ia", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 28, borderBottom: "3px solid #2ECC71", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#2ECC71", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 3 · Design & MVP</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>User Flow & IA Mapper</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>Map the step-by-step task flow and information architecture.</p>
      </div>

      {/* Context */}
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#2ECC71", margin: "0 0 4px", fontWeight: 600 }}>FLOW NAME</p>
          <input value={state.flowName} onChange={e => setState(prev => ({ ...prev, flowName: e.target.value }))} placeholder="e.g., Rider booking flow, Onboarding..." style={fieldStyle} />
        </div>
        <div>
          <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#2ECC71", margin: "0 0 4px", fontWeight: 600 }}>JTBD THIS FLOW SERVES</p>
          <input value={state.jtbd} onChange={e => setState(prev => ({ ...prev, jtbd: e.target.value }))} placeholder="When [situation], I want to [action]..." style={fieldStyle} />
        </div>
        <div>
          <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: t.textDim, margin: "0 0 4px", fontWeight: 600 }}>ENTRY POINT</p>
          <input value={state.entryPoint} onChange={e => setState(prev => ({ ...prev, entryPoint: e.target.value }))} placeholder="Where does the user start? App home, notification, link..." style={fieldStyle} />
        </div>
        <div>
          <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: t.textDim, margin: "0 0 4px", fontWeight: 600 }}>EXIT / SUCCESS POINT</p>
          <input value={state.exitPoint} onChange={e => setState(prev => ({ ...prev, exitPoint: e.target.value }))} placeholder="What does success look like? Confirmation screen, action completed..." style={fieldStyle} />
        </div>
      </div>

      {/* Flow steps */}
      <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: t.textDim, margin: "0 0 8px", textTransform: "uppercase" }}>Flow Steps</p>
      {state.steps.map((step, i) => {
        const st = STEP_TYPES.find(s => s.key === step.type) || STEP_TYPES[0];
        return (
          <div key={i} style={{ marginBottom: 8, display: "flex", gap: 8, alignItems: "flex-start" }}>
            {/* Step number + connector */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 12, minWidth: 30 }}>
              <div style={{ width: 26, height: 26, borderRadius: step.type === "decision" ? 4 : "50%", background: st.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "'DM Mono',monospace" }}>{i + 1}</div>
              {i < state.steps.length - 1 && <div style={{ width: 2, height: 20, background: t.cardBorder, marginTop: 4 }} />}
            </div>
            {/* Step card */}
            <div style={{ flex: 1, padding: "10px 12px", background: t.card, border: `1px solid ${st.color}25`, borderRadius: 10, borderLeft: `3px solid ${st.color}` }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                {STEP_TYPES.map(s => (
                  <button key={s.key} onClick={() => updateStep(i, "type", s.key)} style={{ padding: "3px 8px", borderRadius: 5, fontSize: 10, fontWeight: 600, cursor: "pointer", border: `1px solid ${s.color}30`, background: step.type === s.key ? `${s.color}20` : "transparent", color: step.type === s.key ? s.color : t.textDim }}>{s.label}</button>
                ))}
                {state.steps.length > 1 && <button onClick={() => removeStep(i)} style={{ background: "none", border: "none", color: "#E74C3C50", cursor: "pointer", fontSize: 12, marginLeft: "auto" }}>×</button>}
              </div>
              <input value={step.screen} onChange={e => updateStep(i, "screen", e.target.value)} placeholder="Screen / component name..." style={{ ...fieldStyle, fontWeight: 600, fontSize: 13, marginBottom: 4 }} />
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 4 }}>
                <textarea value={step.userAction} onChange={e => updateStep(i, "userAction", e.target.value)} rows={1} placeholder="User action..." style={fieldStyle} />
                <textarea value={step.systemResponse} onChange={e => updateStep(i, "systemResponse", e.target.value)} rows={1} placeholder="System response..." style={fieldStyle} />
              </div>
              <input value={step.notes} onChange={e => updateStep(i, "notes", e.target.value)} placeholder="Notes, edge cases..." style={{ ...fieldStyle, marginTop: 4, fontSize: 11, color: t.textMuted }} />
            </div>
          </div>
        );
      })}
      <button onClick={addStep} style={{ width: "100%", padding: "10px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 10, fontSize: 13, color: t.textMuted, cursor: "pointer", marginBottom: 16 }}>+ Add Step</button>

      {/* IA Structure */}
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#2ECC71", margin: "0 0 4px", fontWeight: 600 }}>INFORMATION ARCHITECTURE — NAVIGATION STRUCTURE</p>
        <textarea value={state.iaStructure} onChange={e => setState(prev => ({ ...prev, iaStructure: e.target.value }))} rows={6} placeholder={"Home\n├── Search / Discovery\n├── Booking Flow\n│   ├── Select destination\n│   ├── Choose ride type\n│   └── Confirm & pay\n├── Ride Tracking\n└── History / Receipts"} style={{ ...fieldStyle, fontFamily: "'DM Mono',monospace", fontSize: 12, lineHeight: 1.6 }} />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#2ECC71", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={() => { const raw = prompt("Paste JSON:"); if (!raw) return; try { setState({ ...JSON.parse(raw) }); setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } }} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
