import { useState, useEffect } from "react";

/* ═══════════════════════════════════════════════
   ARTHUR MCS — FREE TIER DEMO
   Stage 0 default. Single mission. No Product label.
   No Intelligence section. Light mode.
   Sidebar: solid #FFFFFF, border #E0E4EA, 280px desktop.
   Mobile: closed default, full-screen overlay.
   ═══════════════════════════════════════════════ */

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

const FRAMEWORKS = [
  { id: "swot", name: "SWOT Analysis", icon: "⚖️", desc: "Strengths, weaknesses, opportunities, threats",
    fields: [
      { k: "strengths", l: "Strengths", p: "What advantages does your idea have?" },
      { k: "weaknesses", l: "Weaknesses", p: "What limitations or gaps exist?" },
      { k: "opportunities", l: "Opportunities", p: "What external factors could help?" },
      { k: "threats", l: "Threats", p: "What external risks could hurt?" },
    ]},
  { id: "tam", name: "TAM / SAM / SOM", icon: "📊", desc: "Total addressable market sizing",
    fields: [
      { k: "tam", l: "Total Addressable Market (TAM)", p: "Total market value if 100% share" },
      { k: "sam", l: "Serviceable Addressable Market (SAM)", p: "Segment you can reach" },
      { k: "som", l: "Serviceable Obtainable Market (SOM)", p: "Realistic near-term capture" },
    ]},
  { id: "competitive", name: "Competitive Matrix", icon: "🏁", desc: "Landscape mapping and positioning",
    fields: [
      { k: "competitors", l: "Key Competitors", p: "List direct and indirect competitors" },
      { k: "differentiators", l: "Your Differentiators", p: "What makes you different?" },
      { k: "positioning", l: "Positioning Statement", p: "For [target], [product] is the [category] that [benefit]" },
    ]},
  { id: "value_prop", name: "Value Proposition", icon: "💎", desc: "JTBD value proposition canvas",
    fields: [
      { k: "who", l: "Who (Target User)", p: "Specific user segment" },
      { k: "why", l: "Why (Motivation)", p: "Core job-to-be-done" },
      { k: "how", l: "Your Solution", p: "Your approach" },
      { k: "outcome", l: "Desired Outcome", p: "The better world" },
    ]},
  { id: "strategy_canvas", name: "Strategy Canvas", icon: "🗺️", desc: "Blue ocean value curve analysis",
    fields: [
      { k: "factors", l: "Competing Factors", p: "Price, speed, features, support..." },
      { k: "eliminate", l: "Eliminate", p: "Factors the industry competes on that you will drop" },
      { k: "create", l: "Create", p: "Factors the industry has never offered" },
    ]},
  { id: "mom_test", name: "Mom Test Synthesizer", icon: "🎤", desc: "Customer interview evidence scoring",
    fields: [
      { k: "interviews", l: "Interview Notes", p: "Key quotes and observations" },
      { k: "patterns", l: "Patterns Observed", p: "Recurring themes across conversations" },
      { k: "evidence_for", l: "Evidence For", p: "What supports your hypothesis?" },
      { k: "evidence_against", l: "Evidence Against", p: "What contradicts it?" },
    ]},
  { id: "assumption", name: "Assumption Tracker", icon: "🔍", desc: "Risk-ranked assumption validation",
    fields: [
      { k: "critical", l: "Critical Assumptions", p: "Must be true for this to work" },
      { k: "testable", l: "Most Testable First", p: "Easiest to validate or invalidate" },
      { k: "next_test", l: "Next Validation Step", p: "How to test the riskiest assumption" },
    ]},
];

