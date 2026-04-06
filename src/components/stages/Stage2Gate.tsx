// Stage2Gate.tsx — Ported from Level 1 Stage2DecisionGate.jsx
'use client';
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage2-gate";
const TABS = ["Opportunity Brief", "Readiness Criteria", "Pre-Mortem", "Assumption Assessment", "Decision"];

const EXIT_CRITERIA = [
  "At least 3 opportunities identified and scored",
  "Top opportunity has RICE score with evidence",
  "Key assumptions mapped (importance × evidence)",
  "Behavioral validation signals defined",
  "Beachhead market identified",
  "Experiment plan for top 2-3 assumptions",
  "Clear 'not pursuing' list with rationale",
];

function useAutoSave(s) { const t = useRef(null); useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [s]); }
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

function readStageData() {
  const d = {};
  try { d.rice = JSON.parse(localStorage.getItem("dk-stage2-rice") || "{}"); } catch (e) {}
  try { d.rww = JSON.parse(localStorage.getItem("dk-stage2-rww") || "{}"); } catch (e) {}
  try { d.beachhead = JSON.parse(localStorage.getItem("dk-stage2-beachhead") || "{}"); } catch (e) {}
  try { d.assumptions = JSON.parse(localStorage.getItem("dk-stage2-assumptions") || "{}"); } catch (e) {}
  try { d.signals = JSON.parse(localStorage.getItem("dk-stage2-signals") || "{}"); } catch (e) {}
  try { d.hypothesis = JSON.parse(localStorage.getItem("dk-stage2-hypothesis") || "{}"); } catch (e) {}
  try { d.jtbd = JSON.parse(localStorage.getItem("dk-stage2-jtbd") || "{}"); } catch (e) {}
  try { d.input = JSON.parse(localStorage.getItem("dk-stage2-session") || "{}"); } catch (e) {}
  return d;
}

