// StrategyCanvas.tsx — Ported from Level 1 StrategyCanvas.jsx
'use client';
import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "dk-stage0-strategy-canvas";
const INPUT_STORAGE_KEY = "dk-stage0-session";

const DEFAULT_FACTORS = ["Price", "Features", "UX", "Trust", "Speed", "Coverage"];
const LINE_COLORS = ["#E74C3C", "#3498DB", "#27AE60", "#E67E22", "#8E44AD", "#1ABC9C", "#F1C40F", "#C0392B"];

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
  factors: DEFAULT_FACTORS,
  players: [{ name: "Your Product", scores: [3, 3, 3, 3, 3, 3] }],
  title: "Strategy Canvas",
  context: "",
};

export default function StrategyCanvas() {
  const saved = loadSaved();
  const init = saved || DEFAULT_STATE;
  const mobile = useIsMobile();

  const [factors, setFactors] = useState(init.factors);
  const [players, setPlayers] = useState(init.players);
  const [title, setTitle] = useState(init.title);
  const [context, setContext] = useState(init.context);
  const [toast, setToast] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [newFactor, setNewFactor] = useState("");
  const [newPlayer, setNewPlayer] = useState("");
  const fileRef = useRef(null);

  const currentState = { factors, players, title, context };
  useAutoSave(currentState);

  // Ensure scores arrays match factor count
  const ensureScores = (scores) => {
    const s = [...(scores || [])];
    while (s.length < factors.length) s.push(3);
    return s.slice(0, factors.length);
  };

  const setScore = (pi, fi, val) => {
    setPlayers(players.map((p, i) => i === pi ? { ...p, scores: p.scores.map((s, j) => j === fi ? val : s) } : p));
  };

  const addFactor = () => {
    const f = newFactor.trim();
    if (!f || factors.includes(f)) return;
    setFactors([...factors, f]);
    setPlayers(players.map(p => ({ ...p, scores: [...p.scores, 3] })));
    setNewFactor("");
  };

  const removeFactor = (fi) => {
    if (factors.length <= 2) { setToast("Need at least 2 factors"); return; }
    setFactors(factors.filter((_, i) => i !== fi));
    setPlayers(players.map(p => ({ ...p, scores: p.scores.filter((_, i) => i !== fi) })));
  };

  const addPlayer = () => {
    const n = newPlayer.trim();
    if (!n) return;
    setPlayers([...players, { name: n, scores: factors.map(() => 3) }]);
    setNewPlayer("");
  };

  const removePlayer = (pi) => {
    if (players.length <= 1) { setToast("Need at least one player"); return; }
    setPlayers(players.filter((_, i) => i !== pi));
  };

  const pullFromInput = () => {
    try {
      const raw = window.localStorage.getItem(INPUT_STORAGE_KEY);
      if (!raw) { setToast("No Input Panel data"); return; }
      const data = JSON.parse(raw);
      const comps = (data.competitors || []).filter(c => c.name?.trim());
      let added = 0;
      comps.forEach(c => {
        if (!players.some(p => p.name.toLowerCase() === c.name.trim().toLowerCase())) {
          setPlayers(prev => [...prev, { name: c.name.trim(), scores: factors.map(() => 3) }]);
          added++;
        }
      });
      setToast(added ? `${added} competitor${added > 1 ? "s" : ""} added` : "All already present");
    } catch (e) { setToast("Error reading Input Panel"); }
  };

  const importJSON = useCallback((json) => {
    try {
      const data = typeof json === "string" ? JSON.parse(json) : json;
      const results = data.results_payload || data;
      const sc = results.strategy_canvas;
      if (!sc) { setToast("No strategy_canvas data found"); return; }
      if (sc.factors) setFactors(sc.factors);
      if (sc.players) setPlayers(sc.players.map(p => ({ name: p.name, scores: ensureScores(p.scores) })));
      setToast("Canvas populated from Manus"); setShowImport(false); setImportText("");
    } catch (e) { setToast("Invalid JSON format"); }
  }, [factors.length]);

  const handleFileImport = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => importJSON(ev.target.result);
    reader.readAsText(file); e.target.value = "";
  };

  // SVG Chart
  const chartW = mobile ? 340 : 700;
  const chartH = 280;
  const padL = 40, padR = 20, padT = 20, padB = 40;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const getX = (fi) => padL + (fi / (factors.length - 1)) * plotW;
  const getY = (score) => padT + plotH - ((score - 1) / 4) * plotH;

  const exportPDF = () => {
    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono&display=swap" rel="stylesheet">
      <style>body{font-family:'DM Sans',sans-serif;max-width:900px;margin:0 auto;padding:40px 24px}
      h1{font-size:24px;color:#1B4F72;margin:0 0 4px}
      table{width:100%;border-collapse:collapse;font-size:13px;margin-top:20px}
      th{background:#1B4F72;color:#fff;padding:8px 10px;text-align:center;font-size:11px}
      th:first-child{text-align:left}
      td{padding:6px 10px;text-align:center;border-bottom:1px solid #E8EAED;font-family:'DM Mono',monospace}
      td:first-child{text-align:left;font-family:'DM Sans',sans-serif;font-weight:600}
      @media print{body{padding:20px}}</style></head><body>
      <p style="font-size:11px;color:#1B9C85;font-family:'DM Mono',monospace;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">Product Development Agentic OS · Stage 0</p>
      <h1>${title}</h1>
      ${context ? `<p style="font-size:13px;color:#5D6D7E;margin-top:8px">${context}</p>` : ""}
      <p style="font-size:11px;color:#95A5A6;margin:8px 0 20px">Generated ${new Date().toLocaleDateString()} · ${players.length} players · ${factors.length} factors</p>
      <table><thead><tr><th>Player</th>${factors.map(f => `<th>${f}</th>`).join("")}</tr></thead><tbody>
      ${players.map((p, pi) => `<tr><td><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${LINE_COLORS[pi % LINE_COLORS.length]};margin-right:6px"></span>${p.name}</td>${ensureScores(p.scores).map(s => `<td>${s}</td>`).join("")}</tr>`).join("")}
      </tbody></table>
      <p style="font-size:10px;color:#BDC3C7;text-align:center;margin-top:30px">Product Development Agentic OS · Strategy Canvas</p>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  const clearAll = () => {
    setFactors(DEFAULT_FACTORS);
    setPlayers([{ name: "Your Product", scores: DEFAULT_FACTORS.map(() => 3) }]);
    setTitle("Strategy Canvas"); setContext("");
    window.localStorage.removeItem(STORAGE_KEY); setToast("Canvas cleared");
  };

  const saveSession = () => {
    const blob = new Blob([JSON.stringify(currentState, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `strategy-canvas-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url); setToast("Canvas saved to file");
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: mobile ? "16px 14px" : "32px 24px", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      <a onClick={() => window.location.href = "/stage/0"} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#2980B9", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, marginBottom: 16, textDecoration: "none", minHeight: 44 }}>
        ← Back To Stage 0
      </a>

      <div style={{ marginBottom: 20, borderBottom: "3px solid #2980B9", paddingBottom: 16 }}>
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
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1B4F72", margin: "0 0 8px 0" }}>Import Data</p>
          <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder='Paste Manus results JSON...'
            rows={4} style={{ width: "100%", padding: "10px 12px", border: "1px solid #AED6F1", borderRadius: 8, fontSize: 12, fontFamily: "'DM Mono', monospace", resize: "vertical", outline: "none", background: "#fff", boxSizing: "border-box", marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => importJSON(importText)} disabled={!importText.trim()} style={{ padding: "10px 20px", background: importText.trim() ? "#2980B9" : "#D5D8DC", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: importText.trim() ? "pointer" : "not-allowed", minHeight: 44 }}>Import</button>
            <button onClick={() => fileRef.current?.click()} style={{ padding: "10px 20px", background: "#1B4F72", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>Upload .json</button>
            <button onClick={pullFromInput} style={{ padding: "10px 20px", background: "#E67E22", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>Pull Competitors</button>
            <button onClick={() => { setShowImport(false); setImportText(""); }} style={{ padding: "10px 20px", background: "none", color: "#5D6D7E", border: "1px solid #D5D8DC", borderRadius: 8, fontSize: 13, cursor: "pointer", minHeight: 44 }}>Cancel</button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleFileImport} style={{ display: "none" }} />
          </div>
        </div>
      )}

      {/* SVG Chart */}
      <div style={{ background: "#FDFEFE", border: "1px solid #E8EAED", borderRadius: 14, padding: mobile ? 12 : 20, marginBottom: 20, overflowX: "auto" }}>
        <svg width={chartW} height={chartH} style={{ display: "block", margin: "0 auto" }}>
          {/* Grid lines */}
          {[1, 2, 3, 4, 5].map(v => (
            <g key={v}>
              <line x1={padL} y1={getY(v)} x2={chartW - padR} y2={getY(v)} stroke="#F2F3F4" strokeWidth="1" />
              <text x={padL - 8} y={getY(v) + 4} textAnchor="end" fontSize="10" fill="#95A5A6" fontFamily="'DM Mono', monospace">{v}</text>
            </g>
          ))}
          {/* Factor labels */}
          {factors.map((f, fi) => (
            <text key={fi} x={getX(fi)} y={chartH - 8} textAnchor="middle" fontSize="10" fill="#5D6D7E" fontFamily="'DM Sans', sans-serif" fontWeight="600">{f}</text>
          ))}
          {/* Lines */}
          {players.map((player, pi) => {
            const scores = ensureScores(player.scores);
            const color = LINE_COLORS[pi % LINE_COLORS.length];
            const points = scores.map((s, fi) => `${getX(fi)},${getY(s)}`).join(" ");
            return (
              <g key={pi}>
                <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {scores.map((s, fi) => (
                  <circle key={fi} cx={getX(fi)} cy={getY(s)} r="5" fill={color} stroke="#fff" strokeWidth="2" />
                ))}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
          {players.map((p, pi) => (
            <div key={pi} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 3, borderRadius: 2, background: LINE_COLORS[pi % LINE_COLORS.length] }} />
              <span style={{ fontSize: 12, color: "#2C3E50", fontFamily: "'DM Sans', sans-serif", fontWeight: pi === 0 ? 700 : 400 }}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Score editing table */}
      <div style={{ overflowX: "auto", marginBottom: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
          <thead>
            <tr>
              <th style={{ background: "#1B4F72", color: "#fff", padding: "10px 12px", textAlign: "left", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, borderRadius: "8px 0 0 0", minWidth: 120 }}>Player</th>
              {factors.map((f, fi) => (
                <th key={fi} style={{ background: "#1B4F72", color: "#fff", padding: "10px 6px", textAlign: "center", fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, minWidth: 60, position: "relative" }}>
                  {f}
                  {factors.length > 2 && <button onClick={() => removeFactor(fi)} style={{ position: "absolute", top: 1, right: 1, background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 11, padding: "1px 3px" }}>×</button>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((player, pi) => (
              <tr key={pi} style={{ background: pi === 0 ? "#F0F9FF" : pi % 2 === 0 ? "#FAFBFC" : "#fff" }}>
                <td style={{ padding: "8px 12px", fontWeight: 600, color: "#2C3E50", fontSize: 13, borderBottom: "1px solid #E8EAED", display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: LINE_COLORS[pi % LINE_COLORS.length], flexShrink: 0 }} />
                  <span>{player.name}{pi === 0 ? " ★" : ""}</span>
                  {pi > 0 && <button onClick={() => removePlayer(pi)} style={{ background: "none", border: "none", color: "#C0392B", cursor: "pointer", fontSize: 13, marginLeft: "auto", padding: "2px" }}>×</button>}
                </td>
                {ensureScores(player.scores).map((s, fi) => (
                  <td key={fi} style={{ padding: "4px", borderBottom: "1px solid #E8EAED", textAlign: "center" }}>
                    <select value={s} onChange={e => setScore(pi, fi, Number(e.target.value))}
                      style={{ width: "100%", padding: "6px 4px", border: "1px solid #E8EAED", borderRadius: 6, fontSize: 14, fontFamily: "'DM Mono', monospace", fontWeight: 700, textAlign: "center", cursor: "pointer", appearance: "none", WebkitAppearance: "none", background: "#fff", color: "#2C3E50" }}>
                      {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add player / factor */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <input value={newPlayer} onChange={e => setNewPlayer(e.target.value)} placeholder="Add competitor..."
            onKeyDown={e => e.key === "Enter" && addPlayer()}
            style={{ padding: "8px 12px", border: "1px solid #D5D8DC", borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", minWidth: 140 }} />
          <button onClick={addPlayer} style={{ padding: "8px 14px", background: "#1B4F72", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 38 }}>+ Player</button>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <input value={newFactor} onChange={e => setNewFactor(e.target.value)} placeholder="Add factor..."
            onKeyDown={e => e.key === "Enter" && addFactor()}
            style={{ padding: "8px 12px", border: "1px solid #D5D8DC", borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", minWidth: 120 }} />
          <button onClick={addFactor} style={{ padding: "8px 14px", background: "#E67E22", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 38 }}>+ Factor</button>
        </div>
      </div>

      <div style={{ marginTop: 20, padding: "14px 18px", background: "#F8F9FA", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>{players.length} players</span>
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>{factors.length} factors</span>
        </div>
        <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#1B9C85" }}>Auto-saved ✓</span>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
