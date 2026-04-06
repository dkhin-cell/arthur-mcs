// UsabilityTestPlan.tsx — Ported from Level 1 UsabilityTestPlan.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage3-usability";
const EMPTY_TASK = { description: "", successCriteria: "", maxTime: "", priority: "must" };
const PRIORITIES = [
  { key: "must", label: "Must Test", color: "#E74C3C" },
  { key: "should", label: "Should Test", color: "#E67E22" },
  { key: "nice", label: "Nice to Test", color: "#95A5A6" },
];

function useAutoSave(s) { const t = useRef(null); useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [s]); }
function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

function loadPreFill() {
  const tasks = [];
  try { const ux = JSON.parse(localStorage.getItem("dk-stage3-uxhypothesis") || "{}"); (ux.hypotheses || []).filter(h => h.designDecision && h.status === "draft").forEach(h => tasks.push(`Test: ${h.designDecision.slice(0, 60)}`)); } catch (e) {}
  return tasks;
}

export default function UsabilityTestPlan() {
  const [theme] = useState(getTheme); const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  const suggestedTasks = loadPreFill();
  const [state, setState] = useState(() => loadSaved() || {
    testType: "moderated", participants: "5", recruitCriteria: "", testEnvironment: "", facilitator: "",
    tasks: [{ ...EMPTY_TASK }],
    preTestQuestions: "", postTestQuestions: "", successThreshold: ""
  });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const update = (k, v) => setState(prev => ({ ...prev, [k]: v }));
  const updateTask = (i, k, v) => setState(prev => { const ts = [...prev.tasks]; ts[i] = { ...ts[i], [k]: v }; return { ...prev, tasks: ts }; });
  const addTask = (desc) => setState(prev => ({ ...prev, tasks: [...prev.tasks, { ...EMPTY_TASK, description: desc || "" }] }));
  const removeTask = (i) => setState(prev => ({ ...prev, tasks: prev.tasks.filter((_, j) => j !== i) }));
  const fieldStyle = { width: "100%", padding: "8px 10px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.text, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif", resize: "vertical" };
  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 3, framework: "usability_test", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied"); };

  const TEST_TYPES = [
    { key: "moderated", label: "Moderated (live)" },
    { key: "unmoderated", label: "Unmoderated (async)" },
    { key: "guerrilla", label: "Guerrilla (quick)" },
    { key: "ab", label: "A/B Test" },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 28, borderBottom: "3px solid #2ECC71", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#2ECC71", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 3 · Design & MVP</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Usability Test Plan</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>Who to test, what tasks, and how you'll know it works.</p>
      </div>

      {/* Setup */}
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#2ECC71", margin: "0 0 4px", fontWeight: 600 }}>TEST TYPE</p>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {TEST_TYPES.map(tt => (
              <button key={tt.key} onClick={() => update("testType", tt.key)} style={{ padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1px solid ${t.cardBorder}`, background: state.testType === tt.key ? "#2ECC7120" : "transparent", color: state.testType === tt.key ? "#2ECC71" : t.textMuted }}>{tt.label}</button>
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#2ECC71", margin: "0 0 4px", fontWeight: 600 }}>NUMBER OF PARTICIPANTS</p>
          <input value={state.participants} onChange={e => update("participants", e.target.value)} placeholder="5 (recommended minimum for usability)" style={fieldStyle} />
        </div>
        <div>
          <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: t.textDim, margin: "0 0 4px", fontWeight: 600 }}>RECRUITMENT CRITERIA</p>
          <textarea value={state.recruitCriteria} onChange={e => update("recruitCriteria", e.target.value)} rows={2} placeholder="Who qualifies? Age, experience, usage patterns..." style={fieldStyle} />
        </div>
        <div>
          <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: t.textDim, margin: "0 0 4px", fontWeight: 600 }}>TEST ENVIRONMENT</p>
          <input value={state.testEnvironment} onChange={e => update("testEnvironment", e.target.value)} placeholder="Remote (Zoom), in-person, UserTesting.com..." style={fieldStyle} />
        </div>
      </div>

      {/* Suggested tasks from UX hypotheses */}
      {suggestedTasks.length > 0 && (
        <div style={{ marginBottom: 12, padding: "10px 14px", background: "#2ECC7108", border: "1px solid #2ECC7120", borderRadius: 10 }}>
          <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#2ECC71", margin: "0 0 6px", fontWeight: 600 }}>💡 SUGGESTED TASKS FROM UX HYPOTHESES</p>
          {suggestedTasks.slice(0, 3).map((task, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0" }}>
              <span style={{ fontSize: 11, color: t.text, flex: 1 }}>{task}</span>
              <button onClick={() => addTask(task)} style={{ padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: "#2ECC7115", border: "1px solid #2ECC7130", color: "#2ECC71", cursor: "pointer" }}>+ Add</button>
            </div>
          ))}
        </div>
      )}

      {/* Tasks */}
      <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: t.textDim, margin: "0 0 8px", textTransform: "uppercase" }}>Test Tasks</p>
      {state.tasks.map((task, i) => {
        const pr = PRIORITIES.find(p => p.key === task.priority) || PRIORITIES[0];
        return (
          <div key={i} style={{ marginBottom: 8, padding: "10px 12px", background: t.card, border: `1px solid ${pr.color}25`, borderRadius: 10, borderLeft: `3px solid ${pr.color}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#2ECC71", fontFamily: "'DM Mono',monospace" }}>T{i + 1}</span>
              <div style={{ display: "flex", gap: 3, marginLeft: "auto" }}>
                {PRIORITIES.map(p => (
                  <button key={p.key} onClick={() => updateTask(i, "priority", p.key)} style={{ padding: "3px 8px", borderRadius: 5, fontSize: 9, fontWeight: 600, cursor: "pointer", border: `1px solid ${p.color}30`, background: task.priority === p.key ? `${p.color}20` : "transparent", color: task.priority === p.key ? p.color : t.textDim }}>{p.label}</button>
                ))}
              </div>
              {state.tasks.length > 1 && <button onClick={() => removeTask(i)} style={{ background: "none", border: "none", color: "#E74C3C50", cursor: "pointer", fontSize: 12 }}>×</button>}
            </div>
            <textarea value={task.description} onChange={e => updateTask(i, "description", e.target.value)} rows={2} placeholder="Ask the user to..." style={{ ...fieldStyle, marginBottom: 4 }} />
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 4 }}>
              <input value={task.successCriteria} onChange={e => updateTask(i, "successCriteria", e.target.value)} placeholder="Success = completed without help, under 30s..." style={fieldStyle} />
              <input value={task.maxTime} onChange={e => updateTask(i, "maxTime", e.target.value)} placeholder="Max time (e.g., 60s)" style={fieldStyle} />
            </div>
          </div>
        );
      })}
      <button onClick={() => addTask()} style={{ width: "100%", padding: "10px", background: "none", border: `1px dashed ${t.cardBorder}`, borderRadius: 10, fontSize: 13, color: t.textMuted, cursor: "pointer", marginBottom: 16 }}>+ Add Task</button>

      {/* Questions */}
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: t.textDim, margin: "0 0 4px", fontWeight: 600 }}>PRE-TEST QUESTIONS</p>
          <textarea value={state.preTestQuestions} onChange={e => update("preTestQuestions", e.target.value)} rows={3} placeholder="Background questions before the test begins..." style={fieldStyle} />
        </div>
        <div>
          <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: t.textDim, margin: "0 0 4px", fontWeight: 600 }}>POST-TEST QUESTIONS</p>
          <textarea value={state.postTestQuestions} onChange={e => update("postTestQuestions", e.target.value)} rows={3} placeholder="SUS score, NPS, open-ended feedback..." style={fieldStyle} />
        </div>
      </div>

      <div>
        <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#1B9C85", margin: "0 0 4px", fontWeight: 600 }}>OVERALL SUCCESS THRESHOLD</p>
        <input value={state.successThreshold} onChange={e => update("successThreshold", e.target.value)} placeholder="e.g., 80% task completion rate, SUS score > 68, NPS > 30..." style={fieldStyle} />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#2ECC71", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={() => { const raw = prompt("Paste JSON:"); if (!raw) return; try { setState({ ...JSON.parse(raw) }); setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } }} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
