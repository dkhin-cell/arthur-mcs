// LivingBriefEngine.tsx — Ported from Level 1 LivingBriefEngine.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme, USER } from "@/lib/theme";

const STORAGE_KEY = "dk-stage4-brief";

// Evidence scoring: green = gate-validated, amber = data exists no gate, red = missing
function scoreEvidence(dataKey, gateKey) {
  const hasD = (() => { try { const d = localStorage.getItem(dataKey); return d && d !== "{}" && d !== "null"; } catch (e) { return false; } })();
  const gateGo = (() => { try { return JSON.parse(localStorage.getItem(gateKey) || "{}").decision === "go"; } catch (e) { return false; } })();
  if (hasD && gateGo) return "green";
  if (hasD) return "amber";
  return "red";
}

// Brief sections mapped to stage data
function buildBriefSections() {
  return [
    { id: "problem", title: "Problem Statement", stage: 0, dataKey: "dk-stage0-session", gateKey: "dk-stage0-gate", extract: (d) => d?.problem_hypothesis || "" },
    { id: "target", title: "Target User", stage: 0, dataKey: "dk-stage0-session", gateKey: "dk-stage0-gate", extract: (d) => d?.target_segment || "" },
    { id: "jtbd", title: "Jobs To Be Done", stage: 0, dataKey: "dk-stage0-session", gateKey: "dk-stage0-gate", extract: (d) => d?.jtbd || "" },
    { id: "market", title: "Market Size", stage: 0, dataKey: "dk-stage0-tam", gateKey: "dk-stage0-gate", extract: (d) => { const t = d?.tam; return t ? `TAM: ${t.value || "?"} | SAM: ${d?.sam?.value || "?"} | SOM: ${d?.som?.value || "?"}` : ""; } },
    { id: "competitive", title: "Competitive Landscape", stage: 0, dataKey: "dk-stage0-competitive", gateKey: "dk-stage0-gate", extract: (d) => (d?.competitors || []).map(c => c.name).filter(Boolean).join(", ") },
    { id: "vision", title: "Vision & Strategy", stage: 1, dataKey: "dk-stage1-session", gateKey: "dk-stage1-gate", extract: (d) => d?.vision_statement || "" },
    { id: "how_to_win", title: "How to Win", stage: 1, dataKey: "dk-stage1-session", gateKey: "dk-stage1-gate", extract: (d) => d?.how_to_win || "" },
    { id: "north_star", title: "North Star Metric", stage: 1, dataKey: "dk-stage1-northstar", gateKey: "dk-stage1-gate", extract: (d) => d?.selected || "" },
    { id: "okrs", title: "OKRs", stage: 1, dataKey: "dk-stage1-okr", gateKey: "dk-stage1-gate", extract: (d) => (d?.objectives || []).map(o => o.name).filter(Boolean).join("; ") },
    { id: "opportunity", title: "Top Opportunity", stage: 2, dataKey: "dk-stage2-rice", gateKey: "dk-stage2-gate", extract: (d) => { const items = (d?.items || []).sort((a, b) => { const sa = a.effort > 0 ? (a.reach * a.impact * (a.confidence / 100)) / a.effort : 0; const sb = b.effort > 0 ? (b.reach * b.impact * (b.confidence / 100)) / b.effort : 0; return sb - sa; }); return items[0]?.name || ""; } },
    { id: "beachhead", title: "Beachhead Market", stage: 2, dataKey: "dk-stage2-beachhead", gateKey: "dk-stage2-gate", extract: (d) => d?.selected || "" },
    { id: "assumptions", title: "Key Assumptions", stage: 2, dataKey: "dk-stage2-assumptions", gateKey: "dk-stage2-gate", extract: (d) => (d?.assumptions || []).filter(a => a.importance === "high").map(a => a.text).filter(Boolean).join("; ") },
    { id: "jtbd_detail", title: "JTBD Details", stage: 2, dataKey: "dk-stage2-jtbd", gateKey: "dk-stage2-gate", extract: (d) => (d?.entries || []).map(e => e.opportunity + ": " + (e.jobs?.functional || "")).filter(Boolean).join("; ") },
    { id: "hypotheses", title: "Key Hypotheses", stage: 2, dataKey: "dk-stage2-hypothesis", gateKey: "dk-stage2-gate", extract: (d) => (d?.hypotheses || []).filter(h => h.belief).map(h => h.belief).join("; ") },
    { id: "signals", title: "Behavioral Signals", stage: 2, dataKey: "dk-stage2-signals", gateKey: "dk-stage2-gate", extract: (d) => (d?.signals || []).filter(s => s.signal).map(s => s.signal).join("; ") },
    { id: "journey", title: "Customer Journey", stage: 3, dataKey: "dk-stage3-journey", gateKey: "dk-stage3-gate", extract: (d) => (d?.phases || []).map(p => p.name).filter(Boolean).join(" → ") },
    { id: "ux_hypotheses", title: "UX Hypotheses", stage: 3, dataKey: "dk-stage3-uxhypothesis", gateKey: "dk-stage3-gate", extract: (d) => (d?.hypotheses || []).filter(h => h.designDecision).map(h => h.designDecision).join("; ") },
    { id: "prototype", title: "Prototype Scope", stage: 3, dataKey: "dk-stage3-protospec", gateKey: "dk-stage3-gate", extract: (d) => d?.name ? `${d.name} (${d.fidelity || "?"} fidelity, ${d.tool || "TBD"})` : "" },
    { id: "user_stories", title: "User Stories", stage: 4, dataKey: "dk-stage4-stories", gateKey: null, extract: () => "" },
    { id: "acceptance", title: "Acceptance Criteria", stage: 4, dataKey: "dk-stage4-acceptance", gateKey: null, extract: () => "" },
    { id: "roadmap", title: "Roadmap", stage: 4, dataKey: "dk-stage4-roadmap", gateKey: null, extract: () => "" },
  ];
}

