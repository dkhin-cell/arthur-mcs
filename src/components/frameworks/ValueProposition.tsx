// ValueProposition.tsx — Ported from Level 1 ValueProposition.jsx
'use client';
import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "dk-stage0-valueprop";

const SECTIONS = [
  { key: "who", label: "Who", color: "#E74C3C", bg: "#FDEDEC", icon: "👤", prompt: "Target user. Be specific — not 'everyone.' Who experiences this pain most acutely?" },
  { key: "why", label: "Why", color: "#E67E22", bg: "#FEF5E7", icon: "💡", prompt: "Motivation. What job are they trying to get done? What's the underlying need?" },
  { key: "what_before", label: "What Before", color: "#8E44AD", bg: "#F5EEF8", icon: "📉", prompt: "Current state. What's their life like today? What workarounds, pain, friction exist?" },
  { key: "how", label: "How", color: "#3498DB", bg: "#EBF5FB", icon: "⚙️", prompt: "Your solution approach. Not features — the mechanism by which you solve the problem." },
  { key: "what_after", label: "What After", color: "#27AE60", bg: "#EAFAF1", icon: "📈", prompt: "Desired outcome. What does their life look like after adopting your solution?" },
  { key: "alternatives", label: "Alternatives", color: "#95A5A6", bg: "#F2F3F4", icon: "🔄", prompt: "What would they do without you? The real competition — including doing nothing." },
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
  who: "", why: "", what_before: "", how: "", what_after: "", alternatives: "",
  title: "Value Proposition Canvas", context: "",
};

