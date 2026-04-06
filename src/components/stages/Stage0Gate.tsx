// Stage0Gate.tsx — Ported from Level 1 DecisionGate.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "dk-stage0-gate";

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

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => { const c = () => setM(window.innerWidth < 700); c(); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  return m;
}

function Toast({ message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>
      {message}
    </div>
  );
}

const EXIT_CRITERIA = [
  { id: 1, text: "Problem articulated in one clear sentence", threshold: "Clear, specific, testable" },
  { id: 2, text: "Problem validated with 10+ user interviews", threshold: "70%+ confirm severity 8+/10" },
  { id: 3, text: "Primary JTBD identified and validated", threshold: "JTBD statement with behavioral evidence" },
  { id: 4, text: "Alternatives acknowledged (Competing Against map)", threshold: "Direct + indirect + non-obvious mapped" },
  { id: 5, text: "Clear reason the problem matters NOW", threshold: "Market signal, regulatory shift, or tech enablement" },
  { id: 6, text: "Explicit decision on what NOT to solve", threshold: "Written exclusion list with rationale" },
  { id: 7, text: "Team aligned (no silent disagreement)", threshold: "All stakeholders signed off or dissent documented" },
];

const STATUS_COLORS = { pass: "#27AE60", partial: "#E67E22", fail: "#E74C3C", pending: "#95A5A6" };
const STATUS_ICONS = { pass: "✅", partial: "⚠️", fail: "❌", pending: "☐" };

const DEFAULT_STATE = {
  // Brief
  brief: { problem_statement: "", evidence_summary: "", unique_insight: "", team_capability: "", next_steps: "" },
  // Exit criteria
  criteria: EXIT_CRITERIA.map(c => ({ ...c, status: "pending", evidence: "", gap: "" })),
  // First principles invalidation
  invalidations: [],
  // Forces gate
  forces_summary: { push: 3, pull: 3, anxiety: 3, habit: 3 },
  // Human decision
  decision: null, // 'go', 'pivot', 'kill'
  decision_notes: "",
  // Meta
  title: "Stage 0 Decision Gate",
  ai_recommendation: null, // 'go', 'pivot', 'kill'
  ai_confidence: null,
  activeTab: "brief",
};

