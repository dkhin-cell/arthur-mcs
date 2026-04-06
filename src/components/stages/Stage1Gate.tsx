// Stage1Gate.tsx — Ported from Level 1 Stage1DecisionGate.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage1-gate";

function useAutoSave(state) {
  const t = useRef(null);
  useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [state]);
}
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

const READINESS_CRITERIA = [
  { id: 1, text: "Strategy articulated in 1-2 paragraphs", threshold: "Clear, specific, defensible strategy statement" },
  { id: 2, text: "One North Star Metric selected with rationale", threshold: "Scored against user value, growth, business health" },
  { id: 3, text: "3-5 input metrics identified", threshold: "Leading indicators that drive the North Star" },
  { id: 4, text: "Explicit tradeoffs documented", threshold: "What you're optimizing FOR and AGAINST" },
  { id: 5, text: "At least one thing NOT optimizing for", threshold: "Written exclusion with reasoning" },
  { id: 6, text: "OKRs defined with measurable key results", threshold: "3-5 objectives, 2-4 KRs each with baselines and targets" },
  { id: 7, text: "DACI established for key decisions", threshold: "Driver, Approver, Contributors, Informed mapped" },
];

const STATUS_COLORS = { pass: "#1B9C85", partial: "#E67E22", fail: "#E74C3C", pending: "#95A5A6" };
const STATUS_ICONS = { pass: "✅", partial: "⚠️", fail: "❌", pending: "☐" };
const TABS = [
  { id: "brief", label: "Strategy Brief", icon: "📄" },
  { id: "criteria", label: "Readiness Criteria", icon: "🚦" },
  { id: "stress", label: "Strategy Stress Test", icon: "🔥" },
  { id: "forces", label: "Forces Assessment", icon: "⚖" },
  { id: "decision", label: "GO / PIVOT / KILL", icon: "🎯" },
];

const DEFAULT_STATE = {
  brief: { strategy_summary: "", north_star: "", north_star_rationale: "", input_metrics: "", tradeoffs: "", not_optimizing: "" },
  criteria: READINESS_CRITERIA.map(c => ({ ...c, status: "pending", evidence: "", gap: "" })),
  stress_tests: [],
  forces_summary: { push: 3, pull: 3, anxiety: 3, habit: 3 },
  decision: null,
  decision_notes: "",
  activeTab: "brief",
};

