// Stage3Gate.tsx — Ported from Level 1 Stage3DecisionGate.jsx
'use client';
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme, USER } from "@/lib/theme";

const STORAGE_KEY = "dk-stage3-gate";
const TABS = ["Design Brief", "Readiness Criteria", "Pre-Mortem", "UX Validation", "Decision"];

const EXIT_CRITERIA = [
  "Customer journey mapped with pain points identified",
  "User flow defined with clear entry/exit points",
  "At least 3 UX hypotheses with success metrics",
  "Prototype scope and fidelity defined",
  "Usability test plan with tasks and success criteria",
  "At least 1 hypothesis tested or test in progress",
  "Design decisions documented with rationale",
];

function useAutoSave(s) { const t = useRef(null); useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [s]); }
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

function readStageData() {
  const d = {};
  try { d.journey = JSON.parse(localStorage.getItem("dk-stage3-journey") || "{}"); } catch (e) {}
  try { d.userflow = JSON.parse(localStorage.getItem("dk-stage3-userflow") || "{}"); } catch (e) {}
  try { d.uxHypothesis = JSON.parse(localStorage.getItem("dk-stage3-uxhypothesis") || "{}"); } catch (e) {}
  try { d.protospec = JSON.parse(localStorage.getItem("dk-stage3-protospec") || "{}"); } catch (e) {}
  try { d.usability = JSON.parse(localStorage.getItem("dk-stage3-usability") || "{}"); } catch (e) {}
  try { d.input = JSON.parse(localStorage.getItem("dk-stage3-session") || "{}"); } catch (e) {}
  return d;
}

