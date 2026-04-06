// V2MOM.tsx — Ported from Level 1 V2MOM.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage1-v2mom";
const SECTIONS = [
  { key: "vision", title: "Vision", icon: "👁", hint: "Where are we going? A single inspiring statement of the future you're building toward.", placeholder: "In 18 months, RideX will be the default commute app for Jakarta's multimodal commuters..." },
  { key: "values", title: "Values", icon: "💎", hint: "What matters most? The principles that guide every tradeoff. These constrain your methods.", placeholder: "1. User time saved > revenue per trip\n2. Driver fairness — never race to the bottom\n3. Multimodal integration over single-mode dominance\n4. Data-driven decisions, human judgment at gates" },
  { key: "methods", title: "Methods", icon: "🔧", hint: "How will we get there? The strategies, approaches, and key initiatives.", placeholder: "1. Launch MVP on South Jakarta–Sudirman corridor\n2. Recruit 100+ drivers from existing Grab/Gojek pool\n3. Integrate MRT Jakarta real-time schedule API\n4. B2B pilot with Hendra's 50-employee company\n5. Iterate trip-chaining UX based on Mom Test feedback" },
  { key: "obstacles", title: "Obstacles", icon: "🚧", hint: "What stands in the way? Be honest. These are the risks, blockers, and hard problems.", placeholder: "1. MRT Jakarta API access — unvalidated assumption\n2. Driver cold-start — no existing network\n3. Grab competitive response within 6 months\n4. Regulatory uncertainty on multimodal fare bundling\n5. Jakarta flooding season (Nov-Feb) disrupts all surface transport" },
  { key: "measures", title: "Measures", icon: "📏", hint: "How will we know? Specific, measurable outcomes tied to your North Star candidates.", placeholder: "1. 1,000 completed multimodal trips in Month 1\n2. Average commute time reduction: 40%+\n3. Driver retention rate > 80% after 30 days\n4. NPS > 40 from pilot users\n5. Unit economics positive by Month 6" },
];

function useAutoSave(state) {
  const t = useRef(null);
  useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [state]);
}

function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

export default function V2MOM() {
  const [theme] = useState(getTheme);
  const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);

  const [state, setState] = useState(() => {
    const saved = loadSaved();
    if (saved) return saved;
    const init = { title: "V2MOM" }; SECTIONS.forEach(s => { init[s.key] = ""; }); return init;
  });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const update = (key, val) => setState(prev => ({ ...prev, [key]: val }));
  const filled = SECTIONS.filter(s => state[s.key]?.trim().length > 10).length;

  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 1, framework: "v2mom", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied to clipboard"); };
  const importJSON = () => { const raw = prompt("Paste JSON data:"); if (!raw) return; try { const d = JSON.parse(raw); if (d.v2mom) { Object.keys(d.v2mom).forEach(k => { if (state.hasOwnProperty(k)) update(k, d.v2mom[k]); }); setToast("Imported"); } else { setState(prev => ({ ...prev, ...d })); setToast("Imported"); } } catch (e) { setToast("Invalid JSON"); } };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      <div style={{ marginBottom: 28, borderBottom: "3px solid #E67E22", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#E67E22", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 1 · Strategy Architect</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>V2MOM</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: "0 0 8px" }}>Vision, Values, Methods, Obstacles, Measures — Salesforce's strategic alignment framework.</p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ height: 6, flex: 1, background: t.input, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(filled / 5) * 100}%`, background: "#E67E22", borderRadius: 3, transition: "width 0.5s" }} />
          </div>
          <span style={{ fontSize: 12, fontFamily: "'DM Mono',monospace", color: t.textMuted }}>{filled}/5</span>
        </div>
      </div>

      {SECTIONS.map((sec, i) => (
        <div key={sec.key} style={{ marginBottom: 24, background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${t.cardBorder}`, display: "flex", alignItems: "center", gap: 10, background: state[sec.key]?.trim().length > 10 ? "#1B9C8508" : "transparent" }}>
            <span style={{ fontSize: 20 }}>{sec.icon}</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: 0 }}>{sec.title}</h3>
              <p style={{ fontSize: 12, color: t.textMuted, margin: "2px 0 0", lineHeight: 1.3 }}>{sec.hint}</p>
            </div>
            {state[sec.key]?.trim().length > 10 && <span style={{ fontSize: 14, color: "#1B9C85" }}>✓</span>}
          </div>
          <div style={{ padding: "14px 18px" }}>
            <textarea value={state[sec.key] || ""} onChange={e => update(sec.key, e.target.value)} rows={5} placeholder={sec.placeholder}
              style={{ width: "100%", padding: "12px 14px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 10, fontSize: 14, color: t.text, outline: "none", fontFamily: "'DM Sans',sans-serif", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6 }} />
          </div>
        </div>
      ))}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#E67E22", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={importJSON} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import JSON</button>
        <button onClick={() => { const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `v2mom-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setToast("Saved"); }} style={{ padding: "12px 20px", background: "#1B9C85", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 48 }}>💾 Save</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