// ── Sidebar ──
function Sidebar({ open, onClose, view, onNav, isMobile }) {
  const sBase = {
    position: "fixed", top: 0, left: 0, height: "100%",
    background: "#FFFFFF", borderRight: "1px solid #E0E4EA",
    display: "flex", flexDirection: "column", zIndex: 200,
    transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
  };
  const sDesktop = { ...sBase, width: 280, transform: "translateX(0)" };
  const sMobile = {
    ...sBase, width: "100%",
    transform: open ? "translateX(0)" : "translateX(-100%)",
  };

  return (
    <>
      {open && isMobile && (
        <div onClick={onClose} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 150,
        }} />
      )}
      <nav style={isMobile ? sMobile : sDesktop}>
        {/* Close btn mobile */}
        {isMobile && (
          <button onClick={onClose} style={{
            position: "absolute", top: 16, right: 16, background: "none",
            border: "none", fontSize: 24, color: "#6B7D8F", cursor: "pointer", zIndex: 10,
          }}>✕</button>
        )}

        {/* Logo */}
        <div style={{ padding: "20px 20px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: "linear-gradient(135deg, #1B4F72 0%, #2980B9 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 16, fontWeight: 800,
          }}>A</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1A2332", letterSpacing: -0.3 }}>Arthur MCS</div>
            <div style={{ fontSize: 12, color: "#8896A6", fontWeight: 500 }}>Free Plan</div>
          </div>
        </div>

        {/* No Product label for Free tier */}

        {/* Single Mission (not a dropdown) */}
        <div style={{ padding: "0 14px", marginBottom: 6 }}>
          <div style={{
            padding: "10px 12px", borderRadius: 8, background: "#F3F5F8",
            fontSize: 13, fontWeight: 600, color: "#3D5066",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 16 }}>🚀</span>
            My First Idea
          </div>
        </div>

        {/* Situation Room — top of nav, separated */}
        <div style={{ padding: "6px 14px 2px" }}>
          <button onClick={() => onNav("sr")} style={{
            width: "100%", padding: "9px 12px", borderRadius: 8, border: "none",
            background: view === "sr" ? "#EAF2FB" : "transparent",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 9,
            fontSize: 14, fontWeight: 600,
            color: view === "sr" ? "#1B4F72" : "#4A5E73",
          }}>
            <span style={{ fontSize: 17 }}>🎖️</span>
            Situation Room
          </button>
        </div>

        <div style={{ height: 1, background: "#E0E4EA", margin: "8px 18px 6px" }} />

        {/* Stages */}
        <div style={{ padding: "2px 14px", flex: 1, overflowY: "auto" }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: "#99A5B3", letterSpacing: 1.2,
            textTransform: "uppercase", padding: "4px 12px 8px",
          }}>Stages</div>

          {STAGES.map(s => {
            const ok = s.n === 0;
            const act = view === `s${s.n}`;
            return (
              <button key={s.n} onClick={() => ok && onNav(`s${s.n}`)} style={{
                width: "100%", padding: "9px 12px", borderRadius: 8, border: "none",
                background: act ? "#EAF2FB" : "transparent",
                cursor: ok ? "pointer" : "default",
                display: "flex", alignItems: "center", gap: 10,
                fontSize: 14, fontWeight: act ? 650 : 500,
                color: ok ? (act ? "#1B4F72" : "#3D5066") : "#B8C3CF",
                opacity: ok ? 1 : 0.7, marginBottom: 1,
              }}>
                <span style={{ fontSize: 17, width: 24, textAlign: "center" }}>{s.icon}</span>
                <span style={{ flex: 1, textAlign: "left" }}>{s.name}</span>
                {!ok && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: "#E67E22",
                    background: "#FEF3E2", padding: "2px 7px", borderRadius: 4,
                  }}>PRO</span>
                )}
              </button>
            );
          })}
        </div>

        {/* No Intelligence section for Free tier */}

        {/* Profile */}
        <div style={{ borderTop: "1px solid #E0E4EA", padding: "14px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "linear-gradient(135deg, #1ABC9C, #16A085)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 14, fontWeight: 700,
            }}>D</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1A2332" }}>David</div>
              <div style={{ fontSize: 12, color: "#8896A6" }}>Free Plan</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["Settings", "Get Help", "Log Out"].map(t => (
              <button key={t} style={{
                flex: 1, padding: "7px 0", borderRadius: 6,
                border: "1px solid #E0E4EA", background: "#fff",
                fontSize: 11, fontWeight: 600, color: "#5A6B7D", cursor: "pointer",
              }}>{t}</button>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}

// ── Stage 0 Landing ──
function Stage0Landing({ onFw }) {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#E74C3C", display: "inline-block" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#99A5B3", letterSpacing: 0.8, textTransform: "uppercase" }}>Stage 0</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 750, color: "#1A2332", margin: 0, letterSpacing: -0.5 }}>Problem Validator</h1>
        <p style={{ fontSize: 14, color: "#6B7D8F", margin: "6px 0 0", lineHeight: 1.55 }}>
          Validate that the problem is real, painful, and worth solving before investing in strategy.
        </p>
      </div>

      {/* Stat Boxes */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        {[
          { l: "Artifacts Touched", v: "0 / 7" },
          { l: "Readiness Criteria", v: "0 / 7" },
          { l: "Gate Status", v: "Pending", c: "#E67E22" },
          { l: "Decision", v: "—", c: "#99A5B3" },
        ].map(b => (
          <div key={b.l} style={{
            flex: "1 1 150px", padding: "16px 18px", borderRadius: 10,
            background: "#FFFFFF", border: "1px solid #E0E4EA",
          }}>
            <div style={{ fontSize: 11, fontWeight: 650, color: "#99A5B3", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>{b.l}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: b.c || "#1A2332" }}>{b.v}</div>
          </div>
        ))}
      </div>

      {/* Recommended Next */}
      <div style={{
        padding: "14px 18px", borderRadius: 10,
        background: "#EAF2FB", border: "1px solid #C5DAF0",
        marginBottom: 24, display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 18 }}>💡</span>
        <span style={{ fontSize: 14 }}>
          <strong style={{ color: "#1B4F72" }}>Recommended Next:</strong>{" "}
          <span style={{ color: "#2C6F9B" }}>Start with SWOT Analysis to map your competitive landscape.</span>
        </span>
      </div>

      {/* Flow Hint Pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["Input", "Frameworks", "Research", "Gate"].map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: i === 0 ? "#1B4F72" : "#99A5B3",
              background: i === 0 ? "#EAF2FB" : "#F3F5F8",
              padding: "5px 12px", borderRadius: 6,
            }}>{s}</span>
            {i < 3 && <span style={{ color: "#C5D0DB", fontSize: 13 }}>→</span>}
          </div>
        ))}
      </div>

      {/* Framework Cards */}
      <div style={{ fontSize: 14, fontWeight: 700, color: "#3D5066", marginBottom: 12 }}>
        Frameworks ({FRAMEWORKS.length})
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 14,
      }}>
        {FRAMEWORKS.map(fw => (
          <button key={fw.id} onClick={() => onFw(fw)} style={{
            background: "#FFFFFF", border: "1px solid #E0E4EA",
            borderRadius: 12, padding: "18px 20px", cursor: "pointer",
            textAlign: "left", display: "flex", flexDirection: "column", gap: 8,
            transition: "all 0.18s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#1B4F72"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(27,79,114,0.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#E0E4EA"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 22 }}>{fw.icon}</span>
              <span style={{
                fontSize: 10, fontWeight: 650, color: "#99A5B3",
                background: "#F3F5F8", padding: "3px 8px", borderRadius: 4,
                textTransform: "uppercase", letterSpacing: 0.4,
              }}>Not Started</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 650, color: "#1A2332" }}>{fw.name}</div>
            <div style={{ fontSize: 13, color: "#6B7D8F", lineHeight: 1.5 }}>{fw.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Framework Detail (Clean Form) ──
function FwDetail({ fw, onBack }) {
  const [data, setData] = useState({});
  return (
    <div style={{ maxWidth: 720 }}>
      <button onClick={onBack} style={{
        background: "none", border: "none", cursor: "pointer",
        fontSize: 14, color: "#5A6B7D", fontWeight: 500, padding: 0, marginBottom: 16,
      }}>← Back to Stage 0</button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <span style={{ fontSize: 30 }}>{fw.icon}</span>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1A2332", margin: 0 }}>{fw.name}</h2>
          <p style={{ fontSize: 13, color: "#6B7D8F", margin: "4px 0 0" }}>{fw.desc}</p>
        </div>
      </div>

      {fw.fields.map(f => (
        <div key={f.k} style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#3D5066", marginBottom: 6 }}>{f.l}</label>
          <textarea
            value={data[f.k] || ""}
            onChange={e => setData({ ...data, [f.k]: e.target.value })}
            placeholder={f.p}
            rows={3}
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 8,
              border: "1px solid #D5DCE4", fontSize: 14, color: "#1A2332",
              fontFamily: "inherit", resize: "vertical", lineHeight: 1.55,
              background: "#FAFBFC", boxSizing: "border-box",
              outline: "none",
            }}
            onFocus={e => { e.target.style.borderColor = "#1B4F72"; e.target.style.boxShadow = "0 0 0 2px rgba(27,79,114,0.12)"; }}
            onBlur={e => { e.target.style.borderColor = "#D5DCE4"; e.target.style.boxShadow = "none"; }}
          />
        </div>
      ))}

      <div style={{ display: "flex", gap: 10, marginTop: 28, paddingBottom: 40 }}>
        {[
          { label: "💾 Save", bg: "#1B4F72", color: "#fff", border: "none" },
          { label: "📤 Export", bg: "#fff", color: "#3D5066", border: "1px solid #D5DCE4" },
          { label: "🗑 Clear", bg: "#fff", color: "#99A5B3", border: "1px solid #D5DCE4" },
        ].map(b => (
          <button key={b.label} style={{
            padding: "10px 22px", borderRadius: 8, border: b.border,
            background: b.bg, color: b.color, fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>{b.label}</button>
        ))}
      </div>
    </div>
  );
}

// ── Situation Room ──
function SituationRoom() {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", padding: "60px 20px" }}>
      <span style={{ fontSize: 52, display: "block", marginBottom: 16 }}>🎖️</span>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1A2332", margin: "0 0 8px" }}>Situation Room</h2>
      <p style={{ fontSize: 14, color: "#6B7D8F", lineHeight: 1.6, marginBottom: 24 }}>
        Walk in with a problem. Get routed to the right frameworks and stages.
      </p>
      <div style={{
        background: "#F3F5F8", border: "1px solid #E0E4EA", borderRadius: 10,
        padding: "16px 20px", fontSize: 14, color: "#99A5B3", fontStyle: "italic",
      }}>
        Your Situation → Critical Questions → Frameworks → Path
      </div>
    </div>
  );
}

// ── Main App ──
export default function ArthurFreeTier() {
  const [sOpen, setSOpen] = useState(false);
  const [view, setView] = useState("s0");
  const [fw, setFw] = useState(null);
  const [mob, setMob] = useState(false);

  useEffect(() => {
    const c = () => setMob(window.innerWidth < 768);
    c(); window.addEventListener("resize", c);
    return () => window.removeEventListener("resize", c);
  }, []);

  const nav = v => { setView(v); setFw(null); if (mob) setSOpen(false); };

  let content;
  if (fw) content = <FwDetail fw={fw} onBack={() => setFw(null)} />;
  else if (view === "sr") content = <SituationRoom />;
  else content = <Stage0Landing onFw={setFw} />;

  return (
    <div style={{ background: "#F5F7FA", minHeight: "100vh", fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Sidebar open={sOpen} onClose={() => setSOpen(false)} view={view} onNav={nav} isMobile={mob} />

      <div style={{ marginLeft: mob ? 0 : 280, minHeight: "100vh" }}>
        {/* Mobile top bar */}
        {mob && (
          <div style={{
            padding: "12px 16px", background: "#FFFFFF",
            borderBottom: "1px solid #E0E4EA",
            display: "flex", alignItems: "center", gap: 12,
            position: "sticky", top: 0, zIndex: 50,
          }}>
            <button onClick={() => setSOpen(true)} style={{
              background: "none", border: "none", fontSize: 22, color: "#3D5066", cursor: "pointer", padding: 0,
            }}>☰</button>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#1A2332" }}>Arthur MCS</span>
            <span style={{
              fontSize: 11, fontWeight: 600, color: "#99A5B3",
              background: "#F3F5F8", padding: "3px 8px", borderRadius: 4,
            }}>Free</span>
          </div>
        )}

        <div style={{ padding: mob ? "24px 16px" : "32px 44px", maxWidth: 1600 }}>
          {content}
        </div>
      </div>
    </div>
  );
}
