// AssumptionMap.tsx — Ported from Level 1 AssumptionMap.jsx
'use client';
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage2-assumptions";
const QUADRANTS = [
  { key: "test_first", label: "Test First", color: "#E74C3C", importance: "high", evidence: "weak", desc: "High risk. Validate before proceeding." },
  { key: "monitor", label: "Monitor", color: "#F1C40F", importance: "high", evidence: "strong", desc: "Important and supported. Keep watching." },
  { key: "deprioritize", label: "Deprioritize", color: "#95A5A6", importance: "low", evidence: "weak", desc: "Low stakes, weak evidence. Ignore for now." },
  { key: "safe", label: "Safe to Assume", color: "#1B9C85", importance: "low", evidence: "strong", desc: "Low stakes with evidence. Move on." },
];
const EMPTY_ASSUMPTION = { text: "", importance: "high", evidence: "weak", testPlan: "", status: "untested" };

function useAutoSave(s) { const t = useRef(null); useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [s]); }
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

function getQuadrant(a) { return QUADRANTS.find(q => q.importance === a.importance && q.evidence === a.evidence) || QUADRANTS[0]; }

export default function AssumptionMap() {
  const [theme] = useState(getTheme); const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  const [state, setState] = useState(() => loadSaved() || { assumptions: [{ ...EMPTY_ASSUMPTION }] });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const update = (i, k, v) => setState(prev => { const a = [...prev.assumptions]; a[i] = { ...a[i], [k]: v }; return { ...prev, assumptions: a }; });
  const add = () => setState(prev => ({ ...prev, assumptions: [...prev.assumptions, { ...EMPTY_ASSUMPTION }] }));
  const remove = (i) => setState(prev => ({ ...prev, assumptions: prev.assumptions.filter((_, j) => j !== i) }));
  const fieldStyle = { width: "100%", padding: "8px 10px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.text, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif", resize: "vertical" };
  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 2, framework: "assumption_map", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); };

  const statusColors = { untested: "#E74C3C", testing: "#F1C40F", validated: "#1B9C85", invalidated: "#8E44AD" };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 28, borderBottom: "3px solid #F1C40F", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#F1C40F", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 2 · Opportunity Scout</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Assumption Map</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>Importance × Evidence. Test the riskiest first.</p>
      </div>

      {/* 2x2 legend */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 18 }}>
        {QUADRANTS.map(q => (
          <div key={q.key} style={{ padding: "8px 12px", borderRadius: 8, background: `${q.color}08`, border: `1px solid ${q.color}25` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: q.color }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: q.color }}>{q.label}</span>
              <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: t.textDim, marginLeft: "auto" }}>{state.assumptions.filter(a => getQuadrant(a).key === q.key).length}</span>
            </div>
            <p style={{ fontSize: 10, color: t.textDim, margin: 0 }}>{q.importance} importance · {q.evidence} evidence — {q.desc}</p>
          </div>
        ))}
      </div>

      {state.assumptions.map((a, i) => {
        const q = getQuadrant(a);
        return (
          <div key={i} style={{ marginBottom: 10, padding: "12px 14px", background: t.card, border: `1px solid ${q.color}30`, borderRadius: 12, borderLeft: `4px solid ${q.color}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: q.color, fontFamily: "'DM Mono',monospace" }}>{q.label.toUpperCase()}</span>
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: `${statusColors[a.status]}15`, color: statusColors[a.status], fontWeight: 600, fontFamily: "'DM Mono',monospace", marginLeft: "auto" }}>{a.status}</span>
              {state.assumptions.length > 1 && <button onClick={() => remove(i)} style={{ background: "none", border: "none", color: "#E74C3C60", cursor: "pointer", fontSize: 14 }}>×</button>}
            </div>
            <textarea value={a.text} onChange={e => update(i, "text", e.target.value)} rows={1} placeholder="We assume that..." style={{ ...fieldStyle, fontWeight: 600, marginBottom: 6 }} />
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr 1fr", gap: 6, marginBottom: 6 }}>
              <div>
                <p style={{ fontSize: 10, color: t.textDim, margin: "0 0 3px" }}>Importance</p>
                <div style={{ display: "flex", gap: 4 }}>
                  {["high", "low"].map(v => (
                    <button key={v} onClick={() => update(i, "importance", v)} style={{ flex: 1, padding: "6px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1px solid ${t.cardBorder}`, background: a.importance === v ? (v === "high" ? "#E74C3C15" : "#95A5A615") : "transparent", color: a.importance === v ? (v === "high" ? "#E74C3C" : "#95A5A6") : t.textDim }}>{v}</button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 10, color: t.textDim, margin: "0 0 3px" }}>Evidence</p>
                <div style={{ display: "flex", gap: 4 }}>
                  {["weak", "strong"].map(v => (
                    <button key={v} onClick={() => update(i, "evidence", v)} style={{ flex: 1, padding: "6px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1px solid ${t.cardBorder}`, background: a.evidence === v ? (v === "weak" ? "#E74C3C15" : "#1B9C8515") : "transparent", color: a.evidence === v ? (v === "weak" ? "#E74C3C" : "#1B9C85") : t.textDim }}>{v}</button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 10, color: t.textDim, margin: "0 0 3px" }}>Status</p>
                <div style={{ display: "flex", gap: 4 }}>
                  {["untested", "testing", "validated", "invalidated"].map(v => (
                    <button key={v} onClick={() => update(i, "status", v)} style={{ flex: 1, padding: "6px", borderRadius: 6, fontSize: 9, fontWeight: 600, cursor: "pointer", border: `1px solid ${t.cardBorder}`, background: a.status === v ? `${statusColors[v]}15` : "transparent", color: a.status === v ? statusColors[v] : t.textDim }}>{v.slice(0, 4)}</button>
                  ))}
                </div>
              </div>
            </div>
            <textarea value={a.testPlan} onChange={e => update(i, "testPlan", e.target.value)} rows={1} placeholder="How will you test this assumption?" style={fieldStyle} />
          </div>
        );
      })}
      <button onClick={add} style={{ width: "100%", padding: "12px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 10, fontSize: 13, color: t.textMuted, cursor: "pointer", marginBottom: 18 }}>+ Add Assumption</button>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#F1C40F", color: "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={() => { const raw = prompt("Paste JSON:"); if (!raw) return; try { setState({ ...JSON.parse(raw) }); setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } }} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
