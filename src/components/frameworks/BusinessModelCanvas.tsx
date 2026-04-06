// BusinessModelCanvas.tsx — Ported from Level 1 BusinessModelCanvas.jsx
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { THEMES, getTheme } from "@/lib/theme";

const STORAGE_KEY = "dk-stage1-bmc";
const BLOCKS = [
  { key: "key_partners", title: "Key Partners", icon: "🤝", hint: "Who are the key partners and suppliers? What resources do they provide?", placeholder: "MRT Jakarta (schedule API access)\nGojek/Grab driver pool (recruitment)\nGoogle Maps (routing API)\nPayment gateways (GoPay, OVO, DANA)", row: 1, col: 1 },
  { key: "key_activities", title: "Key Activities", icon: "⚙️", hint: "What key activities does your value proposition require?", placeholder: "Multimodal route optimization\nDriver recruitment & onboarding\nMRT API integration & maintenance\nReal-time trip matching\nUser acquisition (B2B + B2C)", row: 1, col: 2 },
  { key: "value_propositions", title: "Value Propositions", icon: "💎", hint: "What value do you deliver? Which problems are you solving?", placeholder: "One-tap multimodal commute booking\n40% commute time reduction\nSingle payment for chained trips\nGuaranteed MRT connections\nLower cost than pure car rides", row: 1, col: 3 },
  { key: "customer_relationships", title: "Customer Relationships", icon: "💬", hint: "What type of relationship does each segment expect?", placeholder: "Self-service app with smart defaults\nIn-app support chat\nWeekly commute insights emails\nCorporate account managers (B2B)\nDriver community & feedback loop", row: 1, col: 4 },
  { key: "customer_segments", title: "Customer Segments", icon: "👥", hint: "Who are the most important customers?", placeholder: "Primary: Jakarta white-collar commuters (25-40, $800-2000/mo)\nSecondary: Corporate commuter programs\nTertiary: Occasional multimodal travelers\nSupply-side: Motorcycle taxi & car drivers", row: 1, col: 5 },
  { key: "key_resources", title: "Key Resources", icon: "🏗", hint: "What key resources does your value proposition require?", placeholder: "Multimodal routing engine\nMRT real-time schedule data\nDriver network (100+ at launch)\nMobile app (iOS + Android)\nB2B sales relationships", row: 2, col: 1 },
  { key: "channels", title: "Channels", icon: "📢", hint: "Through which channels do your segments want to be reached?", placeholder: "Direct: Mobile app (App Store, Play Store)\nB2B: Corporate partnerships\nReferral: Driver-to-rider, rider-to-rider\nProximity: MRT station marketing\nDigital: Social media, Google Ads", row: 2, col: 2 },
  { key: "cost_structure", title: "Cost Structure", icon: "💸", hint: "What are the most important costs inherent in your business model?", placeholder: "Driver incentives & subsidies (largest)\nEngineering team salaries\nMRT API licensing (if applicable)\nCloud infrastructure (AWS/GCP)\nMarketing & user acquisition\nCustomer support operations", row: 3, col: "left" },
  { key: "revenue_streams", title: "Revenue Streams", icon: "💰", hint: "For what value are your customers willing to pay?", placeholder: "Per-trip commission (15-20%)\nPremium subscription (guaranteed connections)\nB2B monthly per-employee plans\nSurge pricing on high-demand corridors\nData insights for transit authorities", row: 3, col: "right" },
];

function useAutoSave(state) {
  const t = useRef(null);
  useEffect(() => { clearTimeout(t.current); t.current = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }, 500); return () => clearTimeout(t.current); }, [state]);
}

function loadSaved() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }

