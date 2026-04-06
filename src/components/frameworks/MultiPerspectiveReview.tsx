// MultiPerspectiveReview.tsx — Ported from Level 1 MultiPerspectiveReview.jsx
'use client';
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage2-multiperspective";
const PERSPECTIVES = [
  { key: "user", label: "User", icon: "👤", color: "#3498DB", question: "Do users want this? Is the need validated?" },
  { key: "business", label: "Business", icon: "💰", color: "#1B9C85", question: "Does the business model work? Positive unit economics?" },
  { key: "technology", label: "Technology", icon: "⚙️", color: "#8E44AD", question: "Can we build it? Do we have the capability?" },
  { key: "market", label: "Market", icon: "🌍", color: "#E67E22", question: "Is the timing right? Is there a window?" },
];
const EMPTY_PERSP = { score: 3, considerations: "", risks: "" };
const EMPTY_REVIEW = { opportunity: "", perspectives: { user: { ...EMPTY_PERSP }, business: { ...EMPTY_PERSP }, technology: { ...EMPTY_PERSP }, market: { ...EMPTY_PERSP } }, verdict: "" };

function useAutoSave(s) { const t = useRef(null); useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [s]); }
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

export default function MultiPerspectiveReview() {
  const [theme] = useState(getTheme); const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  const [state, setState] = useState(() => loadSaved() || { reviews: [{ ...EMPTY_REVIEW, perspectives: { user: { ...EMPTY_PERSP }, business: { ...EMPTY_PERSP }, technology: { ...EMPTY_PERSP }, market: { ...EMPTY_PERSP } } }] });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const updateOpp = (ri, v) => setState(prev => { const r = [...prev.reviews]; r[ri] = { ...r[ri], opportunity: v }; return { ...prev, reviews: r }; });
  const updateVerdict = (ri, v) => setState(prev => { const r = [...prev.reviews]; r[ri] = { ...r[ri], verdict: v }; return { ...prev, reviews: r }; });
  const updatePersp = (ri, pk, field, val) => setState(prev => { const r = [...prev.reviews]; r[ri] = { ...r[ri], perspectives: { ...r[ri].perspectives, [pk]: { ...r[ri].perspectives[pk], [field]: val } } }; return { ...prev, reviews: r }; });
  const add = () => setState(prev => ({ ...prev, reviews: [...prev.reviews, { ...EMPTY_REVIEW, perspectives: { user: { ...EMPTY_PERSP }, business: { ...EMPTY_PERSP }, technology: { ...EMPTY_PERSP }, market: { ...EMPTY_PERSP } } }] }));
  const remove = (ri) => setState(prev => ({ ...prev, reviews: prev.reviews.filter((_, j) => j !== ri) }));
  const getAvg = (review) => { const scores = PERSPECTIVES.map(p => review.perspectives[p.key]?.score || 0); return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1); };
  const fieldStyle = { width: "100%", padding: "8px 10px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.text, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif", resize: "vertical" };
  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 2, framework: "multi_perspective", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 28, borderBottom: "3px solid #F1C40F", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#F1C40F", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 2 · Opportunity Scout</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Multi-Perspective Review</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>Evaluate from User, Business, Technology, and Market angles.</p>
      </div>

      {state.reviews.map((review, ri) => {
        const avg = getAvg(review);
        return (
          <div key={ri} style={{ marginBottom: 16, background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.cardBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
              <input value={review.opportunity} onChange={e => updateOpp(ri, e.target.value)} placeholder="Opportunity name..." style={{ flex: 1, padding: "6px 0", background: "transparent", border: "none", fontSize: 16, fontWeight: 700, color: t.text, outline: "none" }} />
              <span style={{ fontSize: 18, fontWeight: 800, color: avg >= 4 ? "#1B9C85" : avg >= 2.5 ? "#F1C40F" : "#E74C3C", fontFamily: "'DM Mono',monospace" }}>{avg}/5</span>
              {state.reviews.length > 1 && <button onClick={() => remove(ri)} style={{ background: "none", border: "none", color: "#E74C3C60", cursor: "pointer", fontSize: 16 }}>×</button>}
            </div>
            <div style={{ padding: "12px 16px" }}>
              {PERSPECTIVES.map(p => (
                <div key={p.key} style={{ marginBottom: 12, padding: "10px 12px", background: t.input, borderRadius: 10, border: `1px solid ${t.cardBorder}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>{p.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: p.color }}>{p.label}</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: p.color, fontFamily: "'DM Mono',monospace", marginLeft: "auto" }}>{review.perspectives[p.key]?.score || 0}/5</span>
                  </div>
                  <p style={{ fontSize: 10, color: t.textDim, margin: "0 0 6px" }}>{p.question}</p>
                  <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                    {[1, 2, 3, 4, 5].map(v => (
                      <button key={v} onClick={() => updatePersp(ri, p.key, "score", v)} style={{ flex: 1, padding: "7px 0", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: (review.perspectives[p.key]?.score || 0) >= v ? p.color : t.card, color: (review.perspectives[p.key]?.score || 0) >= v ? "#fff" : t.textMuted }}>{v}</button>
                    ))}
                  </div>
                  <textarea value={review.perspectives[p.key]?.considerations || ""} onChange={e => updatePersp(ri, p.key, "considerations", e.target.value)} rows={1} placeholder="Key considerations..." style={{ ...fieldStyle, marginBottom: 4 }} />
                  <textarea value={review.perspectives[p.key]?.risks || ""} onChange={e => updatePersp(ri, p.key, "risks", e.target.value)} rows={1} placeholder="Risks from this perspective..." style={fieldStyle} />
                </div>
              ))}
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: 10, color: t.textDim, margin: "0 0 3px", fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>OVERALL VERDICT</p>
                <textarea value={review.verdict} onChange={e => updateVerdict(ri, e.target.value)} rows={2} placeholder="Given all four perspectives, should we proceed? What's the biggest risk?" style={fieldStyle} />
              </div>
            </div>
          </div>
        );
      })}
      <button onClick={add} style={{ width: "100%", padding: "12px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 10, fontSize: 13, color: t.textMuted, cursor: "pointer", marginBottom: 18 }}>+ Add Review</button>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#F1C40F", color: "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={() => { const raw = prompt("Paste JSON:"); if (!raw) return; try { setState({ ...JSON.parse(raw) }); setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } }} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
