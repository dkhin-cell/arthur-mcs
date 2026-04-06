// KanoModel.tsx — Ported from Level 1 KanoModel.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "dk-stage0-kano";

const KANO_TYPES = [
  { key: "must_be", label: "Must-be", color: "#E74C3C", bg: "#FDEDEC", desc: "Expected. Absence causes dissatisfaction, but presence doesn't delight." },
  { key: "performance", label: "Performance", color: "#E67E22", bg: "#FEF5E7", desc: "More is better. Linear relationship between fulfillment and satisfaction." },
  { key: "attractive", label: "Attractive", color: "#27AE60", bg: "#EAFAF1", desc: "Delighters. Unexpected features that create outsized satisfaction." },
  { key: "indifferent", label: "Indifferent", color: "#95A5A6", bg: "#F2F3F4", desc: "Users don't care. Neither satisfaction nor dissatisfaction." },
  { key: "reverse", label: "Reverse", color: "#8E44AD", bg: "#F5EEF8", desc: "Actively unwanted. Presence causes dissatisfaction." },
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

const DEFAULT_STATE = { features: [], title: "Kano Model", context: "" };

export default function KanoModel() {
  const saved = loadSaved();
  const init = saved || DEFAULT_STATE;
  const mobile = useIsMobile();

  const [features, setFeatures] = useState(init.features);
  const [title, setTitle] = useState(init.title);
  const [context, setContext] = useState(init.context);
  const [toast, setToast] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const fileRef = useRef(null);

  const currentState = { features, title, context };
  useAutoSave(currentState);

  const addFeature = () => setFeatures([...features, { id: Date.now(), name: "", category: "indifferent", evidence: "" }]);

  const updateFeature = (i, updated) => setFeatures(features.map((f, j) => j === i ? updated : f));
  const removeFeature = (i) => setFeatures(features.filter((_, j) => j !== i));

  const categoryCounts = KANO_TYPES.reduce((acc, t) => {
    acc[t.key] = features.filter(f => f.category === t.key).length;
    return acc;
  }, {});

  const importJSON = useCallback((json) => {
    try {
      const data = typeof json === "string" ? JSON.parse(json) : json;
      const results = data.results_payload || data;
      const kano = results.kano_model;
      if (!kano) { setToast("No kano_model data found"); return; }
      const newFeatures = [];
      KANO_TYPES.forEach(t => {
        (kano[t.key] || []).forEach((item, i) => {
          newFeatures.push({
            id: Date.now() + i + Math.random(),
            name: typeof item === "string" ? item : item.name || "",
            category: t.key,
            evidence: typeof item === "object" ? item.evidence || "" : "",
          });
        });
      });
      if (newFeatures.length) { setFeatures(newFeatures); setToast("Kano model populated from Manus"); setShowImport(false); setImportText(""); }
      else { setToast("No features found in data"); }
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
      table{width:100%;border-collapse:collapse;font-size:13px}
      th{background:#1B4F72;color:#fff;padding:10px 12px;text-align:left;font-weight:600;font-size:12px}
      td{padding:8px 12px;border-bottom:1px solid #E8EAED}
      h1{font-size:24px;color:#1B4F72;margin:0 0 4px}
      @media print{body{padding:20px}}</style></head><body>
      <p style="font-size:11px;color:#1B9C85;font-family:'DM Mono',monospace;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">Product Development Agentic OS · Stage 0</p>
      <h1>${title}</h1>
      ${context ? `<p style="font-size:13px;color:#5D6D7E;margin-top:8px">${context}</p>` : ""}
      <p style="font-size:11px;color:#95A5A6;margin:8px 0 20px">Generated ${new Date().toLocaleDateString()} · ${features.length} features classified</p>
      <table><thead><tr><th>Feature/Need</th><th>Category</th><th>Evidence</th></tr></thead><tbody>
      ${features.map(f => {
        const t = KANO_TYPES.find(k => k.key === f.category);
        return `<tr><td style="font-weight:600">${f.name || "(empty)"}</td><td><span style="padding:3px 10px;border-radius:10px;background:${t.bg};color:${t.color};font-size:11px;font-weight:600">${t.label}</span></td><td style="color:#7F8C8D;font-size:12px">${f.evidence || "—"}</td></tr>`;
      }).join("")}
      </tbody></table>
      <div style="margin-top:20px;display:flex;gap:16px;flex-wrap:wrap">
        ${KANO_TYPES.map(t => `<span style="font-size:12px;padding:4px 12px;border-radius:8px;background:${t.bg};color:${t.color};font-weight:600">${t.label}: ${categoryCounts[t.key]}</span>`).join("")}
      </div>
      <p style="font-size:10px;color:#BDC3C7;text-align:center;margin-top:30px">Product Development Agentic OS · Kano Model</p>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  const clearAll = () => {
    setFeatures([]); setTitle("Kano Model"); setContext("");
    window.localStorage.removeItem(STORAGE_KEY);
    setToast("Model cleared");
  };

  const saveSession = () => {
    const blob = new Blob([JSON.stringify(currentState, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `kano-model-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    setToast("Model saved to file");
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
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1B4F72", margin: "0 0 8px 0" }}>Import From Manus Results</p>
          <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder='Paste Manus results JSON here...'
            rows={4} style={{ width: "100%", padding: "10px 12px", border: "1px solid #AED6F1", borderRadius: 8, fontSize: 12, fontFamily: "'DM Mono', monospace", resize: "vertical", outline: "none", background: "#fff", boxSizing: "border-box", marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => importJSON(importText)} disabled={!importText.trim()} style={{ padding: "10px 20px", background: importText.trim() ? "#2980B9" : "#D5D8DC", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: importText.trim() ? "pointer" : "not-allowed", minHeight: 44 }}>Import</button>
            <button onClick={() => fileRef.current?.click()} style={{ padding: "10px 20px", background: "#1B4F72", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>Upload .json</button>
            <button onClick={() => { setShowImport(false); setImportText(""); }} style={{ padding: "10px 20px", background: "none", color: "#5D6D7E", border: "1px solid #D5D8DC", borderRadius: 8, fontSize: 13, cursor: "pointer", minHeight: 44 }}>Cancel</button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleFileImport} style={{ display: "none" }} />
          </div>
        </div>
      )}

      {/* Category legend */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {KANO_TYPES.map(t => (
          <div key={t.key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: t.bg, borderRadius: 8, border: `1px solid ${t.color}25` }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: t.color, fontFamily: "'DM Sans', sans-serif" }}>{t.label}</span>
            <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#95A5A6" }}>({categoryCounts[t.key]})</span>
          </div>
        ))}
      </div>

      {/* Feature table */}
      <div style={{ background: "#FDFEFE", border: "1px solid #E8EAED", borderRadius: 14, overflow: "hidden" }}>
        {features.map((feature, i) => {
          const type = KANO_TYPES.find(t => t.key === feature.category) || KANO_TYPES[3];
          return (
            <div key={feature.id} style={{ padding: "14px 18px", borderBottom: i < features.length - 1 ? "1px solid #F2F3F4" : "none", display: "flex", gap: 12, alignItems: "flex-start", flexWrap: mobile ? "wrap" : "nowrap" }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <input value={feature.name} onChange={e => updateFeature(i, { ...feature, name: e.target.value })}
                  placeholder="Feature or need..."
                  style={{ width: "100%", border: "none", outline: "none", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#2C3E50", background: "transparent", padding: 0, marginBottom: 4 }} />
                <input value={feature.evidence || ""} onChange={e => updateFeature(i, { ...feature, evidence: e.target.value })}
                  placeholder="Evidence or source..."
                  style={{ width: "100%", border: "none", outline: "none", fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: "#95A5A6", background: "transparent", padding: 0 }} />
              </div>
              <select value={feature.category} onChange={e => updateFeature(i, { ...feature, category: e.target.value })}
                style={{ padding: "8px 10px", border: `1px solid ${type.color}30`, borderRadius: 8, fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, background: type.bg, color: type.color, minHeight: 36, cursor: "pointer" }}>
                {KANO_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
              <button onClick={() => removeFeature(i)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#E74C3C", padding: "4px", minWidth: 28, minHeight: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
            </div>
          );
        })}

        <button onClick={addFeature} style={{
          width: "100%", padding: "14px", background: "#FAFBFC", border: "none", borderTop: features.length ? "1px solid #F2F3F4" : "none",
          fontSize: 13, color: "#3498DB", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, minHeight: 48,
        }}>
          + Add Feature / Need
        </button>
      </div>

      <div style={{ marginTop: 20, padding: "14px 18px", background: "#F8F9FA", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 12 }}>
          {KANO_TYPES.map(t => (
            <div key={t.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color }} />
              <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>{categoryCounts[t.key]}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#1B9C85" }}>Auto-saved ✓</span>
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>{features.length} features</span>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