export default function BusinessModelCanvas() {
  const [theme] = useState(getTheme);
  const t = THEMES[theme];
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 700 : false);
  useEffect(() => { const c = () => setMobile(window.innerWidth < 700); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);

  const [state, setState] = useState(() => {
    const saved = loadSaved();
    if (saved) return saved;
    const init = { title: "Business Model Canvas" }; BLOCKS.forEach(b => { init[b.key] = ""; }); return init;
  });
  const [toast, setToast] = useState(null);
  useAutoSave(state);
  useEffect(() => { if (toast) { const tm = setTimeout(() => setToast(null), 2500); return () => clearTimeout(tm); } }, [toast]);

  const update = (key, val) => setState(prev => ({ ...prev, [key]: val }));
  const filled = BLOCKS.filter(b => state[b.key]?.trim().length > 10).length;

  const exportPayload = () => { navigator.clipboard.writeText(JSON.stringify({ stage: 1, framework: "bmc", data: state, exported_at: new Date().toISOString() }, null, 2)); setToast("Copied to clipboard"); };
  const importJSON = () => { const raw = prompt("Paste JSON data:"); if (!raw) return; try { const d = JSON.parse(raw); if (d.bmc) { Object.keys(d.bmc).forEach(k => { if (state.hasOwnProperty(k)) update(k, d.bmc[k]); }); } else { setState(prev => ({ ...prev, ...d })); } setToast("Imported"); } catch (e) { setToast("Invalid JSON"); } };

  const blockCard = (block) => (
    <div key={block.key} style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "10px 14px", borderBottom: `1px solid ${t.cardBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16 }}>{block.icon}</span>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: t.text, margin: 0, flex: 1 }}>{block.title}</h3>
        {state[block.key]?.trim().length > 10 && <span style={{ fontSize: 11, color: "#1B9C85" }}>✓</span>}
      </div>
      <div style={{ padding: "10px 12px", flex: 1 }}>
        <p style={{ fontSize: 10, color: t.textDim, margin: "0 0 6px", lineHeight: 1.3 }}>{block.hint}</p>
        <textarea value={state[block.key] || ""} onChange={e => update(block.key, e.target.value)} rows={4} placeholder={block.placeholder}
          style={{ width: "100%", padding: "8px 10px", background: t.input, border: `1px solid ${t.cardBorder}`, borderRadius: 8, fontSize: 12, color: t.text, outline: "none", fontFamily: "'DM Sans',sans-serif", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5 }} />
      </div>
    </div>
  );

  const topRow = BLOCKS.filter(b => b.row === 1);
  const midRow = BLOCKS.filter(b => b.row === 2);
  const botRow = BLOCKS.filter(b => b.row === 3);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: mobile ? "20px 16px" : "32px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      <div style={{ marginBottom: 28, borderBottom: "3px solid #E67E22", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#E67E22", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Stage 1 · Strategy Architect</p>
        <h1 style={{ fontSize: mobile ? 24 : 30, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Business Model Canvas</h1>
        <p style={{ fontSize: 14, color: t.textMuted, margin: "0 0 8px" }}>The standard 9-block business model layout by Alexander Osterwalder.</p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ height: 6, flex: 1, background: t.input, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(filled / 9) * 100}%`, background: "#E67E22", borderRadius: 3, transition: "width 0.5s" }} />
          </div>
          <span style={{ fontSize: 12, fontFamily: "'DM Mono',monospace", color: t.textMuted }}>{filled}/9</span>
        </div>
      </div>

      {mobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {BLOCKS.map(b => blockCard(b))}
        </div>
      ) : (
        <>
          {/* Top row: 5 columns */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 10 }}>
            {topRow.map(b => blockCard(b))}
          </div>
          {/* Mid row: 2 blocks spanning under Partners+Activities and Relationships+Segments */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gap: 10, marginBottom: 10 }}>
            {midRow.map(b => blockCard(b))}
            <div /> {/* spacer */}
          </div>
          {/* Bottom row: Cost Structure + Revenue Streams */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {botRow.map(b => blockCard(b))}
          </div>
        </>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}>
        <button onClick={exportPayload} style={{ padding: "12px 20px", background: "#E67E22", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📤 Export</button>
        <button onClick={importJSON} style={{ padding: "12px 20px", background: t.text, color: t.bg, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1, minWidth: 140, minHeight: 48 }}>📥 Import JSON</button>
        <button onClick={() => { const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `bmc-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setToast("Saved"); }} style={{ padding: "12px 20px", background: "#1B9C85", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 48 }}>💾 Save</button>
      </div>
      <p style={{ fontSize: 11, color: t.textDim, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 16 }}>Auto-saved to localStorage</p>
      {toast && <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "#1B9C85", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 1000 }}>{toast}</div>}
    </div>
  );
}