function getBriefLevel() {
  const g = {};
  try { g.s0 = JSON.parse(localStorage.getItem("dk-stage0-gate") || "{}").decision; } catch (e) {}
  try { g.s1 = JSON.parse(localStorage.getItem("dk-stage1-gate") || "{}").decision; } catch (e) {}
  try { g.s2 = JSON.parse(localStorage.getItem("dk-stage2-gate") || "{}").decision; } catch (e) {}
  try { g.s3 = JSON.parse(localStorage.getItem("dk-stage3-gate") || "{}").decision; } catch (e) {}
  const has = (k) => { try { const d = localStorage.getItem(k); return d && d !== "{}" && d !== "null"; } catch (e) { return false; } };
  const hs = has("dk-stage4-stories") && has("dk-stage4-acceptance");
  if (g.s0 === "go" && g.s1 === "go" && g.s2 === "go" && g.s3 === "go" && hs) return { name: "PRD", level: 6, color: "#1B9C85" };
  if (g.s0 === "go" && g.s1 === "go" && g.s2 === "go" && g.s3 === "go") return { name: "Product Brief", level: 5, color: "#2ECC71" };
  if (g.s0 === "go" && g.s1 === "go" && g.s2 === "go") return { name: "Opportunity Brief", level: 4, color: "#F1C40F" };
  if (g.s0 === "go" && g.s1 === "go") return { name: "Strategy Brief", level: 3, color: "#E67E22" };
  if (g.s0 === "go") return { name: "Problem Brief", level: 2, color: "#E74C3C" };
  return { name: "Working Draft", level: 1, color: "#95A5A6" };
}

function useAutoSave(s) { const t = useRef(null); useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [s]); }
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

const SCORE_COLORS = { green: "#1B9C85", amber: "#E67E22", red: "#E74C3C" };
const SCORE_LABELS = { green: "Validated", amber: "Data exists", red: "Missing" };
const SCORE_ICONS = { green: "🟢", amber: "🟡", red: "🔴" };
const STAGE_COLORS = { 0: "#E74C3C", 1: "#E67E22", 2: "#F1C40F", 3: "#2ECC71", 4: "#3498DB" };
const STAGE_NAMES = { 0: "Problem Validator", 1: "Strategy Architect", 2: "Opportunity Scout", 3: "Design & MVP", 4: "Planning & Roadmap" };

