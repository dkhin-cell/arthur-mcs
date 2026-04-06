// ProductStrategyCanvas.tsx — Ported from Level 1 ProductStrategyCanvas.jsx
'use client';
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage1-strategy-canvas";
const SECTIONS = [
  { key: "target_user", title: "Target User", icon: "👤", hint: "Who specifically are you building for?", placeholder: "Jakarta white-collar commuters aged 25-40, earning $800-2000/month, commuting 15+ km daily across South Jakarta to Central Jakarta..." },
  { key: "problem", title: "Problem", icon: "🔥", hint: "What pain are you solving? Be specific about frequency and severity.", placeholder: "2-3 hours wasted daily on fragmented commutes. No single app chains motorcycle taxi + MRT + car into one booking..." },
  { key: "value_prop", title: "Value Proposition", icon: "💎", hint: "Why would someone choose this over alternatives?", placeholder: "One-tap multimodal booking that cuts 2.5hr commutes to under 60 minutes. Single payment, optimized routing, guaranteed connections..." },
  { key: "solution", title: "Solution", icon: "🔧", hint: "What are you actually building? Keep it concrete.", placeholder: "Mobile app with real-time MRT integration, dynamic motorcycle-taxi matching at station endpoints, and single-payment trip bundling..." },
  { key: "channels", title: "Channels", icon: "📢", hint: "How will users discover and adopt this?", placeholder: "1. B2B pilot through corporate commuter programs\n2. MRT station proximity marketing\n3. Grab/Gojek driver referral network\n4. Word-of-mouth from pilot corridor..." },
  { key: "revenue", title: "Revenue Model", icon: "💰", hint: "How does money flow? What's the unit economics thesis?", placeholder: "Commission per trip (15-20% vs Grab's 25-30%). Premium subscription for guaranteed connections. B2B monthly per-employee plans..." },
  { key: "metrics", title: "Key Metrics", icon: "📊", hint: "What numbers tell you this is working?", placeholder: "1. Completed multimodal trips/week\n2. Average commute time reduction\n3. Driver retention at 30 days\n4. NPS from pilot users\n5. Revenue per trip..." },
  { key: "unfair_advantage", title: "Unfair Advantage", icon: "🏰", hint: "What can't be easily copied or bought?", placeholder: "First-mover on MRT API integration (structural blocker for Grab). Deep Jakarta corridor knowledge from founding team. Driver network with better per-trip economics..." },
];

function useAutoSave(state) {
  const t = useRef(null);
  useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [state]);
}

function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

export default function ProductStrategyCanvas() {
  const [theme] = useState(getTheme);
  const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);

  const [state, setState] = useState(() => {
    const saved = loadSaved();
    if (saved) return saved;
    const init = { title: "Product Strategy Canvas" }; SECTIONS.forEach(s => { init[s.key] = ""; }); return init;
  });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const update = (key, val) => setState(prev => ({ ...prev, [key]: val }));
  const filled = SECTIONS.filter(s => state[s.key]?.trim().length > 10).length;

  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 1, framework: "strategy_canvas", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied to clipboard"); };
  const importJSON = () => { const raw = prompt("Paste JSON data:"); if (!raw) return; try { const d = JSON.parse(raw); if (d.strategy_canvas) { Object.keys(d.strategy_canvas).forEach(k => { if (state.hasOwnProperty(k)) update(k, d.strategy_canvas[k]); }); } else { setState(prev => ({ ...prev, ...d })); } setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      <div style={{ marginBottom: 28, borderBottom: "3px solid #E67E22", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#E67E22", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 1 · Strategy Architect</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Product Strategy Canvas</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: "0 0 8px" }}>Eight dimensions of your product strategy on one canvas.</p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ height: 6, flex: 1, background: t.input, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(filled / 8) * 100}%`, background: "#E67E22", borderRadius: 3, transition: "width 0.5s" }} />
          </div>
          <span style={{ fontSize: 12, fontFamily: "'DM Mono',monospace", color: t.textMuted }}>{filled}/8</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 14 }}>
        {SECTIONS.map(sec => (
          <div key={sec.key} style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${t.cardBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>{sec.icon}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: t.text, margin: 0 }}>{sec.title}</h3>
                <p style={{ fontSize: 11, color: t.textMuted, margin: "1px 0 0" }}>{sec.hint}</p>
              </div>
              {state[sec.key]?.trim().length > 10 && <span style={{ fontSize: 12, color: "#1B9C85" }}>✓</span>}
            </div>
            <div style={{ padding: "12px 14px" }}>
              <textarea value={state[sec.key] || ""} onChange={e => update(sec.key, e.target.value)} rows={4} placeholder={sec.placeholder}
                style={{ width: "100%", padding: "10px 12px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 13, color: t.text, outline: "none", fontFamily: "'DM Sans',sans-serif", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#E67E22", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={importJSON} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import JSON</button>
        <button onClick={() => { const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `strategy-canvas-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setToast("Saved"); }} style={{ padding: "12px 20px", background: "#1B9C85", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 48 }}>💾 Save</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
