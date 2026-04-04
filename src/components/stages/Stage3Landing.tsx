// Stage3Landing.tsx — Ported from Level 1 Stage3Landing.jsx
'use client';
import { useState, useEffect } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STAGE_COLOR = "#2ECC71";
const STAGE_NUM = 3;
const STAGE_ICON = "✏️";
const STAGE_TITLE = "Design & MVP";
const STAGE_QUESTION = "What does the user need — and does this solution actually work?";

const GROUPS = [
  { title: "Input", items: [{ name: "Input Panel", route: "/stage/3/input", key: "dk-stage3-session" }], label: "Context & Carry-Forward" },
  { title: "Experience Design", items: [
    { name: "Customer Journey Map", route: "/stage/3/journey", key: "dk-stage3-journey" },
    { name: "User Flow & IA Mapper", route: "/stage/3/userflow", key: "dk-stage3-userflow" },
  ]},
  { title: "Hypothesis & Validation", items: [
    { name: "UX Hypothesis Canvas", route: "/stage/3/ux-hypothesis", key: "dk-stage3-uxhypothesis" },
    { name: "Prototype Spec", route: "/stage/3/prototype", key: "dk-stage3-protospec" },
    { name: "Usability Test Plan", route: "/stage/3/usability", key: "dk-stage3-usability" },
  ]},
  { title: "Decision Gate", items: [{ name: "Stage 3 Decision Gate", route: "/stage/3/gate", key: "dk-stage3-gate", isGate: true }] },
];

const READINESS = [
  "Customer journey mapped with pain points and opportunities",
  "User flow defined with entry and exit points",
  "At least 3 UX hypotheses written with success metrics",
  "Prototype scope defined with fidelity and tool selected",
  "Usability test plan with tasks and success threshold",
  "At least 1 UX hypothesis tested or test scheduled",
];

function hasData(key) { try { const d = localStorage.getItem(key); return d && d !== "{}" && d !== "null"; } catch (e) { return false; } }

