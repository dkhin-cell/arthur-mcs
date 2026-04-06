// CompetitiveMatrix.tsx — Ported from Level 1 CompetitiveMatrix.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "dk-stage0-competitive";
const INPUT_STORAGE_KEY = "dk-stage0-session";

const DEFAULT_DIMENSIONS = [
  { key: "price", label: "Price" },
  { key: "features", label: "Features" },
  { key: "ux", label: "UX" },
  { key: "market_share", label: "Market Share" },
  { key: "innovation", label: "Innovation" },
  { key: "trust", label: "Trust" },
];

const SCORE_COLORS = {
  1: { bg: "#FDEDEC", text: "#C0392B", label: "Weak" },
  2: { bg: "#FEF5E7", text: "#E67E22", label: "Below Avg" },
  3: { bg: "#FEF9E7", text: "#B7950B", label: "Average" },
  4: { bg: "#EAFAF1", text: "#27AE60", label: "Strong" },
  5: { bg: "#D5F5E3", text: "#1B9C85", label: "Leader" },
};

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

// Pull competitor names from Input Panel localStorage
function getInputPanelCompetitors() {
  try {
    const raw = window.localStorage.getItem(INPUT_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return (data.competitors || []).filter(c => c.name && c.name.trim()).map(c => c.name.trim());
    }
  } catch (e) {}
  return [];
}

function ScoreCell({ score, onChange, mobile }) {
  const config = SCORE_COLORS[score] || SCORE_COLORS[3];
  return (
    <div style={{ position: "relative" }}>
      <select
        value={score}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: "100%", padding: mobile ? "8px 4px" : "10px 8px",
          background: config.bg, color: config.text, fontWeight: 700,
          border: `1px solid ${config.text}30`, borderRadius: 8,
          fontSize: mobile ? 14 : 15, fontFamily: "'DM Mono', monospace",
          textAlign: "center", cursor: "pointer", appearance: "none",
          WebkitAppearance: "none", MozAppearance: "none",
          minHeight: 40,
        }}
      >
        {[1, 2, 3, 4, 5].map(v => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>
    </div>
  );
}