export default function ValueProposition() {
  const saved = loadSaved();
  const init = saved || DEFAULT_STATE;
  const mobile = useIsMobile();

  const [fields, setFields] = useState({
    who: init.who, why: init.why, what_before: init.what_before,
    how: init.how, what_after: init.what_after, alternatives: init.alternatives,
  });
  const [title, setTitle] = useState(init.title);
  const [context, setContext] = useState(init.context);
  const [toast, setToast] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const fileRef = useRef(null);

  const setField = (key, val) => setFields(prev => ({ ...prev, [key]: val }));
  const currentState = { ...fields, title, context };
  useAutoSave(currentState);

  const filledCount = SECTIONS.filter(s => fields[s.key]?.trim()).length;

  // Pull from Input Panel
  const pullFromInput = () => {
    try {
      const raw = window.localStorage.getItem("dk-stage0-session");
      if (!raw) { setToast("No Input Panel data found"); return; }
      const data = JSON.parse(raw);
      let pulled = 0;
      if (data.segment && !fields.who.trim()) { setField("who", data.segment); pulled++; }
      if (data.jtbd) {
        const jtbd = `When ${data.jtbd.situation}, I want to ${data.jtbd.motivation}, so I can ${data.jtbd.outcome}`;
        if (!fields.why.trim() && data.jtbd.motivation) { setField("why", data.jtbd.motivation); pulled++; }
        if (!fields.what_after.trim() && data.jtbd.outcome) { setField("what_after", data.jtbd.outcome); pulled++; }
      }
      if (data.competitors && data.competitors.length && !fields.alternatives.trim()) {
        setField("alternatives", data.competitors.filter(c => c.name).map(c => c.name).join(", "));
        pulled++;
      }
      setToast(pulled ? `${pulled} field${pulled > 1 ? "s" : ""} populated from Input Panel` : "No new data to pull");
    } catch (e) { setToast("Error reading Input Panel"); }
  };

  const importJSON = useCallback((json) => {
    try {
      const data = typeof json === "string" ? JSON.parse(json) : json;
      const results = data.results_payload || data;
      const vp = results.value_proposition;
      if (!vp) { setToast("No value_proposition data found"); return; }
      SECTIONS.forEach(s => { if (vp[s.key]) setField(s.key, vp[s.key]); });
      setToast("Value Proposition populated from Manus"); setShowImport(false); setImportText("");
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
      .card{padding:18px;border-radius:12px;border:2px solid}
      h1{font-size:24px;color:#1B4F72;margin:0 0 4px} h3{margin:0 0 8px}
      @media print{body{padding:20px}}</style></head><body>
      <p style="font-size:11px;color:#1B9C85;font-family:'DM Mono',monospace;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">Product Development Agentic OS · Stage 0</p>
      <h1>${title}</h1>
      ${context ? `<p style="font-size:13px;color:#5D6D7E;margin-top:8px">${context}</p>` : ""}
      <p style="font-size:11px;color:#95A5A6;margin:8px 0 20px">Generated ${new Date().toLocaleDateString()} · ${filledCount}/6 sections completed</p>
      <div class="grid">
        ${SECTIONS.map(s => `<div class="card" style="background:${s.bg};border-color:${s.color}30">
          <h3 style="color:${s.color};font-size:14px">${s.icon} ${s.label}</h3>
          <p style="font-size:13px;color:#2C3E50;line-height:1.5;margin:0;white-space:pre-wrap">${fields[s.key] || "<em style='color:#95A5A6'>Not filled</em>"}</p>
        </div>`).join("")}
      </div>
      <p style="font-size:10px;color:#BDC3C7;text-align:center;margin-top:30px">Product Development Agentic OS · Value Proposition Canvas</p>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  const clearAll = () => {
    setFields({ who: "", why: "", what_before: "", how: "", what_after: "", alternatives: "" });
    setTitle("Value Proposition Canvas"); setContext("");
    window.localStorage.removeItem(STORAGE_KEY); setToast("Canvas cleared");
  };

  const saveSession = () => {
    const blob = new Blob([JSON.stringify(currentState, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `value-prop-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url); setToast("Canvas saved to file");
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: mobile ? "16px 14px" : "32px 24px", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      <a onClick={() => window.location.href = "/stage/0"} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#2980B9", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, marginBottom: 16, textDecoration: "none", minHeight: 44 }}>
        ← Back To Stage 0
      </a>

      <div style={{ marginBottom: 20, borderBottom: "3px solid #3498DB", paddingBottom: 16 }}>
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
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1B4F72", margin: "0 0 8px 0" }}>Import Data</p>
          <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder='Paste Manus results JSON...'
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

      {/* 6-part canvas grid */}
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? 14 : 18 }}>
        {SECTIONS.map(section => (
          <div key={section.key} style={{ background: section.bg, borderRadius: 14, padding: mobile ? 14 : 18, border: `2px solid ${section.color}25`, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>{section.icon}</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: section.color, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{section.label}</h3>
              {fields[section.key]?.trim() && <span style={{ fontSize: 10, color: "#1B9C85", fontFamily: "'DM Mono', monospace", marginLeft: "auto" }}>✓</span>}
            </div>
            <p style={{ fontSize: 11, color: "#7F8C8D", margin: "0 0 10px 0", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3 }}>{section.prompt}</p>
            <textarea value={fields[section.key]} onChange={e => setField(section.key, e.target.value)}
              placeholder={`Describe ${section.label.toLowerCase()}...`}
              rows={4} style={{ flex: 1, width: "100%", border: "1px solid #fff", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", resize: "vertical", outline: "none", background: "#fff", boxSizing: "border-box", lineHeight: 1.5, minHeight: 80 }} />
          </div>
        ))}
      </div>

      {/* One-liner summary */}
      {fields.who.trim() && fields.why.trim() && (
        <div style={{ marginTop: 20, padding: "16px 20px", background: "#EBF5FB", borderRadius: 12, border: "1px solid #AED6F1" }}>
          <p style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#2980B9", margin: "0 0 6px 0", fontWeight: 600 }}>VALUE PROPOSITION STATEMENT</p>
          <p style={{ fontSize: 14, color: "#1B4F72", margin: 0, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
            For <strong>{fields.who}</strong> who need <strong>{fields.why || "..."}</strong>,
            {fields.how ? ` we provide ${fields.how}` : ""}{fields.what_after ? ` so they can ${fields.what_after}` : ""}{fields.alternatives ? `, unlike ${fields.alternatives}` : ""}.
          </p>
        </div>
      )}

      <div style={{ marginTop: 20, padding: "14px 18px", background: "#F8F9FA", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {SECTIONS.map(s => (
            <div key={s.key} style={{ width: 8, height: 8, borderRadius: "50%", background: fields[s.key]?.trim() ? s.color : "#D5D8DC" }} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#1B9C85" }}>Auto-saved ✓</span>
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>{filledCount}/6 sections</span>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
