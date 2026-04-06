import { useState, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════
   ARTHUR MCS — PRO TIER ($19.99/mo) — V3
   
   ✓ Stage 1 default (NOT Stage 0)
   ✓ 5 missions, colored initial badges (no emoji)
   ✓ "Related Missions" container with Product name right-aligned
   ✓ "Stage 1" full text (not S1)
   ✓ Progress bar + % on siblings only, "You" on owned
   ✓ Sidebar: solid #FFFFFF, border #E0E4EA, 280px
   ✓ Situation Room icon: 🎖️
   ✓ Light mode default (#F5F7FA)
   ═══════════════════════════════════════════════════════════ */

const STAGES = [
  { n: 0, name: "Problem Validator", icon: "🔬", color: "#E74C3C" },
  { n: 1, name: "Strategy Architect", icon: "🧭", color: "#E67E22" },
  { n: 2, name: "Opportunity Scout", icon: "🎯", color: "#F1C40F" },
  { n: 3, name: "Design & Prototype", icon: "✏️", color: "#2ECC71" },
  { n: 4, name: "Planning & Roadmap", icon: "🗺️", color: "#3498DB" },
  { n: 5, name: "Build & Ship", icon: "🚀", color: "#1ABC9C" },
  { n: 6, name: "Measure & Learn", icon: "💎", color: "#9B59B6" },
  { n: 7, name: "Maturity & Maintenance", icon: "📊", color: "#C0392B" },
  { n: 8, name: "Sunset & Portfolio", icon: "🏛️", color: "#7F8C8D" },
];

// Color palette for mission badges (auto-assigned, no emoji)
const BADGE_COLORS = ["#1B4F72", "#8E44AD", "#C0392B", "#27AE60", "#D35400"];

const MISSIONS = [
  { id: "ridex", name: "RideX Jakarta", stage: 1, progress: 72, owned: true, owner: "You", badgeColor: BADGE_COLORS[0] },
  { id: "eats", name: "UberEats Jakarta", stage: 0, progress: 45, owned: false, owner: "Sarah L.", badgeColor: BADGE_COLORS[1] },
  { id: "driver", name: "Driver Supply Program", stage: 2, progress: 58, owned: true, owner: "You", badgeColor: BADGE_COLORS[2] },
  { id: "fleet", name: "Fleet Optimization", stage: 4, progress: 34, owned: false, owner: "Mike R.", badgeColor: BADGE_COLORS[3] },
  { id: "regulatory", name: "Regulatory Compliance", stage: 1, progress: 61, owned: false, owner: "Ayu P.", badgeColor: BADGE_COLORS[4] },
];

const S1_FRAMEWORKS = [
  { id: "v2mom", name: "V2MOM", icon: "🎯", desc: "Vision, Values, Methods, Obstacles, Measures", status: "in_progress",
    fields: [
      { k: "vision", l: "Vision", p: "In [timeframe], [product] will [outcome] for [users] by [approach]" },
      { k: "values", l: "Values", p: "What matters most? Rank your priorities." },
      { k: "methods", l: "Methods", p: "How will you achieve the vision?" },
      { k: "obstacles", l: "Obstacles", p: "What stands in the way?" },
      { k: "measures", l: "Measures", p: "How will you know you succeeded?" },
    ]},
  { id: "psc", name: "Product Strategy Canvas", icon: "🗺️", desc: "Target user, problem, value prop, solution, metrics", status: "not_started",
    fields: [
      { k: "target", l: "Target User", p: "Who specifically are you building for?" },
      { k: "problem", l: "Problem", p: "What is the core pain?" },
      { k: "value_prop", l: "Value Proposition", p: "Why choose you over alternatives?" },
      { k: "solution", l: "Solution", p: "Your approach to solving it" },
      { k: "unfair", l: "Unfair Advantage", p: "What cannot be easily copied?" },
    ]},
  { id: "bmc", name: "Business Model Canvas", icon: "📋", desc: "Standard 9-block business model", status: "not_started",
    fields: [
      { k: "partners", l: "Key Partners", p: "Who are your key partners and suppliers?" },
      { k: "activities", l: "Key Activities", p: "What key activities does your value proposition require?" },
      { k: "value", l: "Value Propositions", p: "What value do you deliver to the customer?" },
      { k: "segments", l: "Customer Segments", p: "For whom are you creating value?" },
      { k: "revenue", l: "Revenue Streams", p: "For what value are customers willing to pay?" },
    ]},
  { id: "pestle", name: "PESTLE Analysis", icon: "🌍", desc: "Political, economic, social, tech, legal, environmental", status: "not_started",
    fields: [
      { k: "political", l: "Political", p: "Government policy, regulation, trade restrictions" },
      { k: "economic", l: "Economic", p: "Growth rates, exchange rates, inflation" },
      { k: "social", l: "Social", p: "Demographics, cultural trends, lifestyle changes" },
      { k: "tech", l: "Technological", p: "Innovation, automation, R&D activity" },
      { k: "legal", l: "Legal", p: "Employment law, consumer law, health and safety" },
      { k: "env", l: "Environmental", p: "Climate, sustainability, environmental regulations" },
    ]},
  { id: "northstar", name: "North Star Selector", icon: "⭐", desc: "Candidate metrics scoring and selection", status: "not_started",
    fields: [
      { k: "candidates", l: "Candidate Metrics", p: "List 3-5 potential North Star metrics" },
      { k: "criteria", l: "Scoring Criteria", p: "Reflects user value, measures growth, indicates business health" },
      { k: "winner", l: "Selected North Star", p: "Which metric best represents your product's core value?" },
    ]},
  { id: "metrics", name: "Input / Output Metric Map", icon: "📈", desc: "Input metrics → North Star → Output metrics flow", status: "not_started",
    fields: [
      { k: "inputs", l: "Input Metrics", p: "Leading indicators you can directly influence" },
      { k: "northstar", l: "North Star Metric", p: "Your single most important metric" },
      { k: "outputs", l: "Output Metrics", p: "Business outcomes that follow from the North Star" },
    ]},
  { id: "okr", name: "OKR Builder", icon: "🏆", desc: "Objectives with measurable key results", status: "not_started",
    fields: [
      { k: "obj1", l: "Objective 1", p: "Qualitative, inspiring goal" },
      { k: "kr1", l: "Key Results (Obj 1)", p: "2-4 measurable results with baseline and target" },
      { k: "obj2", l: "Objective 2", p: "Second strategic objective" },
      { k: "kr2", l: "Key Results (Obj 2)", p: "2-4 measurable results" },
    ]},
  { id: "daci", name: "DACI", icon: "👥", desc: "Decision matrix: Driver, Approver, Contributors, Informed", status: "not_started",
    fields: [
      { k: "decision", l: "Decision", p: "What decision needs to be made?" },
      { k: "driver", l: "Driver", p: "Who owns driving the decision forward?" },
      { k: "approver", l: "Approver", p: "Who has final sign-off?" },
      { k: "contributors", l: "Contributors", p: "Who provides input?" },
      { k: "informed", l: "Informed", p: "Who needs to know the outcome?" },
    ]},
  { id: "vct", name: "Vision Clarity Test", icon: "🔎", desc: "Is the vision specific, measurable, inspiring, differentiating?", status: "not_started",
    fields: [
      { k: "specific", l: "Is It Specific?", p: "Does it clearly define what you will build?" },
      { k: "measurable", l: "Is It Measurable?", p: "Can you tell when you have achieved it?" },
      { k: "inspiring", l: "Is It Inspiring?", p: "Does it motivate the team?" },
      { k: "differentiating", l: "Is It Differentiating?", p: "Does it set you apart from competitors?" },
    ]},
];

const CARRY_FORWARD = [
  { label: "Validated Problem", value: "Jakarta riders experience 2.3x longer wait times during peak hours vs. off-peak", from: "Stage 0" },
  { label: "Primary JTBD", value: "When I need a ride during rush hour, I want reliable pickup times so I can plan my commute", from: "Stage 0" },
  { label: "Key Evidence", value: "73% of surveyed Jakarta commuters cite unpredictable wait as #1 pain point", from: "Stage 0" },
];

// ── Colored Initial Badge (replaces emoji) ──
function MissionBadge({ name, color, size = 28 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3,
      background: color, display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: size * 0.45, fontWeight: 700, flexShrink: 0,
      letterSpacing: -0.5,
    }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ── Sidebar ──
function Sidebar({ open, onClose, view, onNav, isMobile, mission, setMission, mDropOpen, setMDropOpen }) {
  const style = {
    position: "fixed", top: 0, left: 0, height: "100%",
    background: "#FFFFFF", borderRight: "1px solid #E0E4EA",
    display: "flex", flexDirection: "column", zIndex: 200,
    transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
    width: isMobile ? "100%" : 280,
    transform: isMobile ? (open ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
  };

  const activeMission = MISSIONS.find(m => m.id === mission);

  return (
    <>
      {open && isMobile && (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 150 }} />
      )}
      <nav style={style}>
        {isMobile && (
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 24, color: "#6B7D8F", cursor: "pointer", zIndex: 10 }}>✕</button>
        )}

        {/* Logo */}
        <div style={{ padding: "20px 20px 10px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg, #1B4F72 0%, #2980B9 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 800 }}>A</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1A2332", letterSpacing: -0.3 }}>Arthur MCS</div>
            <div style={{ fontSize: 12, color: "#E67E22", fontWeight: 600 }}>Pro · $19.99/mo</div>
          </div>
        </div>

        {/* Product Label */}
        <div style={{ padding: "4px 20px 6px", flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#99A5B3", letterSpacing: 1, textTransform: "uppercase" }}>Product</div>
          <div style={{ fontSize: 14, fontWeight: 650, color: "#1A2332", marginTop: 2 }}>Uber SEA Phase 3 Jakarta</div>
        </div>

        {/* Mission Dropdown — with colored initial badges */}
        <div style={{ padding: "4px 14px 6px", position: "relative", flexShrink: 0 }}>
          <button onClick={() => setMDropOpen(!mDropOpen)} style={{
            width: "100%", padding: "10px 12px", borderRadius: 8,
            background: "#F3F5F8", border: "1px solid #E0E4EA",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
            fontSize: 13, fontWeight: 600, color: "#3D5066",
          }}>
            <MissionBadge name={activeMission?.name || ""} color={activeMission?.badgeColor || "#1B4F72"} size={22} />
            <span style={{ flex: 1, textAlign: "left", fontSize: 13 }}>{activeMission?.name}</span>
            <span style={{ fontSize: 12, color: "#99A5B3" }}>{mDropOpen ? "▲" : "▼"}</span>
          </button>

          {mDropOpen && (
            <div style={{ position: "absolute", left: 14, right: 14, top: "100%", marginTop: 4, background: "#FFFFFF", border: "1px solid #E0E4EA", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 300, overflow: "hidden" }}>
              {MISSIONS.map(m => (
                <button key={m.id} onClick={() => { setMission(m.id); setMDropOpen(false); }} style={{
                  width: "100%", padding: "10px 14px", border: "none",
                  background: m.id === mission ? "#EAF2FB" : "#fff",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                  fontSize: 13, fontWeight: m.id === mission ? 650 : 500,
                  color: m.id === mission ? "#1B4F72" : "#3D5066",
                  borderBottom: "1px solid #F3F5F8",
                }}>
                  <MissionBadge name={m.name} color={m.badgeColor} size={20} />
                  <span style={{ flex: 1, textAlign: "left" }}>{m.name}</span>
                  <span style={{ fontSize: 11, color: "#99A5B3" }}>Stage {m.stage}</span>
                </button>
              ))}
              <button style={{ width: "100%", padding: "10px 14px", border: "none", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 600, color: "#1B4F72" }}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>＋</span> New Mission
              </button>
            </div>
          )}
        </div>

        {/* Situation Room */}
        <div style={{ padding: "6px 14px 2px", flexShrink: 0 }}>
          <button onClick={() => onNav("sr")} style={{
            width: "100%", padding: "9px 12px", borderRadius: 8, border: "none",
            background: view === "sr" ? "#EAF2FB" : "transparent",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 9,
            fontSize: 14, fontWeight: 600,
            color: view === "sr" ? "#1B4F72" : "#4A5E73",
          }}>
            <span style={{ fontSize: 17 }}>🎖️</span> Situation Room
          </button>
        </div>

        <div style={{ height: 1, background: "#E0E4EA", margin: "8px 18px 4px", flexShrink: 0 }} />

        {/* 9 Stages */}
        <div style={{ padding: "2px 14px", flex: 1, overflowY: "auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#99A5B3", letterSpacing: 1.2, textTransform: "uppercase", padding: "4px 12px 8px" }}>Stages</div>
          {STAGES.map(st => {
            const act = view === `s${st.n}`;
            return (
              <button key={st.n} onClick={() => onNav(`s${st.n}`)} style={{
                width: "100%", padding: "9px 12px", borderRadius: 8, border: "none",
                background: act ? "#EAF2FB" : "transparent",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                fontSize: 14, fontWeight: act ? 650 : 500,
                color: act ? "#1B4F72" : "#3D5066", marginBottom: 1,
              }}>
                <span style={{ fontSize: 17, width: 24, textAlign: "center" }}>{st.icon}</span>
                <span style={{ flex: 1, textAlign: "left" }}>{st.name}</span>
                {st.n === 0 && <span style={{ fontSize: 10, color: "#27AE60", fontWeight: 700 }}>✓ GO</span>}
                {st.n === 1 && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E67E22", display: "inline-block" }} />}
              </button>
            );
          })}
        </div>

        {/* Intelligence */}
        <div style={{ flexShrink: 0, padding: "0 14px 4px" }}>
          <div style={{ height: 1, background: "#E0E4EA", margin: "4px 4px 8px" }} />
          <div style={{ fontSize: 10, fontWeight: 700, color: "#99A5B3", letterSpacing: 1.2, textTransform: "uppercase", padding: "2px 12px 8px" }}>Intelligence</div>
          {[{ icon: "📡", name: "Ambient Radar", key: "ar" }, { icon: "⚡", name: "Validation Telemetry", key: "vt" }].map(mod => (
            <button key={mod.key} onClick={() => onNav(mod.key)} style={{
              width: "100%", padding: "9px 12px", borderRadius: 8, border: "none",
              background: view === mod.key ? "#EAF2FB" : "transparent",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
              fontSize: 14, fontWeight: view === mod.key ? 650 : 500,
              color: view === mod.key ? "#1B4F72" : "#4A5E73", marginBottom: 1,
            }}>
              <span style={{ fontSize: 17, width: 24, textAlign: "center" }}>{mod.icon}</span> {mod.name}
            </button>
          ))}
        </div>

        {/* Profile */}
        <div style={{ borderTop: "1px solid #E0E4EA", padding: "14px 18px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #1ABC9C, #16A085)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700 }}>D</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1A2332" }}>David</div>
              <div style={{ fontSize: 12, color: "#E67E22", fontWeight: 500 }}>Pro Plan</div>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {["Settings", "Billing", "Get Help", "Learning Center", "Log Out"].map(t => (
              <button key={t} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #E0E4EA", background: "#fff", fontSize: 11, fontWeight: 600, color: "#5A6B7D", cursor: "pointer" }}>{t}</button>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}

// Related Missions Component — V8
// Two modes only: mobile (<1024px) and desktop (1024px+)
// Desktop grid adapts: 1+1=50/50, 1+2=33/33/33, 1+3=25x4, 1+4=hero left + 2x2 right
// Mobile LOCKED: hero top full-width, siblings in rows of 2
// 0 siblings = section hidden entirely
// V8 card content: hero = name + You/ACTIVE + progress bar (no Stage #)
// Siblings = name + owner only (no Stage #, no progress bar), lighter weight, tight spacing
function RelatedMissions({ activeMission }) {
  const [isMob, setIsMob] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const check = () => setIsMob(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const hero = MISSIONS.find(m => m.id === activeMission);
  const siblings = MISSIONS.filter(m => m.id !== activeMission);
  const heroPColor = hero.progress >= 60 ? "#27AE60" : hero.progress >= 40 ? "#E67E22" : "#E74C3C";
  const count = siblings.length;

  if (count === 0) return null;

  const heroSpan2Rows = !isMob && count === 4;

  const heroCard = () => (
    <div style={{
      padding: isMob ? "17px 19px" : "18px 20px",
      borderRadius: 10, background: "#FFFFFF",
      border: "1.5px solid #CDD5DE",
      display: "flex", flexDirection: "column",
      justifyContent: "space-between",
      gridColumn: isMob ? "1 / -1" : undefined,
      gridRow: heroSpan2Rows ? "1 / 3" : undefined,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <MissionBadge name={hero.name} color={hero.badgeColor} size={30} />
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1A2332" }}>{hero.name}</div>
      </div>
      <div style={{ marginTop: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#1B4F72", background: "#EAF2FB", padding: "3px 8px", borderRadius: 4 }}>You</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: "#1B4F72", padding: "3px 8px", borderRadius: 4, letterSpacing: 0.3 }}>ACTIVE</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, height: 5, borderRadius: 3, background: "#F0F2F5" }}>
            <div style={{ height: 5, borderRadius: 3, background: heroPColor, width: `${hero.progress}%`, transition: "width 0.3s" }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: heroPColor, minWidth: 32, textAlign: "right" }}>{hero.progress}%</span>
        </div>
      </div>
    </div>
  );

  const siblingCard = (m) => (
    <div key={m.id} style={{
      padding: isMob ? "13px 15px" : "14px 16px", borderRadius: 10,
      background: "#FFFFFF",
      border: "1px solid #E0E4EA",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <MissionBadge name={m.name} color={m.badgeColor} size={26} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1A2332" }}>{m.name}</div>
        {m.owned ? (
          <span style={{ fontSize: 10, fontWeight: 700, color: "#1B4F72", background: "#EAF2FB", padding: "2px 6px", borderRadius: 4, display: "inline-block", marginTop: 3 }}>You</span>
        ) : (
          <div style={{ fontSize: 11, color: "#99A5B3", marginTop: 2 }}>{m.owner}</div>
        )}
      </div>
    </div>
  );

  // Grid logic — two modes only (UNCHANGED from V8 layout)
  let gridStyle;
  if (isMob) {
    gridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };
  } else {
    if (count === 1) {
      gridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, alignItems: "stretch" };
    } else if (count === 2) {
      gridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, alignItems: "stretch" };
    } else if (count === 3) {
      gridStyle = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, alignItems: "stretch" };
    } else {
      gridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "auto auto", gap: 10, alignItems: "stretch" };
    }
  }

  return (
    <div style={{
      marginBottom: 28, padding: isMob ? "14px 16px" : "18px 20px",
      background: "#FFFFFF", border: "1px solid #E0E4EA", borderRadius: 12,
    }}>
      {/* Header — clickable on mobile to expand/collapse */}
      <div
        onClick={() => isMob && setExpanded(!expanded)}
        style={{
          marginBottom: (!isMob || expanded) ? 16 : 0,
          cursor: isMob ? "pointer" : "default",
          padding: isMob ? "4px 0" : 0,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#1A2332" }}>Related Missions</span>
            {isMob && (
              <span style={{
                fontSize: 12, fontWeight: 600, color: "#1B4F72",
                background: "#EAF2FB", padding: "3px 10px", borderRadius: 12,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                {count}
                <span style={{ fontSize: 11, transition: "transform 0.2s", display: "inline-block", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
              </span>
            )}
          </div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7D8F", marginTop: 4 }}>Product: Uber SEA Phase 3 Jakarta</div>
      </div>

      {/* Grid — always visible on desktop, collapsible on mobile */}
      {(!isMob || expanded) && (
        <div style={gridStyle}>
          {heroCard()}
          {siblings.map(m => siblingCard(m))}
        </div>
      )}
    </div>
  );
}

// ── Stage 1 Landing ──
function Stage1Landing({ onFw, activeMission }) {
  const [isMob, setIsMob] = useState(false);
  useEffect(() => {
    const c = () => setIsMob(window.innerWidth < 1024);
    c(); window.addEventListener("resize", c);
    return () => window.removeEventListener("resize", c);
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#E67E22", display: "inline-block" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#99A5B3", letterSpacing: 0.8, textTransform: "uppercase" }}>Stage 1</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 750, color: "#1A2332", margin: 0, letterSpacing: -0.5 }}>Strategy Architect</h1>
        <p style={{ fontSize: 14, color: "#6B7D8F", margin: "6px 0 0", lineHeight: 1.55 }}>
          Define the strategic direction. Where to play, how to win, and what to measure.
        </p>
      </div>

      {/* Stage Navigation — between stage name and Related Missions */}
      <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr 1fr" : "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
        {[
          { key: "brief", label: "Strategy Brief", icon: "📋", desc: "Enter Vision, Constraints | View Carry-Forward" },
          { key: "frameworks", label: "Frameworks", icon: "🧩", desc: "Utilize 9 Analysis Tools", scrollTo: "frameworks-section" },
          { key: "research", label: "Research", icon: "🔬", desc: "AI Research Engine" },
          { key: "gate", label: "Decision Gate", icon: "⚖️", desc: "GO / PIVOT / KILL" },
        ].map(nav => (
          <button key={nav.key}
            onClick={() => {
              if (nav.scrollTo) {
                const el = document.getElementById(nav.scrollTo);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            style={{
              padding: "14px 12px", borderRadius: 10,
              background: "#FFFFFF",
              border: "1px solid #E0E4EA",
              cursor: "pointer", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 6, textAlign: "center",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#CDD5DE"; e.currentTarget.style.background = "#FAFBFC"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#E0E4EA"; e.currentTarget.style.background = "#FFFFFF"; }}
          >
            <span style={{ fontSize: 22 }}>{nav.icon}</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#3D5066" }}>{nav.label}</span>
            <span style={{ fontSize: 12, color: "#99A5B3" }}>{nav.desc}</span>
          </button>
        ))}
      </div>

      <RelatedMissions activeMission={activeMission} />

      {/* Stat Boxes */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        {[
          { l: "Artifacts Touched", v: "1 / 9" },
          { l: "Readiness Criteria", v: "1 / 7" },
          { l: "Gate Status", v: "Open", c: "#E67E22" },
          { l: "Decision", v: "—", c: "#99A5B3" },
        ].map(b => (
          <div key={b.l} style={{ flex: "1 1 150px", padding: "16px 18px", borderRadius: 10, background: "#FFFFFF", border: "1px solid #E0E4EA" }}>
            <div style={{ fontSize: 11, fontWeight: 650, color: "#99A5B3", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>{b.l}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: b.c || "#1A2332" }}>{b.v}</div>
          </div>
        ))}
      </div>

      {/* Recommended Next */}
      <div style={{ padding: "14px 18px", borderRadius: 10, background: "#EAF2FB", border: "1px solid #C5DAF0", marginBottom: 24, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 18 }}>💡</span>
        <span style={{ fontSize: 14, flex: 1 }}>
          <strong style={{ color: "#1B4F72" }}>Recommended Next:</strong>{" "}
          <span style={{ color: "#2C6F9B" }}>Complete V2MOM — 3 carry-forward items from Stage 0 ready to apply.</span>
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#E67E22", background: "#FEF3E2", padding: "3px 8px", borderRadius: 5, whiteSpace: "nowrap" }}>3 carry-forward</span>
      </div>

      {/* Frameworks */}
      <div id="frameworks-section" style={{ fontSize: 14, fontWeight: 700, color: "#3D5066", marginBottom: 12 }}>Frameworks ({S1_FRAMEWORKS.length})</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {S1_FRAMEWORKS.map(fw => {
          const hasCarry = fw.id === "v2mom";
          return (
            <button key={fw.id} onClick={() => onFw(fw)} style={{
              background: "#FFFFFF", border: "1px solid #E0E4EA", borderRadius: 12,
              padding: isMob ? "16px 18px" : "18px 20px",
              cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: 8, transition: "all 0.18s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#1B4F72"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(27,79,114,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#E0E4EA"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 22 }}>{fw.icon}</span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {hasCarry && <span style={{ fontSize: 10, fontWeight: 700, color: "#E67E22", background: "#FEF3E2", padding: "3px 7px", borderRadius: 4 }}>3 carry-forward</span>}
                  <span style={{ fontSize: 10, fontWeight: 650, color: fw.status === "in_progress" ? "#E67E22" : "#99A5B3", background: fw.status === "in_progress" ? "#FEF3E2" : "#F3F5F8", padding: "3px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 0.4 }}>
                    {fw.status === "in_progress" ? "In Progress" : "Not Started"}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 650, color: "#1A2332" }}>{fw.name}</div>
              <div style={{ fontSize: 13, color: "#6B7D8F", lineHeight: 1.5 }}>{fw.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Gate Preview — desktop only */}
      {!isMob && (
        <div style={{ marginTop: 32 }}>
          {/* Divider separating frameworks from gate section */}
          <div style={{ height: 1, background: "#E0E4EA", marginBottom: 24 }} />

          {/* Outer box wrapping entire gate preview */}
          <div style={{ padding: "24px 28px", borderRadius: 12, background: "#FFFFFF", border: "1px solid #E0E4EA" }}>

            {/* Summary Before Decision header */}
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1A2332", marginBottom: 16 }}>Summary Before Decision</div>

            {/* Score boxes */}
            <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
              {[
                { label: "Readiness Criteria", value: "0/7" },
                { label: "Forces Assessment", value: "0" },
                { label: "Strategy Stress Tests", value: "0/0" },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, padding: "14px 16px", borderRadius: 10, background: "#F5F7FA", border: "1px solid #E0E4EA" }}>
                  <div style={{ fontSize: 11, fontWeight: 650, color: "#1A2332", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#99A5B3" }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Readiness Criteria Checklist */}
            <div style={{ padding: "18px 20px", borderRadius: 10, background: "#F5F7FA", border: "1px solid #E0E4EA", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 18 }}>🚦</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#1A2332" }}>Readiness Criteria</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#99A5B3" }}>0/7 pass</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 28px" }}>
                {[
                  "Strategy articulated in 1-2 paragraphs",
                  "One North Star Metric selected with rationale",
                  "3-5 input metrics identified",
                  "Explicit tradeoffs documented",
                  "At least one thing NOT optimizing for",
                  "OKRs defined with measurable key results",
                  "DACI established for key decisions",
                ].map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0" }}>
                    <span style={{ fontSize: 16, color: "#D5DCE4", flexShrink: 0, marginTop: 1 }}>☐</span>
                    <span style={{ fontSize: 14, color: "#3D5066", lineHeight: 1.45 }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider before GO/PIVOT/KILL */}
            <div style={{ height: 1, background: "#E0E4EA", marginBottom: 20 }} />

            {/* GO / PIVOT / KILL — centered, wider buttons */}
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 18 }}>
              {[
                { label: "GO", desc: "Strategy Is Sound.\nProceed To Stage 2.", border: "#27AE60", bg: "#F0FFF4", color: "#27AE60" },
                { label: "PIVOT", desc: "Strategy Needs Revision.\nRework Key Elements.", border: "#E67E22", bg: "#FEF9F0", color: "#E67E22" },
                { label: "KILL", desc: "Strategy Is Not Viable.\nReturn To Stage 0.", border: "#E74C3C", bg: "#FFF5F5", color: "#E74C3C" },
              ].map(g => (
                <div key={g.label} style={{
                  width: 180, padding: "16px 18px", borderRadius: 10,
                  border: `1.5px solid ${g.border}`, background: g.bg,
                  textAlign: "center", cursor: "pointer",
                }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: g.color, marginBottom: 8 }}>{g.label}</div>
                  <div style={{ fontSize: 12, color: "#3D5066", lineHeight: 1.5, whiteSpace: "pre-line" }}>{g.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 14, color: "#1A2332", fontStyle: "italic", textAlign: "center" }}>
              Gates advise. They don't block. You decide.
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid #E0E4EA", textAlign: "center" }}>
        <span style={{ fontSize: 12, color: "#99A5B3" }}>© 2026 Arthur · Mission Control System</span>
      </div>
    </div>
  );
}

// ── Framework Detail ──
function FwDetail({ fw, onBack }) {
  const [data, setData] = useState({});
  const [cfApplied, setCfApplied] = useState({});
  const hasCarry = fw.id === "v2mom";

  return (
    <div style={{ maxWidth: 720 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#5A6B7D", fontWeight: 500, padding: 0, marginBottom: 16 }}>← Back to Stage 1</button>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: 30 }}>{fw.icon}</span>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1A2332", margin: 0 }}>{fw.name}</h2>
          <p style={{ fontSize: 13, color: "#6B7D8F", margin: "4px 0 0" }}>{fw.desc}</p>
        </div>
      </div>
      {hasCarry && (
        <div style={{ padding: "16px 18px", borderRadius: 10, marginBottom: 24, background: "#FEF9F0", border: "1px solid #F5DEB3" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#B8860B", marginBottom: 10 }}>📦 Carry-Forward from Stage 0 ({CARRY_FORWARD.length} items)</div>
          {CARRY_FORWARD.map((cf, i) => (
            <div key={i} style={{ padding: "10px 14px", borderRadius: 8, background: cfApplied[i] ? "#F0FFF4" : "#FFFFFF", border: cfApplied[i] ? "1px solid #A3D9A5" : "1px solid #E8E0D0", marginBottom: 8, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 200px" }}>
                <div style={{ fontSize: 11, fontWeight: 650, color: "#99A5B3", textTransform: "uppercase", marginBottom: 2 }}>{cf.label}</div>
                <div style={{ fontSize: 13, color: "#1A2332", lineHeight: 1.45 }}>{cf.value}</div>
                <div style={{ fontSize: 11, color: "#B8860B", marginTop: 3 }}>From {cf.from}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setCfApplied({ ...cfApplied, [i]: true })} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: cfApplied[i] ? "#27AE60" : "#1B4F72", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{cfApplied[i] ? "✓ Applied" : "Apply"}</button>
                {!cfApplied[i] && <button style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #D5DCE4", background: "#fff", color: "#99A5B3", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Skip</button>}
              </div>
            </div>
          ))}
        </div>
      )}
      {fw.fields.map(f => (
        <div key={f.k} style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#3D5066", marginBottom: 6 }}>{f.l}</label>
          <textarea value={data[f.k] || ""} onChange={e => setData({ ...data, [f.k]: e.target.value })} placeholder={f.p} rows={3} style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #D5DCE4", fontSize: 14, color: "#1A2332", fontFamily: "inherit", resize: "vertical", lineHeight: 1.55, background: "#FAFBFC", boxSizing: "border-box", outline: "none" }}
            onFocus={e => { e.target.style.borderColor = "#1B4F72"; e.target.style.boxShadow = "0 0 0 2px rgba(27,79,114,0.12)"; }}
            onBlur={e => { e.target.style.borderColor = "#D5DCE4"; e.target.style.boxShadow = "none"; }}
          />
        </div>
      ))}
      <div style={{ display: "flex", gap: 10, marginTop: 28, paddingBottom: 40 }}>
        {[{ label: "💾 Save", bg: "#1B4F72", color: "#fff", border: "none" }, { label: "📤 Export", bg: "#fff", color: "#3D5066", border: "1px solid #D5DCE4" }, { label: "🗑 Clear", bg: "#fff", color: "#99A5B3", border: "1px solid #D5DCE4" }].map(b => (
          <button key={b.label} style={{ padding: "10px 22px", borderRadius: 8, border: b.border, background: b.bg, color: b.color, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{b.label}</button>
        ))}
      </div>
    </div>
  );
}

function PlaceholderPage({ icon, title, desc }) {
  return (
    <div>
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", padding: "60px 20px" }}>
        <span style={{ fontSize: 52, display: "block", marginBottom: 16 }}>{icon}</span>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1A2332", margin: "0 0 8px" }}>{title}</h2>
        <p style={{ fontSize: 14, color: "#6B7D8F", lineHeight: 1.6 }}>{desc}</p>
      </div>
      <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid #E0E4EA", textAlign: "center" }}>
        <span style={{ fontSize: 12, color: "#99A5B3" }}>© 2026 Arthur · Mission Control System</span>
      </div>
    </div>
  );
}

// ── Main ──
export default function ArthurProTier() {
  const [sOpen, setSOpen] = useState(false);
  const [view, setView] = useState("s1");
  const [fw, setFw] = useState(null);
  const [mob, setMob] = useState(false);
  const [mission, setMission] = useState("ridex");
  const [mDropOpen, setMDropOpen] = useState(false);

  useEffect(() => {
    const c = () => setMob(window.innerWidth < 1024);
    c(); window.addEventListener("resize", c);
    return () => window.removeEventListener("resize", c);
  }, []);

  const nav = v => { setView(v); setFw(null); setMDropOpen(false); if (mob) setSOpen(false); };

  let content;
  if (fw) content = <FwDetail fw={fw} onBack={() => setFw(null)} />;
  else if (view === "s1") content = <Stage1Landing onFw={setFw} activeMission={mission} />;
  else if (view === "sr") content = <PlaceholderPage icon="🎖️" title="Situation Room" desc="Walk in with a problem. Get routed to the right frameworks and stages." />;
  else if (view === "ar") content = <PlaceholderPage icon="📡" title="Ambient Radar" desc="Passive market surveillance. Scans for competitor launches, funding rounds, regulatory shifts." />;
  else if (view === "vt") content = <PlaceholderPage icon="⚡" title="Validation Telemetry" desc="Evidence strength scoring. How strong is your data? How many criteria have you met?" />;
  else { const st = STAGES.find(s => view === `s${s.n}`); content = st ? <PlaceholderPage icon={st.icon} title={`Stage ${st.n} — ${st.name}`} desc={`Full ${st.name} workspace with input panel, frameworks, research engine, and decision gate.`} /> : null; }

  return (
    <div style={{ background: "#F5F7FA", minHeight: "100vh", fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Sidebar open={sOpen} onClose={() => setSOpen(false)} view={view} onNav={nav} isMobile={mob} mission={mission} setMission={setMission} mDropOpen={mDropOpen} setMDropOpen={setMDropOpen} />
      <div style={{ marginLeft: mob ? 0 : 280, minHeight: "100vh" }}>
        {mob && (
          <div style={{ padding: "12px 16px", background: "#FFFFFF", borderBottom: "1px solid #E0E4EA", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 50 }}>
            <button onClick={() => setSOpen(true)} style={{ background: "none", border: "none", fontSize: 22, color: "#3D5066", cursor: "pointer", padding: 0 }}>☰</button>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#1A2332" }}>Arthur MCS</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#E67E22", background: "#FEF3E2", padding: "3px 8px", borderRadius: 4 }}>Pro</span>
          </div>
        )}
        <div style={{ padding: mob ? "24px 16px" : "32px 44px", maxWidth: 1600 }}>{content}</div>
      </div>
    </div>
  );
}
