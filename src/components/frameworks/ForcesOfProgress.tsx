// ForcesOfProgress.tsx — Ported from Level 1 ForcesOfProgress.jsx
'use client';
import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "dk-stage0-forces";

const FORCES = [
  { key: "push", label: "Push", subtitle: "Pain of Current Situation", color: "#E74C3C", bg: "#FDEDEC", icon: "💥", side: "drive", prompt: "What's painful enough to make them want to change? Current frustrations, inefficiencies, costs." },
  { key: "pull", label: "Pull", subtitle: "Attraction of New Solution", color: "#27AE60", bg: "#EAFAF1", icon: "🧲", side: "drive", prompt: "What makes the new solution attractive? Benefits, outcomes, aspirations that draw them forward." },
  { key: "anxiety", label: "Anxiety", subtitle: "Fear of Switching", color: "#E67E22", bg: "#FEF5E7", icon: "😰", side: "resist", prompt: "What scares them about switching? Learning curves, migration risk, uncertainty, social proof gaps." },
  { key: "habit", label: "Habit", subtitle: "Comfort with Status Quo", color: "#8E44AD", bg: "#F5EEF8", icon: "🔁", side: "resist", prompt: "What keeps them using the current solution? Familiarity, sunk costs, switching costs, inertia." },
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
  push: { score: 3, evidence: [] },
  pull: { score: 3, evidence: [] },
  anxiety: { score: 3, evidence: [] },
  habit: { score: 3, evidence: [] },
  title: "Forces of Progress",
  context: "",
};

