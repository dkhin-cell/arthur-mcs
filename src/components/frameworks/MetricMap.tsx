// MetricMap.tsx — Ported from Level 1 MetricMap.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage1-metricmap";
const NORTHSTAR_KEY = "dk-stage1-northstar";
const EMPTY_METRIC = { name: "", current: "", target: "", owner: "" };

function useAutoSave(state) {
  const t = useRef(null);
  useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [state]);
}
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }
function loadNorthStar() { try { const r = JSON.parse(localStorage.getItem(NORTHSTAR_KEY) || "{}"); return r.selected || ""; } catch (e) {} return ""; }

function MetricRow({ metric, idx, onUpdate, onRemove, color, t }) {
  return (
    <div style={{ padding: "10px 12px", background: t.input, borderRadius: 10, border: `1px solid ${t.cardBorder}`, marginBottom: 8 }}>
      <input value={metric.name} onChange={e => onUpdate(idx, "name", e.target.value)} placeholder="Metric name..."
        style={{ width: "100%", padding: "6px 0", background: "transparent", border: "none", fontSize: 14, fontWeight: 600, color: t.text, outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 6 }}>
        <div>
          <p style={{ fontSize: 10, color: t.textDim, margin: "0 0 2px", fontFamily: "'DM Mono',monospace" }}>CURRENT</p>
          <input value={metric.current} onChange={e => onUpdate(idx, "current", e.target.value)} placeholder="—"
            style={{ width: "100%", padding: "6px 8px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 6, fontSize: 12, color: t.text, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div>
          <p style={{ fontSize: 10, color: t.textDim, margin: "0 0 2px", fontFamily: "'DM Mono',monospace" }}>TARGET</p>
          <input value={metric.target} onChange={e => onUpdate(idx, "target", e.target.value)} placeholder="—"
            style={{ width: "100%", padding: "6px 8px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 6, fontSize: 12, color: color, fontWeight: 600, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div>
          <p style={{ fontSize: 10, color: t.textDim, margin: "0 0 2px", fontFamily: "'DM Mono',monospace" }}>OWNER</p>
          <input value={metric.owner} onChange={e => onUpdate(idx, "owner", e.target.value)} placeholder="—"
            style={{ width: "100%", padding: "6px 8px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 6, fontSize: 12, color: t.text, outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>
      <div style={{ textAlign: "right", marginTop: 4 }}>
        <button onClick={() => onRemove(idx)} style={{ background: "none", border: "none", color: "#E74C3C60", cursor: "pointer", fontSize: 11 }}>Remove</button>
      </div>
    </div>
  );
}

export default function MetricMap() {
  const [theme] = useState(getTheme);
  const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);

  const [state, setState] = useState(() => {
    const saved = loadSaved();
    if (saved) return saved;
    return { title: "Input/Output Metric Map", north_star: loadNorthStar(), inputs: [{ ...EMPTY_METRIC }], outputs: [{ ...EMPTY_METRIC }] };
  });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const updateMetric = (type, idx, field, val) => setState(prev => {
    const arr = [...prev[type]]; arr[idx] = { ...arr[idx], [field]: val }; return { ...prev, [type]: arr };
  });
  const addMetric = (type) => setState(prev => ({ ...prev, [type]: [...prev[type], { ...EMPTY_METRIC }] }));
  const removeMetric = (type, idx) => setState(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== idx) }));

  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 1, framework: "metric_map", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); };
  const importJSON = () => { const raw = prompt("Paste JSON data:"); if (!raw) return; try { setState(prev => ({ ...prev, ...JSON.parse(raw) })); setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } };

  const Arrow = () => <div style={{ display: "flex", justifyContent: "center", padding: mobile ? "8px 0" : "0", alignItems: "center" }}><span style={{ fontSize: 24, color: t.textDim }}>{mobile ? "↓" : "→"}</span></div>;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 28, borderBottom: "3px solid #2980B9", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#2980B9", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 1 · Strategy Architect</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Input/Output Metric Map</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>Map the flow: Input Metrics → North Star → Output Metrics.</p>
      </div>

      <div style={{ display: mobile ? "block" : "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", gap: 16, alignItems: "flex-start" }}>
        {/* Input Metrics */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3498DB" }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: 0 }}>Input Metrics</h3>
            <span style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace" }}>Leading indicators</span>
          </div>
          {state.inputs.map((m, i) => <MetricRow key={i} metric={m} idx={i} onUpdate={(idx, f, v) => updateMetric("inputs", idx, f, v)} onRemove={(idx) => removeMetric("inputs", idx)} color="#3498DB" t={t} />)}
          <button onClick={() => addMetric("inputs")} style={{ width: "100%", padding: "10px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.textMuted, cursor: "pointer" }}>+ Add Input Metric</button>
        </div>

        {!mobile && <Arrow />}

        {/* North Star */}
        <div style={{ marginTop: mobile ? 16 : 0 }}>
          <div style={{ background: `linear-gradient(135deg, #1B9C8520, #2980B920)`, border: "2px solid #1B9C85", borderRadius: 14, padding: "18px 16px", textAlign: "center" }}>
            <span style={{ fontSize: 28 }}>⭐</span>
            <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: t.textDim, margin: "6px 0 4px", textTransform: "uppercase" }}>North Star</p>
            <input value={state.north_star} onChange={e => setState(prev => ({ ...prev, north_star: e.target.value }))} placeholder="Your North Star metric..."
              style={{ width: "100%", padding: "8px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 14, fontWeight: 700, color: "#1B9C85", outline: "none", textAlign: "center", boxSizing: "border-box" }} />
          </div>
        </div>

        {!mobile && <Arrow />}

        {/* Output Metrics */}
        <div style={{ marginTop: mobile ? 16 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#E67E22" }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: 0 }}>Output Metrics</h3>
            <span style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace" }}>Lagging indicators</span>
          </div>
          {state.outputs.map((m, i) => <MetricRow key={i} metric={m} idx={i} onUpdate={(idx, f, v) => updateMetric("outputs", idx, f, v)} onRemove={(idx) => removeMetric("outputs", idx)} color="#E67E22" t={t} />)}
          <button onClick={() => addMetric("outputs")} style={{ width: "100%", padding: "10px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.textMuted, cursor: "pointer" }}>+ Add Output Metric</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 24 }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#2980B9", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={importJSON} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import</button>
        <button onClick={() => { const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `metric-map-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setToast("Saved"); }} style={{ padding: "12px 20px", background: "#1B9C85", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 48 }}>💾</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
