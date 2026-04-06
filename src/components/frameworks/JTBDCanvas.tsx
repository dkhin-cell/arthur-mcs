// JTBDCanvas.tsx — Ported from Level 1 JTBDCanvas.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage2-jtbd";
const EMPTY_JOB = { functional: "", emotional: "", social: "", current_solution: "", satisfaction: 3 };
const EMPTY_ENTRY = { opportunity: "", jobs: { ...EMPTY_JOB } };

function useAutoSave(s) { const t = useRef(null); useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [s]); }
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

export default function JTBDCanvas() {
  const [theme] = useState(getTheme); const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  const [state, setState] = useState(() => loadSaved() || { entries: [{ ...EMPTY_ENTRY, jobs: { ...EMPTY_JOB } }] });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const update = (i, k, v) => setState(prev => { const e = [...prev.entries]; if (k.startsWith("jobs.")) { const jk = k.split(".")[1]; e[i] = { ...e[i], jobs: { ...e[i].jobs, [jk]: v } }; } else { e[i] = { ...e[i], [k]: v }; } return { ...prev, entries: e }; });
  const add = () => setState(prev => ({ ...prev, entries: [...prev.entries, { ...EMPTY_ENTRY, jobs: { ...EMPTY_JOB } }] }));
  const remove = (i) => setState(prev => ({ ...prev, entries: prev.entries.filter((_, j) => j !== i) }));

  const fieldStyle = { width: "100%", padding: "8px 10px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.text, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif", resize: "vertical" };
  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 2, framework: "jtbd_canvas", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 28, borderBottom: "3px solid #F1C40F", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#F1C40F", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 2 · Opportunity Scout</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>JTBD Canvas</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>Map functional, emotional, and social jobs for each opportunity.</p>
      </div>
      {state.entries.map((entry, i) => (
        <div key={i} style={{ marginBottom: 16, background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.cardBorder}`, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#F1C40F", fontFamily: "'DM Mono',monospace" }}>O{i + 1}</span>
            <input value={entry.opportunity} onChange={e => update(i, "opportunity", e.target.value)} placeholder="Opportunity name..." style={{ flex: 1, padding: "6px 0", background: "transparent", border: "none", fontSize: 16, fontWeight: 700, color: t.text, outline: "none" }} />
            {state.entries.length > 1 && <button onClick={() => remove(i)} style={{ background: "none", border: "none", color: "#E74C3C80", cursor: "pointer", fontSize: 16 }}>×</button>}
          </div>
          <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 10 }}>
            {[
              { key: "functional", label: "Functional Job", icon: "⚙️", hint: "What task are they trying to accomplish?", color: "#3498DB" },
              { key: "emotional", label: "Emotional Job", icon: "❤️", hint: "How do they want to feel?", color: "#E74C3C" },
              { key: "social", label: "Social Job", icon: "👥", hint: "How do they want to be perceived?", color: "#8E44AD" },
              { key: "current_solution", label: "Current Solution", icon: "🔄", hint: "What do they do today?", color: "#E67E22" },
            ].map(job => (
              <div key={job.key} style={{ padding: "10px 12px", background: t.input, borderRadius: 10, border: `1px solid ${t.cardBorder}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>{job.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: job.color }}>{job.label}</span>
                </div>
                <p style={{ fontSize: 10, color: t.textDim, margin: "0 0 4px" }}>{job.hint}</p>
                <textarea value={entry.jobs[job.key]} onChange={e => update(i, `jobs.${job.key}`, e.target.value)} rows={2} style={fieldStyle} />
              </div>
            ))}
          </div>
          <div style={{ padding: "0 16px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: t.text }}>Satisfaction with current solution:</span>
              <div style={{ display: "flex", gap: 4 }}>
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} onClick={() => update(i, "jobs.satisfaction", v)} style={{ width: 32, height: 32, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: entry.jobs.satisfaction >= v ? "#F1C40F" : t.input, color: entry.jobs.satisfaction >= v ? "#000" : t.textMuted }}>{v}</button>
                ))}
              </div>
              <span style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace" }}>{entry.jobs.satisfaction <= 2 ? "Low — opportunity" : entry.jobs.satisfaction >= 4 ? "High — hard to displace" : "Medium"}</span>
            </div>
          </div>
        </div>
      ))}
      <button onClick={add} style={{ width: "100%", padding: "14px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 10, fontSize: 13, color: t.textMuted, cursor: "pointer", marginBottom: 18 }}>+ Add Opportunity</button>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#F1C40F", color: "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={() => { const raw = prompt("Paste JSON data:"); if (!raw) return; try { setState(prev => ({ ...prev, ...JSON.parse(raw) })); setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } }} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