function GapIndicator({ scores, dimensions }) {
  // Find dimensions where "Your Product" scores highest vs lowest spread
  if (scores.length < 2) return null;
  const gaps = [];
  dimensions.forEach((dim, di) => {
    const vals = scores.map(s => s[di]);
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    if (max - min >= 2) {
      gaps.push({ dim: dim.label, spread: max - min, max, min });
    }
  });
  if (!gaps.length) return null;
  gaps.sort((a, b) => b.spread - a.spread);

  return (
    <div style={{ marginTop: 20, padding: "14px 18px", background: "#EBF5FB", borderRadius: 10, border: "1px solid #AED6F1" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>🎯</span>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#1B4F72", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Positioning Gaps Detected</p>
      </div>
      {gaps.slice(0, 5).map((g, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: g.spread >= 3 ? "#E74C3C" : "#E67E22", flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "#2C3E50", fontFamily: "'DM Sans', sans-serif" }}>
            <strong>{g.dim}</strong>: {g.spread}-point spread (range {g.min}–{g.max})
          </span>
        </div>
      ))}
      <p style={{ fontSize: 11, color: "#5D6D7E", margin: "8px 0 0 0", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>
        Large spreads signal differentiation opportunities or competitive vulnerabilities.
      </p>
    </div>
  );
}

const DEFAULT_STATE = {
  competitors: ["Your Product"],
  dimensions: DEFAULT_DIMENSIONS.map(d => d.label),
  scores: {}, // key: "compIdx-dimIdx", value: 1-5
  title: "Competitive Matrix",
  context: "",
  notes: {}, // key: "compIdx-dimIdx", value: string
};

export default function CompetitiveMatrix() {
  const saved = loadSaved();
  const init = saved || DEFAULT_STATE;
  const mobile = useIsMobile();

  const [competitors, setCompetitors] = useState(init.competitors);
  const [dimensions, setDimensions] = useState(init.dimensions);
  const [scores, setScores] = useState(init.scores);
  const [notes, setNotes] = useState(init.notes || {});
  const [title, setTitle] = useState(init.title);
  const [context, setContext] = useState(init.context);
  const [toast, setToast] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [expandedCell, setExpandedCell] = useState(null); // "compIdx-dimIdx"
  const [addingCompetitor, setAddingCompetitor] = useState(false);
  const [addingDimension, setAddingDimension] = useState(false);
  const [newCompName, setNewCompName] = useState("");
  const [newDimName, setNewDimName] = useState("");
  const fileRef = useRef(null);

  const currentState = { competitors, dimensions, scores, notes, title, context };
  useAutoSave(currentState);

  // Score helpers
  const getScore = (ci, di) => scores[`${ci}-${di}`] || 3;
  const setScore = (ci, di, val) => setScores(prev => ({ ...prev, [`${ci}-${di}`]: val }));
  const getNote = (ci, di) => notes[`${ci}-${di}`] || "";
  const setNote = (ci, di, val) => setNotes(prev => ({ ...prev, [`${ci}-${di}`]: val }));

  // Computed
  const compAverages = competitors.map((_, ci) =>
    dimensions.length > 0 ? (dimensions.reduce((sum, _, di) => sum + getScore(ci, di), 0) / dimensions.length).toFixed(1) : "—"
  );
  const dimAverages = dimensions.map((_, di) =>
    competitors.length > 0 ? (competitors.reduce((sum, _, ci) => sum + getScore(ci, di), 0) / competitors.length).toFixed(1) : "—"
  );
  const allScoreArrays = competitors.map((_, ci) => dimensions.map((_, di) => getScore(ci, di)));

  // Pull from Input Panel
  const pullFromInput = () => {
    const names = getInputPanelCompetitors();
    if (!names.length) {
      setToast("No competitors found in Input Panel");
      return;
    }
    const merged = [...competitors];
    let added = 0;
    names.forEach(name => {
      if (!merged.some(c => c.toLowerCase() === name.toLowerCase())) {
        merged.push(name);
        added++;
      }
    });
    if (added) {
      setCompetitors(merged);
      setToast(`${added} competitor${added > 1 ? "s" : ""} imported from Input Panel`);
    } else {
      setToast("All competitors already present");
    }
  };

  // Add competitor
  const addCompetitor = () => {
    const name = newCompName.trim();
    if (!name) return;
    if (competitors.some(c => c.toLowerCase() === name.toLowerCase())) {
      setToast("Competitor already exists");
      return;
    }
    setCompetitors([...competitors, name]);
    setNewCompName("");
    setAddingCompetitor(false);
  };

  // Remove competitor
  const removeCompetitor = (ci) => {
    if (competitors.length <= 1) { setToast("Need at least one competitor"); return; }
    const newComps = competitors.filter((_, i) => i !== ci);
    // Rebuild scores/notes with shifted indices
    const newScores = {};
    const newNotes = {};
    newComps.forEach((_, newCi) => {
      const oldCi = newCi >= ci ? newCi + 1 : newCi;
      dimensions.forEach((_, di) => {
        const oldKey = `${oldCi}-${di}`;
        const newKey = `${newCi}-${di}`;
        if (scores[oldKey] !== undefined) newScores[newKey] = scores[oldKey];
        if (notes[oldKey]) newNotes[newKey] = notes[oldKey];
      });
    });
    setCompetitors(newComps);
    setScores(newScores);
    setNotes(newNotes);
  };

  // Add dimension
  const addDimension = () => {
    const name = newDimName.trim();
    if (!name) return;
    if (dimensions.some(d => d.toLowerCase() === name.toLowerCase())) {
      setToast("Dimension already exists");
      return;
    }
    setDimensions([...dimensions, name]);
    setNewDimName("");
    setAddingDimension(false);
  };

  // Remove dimension
  const removeDimension = (di) => {
    if (dimensions.length <= 1) { setToast("Need at least one dimension"); return; }
    const newDims = dimensions.filter((_, i) => i !== di);
    const newScores = {};
    const newNotes = {};
    competitors.forEach((_, ci) => {
      newDims.forEach((_, newDi) => {
        const oldDi = newDi >= di ? newDi + 1 : newDi;
        const oldKey = `${ci}-${oldDi}`;
        const newKey = `${ci}-${newDi}`;
        if (scores[oldKey] !== undefined) newScores[newKey] = scores[oldKey];
        if (notes[oldKey]) newNotes[newKey] = notes[oldKey];
      });
    });
    setDimensions(newDims);
    setScores(newScores);
    setNotes(newNotes);
  };

  // Import from Manus JSON
  const importJSON = useCallback((json) => {
    try {
      const data = typeof json === "string" ? JSON.parse(json) : json;
      const results = data.results_payload || data;
      const ci = results.competitive_intel;
      if (!ci || !ci.comparison_table) {
        setToast("No competitive_intel.comparison_table found in JSON");
        return;
      }
      const table = ci.comparison_table;
      // Expected shape: { competitors: [{name, scores: {dimension: score}}] }
      // or { dimensions: [...], competitors: [{name, ...dimScores}] }
      if (Array.isArray(table.competitors)) {
        const newComps = ["Your Product"];
        const newScores = {};
        const dims = table.dimensions || Object.keys(table.competitors[0]?.scores || {});
        table.competitors.forEach((comp, i) => {
          newComps.push(comp.name);
          const compScores = comp.scores || comp;
          dims.forEach((dim, di) => {
            const val = typeof compScores === "object" ? (compScores[dim] || compScores.scores?.[dim] || 3) : 3;
            newScores[`${i + 1}-${di}`] = Math.min(5, Math.max(1, Math.round(Number(val) || 3)));
          });
        });
        setCompetitors(newComps);
        setDimensions(dims.map(d => typeof d === "string" ? d : d.label || d.key || String(d)));
        setScores(newScores);
        setNotes({});
        setToast("Matrix populated from Manus research");
        setShowImport(false);
        setImportText("");
      } else {
        setToast("Unexpected comparison_table format");
      }
    } catch (e) {
      setToast("Invalid JSON format");
    }
  }, []);

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => importJSON(ev.target.result);
    reader.readAsText(file);
    e.target.value = "";
  };

  // PDF export
  const exportPDF = () => {
    const w = window.open("", "_blank");
    const scoreColor = (v) => SCORE_COLORS[v] || SCORE_COLORS[3];
    const totalCells = competitors.length * dimensions.length;
    w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono&display=swap" rel="stylesheet">
      <style>
        body{font-family:'DM Sans',sans-serif;max-width:1000px;margin:0 auto;padding:40px 24px}
        table{width:100%;border-collapse:collapse;font-size:13px}
        th{background:#1B4F72;color:#fff;padding:10px 12px;text-align:center;font-weight:600;font-size:12px}
        th:first-child{text-align:left;min-width:140px}
        td{padding:8px 12px;text-align:center;border-bottom:1px solid #E8EAED;font-family:'DM Mono',monospace;font-weight:700}
        td:first-child{text-align:left;font-family:'DM Sans',sans-serif;font-weight:600;color:#2C3E50}
        tr:last-child td{border-bottom:2px solid #1B4F72}
        h1{font-size:24px;color:#1B4F72;margin:0 0 4px} h3{margin:0 0 10px}
        @media print{body{padding:20px}}
      </style></head><body>
      <p style="font-size:11px;color:#1B9C85;font-family:'DM Mono',monospace;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">Product Development Agentic OS · Stage 0</p>
      <h1>${title}</h1>
      ${context ? `<p style="font-size:13px;color:#5D6D7E;margin-top:8px">${context}</p>` : ""}
      <p style="font-size:11px;color:#95A5A6;margin:8px 0 20px">Generated ${new Date().toLocaleDateString()} · ${competitors.length} competitors · ${dimensions.length} dimensions · ${totalCells} scores</p>
      <table>
        <thead><tr>
          <th>Competitor</th>
          ${dimensions.map(d => `<th>${d}</th>`).join("")}
          <th>Avg</th>
        </tr></thead>
        <tbody>
          ${competitors.map((comp, ci) => {
            const avg = compAverages[ci];
            return `<tr>
              <td>${comp}${ci === 0 ? " ★" : ""}</td>
              ${dimensions.map((_, di) => {
                const s = getScore(ci, di);
                const c = scoreColor(s);
                const note = getNote(ci, di);
                return `<td style="background:${c.bg};color:${c.text}">${s}${note ? `<br><span style="font-size:9px;font-weight:400;color:#7F8C8D">${note}</span>` : ""}</td>`;
              }).join("")}
              <td style="background:#F8F9FA;color:#1B4F72;font-size:14px">${avg}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
      <p style="font-size:10px;color:#95A5A6;margin-top:8px">Score: 1=Weak, 2=Below Avg, 3=Average, 4=Strong, 5=Leader</p>
      <p style="font-size:10px;color:#BDC3C7;text-align:center;margin-top:30px">Product Development Agentic OS · Competitive Matrix</p>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  // Clear
  const clearAll = () => {
    setCompetitors(["Your Product"]);
    setDimensions(DEFAULT_DIMENSIONS.map(d => d.label));
    setScores({});
    setNotes({});
    setTitle("Competitive Matrix");
    setContext("");
    setExpandedCell(null);
    window.localStorage.removeItem(STORAGE_KEY);
    setToast("Matrix cleared");
  };

  // Save session
  const saveSession = () => {
    const blob = new Blob([JSON.stringify(currentState, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `competitive-matrix-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    setToast("Matrix saved to file");
  };

  return (
    <div style={{ maxWidth: 1060, margin: "0 auto", padding: mobile ? "16px 14px" : "32px 24px", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      {/* Back nav */}
      <a onClick={() => window.location.href = "/stage/0"} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#2980B9", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, marginBottom: 16, textDecoration: "none", minHeight: 44 }}>
        ← Back To Stage 0
      </a>

      {/* Header */}
      <div style={{ marginBottom: 20, borderBottom: "3px solid #3498DB", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#1B9C85", fontWeight: 500, letterSpacing: "0.15em", marginBottom: 4, textTransform: "uppercase" }}>Stage 0 · Framework 3C</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <input value={title} onChange={e => setTitle(e.target.value)}
              style={{ fontSize: mobile ? 22 : 28, fontFamily: "'Playfair Display', serif", fontWeight: 800, color: "#1B4F72", border: "none", outline: "none", background: "transparent", width: "100%", padding: 0 }} />
            <input value={context} onChange={e => setContext(e.target.value)} placeholder="Add context (e.g. market segment, analysis date)..."
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

      {/* Import panel */}
      {showImport && (
        <div style={{ marginBottom: 20, padding: 18, background: "#EBF5FB", borderRadius: 12, border: "1px solid #AED6F1" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1B4F72", margin: "0 0 8px 0" }}>Import From Manus Results</p>
          <p style={{ fontSize: 12, color: "#5D6D7E", margin: "0 0 12px 0", lineHeight: 1.4 }}>Paste the full Manus results JSON, or upload the .json file. Expects competitive_intel.comparison_table with competitors and scores.</p>
          <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder='Paste Manus results JSON here...'
            rows={4} style={{ width: "100%", padding: "10px 12px", border: "1px solid #AED6F1", borderRadius: 8, fontSize: 12, fontFamily: "'DM Mono', monospace", resize: "vertical", outline: "none", background: "#fff", boxSizing: "border-box", marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => importJSON(importText)} disabled={!importText.trim()}
              style={{ padding: "10px 20px", background: importText.trim() ? "#2980B9" : "#D5D8DC", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: importText.trim() ? "pointer" : "not-allowed", minHeight: 44 }}>
              Import From Paste
            </button>
            <button onClick={() => fileRef.current?.click()}
              style={{ padding: "10px 20px", background: "#1B4F72", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>
              Upload .json File
            </button>
            <button onClick={pullFromInput}
              style={{ padding: "10px 20px", background: "#E67E22", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>
              Pull From Input Panel
            </button>
            <button onClick={() => { setShowImport(false); setImportText(""); }}
              style={{ padding: "10px 20px", background: "none", color: "#5D6D7E", border: "1px solid #D5D8DC", borderRadius: 8, fontSize: 13, cursor: "pointer", minHeight: 44 }}>
              Cancel
            </button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleFileImport} style={{ display: "none" }} />
          </div>
        </div>
      )}

      {/* Score Legend */}
      <div style={{ display: "flex", gap: mobile ? 6 : 10, marginBottom: 16, flexWrap: "wrap" }}>
        {[1, 2, 3, 4, 5].map(v => {
          const c = SCORE_COLORS[v];
          return (
            <div key={v} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, background: c.bg, border: `1px solid ${c.text}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: c.text, fontFamily: "'DM Mono', monospace" }}>{v}</span>
              </div>
              <span style={{ fontSize: 11, color: "#7F8C8D", fontFamily: "'DM Sans', sans-serif" }}>{c.label}</span>
            </div>
          );
        })}
      </div>

      {/* Matrix Table */}
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", marginBottom: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: mobile ? 500 : 0 }}>
          <thead>
            <tr>
              <th style={{ background: "#1B4F72", color: "#fff", padding: "12px 14px", textAlign: "left", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, borderRadius: "8px 0 0 0", minWidth: 140, position: "sticky", left: 0, zIndex: 1 }}>
                Competitor
              </th>
              {dimensions.map((dim, di) => (
                <th key={di} style={{ background: "#1B4F72", color: "#fff", padding: "12px 8px", textAlign: "center", fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, minWidth: 80, position: "relative" }}>
                  <span>{dim}</span>
                  {dimensions.length > 1 && (
                    <button onClick={() => removeDimension(di)} title="Remove dimension"
                      style={{ position: "absolute", top: 2, right: 2, background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 12, padding: "2px 4px", lineHeight: 1 }}>×</button>
                  )}
                </th>
              ))}
              <th style={{ background: "#1B4F72", color: "#82E0AA", padding: "12px 8px", textAlign: "center", fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: 600, minWidth: 50, borderRadius: "0 8px 0 0" }}>
                Avg
              </th>
            </tr>
          </thead>
          <tbody>
            {competitors.map((comp, ci) => (
              <tr key={ci} style={{ background: ci === 0 ? "#F0F9FF" : ci % 2 === 0 ? "#FAFBFC" : "#fff" }}>
                <td style={{
                  padding: "10px 14px", fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                  color: ci === 0 ? "#1B4F72" : "#2C3E50", fontSize: 13,
                  borderBottom: "1px solid #E8EAED", position: "sticky", left: 0,
                  background: ci === 0 ? "#F0F9FF" : ci % 2 === 0 ? "#FAFBFC" : "#fff", zIndex: 1,
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, minHeight: 48,
                }}>
                  <span>{comp}{ci === 0 ? " ★" : ""}</span>
                  {ci > 0 && (
                    <button onClick={() => removeCompetitor(ci)} title="Remove competitor"
                      style={{ background: "none", border: "none", color: "#C0392B", cursor: "pointer", fontSize: 14, padding: "4px", lineHeight: 1, flexShrink: 0, minWidth: 28, minHeight: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                  )}
                </td>
                {dimensions.map((_, di) => {
                  const cellKey = `${ci}-${di}`;
                  const isExpanded = expandedCell === cellKey;
                  return (
                    <td key={di} style={{ padding: "6px", borderBottom: "1px solid #E8EAED", verticalAlign: "top" }}>
                      <ScoreCell score={getScore(ci, di)} onChange={val => setScore(ci, di, val)} mobile={mobile} />
                      <button onClick={() => setExpandedCell(isExpanded ? null : cellKey)}
                        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", fontSize: 10, color: getNote(ci, di) ? "#2980B9" : "#D5D8DC", padding: "2px 0 0 0", fontFamily: "'DM Mono', monospace" }}>
                        {getNote(ci, di) ? "📝" : "···"}
                      </button>
                      {isExpanded && (
                        <textarea value={getNote(ci, di)} onChange={e => setNote(ci, di, e.target.value)}
                          placeholder="Note..."
                          rows={2} style={{ width: "100%", marginTop: 4, padding: "6px 8px", border: "1px solid #D5D8DC", borderRadius: 6, fontSize: 11, fontFamily: "'DM Sans', sans-serif", resize: "vertical", outline: "none", background: "#FAFBFC", boxSizing: "border-box" }} />
                      )}
                    </td>
                  );
                })}
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #E8EAED", textAlign: "center", fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 14, color: "#1B4F72", background: ci === 0 ? "#E8F6FD" : "#F8F9FA" }}>
                  {compAverages[ci]}
                </td>
              </tr>
            ))}
            {/* Dimension averages row */}
            <tr style={{ background: "#F2F3F4" }}>
              <td style={{ padding: "10px 14px", fontFamily: "'DM Mono', monospace", fontWeight: 600, color: "#7F8C8D", fontSize: 11, borderTop: "2px solid #1B4F72", position: "sticky", left: 0, background: "#F2F3F4", zIndex: 1 }}>
                DIM AVG
              </td>
              {dimensions.map((_, di) => (
                <td key={di} style={{ padding: "10px 8px", textAlign: "center", fontFamily: "'DM Mono', monospace", fontWeight: 600, color: "#7F8C8D", fontSize: 12, borderTop: "2px solid #1B4F72" }}>
                  {dimAverages[di]}
                </td>
              ))}
              <td style={{ borderTop: "2px solid #1B4F72", background: "#F2F3F4" }} />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Add competitor / dimension */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {addingCompetitor ? (
          <div style={{ display: "flex", gap: 6 }}>
            <input value={newCompName} onChange={e => setNewCompName(e.target.value)} placeholder="Competitor name"
              onKeyDown={e => e.key === "Enter" && addCompetitor()}
              style={{ padding: "8px 12px", border: "1px solid #D5D8DC", borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", minWidth: 160 }} autoFocus />
            <button onClick={addCompetitor} style={{ padding: "8px 14px", background: "#1B4F72", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 38 }}>Add</button>
            <button onClick={() => { setAddingCompetitor(false); setNewCompName(""); }} style={{ padding: "8px 12px", background: "none", border: "1px solid #D5D8DC", borderRadius: 8, fontSize: 12, color: "#7F8C8D", cursor: "pointer", minHeight: 38 }}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setAddingCompetitor(true)} style={{ padding: "8px 16px", background: "none", border: "1px dashed #3498DB", borderRadius: 8, fontSize: 12, color: "#3498DB", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", minHeight: 38 }}>
            + Add Competitor
          </button>
        )}
        {addingDimension ? (
          <div style={{ display: "flex", gap: 6 }}>
            <input value={newDimName} onChange={e => setNewDimName(e.target.value)} placeholder="Dimension name"
              onKeyDown={e => e.key === "Enter" && addDimension()}
              style={{ padding: "8px 12px", border: "1px solid #D5D8DC", borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", minWidth: 140 }} autoFocus />
            <button onClick={addDimension} style={{ padding: "8px 14px", background: "#1B4F72", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 38 }}>Add</button>
            <button onClick={() => { setAddingDimension(false); setNewDimName(""); }} style={{ padding: "8px 12px", background: "none", border: "1px solid #D5D8DC", borderRadius: 8, fontSize: 12, color: "#7F8C8D", cursor: "pointer", minHeight: 38 }}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setAddingDimension(true)} style={{ padding: "8px 16px", background: "none", border: "1px dashed #E67E22", borderRadius: 8, fontSize: 12, color: "#E67E22", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", minHeight: 38 }}>
            + Add Dimension
          </button>
        )}
      </div>

      {/* Positioning Gaps */}
      <GapIndicator scores={allScoreArrays} dimensions={dimensions.map((d, i) => ({ label: d, index: i }))} />

      {/* Summary footer */}
      <div style={{ marginTop: 20, padding: "14px 18px", background: "#F8F9FA", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3498DB" }} />
            <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>{competitors.length} competitors</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#E67E22" }} />
            <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>{dimensions.length} dimensions</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1B9C85" }} />
            <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>{competitors.length * dimensions.length} scores</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#1B9C85" }}>Auto-saved ✓</span>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
