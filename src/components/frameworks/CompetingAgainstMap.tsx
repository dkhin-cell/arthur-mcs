// CompetingAgainstMap.tsx — Ported from Level 1 CompetingAgainstMap.jsx
'use client';
import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "dk-stage0-competing";
const INPUT_STORAGE_KEY = "dk-stage0-session";

const CATEGORIES = [
  { key: "direct", label: "Direct Competitors", color: "#E74C3C", bg: "#FDEDEC", icon: "⚔️", prompt: "Products solving the same problem for the same users. Who are you directly competing with?" },
  { key: "indirect", label: "Indirect Alternatives", color: "#E67E22", bg: "#FEF5E7", icon: "🔄", prompt: "Different solutions to the same problem. Spreadsheets, consultants, cobbled-together tools, adjacent products." },
  { key: "non_obvious", label: "Non-Obvious Substitutes", color: "#8E44AD", bg: "#F5EEF8", icon: "👻", prompt: "What people do instead of solving the problem. Doing nothing, manual workarounds, ignoring it entirely." },
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

function CompetitorItem({ item, color, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background: "#fff", borderRadius: 8, padding: "10px 12px", border: `1px solid ${color}30`, marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <input value={item.name} onChange={e => onUpdate({ ...item, name: e.target.value })} placeholder="Competitor or alternative..."
          style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#2C3E50", background: "transparent", padding: 0, lineHeight: 1.4, fontWeight: 600 }} />
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button onClick={() => setExpanded(!expanded)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#95A5A6", padding: "2px 4px", minHeight: 28, minWidth: 28, display: "flex", alignItems: "center", justifyContent: "center" }} title="Details">📝</button>
          <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#E74C3C", padding: "2px 4px", minHeight: 28, minWidth: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
      </div>
      {item.threat_level && (
        <span style={{
          display: "inline-block", marginTop: 4, fontSize: 10, fontFamily: "'DM Mono', monospace", fontWeight: 600, padding: "2px 8px", borderRadius: 10,
          color: item.threat_level === "high" ? "#C0392B" : item.threat_level === "medium" ? "#E67E22" : "#27AE60",
          background: item.threat_level === "high" ? "#FDEDEC" : item.threat_level === "medium" ? "#FEF5E7" : "#EAFAF1",
        }}>
          {item.threat_level} threat
        </span>
      )}
      {expanded && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #F2F3F4" }}>
          <label style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#95A5A6", display: "block", marginBottom: 4 }}>What they offer / why users choose them</label>
          <textarea value={item.notes || ""} onChange={e => onUpdate({ ...item, notes: e.target.value })}
            placeholder="Strengths, weaknesses, pricing, market position..."
            rows={2} style={{ width: "100%", border: "1px solid #E8EAED", borderRadius: 6, padding: "8px 10px", fontSize: 12, fontFamily: "'DM Sans', sans-serif", resize: "vertical", outline: "none", background: "#FAFBFC", boxSizing: "border-box", lineHeight: 1.4 }} />
          <label style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#95A5A6", display: "block", marginBottom: 4, marginTop: 6 }}>Threat Level</label>
          <select value={item.threat_level || ""} onChange={e => onUpdate({ ...item, threat_level: e.target.value || null })}
            style={{ padding: "6px 8px", border: "1px solid #E8EAED", borderRadius: 6, fontSize: 12, fontFamily: "'DM Sans', sans-serif", background: "#FAFBFC", minHeight: 36 }}>
            <option value="">Not assessed</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      )}
    </div>
  );
}

function CategoryPanel({ category, items, setItems, mobile }) {
  const addItem = () => setItems([...items, { id: Date.now(), name: "", notes: null, threat_level: null }]);
  return (
    <div style={{ background: category.bg, borderRadius: 14, padding: mobile ? 14 : 18, border: `2px solid ${category.color}25`, minHeight: 180, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 20 }}>{category.icon}</span>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: category.color, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{category.label}</h3>
        <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#95A5A6", marginLeft: "auto" }}>{items.length}</span>
      </div>
      <p style={{ fontSize: 11, color: "#7F8C8D", margin: "0 0 12px 0", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>{category.prompt}</p>
      <div style={{ flex: 1 }}>
        {items.map((item, i) => (
          <CompetitorItem key={item.id} item={item} color={category.color}
            onUpdate={updated => setItems(items.map((it, j) => j === i ? updated : it))}
            onRemove={() => setItems(items.filter((_, j) => j !== i))} />
        ))}
      </div>
      <button onClick={addItem} style={{
        marginTop: 8, padding: "10px 14px", background: "#fff", border: `1px dashed ${category.color}50`, borderRadius: 8,
        fontSize: 12, color: category.color, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, width: "100%", minHeight: 44,
      }}>
        + Add Alternative
      </button>
    </div>
  );
}

const DEFAULT_STATE = { direct: [], indirect: [], non_obvious: [], title: "Competing Against Map", context: "" };

export default function CompetingAgainstMap() {
  const saved = loadSaved();
  const init = saved || DEFAULT_STATE;
  const mobile = useIsMobile();

  const [direct, setDirect] = useState(init.direct);
  const [indirect, setIndirect] = useState(init.indirect);
  const [nonObvious, setNonObvious] = useState(init.non_obvious);
  const [title, setTitle] = useState(init.title);
  const [context, setContext] = useState(init.context);
  const [toast, setToast] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const fileRef = useRef(null);

  const currentState = { direct, indirect, non_obvious: nonObvious, title, context };
  useAutoSave(currentState);
  const totalItems = direct.length + indirect.length + nonObvious.length;

  // Pull from Input Panel
  const pullFromInput = () => {
    try {
      const raw = window.localStorage.getItem(INPUT_STORAGE_KEY);
      if (!raw) { setToast("No Input Panel data found"); return; }
      const data = JSON.parse(raw);
      const comps = (data.competitors || []).filter(c => c.name && c.name.trim());
      if (!comps.length) { setToast("No competitors in Input Panel"); return; }
      let added = 0;
      const makeItem = (name) => ({ id: Date.now() + Math.random(), name, notes: null, threat_level: null });
      comps.forEach(c => {
        const target = c.type === "direct" ? direct : c.type === "indirect" ? indirect : nonObvious;
        const setter = c.type === "direct" ? setDirect : c.type === "indirect" ? setIndirect : setNonObvious;
        if (!target.some(t => t.name.toLowerCase() === c.name.trim().toLowerCase())) {
          setter(prev => [...prev, makeItem(c.name.trim())]);
          added++;
        }
      });
      setToast(added ? `${added} competitor${added > 1 ? "s" : ""} imported` : "All already present");
    } catch (e) { setToast("Error reading Input Panel"); }
  };

  const importJSON = useCallback((json) => {
    try {
      const data = typeof json === "string" ? JSON.parse(json) : json;
      const results = data.results_payload || data;
      const ci = results.competitive_intel?.competing_against;
      if (!ci) { setToast("No competing_against data found"); return; }
      const makeItems = (arr) => (arr || []).map((item, i) => ({
        id: Date.now() + i + Math.random(),
        name: typeof item === "string" ? item : item.name || "",
        notes: typeof item === "object" ? item.notes || null : null,
        threat_level: typeof item === "object" ? item.threat_level || null : null,
      }));
      if (ci.direct) setDirect(makeItems(ci.direct));
      if (ci.indirect) setIndirect(makeItems(ci.indirect));
      if (ci.non_obvious) setNonObvious(makeItems(ci.non_obvious));
      setToast("Competing Against map populated from Manus");
      setShowImport(false); setImportText("");
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
    const renderItems = (items, label, color) => {
      if (!items.length) return `<p style="color:#95A5A6;font-style:italic">No items</p>`;
      return items.map(item =>
        `<div style="padding:6px 0;border-bottom:1px solid #f0f0f0">
          <span style="font-size:13px;color:#2C3E50;font-weight:600">${item.name || "(empty)"}</span>
          ${item.threat_level ? `<span style="font-size:10px;margin-left:8px;padding:2px 6px;border-radius:8px;background:${color}15;color:${color}">${item.threat_level} threat</span>` : ""}
          ${item.notes ? `<p style="font-size:11px;color:#7F8C8D;margin:4px 0 0 0">${item.notes}</p>` : ""}
        </div>`
      ).join("");
    };
    w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono&display=swap" rel="stylesheet">
      <style>body{font-family:'DM Sans',sans-serif;max-width:900px;margin:0 auto;padding:40px 24px}
      .cat{padding:18px;border-radius:12px;border:2px solid;margin-bottom:16px}
      h1{font-size:24px;color:#1B4F72;margin:0 0 4px} h3{margin:0 0 10px}
      @media print{body{padding:20px}}</style></head><body>
      <p style="font-size:11px;color:#1B9C85;font-family:'DM Mono',monospace;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">Product Development Agentic OS · Stage 0</p>
      <h1>${title}</h1>
      ${context ? `<p style="font-size:13px;color:#5D6D7E;margin-top:8px">${context}</p>` : ""}
      <p style="font-size:11px;color:#95A5A6;margin:8px 0 20px">Generated ${new Date().toLocaleDateString()} · ${totalItems} alternatives mapped</p>
      ${CATEGORIES.map(cat => {
        const items = cat.key === "direct" ? direct : cat.key === "indirect" ? indirect : nonObvious;
        return `<div class="cat" style="background:${cat.bg};border-color:${cat.color}30">
          <h3 style="color:${cat.color};font-size:15px">${cat.icon} ${cat.label} (${items.length})</h3>
          ${renderItems(items, cat.label, cat.color)}
        </div>`;
      }).join("")}
      <p style="font-size:10px;color:#BDC3C7;text-align:center;margin-top:30px">Product Development Agentic OS · Competing Against Map</p>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  const clearAll = () => {
    setDirect([]); setIndirect([]); setNonObvious([]);
    setTitle("Competing Against Map"); setContext("");
    window.localStorage.removeItem(STORAGE_KEY);
    setToast("Map cleared");
  };

  const saveSession = () => {
    const blob = new Blob([JSON.stringify(currentState, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `competing-against-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    setToast("Map saved to file");
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: mobile ? "16px 14px" : "32px 24px", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      <a onClick={() => window.location.href = "/stage/0"} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#2980B9", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, marginBottom: 16, textDecoration: "none", minHeight: 44 }}>
        ← Back To Stage 0
      </a>

      <div style={{ marginBottom: 20, borderBottom: "3px solid #8E44AD", paddingBottom: 16 }}>
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
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1B4F72", margin: "0 0 8px 0" }}>Import Alternatives</p>
          <p style={{ fontSize: 12, color: "#5D6D7E", margin: "0 0 12px 0", lineHeight: 1.4 }}>Paste Manus results JSON or pull competitors from the Input Panel.</p>
          <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder='Paste Manus results JSON here...'
            rows={4} style={{ width: "100%", padding: "10px 12px", border: "1px solid #AED6F1", borderRadius: 8, fontSize: 12, fontFamily: "'DM Mono', monospace", resize: "vertical", outline: "none", background: "#fff", boxSizing: "border-box", marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => importJSON(importText)} disabled={!importText.trim()} style={{ padding: "10px 20px", background: importText.trim() ? "#2980B9" : "#D5D8DC", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: importText.trim() ? "pointer" : "not-allowed", minHeight: 44 }}>Import From Paste</button>
            <button onClick={() => fileRef.current?.click()} style={{ padding: "10px 20px", background: "#1B4F72", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>Upload .json</button>
            <button onClick={pullFromInput} style={{ padding: "10px 20px", background: "#E67E22", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>Pull From Input Panel</button>
            <button onClick={() => { setShowImport(false); setImportText(""); }} style={{ padding: "10px 20px", background: "none", color: "#5D6D7E", border: "1px solid #D5D8DC", borderRadius: 8, fontSize: 13, cursor: "pointer", minHeight: 44 }}>Cancel</button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleFileImport} style={{ display: "none" }} />
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr 1fr", gap: mobile ? 14 : 16 }}>
        <CategoryPanel category={CATEGORIES[0]} items={direct} setItems={setDirect} mobile={mobile} />
        <CategoryPanel category={CATEGORIES[1]} items={indirect} setItems={setIndirect} mobile={mobile} />
        <CategoryPanel category={CATEGORIES[2]} items={nonObvious} setItems={setNonObvious} mobile={mobile} />
      </div>

      <div style={{ marginTop: 20, padding: "14px 18px", background: "#F8F9FA", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 12 }}>
          {CATEGORIES.map(cat => {
            const count = cat.key === "direct" ? direct.length : cat.key === "indirect" ? indirect.length : nonObvious.length;
            return (<div key={cat.key} style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: cat.color }} /><span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>{count}</span></div>);
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#1B9C85" }}>Auto-saved ✓</span>
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>{totalItems} alternatives total</span>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
