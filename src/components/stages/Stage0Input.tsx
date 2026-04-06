// Stage0Input.tsx — Ported from Level 1 Stage0InputPanel.jsx
'use client';
import { useState, useCallback, useEffect, useRef } from "react";

const STORAGE_KEY = "dk-stage0-session";
const SOLUTION_FLAGS = ["build","create","platform","app","tool","develop","launch","design","implement","deploy","make a","ship","integrate","automate"];

function detectSolutionLanguage(text) {
  const lower = text.toLowerCase();
  return SOLUTION_FLAGS.filter(f => lower.includes(f));
}

function useAutoSave(state) {
  const timeout = useRef(null);
  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    }, 500);
    return () => clearTimeout(timeout.current);
  }, [state]);
}

function loadSavedSession() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 600);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

// ─── Components ───
function ScoreSlider({ label, value, onChange, description }) {
  const colors = ["#E74C3C","#E67E22","#F1C40F","#2ECC71","#1B9C85"];
  const labels = ["Weak","Below Avg","Average","Strong","Exceptional"];
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4, flexWrap: "wrap", gap: 4 }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "#2C3E50" }}>{label}</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600, color: colors[value - 1], background: colors[value - 1] + "18", padding: "3px 10px", borderRadius: 4 }}>{value}/5 — {labels[value - 1]}</span>
      </div>
      <p style={{ fontSize: 12, color: "#7F8C8D", margin: "0 0 8px 0", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>{description}</p>
      <input type="range" min={1} max={5} value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: colors[value - 1], cursor: "pointer", height: 24 }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#95A5A6", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
        {labels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </div>
  );
}

