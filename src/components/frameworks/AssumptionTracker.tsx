// AssumptionTracker.tsx — Ported from Level 1 AssumptionTracker.jsx
'use client';
import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "dk-stage0-assumptions";

const QUADRANTS = [
  { key: "test_first", label: "Test First", color: "#E74C3C", bg: "#FDEDEC", icon: "🔥", importance: "high", evidence: "weak", prompt: "High importance, weak evidence. These are your riskiest assumptions — test them immediately." },
  { key: "monitor", label: "Monitor", color: "#E67E22", bg: "#FEF5E7", icon: "👁", importance: "high", evidence: "strong", prompt: "High importance, strong evidence. You believe these are true and have data. Keep monitoring for changes." },
  { key: "investigate", label: "Investigate Later", color: "#3498DB", bg: "#EBF5FB", icon: "🔍", importance: "low", evidence: "weak", prompt: "Low importance, weak evidence. Not urgent, but worth investigating when you have bandwidth." },
  { key: "park", label: "Park", color: "#95A5A6", bg: "#F2F3F4", icon: "📌", importance: "low", evidence: "strong", prompt: "Low importance, strong evidence. Known and validated. No action needed." },
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

function AssumptionItem({ item, color, onUpdate, onRemove, quadrants, currentQuadrant }) {
  const [showMove, setShowMove] = useState(false);
  return (
    <div style={{ background: "#fff", borderRadius: 8, padding: "10px 12px", border: `1px solid ${color}30`, marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <input value={item.text} onChange={e => onUpdate({ ...item, text: e.target.value })} placeholder="State assumption..."
          style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#2C3E50", background: "transparent", padding: 0, lineHeight: 1.4 }} />
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button onClick={() => setShowMove(!showMove)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#95A5A6", padding: "2px 4px", minHeight: 28, minWidth: 28, display: "flex", alignItems: "center", justifyContent: "center" }} title="Move">↔</button>
          <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#E74C3C", padding: "2px 4px", minHeight: 28, minWidth: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
      </div>
      {item.test_method && (
        <p style={{ fontSize: 11, color: "#7F8C8D", margin: "4px 0 0 0", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3 }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#2980B9" }}>TEST:</span> {item.test_method}
        </p>
      )}
      {showMove && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #F2F3F4" }}>
          <label style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#95A5A6", display: "block", marginBottom: 4 }}>Move to quadrant</label>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {quadrants.filter(q => q.key !== currentQuadrant).map(q => (
              <button key={q.key} onClick={() => { onUpdate({ ...item, _moveTo: q.key }); setShowMove(false); }}
                style={{ padding: "4px 10px", background: q.bg, border: `1px solid ${q.color}40`, borderRadius: 6, fontSize: 11, color: q.color, cursor: "pointer", fontWeight: 600 }}>
                {q.label}
              </button>
            ))}
          </div>
          <label style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#95A5A6", display: "block", marginBottom: 4, marginTop: 8 }}>How will you test this?</label>
          <input value={item.test_method || ""} onChange={e => onUpdate({ ...item, test_method: e.target.value })}
            placeholder="Experiment, interview question, data check..."
            style={{ width: "100%", border: "1px solid #E8EAED", borderRadius: 6, padding: "8px 10px", fontSize: 12, fontFamily: "'DM Sans', sans-serif", outline: "none", background: "#FAFBFC", boxSizing: "border-box" }} />
        </div>
      )}
    </div>
  );
}

function QuadrantPanel({ quadrant, items, setItems, allSetters, mobile }) {
  const addItem = () => setItems([...items, { id: Date.now(), text: "", test_method: null }]);

  const handleUpdate = (index, updated) => {
    if (updated._moveTo) {
      const moveTo = updated._moveTo;
      delete updated._moveTo;
      // Remove from current
      const newItems = items.filter((_, j) => j !== index);
      setItems(newItems);
      // Add to target
      const targetSetter = allSetters[moveTo];
      if (targetSetter) targetSetter(prev => [...prev, updated]);
      return;
    }
    setItems(items.map((it, j) => j === index ? updated : it));
  };

  return (
    <div style={{ background: quadrant.bg, borderRadius: 14, padding: mobile ? 14 : 18, border: `2px solid ${quadrant.color}25`, minHeight: 180, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 20 }}>{quadrant.icon}</span>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: quadrant.color, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{quadrant.label}</h3>
        <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#95A5A6", marginLeft: "auto" }}>{items.length}</span>
      </div>
      <p style={{ fontSize: 10, color: "#7F8C8D", margin: "0 0 10px 0", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3 }}>{quadrant.prompt}</p>
      <div style={{ flex: 1 }}>
        {items.map((item, i) => (
          <AssumptionItem key={item.id} item={item} color={quadrant.color}
            onUpdate={updated => handleUpdate(i, updated)}
            onRemove={() => setItems(items.filter((_, j) => j !== i))}
            quadrants={QUADRANTS} currentQuadrant={quadrant.key} />
        ))}
      </div>
      <button onClick={addItem} style={{
        marginTop: 8, padding: "10px 14px", background: "#fff", border: `1px dashed ${quadrant.color}50`, borderRadius: 8,
        fontSize: 12, color: quadrant.color, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, width: "100%", minHeight: 44,
      }}>
        + Add Assumption
      </button>
    </div>
  );
}

const DEFAULT_STATE = { test_first: [], monitor: [], investigate: [], park: [], title: "Assumption Tracker", context: "" };

export default function AssumptionTracker() {
  const saved = loadSaved();
  const init = saved || DEFAULT_STATE;
  const mobile = useIsMobile();

  const [testFirst, setTestFirst] = useState(init.test_first);
  const [monitor, setMonitor] = useState(init.monitor);
  const [investigate, setInvestigate] = useState(init.investigate);
  const [park, setPark] = useState(init.park);
  const [title, setTitle] = useState(init.title);
  const [context, setContext] = useState(init.context);
  const [toast, setToast] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const fileRef = useRef(null);

  const allSetters = { test_first: setTestFirst, monitor: setMonitor, investigate: setInvestigate, park: setPark };
  const currentState = { test_first: testFirst, monitor, investigate, park, title, context };
  useAutoSave(currentState);
  const totalItems = testFirst.length + monitor.length + investigate.length + park.length;

  // Pull from Input Panel assumptions
  const pullFromInput = () => {
    try {
      const raw = window.localStorage.getItem("dk-stage0-session");
      if (!raw) { setToast("No Input Panel data found"); return; }
      const data = JSON.parse(raw);
      const assumptions = data.assumptions || [];
      if (!assumptions.length) { setToast("No assumptions in Input Panel"); return; }
      let added = 0;
      assumptions.forEach(text => {
        if (!testFirst.some(a => a.text.toLowerCase() === text.toLowerCase())) {
          setTestFirst(prev => [...prev, { id: Date.now() + Math.random(), text, test_method: null }]);
          added++;
        }
      });
      setToast(added ? `${added} assumption${added > 1 ? "s" : ""} imported to Test First` : "All already present");
    } catch (e) { setToast("Error reading Input Panel"); }
  };

  const importJSON = useCallback((json) => {
    try {
      const data = typeof json === "string" ? JSON.parse(json) : json;
      const results = data.results_payload || data;
      const am = results.assumption_map;
      if (!am) { setToast("No assumption_map data found"); return; }
      const makeItems = (arr) => (arr || []).map((item, i) => ({
        id: Date.now() + i + Math.random(),
        text: typeof item === "string" ? item : item.text || "",
        test_method: typeof item === "object" ? item.test_method || null : null,
      }));
      if (am.test_first) setTestFirst(makeItems(am.test_first));
      if (am.monitor) setMonitor(makeItems(am.monitor));
      if (am.investigate) setInvestigate(makeItems(am.investigate));
      if (am.park) setPark(makeItems(am.park));
      setToast("Assumptions populated from Manus"); setShowImport(false); setImportText("");
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
    const renderItems = (items) => {
      if (!items.length) return `<p style="color:#95A5A6;font-style:italic">No assumptions</p>`;
      return items.map(item =>
        `<div style="padding:6px 0;border-bottom:1px solid #f0f0f0">
          <span style="font-size:13px;color:#2C3E50">${item.text || "(empty)"}</span>
          ${item.test_method ? `<p style="font-size:11px;color:#2980B9;margin:4px 0 0 0">Test: ${item.test_method}</p>` : ""}
        </div>`
      ).join("");
    };
    w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono&display=swap" rel="stylesheet">
      <style>body{font-family:'DM Sans',sans-serif;max-width:900px;margin:0 auto;padding:40px 24px}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
      .quad{padding:18px;border-radius:12px;border:2px solid}
      h1{font-size:24px;color:#1B4F72;margin:0 0 4px} h3{margin:0 0 10px}
      @media print{body{padding:20px}}</style></head><body>
      <p style="font-size:11px;color:#1B9C85;font-family:'DM Mono',monospace;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">Product Development Agentic OS · Stage 0</p>
      <h1>${title}</h1>
      ${context ? `<p style="font-size:13px;color:#5D6D7E;margin-top:8px">${context}</p>` : ""}
      <p style="font-size:11px;color:#95A5A6;margin:8px 0 4px">Generated ${new Date().toLocaleDateString()} · ${totalItems} assumptions</p>
      <p style="font-size:10px;color:#7F8C8D;margin:0 0 20px">Rows: Importance (High → Low) · Columns: Evidence (Weak → Strong)</p>
      <div class="grid">
        ${QUADRANTS.map(q => {
          const items = q.key === "test_first" ? testFirst : q.key === "monitor" ? monitor : q.key === "investigate" ? investigate : park;
          return `<div class="quad" style="background:${q.bg};border-color:${q.color}30">
            <h3 style="color:${q.color};font-size:15px">${q.icon} ${q.label} (${items.length})</h3>
            ${renderItems(items)}
          </div>`;
        }).join("")}
      </div>
      <p style="font-size:10px;color:#BDC3C7;text-align:center;margin-top:30px">Product Development Agentic OS · Assumption Tracker</p>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  const clearAll = () => {
    setTestFirst([]); setMonitor([]); setInvestigate([]); setPark([]);
    setTitle("Assumption Tracker"); setContext("");
    window.localStorage.removeItem(STORAGE_KEY);
    setToast("Tracker cleared");
  };

  const saveSession = () => {
    const blob = new Blob([JSON.stringify(currentState, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `assumptions-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    setToast("Tracker saved to file");
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: mobile ? "16px 14px" : "32px 24px", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      <a onClick={() => window.location.href = "/stage/0"} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#2980B9", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, marginBottom: 16, textDecoration: "none", minHeight: 44 }}>
        ← Back To Stage 0
      </a>

      <div style={{ marginBottom: 20, borderBottom: "3px solid #E74C3C", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#1B9C85", fontWeight: 500, letterSpacing: "0.15em", marginBottom: 4, textTransform: "uppercase" }}>Stage 0 · Framework</p>
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
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1B4F72", margin: "0 0 8px 0" }}>Import Assumptions</p>
          <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder='Paste Manus results JSON here...'
            rows={4} style={{ width: "100%", padding: "10px 12px", border: "1px solid #AED6F1", borderRadius: 8, fontSize: 12, fontFamily: "'DM Mono', monospace", resize: "vertical", outline: "none", background: "#fff", boxSizing: "border-box", marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => importJSON(importText)} disabled={!importText.trim()} style={{ padding: "10px 20px", background: importText.trim() ? "#2980B9" : "#D5D8DC", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: importText.trim() ? "pointer" : "not-allowed", minHeight: 44 }}>Import</button>
            <button onClick={() => fileRef.current?.click()} style={{ padding: "10px 20px", background: "#1B4F72", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>Upload .json</button>
            <button onClick={pullFromInput} style={{ padding: "10px 20px", background: "#E67E22", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>Pull From Input Panel</button>
            <button onClick={() => { setShowImport(false); setImportText(""); }} style={{ padding: "10px 20px", background: "none", color: "#5D6D7E", border: "1px solid #D5D8DC", borderRadius: 8, fontSize: 13, cursor: "pointer", minHeight: 44 }}>Cancel</button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleFileImport} style={{ display: "none" }} />
          </div>
        </div>
      )}

      {/* Axis labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, padding: "0 4px" }}>
        <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#7F8C8D", textTransform: "uppercase" }}>← Weak Evidence</span>
        <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#7F8C8D", textTransform: "uppercase" }}>Strong Evidence →</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? 14 : 18 }}>
        <QuadrantPanel quadrant={QUADRANTS[0]} items={testFirst} setItems={setTestFirst} allSetters={allSetters} mobile={mobile} />
        <QuadrantPanel quadrant={QUADRANTS[1]} items={monitor} setItems={setMonitor} allSetters={allSetters} mobile={mobile} />
        <QuadrantPanel quadrant={QUADRANTS[2]} items={investigate} setItems={setInvestigate} allSetters={allSetters} mobile={mobile} />
        <QuadrantPanel quadrant={QUADRANTS[3]} items={park} setItems={setPark} allSetters={allSetters} mobile={mobile} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, padding: "0 4px" }}>
        <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>↑ High Importance</span>
        <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>↓ Low Importance</span>
      </div>

      <div style={{ marginTop: 20, padding: "14px 18px", background: "#F8F9FA", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 12 }}>
          {QUADRANTS.map(q => {
            const count = q.key === "test_first" ? testFirst.length : q.key === "monitor" ? monitor.length : q.key === "investigate" ? investigate.length : park.length;
            return (<div key={q.key} style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: q.color }} /><span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>{count}</span></div>);
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#1B9C85" }}>Auto-saved ✓</span>
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>{totalItems} assumptions</span>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