export default function ForcesOfProgress() {
  const saved = loadSaved();
  const init = saved || DEFAULT_STATE;
  const mobile = useIsMobile();

  const [forces, setForces] = useState({
    push: init.push, pull: init.pull, anxiety: init.anxiety, habit: init.habit,
  });
  const [title, setTitle] = useState(init.title);
  const [context, setContext] = useState(init.context);
  const [toast, setToast] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const fileRef = useRef(null);

  const setForceScore = (key, score) => setForces(prev => ({ ...prev, [key]: { ...prev[key], score } }));
  const setForceEvidence = (key, evidence) => setForces(prev => ({ ...prev, [key]: { ...prev[key], evidence } }));
  const addEvidence = (key) => setForceEvidence(key, [...forces[key].evidence, { id: Date.now(), text: "" }]);
  const updateEvidence = (key, i, text) => setForceEvidence(key, forces[key].evidence.map((e, j) => j === i ? { ...e, text } : e));
  const removeEvidence = (key, i) => setForceEvidence(key, forces[key].evidence.filter((_, j) => j !== i));

  const currentState = { ...forces, title, context };
  useAutoSave(currentState);

  // Net assessment
  const driveScore = forces.push.score + forces.pull.score;
  const resistScore = forces.anxiety.score + forces.habit.score;
  const netScore = driveScore - resistScore;
  const adoptionLikely = netScore > 0;

  const importJSON = useCallback((json) => {
    try {
      const data = typeof json === "string" ? JSON.parse(json) : json;
      const results = data.results_payload || data;
      const fp = results.forces_of_progress;
      if (!fp) { setToast("No forces_of_progress data found"); return; }
      FORCES.forEach(f => {
        if (fp[f.key]) {
          const d = fp[f.key];
          setForces(prev => ({
            ...prev,
            [f.key]: {
              score: d.score || prev[f.key].score,
              evidence: (d.evidence || []).map((e, i) => ({
                id: Date.now() + i + Math.random(),
                text: typeof e === "string" ? e : e.text || "",
              })),
            }
          }));
        }
      });
      setToast("Forces populated from Manus"); setShowImport(false); setImportText("");
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
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
      .force{padding:18px;border-radius:12px;border:2px solid}
      h1{font-size:24px;color:#1B4F72;margin:0 0 4px} h3{margin:0 0 8px}
      @media print{body{padding:20px}}</style></head><body>
      <p style="font-size:11px;color:#1B9C85;font-family:'DM Mono',monospace;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">Product Development Agentic OS · Stage 0</p>
      <h1>${title}</h1>
      ${context ? `<p style="font-size:13px;color:#5D6D7E;margin-top:8px">${context}</p>` : ""}
      <p style="font-size:11px;color:#95A5A6;margin:8px 0 20px">Generated ${new Date().toLocaleDateString()}</p>
      <div style="text-align:center;padding:16px;background:${adoptionLikely ? "#EAFAF1" : "#FDEDEC"};border-radius:12px;margin-bottom:20px;border:2px solid ${adoptionLikely ? "#27AE6040" : "#E74C3C40"}">
        <p style="font-size:18px;font-weight:800;color:${adoptionLikely ? "#1B9C85" : "#E74C3C"};margin:0;font-family:'DM Mono',monospace">
          ${adoptionLikely ? "ADOPTION LIKELY" : "ADOPTION AT RISK"} · Net: ${netScore > 0 ? "+" : ""}${netScore}
        </p>
        <p style="font-size:12px;color:#7F8C8D;margin:6px 0 0">Drive (Push ${forces.push.score} + Pull ${forces.pull.score} = ${driveScore}) vs Resist (Anxiety ${forces.anxiety.score} + Habit ${forces.habit.score} = ${resistScore})</p>
      </div>
      <div class="grid">
        ${FORCES.map(f => `<div class="force" style="background:${f.bg};border-color:${f.color}30">
          <h3 style="color:${f.color};font-size:14px">${f.icon} ${f.label}: ${forces[f.key].score}/5</h3>
          ${forces[f.key].evidence.map(e => `<p style="font-size:12px;color:#2C3E50;margin:4px 0">• ${e.text || "(empty)"}</p>`).join("") || '<p style="color:#95A5A6;font-style:italic">No evidence</p>'}
        </div>`).join("")}
      </div>
      <p style="font-size:10px;color:#BDC3C7;text-align:center;margin-top:30px">Product Development Agentic OS · Forces of Progress</p>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  const clearAll = () => {
    setForces(DEFAULT_STATE); setTitle("Forces of Progress"); setContext("");
    window.localStorage.removeItem(STORAGE_KEY); setToast("Forces cleared");
  };

  const saveSession = () => {
    const blob = new Blob([JSON.stringify(currentState, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `forces-of-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url); setToast("Forces saved to file");
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: mobile ? "16px 14px" : "32px 24px", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      <a onClick={() => window.location.href = "/stage/0"} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#2980B9", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, marginBottom: 16, textDecoration: "none", minHeight: 44 }}>
        ← Back To Stage 0
      </a>

      <div style={{ marginBottom: 20, borderBottom: "3px solid #E67E22", paddingBottom: 16 }}>
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

      {/* Net Assessment Bar */}
      <div style={{
        padding: "16px 20px", borderRadius: 12, marginBottom: 20, textAlign: "center",
        background: adoptionLikely ? "#EAFAF1" : "#FDEDEC",
        border: `2px solid ${adoptionLikely ? "#27AE6040" : "#E74C3C40"}`,
      }}>
        <p style={{ fontSize: 18, fontWeight: 800, color: adoptionLikely ? "#1B9C85" : "#E74C3C", margin: "0 0 6px 0", fontFamily: "'DM Mono', monospace" }}>
          {adoptionLikely ? "ADOPTION LIKELY" : "ADOPTION AT RISK"} · Net: {netScore > 0 ? "+" : ""}{netScore}
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "#27AE60", fontFamily: "'DM Sans', sans-serif" }}>
            Drive: Push ({forces.push.score}) + Pull ({forces.pull.score}) = <strong>{driveScore}</strong>
          </span>
          <span style={{ fontSize: 13, color: "#7F8C8D" }}>vs</span>
          <span style={{ fontSize: 13, color: "#E74C3C", fontFamily: "'DM Sans', sans-serif" }}>
            Resist: Anxiety ({forces.anxiety.score}) + Habit ({forces.habit.score}) = <strong>{resistScore}</strong>
          </span>
        </div>
        {/* Visual bar */}
        <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginTop: 10, maxWidth: 400, margin: "10px auto 0" }}>
          <div style={{ width: `${(driveScore / 10) * 100}%`, background: "#27AE60", transition: "width 0.5s" }} />
          <div style={{ width: `${(resistScore / 10) * 100}%`, background: "#E74C3C", transition: "width 0.5s" }} />
        </div>
      </div>

      {/* Force cards */}
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? 14 : 18 }}>
        {FORCES.map(force => {
          const data = forces[force.key];
          return (
            <div key={force.key} style={{ background: force.bg, borderRadius: 14, padding: mobile ? 14 : 18, border: `2px solid ${force.color}25`, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 20 }}>{force.icon}</span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: force.color, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{force.label}</h3>
                  <p style={{ fontSize: 10, color: "#7F8C8D", margin: 0, fontFamily: "'DM Mono', monospace" }}>{force.subtitle}</p>
                </div>
                <span style={{ marginLeft: "auto", fontSize: 11, fontFamily: "'DM Mono', monospace", color: force.side === "drive" ? "#27AE60" : "#E74C3C", fontWeight: 600 }}>
                  {force.side === "drive" ? "DRIVES →" : "← RESISTS"}
                </span>
              </div>
              <p style={{ fontSize: 11, color: "#7F8C8D", margin: "6px 0 10px 0", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3 }}>{force.prompt}</p>

              {/* Score slider */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <input type="range" min={1} max={5} value={data.score} onChange={e => setForceScore(force.key, Number(e.target.value))}
                  style={{ flex: 1, accentColor: force.color, cursor: "pointer", height: 24 }} />
                <span style={{ fontSize: 18, fontWeight: 800, color: force.color, fontFamily: "'DM Mono', monospace", minWidth: 28, textAlign: "center" }}>{data.score}</span>
              </div>

              {/* Evidence items */}
              {data.evidence.map((ev, i) => (
                <div key={ev.id} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 10, color: force.color, marginTop: 4 }}>•</span>
                  <input value={ev.text} onChange={e => updateEvidence(force.key, i, e.target.value)}
                    placeholder="Evidence..."
                    style={{ flex: 1, border: "none", outline: "none", fontSize: 12, color: "#2C3E50", background: "transparent", padding: 0, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }} />
                  <button onClick={() => removeEvidence(force.key, i)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#C0392B", padding: "0 2px" }}>×</button>
                </div>
              ))}
              <button onClick={() => addEvidence(force.key)} style={{
                marginTop: 6, padding: "8px 12px", background: "#fff", border: `1px dashed ${force.color}50`, borderRadius: 6,
                fontSize: 11, color: force.color, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, width: "100%", minHeight: 36,
              }}>
                + Add Evidence
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 20, padding: "14px 18px", background: "#F8F9FA", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 12 }}>
          {FORCES.map(f => (
            <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: f.color }} />
              <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>{f.label} {forces[f.key].score}</span>
            </div>
          ))}
        </div>
        <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#1B9C85" }}>Auto-saved ✓</span>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
