// MomTestSynthesizer.tsx — Ported from Level 1 MomTestSynthesizer.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "dk-stage0-momtest";

const COMMITMENT_LEVELS = [
  { level: 1, label: "L1 · Compliment", color: "#E74C3C", desc: "They said nice things but committed nothing" },
  { level: 2, label: "L2 · Time", color: "#E67E22", desc: "Gave you their time (agreed to another meeting)" },
  { level: 3, label: "L3 · Reputation", color: "#F1C40F", desc: "Introduced you to others / made a referral" },
  { level: 4, label: "L4 · Money", color: "#27AE60", desc: "Put money down — LOI, pre-order, deposit" },
  { level: 5, label: "L5 · Pre-paid", color: "#1B9C85", desc: "Actually paid for something that doesn't exist yet" },
];

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

const DEFAULT_STATE = {
  painPoints: [],
  workarounds: [],
  interviewees: [],
  contradictions: [],
  title: "Mom Test Synthesizer",
  context: "",
};

export default function MomTestSynthesizer() {
  const saved = loadSaved();
  const init = saved || DEFAULT_STATE;
  const mobile = useIsMobile();

  const [painPoints, setPainPoints] = useState(init.painPoints);
  const [workarounds, setWorkarounds] = useState(init.workarounds);
  const [interviewees, setInterviewees] = useState(init.interviewees);
  const [contradictions, setContradictions] = useState(init.contradictions);
  const [title, setTitle] = useState(init.title);
  const [context, setContext] = useState(init.context);
  const [toast, setToast] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [activeTab, setActiveTab] = useState("pains");
  const fileRef = useRef(null);

  const currentState = { painPoints, workarounds, interviewees, contradictions, title, context };
  useAutoSave(currentState);

  // Pain points
  const addPain = () => setPainPoints([...painPoints, { id: Date.now(), pain: "", frequency: 1, severity: 5, quotes: "" }]);
  const updatePain = (i, u) => setPainPoints(painPoints.map((p, j) => j === i ? u : p));
  const removePain = (i) => setPainPoints(painPoints.filter((_, j) => j !== i));

  // Workarounds
  const addWorkaround = () => setWorkarounds([...workarounds, { id: Date.now(), description: "", time_cost: "", money_cost: "" }]);
  const updateWorkaround = (i, u) => setWorkarounds(workarounds.map((w, j) => j === i ? u : w));
  const removeWorkaround = (i) => setWorkarounds(workarounds.filter((_, j) => j !== i));

  // Interviewees
  const addInterviewee = () => setInterviewees([...interviewees, { id: Date.now(), label: `P${interviewees.length + 1}`, commitment: 1, notes: "" }]);
  const updateInterviewee = (i, u) => setInterviewees(interviewees.map((iv, j) => j === i ? u : iv));
  const removeInterviewee = (i) => setInterviewees(interviewees.filter((_, j) => j !== i));

  // Contradictions
  const addContradiction = () => setContradictions([...contradictions, { id: Date.now(), text: "" }]);

  // Signal strength
  const l4plus = interviewees.filter(i => i.commitment >= 4).length;
  const totalInterviews = interviewees.length;
  const signalStrength = totalInterviews > 0 ? Math.round((l4plus / totalInterviews) * 100) : 0;

  const importJSON = useCallback((json) => {
    try {
      const data = typeof json === "string" ? JSON.parse(json) : json;
      const results = data.results_payload || data;
      const is = results.interview_synthesis;
      if (!is) { setToast("No interview_synthesis data found"); return; }
      if (is.pain_points) setPainPoints(is.pain_points.map((p, i) => ({
        id: Date.now() + i, pain: p.pain || p.text || "", frequency: p.frequency || 1, severity: p.severity || 5, quotes: p.quotes || ""
      })));
      if (is.workarounds) setWorkarounds(is.workarounds.map((w, i) => ({
        id: Date.now() + i + 100, description: typeof w === "string" ? w : w.description || "", time_cost: w.time_cost || "", money_cost: w.money_cost || ""
      })));
      if (is.interviewees) setInterviewees(is.interviewees.map((iv, i) => ({
        id: Date.now() + i + 200, label: iv.label || `P${i + 1}`, commitment: iv.commitment || 1, notes: iv.notes || ""
      })));
      if (is.contradictions) setContradictions(is.contradictions.map((c, i) => ({
        id: Date.now() + i + 300, text: typeof c === "string" ? c : c.text || ""
      })));
      setToast("Mom Test data populated from Manus"); setShowImport(false); setImportText("");
    } catch (e) { setToast("Invalid JSON format"); }
  }, []);

  const handleFileImport = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => importJSON(ev.target.result);
    reader.readAsText(file); e.target.value = "";
  };

  const exportPDF = () => {
    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono&display=swap" rel="stylesheet">
      <style>body{font-family:'DM Sans',sans-serif;max-width:900px;margin:0 auto;padding:40px 24px}
      table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:20px}
      th{background:#1B4F72;color:#fff;padding:10px 12px;text-align:left;font-weight:600;font-size:12px}
      td{padding:8px 12px;border-bottom:1px solid #E8EAED}
      h1{font-size:24px;color:#1B4F72;margin:0 0 4px} h2{font-size:16px;color:#1B4F72;margin:20px 0 10px}
      @media print{body{padding:20px}}</style></head><body>
      <p style="font-size:11px;color:#1B9C85;font-family:'DM Mono',monospace;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">Product Development Agentic OS · Stage 0</p>
      <h1>${title}</h1>
      ${context ? `<p style="font-size:13px;color:#5D6D7E;margin-top:8px">${context}</p>` : ""}
      <p style="font-size:11px;color:#95A5A6;margin:8px 0 20px">Generated ${new Date().toLocaleDateString()} · ${totalInterviews} interviews · Signal: ${signalStrength}% L4+</p>
      <h2>Pain Points (${painPoints.length})</h2>
      <table><thead><tr><th>Pain</th><th>Freq</th><th>Severity</th><th>Quotes</th></tr></thead><tbody>
      ${painPoints.sort((a, b) => b.severity - a.severity).map(p => `<tr><td style="font-weight:600">${p.pain}</td><td>${p.frequency}×</td><td>${p.severity}/10</td><td style="font-size:11px;color:#7F8C8D">${p.quotes || "—"}</td></tr>`).join("")}
      </tbody></table>
      <h2>Commitment Ladder (${totalInterviews} interviewees)</h2>
      <table><thead><tr><th>ID</th><th>Level</th><th>Notes</th></tr></thead><tbody>
      ${interviewees.map(iv => { const cl = COMMITMENT_LEVELS.find(c => c.level === iv.commitment); return `<tr><td>${iv.label}</td><td style="color:${cl?.color}">${cl?.label || iv.commitment}</td><td style="font-size:11px;color:#7F8C8D">${iv.notes || "—"}</td></tr>`; }).join("")}
      </tbody></table>
      <h2>Workarounds (${workarounds.length})</h2>
      ${workarounds.map(w => `<p style="margin:4px 0"><strong>${w.description}</strong> ${w.time_cost ? `· Time: ${w.time_cost}` : ""} ${w.money_cost ? `· Cost: ${w.money_cost}` : ""}</p>`).join("")}
      ${contradictions.length ? `<h2>Contradictions (${contradictions.length})</h2>${contradictions.map(c => `<p style="margin:4px 0;color:#C0392B">⚠ ${c.text}</p>`).join("")}` : ""}
      <p style="font-size:10px;color:#BDC3C7;text-align:center;margin-top:30px">Product Development Agentic OS · Mom Test Synthesizer</p>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  const clearAll = () => {
    setPainPoints([]); setWorkarounds([]); setInterviewees([]); setContradictions([]);
    setTitle("Mom Test Synthesizer"); setContext("");
    window.localStorage.removeItem(STORAGE_KEY); setToast("Synthesizer cleared");
  };

  const saveSession = () => {
    const blob = new Blob([JSON.stringify(currentState, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `momtest-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url); setToast("Synthesizer saved to file");
  };

  const tabs = [
    { key: "pains", label: "Pain Points", count: painPoints.length, color: "#E74C3C" },
    { key: "ladder", label: "Commitment Ladder", count: interviewees.length, color: "#27AE60" },
    { key: "workarounds", label: "Workarounds", count: workarounds.length, color: "#E67E22" },
    { key: "contradictions", label: "Contradictions", count: contradictions.length, color: "#C0392B" },
  ];

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: mobile ? "16px 14px" : "32px 24px", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      <a onClick={() => window.location.href = "/stage/0"} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#2980B9", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, marginBottom: 16, textDecoration: "none", minHeight: 44 }}>
        ← Back To Stage 0
      </a>

      <div style={{ marginBottom: 20, borderBottom: "3px solid #27AE60", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#1B9C85", fontWeight: 500, letterSpacing: "0.15em", marginBottom: 4, textTransform: "uppercase" }}>Stage 0 · Framework V2</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <input value={title} onChange={e => setTitle(e.target.value)}
              style={{ fontSize: mobile ? 22 : 28, fontFamily: "'Playfair Display', serif", fontWeight: 800, color: "#1B4F72", border: "none", outline: "none", background: "transparent", width: "100%", padding: 0 }} />
            <input value={context} onChange={e => setContext(e.target.value)} placeholder="Add context..."
              style={{ fontSize: 13, color: "#5D6D7E", border: "none", outline: "none", background: "transparent", width: "100%", padding: 0, marginTop: 4 }} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button onClick={() => setShowImport(!showImport)} style={{ padding: "8px 14px", background: "#2980B9", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>📥 Import</button>
            <button onClick={saveSession} style={{ padding: "8px 14px", background: "#1B4F72", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>💾 Save</button>
            <button onClick={exportPDF} style={{ padding: "8px 14px", background: "#27AE60", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>📄 PDF</button>
            <button onClick={clearAll} style={{ padding: "8px 14px", background: "none", color: "#C0392B", border: "1px solid #E8EAED", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>🗑</button>
          </div>
        </div>
      </div>

      {showImport && (
        <div style={{ marginBottom: 20, padding: 18, background: "#EBF5FB", borderRadius: 12, border: "1px solid #AED6F1" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1B4F72", margin: "0 0 8px 0" }}>Import From Manus Results</p>
          <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder='Paste Manus results JSON...'
            rows={4} style={{ width: "100%", padding: "10px 12px", border: "1px solid #AED6F1", borderRadius: 8, fontSize: 12, fontFamily: "'DM Mono', monospace", resize: "vertical", outline: "none", background: "#fff", boxSizing: "border-box", marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => importJSON(importText)} disabled={!importText.trim()} style={{ padding: "10px 20px", background: importText.trim() ? "#2980B9" : "#D5D8DC", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: importText.trim() ? "pointer" : "not-allowed", minHeight: 44 }}>Import</button>
            <button onClick={() => fileRef.current?.click()} style={{ padding: "10px 20px", background: "#1B4F72", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>Upload .json</button>
            <button onClick={() => { setShowImport(false); setImportText(""); }} style={{ padding: "10px 20px", background: "none", color: "#5D6D7E", border: "1px solid #D5D8DC", borderRadius: 8, fontSize: 13, cursor: "pointer", minHeight: 44 }}>Cancel</button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleFileImport} style={{ display: "none" }} />
          </div>
        </div>
      )}

      {/* Signal strength bar */}
      <div style={{ padding: "12px 18px", background: signalStrength >= 50 ? "#EAFAF1" : "#FEF5E7", borderRadius: 10, border: `1px solid ${signalStrength >= 50 ? "#27AE6030" : "#E67E2230"}`, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: signalStrength >= 50 ? "#1B9C85" : "#E67E22", fontFamily: "'DM Sans', sans-serif" }}>Signal Strength: {signalStrength}% L4+</span>
          <span style={{ fontSize: 11, color: "#7F8C8D", marginLeft: 8 }}>({l4plus}/{totalInterviews} interviewees at L4 or higher)</span>
        </div>
        <div style={{ width: 120, height: 6, background: "#E8EAED", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${signalStrength}%`, height: "100%", background: signalStrength >= 50 ? "#1B9C85" : "#E67E22", borderRadius: 3, transition: "width 0.5s" }} />
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: "10px 16px", borderRadius: 22, fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            cursor: "pointer", border: "none", whiteSpace: "nowrap", minHeight: 44, transition: "all 0.2s",
            background: activeTab === t.key ? t.color : "#F2F3F4",
            color: activeTab === t.key ? "#fff" : "#7F8C8D",
            boxShadow: activeTab === t.key ? `0 2px 8px ${t.color}40` : "none",
          }}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Pain Points Tab */}
      {activeTab === "pains" && (
        <div style={{ background: "#FDFEFE", border: "1px solid #E8EAED", borderRadius: 14, overflow: "hidden" }}>
          {painPoints.sort((a, b) => b.severity - a.severity).map((p, i) => (
            <div key={p.id} style={{ padding: "14px 18px", borderBottom: "1px solid #F2F3F4", display: "flex", gap: 12, alignItems: "flex-start", flexWrap: mobile ? "wrap" : "nowrap" }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <input value={p.pain} onChange={e => updatePain(i, { ...p, pain: e.target.value })} placeholder="Pain point..."
                  style={{ width: "100%", border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "#2C3E50", background: "transparent", padding: 0, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }} />
                <input value={p.quotes || ""} onChange={e => updatePain(i, { ...p, quotes: e.target.value })} placeholder="Direct quotes..."
                  style={{ width: "100%", border: "none", outline: "none", fontSize: 12, color: "#95A5A6", background: "transparent", padding: 0, fontFamily: "'DM Sans', sans-serif", fontStyle: "italic" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <div style={{ textAlign: "center" }}>
                  <label style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#95A5A6", display: "block" }}>FREQ</label>
                  <input type="number" min={1} max={99} value={p.frequency} onChange={e => updatePain(i, { ...p, frequency: Number(e.target.value) || 1 })}
                    style={{ width: 40, textAlign: "center", border: "1px solid #E8EAED", borderRadius: 6, padding: "4px", fontSize: 13, fontFamily: "'DM Mono', monospace", fontWeight: 700, outline: "none" }} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <label style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#95A5A6", display: "block" }}>SEV</label>
                  <input type="number" min={1} max={10} value={p.severity} onChange={e => updatePain(i, { ...p, severity: Number(e.target.value) || 1 })}
                    style={{ width: 40, textAlign: "center", border: "1px solid #E8EAED", borderRadius: 6, padding: "4px", fontSize: 13, fontFamily: "'DM Mono', monospace", fontWeight: 700, color: p.severity >= 8 ? "#E74C3C" : p.severity >= 5 ? "#E67E22" : "#95A5A6", outline: "none" }} />
                </div>
              </div>
              <button onClick={() => removePain(i)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#E74C3C", padding: "4px", minWidth: 28, minHeight: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
          ))}
          <button onClick={addPain} style={{ width: "100%", padding: "14px", background: "#FAFBFC", border: "none", borderTop: painPoints.length ? "1px solid #F2F3F4" : "none", fontSize: 13, color: "#E74C3C", cursor: "pointer", fontWeight: 600, minHeight: 48 }}>+ Add Pain Point</button>
        </div>
      )}

      {/* Commitment Ladder Tab */}
      {activeTab === "ladder" && (
        <div style={{ background: "#FDFEFE", border: "1px solid #E8EAED", borderRadius: 14, overflow: "hidden" }}>
          {interviewees.map((iv, i) => {
            const cl = COMMITMENT_LEVELS.find(c => c.level === iv.commitment) || COMMITMENT_LEVELS[0];
            return (
              <div key={iv.id} style={{ padding: "14px 18px", borderBottom: "1px solid #F2F3F4", display: "flex", gap: 12, alignItems: "center", flexWrap: mobile ? "wrap" : "nowrap" }}>
                <input value={iv.label} onChange={e => updateInterviewee(i, { ...iv, label: e.target.value })} placeholder="P1"
                  style={{ width: 50, border: "none", outline: "none", fontSize: 14, fontWeight: 700, color: "#1B4F72", background: "transparent", padding: 0, fontFamily: "'DM Mono', monospace", textAlign: "center" }} />
                <select value={iv.commitment} onChange={e => updateInterviewee(i, { ...iv, commitment: Number(e.target.value) })}
                  style={{ padding: "8px 10px", border: `1px solid ${cl.color}30`, borderRadius: 8, fontSize: 12, fontWeight: 600, background: `${cl.color}10`, color: cl.color, minHeight: 36, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  {COMMITMENT_LEVELS.map(c => <option key={c.level} value={c.level}>{c.label}</option>)}
                </select>
                <input value={iv.notes || ""} onChange={e => updateInterviewee(i, { ...iv, notes: e.target.value })} placeholder="Notes..."
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 12, color: "#7F8C8D", background: "transparent", padding: 0, fontFamily: "'DM Sans', sans-serif", minWidth: 100 }} />
                <button onClick={() => removeInterviewee(i)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#E74C3C", padding: "4px", minWidth: 28, minHeight: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              </div>
            );
          })}
          <button onClick={addInterviewee} style={{ width: "100%", padding: "14px", background: "#FAFBFC", border: "none", borderTop: interviewees.length ? "1px solid #F2F3F4" : "none", fontSize: 13, color: "#27AE60", cursor: "pointer", fontWeight: 600, minHeight: 48 }}>+ Add Interviewee</button>
        </div>
      )}

      {/* Workarounds Tab */}
      {activeTab === "workarounds" && (
        <div style={{ background: "#FDFEFE", border: "1px solid #E8EAED", borderRadius: 14, overflow: "hidden" }}>
          {workarounds.map((w, i) => (
            <div key={w.id} style={{ padding: "14px 18px", borderBottom: "1px solid #F2F3F4", display: "flex", gap: 12, alignItems: "flex-start", flexWrap: mobile ? "wrap" : "nowrap" }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <input value={w.description} onChange={e => updateWorkaround(i, { ...w, description: e.target.value })} placeholder="Current workaround..."
                  style={{ width: "100%", border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "#2C3E50", background: "transparent", padding: 0, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }} />
                <div style={{ display: "flex", gap: 12 }}>
                  <input value={w.time_cost || ""} onChange={e => updateWorkaround(i, { ...w, time_cost: e.target.value })} placeholder="Time cost..."
                    style={{ flex: 1, border: "none", outline: "none", fontSize: 12, color: "#95A5A6", background: "transparent", padding: 0, fontFamily: "'DM Sans', sans-serif" }} />
                  <input value={w.money_cost || ""} onChange={e => updateWorkaround(i, { ...w, money_cost: e.target.value })} placeholder="Money cost..."
                    style={{ flex: 1, border: "none", outline: "none", fontSize: 12, color: "#95A5A6", background: "transparent", padding: 0, fontFamily: "'DM Sans', sans-serif" }} />
                </div>
              </div>
              <button onClick={() => removeWorkaround(i)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#E74C3C", padding: "4px", minWidth: 28, minHeight: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
          ))}
          <button onClick={addWorkaround} style={{ width: "100%", padding: "14px", background: "#FAFBFC", border: "none", borderTop: workarounds.length ? "1px solid #F2F3F4" : "none", fontSize: 13, color: "#E67E22", cursor: "pointer", fontWeight: 600, minHeight: 48 }}>+ Add Workaround</button>
        </div>
      )}

      {/* Contradictions Tab */}
      {activeTab === "contradictions" && (
        <div style={{ background: "#FDFEFE", border: "1px solid #E8EAED", borderRadius: 14, overflow: "hidden" }}>
          {contradictions.map((c, i) => (
            <div key={c.id} style={{ padding: "14px 18px", borderBottom: "1px solid #F2F3F4", display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 14, color: "#C0392B" }}>⚠</span>
              <input value={c.text} onChange={e => setContradictions(contradictions.map((ct, j) => j === i ? { ...ct, text: e.target.value } : ct))}
                placeholder="What contradicts what? Which interviewees disagree?"
                style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: "#2C3E50", background: "transparent", padding: 0, fontFamily: "'DM Sans', sans-serif" }} />
              <button onClick={() => setContradictions(contradictions.filter((_, j) => j !== i))}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#E74C3C", padding: "4px", minWidth: 28, minHeight: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
          ))}
          <button onClick={addContradiction} style={{ width: "100%", padding: "14px", background: "#FAFBFC", border: "none", borderTop: contradictions.length ? "1px solid #F2F3F4" : "none", fontSize: 13, color: "#C0392B", cursor: "pointer", fontWeight: 600, minHeight: 48 }}>+ Add Contradiction</button>
        </div>
      )}

      <div style={{ marginTop: 20, padding: "14px 18px", background: "#F8F9FA", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 12 }}>
          {tabs.map(t => (
            <div key={t.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color }} />
              <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>{t.count}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#1B9C85" }}>Auto-saved ✓</span>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
