// Stage1Landing.tsx — Ported from Level 1 Stage1Landing.jsx
'use client';
import { useState, useEffect } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const FRAMEWORK_KEYS = {
  "input-panel": "dk-stage1-session", "v2mom": "dk-stage1-v2mom", "strategy-canvas": "dk-stage1-strategy-canvas",
  "bmc": "dk-stage1-bmc", "pestle": "dk-stage1-pestle", "north-star": "dk-stage1-northstar",
  "metric-map": "dk-stage1-metricmap", "okr": "dk-stage1-okr", "daci": "dk-stage1-daci",
  "vision-test": "dk-stage1-visiontest", "gate": "dk-stage1-gate",
};
function checkHasData(id) { const k = FRAMEWORK_KEYS[id]; if (!k) return false; try { const r = localStorage.getItem(k); return r !== null && r !== "null" && r.length > 10; } catch (e) { return false; } }
function getGateStatus() { try { const r = JSON.parse(localStorage.getItem("dk-stage1-gate") || "{}"); const c = r.criteria || []; return { passed: c.filter(x => x.status === "pass").length, total: 7, decision: r.decision }; } catch (e) { return { passed: 0, total: 7, decision: null }; } }

const GROUPS = [
  { label: "Input", color: "#E67E22", desc: "Define The Strategy Space", items: [
    { id: "input-panel", title: "Input Panel", desc: "Vision, where to play, how to win, what not to do, North Star candidates, time horizon.", icon: "📋", route: "/stage/1/input" },
  ]},
  { label: "Research", color: "#D4AC0D", desc: "Research & Analysis", items: [
    { id: "research-engine", title: "Research Engine", desc: "Strategy analysis, vision stress test, OKR generation, North Star validation.", icon: "🔍", route: null, forceStatus: "not_started" },
  ]},
  { label: "Required Evidence", color: "#3498DB", desc: "Strategy, Metrics & Validation", items: [
    { id: "v2mom", title: "V2MOM", desc: "Vision, Values, Methods, Obstacles, Measures — the strategic backbone.", icon: "🎯", route: "/stage/1/v2mom" },
    { id: "strategy-canvas", title: "Product Strategy Canvas", desc: "Target User, Problem, Value Prop, Solution, Channels, Revenue, Metrics, Unfair Advantage.", icon: "📐", route: "/stage/1/strategy-canvas" },
    { id: "bmc", title: "Business Model Canvas", desc: "Standard 9-block layout covering the full business model.", icon: "🏗", route: "/stage/1/bmc" },
    { id: "pestle", title: "PESTLE Analysis", desc: "Macro-environment scan across six forces shaping your market.", icon: "🌍", route: "/stage/1/pestle" },
    { id: "vision-test", title: "Vision Clarity Test", desc: "Is the vision specific, measurable, time-bound, inspiring, differentiating?", icon: "🔎", route: "/stage/1/vision-test" },
    { id: "north-star", title: "North Star Selector", desc: "Score candidates on user value, product growth, business health.", icon: "⭐", route: "/stage/1/north-star" },
    { id: "metric-map", title: "Input/Output Metric Map", desc: "Input Metrics → North Star → Output Metrics with owners and targets.", icon: "🔄", route: "/stage/1/metric-map" },
    { id: "okr", title: "OKR Builder", desc: "3-5 objectives with 2-4 measurable key results each.", icon: "📊", route: "/stage/1/okr" },
    { id: "daci", title: "DACI Framework", desc: "Decision matrix — Driver, Approver, Contributors, Informed.", icon: "👥", route: "/stage/1/daci" },
  ]},
  { label: "Decision Gate", color: "#1B9C85", desc: "Review & Decide", items: [
    { id: "gate", title: "Strategy Validation Brief", desc: "Strategy summary, North Star rationale, tradeoffs, readiness criteria, GO/PIVOT/KILL.", icon: "📄", route: "/stage/1/gate" },
  ]},
];

const REC_ORDER = ["input-panel", "v2mom", "strategy-canvas", "bmc", "pestle", "vision-test", "north-star", "metric-map", "okr", "daci", "gate"];
const REC_LABELS = { "input-panel": "Input Panel", "v2mom": "V2MOM", "strategy-canvas": "Product Strategy Canvas", "bmc": "Business Model Canvas", "pestle": "PESTLE Analysis", "vision-test": "Vision Clarity Test", "north-star": "North Star Selector", "metric-map": "Metric Map", "okr": "OKR Builder", "daci": "DACI Framework", "gate": "Decision Gate" };

