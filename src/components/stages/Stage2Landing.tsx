// Stage2Landing.tsx — Ported from Level 1 Stage2Landing.jsx
'use client';
import { useState, useEffect } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const FRAMEWORK_KEYS = {
  "input-panel": "dk-stage2-session", "jtbd-canvas": "dk-stage2-jtbd", "rww": "dk-stage2-rww",
  "rice": "dk-stage2-rice", "dvuf": "dk-stage2-dvuf", "beachhead": "dk-stage2-beachhead",
  "ost": "dk-stage2-ost", "kano2": "dk-stage2-kano", "assumption-map": "dk-stage2-assumptions",
  "signal-tracker": "dk-stage2-signals", "hypothesis": "dk-stage2-hypothesis",
  "multi-perspective": "dk-stage2-multiperspective", "gate": "dk-stage2-gate",
};
function checkHasData(id) { const k = FRAMEWORK_KEYS[id]; if (!k) return false; try { const r = localStorage.getItem(k); return r !== null && r !== "null" && r.length > 10; } catch (e) { return false; } }
function getGateStatus() { try { const r = JSON.parse(localStorage.getItem("dk-stage2-gate") || "{}"); const c = r.criteria || []; return { passed: c.filter(x => x.status === "pass").length, total: 7, decision: r.decision }; } catch (e) { return { passed: 0, total: 7, decision: null }; } }

const GROUPS = [
  { label: "Input", color: "#F1C40F", desc: "Define Opportunity Space", items: [
    { id: "input-panel", title: "Input Panel", desc: "Opportunity hypotheses, target segments, research questions, behavioral signals.", icon: "📋", route: "/stage/2/input" },
  ]},
  { label: "Research", color: "#D4AC0D", desc: "Research & Analysis", items: [
    { id: "research-engine", title: "Research Engine", desc: "Opportunity research, JTBD deep dive, RICE data, assumption testing, behavioral evidence.", icon: "🔍", route: null, forceStatus: "not_started" },
  ]},
  { label: "Required Evidence", color: "#3498DB", desc: "Discovery & Prioritization", items: [
    { id: "jtbd-canvas", title: "JTBD Canvas", desc: "Expanded JTBD per opportunity — functional, emotional, social jobs.", icon: "🎯", route: "/stage/2/jtbd" },
    { id: "rww", title: "RWW Enhanced", desc: "Real, Win, Worth — scoring matrix with evidence for each.", icon: "🏆", route: "/stage/2/rww" },
    { id: "rice", title: "RICE Calculator", desc: "Reach, Impact, Confidence, Effort — auto-scored and sortable.", icon: "🔢", route: "/stage/2/rice" },
    { id: "dvuf", title: "DVUF Planner", desc: "Desirability, Viability, Usability, Feasibility with pretotype experiments.", icon: "🧪", route: "/stage/2/dvuf" },
    { id: "beachhead", title: "Beachhead Market", desc: "Evaluate segments — size, accessibility, urgency, willingness to pay.", icon: "🏁", route: "/stage/2/beachhead" },
    { id: "ost", title: "Opportunity Solution Tree", desc: "Outcome → Opportunities → Solutions → Experiments.", icon: "🌳", route: "/stage/2/ost" },
    { id: "kano2", title: "Kano Model", desc: "Must-be, Performance, Attractive, Indifferent, Reverse.", icon: "📊", route: "/stage/2/kano" },
    { id: "assumption-map", title: "Assumption Map", desc: "2×2: importance vs evidence strength. Test the riskiest first.", icon: "🧭", route: "/stage/2/assumptions" },
    { id: "signal-tracker", title: "Behavioral Signal Tracker", desc: "Expected vs actual behaviors with evidence links.", icon: "📡", route: "/stage/2/signals" },
    { id: "hypothesis", title: "Hypothesis Template", desc: "We believe → we test → we measure → we know if.", icon: "🔬", route: "/stage/2/hypothesis" },
    { id: "multi-perspective", title: "Multi-Perspective Review", desc: "User, Business, Technology, Market — score and risk each.", icon: "👁", route: "/stage/2/multi-perspective" },
  ]},
  { label: "Decision Gate", color: "#1B9C85", desc: "Review & Decide", items: [
    { id: "gate", title: "Opportunity Validation Brief", desc: "Top opportunity, RICE scores, assumptions tested, behavioral evidence, GO/PIVOT/KILL.", icon: "📄", route: "/stage/2/gate" },
  ]},
];

