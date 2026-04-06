// Stage3Input.tsx — Ported from Level 1 Stage3InputPanel.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage3-session";

function useAutoSave(s) { const t = useRef(null); useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [s]); }
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

function loadCarryForward() {
  const cf = {};
  try { const s0 = JSON.parse(localStorage.getItem("dk-stage0-session") || "{}"); cf.problem = s0.problem_hypothesis || ""; cf.jtbd = s0.jtbd || ""; cf.target = s0.target_segment || ""; } catch (e) {}
  try { const s1 = JSON.parse(localStorage.getItem("dk-stage1-session") || "{}"); cf.vision = s1.vision_statement || ""; cf.how_to_win = s1.how_to_win || ""; } catch (e) {}
  try { const ns = JSON.parse(localStorage.getItem("dk-stage1-northstar") || "{}"); cf.northStar = ns.selected || ""; } catch (e) {}
  try { const s2 = JSON.parse(localStorage.getItem("dk-stage2-session") || "{}"); cf.hypotheses = (s2.hypotheses || []).map(h => h.segment + ": " + h.unmet_need).filter(Boolean).join("; "); } catch (e) {}
  try { const bh = JSON.parse(localStorage.getItem("dk-stage2-beachhead") || "{}"); cf.beachhead = bh.selected || ""; } catch (e) {}
  try { const rice = JSON.parse(localStorage.getItem("dk-stage2-rice") || "{}"); const items = (rice.items || []).sort((a, b) => { const sa = a.effort > 0 ? (a.reach * a.impact * (a.confidence / 100)) / a.effort : 0; const sb = b.effort > 0 ? (b.reach * b.impact * (b.confidence / 100)) / b.effort : 0; return sb - sa; }); cf.topOpportunity = items[0]?.name || ""; } catch (e) {}
  try { const jtbd = JSON.parse(localStorage.getItem("dk-stage2-jtbd") || "{}"); cf.jtbdDetails = (jtbd.entries || []).map(e => e.opportunity + ": " + (e.jobs?.functional || "")).filter(Boolean).join("; "); } catch (e) {}
  return cf;
}

