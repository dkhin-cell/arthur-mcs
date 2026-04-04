// Stage4Landing.tsx — Ported from Level 1 Stage4Landing.jsx
'use client';
import { useState, useEffect } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STAGE_COLOR = "#3498DB";

const GROUPS = [
  { title: "Input", items: [{ name: "Input Panel", route: "/stage/4/input", key: "dk-stage4-session" }] },
  { title: "The Living Brief", items: [{ name: "Living Brief Engine", route: "/stage/4/gate", key: "dk-stage4-brief", isHighlight: true }] },
  { title: "Planning Frameworks", items: [
    { name: "Roadmap", route: "/stage/4/roadmap", key: "dk-stage4-roadmap" },
    { name: "DACI (Execution)", route: "/stage/4/daci", key: "dk-stage4-daci" },
    { name: "OKRs (Execution)", route: "/stage/4/okr", key: "dk-stage4-okr" },
    { name: "Dependency Map", route: "/stage/4/dependencies", key: "dk-stage4-dependencies" },
    { name: "User Stories", route: "/stage/4/stories", key: "dk-stage4-stories" },
    { name: "Acceptance Criteria", route: "/stage/4/acceptance", key: "dk-stage4-acceptance" },
  ]},
  { title: "Decision Gate", items: [{ name: "Stage 4 Decision Gate", route: "/stage/4/gate", key: "dk-stage4-gate", isGate: true }] },
];

const READINESS = [
  "Living Brief assembled with evidence scores",
  "Roadmap defined with milestones",
  "DACI assigned for execution",
  "OKRs with measurable key results",
  "User stories with acceptance criteria",
  "All red sections acknowledged or addressed",
  "Brief earned at least 'Opportunity Brief' level",
];

const NAMING_LEVELS = [
  { level: 1, name: "Working Draft", req: "No gates passed", color: "#95A5A6" },
  { level: 2, name: "Problem Brief", req: "Stage 0 GO", color: "#E74C3C" },
  { level: 3, name: "Strategy Brief", req: "Stages 0+1 GO", color: "#E67E22" },
  { level: 4, name: "Opportunity Brief", req: "Stages 0-2 GO", color: "#F1C40F" },
  { level: 5, name: "Product Brief", req: "Stages 0-3 GO", color: "#2ECC71" },
  { level: 6, name: "PRD", req: "All gates + stories + criteria", color: "#1B9C85" },
];

function hasData(key) { try { const d = localStorage.getItem(key); return d && d !== "{}" && d !== "null"; } catch (e) { return false; } }

function getBriefName() {
  const g = {};
  try { g.s0 = JSON.parse(localStorage.getItem("dk-stage0-gate") || "{}").decision; } catch (e) {}
  try { g.s1 = JSON.parse(localStorage.getItem("dk-stage1-gate") || "{}").decision; } catch (e) {}
  try { g.s2 = JSON.parse(localStorage.getItem("dk-stage2-gate") || "{}").decision; } catch (e) {}
  try { g.s3 = JSON.parse(localStorage.getItem("dk-stage3-gate") || "{}").decision; } catch (e) {}
  const hs = hasData("dk-stage4-stories") && hasData("dk-stage4-acceptance");
  if (g.s0 === "go" && g.s1 === "go" && g.s2 === "go" && g.s3 === "go" && hs) return NAMING_LEVELS[5];
  if (g.s0 === "go" && g.s1 === "go" && g.s2 === "go" && g.s3 === "go") return NAMING_LEVELS[4];
  if (g.s0 === "go" && g.s1 === "go" && g.s2 === "go") return NAMING_LEVELS[3];
  if (g.s0 === "go" && g.s1 === "go") return NAMING_LEVELS[2];
  if (g.s0 === "go") return NAMING_LEVELS[1];
  return NAMING_LEVELS[0];
}