export default function Stage3Gate() {
  const [theme] = useState(getTheme); const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  const [tab, setTab] = useState(0);
  const [state, setState] = useState(() => loadSaved() || {
    criteria: EXIT_CRITERIA.map(c => ({ name: c, status: "pending" })),
    preMortem: [{ scenario: "", likelihood: 3, mitigation: "" }],
    uxValidationNotes: "",
    decision: null, notes: "", decidedAt: null, decidedBy: USER?.name || "Unknown",
  });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const data = readStageData();
  const passCount = state.criteria.filter(c => c.status === "pass").length;
  const fieldStyle = { width: "100%", padding: "8px 10px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.text, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif", resize: "vertical" };

  const autoCheck = () => {
    const c = [...state.criteria];
    const journey = (data.journey?.phases || []).filter(p => p.name).length;
    const flow = (data.userflow?.steps || []).filter(s => s.screen).length;
    const hyps = (data.uxHypothesis?.hypotheses || []).filter(h => h.designDecision).length;
    const proto = data.protospec?.name;
    const usability = (data.usability?.tasks || []).filter(t => t.description).length;
    const tested = (data.uxHypothesis?.hypotheses || []).filter(h => h.status === "validated" || h.status === "invalidated" || h.status === "testing").length;

    if (journey >= 2) c[0].status = "pass";
    if (flow >= 2) c[1].status = "pass";
    if (hyps >= 3) c[2].status = "pass";
    if (proto) c[3].status = "pass";
    if (usability >= 2) c[4].status = "pass";
    if (tested >= 1) c[5].status = "pass";
    setState(prev => ({ ...prev, criteria: c }));
    setToast("Auto-checked from stage data");
  };

  // UX Hypothesis results
  const uxResults = (data.uxHypothesis?.hypotheses || []).filter(h => h.designDecision);
  const statusColors = { draft: "#95A5A6", testing: "#3498DB", validated: "#1B9C85", invalidated: "#E74C3C" };

  return (
    <div style={{ maxWidth: 940, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 20, borderBottom: "3px solid #2ECC71", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#2ECC71", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 3 · Design & MVP</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Decision Gate</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>Does the design solve the user's problem? GO / PIVOT / KILL.</p>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 16, padding: "10px 14px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 10, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: t.text }}>Readiness</span>
        <div style={{ flex: 1, height: 8, background: t.input, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ width: `${(passCount / EXIT_CRITERIA.length) * 100}%`, height: "100%", background: passCount === EXIT_CRITERIA.length ? "#1B9C85" : "#2ECC71", borderRadius: 4, transition: "width 0.3s" }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: passCount === EXIT_CRITERIA.length ? "#1B9C85" : "#2ECC71", fontFamily: "'DM Mono',monospace" }}>{passCount}/{EXIT_CRITERIA.length}</span>
        {state.decision && <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: state.decision === "go" ? "#1B9C8520" : state.decision === "pivot" ? "#E67E2220" : "#E74C3C20", color: state.decision === "go" ? "#1B9C85" : state.decision === "pivot" ? "#E67E22" : "#E74C3C" }}>{state.decision.toUpperCase()}</span>}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
        {TABS.map((label, i) => (
          <button key={i} onClick={() => setTab(i)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: tab === i ? 700 : 500, cursor: "pointer", border: `1px solid ${tab === i ? "#2ECC71" : t.cardBorder}`, background: tab === i ? "#2ECC7110" : "transparent", color: tab === i ? "#2ECC71" : t.textMuted }}>{label}</button>
        ))}
      </div>

      {/* Tab 0: Design Brief */}
      {tab === 0 && (
        <div style={{ padding: "16px 18px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: "0 0 12px" }}>Design Brief</h3>
          <p style={{ fontSize: 11, color: t.textDim, margin: "0 0 12px" }}>Auto-assembled from Stage 3 data.</p>
          {data.input?.designGoal && <div style={{ marginBottom: 10, padding: "10px 14px", background: "#2ECC7108", border: "1px solid #2ECC7125", borderRadius: 10 }}><p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#2ECC71", margin: "0 0 4px" }}>DESIGN GOAL</p><p style={{ fontSize: 13, color: t.text, margin: 0 }}>{data.input.designGoal}</p></div>}
          {data.protospec?.name && <div style={{ marginBottom: 10, padding: "10px 14px", background: "#8E44AD08", border: "1px solid #8E44AD25", borderRadius: 10 }}><p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#8E44AD", margin: "0 0 4px" }}>PROTOTYPE</p><p style={{ fontSize: 13, color: t.text, margin: 0 }}>{data.protospec.name} — {data.protospec.fidelity} fidelity{data.protospec.tool ? ` (${data.protospec.tool})` : ""}</p></div>}
          {(data.journey?.phases || []).filter(p => p.painPoints).length > 0 && <div style={{ padding: "10px 14px", background: "#E74C3C08", border: "1px solid #E74C3C25", borderRadius: 10 }}><p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#E74C3C", margin: "0 0 4px" }}>PAIN POINTS FROM JOURNEY MAP</p>{data.journey.phases.filter(p => p.painPoints).map((p, i) => <p key={i} style={{ fontSize: 12, color: t.text, margin: "2px 0" }}>• <b>{p.name}:</b> {p.painPoints.slice(0, 80)}</p>)}</div>}
          {!data.input?.designGoal && !data.protospec?.name && <p style={{ fontSize: 12, color: t.textDim }}>Complete Input Panel and Prototype Spec to populate this brief.</p>}
        </div>
      )}

      {/* Tab 1: Readiness Criteria */}
      {tab === 1 && (
        <div style={{ padding: "16px 18px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: 0 }}>Exit Criteria</h3>
            <button onClick={autoCheck} style={{ marginLeft: "auto", padding: "6px 14px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: "#2ECC7110", border: "1px solid #2ECC7130", color: "#2ECC71", cursor: "pointer" }}>Auto-check</button>
          </div>
          {state.criteria.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 0", borderBottom: i < state.criteria.length - 1 ? `1px solid ${t.cardBorder}` : "none" }}>
              <button onClick={() => setState(prev => { const cr = [...prev.criteria]; cr[i] = { ...cr[i], status: cr[i].status === "pass" ? "pending" : "pass" }; return { ...prev, criteria: cr }; })} style={{ fontSize: 16, background: "none", border: "none", cursor: "pointer", marginTop: 2 }}>{c.status === "pass" ? "✅" : "☐"}</button>
              <span style={{ fontSize: 13, color: c.status === "pass" ? t.text : t.textMuted, lineHeight: 1.4, flex: 1 }}>{c.name}</span>
            </div>
          ))}
          <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 10 }}>Gates advise. They don't block. You decide.</p>
        </div>
      )}

      {/* Tab 2: Pre-Mortem */}
      {tab === 2 && (
        <div style={{ padding: "16px 18px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: "0 0 8px" }}>Pre-Mortem</h3>
          <p style={{ fontSize: 12, color: t.textMuted, margin: "0 0 12px" }}>The design shipped. Users hate it. Why?</p>
          {state.preMortem.map((pm, i) => (
            <div key={i} style={{ marginBottom: 10, padding: "10px 12px", background: t.input, borderRadius: 10, border: `1px solid ${t.cardBorder}` }}>
              <textarea value={pm.scenario} onChange={e => setState(prev => { const p = [...prev.preMortem]; p[i] = { ...p[i], scenario: e.target.value }; return { ...prev, preMortem: p }; })} rows={2} placeholder="Failure scenario..." style={{ ...fieldStyle, marginBottom: 6 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: t.textDim }}>Likelihood:</span>
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} onClick={() => setState(prev => { const p = [...prev.preMortem]; p[i] = { ...p[i], likelihood: v }; return { ...prev, preMortem: p }; })} style={{ width: 28, height: 28, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none", background: pm.likelihood >= v ? "#E74C3C" : t.card, color: pm.likelihood >= v ? "#fff" : t.textMuted }}>{v}</button>
                ))}
              </div>
              <textarea value={pm.mitigation} onChange={e => setState(prev => { const p = [...prev.preMortem]; p[i] = { ...p[i], mitigation: e.target.value }; return { ...prev, preMortem: p }; })} rows={1} placeholder="How would you prevent this?" style={fieldStyle} />
            </div>
          ))}
          <button onClick={() => setState(prev => ({ ...prev, preMortem: [...prev.preMortem, { scenario: "", likelihood: 3, mitigation: "" }] }))} style={{ width: "100%", padding: "10px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.textMuted, cursor: "pointer" }}>+ Add Scenario</button>
        </div>
      )}

      {/* Tab 3: UX Validation Results */}
      {tab === 3 && (
        <div style={{ padding: "16px 18px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: "0 0 8px" }}>UX Validation Results</h3>
          <p style={{ fontSize: 12, color: t.textMuted, margin: "0 0 12px" }}>Status of UX hypotheses from this stage.</p>
          {uxResults.length > 0 ? (
            <>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                {[{ key: "validated", label: "Validated" }, { key: "invalidated", label: "Invalidated" }, { key: "testing", label: "Testing" }, { key: "draft", label: "Draft" }].map(s => (
                  <div key={s.key} style={{ padding: "8px 14px", borderRadius: 8, background: `${statusColors[s.key]}10`, flex: 1, textAlign: "center" }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: statusColors[s.key] }}>{uxResults.filter(h => h.status === s.key).length}</span>
                    <p style={{ fontSize: 10, color: t.textDim, margin: 0 }}>{s.label}</p>
                  </div>
                ))}
              </div>
              {uxResults.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: `1px solid ${t.cardBorder}` }}>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: `${statusColors[h.status]}15`, color: statusColors[h.status], fontWeight: 600, fontFamily: "'DM Mono',monospace" }}>{h.status}</span>
                  <span style={{ fontSize: 12, color: t.text, flex: 1 }}>{h.designDecision.slice(0, 80)}</span>
                </div>
              ))}
            </>
          ) : <p style={{ fontSize: 12, color: t.textDim }}>No UX hypotheses yet. Complete the UX Hypothesis Canvas.</p>}
          <textarea value={state.uxValidationNotes} onChange={e => setState(prev => ({ ...prev, uxValidationNotes: e.target.value }))} rows={3} placeholder="Overall assessment: do the test results support moving to build?" style={{ ...fieldStyle, marginTop: 12 }} />
        </div>
      )}

      {/* Tab 4: Decision */}
      {tab === 4 && (
        <div style={{ padding: "16px 18px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: "0 0 12px" }}>GO / PIVOT / KILL</h3>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { key: "go", label: "GO", color: "#1B9C85", desc: "Design validated. UX hypotheses tested. Users can complete core tasks. Proceed to planning." },
              { key: "pivot", label: "PIVOT", color: "#E67E22", desc: "Design needs iteration. Key UX hypotheses invalidated. Redesign specific flows before proceeding." },
              { key: "kill", label: "KILL", color: "#E74C3C", desc: "Fundamental design problem. Users cannot complete core tasks. Return to Stage 2 and reconsider the opportunity." },
            ].map(d => (
              <button key={d.key} onClick={() => setState(prev => ({ ...prev, decision: d.key, decidedAt: new Date().toISOString(), decidedBy: USER?.name || "Unknown" }))} style={{ padding: "16px 14px", borderRadius: 12, cursor: "pointer", border: `2px solid ${state.decision === d.key ? d.color : t.cardBorder}`, background: state.decision === d.key ? `${d.color}10` : "transparent", textAlign: "left" }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: d.color, display: "block", marginBottom: 6 }}>{d.label}</span>
                <span style={{ fontSize: 11, color: t.textMuted, lineHeight: 1.4 }}>{d.desc}</span>
              </button>
            ))}
          </div>
          <textarea value={state.notes} onChange={e => setState(prev => ({ ...prev, notes: e.target.value }))} rows={3} placeholder="Decision rationale — what evidence supports this decision?" style={{ ...fieldStyle, marginBottom: 12 }} />
          {state.decision && (
            <div style={{ padding: "12px 16px", background: state.decision === "go" ? "#1B9C8510" : state.decision === "pivot" ? "#E67E2210" : "#E74C3C10", borderRadius: 10, border: `1px solid ${state.decision === "go" ? "#1B9C8530" : state.decision === "pivot" ? "#E67E2230" : "#E74C3C30"}` }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: state.decision === "go" ? "#1B9C85" : state.decision === "pivot" ? "#E67E22" : "#E74C3C", margin: "0 0 4px" }}>Stage 3 Verdict: {state.decision.toUpperCase()}</p>
              <p style={{ fontSize: 11, color: t.textDim, margin: 0 }}>{state.decidedAt ? `Decided ${new Date(state.decidedAt).toLocaleDateString()} by ${state.decidedBy}` : ""}</p>
            </div>
          )}
          <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 12 }}>This is a suggestion. Gates advise. You decide.</p>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
        <button onClick={() => { navigator.clipboard.writeText(JSON.stringify({ stage: 3, gate: state, stageData: data, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); }} style={{ padding: "12px 20px", background: "#2ECC71", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export Gate</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
