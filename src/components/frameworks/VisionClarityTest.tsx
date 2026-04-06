// VisionClarityTest.tsx — Ported from Level 1 VisionClarityTest.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage1-visiontest";
const STAGE1_KEY = "dk-stage1-session";
const CRITERIA = [
  { key: "specific", label: "Specific", icon: "🎯", question: "Does the vision clearly state WHO you serve, WHAT you deliver, and HOW you differentiate?" },
  { key: "measurable", label: "Measurable", icon: "📏", question: "Can you measure progress toward this vision with concrete metrics?" },
  { key: "time_bound", label: "Time-Bound", icon: "⏱", question: "Does the vision include a clear timeframe (6/12/18 months)?" },
  { key: "inspiring", label: "Inspiring", icon: "🔥", question: "Would this vision motivate your team and attract talent? Does it paint a compelling future?" },
  { key: "differentiating", label: "Differentiating", icon: "⚡", question: "Could a competitor swap their name in and claim the same vision? If yes, it's not differentiating enough." },
];

function useAutoSave(state) {
  const t = useRef(null);
  useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [state]);
}
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }
function loadVision() { try { const r = JSON.parse(localStorage.getItem(STAGE1_KEY) || "{}"); return r.vision_statement || ""; } catch (e) {} return ""; }

export default function VisionClarityTest() {
  const [theme] = useState(getTheme);
  const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);

  const [state, setState] = useState(() => {
    const saved = loadSaved();
    if (saved) return saved;
    const init = { title: "Vision Clarity Test", vision: loadVision(), stress_test: "" };
    CRITERIA.forEach(c => { init[c.key] = { status: "untested", evidence: "" }; });
    return init;
  });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const updateCriterion = (key, field, val) => setState(prev => ({ ...prev, [key]: { ...prev[key], [field]: val } }));
  const passed = CRITERIA.filter(c => state[c.key]?.status === "pass").length;
  const failed = CRITERIA.filter(c => state[c.key]?.status === "fail").length;

  const statusColors = { pass: "#1B9C85", fail: "#E74C3C", untested: t.textDim };
  const statusLabels = { pass: "Pass ✓", fail: "Fail ✗", untested: "Untested" };

  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 1, framework: "vision_test", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); };
  const importJSON = () => { const raw = prompt("Paste JSON data:"); if (!raw) return; try { setState(prev => ({ ...prev, ...JSON.parse(raw) })); setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 28, borderBottom: "3px solid #2980B9", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#2980B9", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 1 · Strategy Architect</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Vision Clarity Test</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: "0 0 8px" }}>Stress-test your vision statement against 5 clarity criteria.</p>
        <div style={{ display: "flex", gap: 12, fontSize: 12, fontFamily: "'DM Mono',monospace" }}>
          <span style={{ color: "#1B9C85" }}>{passed} pass</span>
          <span style={{ color: "#E74C3C" }}>{failed} fail</span>
          <span style={{ color: t.textDim }}>{5 - passed - failed} untested</span>
        </div>
      </div>

      {/* Vision under test */}
      <div style={{ marginBottom: 20, padding: "16px 18px", background: `#2980B910`, border: `1px solid #2980B930`, borderRadius: 14 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#2980B9", margin: "0 0 6px", textTransform: "uppercase" }}>Vision Under Test</p>
        <textarea value={state.vision} onChange={e => setState(prev => ({ ...prev, vision: e.target.value }))} rows={3} placeholder="Paste your vision statement here..."
          style={{ width: "100%", padding: "10px 12px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 14, color: t.text, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5 }} />
      </div>

      {/* Criteria cards */}
      {CRITERIA.map(crit => {
        const criterion = state[crit.key] || { status: "untested", evidence: "" };
        return (
          <div key={crit.key} style={{ marginBottom: 14, background: t.card, border: `1px solid ${criterion.status === "pass" ? "#1B9C8540" : criterion.status === "fail" ? "#E74C3C40" : t.cardBorder}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.cardBorder}`, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>{crit.icon}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: 0 }}>{crit.label}</h3>
                <p style={{ fontSize: 12, color: t.textMuted, margin: "2px 0 0", lineHeight: 1.3 }}>{crit.question}</p>
              </div>
            </div>
            <div style={{ padding: "12px 16px" }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {["pass", "fail", "untested"].map(s => (
                  <button key={s} onClick={() => updateCriterion(crit.key, "status", s)} style={{
                    padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
                    background: criterion.status === s ? statusColors[s] : t.input,
                    color: criterion.status === s ? "#fff" : t.textMuted,
                  }}>{statusLabels[s]}</button>
                ))}
              </div>
              <textarea value={criterion.evidence} onChange={e => updateCriterion(crit.key, "evidence", e.target.value)} rows={2} placeholder="Evidence or reasoning for this assessment..."
                style={{ width: "100%", padding: "8px 10px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.text, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif" }} />
            </div>
          </div>
        );
      })}

      {/* Stress test */}
      <div style={{ marginTop: 18, padding: "16px 18px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: "0 0 8px" }}>🔥 Stress Test</h3>
        <p style={{ fontSize: 12, color: t.textMuted, margin: "0 0 8px" }}>What would make this vision fail? What assumption, if wrong, kills the entire strategy?</p>
        <textarea value={state.stress_test} onChange={e => setState(prev => ({ ...prev, stress_test: e.target.value }))} rows={3} placeholder="If MRT Jakarta blocks API access, the entire multimodal thesis collapses..."
          style={{ width: "100%", padding: "10px 12px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 13, color: t.text, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif" }} />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#2980B9", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={importJSON} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import</button>
        <button onClick={() => { const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `vision-test-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setToast("Saved"); }} style={{ padding: "12px 20px", background: "#1B9C85", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 48 }}>💾</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