export default function Stage4Landing() {
  const [theme] = useState(getTheme); const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);

  const allItems = GROUPS.flatMap(g => g.items);
  const touched = allItems.filter(i => hasData(i.key)).length;
  const gate = (() => { try { return JSON.parse(localStorage.getItem("dk-stage4-gate") || "{}"); } catch (e) { return {}; } })();
  const brief = getBriefName();
  const readinessPass = READINESS.filter((_, i) => {
    if (i === 0) return hasData("dk-stage4-brief");
    if (i === 1) return hasData("dk-stage4-roadmap");
    if (i === 2) return hasData("dk-stage4-daci");
    if (i === 3) return hasData("dk-stage4-okr");
    if (i === 4) return hasData("dk-stage4-stories") && hasData("dk-stage4-acceptance");
    if (i === 6) return brief.level >= 4;
    return false;
  }).length;
  const recommended = !hasData("dk-stage4-session") ? GROUPS[0].items[0] : !hasData("dk-stage4-brief") ? GROUPS[1].items[0] : !hasData("dk-stage4-roadmap") ? GROUPS[2].items[0] : GROUPS[3].items[0];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />
      <a href="#/" style={{ fontSize: 13, color: "#2980B9", textDecoration: "none", display: "inline-block", marginBottom: 16 }}>← Back To Arthur PM MCS</a>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: STAGE_COLOR, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>🗺 STAGE 4</p>
        <h1 style={{ fontSize: mobile ? 28 : 36, fontFamily: "'Playfair Display',serif", fontWeight: 900, color: t.text, margin: "0 0 8px" }}>Planning & Roadmap</h1>
        <p style={{ fontSize: 16, color: t.textMuted, margin: 0, fontStyle: "italic" }}>What do we build, in what order, and what's the evidence behind every section?</p>
        <div style={{ width: 60, height: 4, background: STAGE_COLOR, borderRadius: 2, marginTop: 12 }} />
      </div>

      {/* Brief naming badge */}
      <div style={{ padding: "14px 18px", background: `${brief.color}10`, border: `2px solid ${brief.color}40`, borderRadius: 14, marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 28 }}>📄</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: brief.color, margin: "0 0 2px", fontWeight: 600 }}>DOCUMENT STATUS — LEVEL {brief.level}/6</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: brief.color, margin: 0 }}>{brief.name}</p>
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {[1,2,3,4,5,6].map(l => <div key={l} style={{ width: 12, height: 12, borderRadius: 3, background: l <= brief.level ? brief.color : t.cardBorder }} />)}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Artifacts Touched", value: `${touched}/${allItems.length}` },
          { label: "Readiness Criteria", value: `${readinessPass}/${READINESS.length}` },
          { label: "Gate Status", value: gate.decision ? gate.decision.toUpperCase() : "Pending" },
          { label: "Brief Level", value: brief.name },
        ].map((s, i) => (
          <div key={i} style={{ padding: "14px 16px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 12 }}>
            <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: t.textDim, margin: "0 0 4px", textTransform: "uppercase" }}>{s.label}</p>
            <p style={{ fontSize: i === 3 ? 14 : 22, fontWeight: 800, color: STAGE_COLOR, margin: 0, fontFamily: "'DM Mono',monospace" }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div onClick={() => window.location.href = recommended.route} style={{ padding: "14px 18px", background: `${STAGE_COLOR}10`, border: `1px solid ${STAGE_COLOR}30`, borderRadius: 12, marginBottom: 20, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 12, color: STAGE_COLOR, fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>→ RECOMMENDED NEXT:</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{recommended.name}</span>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {["Input", "Living Brief", "Roadmap", "DACI", "OKRs", "Dependencies", "Stories", "Criteria", "Gate"].map((p, i) => (
          <span key={i} style={{ padding: "4px 12px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: `${STAGE_COLOR}10`, color: STAGE_COLOR, border: `1px solid ${STAGE_COLOR}20` }}>{i > 0 && "→ "}{p}</span>
        ))}
      </div>

      {GROUPS.map((group, gi) => (
        <div key={gi} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: t.textDim, margin: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>{group.title}</p>
            <span style={{ fontSize: 10, color: STAGE_COLOR, fontFamily: "'DM Mono',monospace" }}>{group.items.filter(i => hasData(i.key)).length}/{group.items.length}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 10 }}>
            {group.items.map((item, ii) => {
              const active = hasData(item.key);
              return (
                <div key={ii} onClick={() => window.location.href = item.route} style={{ padding: "16px 18px", background: item.isHighlight ? `${STAGE_COLOR}08` : t.card, border: `1px solid ${active || item.isHighlight ? STAGE_COLOR + "40" : t.cardBorder}`, borderRadius: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, gridColumn: item.isHighlight ? "1 / -1" : undefined }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = STAGE_COLOR; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = active || item.isHighlight ? STAGE_COLOR + "40" : t.cardBorder; }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: active ? STAGE_COLOR : t.cardBorder, flexShrink: 0 }} />
                  <span style={{ fontSize: item.isHighlight ? 17 : 15, fontWeight: item.isHighlight ? 700 : 600, color: t.text, flex: 1 }}>{item.name}</span>
                  {item.isHighlight && <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: `${brief.color}15`, color: brief.color, fontWeight: 600 }}>{brief.name}</span>}
                  {active && !item.isHighlight && <span style={{ fontSize: 10, color: STAGE_COLOR }}>✓</span>}
                  <span style={{ color: t.textDim, fontSize: 14 }}>→</span>
                </div>
              );
            })}
          </div>
          {gi < GROUPS.length - 1 && <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}><span style={{ fontSize: 16, color: t.cardBorder }}>↓</span></div>}
        </div>
      ))}

      <div style={{ padding: "16px 18px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, marginTop: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: t.text, margin: "0 0 10px" }}>🚦 Readiness ({readinessPass}/{READINESS.length})</p>
        {READINESS.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 0" }}>
            <span style={{ fontSize: 14 }}>{(i === 0 && hasData("dk-stage4-brief")) || (i === 1 && hasData("dk-stage4-roadmap")) || (i === 2 && hasData("dk-stage4-daci")) || (i === 3 && hasData("dk-stage4-okr")) || (i === 4 && hasData("dk-stage4-stories") && hasData("dk-stage4-acceptance")) || (i === 6 && brief.level >= 4) ? "✅" : "☐"}</span>
            <span style={{ fontSize: 13, color: t.textMuted }}>{c}</span>
          </div>
        ))}
        <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 8 }}>Gates advise. They don't block. You decide.</p>
      </div>

      <div style={{ padding: "14px 18px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, marginTop: 12 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: t.text, margin: "0 0 8px" }}>📄 Your document earns its name</p>
        {NAMING_LEVELS.map(l => (
          <div key={l.level} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0" }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: brief.level >= l.level ? l.color : t.cardBorder }} />
            <span style={{ fontSize: 12, fontWeight: brief.level === l.level ? 700 : 400, color: brief.level === l.level ? l.color : t.textMuted }}>{l.name}</span>
            <span style={{ fontSize: 10, color: t.textDim, fontFamily: "'DM Mono',monospace", marginLeft: "auto" }}>{l.req}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, textAlign: "center", paddingTop: 16, borderTop: `1px solid ${t.cardBorder}` }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: t.textDim }}>© 2026 Arthur · Mission Control System</p>
      </div>
    </div>
  );
}