export default function Stage1Gate() {
  const [theme] = useState(getTheme);
  const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);

  const [state, setState] = useState(() => loadSaved() || { ...DEFAULT_STATE, criteria: READINESS_CRITERIA.map(c => ({ ...c, status: "pending", evidence: "", gap: "" })), stress_tests: [] });
  const [toast, setToast] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const tab = state.activeTab || "brief";
  const setTab = (t) => setState(prev => ({ ...prev, activeTab: t }));
  const updateBrief = (k, v) => setState(prev => ({ ...prev, brief: { ...prev.brief, [k]: v } }));
  const updateCriterion = (i, updates) => setState(prev => ({ ...prev, criteria: prev.criteria.map((c, j) => j === i ? { ...c, ...updates } : c) }));
  const addStressTest = () => setState(prev => ({ ...prev, stress_tests: [...prev.stress_tests, { id: Date.now(), argument: "", severity: 3, rebuttal: "", survived: null }] }));
  const updateStressTest = (i, updates) => setState(prev => ({ ...prev, stress_tests: prev.stress_tests.map((s, j) => j === i ? { ...s, ...updates } : s) }));
  const removeStressTest = (i) => setState(prev => ({ ...prev, stress_tests: prev.stress_tests.filter((_, j) => j !== i) }));
  const updateForces = (k, v) => setState(prev => ({ ...prev, forces_summary: { ...prev.forces_summary, [k]: v } }));

  const passCount = state.criteria.filter(c => c.status === "pass").length;
  const driveScore = state.forces_summary.push + state.forces_summary.pull;
  const resistScore = state.forces_summary.anxiety + state.forces_summary.habit;

  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 1, framework: "decision_gate", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); };
  const importJSON = () => { const raw = prompt("Paste JSON data:"); if (!raw) return; try { setState(prev => ({ ...prev, ...JSON.parse(raw) })); setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } };

  const fieldStyle = { width: "100%", padding: "10px 12px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 13, color: t.text, outline: "none", fontFamily: "'DM Sans',sans-serif", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5 };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ marginBottom: 20, borderBottom: "3px solid #1B9C85", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#E67E22", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 1 · Strategy Architect</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Decision Gate</h1>
        <div style={{ display: "flex", gap: 12, fontSize: 12, fontFamily: "'DM Mono',monospace" }}>
          <span style={{ color: "#1B9C85" }}>{passCount}/7 criteria met</span>
          <span style={{ color: driveScore > resistScore ? "#1B9C85" : "#E74C3C" }}>Forces: {driveScore > resistScore ? "+" : ""}{driveScore - resistScore}</span>
          <span style={{ color: state.decision ? "#1B9C85" : t.textDim }}>{state.decision ? state.decision.toUpperCase() : "No decision"}</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {TABS.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{
            padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", whiteSpace: "nowrap",
            background: tab === tb.id ? "#1B9C85" : t.input,
            color: tab === tb.id ? "#fff" : t.textMuted,
          }}>{tb.icon} {tb.label}</button>
        ))}
      </div>

      {/* TAB: Strategy Brief */}
      {tab === "brief" && (
        <div>
          {[
            { key: "strategy_summary", label: "Strategy Summary", hint: "1-2 paragraphs articulating your strategy.", rows: 4, placeholder: "RideX will become Jakarta's first multimodal commute platform..." },
            { key: "north_star", label: "North Star Metric", hint: "The one metric that matters most.", rows: 1, placeholder: "Completed multimodal trips per week" },
            { key: "north_star_rationale", label: "North Star Rationale", hint: "Why this metric? How does it reflect user value, growth, and business health?", rows: 3, placeholder: "This metric captures both user adoption and revenue generation..." },
            { key: "input_metrics", label: "Input Metrics (3-5)", hint: "Leading indicators that drive the North Star.", rows: 3, placeholder: "1. Driver availability at MRT stations\n2. App downloads from corridor marketing\n3. Trip completion rate..." },
            { key: "tradeoffs", label: "Explicit Tradeoffs", hint: "What are you optimizing FOR and AGAINST?", rows: 3, placeholder: "Optimizing FOR: commute time reduction, multimodal reliability\nOptimizing AGAINST: geographic expansion, feature breadth..." },
            { key: "not_optimizing", label: "What We Are NOT Optimizing For", hint: "At least one explicit exclusion with reasoning.", rows: 2, placeholder: "NOT optimizing for intercity travel — different user segment, different infrastructure requirements..." },
          ].map(field => (
            <div key={field.key} style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: t.text, display: "block", marginBottom: 4 }}>{field.label}</label>
              <p style={{ fontSize: 12, color: t.textMuted, margin: "0 0 6px" }}>{field.hint}</p>
              <textarea value={state.brief[field.key] || ""} onChange={e => updateBrief(field.key, e.target.value)} rows={field.rows} placeholder={field.placeholder} style={fieldStyle} />
            </div>
          ))}
        </div>
      )}

      {/* TAB: Readiness Criteria */}
      {tab === "criteria" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {Object.entries(STATUS_COLORS).map(([s, c]) => (
              <span key={s} style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: c }}>{STATUS_ICONS[s]} {s} ({state.criteria.filter(cr => cr.status === s).length})</span>
            ))}
          </div>
          {state.criteria.map((crit, i) => (
            <div key={crit.id} style={{ marginBottom: 12, background: t.card, border: `1px solid ${STATUS_COLORS[crit.status]}30`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${t.cardBorder}`, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>{STATUS_ICONS[crit.status]}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: t.text, margin: 0 }}>{crit.text}</p>
                  <p style={{ fontSize: 11, color: t.textDim, margin: "2px 0 0" }}>Threshold: {crit.threshold}</p>
                </div>
              </div>
              <div style={{ padding: "10px 16px" }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  {["pass", "partial", "fail", "pending"].map(s => (
                    <button key={s} onClick={() => updateCriterion(i, { status: s })} style={{
                      padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none",
                      background: crit.status === s ? STATUS_COLORS[s] : t.input,
                      color: crit.status === s ? "#fff" : t.textMuted,
                    }}>{STATUS_ICONS[s]} {s}</button>
                  ))}
                </div>
                <textarea value={crit.evidence} onChange={e => updateCriterion(i, { evidence: e.target.value })} rows={2} placeholder="Evidence supporting this assessment..." style={{ ...fieldStyle, marginBottom: 6 }} />
                {(crit.status === "partial" || crit.status === "fail") && (
                  <textarea value={crit.gap} onChange={e => updateCriterion(i, { gap: e.target.value })} rows={1} placeholder="What's missing? What would close this gap?" style={{ ...fieldStyle, borderColor: STATUS_COLORS[crit.status] + "40" }} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: Strategy Stress Test */}
      {tab === "stress" && (
        <div>
          <p style={{ fontSize: 14, color: t.textMuted, marginBottom: 16 }}>Challenge your strategy. What would make it fail? Try to invalidate it.</p>
          {state.stress_tests.map((st, i) => (
            <div key={st.id} style={{ marginBottom: 14, background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#E74C3C", fontFamily: "'DM Mono',monospace" }}>#{i + 1}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: t.text }}>Invalidation Argument</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 10, color: t.textDim }}>Severity:</span>
                  {[1, 2, 3, 4, 5].map(v => (
                    <button key={v} onClick={() => updateStressTest(i, { severity: v })} style={{
                      width: 24, height: 24, borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none",
                      background: st.severity >= v ? "#E74C3C" : t.input, color: st.severity >= v ? "#fff" : t.textMuted,
                    }}>{v}</button>
                  ))}
                </div>
                <button onClick={() => removeStressTest(i)} style={{ background: "none", border: "none", color: "#E74C3C60", cursor: "pointer", fontSize: 14 }}>×</button>
              </div>
              <textarea value={st.argument} onChange={e => updateStressTest(i, { argument: e.target.value })} rows={2} placeholder="What could kill this strategy? Be specific." style={{ ...fieldStyle, marginBottom: 6 }} />
              <textarea value={st.rebuttal} onChange={e => updateStressTest(i, { rebuttal: e.target.value })} rows={2} placeholder="Rebuttal: Why does the strategy survive this challenge?" style={{ ...fieldStyle, marginBottom: 6 }} />
              <div style={{ display: "flex", gap: 6 }}>
                {[{ v: true, label: "Survived ✓", c: "#1B9C85" }, { v: false, label: "Fatal ✗", c: "#E74C3C" }, { v: null, label: "Unresolved", c: t.textDim }].map(opt => (
                  <button key={String(opt.v)} onClick={() => updateStressTest(i, { survived: opt.v })} style={{
                    padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none",
                    background: st.survived === opt.v ? opt.c : t.input, color: st.survived === opt.v ? "#fff" : t.textMuted,
                  }}>{opt.label}</button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={addStressTest} style={{ width: "100%", padding: "14px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 10, fontSize: 13, color: t.textMuted, cursor: "pointer" }}>+ Add Stress Test</button>
        </div>
      )}

      {/* TAB: Forces Assessment */}
      {tab === "forces" && (
        <div>
          <p style={{ fontSize: 14, color: t.textMuted, marginBottom: 16 }}>Will the market adopt this strategy? Score each force 1-5.</p>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 18 }}>
            {[
              { key: "push", label: "Push (Current Pain)", color: "#E74C3C", hint: "How strong is the pain driving change?" },
              { key: "pull", label: "Pull (Desired Outcome)", color: "#1B9C85", hint: "How compelling is the future state?" },
              { key: "anxiety", label: "Anxiety (Switching Fear)", color: "#E67E22", hint: "How scary is the transition?" },
              { key: "habit", label: "Habit (Current Behavior)", color: "#8E44AD", hint: "How entrenched is the status quo?" },
            ].map(force => (
              <div key={force.key} style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: force.color }}>{force.label}</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: force.color, fontFamily: "'DM Mono',monospace" }}>{state.forces_summary[force.key]}</span>
                </div>
                <p style={{ fontSize: 11, color: t.textDim, margin: "0 0 8px" }}>{force.hint}</p>
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3, 4, 5].map(v => (
                    <button key={v} onClick={() => updateForces(force.key, v)} style={{
                      flex: 1, padding: "8px 0", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none",
                      background: state.forces_summary[force.key] >= v ? force.color : t.input,
                      color: state.forces_summary[force.key] >= v ? "#fff" : t.textMuted,
                    }}>{v}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Summary */}
          <div style={{ padding: "16px 18px", background: driveScore > resistScore ? "#1B9C8510" : "#E74C3C10", border: `1px solid ${driveScore > resistScore ? "#1B9C8540" : "#E74C3C40"}`, borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 12, fontFamily: "'DM Mono',monospace", color: t.textDim, margin: "0 0 4px" }}>DRIVE (Push + Pull)</p>
                <span style={{ fontSize: 24, fontWeight: 800, color: "#1B9C85", fontFamily: "'DM Mono',monospace" }}>{driveScore}</span>
              </div>
              <span style={{ fontSize: 20, color: t.textDim }}>vs</span>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 12, fontFamily: "'DM Mono',monospace", color: t.textDim, margin: "0 0 4px" }}>RESIST (Anxiety + Habit)</p>
                <span style={{ fontSize: 24, fontWeight: 800, color: "#E74C3C", fontFamily: "'DM Mono',monospace" }}>{resistScore}</span>
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: 12, padding: "8px 16px", borderRadius: 8, background: driveScore > resistScore ? "#1B9C8520" : "#E74C3C20" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: driveScore > resistScore ? "#1B9C85" : "#E74C3C" }}>
                {driveScore > resistScore ? "Adoption likely — drive outweighs resistance" : driveScore === resistScore ? "Neutral — consider strengthening the case" : "Adoption risk — resistance outweighs drive"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB: GO / PIVOT / KILL */}
      {tab === "decision" && (
        <div>
          <div style={{ marginBottom: 20, padding: "16px 18px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: "0 0 12px" }}>Summary Before Decision</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              <div style={{ padding: "10px", background: t.input, borderRadius: 8, textAlign: "center" }}>
                <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: t.textDim, margin: "0 0 2px" }}>CRITERIA</p>
                <span style={{ fontSize: 20, fontWeight: 800, color: passCount >= 5 ? "#1B9C85" : "#E67E22", fontFamily: "'DM Mono',monospace" }}>{passCount}/7</span>
              </div>
              <div style={{ padding: "10px", background: t.input, borderRadius: 8, textAlign: "center" }}>
                <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: t.textDim, margin: "0 0 2px" }}>FORCES NET</p>
                <span style={{ fontSize: 20, fontWeight: 800, color: driveScore > resistScore ? "#1B9C85" : "#E74C3C", fontFamily: "'DM Mono',monospace" }}>{driveScore > resistScore ? "+" : ""}{driveScore - resistScore}</span>
              </div>
              <div style={{ padding: "10px", background: t.input, borderRadius: 8, textAlign: "center" }}>
                <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: t.textDim, margin: "0 0 2px" }}>STRESS TESTS</p>
                <span style={{ fontSize: 20, fontWeight: 800, color: t.text, fontFamily: "'DM Mono',monospace" }}>{state.stress_tests.filter(s => s.survived === true).length}/{state.stress_tests.length}</span>
              </div>
            </div>
          </div>

          <textarea value={state.decision_notes} onChange={e => setState(prev => ({ ...prev, decision_notes: e.target.value }))} rows={3} placeholder="Decision notes — required before making a call..." style={{ ...fieldStyle, marginBottom: 16 }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { value: "go", label: "GO", color: "#1B9C85", desc: "Strategy is sound. Proceed to Stage 2." },
              { value: "pivot", label: "PIVOT", color: "#E67E22", desc: "Strategy needs revision. Rework key elements." },
              { value: "kill", label: "KILL", color: "#E74C3C", desc: "Strategy is not viable. Return to Stage 0." },
            ].map(opt => (
              <button key={opt.value} onClick={() => {
                if (!state.decision_notes.trim()) { setToast("Write your decision notes first"); return; }
                setShowConfirm(opt.value);
              }} style={{
                padding: "18px 14px", borderRadius: 12, fontSize: 18, fontWeight: 800, cursor: "pointer",
                background: state.decision === opt.value ? opt.color : t.card,
                color: state.decision === opt.value ? "#fff" : opt.color,
                border: `2px solid ${opt.color}`,
                fontFamily: "'DM Mono',monospace",
              }}>
                {opt.label}
                <p style={{ fontSize: 10, fontWeight: 400, margin: "4px 0 0", fontFamily: "'DM Sans',sans-serif", color: state.decision === opt.value ? "rgba(255,255,255,0.8)" : t.textMuted }}>{opt.desc}</p>
              </button>
            ))}
          </div>

          <p style={{ fontSize: 12, color: t.textDim, textAlign: "center", fontStyle: "italic" }}>Gates advise. They don't block. You decide.</p>

          {/* Confirmation modal */}
          {showConfirm && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
              <div style={{ background: t.card, borderRadius: 16, padding: "28px 24px", maxWidth: 400, width: "90%", textAlign: "center" }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: "0 0 8px" }}>Confirm: {showConfirm.toUpperCase()}</p>
                <p style={{ fontSize: 13, color: t.textMuted, margin: "0 0 20px" }}>This will mark Stage 1 as {showConfirm.toUpperCase()}. Are you sure?</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setShowConfirm(null)} style={{ flex: 1, padding: "12px", borderRadius: 10, background: t.input, border: "none", fontSize: 14, fontWeight: 600, color: t.text, cursor: "pointer" }}>Cancel</button>
                  <button onClick={() => { setState(prev => ({ ...prev, decision: showConfirm, decidedBy: "David Khin", decidedAt: new Date().toISOString() })); setShowConfirm(null); setToast(`Stage 1 marked as ${showConfirm.toUpperCase()}`); }} style={{ flex: 1, padding: "12px", borderRadius: 10, background: showConfirm === "go" ? "#1B9C85" : showConfirm === "pivot" ? "#E67E22" : "#E74C3C", border: "none", fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer" }}>Confirm {showConfirm.toUpperCase()}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 24 }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#1B9C85", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={importJSON} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import JSON</button>
        <button onClick={() => { const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `stage1-gate-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setToast("Saved"); }} style={{ padding: "12px 20px", background: "#E67E22", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 48 }}>💾 Save</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