export default function Stage3Landing() {
  const [theme] = useState(getTheme); const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);

  const allItems = GROUPS.flatMap(g => g.items);
  const touched = allItems.filter(i => hasData(i.key)).length;
  const total = allItems.length;
  const gate = (() => { try { return JSON.parse(localStorage.getItem("dk-stage3-gate") || "{}"); } catch (e) { return {}; } })();
  const readinessPass = READINESS.filter((_, i) => {
    if (i === 0) return hasData("dk-stage3-journey");
    if (i === 1) return hasData("dk-stage3-userflow");
    if (i === 2) return hasData("dk-stage3-uxhypothesis");
    if (i === 3) return hasData("dk-stage3-protospec");
    if (i === 4) return hasData("dk-stage3-usability");
    return false;
  }).length;

  const recommended = !hasData("dk-stage3-session") ? GROUPS[0].items[0] : !hasData("dk-stage3-journey") ? GROUPS[1].items[0] : !hasData("dk-stage3-userflow") ? GROUPS[1].items[1] : !hasData("dk-stage3-uxhypothesis") ? GROUPS[2].items[0] : !hasData("dk-stage3-protospec") ? GROUPS[2].items[1] : !hasData("dk-stage3-usability") ? GROUPS[2].items[2] : GROUPS[3].items[0];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />

      <a href="#/" style={{ fontSize: 13, color: "#2980B9", textDecoration: "none", display: "inline-block", marginBottom: 16 }}>← Back To Arthur PM MCS</a>

      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: STAGE_COLOR, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>{STAGE_ICON} STAGE {STAGE_NUM}</p>
        <h1 style={{ fontSize: mobile ? 28 : 36, fontFamily: "'Playfair Display',serif", fontWeight: 900, color: t.text, margin: "0 0 8px" }}>{STAGE_TITLE}</h1>
        <p style={{ fontSize: 16, color: t.textMuted, margin: 0, fontStyle: "italic" }}>{STAGE_QUESTION}</p>
        <div style={{ width: 60, height: 4, background: STAGE_COLOR, borderRadius: 2, marginTop: 12 }} />
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Artifacts Touched", value: `${touched}/${total}` },
          { label: "Readiness Criteria", value: `${readinessPass}/${READINESS.length}` },
          { label: "Gate Status", value: gate.decision ? gate.decision.toUpperCase() : "Pending" },
          { label: "Decision", value: gate.decision ? gate.decision.toUpperCase() : "—" },
        ].map((s, i) => (
          <div key={i} style={{ padding: "14px 16px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 12 }}>
            <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: t.textDim, margin: "0 0 4px", textTransform: "uppercase" }}>{s.label}</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: i === 2 && gate.decision === "go" ? "#1B9C85" : i === 2 && gate.decision === "kill" ? "#E74C3C" : STAGE_COLOR, margin: 0, fontFamily: "'DM Mono',monospace" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recommended Next */}
      <div onClick={() => window.location.href = recommended.route} style={{ padding: "14px 18px", background: `${STAGE_COLOR}10`, border: `1px solid ${STAGE_COLOR}30`, borderRadius: 12, marginBottom: 20, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 12, color: STAGE_COLOR, fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>→ RECOMMENDED NEXT:</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{recommended.name}</span>
      </div>

      {/* Flow hint pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {["Input", "Journey Map", "User Flow", "UX Hypotheses", "Prototype Spec", "Usability Test", "Gate"].map((p, i) => (
          <span key={i} style={{ padding: "4px 12px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: `${STAGE_COLOR}10`, color: STAGE_COLOR, border: `1px solid ${STAGE_COLOR}20` }}>
            {i > 0 && "→ "}{p}
          </span>
        ))}
      </div>

      {/* Framework groups */}
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
                <div key={ii} onClick={() => window.location.href = item.route} style={{ padding: "16px 18px", background: t.card, border: `1px solid ${active ? STAGE_COLOR + "40" : t.cardBorder}`, borderRadius: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = STAGE_COLOR; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = active ? STAGE_COLOR + "40" : t.cardBorder; }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: active ? STAGE_COLOR : t.cardBorder, flexShrink: 0 }} />
                  <span style={{ fontSize: 15, fontWeight: 600, color: t.text, flex: 1 }}>{item.name}</span>
                  {active && <span style={{ fontSize: 10, color: STAGE_COLOR, fontFamily: "'DM Mono',monospace" }}>✓</span>}
                  <span style={{ color: t.textDim, fontSize: 14 }}>→</span>
                </div>
              );
            })}
          </div>
          {gi < GROUPS.length - 1 && <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}><span style={{ fontSize: 16, color: t.cardBorder }}>↓</span></div>}
        </div>
      ))}

      {/* Readiness Criteria */}
      <div style={{ padding: "16px 18px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, marginTop: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: t.text, margin: "0 0 10px" }}>🚦 Readiness Criteria ({readinessPass}/{READINESS.length} pass)</p>
        {READINESS.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 0" }}>
            <span style={{ fontSize: 14 }}>{(i === 0 && hasData("dk-stage3-journey")) || (i === 1 && hasData("dk-stage3-userflow")) || (i === 2 && hasData("dk-stage3-uxhypothesis")) || (i === 3 && hasData("dk-stage3-protospec")) || (i === 4 && hasData("dk-stage3-usability")) ? "✅" : "☐"}</span>
            <span style={{ fontSize: 13, color: t.textMuted }}>{c}</span>
          </div>
        ))}
        <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 8 }}>Gates advise. They don't block. You decide.</p>
      </div>

      <div style={{ marginTop: 32, textAlign: "center", paddingTop: 16, borderTop: `1px solid ${t.cardBorder}` }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: t.textDim }}>© 2026 Arthur · Mission Control System</p>
      </div>
    </div>
  );
}