function TagInput({ items, setItems, placeholder, placeholderShort, minRequired = 0 }) {
  const [draft, setDraft] = useState("");
  const mobile = useIsMobile();
  const add = () => {
    const v = draft.trim();
    if (v && !items.includes(v)) { setItems([...items, v]); setDraft(""); }
  };
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input value={draft} onChange={e => setDraft(e.target.value)} placeholder={mobile && placeholderShort ? placeholderShort : placeholder}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
          style={{ flex: 1, padding: "12px 14px", border: "1px solid #D5D8DC", borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", background: "#FAFBFC", minWidth: 0 }} />
        <button onClick={add} style={{ padding: "12px 20px", background: "#1B4F72", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", minHeight: 44 }}>Add</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.map((item, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "#EBF5FB", borderRadius: 20, fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#1B4F72" }}>
            {item}
            <span onClick={() => setItems(items.filter((_, j) => j !== i))}
              style={{ cursor: "pointer", fontWeight: 700, color: "#C0392B", fontSize: 16, lineHeight: 1, minWidth: 24, minHeight: 24, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "rgba(192,57,43,0.08)" }}>×</span>
          </span>
        ))}
      </div>
      {minRequired > 0 && items.length < minRequired && (
        <p style={{ fontSize: 12, color: "#E74C3C", marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>At least {minRequired} required</p>
      )}
    </div>
  );
}

function CompetitorRow({ comp, onChange, onRemove, index }) {
  return (
    <div style={{ background: "#F8F9FA", borderRadius: 10, padding: 16, marginBottom: 10, border: "1px solid #E8EAED" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>Competitor {index + 1}</span>
        <button onClick={onRemove} style={{ padding: "8px 14px", background: "none", border: "1px solid #E8EAED", borderRadius: 6, fontSize: 12, color: "#C0392B", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", minHeight: 36 }}>Remove</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input value={comp.name} onChange={e => onChange({ ...comp, name: e.target.value })} placeholder="Competitor name"
          style={{ padding: "12px 14px", border: "1px solid #D5D8DC", borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#fff", outline: "none" }} />
        <select value={comp.type} onChange={e => onChange({ ...comp, type: e.target.value })}
          style={{ padding: "12px 10px", border: "1px solid #D5D8DC", borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans', sans-serif", background: "#fff", color: "#2C3E50", minHeight: 44 }}>
          <option value="direct">Direct competitor</option>
          <option value="indirect">Indirect alternative</option>
          <option value="non_obvious">Non-obvious substitute</option>
        </select>
        <input value={comp.url || ""} onChange={e => onChange({ ...comp, url: e.target.value || null })} placeholder="URL (optional)"
          style={{ padding: "12px 14px", border: "1px solid #D5D8DC", borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#fff", outline: "none" }} />
      </div>
    </div>
  );
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: 72, left: "50%", transform: "translateX(-50%)",
      padding: "12px 24px", background: "#1B9C85", color: "#fff",
      borderRadius: 10, fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
      boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000, whiteSpace: "nowrap",
    }}>
      {message}
    </div>
  );
}

// ─── Section Nav with scroll indicator ───
function SectionNav({ sections, activeSection, setActiveSection }) {
  const scrollRef = useRef(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScroll({
      left: el.scrollLeft > 4,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 4,
    });
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  return (
    <div style={{ position: "relative", marginBottom: 24 }}>
      {canScroll.left && (
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 32, background: "linear-gradient(90deg, #fff, transparent)", zIndex: 2, pointerEvents: "none", borderRadius: "8px 0 0 8px" }} />
      )}
      {canScroll.right && (
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 32, background: "linear-gradient(270deg, #fff, transparent)", zIndex: 2, pointerEvents: "none", borderRadius: "0 8px 8px 0" }} />
      )}
      <div ref={scrollRef} onScroll={checkScroll}
        style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
        {sections.map((s, i) => (
          <button key={i} onClick={() => setActiveSection(i)} style={{
            padding: "10px 16px", borderRadius: 22, fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            cursor: "pointer", border: "none", transition: "all 0.2s", whiteSpace: "nowrap", minHeight: 44,
            background: activeSection === i ? s.color : s.complete ? "#D5F5E3" : "#F2F3F4",
            color: activeSection === i ? "#fff" : s.complete ? "#1B9C85" : "#7F8C8D",
            boxShadow: activeSection === i ? `0 2px 8px ${s.color}40` : "none",
          }}>
            {s.icon} {s.title} {s.complete && activeSection !== i ? "✓" : ""}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main ───
const DEFAULT_STATE = {
  hypothesis: "", segment: "",
  jtbd: { situation: "", motivation: "", outcome: "" },
  competitors: [{ name: "", type: "direct", url: null }],
  keywords: [], notSolving: [],
  capability: { unique_insight: 3, build_capability: 3, strategic_fit: 3 },
  transcripts: "", assumptions: [],
};

export default function Stage0Input() {
  const saved = loadSavedSession();
  const init = saved || DEFAULT_STATE;
  const mobile = useIsMobile();

  const [hypothesis, setHypothesis] = useState(init.hypothesis);
  const [segment, setSegment] = useState(init.segment);
  const [jtbd, setJtbd] = useState(init.jtbd);
  const [competitors, setCompetitors] = useState(init.competitors);
  const [keywords, setKeywords] = useState(init.keywords);
  const [notSolving, setNotSolving] = useState(init.notSolving);
  const [companyContext, setCompanyContext] = useState(init.companyContext || "");
  const [capability, setCapability] = useState(init.capability);
  const [transcripts, setTranscripts] = useState(init.transcripts);
  const [assumptions, setAssumptions] = useState(init.assumptions);
  const [exported, setExported] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [toast, setToast] = useState(null);
  const [showClear, setShowClear] = useState(false);
  const fileRef = useRef(null);

  const currentState = { hypothesis, segment, jtbd, competitors, keywords, notSolving, capability, transcripts, assumptions };
  useAutoSave(currentState);

  const solutionFlags = detectSolutionLanguage(hypothesis);
  const hypothesisValid = hypothesis.trim().length > 10 && solutionFlags.length === 0;

  const sections = [
    { title: "Problem", icon: "◉", color: "#E74C3C", complete: hypothesisValid && segment.trim().length > 0 },
    { title: "JTBD", icon: "◈", color: "#E67E22", complete: !!(jtbd.situation && jtbd.motivation && jtbd.outcome) },
    { title: "Landscape", icon: "◇", color: "#F1C40F", complete: competitors.some(c => c.name.trim()) && keywords.length > 0 },
    { title: "Boundaries", icon: "◆", color: "#2ECC71", complete: notSolving.length >= 1 },
    { title: "Team", icon: "◎", color: "#3498DB", complete: true },
    { title: "Evidence", icon: "◐", color: "#2980B9", complete: true },
    { title: "Assumptions", icon: "◑", color: "#8E44AD", complete: assumptions.length >= 1 },
  ];

  const allRequired = sections[0].complete && sections[1].complete && sections[2].complete && sections[3].complete && sections[6].complete;

  const generatePayload = useCallback(() => {
    const payload = {
      stage: 0, mission_type: "full",
      inputs: {
        problem_hypothesis: hypothesis.trim(), target_segment: segment.trim(),
        jtbd: { situation: jtbd.situation.trim(), motivation: jtbd.motivation.trim(), outcome: jtbd.outcome.trim() },
        competitors: competitors.filter(c => c.name.trim()).map(c => ({ name: c.name.trim(), type: c.type, url: c.url?.trim() || null })),
        keywords, not_solving: notSolving, company_context: companyContext, team_capability: capability,
        assumptions_to_invalidate: assumptions, transcripts: transcripts.trim() || null,
      }
    };
    setExported(JSON.stringify(payload, null, 2));
    setToast("Data exported");
  }, [hypothesis, segment, jtbd, competitors, keywords, notSolving, capability, assumptions, transcripts]);

  const saveSession = () => {
    const blob = new Blob([JSON.stringify(currentState, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `stage0-session-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    setToast("Session saved to file");
  };

  const loadSession = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.hypothesis !== undefined) {
          setHypothesis(data.hypothesis || ""); setSegment(data.segment || "");
          setJtbd(data.jtbd || DEFAULT_STATE.jtbd);
          setCompetitors(data.competitors || DEFAULT_STATE.competitors);
          setKeywords(data.keywords || []); setNotSolving(data.notSolving || []);
          setCapability(data.capability || DEFAULT_STATE.capability);
          setTranscripts(data.transcripts || ""); setAssumptions(data.assumptions || []);
          setToast("Session loaded successfully");
        } else { setToast("Invalid session file"); }
      } catch { setToast("Error reading file"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const clearSession = () => {
    setHypothesis(""); setSegment(""); setJtbd(DEFAULT_STATE.jtbd);
    setCompetitors(DEFAULT_STATE.competitors); setKeywords([]); setNotSolving([]);
    setCapability(DEFAULT_STATE.capability); setTranscripts(""); setAssumptions([]);
    setExported(null); setActiveSection(0); setShowClear(false);
    window.localStorage.removeItem(STORAGE_KEY);
    setToast("Session cleared");
  };

  const fieldLabel = (text, required) => (
    <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#2C3E50", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>
      {text} {required && <span style={{ color: "#E74C3C", fontSize: 11 }}>REQUIRED</span>}
    </label>
  );

  const textArea = (value, onChange, placeholder, rows = 3) => (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width: "100%", padding: "12px 14px", border: "1px solid #D5D8DC", borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', sans-serif", resize: "vertical", outline: "none", background: "#FAFBFC", lineHeight: 1.5, boxSizing: "border-box", minHeight: 44 }} />
  );

  const btnStyle = (bg) => ({
    padding: mobile ? "10px 14px" : "8px 14px", background: bg, color: bg === "none" ? "#C0392B" : "#fff",
    border: bg === "none" ? "1px solid #E8EAED" : "none", borderRadius: 8, fontSize: 12, fontWeight: 600,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif", minHeight: 44, display: "flex", alignItems: "center", gap: 6,
  });

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: mobile ? "16px 14px" : "32px 20px", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      {/* Back to Cockpit */}
      <a onClick={() => window.location.href = "/stage/0"} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#2980B9", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, marginBottom: 16, textDecoration: "none", minHeight: 44 }}>
        ← Back To Stage 0
      </a>

      {/* Header */}
      <div style={{ marginBottom: 20, borderBottom: "3px solid #1B4F72", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#1B9C85", fontWeight: 500, letterSpacing: "0.15em", marginBottom: 4, textTransform: "uppercase" }}>Product Development Agentic OS · Stage 0</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
          <h1 style={{ fontSize: mobile ? 22 : 28, fontFamily: "'Playfair Display', serif", fontWeight: 800, color: "#1B4F72", margin: 0, lineHeight: 1.2 }}>Problem Validator</h1>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={saveSession} style={btnStyle("#1B4F72")}>💾 Save</button>
            <button onClick={() => fileRef.current?.click()} style={btnStyle("#2980B9")}>📂 Load</button>
            <button onClick={() => setShowClear(true)} style={btnStyle("none")}>🗑 Clear</button>
            <input ref={fileRef} type="file" accept=".json" onChange={loadSession} style={{ display: "none" }} />
          </div>
        </div>
        <p style={{ fontSize: 13, color: "#5D6D7E", margin: 0, lineHeight: 1.5 }}>Define the problem space before any research begins. Your work auto-saves to this browser.</p>
      </div>

      {/* Clear confirmation */}
      {showClear && (
        <div style={{ padding: "16px 18px", background: "#FDEDEC", borderRadius: 10, marginBottom: 16, border: "1px solid #F5B7B1" }}>
          <p style={{ fontSize: 14, color: "#922B21", fontWeight: 600, margin: "0 0 12px 0" }}>Clear all fields and reset session?</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={clearSession} style={{ ...btnStyle("#C0392B"), flex: mobile ? 1 : "none" }}>Yes, Clear</button>
            <button onClick={() => setShowClear(false)} style={{ padding: "10px 20px", background: "#fff", color: "#5D6D7E", border: "1px solid #D5D8DC", borderRadius: 8, fontSize: 13, cursor: "pointer", minHeight: 44, flex: mobile ? 1 : "none" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Section Nav */}
      <SectionNav sections={sections} activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Section 0: Problem */}
      {activeSection === 0 && (
        <div>
          <div style={{ background: "#FDFEFE", border: "1px solid #E8EAED", borderRadius: 12, padding: mobile ? 16 : 24, marginBottom: 16 }}>
            {fieldLabel("Problem Hypothesis", true)}
            <p style={{ fontSize: 12, color: "#7F8C8D", margin: "0 0 10px 0", lineHeight: 1.4 }}>One sentence. Describe the PROBLEM, not your solution. Who has this problem and why does it hurt?</p>
            {textArea(hypothesis, setHypothesis, mobile ? "Who has this problem and why?" : "e.g. US/Canada buyers lack a trusted channel to discover and purchase authentic Myanmar artisan products", 3)}
            {solutionFlags.length > 0 && (
              <div style={{ marginTop: 10, padding: "12px 14px", background: "#FDEDEC", borderRadius: 8, borderLeft: "4px solid #E74C3C" }}>
                <p style={{ fontSize: 13, color: "#C0392B", margin: 0, fontWeight: 600 }}>Solution language detected: "{solutionFlags.join('", "')}"</p>
                <p style={{ fontSize: 12, color: "#922B21", margin: "6px 0 0 0", lineHeight: 1.4 }}>Rewrite as a problem statement. What's broken? Who's affected? Why does it matter?</p>
              </div>
            )}
          </div>
          <div style={{ background: "#FDFEFE", border: "1px solid #E8EAED", borderRadius: 12, padding: mobile ? 16 : 24 }}>
            {fieldLabel("Target User Segment", true)}
            <p style={{ fontSize: 12, color: "#7F8C8D", margin: "0 0 10px 0", lineHeight: 1.4 }}>Be specific: who are they, where are they, what defines them as a segment?</p>
            {textArea(segment, setSegment, mobile ? "Who specifically has this problem?" : "e.g. Myanmar diaspora (25-55) in US/Canada + culturally-curious consumers", 3)}
          </div>
        </div>
      )}

      {/* Section 1: JTBD */}
      {activeSection === 1 && (
        <div style={{ background: "#FDFEFE", border: "1px solid #E8EAED", borderRadius: 12, padding: mobile ? 16 : 24 }}>
          {fieldLabel("Jobs To Be Done Hypothesis", true)}
          <p style={{ fontSize: 12, color: "#7F8C8D", margin: "0 0 16px 0", lineHeight: 1.4 }}>This is a pre-research assumption. Manus will validate or challenge it.</p>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1B4F72", fontFamily: "'DM Mono', monospace", display: "block", marginBottom: 6 }}>When</span>
            {textArea(jtbd.situation, v => setJtbd({ ...jtbd, situation: v }), "Describe the situation or trigger...", 2)}
          </div>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1B4F72", fontFamily: "'DM Mono', monospace", display: "block", marginBottom: 6 }}>I want to</span>
            {textArea(jtbd.motivation, v => setJtbd({ ...jtbd, motivation: v }), "What are they trying to accomplish...", 2)}
          </div>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1B4F72", fontFamily: "'DM Mono', monospace", display: "block", marginBottom: 6 }}>So I can</span>
            {textArea(jtbd.outcome, v => setJtbd({ ...jtbd, outcome: v }), "What outcome do they expect...", 2)}
          </div>
          <div style={{ marginTop: 16, padding: "12px 14px", background: "#EBF5FB", borderRadius: 8, borderLeft: "4px solid #2980B9" }}>
            <p style={{ fontSize: 13, color: "#1B4F72", margin: 0, fontWeight: 500, lineHeight: 1.5, wordBreak: "break-word" }}>
              "When {jtbd.situation || "..."}, I want to {jtbd.motivation || "..."}, so I can {jtbd.outcome || "..."}."
            </p>
          </div>
        </div>
      )}

      {/* Section 2: Landscape */}
      {activeSection === 2 && (
        <div>
          <div style={{ background: "#FDFEFE", border: "1px solid #E8EAED", borderRadius: 12, padding: mobile ? 16 : 24, marginBottom: 16 }}>
            {fieldLabel("Known Competitors & Alternatives", true)}
            <p style={{ fontSize: 12, color: "#7F8C8D", margin: "0 0 12px 0", lineHeight: 1.4 }}>Include direct competitors, indirect alternatives, AND non-obvious substitutes (doing nothing, workarounds, asking a friend).</p>
            {competitors.map((comp, i) => (
              <CompetitorRow key={i} comp={comp} index={i}
                onChange={updated => setCompetitors(competitors.map((c, j) => j === i ? updated : c))}
                onRemove={() => competitors.length > 1 && setCompetitors(competitors.filter((_, j) => j !== i))} />
            ))}
            {competitors.length < 5 && (
              <button onClick={() => setCompetitors([...competitors, { name: "", type: "direct", url: null }])}
                style={{ padding: "12px 16px", background: "none", border: "1px dashed #AEB6BF", borderRadius: 8, fontSize: 13, color: "#5D6D7E", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", width: "100%", minHeight: 44 }}>
                + Add Competitor ({competitors.length}/5)
              </button>
            )}
          </div>
          <div style={{ background: "#FDFEFE", border: "1px solid #E8EAED", borderRadius: 12, padding: mobile ? 16 : 24 }}>
            {fieldLabel("Industry & Market Keywords", true)}
            <p style={{ fontSize: 12, color: "#7F8C8D", margin: "0 0 10px 0", lineHeight: 1.4 }}>Tags that direct Manus's research queries.</p>
            <TagInput items={keywords} setItems={setKeywords}
              placeholder="e.g. cross-border e-commerce, Myanmar artisan, diaspora marketplace"
              placeholderShort="Add a keyword..." />
          </div>
        </div>
      )}

      {/* Section 3: Boundaries */}
      {activeSection === 3 && (
        <div style={{ background: "#FDFEFE", border: "1px solid #E8EAED", borderRadius: 12, padding: mobile ? 16 : 24 }}>
          {fieldLabel("What We Are NOT Solving", true)}
          <p style={{ fontSize: 12, color: "#7F8C8D", margin: "0 0 10px 0", lineHeight: 1.4 }}>Explicit exclusions. What's out of scope? This sharpens research and prevents scope creep.</p>
          <TagInput items={notSolving} setItems={setNotSolving}
            placeholder="e.g. B2B wholesale, non-Myanmar artisan goods"
            placeholderShort="Add exclusion..." minRequired={1} />
          <div style={{ marginTop: 16 }}>
            {fieldLabel("Company Context (Optional)")}
            <p style={{ fontSize: 12, color: "#7F8C8D", margin: "0 0 10px 0", lineHeight: 1.4 }}>Background about your company, product, market position, team size, stage. This context carries forward to every downstream stage and helps frame all analysis.</p>
            <textarea value={companyContext} onChange={e => setCompanyContext(e.target.value)} rows={4}
              placeholder={"e.g., Series B fintech startup, 45 employees, $12M ARR, competing in SMB lending. Current product is a loan origination platform. Exploring expansion into underwriting automation."}
              style={{ width: "100%", padding: "10px 12px", background: "#F8F9FA", border: "1px solid #D5D8DC", borderRadius: 8, fontSize: 13, color: "#2C3E50", outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif", resize: "vertical", lineHeight: 1.5 }} />
          </div>
          <div style={{ marginTop: 16, padding: "12px 14px", background: "#FEF9E7", borderRadius: 8, borderLeft: "4px solid #F1C40F" }}>
            <p style={{ fontSize: 12, color: "#7D6608", margin: 0, lineHeight: 1.4 }}>Your Playbook requires exclusions. Most PMs skip it. The system won't let you.</p>
          </div>
        </div>
      )}

      {/* Section 4: Team */}
      {activeSection === 4 && (
        <div style={{ background: "#FDFEFE", border: "1px solid #E8EAED", borderRadius: 12, padding: mobile ? 16 : 24 }}>
          {fieldLabel("Team Capability Self-Assessment")}
          <p style={{ fontSize: 12, color: "#7F8C8D", margin: "0 0 20px 0", lineHeight: 1.4 }}>Honest assessment. These scores feed directly into the Decision Gate.</p>
          <ScoreSlider label="Unique Insight" value={capability.unique_insight}
            onChange={v => setCapability({ ...capability, unique_insight: v })}
            description="Do we know something competitors don't? Do we have unfair access or domain expertise?" />
          <ScoreSlider label="Build Capability" value={capability.build_capability}
            onChange={v => setCapability({ ...capability, build_capability: v })}
            description="Can we actually build this with current team and resources?" />
          <ScoreSlider label="Strategic Fit" value={capability.strategic_fit}
            onChange={v => setCapability({ ...capability, strategic_fit: v })}
            description="Does this align with where we want to go? Does it serve our long-term positioning?" />
          <div style={{ marginTop: 8, padding: "12px 14px", background: "#F2F3F4", borderRadius: 8 }}>
            <p style={{ fontSize: 13, color: "#2C3E50", margin: 0, fontFamily: "'DM Mono', monospace" }}>
              Average: {((capability.unique_insight + capability.build_capability + capability.strategic_fit) / 3).toFixed(1)}/5
            </p>
          </div>
        </div>
      )}

      {/* Section 5: Evidence */}
      {activeSection === 5 && (
        <div style={{ background: "#FDFEFE", border: "1px solid #E8EAED", borderRadius: 12, padding: mobile ? 16 : 24 }}>
          {fieldLabel("Interview Transcripts (Optional)")}
          <p style={{ fontSize: 12, color: "#7F8C8D", margin: "0 0 10px 0", lineHeight: 1.4 }}>Paste raw transcripts. If provided, Manus will run Mom Test synthesis. If empty, Decision Gate will flag insufficient user evidence.</p>
          {textArea(transcripts, setTranscripts, "Paste interview transcripts here. Label each interview (P1, P2, etc.)...", mobile ? 6 : 8)}
          <p style={{ fontSize: 12, color: "#95A5A6", marginTop: 8 }}>{transcripts.trim() ? `${transcripts.split(/\n\n+/).length} interview block(s) detected` : "No transcripts — evidence scan and public data only"}</p>
        </div>
      )}

      {/* Section 6: Assumptions */}
      {activeSection === 6 && (
        <div style={{ background: "#FDFEFE", border: "1px solid #E8EAED", borderRadius: 12, padding: mobile ? 16 : 24 }}>
          {fieldLabel("Pre-Research Assumption Log", true)}
          <p style={{ fontSize: 12, color: "#7F8C8D", margin: "0 0 10px 0", lineHeight: 1.4 }}>What do you believe to be true RIGHT NOW? Frame as things to INVALIDATE, not confirm.</p>
          <TagInput items={assumptions} setItems={setAssumptions}
            placeholder="e.g. I assume TAM is >$500M"
            placeholderShort="Add assumption..." minRequired={1} />
          <div style={{ marginTop: 16, padding: "12px 14px", background: "#FDEDEC", borderRadius: 8, borderLeft: "4px solid #E74C3C" }}>
            <p style={{ fontSize: 12, color: "#922B21", margin: 0, fontWeight: 500, lineHeight: 1.4 }}>These become targets for First Principles Invalidation. If you can't list assumptions, you haven't thought hard enough about what could be wrong.</p>
          </div>
        </div>
      )}

      {/* Export */}
      <div style={{ marginTop: 28, borderTop: "2px solid #E8EAED", paddingTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1B4F72", margin: "0 0 4px 0" }}>Export Session Data</p>
            <p style={{ fontSize: 12, color: "#7F8C8D", margin: 0 }}>
              {allRequired ? "All required fields complete. Ready to export." : "Complete all required fields to enable export."}
            </p>
          </div>
          <button onClick={generatePayload} disabled={!allRequired}
            style={{ padding: "12px 28px", background: allRequired ? "#1B4F72" : "#D5D8DC", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: allRequired ? "pointer" : "not-allowed", fontFamily: "'DM Sans', sans-serif", minHeight: 48, width: mobile ? "100%" : "auto" }}>
            Export Data
          </button>
        </div>

        {exported && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#1B9C85", fontWeight: 600 }}>export_data.json</span>
              <button onClick={() => { navigator.clipboard.writeText(exported); setToast("Copied to clipboard"); }}
                style={{ padding: "10px 18px", background: "#1B9C85", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", minHeight: 44 }}>
                Copy To Clipboard
              </button>
            </div>
            <pre style={{ background: "#1C2833", color: "#82E0AA", padding: mobile ? 14 : 20, borderRadius: 10, fontSize: 11, fontFamily: "'DM Mono', monospace", overflow: "auto", maxHeight: 360, lineHeight: 1.5, border: "1px solid #2C3E50", wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
              {exported}
            </pre>
            <div style={{ marginTop: 12, padding: "14px 16px", background: "#EBF5FB", borderRadius: 8, borderLeft: "4px solid #1B4F72" }}>
              <p style={{ fontSize: 13, color: "#1B4F72", margin: "0 0 4px 0", fontWeight: 600 }}>Next Step:</p>
              <p style={{ fontSize: 13, color: "#2C3E50", margin: 0, lineHeight: 1.5 }}>Export your session data as structured JSON for backup or external tools.</p>
            </div>
          </div>
        )}
      </div>

      {/* Progress Footer */}
      <div style={{ marginTop: 24, padding: "14px 18px", background: "#F8F9FA", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {sections.map((s, i) => (
            <div key={i} style={{ width: mobile ? 20 : 28, height: 5, borderRadius: 3, background: s.complete ? "#1B9C85" : "#D5D8DC", transition: "all 0.3s" }} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#1B9C85" }}>Auto-saved ✓</span>
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#7F8C8D" }}>
            {sections.filter(s => s.complete).length}/{sections.length} sections
          </span>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
