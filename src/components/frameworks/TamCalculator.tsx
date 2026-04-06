// TamCalculator.tsx — Ported from Level 1 TamCalculator.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "dk-stage0-tam";

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
  tam: 500,
  samPercent: 30,
  somPercent: 10,
  tamSource: "",
  methodology: "",
  risks: [
    "Market size estimates may include adjacent segments you can't serve",
    "SAM percentage assumes geographic reach that requires validation",
    "SOM assumes conversion rates not yet tested with real users",
  ],
  title: "TAM / SAM / SOM Calculator",
  context: "",
};

export default function TamCalculator() {
  const saved = loadSaved();
  const init = saved || DEFAULT_STATE;
  const mobile = useIsMobile();

  const [tam, setTam] = useState(init.tam);
  const [samPercent, setSamPercent] = useState(init.samPercent);
  const [somPercent, setSomPercent] = useState(init.somPercent);
  const [tamSource, setTamSource] = useState(init.tamSource);
  const [methodology, setMethodology] = useState(init.methodology);
  const [risks, setRisks] = useState(init.risks);
  const [title, setTitle] = useState(init.title);
  const [context, setContext] = useState(init.context);
  const [toast, setToast] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [newRisk, setNewRisk] = useState("");
  const fileRef = useRef(null);

  const sam = tam * samPercent / 100;
  const som = sam * somPercent / 100;
  const samOfTam = samPercent;
  const somOfSam = somPercent;
  const somOfTam = (som / tam * 100);

  const currentState = { tam, samPercent, somPercent, tamSource, methodology, risks, title, context };
  useAutoSave(currentState);

  // Import from Manus JSON
  const importJSON = useCallback((json) => {
    try {
      const data = typeof json === "string" ? JSON.parse(json) : json;
      const results = data.results_payload || data;
      const ms = results.market_sizing;
      if (!ms) {
        setToast("No market_sizing data found in JSON");
        return;
      }
      if (ms.tam) setTam(Number(ms.tam) || 500);
      if (ms.sam_percent) setSamPercent(Number(ms.sam_percent) || 30);
      if (ms.som_percent) setSomPercent(Number(ms.som_percent) || 10);
      if (ms.source) setTamSource(ms.source);
      if (ms.methodology) setMethodology(ms.methodology);
      if (ms.risks && Array.isArray(ms.risks)) setRisks(ms.risks);
      setToast("TAM data populated from Manus research");
      setShowImport(false);
      setImportText("");
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
    w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono&display=swap" rel="stylesheet">
      <style>body{font-family:'DM Sans',sans-serif;max-width:800px;margin:0 auto;padding:40px 24px}
      h1{font-size:24px;color:#1B4F72;margin:0 0 4px}
      .circle-row{display:flex;justify-content:center;margin:30px 0}
      .metric{text-align:center;padding:16px 24px;background:#F8F9FA;border-radius:10px;margin:8px 0}
      .metric-label{font-size:11px;color:#7F8C8D;font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:0.05em}
      .metric-value{font-size:28px;font-weight:800;font-family:'DM Mono',monospace;margin:4px 0}
      .metric-sub{font-size:12px;color:#95A5A6}
      @media print{body{padding:20px}}</style></head><body>
      <p style="font-size:11px;color:#1B9C85;font-family:'DM Mono',monospace;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">Product Development Agentic OS · Stage 0</p>
      <h1>${title}</h1>
      ${context ? `<p style="font-size:13px;color:#5D6D7E;margin-top:8px">${context}</p>` : ""}
      <p style="font-size:11px;color:#95A5A6;margin:8px 0 24px">Generated ${new Date().toLocaleDateString()}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">
        <div class="metric"><p class="metric-label">TAM</p><p class="metric-value" style="color:#3498DB">$${tam}M</p><p class="metric-sub">Total Addressable Market</p></div>
        <div class="metric"><p class="metric-label">SAM</p><p class="metric-value" style="color:#E67E22">$${sam.toFixed(1)}M</p><p class="metric-sub">${samOfTam}% of TAM</p></div>
        <div class="metric"><p class="metric-label">SOM</p><p class="metric-value" style="color:#1B9C85">$${som.toFixed(1)}M</p><p class="metric-sub">${somOfTam.toFixed(1)}% of TAM</p></div>
      </div>
      ${tamSource ? `<div style="margin-top:20px;padding:14px 18px;background:#EBF5FB;border-radius:10px"><p style="font-size:12px;font-weight:600;color:#1B4F72;margin:0 0 4px">Source Basis</p><p style="font-size:13px;color:#2C3E50;margin:0;line-height:1.5">${tamSource}</p></div>` : ""}
      ${methodology ? `<div style="margin-top:12px;padding:14px 18px;background:#F8F9FA;border-radius:10px"><p style="font-size:12px;font-weight:600;color:#1B4F72;margin:0 0 4px">Methodology Notes</p><p style="font-size:13px;color:#2C3E50;margin:0;line-height:1.5">${methodology}</p></div>` : ""}
      <div style="margin-top:20px;padding:14px 18px;background:#FEF9E7;border-radius:10px;border-left:4px solid #F1C40F">
        <p style="font-size:13px;font-weight:700;color:#B7950B;margin:0 0 8px">⚠ Sanity Check — Biggest Risks To This Estimate</p>
        ${risks.map(r => `<p style="font-size:12px;color:#7D6608;margin:4px 0;line-height:1.4">• ${r}</p>`).join("")}
      </div>
      <p style="font-size:10px;color:#BDC3C7;text-align:center;margin-top:30px">Product Development Agentic OS · TAM/SAM/SOM Calculator</p>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  // Clear
  const clearAll = () => {
    setTam(500); setSamPercent(30); setSomPercent(10);
    setTamSource(""); setMethodology("");
    setRisks(DEFAULT_STATE.risks);
    setTitle("TAM / SAM / SOM Calculator"); setContext("");
    window.localStorage.removeItem(STORAGE_KEY);
    setToast("Calculator cleared");
  };

  // Save session
  const saveSession = () => {
    const blob = new Blob([JSON.stringify(currentState, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `tam-calculator-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    setToast("TAM data saved to file");
  };

  // Add/remove risks
  const addRisk = () => {
    const r = newRisk.trim();
    if (r) { setRisks([...risks, r]); setNewRisk(""); }
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: mobile ? "16px 14px" : "32px 24px", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      {/* Back nav */}
      <a onClick={() => window.location.href = "/stage/0"} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#2980B9", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, marginBottom: 16, textDecoration: "none", minHeight: 44 }}>
        ← Back To Stage 0
      </a>

      {/* Header */}
      <div style={{ marginBottom: 20, borderBottom: "3px solid #F39C12", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#1B9C85", fontWeight: 500, letterSpacing: "0.15em", marginBottom: 4, textTransform: "uppercase" }}>Stage 0 · Framework 3B</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <input value={title} onChange={e => setTitle(e.target.value)}
              style={{ fontSize: mobile ? 22 : 28, fontFamily: "'Playfair Display', serif", fontWeight: 800, color: "#1B4F72", border: "none", outline: "none", background: "transparent", width: "100%", padding: 0 }} />
            <input value={context} onChange={e => setContext(e.target.value)} placeholder="Add context (e.g. market segment, date)..."
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
          <p style={{ fontSize: 12, color: "#5D6D7E", margin: "0 0 12px 0", lineHeight: 1.4 }}>Paste the full Manus results JSON. Expects market_sizing with tam, sam_percent, som_percent, source, methodology, and risks.</p>
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
            <button onClick={() => { setShowImport(false); setImportText(""); }}
              style={{ padding: "10px 20px", background: "none", color: "#5D6D7E", border: "1px solid #D5D8DC", borderRadius: 8, fontSize: 13, cursor: "pointer", minHeight: 44 }}>
              Cancel
            </button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleFileImport} style={{ display: "none" }} />
          </div>
        </div>
      )}

      {/* Nested circles visualization */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <div style={{ position: "relative", width: mobile ? 220 : 280, height: mobile ? 220 : 280 }}>
          {/* TAM circle */}
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid #3498DB30", background: "#3498DB10", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: mobile ? 16 : 22 }}>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#3498DB", letterSpacing: "0.1em" }}>TAM</span>
              <p style={{ fontSize: mobile ? 18 : 22, fontWeight: 800, color: "#3498DB", margin: "2px 0 0", fontFamily: "'DM Mono', monospace" }}>${tam}M</p>
            </div>
          </div>
          {/* SAM circle */}
          <div style={{ position: "absolute", top: "20%", left: "15%", right: "15%", bottom: "14%", borderRadius: "50%", border: "3px solid #E67E2240", background: "#E67E2215", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: mobile ? 14 : 20 }}>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#E67E22", letterSpacing: "0.1em" }}>SAM</span>
              <p style={{ fontSize: mobile ? 16 : 20, fontWeight: 800, color: "#E67E22", margin: "2px 0 0", fontFamily: "'DM Mono', monospace" }}>${sam.toFixed(1)}M</p>
            </div>
          </div>
          {/* SOM circle */}
          <div style={{ position: "absolute", top: "38%", left: "30%", right: "30%", bottom: "26%", borderRadius: "50%", border: "3px solid #1B9C8550", background: "#1B9C8520", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#1B9C85", letterSpacing: "0.1em" }}>SOM</span>
              <p style={{ fontSize: mobile ? 14 : 18, fontWeight: 800, color: "#1B9C85", margin: "2px 0 0", fontFamily: "'DM Mono', monospace" }}>${som.toFixed(1)}M</p>
            </div>
          </div>
        </div>
      </div>

      {/* Percentage summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
        {[
          { label: "SAM / TAM", value: `${samOfTam}%`, color: "#E67E22" },
          { label: "SOM / SAM", value: `${somOfSam}%`, color: "#1B9C85" },
          { label: "SOM / TAM", value: `${somOfTam.toFixed(1)}%`, color: "#8E44AD" },
        ].map((m, i) => (
          <div key={i} style={{ textAlign: "center", padding: "12px 8px", background: "#F8F9FA", borderRadius: 10 }}>
            <p style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#7F8C8D", margin: "0 0 4px 0", textTransform: "uppercase" }}>{m.label}</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: m.color, margin: 0, fontFamily: "'DM Mono', monospace" }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Sliders */}
      <div style={{ background: "#FDFEFE", border: "1px solid #E8EAED", borderRadius: 14, padding: mobile ? 16 : 22, marginBottom: 20 }}>
        {[
          { label: "Total Addressable Market ($M)", value: tam, set: setTam, min: 1, max: 10000, step: 10, color: "#3498DB", display: `$${tam}M` },
          { label: "Serviceable Available Market (%)", value: samPercent, set: setSamPercent, min: 1, max: 100, step: 1, color: "#E67E22", display: `${samPercent}%` },
          { label: "Serviceable Obtainable Market (%)", value: somPercent, set: setSomPercent, min: 1, max: 100, step: 1, color: "#1B9C85", display: `${somPercent}%` },
        ].map((s, i) => (
          <div key={i} style={{ marginBottom: i < 2 ? 22 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#2C3E50", fontFamily: "'DM Sans', sans-serif" }}>{s.label}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: s.color, fontFamily: "'DM Mono', monospace", background: s.color + "15", padding: "3px 10px", borderRadius: 6 }}>{s.display}</span>
            </div>
            <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
              onChange={e => s.set(Number(e.target.value))}
              style={{ width: "100%", accentColor: s.color, cursor: "pointer", height: 24 }} />
          </div>
        ))}
      </div>

      {/* Source & methodology */}
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div style={{ background: "#FDFEFE", border: "1px solid #E8EAED", borderRadius: 12, padding: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#1B4F72", display: "block", marginBottom: 6 }}>Source Basis</label>
          <textarea value={tamSource} onChange={e => setTamSource(e.target.value)}
            placeholder="Where does the TAM number come from? Industry reports, public data, bottom-up calculation..."
            rows={3} style={{ width: "100%", border: "1px solid #E8EAED", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", resize: "vertical", outline: "none", background: "#FAFBFC", boxSizing: "border-box", lineHeight: 1.4 }} />
        </div>
        <div style={{ background: "#FDFEFE", border: "1px solid #E8EAED", borderRadius: 12, padding: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#1B4F72", display: "block", marginBottom: 6 }}>Methodology Notes</label>
          <textarea value={methodology} onChange={e => setMethodology(e.target.value)}
            placeholder="Top-down from industry reports? Bottom-up from unit economics? Comparable company extrapolation?"
            rows={3} style={{ width: "100%", border: "1px solid #E8EAED", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", resize: "vertical", outline: "none", background: "#FAFBFC", boxSizing: "border-box", lineHeight: 1.4 }} />
        </div>
      </div>

      {/* Sanity check risks */}
      <div style={{ background: "#FEF9E7", border: "1px solid #F9E79F", borderRadius: 14, padding: mobile ? 16 : 20, borderLeft: "4px solid #F1C40F" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#B7950B", margin: "0 0 12px 0", fontFamily: "'DM Sans', sans-serif" }}>⚠ Sanity Check — Biggest Risks To This Estimate</p>
        {risks.map((risk, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
            <span style={{ color: "#F1C40F", fontSize: 12, marginTop: 2, flexShrink: 0 }}>•</span>
            <input value={risk} onChange={e => setRisks(risks.map((r, j) => j === i ? e.target.value : r))}
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13, color: "#7D6608", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4, padding: 0 }} />
            <button onClick={() => setRisks(risks.filter((_, j) => j !== i))}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#C0392B", padding: "0 4px", minWidth: 28, minHeight: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input value={newRisk} onChange={e => setNewRisk(e.target.value)} placeholder="Add a risk to this estimate..."
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addRisk())}
            style={{ flex: 1, padding: "8px 12px", border: "1px solid #F9E79F", borderRadius: 8, fontSize: 12, fontFamily: "'DM Sans', sans-serif", outline: "none", background: "#fff" }} />
          <button onClick={addRisk} style={{ padding: "8px 14px", background: "#B7950B", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 36 }}>Add</button>
        </div>
      </div>

      {/* Summary footer */}
      <div style={{ marginTop: 20, padding: "14px 18px", background: "#F8F9FA", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3498DB" }} />
            <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>TAM ${tam}M</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#E67E22" }} />
            <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>SAM ${sam.toFixed(1)}M</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1B9C85" }} />
            <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>SOM ${som.toFixed(1)}M</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#1B9C85" }}>Auto-saved ✓</span>
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>{risks.length} risks tracked</span>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
