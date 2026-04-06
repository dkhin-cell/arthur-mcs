// OKRBuilder.tsx — Ported from Level 1 OKRBuilder.jsx
'use client';
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage1-okr";
const EMPTY_KR = { metric: "", baseline: "", target: "", confidence: 5 };
const EMPTY_OBJ = { title: "", key_results: [{ ...EMPTY_KR }] };

function useAutoSave(state) {
  const t = useRef(null);
  useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [state]);
}
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

export default function OKRBuilder() {
  const [theme] = useState(getTheme);
  const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);

  const [state, setState] = useState(() => loadSaved() || { title: "OKR Builder", objectives: [{ ...EMPTY_OBJ, key_results: [{ ...EMPTY_KR }] }] });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const updateObj = (oi, val) => setState(prev => { const o = [...prev.objectives]; o[oi] = { ...o[oi], title: val }; return { ...prev, objectives: o }; });
  const addObj = () => { if (state.objectives.length < 5) setState(prev => ({ ...prev, objectives: [...prev.objectives, { ...EMPTY_OBJ, key_results: [{ ...EMPTY_KR }] }] })); };
  const removeObj = (oi) => setState(prev => ({ ...prev, objectives: prev.objectives.filter((_, i) => i !== oi) }));
  const updateKR = (oi, ki, field, val) => setState(prev => {
    const o = [...prev.objectives]; const krs = [...o[oi].key_results]; krs[ki] = { ...krs[ki], [field]: val }; o[oi] = { ...o[oi], key_results: krs }; return { ...prev, objectives: o };
  });
  const addKR = (oi) => setState(prev => {
    const o = [...prev.objectives]; if (o[oi].key_results.length < 4) o[oi] = { ...o[oi], key_results: [...o[oi].key_results, { ...EMPTY_KR }] }; return { ...prev, objectives: o };
  });
  const removeKR = (oi, ki) => setState(prev => {
    const o = [...prev.objectives]; o[oi] = { ...o[oi], key_results: o[oi].key_results.filter((_, i) => i !== ki) }; return { ...prev, objectives: o };
  });

  const confColor = (c) => c >= 7 ? "#1B9C85" : c >= 4 ? "#E67E22" : "#E74C3C";
  const totalKRs = state.objectives.reduce((s, o) => s + o.key_results.filter(kr => kr.metric.trim()).length, 0);

  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 1, framework: "okr", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); };
  const importJSON = () => { const raw = prompt("Paste JSON data:"); if (!raw) return; try { setState(prev => ({ ...prev, ...JSON.parse(raw) })); setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 28, borderBottom: "3px solid #2980B9", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#2980B9", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 1 · Strategy Architect</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>OKR Builder</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: "0 0 6px" }}>3-5 objectives with 2-4 measurable key results each.</p>
        <span style={{ fontSize: 12, fontFamily: "'DM Mono',monospace", color: t.textDim }}>{state.objectives.length} objectives · {totalKRs} key results</span>
      </div>

      {state.objectives.map((obj, oi) => (
        <div key={oi} style={{ marginBottom: 18, background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.cardBorder}`, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#2980B9", fontFamily: "'DM Mono',monospace" }}>O{oi + 1}</span>
            <input value={obj.title} onChange={e => updateObj(oi, e.target.value)} placeholder={`Objective ${oi + 1}...`}
              style={{ flex: 1, padding: "6px 0", background: "transparent", border: "none", fontSize: 16, fontWeight: 700, color: t.text, outline: "none", fontFamily: "'DM Sans',sans-serif" }} />
            {state.objectives.length > 1 && <button onClick={() => removeObj(oi)} style={{ background: "none", border: "none", color: "#E74C3C80", cursor: "pointer", fontSize: 16 }}>×</button>}
          </div>
          <div style={{ padding: "12px 16px" }}>
            {obj.key_results.map((kr, ki) => (
              <div key={ki} style={{ padding: "10px 12px", background: t.input, borderRadius: 10, border: `1px solid ${t.cardBorder}`, marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#2980B9", fontFamily: "'DM Mono',monospace" }}>KR{ki + 1}</span>
                  <input value={kr.metric} onChange={e => updateKR(oi, ki, "metric", e.target.value)} placeholder="Key result metric..."
                    style={{ flex: 1, padding: "4px 0", background: "transparent", border: "none", fontSize: 13, fontWeight: 600, color: t.text, outline: "none" }} />
                  {obj.key_results.length > 1 && <button onClick={() => removeKR(oi, ki)} style={{ background: "none", border: "none", color: "#E74C3C60", cursor: "pointer", fontSize: 12 }}>×</button>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <div>
                    <p style={{ fontSize: 10, color: t.textDim, margin: "0 0 2px", fontFamily: "'DM Mono',monospace" }}>BASELINE</p>
                    <input value={kr.baseline} onChange={e => updateKR(oi, ki, "baseline", e.target.value)} placeholder="0"
                      style={{ width: "100%", padding: "6px 8px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 6, fontSize: 12, color: t.text, outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: t.textDim, margin: "0 0 2px", fontFamily: "'DM Mono',monospace" }}>TARGET</p>
                    <input value={kr.target} onChange={e => updateKR(oi, ki, "target", e.target.value)} placeholder="—"
                      style={{ width: "100%", padding: "6px 8px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 6, fontSize: 12, color: "#1B9C85", fontWeight: 600, outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: t.textDim, margin: "0 0 2px", fontFamily: "'DM Mono',monospace" }}>CONFIDENCE</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input type="range" min={1} max={10} value={kr.confidence} onChange={e => updateKR(oi, ki, "confidence", parseInt(e.target.value))}
                        style={{ flex: 1, height: 4 }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: confColor(kr.confidence), fontFamily: "'DM Mono',monospace", width: 24, textAlign: "center" }}>{kr.confidence}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {obj.key_results.length < 4 && (
              <button onClick={() => addKR(oi)} style={{ width: "100%", padding: "8px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 8, fontSize: 11, color: t.textMuted, cursor: "pointer" }}>+ Add Key Result</button>
            )}
          </div>
        </div>
      ))}
      {state.objectives.length < 5 && (
        <button onClick={addObj} style={{ width: "100%", padding: "14px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 10, fontSize: 13, color: t.textMuted, cursor: "pointer", marginBottom: 18 }}>+ Add Objective</button>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#2980B9", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={importJSON} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import</button>
        <button onClick={() => { const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `okr-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setToast("Saved"); }} style={{ padding: "12px 20px", background: "#1B9C85", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 48 }}>💾</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