export default function LivingBriefEngine() {
  const [theme] = useState(getTheme); const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  const [state, setState] = useState(() => loadSaved() || { overrides: {}, notes: {} });
  const [toast, setToast] = useState(null);
  const [expandedStage, setExpandedStage] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const sections = buildBriefSections();
  const brief = getBriefLevel();

  // Load data and score each section
  const scoredSections = sections.map(sec => {
    let data = null;
    try { data = JSON.parse(localStorage.getItem(sec.dataKey) || "null"); } catch (e) {}
    const extracted = sec.extract(data);
    const score = sec.gateKey ? scoreEvidence(sec.dataKey, sec.gateKey) : (extracted || state.overrides[sec.id] ? "amber" : "red");
    const override = state.overrides[sec.id] || "";
    const note = state.notes[sec.id] || "";
    return { ...sec, data, extracted, score, override, note };
  });

  const greenCount = scoredSections.filter(s => s.score === "green").length;
  const amberCount = scoredSections.filter(s => s.score === "amber").length;
  const redCount = scoredSections.filter(s => s.score === "red").length;

  // Group by stage
  const stageGroups = {};
  scoredSections.forEach(s => { if (!stageGroups[s.stage]) stageGroups[s.stage] = []; stageGroups[s.stage].push(s); });

  const updateOverride = (id, val) => setState(prev => ({ ...prev, overrides: { ...prev.overrides, [id]: val } }));
  const updateNote = (id, val) => setState(prev => ({ ...prev, notes: { ...prev.notes, [id]: val } }));
  const fieldStyle = { width: "100%", padding: "8px 10px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.text, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif", resize: "vertical" };

  // Export as Markdown
  const exportMarkdown = () => {
    let md = `# ${brief.name}: Living Brief\n\n`;
    md += `**Generated by Arthur · Mission Control System**\n`;
    md += `**Evidence Score:** ${greenCount} validated, ${amberCount} data exists, ${redCount} missing\n`;
    md += `**Generated:** ${new Date().toLocaleDateString()}\n\n---\n\n`;
    Object.entries(stageGroups).forEach(([stageNum, items]) => {
      md += `## Stage ${stageNum}: ${STAGE_NAMES[stageNum]}\n\n`;
      items.forEach(s => {
        const icon = s.score === "green" ? "✅" : s.score === "amber" ? "🟡" : "🔴";
        const content = s.override || s.extracted || "*No data*";
        md += `### ${icon} ${s.title}\n${content}\n`;
        if (s.note) md += `> *Note: ${s.note}*\n`;
        md += "\n";
      });
    });
    md += `---\n*© 2026 Arthur · Mission Control System*\n`;
    navigator.clipboard.writeText(md);
    setToast("Markdown copied — paste into Notion, Cursor, or any tool");
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 28, borderBottom: `3px solid #3498DB`, paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#3498DB", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 4 · Planning & Roadmap</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Living Brief Engine</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>Your evidence-scored product document. Every section traces back to validated stage data.</p>
      </div>

      {/* Brief status header */}
      <div style={{ padding: "16px 20px", background: `${brief.color}08`, border: `2px solid ${brief.color}40`, borderRadius: 16, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <span style={{ fontSize: 28 }}>📄</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 24, fontWeight: 800, color: brief.color, margin: 0 }}>{brief.name}</p>
            <p style={{ fontSize: 11, color: t.textDim, margin: "2px 0 0", fontFamily: "'DM Mono',monospace" }}>Level {brief.level}/6 — {brief.level < 6 ? "Pass more gates to earn PRD status" : "Fully evidence-backed PRD"}</p>
          </div>
        </div>
        {/* Score summary */}
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, padding: "8px 12px", borderRadius: 8, background: "#1B9C8510", textAlign: "center" }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#1B9C85" }}>{greenCount}</span>
            <p style={{ fontSize: 9, color: t.textDim, margin: 0 }}>Validated</p>
          </div>
          <div style={{ flex: 1, padding: "8px 12px", borderRadius: 8, background: "#E67E2210", textAlign: "center" }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#E67E22" }}>{amberCount}</span>
            <p style={{ fontSize: 9, color: t.textDim, margin: 0 }}>Data exists</p>
          </div>
          <div style={{ flex: 1, padding: "8px 12px", borderRadius: 8, background: "#E74C3C10", textAlign: "center" }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#E74C3C" }}>{redCount}</span>
            <p style={{ fontSize: 9, color: t.textDim, margin: 0 }}>Missing</p>
          </div>
        </div>
      </div>

      {/* Sections grouped by stage */}
      {Object.entries(stageGroups).map(([stageNum, items]) => {
        const sc = STAGE_COLORS[stageNum];
        const isExpanded = expandedStage === null || expandedStage === parseInt(stageNum);
        return (
          <div key={stageNum} style={{ marginBottom: 12 }}>
            <div onClick={() => setExpandedStage(expandedStage === parseInt(stageNum) ? null : parseInt(stageNum))} style={{ padding: "10px 14px", background: `${sc}08`, border: `1px solid ${sc}25`, borderRadius: isExpanded ? "12px 12px 0 0" : 12, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>Stage {stageNum}: {STAGE_NAMES[stageNum]}</span>
              <div style={{ display: "flex", gap: 3, marginLeft: "auto" }}>
                {items.map((s, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: SCORE_COLORS[s.score] }} />)}
              </div>
              <span style={{ fontSize: 12, color: t.textDim }}>{isExpanded ? "▾" : "▸"}</span>
            </div>
            {isExpanded && (
              <div style={{ border: `1px solid ${sc}25`, borderTop: "none", borderRadius: "0 0 12px 12px", overflow: "hidden" }}>
                {items.map((sec, i) => (
                  <div key={i} style={{ padding: "12px 16px", borderBottom: i < items.length - 1 ? `1px solid ${t.cardBorder}` : "none", background: t.card }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 14 }}>{SCORE_ICONS[sec.score]}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{sec.title}</span>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 5, background: `${SCORE_COLORS[sec.score]}15`, color: SCORE_COLORS[sec.score], fontWeight: 600, fontFamily: "'DM Mono',monospace" }}>{SCORE_LABELS[sec.score]}</span>
                      <span style={{ fontSize: 10, color: sc, fontFamily: "'DM Mono',monospace", marginLeft: "auto" }}>Stage {sec.stage}</span>
                    </div>
                    {/* Extracted content */}
                    {sec.extracted && (
                      <div style={{ padding: "8px 12px", background: `${SCORE_COLORS[sec.score]}06`, borderRadius: 8, marginBottom: 6, borderLeft: `3px solid ${SCORE_COLORS[sec.score]}` }}>
                        <p style={{ fontSize: 12, color: t.text, margin: 0, lineHeight: 1.5 }}>{sec.extracted}</p>
                      </div>
                    )}
                    {!sec.extracted && sec.score === "red" && (
                      <div style={{ padding: "8px 12px", background: "#E74C3C06", borderRadius: 8, marginBottom: 6, borderLeft: "3px solid #E74C3C" }}>
                        <p style={{ fontSize: 12, color: "#E74C3C", margin: 0 }}>No data. {sec.stage < 4 ? `Complete Stage ${sec.stage} frameworks to populate.` : "Fill in below or use Stage 4 frameworks."}</p>
                      </div>
                    )}
                    {/* Override field — PM can add/edit content */}
                    <textarea value={sec.override} onChange={e => updateOverride(sec.id, e.target.value)} rows={1} placeholder={sec.score === "red" ? "Add content manually (will show as amber)..." : "Override or add to extracted content..."} style={{ ...fieldStyle, fontSize: 11, marginBottom: 4 }} />
                    <input value={sec.note} onChange={e => updateNote(sec.id, e.target.value)} placeholder="Note (visible in export)..." style={{ ...fieldStyle, fontSize: 10, color: t.textDim }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Export */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
        <button onClick={exportMarkdown} style={{ padding: "14px 24px", background: "#3498DB", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📋 Export as Markdown</button>
        <button onClick={() => { navigator.clipboard.writeText(JSON.stringify({ brief: brief.name, level: brief.level, sections: scoredSections.map(s => ({ id: s.id, title: s.title, stage: s.stage, score: s.score, content: s.override || s.extracted, note: s.note })), exported_at: new Date().toISOString(), exported_by: USER?.name }, null, 2)); setToast("JSON copied"); }} style={{ padding: "14px 24px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export JSON</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved · {greenCount + amberCount}/{sections.length} sections have content · {greenCount} gate-validated</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
