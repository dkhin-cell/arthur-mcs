// SwotAnalysis.tsx — Ported from Level 1 SwotAnalysis.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "dk-stage0-swot";

const QUADRANTS = [
  { key: "strengths", label: "Strengths", color: "#27AE60", bg: "#EAFAF1", icon: "💪", prompt: "Internal advantages. What do we do well? What unique resources do we have?" },
  { key: "weaknesses", label: "Weaknesses", color: "#E74C3C", bg: "#FDEDEC", icon: "⚠️", prompt: "Internal limitations. Where do we fall short? What could be improved?" },
  { key: "opportunities", label: "Opportunities", color: "#2980B9", bg: "#EBF5FB", icon: "🎯", prompt: "External factors we can exploit. Market gaps, trends, competitor failures?" },
  { key: "threats", label: "Threats", color: "#E67E22", bg: "#FEF5E7", icon: "🔥", prompt: "External risks. Competitive moves, regulatory changes, market shifts?" },
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

function SwotItem({ item, color, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background: "#fff", borderRadius: 8, padding: "10px 12px", border: `1px solid ${color}30`, marginBottom: 8, transition: "all 0.2s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <input value={item.text} onChange={e => onUpdate({ ...item, text: e.target.value })} placeholder="Add item..."
          style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#2C3E50", background: "transparent", padding: 0, lineHeight: 1.4 }} />
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button onClick={() => setExpanded(!expanded)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#95A5A6", padding: "2px 4px", minHeight: 28, minWidth: 28, display: "flex", alignItems: "center", justifyContent: "center" }}
            title="Add evidence">🔗</button>
          <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#E74C3C", padding: "2px 4px", minHeight: 28, minWidth: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
      </div>
      {/* Signal tag */}
      {item.signal_type && (
        <span style={{
          display: "inline-block", marginTop: 4, fontSize: 10, fontFamily: "'DM Mono', monospace", fontWeight: 600, padding: "2px 8px", borderRadius: 10,
          color: item.signal_type === "pain_confirmation" ? "#C0392B" : item.signal_type === "workaround_evidence" ? "#E67E22" : item.signal_type === "willingness_to_pay" ? "#27AE60" : "#2980B9",
          background: item.signal_type === "pain_confirmation" ? "#FDEDEC" : item.signal_type === "workaround_evidence" ? "#FEF5E7" : item.signal_type === "willingness_to_pay" ? "#EAFAF1" : "#EBF5FB",
        }}>
          {item.signal_type.replace(/_/g, " ")}
        </span>
      )}
      {/* Evidence panel */}
      {expanded && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #F2F3F4" }}>
          <label style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#95A5A6", display: "block", marginBottom: 4 }}>Evidence / Source</label>
          <textarea value={item.evidence || ""} onChange={e => onUpdate({ ...item, evidence: e.target.value })}
            placeholder="Link this to an interview quote, data point, or research finding..."
            rows={2} style={{ width: "100%", border: "1px solid #E8EAED", borderRadius: 6, padding: "8px 10px", fontSize: 12, fontFamily: "'DM Sans', sans-serif", resize: "vertical", outline: "none", background: "#FAFBFC", boxSizing: "border-box", lineHeight: 1.4 }} />
          <label style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#95A5A6", display: "block", marginBottom: 4, marginTop: 6 }}>Signal Tag</label>
          <select value={item.signal_type || ""} onChange={e => onUpdate({ ...item, signal_type: e.target.value || null })}
            style={{ padding: "6px 8px", border: "1px solid #E8EAED", borderRadius: 6, fontSize: 12, fontFamily: "'DM Sans', sans-serif", background: "#FAFBFC", minHeight: 36 }}>
            <option value="">None</option>
            <option value="pain_confirmation">Real Pain</option>
            <option value="workaround_evidence">Workaround Found</option>
            <option value="willingness_to_pay">WTP Signal</option>
            <option value="frequency_indicator">High Frequency</option>
            <option value="severity_indicator">High Severity</option>
            <option value="high_inertia">High Inertia</option>
          </select>
        </div>
      )}
    </div>
  );
}

function QuadrantPanel({ quadrant, items, setItems, mobile }) {
  const addItem = () => setItems([...items, { id: Date.now(), text: "", evidence: null, signal_type: null }]);
  return (
    <div style={{ background: quadrant.bg, borderRadius: 14, padding: mobile ? 14 : 18, border: `2px solid ${quadrant.color}25`, minHeight: 200, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>{quadrant.icon}</span>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: quadrant.color, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{quadrant.label}</h3>
        <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#95A5A6", marginLeft: "auto" }}>{items.length}</span>
      </div>
      <p style={{ fontSize: 11, color: "#7F8C8D", margin: "0 0 12px 0", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>{quadrant.prompt}</p>
      <div style={{ flex: 1 }}>
        {items.map((item, i) => (
          <SwotItem key={item.id} item={item} color={quadrant.color}
            onUpdate={updated => setItems(items.map((it, j) => j === i ? updated : it))}
            onRemove={() => setItems(items.filter((_, j) => j !== i))} />
        ))}
      </div>
      <button onClick={addItem} style={{
        marginTop: 8, padding: "10px 14px", background: "#fff", border: `1px dashed ${quadrant.color}50`, borderRadius: 8,
        fontSize: 12, color: quadrant.color, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, width: "100%", minHeight: 44,
      }}>
        + Add {quadrant.label.slice(0, -1)}
      </button>
    </div>
  );
}

const DEFAULT_STATE = {
  strengths: [], weaknesses: [], opportunities: [], threats: [],
  title: "SWOT Analysis", context: "",
};

export default function SwotAnalysis() {
  const saved = loadSaved();
  const init = saved || DEFAULT_STATE;
  const mobile = useIsMobile();

  const [strengths, setStrengths] = useState(init.strengths);
  const [weaknesses, setWeaknesses] = useState(init.weaknesses);
  const [opportunities, setOpportunities] = useState(init.opportunities);
  const [threats, setThreats] = useState(init.threats);
  const [title, setTitle] = useState(init.title);
  const [context, setContext] = useState(init.context);
  const [toast, setToast] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const fileRef = useRef(null);

  const currentState = { strengths, weaknesses, opportunities, threats, title, context };
  useAutoSave(currentState);

  const totalItems = strengths.length + weaknesses.length + opportunities.length + threats.length;

  // Import from Manus JSON
  const importJSON = useCallback((json) => {
    try {
      const data = typeof json === "string" ? JSON.parse(json) : json;
      const results = data.results_payload || data;

      // Extract SWOT feeds from competitive_intel and interview_synthesis
      const ciSwot = results.competitive_intel?.swot_feed;
      const iSwot = results.interview_synthesis?.swot_feed;
      const regSwot = results.regulatory_scan?.swot_feed;

      const makeItems = (arr) => (arr || []).map((text, i) => ({ id: Date.now() + i + Math.random(), text, evidence: null, signal_type: null }));

      if (ciSwot || iSwot || regSwot) {
        setStrengths(makeItems(iSwot?.strengths));
        setWeaknesses(makeItems(iSwot?.weaknesses));
        setOpportunities(makeItems([...(ciSwot?.opportunities || []), ...(regSwot?.opportunities || [])]));
        setThreats(makeItems([...(ciSwot?.threats || []), ...(regSwot?.threats || [])]));
        setToast("SWOT populated from Manus research");
        setShowImport(false);
        setImportText("");
      } else {
        setToast("No SWOT data found in JSON");
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

  // Export as PDF (print-friendly)
  const exportPDF = () => {
    const w = window.open("", "_blank");
    const renderItems = (items, label, color) => {
      if (!items.length) return `<p style="color:#95A5A6;font-style:italic">No items</p>`;
      return items.map(item =>
        `<div style="padding:6px 0;border-bottom:1px solid #f0f0f0">
          <span style="font-size:13px;color:#2C3E50">${item.text || "(empty)"}</span>
          ${item.signal_type ? `<span style="font-size:10px;margin-left:8px;padding:2px 6px;border-radius:8px;background:${color}15;color:${color}">${item.signal_type.replace(/_/g, " ")}</span>` : ""}
          ${item.evidence ? `<p style="font-size:11px;color:#7F8C8D;margin:4px 0 0 0">Evidence: ${item.evidence}</p>` : ""}
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
      <p style="font-size:11px;color:#95A5A6;margin:8px 0 20px">Generated ${new Date().toLocaleDateString()} · ${totalItems} items</p>
      <div class="grid">
        ${QUADRANTS.map(q => {
          const items = q.key === "strengths" ? strengths : q.key === "weaknesses" ? weaknesses : q.key === "opportunities" ? opportunities : threats;
          return `<div class="quad" style="background:${q.bg};border-color:${q.color}30">
            <h3 style="color:${q.color};font-size:15px">${q.icon} ${q.label} (${items.length})</h3>
            ${renderItems(items, q.label, q.color)}
          </div>`;
        }).join("")}
      </div>
      <p style="font-size:10px;color:#BDC3C7;text-align:center;margin-top:30px">Product Development Agentic OS · SWOT Analysis</p>
      </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  // Clear
  const clearAll = () => {
    setStrengths([]); setWeaknesses([]); setOpportunities([]); setThreats([]);
    setTitle("SWOT Analysis"); setContext("");
    window.localStorage.removeItem(STORAGE_KEY);
    setToast("SWOT cleared");
  };

  // Save session
  const saveSession = () => {
    const blob = new Blob([JSON.stringify(currentState, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `swot-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    setToast("SWOT saved to file");
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: mobile ? "16px 14px" : "32px 24px", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      {/* Back nav */}
      <a onClick={() => window.location.href = "/stage/0"} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#2980B9", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, marginBottom: 16, textDecoration: "none", minHeight: 44 }}>
        ← Back To Stage 0
      </a>

      {/* Header */}
      <div style={{ marginBottom: 20, borderBottom: "3px solid #27AE60", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#1B9C85", fontWeight: 500, letterSpacing: "0.15em", marginBottom: 4, textTransform: "uppercase" }}>Stage 0 · Framework 3A</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <input value={title} onChange={e => setTitle(e.target.value)}
              style={{ fontSize: mobile ? 22 : 28, fontFamily: "'Playfair Display', serif", fontWeight: 800, color: "#1B4F72", border: "none", outline: "none", background: "transparent", width: "100%", padding: 0 }} />
            <input value={context} onChange={e => setContext(e.target.value)} placeholder="Add context (e.g. product name, date, focus area)..."
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
          <p style={{ fontSize: 12, color: "#5D6D7E", margin: "0 0 12px 0", lineHeight: 1.4 }}>Paste the full Manus results JSON, or upload the .json file. The SWOT will auto-populate from competitive_intel, interview_synthesis, and regulatory_scan feeds.</p>
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

      {/* SWOT Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
        gap: mobile ? 14 : 18,
      }}>
        <QuadrantPanel quadrant={QUADRANTS[0]} items={strengths} setItems={setStrengths} mobile={mobile} />
        <QuadrantPanel quadrant={QUADRANTS[1]} items={weaknesses} setItems={setWeaknesses} mobile={mobile} />
        <QuadrantPanel quadrant={QUADRANTS[2]} items={opportunities} setItems={setOpportunities} mobile={mobile} />
        <QuadrantPanel quadrant={QUADRANTS[3]} items={threats} setItems={setThreats} mobile={mobile} />
      </div>

      {/* Summary footer */}
      <div style={{ marginTop: 20, padding: "14px 18px", background: "#F8F9FA", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 12 }}>
          {QUADRANTS.map(q => {
            const count = q.key === "strengths" ? strengths.length : q.key === "weaknesses" ? weaknesses.length : q.key === "opportunities" ? opportunities.length : threats.length;
            return (
              <div key={q.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: q.color }} />
                <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>{count}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#1B9C85" }}>Auto-saved ✓</span>
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>{totalItems} items total</span>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