export default function Stage3Input() {
  const [theme] = useState(getTheme); const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  const cf = loadCarryForward();
  const [state, setState] = useState(() => loadSaved() || { designGoal: "", targetUser: "", primaryJTBD: "", keyConstraints: "", successCriteria: "", designPrinciples: "" });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const update = (k, v) => setState(prev => ({ ...prev, [k]: v }));
  const fieldStyle = { width: "100%", padding: "10px 12px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 10, fontSize: 13, color: t.text, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif", resize: "vertical" };
  const cfStyle = { padding: "8px 12px", background: `${t.accent || "#1B9C85"}08`, border: `1px solid ${t.accent || "#1B9C85"}20`, borderRadius: 8, marginBottom: 6 };
  const cfLabel = { fontSize: 10, fontFamily: "'DM Mono',monospace", color: t.accent || "#1B9C85", margin: "0 0 2px", fontWeight: 600 };
  const cfValue = { fontSize: 12, color: t.text, margin: 0, lineHeight: 1.4 };

  const hasCF = cf.problem || cf.topOpportunity || cf.beachhead;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 28, borderBottom: "3px solid #2ECC71", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#2ECC71", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 3 · Design & MVP</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Input Panel</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>Design context and constraints. {hasCF ? "Pre-filled from Stages 0–2." : "Enter your context below."}</p>
      </div>

      {/* Carry-forward section */}
      {hasCF && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: t.textDim, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>📋 Carry-Forward from Stages 0–2 (read-only)</p>
          {cf.problem && <div style={cfStyle}><p style={cfLabel}>PROBLEM (Stage 0)</p><p style={cfValue}>{cf.problem}</p></div>}
          {cf.jtbd && <div style={cfStyle}><p style={cfLabel}>JTBD (Stage 0)</p><p style={cfValue}>{cf.jtbd}</p></div>}
          {cf.target && <div style={cfStyle}><p style={cfLabel}>TARGET SEGMENT (Stage 0)</p><p style={cfValue}>{cf.target}</p></div>}
          {cf.vision && <div style={cfStyle}><p style={cfLabel}>VISION (Stage 1)</p><p style={cfValue}>{cf.vision}</p></div>}
          {cf.how_to_win && <div style={cfStyle}><p style={cfLabel}>HOW TO WIN (Stage 1)</p><p style={cfValue}>{cf.how_to_win}</p></div>}
          {cf.northStar && <div style={cfStyle}><p style={cfLabel}>NORTH STAR METRIC (Stage 1)</p><p style={cfValue}>{cf.northStar}</p></div>}
          {cf.topOpportunity && <div style={cfStyle}><p style={cfLabel}>TOP OPPORTUNITY — RICE WINNER (Stage 2)</p><p style={cfValue}>{cf.topOpportunity}</p></div>}
          {cf.beachhead && <div style={cfStyle}><p style={cfLabel}>BEACHHEAD MARKET (Stage 2)</p><p style={cfValue}>{cf.beachhead}</p></div>}
          {cf.jtbdDetails && <div style={cfStyle}><p style={cfLabel}>JTBD DETAILS (Stage 2)</p><p style={cfValue}>{cf.jtbdDetails}</p></div>}
        </div>
      )}

      {/* New inputs for Stage 3 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#2ECC71", margin: "0 0 4px", fontWeight: 600 }}>DESIGN GOAL</p>
          <textarea value={state.designGoal} onChange={e => update("designGoal", e.target.value)} rows={2} placeholder="What does a successful design outcome look like? What user behavior are you trying to enable?" style={fieldStyle} />
        </div>
        <div>
          <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#2ECC71", margin: "0 0 4px", fontWeight: 600 }}>TARGET USER (for this design phase)</p>
          <textarea value={state.targetUser} onChange={e => update("targetUser", e.target.value)} rows={2} placeholder="Who is the specific user persona for this design? What do they care about most?" style={fieldStyle} />
        </div>
        <div>
          <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#2ECC71", margin: "0 0 4px", fontWeight: 600 }}>PRIMARY JTBD FOR DESIGN</p>
          <textarea value={state.primaryJTBD} onChange={e => update("primaryJTBD", e.target.value)} rows={2} placeholder="When [situation], I want to [motivation] so I can [outcome]." style={fieldStyle} />
        </div>
        <div>
          <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#2ECC71", margin: "0 0 4px", fontWeight: 600 }}>KEY CONSTRAINTS</p>
          <textarea value={state.keyConstraints} onChange={e => update("keyConstraints", e.target.value)} rows={2} placeholder="Technical, budget, timeline, platform constraints that limit design choices." style={fieldStyle} />
        </div>
        <div>
          <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#2ECC71", margin: "0 0 4px", fontWeight: 600 }}>SUCCESS CRITERIA</p>
          <textarea value={state.successCriteria} onChange={e => update("successCriteria", e.target.value)} rows={2} placeholder="How will you know the design works? What metrics or behaviors indicate success?" style={fieldStyle} />
        </div>
        <div>
          <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#2ECC71", margin: "0 0 4px", fontWeight: 600 }}>DESIGN PRINCIPLES (optional)</p>
          <textarea value={state.designPrinciples} onChange={e => update("designPrinciples", e.target.value)} rows={2} placeholder="Guiding principles — e.g., speed over features, mobile-first, accessibility-first." style={fieldStyle} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
        <button onClick={() => { navigator.clipboard.writeText(JSON.stringify({ stage: 3, input: state, carryForward: cf, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); }} style={{ padding: "12px 20px", background: "#2ECC71", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={() => { const raw = prompt("Paste JSON:"); if (!raw) return; try { const d = JSON.parse(raw); if (d.input) setState(d.input); else setState(d); setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } }} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