const REC_ORDER = ["input-panel", "jtbd-canvas", "rww", "rice", "dvuf", "beachhead", "ost", "kano2", "assumption-map", "signal-tracker", "hypothesis", "multi-perspective", "gate"];
const REC_LABELS = { "input-panel": "Input Panel", "jtbd-canvas": "JTBD Canvas", "rww": "RWW Enhanced", "rice": "RICE Calculator", "dvuf": "DVUF Planner", "beachhead": "Beachhead Market", "ost": "Opportunity Solution Tree", "kano2": "Kano Model", "assumption-map": "Assumption Map", "signal-tracker": "Signal Tracker", "hypothesis": "Hypothesis Template", "multi-perspective": "Multi-Perspective Review", "gate": "Decision Gate" };

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

export default function Stage2Landing() {
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
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#F1C40F", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(241,196,15,0.3)" }}><span style={{ fontSize: 20 }}>🎯</span></div>
            <div>
              <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#F1C40F", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>Stage 2</p>
              <h1 style={{ fontSize: mobile ? 22 : 32, fontFamily: "'Playfair Display',serif", fontWeight: 900, color: t.text, margin: 0, lineHeight: 1.15 }}>Opportunity Scout</h1>
            </div>
          </div>
          <p style={{ fontSize: 13, color: t.textMuted, margin: "0 0 20px", maxWidth: 500 }}>What is the best opportunity to pursue — and what should we ignore?</p>
        </div>
        <div style={{ padding: mobile ? "0 16px 60px" : "0 32px 60px" }}>
          {/* Live stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(140px, 100%), 1fr))", gap: 10, marginBottom: 14 }}>
            {[
              { label: "Artifacts Touched", value: `${touchedCount}/${totalCount}`, color: touchedCount > 0 ? "#1B9C85" : "#95A5A6" },
              { label: "Readiness Criteria", value: `${gate.passed}/${gate.total}`, color: gate.passed > 0 ? "#1B9C85" : "#E67E22" },
              { label: "Gate Status", value: gate.decision ? gate.decision.toUpperCase() : "Pending", color: gate.decision === "go" ? "#1B9C85" : gate.decision ? "#E67E22" : "#95A5A6" },
              { label: "Decision", value: gate.decision ? gate.decision.toUpperCase() : "—", color: gate.decision === "go" ? "#1B9C85" : gate.decision ? "#E67E22" : t.textMuted },
            ].map((s, i) => (
              <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: t.card, border: `1px solid ${t.cardBorder}` }}>
                <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: t.textDim, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: s.color, margin: 0, fontFamily: "'DM Mono',monospace" }}>{s.value}</p>
              </div>
            ))}
          </div>
          {/* Recommended next */}
          {nextRec && REC_LABELS[nextRec] && (() => { const route = allItems.find(i => i.id === nextRec)?.route; return route ? (
            <div onClick={() => window.location.href = route} style={{ padding: "14px 18px", background: "#F1C40F10", border: "1px solid #F1C40F30", borderRadius: 12, marginBottom: 20, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F1C40F", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16, color: "#000", fontWeight: 700 }}>→</span></div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontFamily: "'DM Mono',monospace", color: "#D4AC0D", margin: "0 0 2px", fontWeight: 600 }}>RECOMMENDED NEXT</p>
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
              {["At least 3 opportunities identified and scored", "Top opportunity has RICE score with evidence", "Key assumptions mapped (importance × evidence)", "Behavioral validation signals defined", "Beachhead market identified", "Experiment plan for top 2-3 assumptions", "Clear 'not pursuing' list with rationale"].map((c, i) => {
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