export default function Stage0Gate() {
  const saved = loadSaved();
  const init = saved || DEFAULT_STATE;
  const mobile = useIsMobile();

  const [brief, setBrief] = useState(init.brief);
  const [criteria, setCriteria] = useState(init.criteria);
  const [invalidations, setInvalidations] = useState(init.invalidations);
  const [forcesSummary, setForcesSummary] = useState(init.forces_summary);
  const [decision, setDecision] = useState(init.decision);
  const [decisionNotes, setDecisionNotes] = useState(init.decision_notes);
  const [title, setTitle] = useState(init.title);
  const [aiRecommendation, setAiRecommendation] = useState(init.ai_recommendation);
  const [aiConfidence, setAiConfidence] = useState(init.ai_confidence);
  const [activeTab, setActiveTab] = useState(init.activeTab || "brief");
  const [toast, setToast] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);

  const currentState = { brief, criteria, invalidations, forces_summary: forcesSummary, decision, decision_notes: decisionNotes, decidedBy: "David Khin", decidedAt: decision ? new Date().toISOString() : null, title, ai_recommendation: aiRecommendation, ai_confidence: aiConfidence, activeTab };
  useAutoSave(currentState);

  // Computed
  const passCount = criteria.filter(c => c.status === "pass").length;
  const partialCount = criteria.filter(c => c.status === "partial").length;
  const failCount = criteria.filter(c => c.status === "fail").length;
  const driveScore = forcesSummary.push + forcesSummary.pull;
  const resistScore = forcesSummary.anxiety + forcesSummary.habit;
  const adoptionLikely = driveScore > resistScore;

  // Pull forces from Forces of Progress framework
  const pullForces = () => {
    try {
      const raw = window.localStorage.getItem("dk-stage0-forces");
      if (!raw) { setToast("No Forces of Progress data found"); return; }
      const data = JSON.parse(raw);
      setForcesSummary({
        push: data.push?.score || 3, pull: data.pull?.score || 3,
        anxiety: data.anxiety?.score || 3, habit: data.habit?.score || 3,
      });
      setToast("Forces scores imported");
    } catch (e) { setToast("Error reading Forces data"); }
  };

  // Add invalidation
  const addInvalidation = () => setInvalidations([...invalidations, { id: Date.now(), argument: "", severity: 3, counter_evidence: "", rebuttal: "", survived: null }]);

  const updateCriterion = (i, updates) => setCriteria(criteria.map((c, j) => j === i ? { ...c, ...updates } : c));

  const confirmDecision = (d) => {
    setDecision(d);
    setShowConfirm(null);
    setToast(`Stage 0 marked as ${d.toUpperCase()}`);
  };

  // PDF
  const exportPDF = () => {
    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono&display=swap" rel="stylesheet">
      <style>body{font-family:'DM Sans',sans-serif;max-width:900px;margin:0 auto;padding:40px 24px}
      h1{font-size:24px;color:#1B4F72;margin:0 0 4px} h2{font-size:16px;color:#1B4F72;margin:24px 0 10px}
      table{width:100%;border-collapse:collapse;font-size:13px}
      th{background:#1B4F72;color:#fff;padding:8px 10px;text-align:left;font-size:11px}
      td{padding:8px 10px;border-bottom:1px solid #E8EAED}
      .section{padding:16px;background:#F8F9FA;border-radius:10px;margin-bottom:12px}
      @media print{body{padding:20px}}</style></head><body>
      <p style="font-size:11px;color:#1B9C85;font-family:'DM Mono',monospace;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">Product Development Agentic OS · Stage 0</p>
      <h1>Problem Validation Brief & Decision Gate</h1>
      <p style="font-size:11px;color:#95A5A6;margin:8px 0 20px">Generated ${new Date().toLocaleDateString()} · ${passCount}/7 criteria pass</p>
      ${decision ? `<div style="text-align:center;padding:16px;background:${decision === "go" ? "#EAFAF1" : decision === "pivot" ? "#FEF5E7" : "#FDEDEC"};border-radius:12px;margin-bottom:20px;border:2px solid ${decision === "go" ? "#27AE6060" : decision === "pivot" ? "#E67E2260" : "#E74C3C60"}"><p style="font-size:20px;font-weight:800;color:${decision === "go" ? "#27AE60" : decision === "pivot" ? "#E67E22" : "#E74C3C"};margin:0">DECISION: ${decision.toUpperCase()}</p>${decisionNotes ? `<p style="font-size:13px;color:#5D6D7E;margin:8px 0 0">${decisionNotes}</p>` : ""}</div>` : ""}
      <h2>Problem Validation Brief</h2>
      ${Object.entries(brief).map(([k, v]) => v ? `<div class="section"><strong style="font-size:12px;color:#7F8C8D;text-transform:uppercase">${k.replace(/_/g, " ")}</strong><p style="margin:6px 0 0;line-height:1.5">${v}</p></div>` : "").join("")}
      <h2>Exit Criteria (${passCount}/7 Pass)</h2>
      <table><thead><tr><th>#</th><th>Criterion</th><th>Status</th><th>Evidence</th></tr></thead><tbody>
      ${criteria.map(c => `<tr><td>${c.id}</td><td>${c.text}</td><td style="color:${STATUS_COLORS[c.status]};font-weight:600">${c.status.toUpperCase()}</td><td style="font-size:11px;color:#7F8C8D">${c.evidence || "—"}</td></tr>`).join("")}
      </tbody></table>
      <h2>Forces of Progress Gate</h2>
      <p>Drive (Push ${forcesSummary.push} + Pull ${forcesSummary.pull} = ${driveScore}) vs Resist (Anxiety ${forcesSummary.anxiety} + Habit ${forcesSummary.habit} = ${resistScore}) · <strong style="color:${adoptionLikely ? "#27AE60" : "#E74C3C"}">${adoptionLikely ? "ADOPTION LIKELY" : "ADOPTION AT RISK"}</strong></p>
      <p style="font-size:10px;color:#BDC3C7;text-align:center;margin-top:30px">Product Development Agentic OS · Stage 0 Decision Gate</p>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  const clearAll = () => {
    setBrief(DEFAULT_STATE.brief); setCriteria(DEFAULT_STATE.criteria);
    setInvalidations([]); setForcesSummary(DEFAULT_STATE.forces_summary);
    setDecision(null); setDecisionNotes(""); setTitle("Stage 0 Decision Gate");
    setAiRecommendation(null); setAiConfidence(null);
    window.localStorage.removeItem(STORAGE_KEY); setToast("Gate cleared");
  };

  const saveSession = () => {
    const blob = new Blob([JSON.stringify(currentState, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `decision-gate-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url); setToast("Gate saved to file");
  };

  const tabs = [
    { key: "brief", label: "Validation Brief", color: "#1B4F72" },
    { key: "criteria", label: `Exit Criteria (${passCount}/7)`, color: passCount === 7 ? "#27AE60" : "#E67E22" },
    { key: "invalidation", label: "First Principles", color: "#E74C3C" },
    { key: "forces", label: "Forces Gate", color: adoptionLikely ? "#27AE60" : "#E67E22" },
    { key: "decision", label: decision ? decision.toUpperCase() : "Decide", color: decision === "go" ? "#27AE60" : decision === "pivot" ? "#E67E22" : decision === "kill" ? "#E74C3C" : "#1B9C85" },
  ];

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: mobile ? "16px 14px" : "32px 24px", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      <a onClick={() => window.location.href = "/stage/0"} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#2980B9", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, marginBottom: 16, textDecoration: "none", minHeight: 44 }}>
        ← Back To Stage 0
      </a>

      <div style={{ marginBottom: 20, borderBottom: "3px solid #1B9C85", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#1B9C85", fontWeight: 500, letterSpacing: "0.15em", marginBottom: 4, textTransform: "uppercase" }}>Stage 0 · Artifact 4 · Decision Gate</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ fontSize: mobile ? 22 : 28, fontFamily: "'Playfair Display', serif", fontWeight: 800, color: "#1B4F72", margin: 0 }}>{title}</h1>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button onClick={saveSession} style={{ padding: "8px 14px", background: "#1B4F72", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>💾 Save</button>
            <button onClick={exportPDF} style={{ padding: "8px 14px", background: "#27AE60", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>📄 PDF</button>
            <button onClick={clearAll} style={{ padding: "8px 14px", background: "none", color: "#C0392B", border: "1px solid #E8EAED", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>🗑</button>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: "10px 16px", borderRadius: 22, fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            cursor: "pointer", border: "none", whiteSpace: "nowrap", minHeight: 44, transition: "all 0.2s",
            background: activeTab === t.key ? t.color : "#F2F3F4",
            color: activeTab === t.key ? "#fff" : "#7F8C8D",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* BRIEF TAB */}
      {activeTab === "brief" && (
        <div>
          {[
            { key: "problem_statement", label: "Problem Statement", placeholder: "[Segment] experiences [pain] when trying to [JTBD] because [root cause]. Frequency: [X]. Cost: [time/money/opportunity]." },
            { key: "evidence_summary", label: "Evidence Summary", placeholder: "Interviews: X completed, Y/X confirmed severity 8+/10. Market: $TAM. Gap: [what incumbents miss]. Workarounds: [what users do today]." },
            { key: "unique_insight", label: "Unique Insight", placeholder: "What we know that competitors don't. Why we are positioned to win." },
            { key: "team_capability", label: "Team Capability", placeholder: "Scored assessment: Unique Insight X/5, Build Capability X/5, Strategic Fit X/5." },
            { key: "next_steps", label: "Next Steps", placeholder: "If GO: move to Stage 1. If PIVOT: redefine problem. If KILL: document learnings." },
          ].map(field => (
            <div key={field.key} style={{ marginBottom: 16, background: "#FDFEFE", border: "1px solid #E8EAED", borderRadius: 12, padding: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#1B4F72", display: "block", marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>{field.label}</label>
              <textarea value={brief[field.key]} onChange={e => setBrief({ ...brief, [field.key]: e.target.value })}
                placeholder={field.placeholder} rows={3}
                style={{ width: "100%", border: "1px solid #E8EAED", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", resize: "vertical", outline: "none", background: "#FAFBFC", boxSizing: "border-box", lineHeight: 1.5 }} />
            </div>
          ))}
        </div>
      )}

      {/* CRITERIA TAB */}
      {activeTab === "criteria" && (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "#27AE60", fontWeight: 600 }}>✅ {passCount} Pass</span>
            <span style={{ fontSize: 13, color: "#E67E22", fontWeight: 600 }}>⚠️ {partialCount} Partial</span>
            <span style={{ fontSize: 13, color: "#E74C3C", fontWeight: 600 }}>❌ {failCount} Fail</span>
            <span style={{ fontSize: 13, color: "#95A5A6", fontWeight: 600 }}>☐ {7 - passCount - partialCount - failCount} Pending</span>
          </div>
          {criteria.map((c, i) => (
            <div key={c.id} style={{ marginBottom: 12, background: "#FDFEFE", border: `1px solid ${STATUS_COLORS[c.status]}30`, borderRadius: 12, padding: 16, borderLeft: `4px solid ${STATUS_COLORS[c.status]}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#2C3E50", margin: "0 0 2px 0" }}>{c.id}. {c.text}</p>
                  <p style={{ fontSize: 11, color: "#7F8C8D", margin: 0, fontFamily: "'DM Mono', monospace" }}>Threshold: {c.threshold}</p>
                </div>
                <select value={c.status} onChange={e => updateCriterion(i, { status: e.target.value })}
                  style={{ padding: "8px 10px", border: `1px solid ${STATUS_COLORS[c.status]}40`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: STATUS_COLORS[c.status], background: `${STATUS_COLORS[c.status]}10`, cursor: "pointer", minHeight: 36 }}>
                  <option value="pending">☐ Pending</option>
                  <option value="pass">✅ Pass</option>
                  <option value="partial">⚠️ Partial</option>
                  <option value="fail">❌ Fail</option>
                </select>
              </div>
              <input value={c.evidence} onChange={e => updateCriterion(i, { evidence: e.target.value })}
                placeholder="Evidence supporting this assessment..."
                style={{ width: "100%", border: "1px solid #E8EAED", borderRadius: 6, padding: "8px 10px", fontSize: 12, outline: "none", background: "#FAFBFC", boxSizing: "border-box", marginBottom: 4 }} />
              {(c.status === "partial" || c.status === "fail") && (
                <input value={c.gap || ""} onChange={e => updateCriterion(i, { gap: e.target.value })}
                  placeholder="What's missing? What would change this to pass?"
                  style={{ width: "100%", border: "1px solid #E8EAED", borderRadius: 6, padding: "8px 10px", fontSize: 12, outline: "none", background: "#FEF5E7", boxSizing: "border-box", color: "#7D6608" }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* INVALIDATION TAB */}
      {activeTab === "invalidation" && (
        <div>
          <div style={{ padding: "14px 18px", background: "#FDEDEC", borderRadius: 12, border: "1px solid #E74C3C30", marginBottom: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#C0392B", margin: "0 0 4px 0" }}>🔥 Devil's Advocate Mode</p>
            <p style={{ fontSize: 12, color: "#922B21", margin: 0, lineHeight: 1.4 }}>Actively try to KILL the hypothesis. If it survives, confidence is earned. If it doesn't, you saved months.</p>
          </div>
          {invalidations.map((inv, i) => (
            <div key={inv.id} style={{ marginBottom: 14, background: "#FDFEFE", border: "1px solid #E8EAED", borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#E74C3C", fontWeight: 600 }}>Counter-Argument #{i + 1}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <select value={inv.severity} onChange={e => setInvalidations(invalidations.map((v, j) => j === i ? { ...v, severity: Number(e.target.value) } : v))}
                    style={{ padding: "4px 8px", border: "1px solid #E8EAED", borderRadius: 6, fontSize: 11, fontFamily: "'DM Mono', monospace", background: "#FAFBFC" }}>
                    {[1, 2, 3, 4, 5].map(s => <option key={s} value={s}>Sev {s}/5</option>)}
                  </select>
                  <button onClick={() => setInvalidations(invalidations.filter((_, j) => j !== i))}
                    style={{ background: "none", border: "none", color: "#C0392B", cursor: "pointer", fontSize: 14, padding: "4px" }}>×</button>
                </div>
              </div>
              <input value={inv.argument} onChange={e => setInvalidations(invalidations.map((v, j) => j === i ? { ...v, argument: e.target.value } : v))}
                placeholder="The hypothesis is wrong because..."
                style={{ width: "100%", border: "1px solid #E8EAED", borderRadius: 6, padding: "8px 10px", fontSize: 13, outline: "none", background: "#FAFBFC", boxSizing: "border-box", marginBottom: 6, fontWeight: 600 }} />
              <input value={inv.counter_evidence || ""} onChange={e => setInvalidations(invalidations.map((v, j) => j === i ? { ...v, counter_evidence: e.target.value } : v))}
                placeholder="Counter-evidence..."
                style={{ width: "100%", border: "1px solid #E8EAED", borderRadius: 6, padding: "8px 10px", fontSize: 12, outline: "none", background: "#FAFBFC", boxSizing: "border-box", marginBottom: 6, color: "#7F8C8D" }} />
              <input value={inv.rebuttal || ""} onChange={e => setInvalidations(invalidations.map((v, j) => j === i ? { ...v, rebuttal: e.target.value } : v))}
                placeholder="Your rebuttal..."
                style={{ width: "100%", border: "1px solid #E8EAED", borderRadius: 6, padding: "8px 10px", fontSize: 12, outline: "none", background: "#EAFAF1", boxSizing: "border-box", color: "#1B9C85" }} />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {["survived", "weakened", "killed"].map(s => (
                  <button key={s} onClick={() => setInvalidations(invalidations.map((v, j) => j === i ? { ...v, survived: s } : v))}
                    style={{
                      padding: "6px 14px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                      background: inv.survived === s ? (s === "survived" ? "#27AE60" : s === "weakened" ? "#E67E22" : "#E74C3C") : "#F2F3F4",
                      color: inv.survived === s ? "#fff" : "#7F8C8D", border: "none",
                    }}>
                    {s === "survived" ? "✓ Survived" : s === "weakened" ? "~ Weakened" : "✗ Killed"}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={addInvalidation} style={{ width: "100%", padding: "14px", background: "#FAFBFC", border: "1px dashed #E74C3C50", borderRadius: 10, fontSize: 13, color: "#E74C3C", cursor: "pointer", fontWeight: 600, minHeight: 48 }}>
            + Add Counter-Argument
          </button>
        </div>
      )}

      {/* FORCES GATE TAB */}
      {activeTab === "forces" && (
        <div>
          <div style={{
            padding: "16px 20px", borderRadius: 12, marginBottom: 20, textAlign: "center",
            background: adoptionLikely ? "#EAFAF1" : "#FDEDEC",
            border: `2px solid ${adoptionLikely ? "#27AE6040" : "#E74C3C40"}`,
          }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: adoptionLikely ? "#1B9C85" : "#E74C3C", margin: "0 0 6px 0", fontFamily: "'DM Mono', monospace" }}>
              {adoptionLikely ? "ADOPTION LIKELY" : "ADOPTION AT RISK"} · Net: {driveScore - resistScore > 0 ? "+" : ""}{driveScore - resistScore}
            </p>
            <p style={{ fontSize: 13, color: "#5D6D7E", margin: 0 }}>
              Drive ({forcesSummary.push} + {forcesSummary.pull} = {driveScore}) vs Resist ({forcesSummary.anxiety} + {forcesSummary.habit} = {resistScore})
            </p>
          </div>
          <button onClick={pullForces} style={{ padding: "10px 20px", background: "#E67E22", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", minHeight: 44, marginBottom: 16 }}>
            Pull Scores From Forces of Progress Framework
          </button>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
            {[
              { key: "push", label: "Push (Current Pain)", color: "#E74C3C" },
              { key: "pull", label: "Pull (New Solution)", color: "#27AE60" },
              { key: "anxiety", label: "Anxiety (Switching Fear)", color: "#E67E22" },
              { key: "habit", label: "Habit (Status Quo)", color: "#8E44AD" },
            ].map(f => (
              <div key={f.key} style={{ padding: 14, background: "#FDFEFE", border: "1px solid #E8EAED", borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: f.color }}>{f.label}</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: f.color, fontFamily: "'DM Mono', monospace" }}>{forcesSummary[f.key]}</span>
                </div>
                <input type="range" min={1} max={5} value={forcesSummary[f.key]}
                  onChange={e => setForcesSummary({ ...forcesSummary, [f.key]: Number(e.target.value) })}
                  style={{ width: "100%", accentColor: f.color, cursor: "pointer", height: 24 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DECISION TAB */}
      {activeTab === "decision" && (
        <div>
          <div style={{ padding: "18px 22px", background: "#EBF5FB", borderRadius: 14, border: "1px solid #AED6F1", marginBottom: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1B4F72", margin: "0 0 8px 0" }}>Gates advise. They don't block. You decide.</p>
            <p style={{ fontSize: 13, color: "#2C3E50", margin: 0, lineHeight: 1.5 }}>
              Gates advise. They don't block. You decide.
            </p>
          </div>

          {/* Summary before deciding */}
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            <div style={{ padding: 14, background: "#F8F9FA", borderRadius: 10, textAlign: "center" }}>
              <p style={{ fontSize: 10, color: "#7F8C8D", fontFamily: "'DM Mono', monospace", margin: "0 0 4px", textTransform: "uppercase" }}>Exit Criteria</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: passCount === 7 ? "#27AE60" : "#E67E22", fontFamily: "'DM Mono', monospace", margin: 0 }}>{passCount}/7</p>
            </div>
            <div style={{ padding: 14, background: "#F8F9FA", borderRadius: 10, textAlign: "center" }}>
              <p style={{ fontSize: 10, color: "#7F8C8D", fontFamily: "'DM Mono', monospace", margin: "0 0 4px", textTransform: "uppercase" }}>Forces Net</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: adoptionLikely ? "#27AE60" : "#E74C3C", fontFamily: "'DM Mono', monospace", margin: 0 }}>{driveScore - resistScore > 0 ? "+" : ""}{driveScore - resistScore}</p>
            </div>
            <div style={{ padding: 14, background: "#F8F9FA", borderRadius: 10, textAlign: "center" }}>
              <p style={{ fontSize: 10, color: "#7F8C8D", fontFamily: "'DM Mono', monospace", margin: "0 0 4px", textTransform: "uppercase" }}>Invalidations</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#2C3E50", fontFamily: "'DM Mono', monospace", margin: 0 }}>{invalidations.filter(v => v.survived === "survived").length}/{invalidations.length}</p>
            </div>
          </div>

          <textarea value={decisionNotes} onChange={e => setDecisionNotes(e.target.value)}
            placeholder="Your rationale for this decision (required)..."
            rows={4} style={{ width: "100%", border: "1px solid #E8EAED", borderRadius: 10, padding: "12px 14px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", resize: "vertical", outline: "none", background: "#FDFEFE", boxSizing: "border-box", marginBottom: 16, lineHeight: 1.5 }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { key: "go", label: "GO", desc: "Problem is validated. Move to Stage 1.", color: "#27AE60", icon: "🟢" },
              { key: "pivot", label: "PIVOT", desc: "Redefine the problem. Re-run Stage 0.", color: "#E67E22", icon: "🟡" },
              { key: "kill", label: "KILL", desc: "Problem is not worth solving. Archive.", color: "#E74C3C", icon: "🔴" },
            ].map(d => (
              <button key={d.key} onClick={() => decisionNotes.trim() ? setShowConfirm(d.key) : setToast("Add your rationale first")}
                style={{
                  padding: "20px 16px", borderRadius: 12, cursor: "pointer", transition: "all 0.2s",
                  background: decision === d.key ? d.color : "#FDFEFE",
                  border: decision === d.key ? `2px solid ${d.color}` : "1px solid #E8EAED",
                  color: decision === d.key ? "#fff" : "#2C3E50", textAlign: "center",
                }}
                onMouseEnter={e => { if (decision !== d.key) { e.currentTarget.style.borderColor = d.color; e.currentTarget.style.transform = "translateY(-2px)"; } }}
                onMouseLeave={e => { if (decision !== d.key) { e.currentTarget.style.borderColor = "#E8EAED"; e.currentTarget.style.transform = "translateY(0)"; } }}
              >
                <span style={{ fontSize: 24, display: "block", marginBottom: 6 }}>{d.icon}</span>
                <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "'DM Mono', monospace", display: "block" }}>{d.label}</span>
                <span style={{ fontSize: 11, display: "block", marginTop: 4, opacity: 0.8 }}>{d.desc}</span>
              </button>
            ))}
          </div>

          {/* Confirmation modal */}
          {showConfirm && (
            <div style={{ marginTop: 16, padding: "16px 20px", background: "#FEF9E7", borderRadius: 12, border: "2px solid #F1C40F" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#7D6608", margin: "0 0 8px 0" }}>Confirm: Mark Stage 0 as {showConfirm.toUpperCase()}?</p>
              <p style={{ fontSize: 12, color: "#7D6608", margin: "0 0 12px 0" }}>This will record your decision. You can change it later.</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => confirmDecision(showConfirm)} style={{ padding: "10px 24px", background: showConfirm === "go" ? "#27AE60" : showConfirm === "pivot" ? "#E67E22" : "#E74C3C", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", minHeight: 44 }}>
                  Confirm {showConfirm.toUpperCase()}
                </button>
                <button onClick={() => setShowConfirm(null)} style={{ padding: "10px 20px", background: "none", border: "1px solid #D5D8DC", borderRadius: 8, fontSize: 13, cursor: "pointer", minHeight: 44, color: "#5D6D7E" }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 20, padding: "14px 18px", background: "#F8F9FA", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: passCount === 7 ? "#27AE60" : "#7F8C8D" }}>{passCount}/7 criteria</span>
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: adoptionLikely ? "#27AE60" : "#E74C3C" }}>Forces: {adoptionLikely ? "+" : ""}{driveScore - resistScore}</span>
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>{invalidations.length} invalidations</span>
        </div>
        <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#1B9C85" }}>Auto-saved ✓</span>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