export default function Stage2Gate() {
  const [theme] = useState(getTheme); const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  const [tab, setTab] = useState(0);
  const [state, setState] = useState(() => loadSaved() || {
    criteria: EXIT_CRITERIA.map(c => ({ name: c, status: "pending" })),
    preMortem: [{ scenario: "", likelihood: 3, mitigation: "" }],
    assumptionSummary: "",
    decision: null,
    notes: "",
    carryForward: [],
    decidedAt: null,
  });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const data = readStageData();
  const passCount = state.criteria.filter(c => c.status === "pass").length;
  const fieldStyle = { width: "100%", padding: "8px 10px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.text, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif", resize: "vertical" };

  // Auto-detect criteria status from stage data
  const autoCheck = () => {
    const c = [...state.criteria];
    const riceItems = (data.rice?.items || []).filter(i => i.name?.trim());
    const assumptions = (data.assumptions?.assumptions || []).filter(a => a.text?.trim());
    const signals = (data.signals?.signals || []).filter(s => s.signal?.trim());
    const beachhead = data.beachhead?.selected;
    const hypotheses = (data.hypothesis?.hypotheses || []).filter(h => h.belief?.trim());
    
    if (riceItems.length >= 3) c[0].status = "pass";
    if (riceItems.length > 0 && riceItems[0].name) c[1].status = "pass";
    if (assumptions.length >= 2) c[2].status = "pass";
    if (signals.length >= 2) c[3].status = "pass";
    if (beachhead) c[4].status = "pass";
    if (hypotheses.length >= 2) c[5].status = "pass";
    // Criterion 7 (not pursuing list) requires manual check
    setState(prev => ({ ...prev, criteria: c }));
    setToast("Auto-checked from stage data");
  };

  const riceTop = (data.rice?.items || []).sort((a, b) => {
    const scoreA = a.effort > 0 ? Math.round((a.reach * a.impact * (a.confidence / 100)) / a.effort) : 0;
    const scoreB = b.effort > 0 ? Math.round((b.reach * b.impact * (b.confidence / 100)) / b.effort) : 0;
    return scoreB - scoreA;
  });

  return (
    <div style={{ maxWidth: 940, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 20, borderBottom: "3px solid #F1C40F", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#F1C40F", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 2 · Opportunity Scout</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Decision Gate</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>Is the opportunity validated? GO / PIVOT / KILL.</p>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 16, padding: "10px 14px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 10, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: t.text }}>Readiness</span>
        <div style={{ flex: 1, height: 8, background: t.input, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ width: `${(passCount / EXIT_CRITERIA.length) * 100}%`, height: "100%", background: passCount === EXIT_CRITERIA.length ? "#1B9C85" : "#F1C40F", borderRadius: 4, transition: "width 0.3s" }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: passCount === EXIT_CRITERIA.length ? "#1B9C85" : "#F1C40F", fontFamily: "'DM Mono',monospace" }}>{passCount}/{EXIT_CRITERIA.length}</span>
        {state.decision && <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: state.decision === "go" ? "#1B9C8520" : state.decision === "pivot" ? "#E67E2220" : "#E74C3C20", color: state.decision === "go" ? "#1B9C85" : state.decision === "pivot" ? "#E67E22" : "#E74C3C" }}>{state.decision.toUpperCase()}</span>}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
        {TABS.map((label, i) => (
          <button key={i} onClick={() => setTab(i)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: tab === i ? 700 : 500, cursor: "pointer", border: `1px solid ${tab === i ? "#F1C40F" : t.cardBorder}`, background: tab === i ? "#F1C40F10" : "transparent", color: tab === i ? "#F1C40F" : t.textMuted }}>{label}</button>
        ))}
      </div>

      {/* Tab 0: Opportunity Brief */}
      {tab === 0 && (
        <div style={{ padding: "16px 18px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: "0 0 12px" }}>Opportunity Validation Brief</h3>
          <p style={{ fontSize: 11, color: t.textDim, margin: "0 0 12px" }}>Auto-assembled from Stage 2 data.</p>
          
          {riceTop.length > 0 && riceTop[0].name && (
            <div style={{ marginBottom: 12, padding: "10px 14px", background: "#1B9C8508", border: "1px solid #1B9C8530", borderRadius: 10 }}>
              <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#1B9C85", margin: "0 0 4px" }}>TOP OPPORTUNITY (RICE)</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: 0 }}>{riceTop[0].name}</p>
              <p style={{ fontSize: 12, color: t.textMuted, margin: "2px 0 0" }}>Score: {riceTop[0].effort > 0 ? Math.round((riceTop[0].reach * riceTop[0].impact * (riceTop[0].confidence / 100)) / riceTop[0].effort) : 0}</p>
            </div>
          )}
          {data.beachhead?.selected && (
            <div style={{ marginBottom: 12, padding: "10px 14px", background: "#F1C40F08", border: "1px solid #F1C40F30", borderRadius: 10 }}>
              <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#D4AC0D", margin: "0 0 4px" }}>BEACHHEAD MARKET</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: t.text, margin: 0 }}>{data.beachhead.selected}</p>
              {data.beachhead.rationale && <p style={{ fontSize: 12, color: t.textMuted, margin: "2px 0 0" }}>{data.beachhead.rationale.slice(0, 150)}</p>}
            </div>
          )}
          {(data.assumptions?.assumptions || []).filter(a => a.status === "untested" && a.text).length > 0 && (
            <div style={{ padding: "10px 14px", background: "#E74C3C08", border: "1px solid #E74C3C30", borderRadius: 10 }}>
              <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#E74C3C", margin: "0 0 4px" }}>UNTESTED ASSUMPTIONS</p>
              {(data.assumptions.assumptions).filter(a => a.status === "untested" && a.text).map((a, i) => (
                <p key={i} style={{ fontSize: 12, color: t.text, margin: "2px 0" }}>• {a.text.slice(0, 100)}</p>
              ))}
            </div>
          )}
          {riceTop.length === 0 && !data.beachhead?.selected && <p style={{ fontSize: 12, color: t.textDim }}>Complete RICE Calculator and Beachhead Market to populate this brief.</p>}
        </div>
      )}

      {/* Tab 1: Readiness Criteria */}
      {tab === 1 && (
        <div style={{ padding: "16px 18px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: 0 }}>Exit Criteria</h3>
            <button onClick={autoCheck} style={{ marginLeft: "auto", padding: "6px 14px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: "#F1C40F10", border: "1px solid #F1C40F30", color: "#D4AC0D", cursor: "pointer" }}>Auto-check from data</button>
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
          <p style={{ fontSize: 12, color: t.textMuted, margin: "0 0 12px" }}>It's 12 months from now and this opportunity failed. Why?</p>
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

      {/* Tab 3: Assumption Assessment */}
      {tab === 3 && (
        <div style={{ padding: "16px 18px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: "0 0 8px" }}>Assumption Assessment</h3>
          <p style={{ fontSize: 12, color: t.textMuted, margin: "0 0 12px" }}>Summary of assumption status across Stage 2 frameworks.</p>
          {(() => {
            const all = (data.assumptions?.assumptions || []).filter(a => a.text);
            const untested = all.filter(a => a.status === "untested").length;
            const validated = all.filter(a => a.status === "validated").length;
            const invalidated = all.filter(a => a.status === "invalidated").length;
            return all.length > 0 ? (
              <div>
                <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                  <div style={{ padding: "8px 14px", borderRadius: 8, background: "#95A5A610", flex: 1, textAlign: "center" }}><span style={{ fontSize: 20, fontWeight: 800, color: "#95A5A6" }}>{untested}</span><p style={{ fontSize: 10, color: t.textDim, margin: 0 }}>Untested</p></div>
                  <div style={{ padding: "8px 14px", borderRadius: 8, background: "#1B9C8510", flex: 1, textAlign: "center" }}><span style={{ fontSize: 20, fontWeight: 800, color: "#1B9C85" }}>{validated}</span><p style={{ fontSize: 10, color: t.textDim, margin: 0 }}>Validated</p></div>
                  <div style={{ padding: "8px 14px", borderRadius: 8, background: "#E74C3C10", flex: 1, textAlign: "center" }}><span style={{ fontSize: 20, fontWeight: 800, color: "#E74C3C" }}>{invalidated}</span><p style={{ fontSize: 10, color: t.textDim, margin: 0 }}>Invalidated</p></div>
                </div>
                {all.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: `1px solid ${t.cardBorder}` }}>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: a.status === "validated" ? "#1B9C8515" : a.status === "invalidated" ? "#E74C3C15" : "#95A5A615", color: a.status === "validated" ? "#1B9C85" : a.status === "invalidated" ? "#E74C3C" : "#95A5A6", fontWeight: 600, fontFamily: "'DM Mono',monospace" }}>{a.status}</span>
                    <span style={{ fontSize: 12, color: t.text, flex: 1 }}>{a.text.slice(0, 80)}</span>
                  </div>
                ))}
              </div>
            ) : <p style={{ fontSize: 12, color: t.textDim }}>No assumptions mapped yet. Complete the Assumption Map framework.</p>;
          })()}
          <textarea value={state.assumptionSummary} onChange={e => setState(prev => ({ ...prev, assumptionSummary: e.target.value }))} rows={3} placeholder="Your assessment: are the remaining untested assumptions blockers or acceptable risks?" style={{ ...fieldStyle, marginTop: 12 }} />
        </div>
      )}

      {/* Tab 4: Decision */}
      {tab === 4 && (
        <div style={{ padding: "16px 18px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: "0 0 12px" }}>GO / PIVOT / KILL</h3>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { key: "go", label: "GO", color: "#1B9C85", desc: "Top opportunity validated. RICE scores strong. Beachhead identified. Proceed to design." },
              { key: "pivot", label: "PIVOT", color: "#E67E22", desc: "Opportunity exists but key assumptions untested. Run experiments before committing to build." },
              { key: "kill", label: "KILL", color: "#E74C3C", desc: "No opportunity has sufficient evidence. Return to Stage 1 and revisit strategic direction." },
            ].map(d => (
              <button key={d.key} onClick={() => setState(prev => ({ ...prev, decision: d.key, decidedAt: new Date().toISOString(), decidedBy: "David Khin" }))} style={{ padding: "16px 14px", borderRadius: 12, cursor: "pointer", border: `2px solid ${state.decision === d.key ? d.color : t.cardBorder}`, background: state.decision === d.key ? `${d.color}10` : "transparent", textAlign: "left" }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: d.color, display: "block", marginBottom: 6 }}>{d.label}</span>
                <span style={{ fontSize: 11, color: t.textMuted, lineHeight: 1.4 }}>{d.desc}</span>
              </button>
            ))}
          </div>
          <textarea value={state.notes} onChange={e => setState(prev => ({ ...prev, notes: e.target.value }))} rows={3} placeholder="Decision rationale — what evidence supports this decision?" style={{ ...fieldStyle, marginBottom: 12 }} />
          {state.decision && (
            <div style={{ padding: "12px 16px", background: state.decision === "go" ? "#1B9C8510" : state.decision === "pivot" ? "#E67E2210" : "#E74C3C10", borderRadius: 10, border: `1px solid ${state.decision === "go" ? "#1B9C8530" : state.decision === "pivot" ? "#E67E2230" : "#E74C3C30"}` }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: state.decision === "go" ? "#1B9C85" : state.decision === "pivot" ? "#E67E22" : "#E74C3C", margin: "0 0 4px" }}>Stage 2 Verdict: {state.decision.toUpperCase()}</p>
              <p style={{ fontSize: 11, color: t.textDim, margin: 0 }}>{state.decidedAt ? `Decided ${new Date(state.decidedAt).toLocaleDateString()}` : ""}</p>
            </div>
          )}
          <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 12 }}>Gates advise. They don't block. You decide.</p>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
        <button onClick={() => { navigator.clipboard.writeText(JSON.stringify({ stage: 2, gate: state, stageData: data, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); }} style={{ padding: "12px 20px", background: "#F1C40F", color: "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export Gate</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