function useIsMobile() { const [m, setM] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false); useEffect(() => { const c = () => setM(window.innerWidth < 768); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []); return m; }

function ArtifactCard({ item, stageColor, theme, hasData }) {
  const t = THEMES[theme];
  const isClickable = item.route !== null;
  const status = item.forceStatus === "not_started" ? { label: "Not Started", color: "#2980B9", bg: "#EBF5FB" } : hasData ? { label: "In Progress", color: "#E67E22", bg: "#FEF5E7" } : { label: "Ready", color: "#1B9C85", bg: "#D5F5E3" };
  return (
    <div onClick={isClickable ? () => { window.location.href = item.route; } : undefined} style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 12, padding: "16px 18px 14px", cursor: isClickable ? "pointer" : "default", transition: "all 0.3s ease" }}
    onMouseEnter={e => { if (isClickable) { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${stageColor}25`; e.currentTarget.style.borderColor = stageColor; } }}
    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = t.cardBorder; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>{item.icon}</span>
        <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", fontWeight: 600, color: status.color, background: theme === "light" ? status.bg : `${status.color}15`, padding: "3px 8px", borderRadius: 10 }}>{status.label}</span>
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: "0 0 4px", lineHeight: 1.25 }}>{item.title}</h3>
      <p style={{ fontSize: 12, color: t.textMuted, margin: 0, lineHeight: 1.4 }}>{item.desc}</p>
    </div>
  );
}

function FlowArrow({ theme }) { const t = THEMES[theme]; return <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><div style={{ width: 2, height: 12, background: t.inputBorder }} /><div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: `5px solid ${t.inputBorder}` }} /></div></div>; }

export default function Stage1Landing() {
  const mobile = useIsMobile();
  const [theme] = useState(getTheme);
  const t = THEMES[theme];
  const [refresh, setRefresh] = useState(0);
  useEffect(() => { const h = () => setRefresh(r => r + 1); window.addEventListener("focus", h); /* hashchange not needed */; return () => { window.removeEventListener("focus", h); /* removed hashchange */; }; }, []);

  const allItems = GROUPS.flatMap(g => g.items);
  const dataStatus = {}; allItems.forEach(i => { dataStatus[i.id] = checkHasData(i.id); });
  const touchedCount = Object.values(dataStatus).filter(Boolean).length;
  const totalCount = allItems.filter(i => !i.forceStatus).length;
  const gate = getGateStatus();
  const nextRec = REC_ORDER.find(id => !dataStatus[id]);

  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ padding: mobile ? "20px 16px 0" : "28px 32px 0" }}>
          <a onClick={() => window.location.href = "/"} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#2980B9", cursor: "pointer", fontWeight: 500, marginBottom: 16, minHeight: 44 }}>← Back To Arthur PM MCS</a>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#E67E22", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(230,126,34,0.3)" }}><span style={{ fontSize: 20 }}>🧭</span></div>
            <div>
              <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#E67E22", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>Stage 1</p>
              <h1 style={{ fontSize: mobile ? 22 : 32, fontFamily: "'Playfair Display',serif", fontWeight: 900, color: t.text, margin: 0, lineHeight: 1.15 }}>Strategy Architect</h1>
            </div>
          </div>
          <p style={{ fontSize: 13, color: t.textMuted, margin: "0 0 20px", maxWidth: 500 }}>Given the problem you chose, how do you decide what winning actually means?</p>
        </div>
        <div style={{ padding: mobile ? "0 16px 60px" : "0 32px 60px" }}>
          {/* Live stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(140px, 100%), 1fr))", gap: 10, marginBottom: 14 }}>
            {[
              { label: "Artifacts Touched", value: `${touchedCount}/${totalCount}`, color: touchedCount > 0 ? "#1B9C85" : "#95A5A6" },
              { label: "Readiness Criteria", value: `${gate.passed}/${gate.total}`, color: gate.passed > 0 ? "#1B9C85" : "#E67E22" },
              { label: "Gate Status", value: gate.decision ? gate.decision.toUpperCase() : "Pending", color: gate.decision === "go" ? "#1B9C85" : gate.decision ? "#E67E22" : "#95A5A6" },
              { label: "Decision", value: `${Math.round((touchedCount / totalCount) * 100)}%`, color: touchedCount === totalCount ? "#1B9C85" : "#E67E22" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: t.card, border: `1px solid ${t.cardBorder}` }}>
                <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: t.textDim, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: s.color, margin: 0, fontFamily: "'DM Mono',monospace" }}>{s.value}</p>
              </div>
            ))}
          </div>
          {/* Recommended next */}
          {nextRec && REC_LABELS[nextRec] && (() => { const route = allItems.find(i => i.id === nextRec)?.route; return route ? (
            <div onClick={() => window.location.href = route} style={{ padding: "14px 18px", background: "#E67E2210", border: "1px solid #E67E2230", borderRadius: 12, marginBottom: 20, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#E67E22", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16, color: "#fff", fontWeight: 700 }}>→</span></div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontFamily: "'DM Mono',monospace", color: "#E67E22", margin: "0 0 2px", fontWeight: 600 }}>RECOMMENDED NEXT</p>
                <span style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{REC_LABELS[nextRec]}</span>
                <span style={{ fontSize: 12, color: t.textMuted, marginLeft: 8 }}>— {touchedCount === 0 ? "Start here" : "Continue building your case"}</span>
              </div>
            </div>
          ) : null; })()}
          {/* Flow hint */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {GROUPS.map((g, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ padding: "5px 12px", borderRadius: 16, background: g.color + "15", border: `1px solid ${g.color}30` }}><span style={{ fontSize: 11, fontWeight: 600, color: g.color }}>{g.label}</span></div>
                {i < GROUPS.length - 1 && <span style={{ fontSize: 12, color: t.inputBorder }}>→</span>}
              </div>
            ))}
          </div>
          {/* Artifact groups */}
          {GROUPS.map((group, gi) => (
            <div key={gi}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <div style={{ width: 4, height: 20, borderRadius: 2, background: group.color }} />
                  <h2 style={{ fontSize: mobile ? 15 : 18, fontWeight: 700, color: t.text, margin: 0 }}>{group.label}</h2>
                  <span style={{ fontSize: 11, color: t.textMuted }}>— {group.desc}</span>
                  <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: t.textDim, marginLeft: "auto" }}>{group.items.filter(i => dataStatus[i.id]).length}/{group.items.length}</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: group.items.length === 1 ? "1fr" : "repeat(auto-fill, minmax(min(240px, 100%), 1fr))", gap: 10, marginBottom: 6 }}>
                {group.items.map(item => <ArtifactCard key={item.id} item={item} stageColor={group.color} theme={theme} hasData={dataStatus[item.id]} />)}
              </div>
              {gi < GROUPS.length - 1 && <FlowArrow theme={theme} />}
            </div>
          ))}
          {/* Readiness Criteria */}
          <div style={{ marginTop: 24, padding: "16px 18px", borderRadius: 12, background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 14 }}>🚦</span>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: t.text, margin: 0 }}>Readiness Criteria</h3>
              <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: gate.passed > 0 ? "#1B9C85" : t.textDim, marginLeft: "auto" }}>{gate.passed}/{gate.total} pass</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))", gap: 8 }}>
              {["Strategy articulated in 1-2 paragraphs", "One North Star Metric selected with rationale", "3-5 input metrics identified", "Explicit tradeoffs documented", "At least one thing NOT optimizing for", "OKRs defined with measurable key results", "DACI established for key decisions"].map((c, i) => {
                const s = gate.passed > i ? "pass" : "pending";
                return <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 12px", background: s === "pass" ? "#1B9C8508" : t.input, borderRadius: 6, border: `1px solid ${s === "pass" ? "#1B9C8530" : t.cardBorder}` }}><span style={{ fontSize: 12, color: s === "pass" ? "#1B9C85" : t.textDim, marginTop: 1 }}>{s === "pass" ? "✅" : "☐"}</span><span style={{ fontSize: 12, color: s === "pass" ? t.text : t.textMuted, lineHeight: 1.4 }}>{c}</span></div>;
              })}
            </div>
            <p style={{ fontSize: 11, color: t.textDim, marginTop: 10, fontFamily: "'DM Mono',monospace", textAlign: "center" }}>Gates advise. They don't block. You decide.</p>
          </div>
          <div style={{ marginTop: 32, textAlign: "center", paddingTop: 16, borderTop: `1px solid ${t.cardBorder}` }}><p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: t.textDim }}>© 2026 Arthur · Mission Control System</p></div>
        </div>
      </div>
    </div>
  );
}
