// BehavioralSignalTracker.tsx — Ported from Level 1 BehavioralSignalTracker.jsx
'use client';
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage2-signals";
const STATUSES = [
  { key: "pending", label: "Pending", color: "#95A5A6" },
  { key: "confirmed", label: "Confirmed", color: "#1B9C85" },
  { key: "denied", label: "Denied", color: "#E74C3C" },
  { key: "inconclusive", label: "Inconclusive", color: "#F1C40F" },
];
const EMPTY_SIGNAL = { signal: "", expected: "", actual: "", source: "", status: "pending" };

function useAutoSave(s) { const t = useRef(null); useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [s]); }
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

export default function BehavioralSignalTracker() {
  const [theme] = useState(getTheme); const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  const [state, setState] = useState(() => loadSaved() || { signals: [{ ...EMPTY_SIGNAL }] });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const update = (i, k, v) => setState(prev => { const s = [...prev.signals]; s[i] = { ...s[i], [k]: v }; return { ...prev, signals: s }; });
  const add = () => setState(prev => ({ ...prev, signals: [...prev.signals, { ...EMPTY_SIGNAL }] }));
  const remove = (i) => setState(prev => ({ ...prev, signals: prev.signals.filter((_, j) => j !== i) }));
  const fieldStyle = { width: "100%", padding: "8px 10px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.text, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif", resize: "vertical" };
  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 2, framework: "signal_tracker", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); };

  const counts = {}; STATUSES.forEach(s => { counts[s.key] = state.signals.filter(sig => sig.status === s.key).length; });

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 28, borderBottom: "3px solid #F1C40F", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#F1C40F", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 2 · Opportunity Scout</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Behavioral Signal Tracker</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>What did you expect to see? What actually happened?</p>
      </div>

      {/* Status summary */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {STATUSES.map(s => (
          <div key={s.key} style={{ padding: "5px 12px", borderRadius: 8, background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{s.label}: {counts[s.key]}</span>
          </div>
        ))}
      </div>

      {state.signals.map((sig, i) => {
        const st = STATUSES.find(s => s.key === sig.status) || STATUSES[0];
        return (
          <div key={i} style={{ marginBottom: 10, padding: "12px 14px", background: t.card, border: `1px solid ${st.color}30`, borderRadius: 12, borderLeft: `4px solid ${st.color}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#F1C40F", fontFamily: "'DM Mono',monospace" }}>#{i + 1}</span>
              <div style={{ display: "flex", gap: 3, marginLeft: "auto" }}>
                {STATUSES.map(s => (
                  <button key={s.key} onClick={() => update(i, "status", s.key)} style={{ padding: "4px 8px", borderRadius: 5, fontSize: 10, fontWeight: 600, cursor: "pointer", border: `1px solid ${s.color}30`, background: sig.status === s.key ? `${s.color}20` : "transparent", color: sig.status === s.key ? s.color : t.textDim }}>{s.label}</button>
                ))}
              </div>
              {state.signals.length > 1 && <button onClick={() => remove(i)} style={{ background: "none", border: "none", color: "#E74C3C60", cursor: "pointer", fontSize: 14 }}>×</button>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 6 }}>
              <div>
                <p style={{ fontSize: 10, color: t.textDim, margin: "0 0 3px", fontFamily: "'DM Mono',monospace" }}>SIGNAL TO OBSERVE</p>
                <textarea value={sig.signal} onChange={e => update(i, "signal", e.target.value)} rows={1} placeholder="What behavior are you watching for?" style={fieldStyle} />
              </div>
              <div>
                <p style={{ fontSize: 10, color: t.textDim, margin: "0 0 3px", fontFamily: "'DM Mono',monospace" }}>EXPECTED BEHAVIOR</p>
                <textarea value={sig.expected} onChange={e => update(i, "expected", e.target.value)} rows={1} placeholder="What you predicted would happen..." style={fieldStyle} />
              </div>
              <div>
                <p style={{ fontSize: 10, color: t.textDim, margin: "0 0 3px", fontFamily: "'DM Mono',monospace" }}>ACTUAL BEHAVIOR</p>
                <textarea value={sig.actual} onChange={e => update(i, "actual", e.target.value)} rows={1} placeholder="What actually happened..." style={fieldStyle} />
              </div>
              <div>
                <p style={{ fontSize: 10, color: t.textDim, margin: "0 0 3px", fontFamily: "'DM Mono',monospace" }}>EVIDENCE SOURCE</p>
                <input value={sig.source} onChange={e => update(i, "source", e.target.value)} placeholder="Interview, analytics, observation..." style={fieldStyle} />
              </div>
            </div>
          </div>
        );
      })}
      <button onClick={add} style={{ width: "100%", padding: "12px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 10, fontSize: 13, color: t.textMuted, cursor: "pointer", marginBottom: 18 }}>+ Add Signal</button>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#F1C40F", color: "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={() => { const raw = prompt("Paste JSON:"); if (!raw) return; try { setState({ ...JSON.parse(raw) }); setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } }} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
