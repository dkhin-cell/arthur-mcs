// DACI.tsx — Ported from Level 1 DACI.jsx
'use client';
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage1-daci";
const ROLES = [
  { key: "driver", label: "Driver", icon: "🏎", color: "#E74C3C", hint: "The single person accountable for getting this decision made. Not necessarily the decider." },
  { key: "approver", label: "Approver", icon: "✅", color: "#1B9C85", hint: "The person who makes the final call. Only one approver per decision." },
  { key: "contributors", label: "Contributors", icon: "💬", color: "#3498DB", hint: "People whose input is sought before the decision. They have knowledge but not a vote." },
  { key: "informed", label: "Informed", icon: "📬", color: "#E67E22", hint: "People who need to know the outcome but don't participate in making the decision." },
];
const EMPTY_DECISION = { title: "", driver: "", approver: "", contributors: "", informed: "", status: "open", notes: "" };

function useAutoSave(state) {
  const t = useRef(null);
  useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [state]);
}
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

export default function DACI() {
  const [theme] = useState(getTheme);
  const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);

  const [state, setState] = useState(() => loadSaved() || { title: "DACI Framework", decisions: [{ ...EMPTY_DECISION }] });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const updateDec = (di, field, val) => setState(prev => { const d = [...prev.decisions]; d[di] = { ...d[di], [field]: val }; return { ...prev, decisions: d }; });
  const addDec = () => setState(prev => ({ ...prev, decisions: [...prev.decisions, { ...EMPTY_DECISION }] }));
  const removeDec = (di) => setState(prev => ({ ...prev, decisions: prev.decisions.filter((_, i) => i !== di) }));

  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 1, framework: "daci", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); };
  const importJSON = () => { const raw = prompt("Paste JSON data:"); if (!raw) return; try { setState(prev => ({ ...prev, ...JSON.parse(raw) })); setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 28, borderBottom: "3px solid #2980B9", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#2980B9", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 1 · Strategy Architect</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>DACI Framework</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>Map decision rights for every key strategic decision.</p>
      </div>

      {/* Role legend */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {ROLES.map(r => (
          <div key={r.key} style={{ padding: "6px 12px", borderRadius: 8, background: `${r.color}10`, border: `1px solid ${r.color}30`, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14 }}>{r.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: r.color }}>{r.label}</span>
          </div>
        ))}
      </div>

      {state.decisions.map((dec, di) => (
        <div key={di} style={{ marginBottom: 16, background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.cardBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#2980B9", fontFamily: "'DM Mono',monospace" }}>D{di + 1}</span>
            <input value={dec.title} onChange={e => updateDec(di, "title", e.target.value)} placeholder="Decision to be made..."
              style={{ flex: 1, padding: "6px 0", background: "transparent", border: "none", fontSize: 15, fontWeight: 700, color: t.text, outline: "none" }} />
            <select value={dec.status} onChange={e => updateDec(di, "status", e.target.value)}
              style={{ padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, border: `1px solid ${t.cardBorder}`, background: dec.status === "decided" ? "#1B9C8520" : t.input, color: dec.status === "decided" ? "#1B9C85" : t.textMuted }}>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="decided">Decided</option>
            </select>
            {state.decisions.length > 1 && <button onClick={() => removeDec(di)} style={{ background: "none", border: "none", color: "#E74C3C80", cursor: "pointer", fontSize: 16 }}>×</button>}
          </div>
          <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 10 }}>
            {ROLES.map(role => (
              <div key={role.key} style={{ padding: "8px 10px", background: t.input, borderRadius: 8, border: `1px solid ${t.cardBorder}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>{role.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: role.color }}>{role.label}</span>
                </div>
                <input value={dec[role.key] || ""} onChange={e => updateDec(di, role.key, e.target.value)} placeholder={role.hint.slice(0, 50) + "..."}
                  style={{ width: "100%", padding: "6px 8px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 6, fontSize: 12, color: t.text, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
          </div>
          <div style={{ padding: "0 16px 12px" }}>
            <textarea value={dec.notes || ""} onChange={e => updateDec(di, "notes", e.target.value)} rows={2} placeholder="Decision notes, context, constraints..."
              style={{ width: "100%", padding: "8px 10px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.text, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </div>
        </div>
      ))}
      <button onClick={addDec} style={{ width: "100%", padding: "14px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 10, fontSize: 13, color: t.textMuted, cursor: "pointer", marginBottom: 18 }}>+ Add Decision</button>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#2980B9", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={importJSON} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import</button>
        <button onClick={() => { const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `daci-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setToast("Saved"); }} style={{ padding: "12px 20px", background: "#1B9C85", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 48 }}>💾</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
