// StageTimer.tsx — Ported from Level 1 StageTimer.jsx
'use client';
// @ts-nocheck
/**
 * StageTimer.jsx — Theme-Aware
 * Reads stage entry timestamp from localStorage, shows days elapsed with thresholds.
 */
import { useState, useEffect, useRef } from "react";

const TIMER_KEY = "dk-stage0-timer";
const THRESHOLDS = { amber: 14, red: 21 };

function loadTimerData() { try { const r = window.localStorage.getItem(TIMER_KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }
function getDaysElapsed(enteredAt) { if (!enteredAt) return 0; return Math.floor((new Date() - new Date(enteredAt)) / (1000 * 60 * 60 * 24)); }
function getTimerStatus(days) {
  if (days >= THRESHOLDS.red) return { color: "#E74C3C", label: "Overdue", bg: "#E74C3C18", border: "#E74C3C40" };
  if (days >= THRESHOLDS.amber) return { color: "#E67E22", label: "At Threshold", bg: "#E67E2218", border: "#E67E2240" };
  return { color: "#1B9C85", label: "On Track", bg: "#1B9C8518", border: "#1B9C8540" };
}

function AnimatedDays({ value }) {
  const [display, setDisplay] = useState(0); const ref = useRef(null);
  useEffect(() => { const s = performance.now(); function tick(n) { const p = Math.min((n - s) / 1000, 1); setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * value)); if (p < 1) ref.current = requestAnimationFrame(tick); } ref.current = requestAnimationFrame(tick); return () => cancelAnimationFrame(ref.current); }, [value]);
  return <span>{display}</span>;
}

export default function StageTimer({ compact = false, t }) {
  const [timerData, setTimerData] = useState(null);
  useEffect(() => { setTimerData(loadTimerData()); const h = (e) => { if (e.key === TIMER_KEY) setTimerData(loadTimerData()); }; window.addEventListener("storage", h); return () => window.removeEventListener("storage", h); }, []);

  if (!t) t = { text: "#1B2631", textMuted: "#5D6D7E", textDim: "#95A5A6", input: "#F1F5F9", card: "#fff", cardBorder: "#E8EAED" };

  const days = timerData ? getDaysElapsed(timerData.entered_at) : 0;
  const status = getTimerStatus(days);
  const pct = Math.min((days / THRESHOLDS.red) * 100, 100);
  const stageLabel = timerData?.label || "Stage 0: Problem Validator";

  if (compact) {
    return (
      <div style={{ background: t.card, borderRadius: 12, padding: "12px 14px", border: `1px solid ${t.cardBorder}` }}>
        <p style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: t.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 6px" }}>Time in Stage</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 26, fontFamily: "'DM Mono', monospace", fontWeight: 700, color: t.text, lineHeight: 1 }}><AnimatedDays value={days} /></span>
          <span style={{ fontSize: 12, color: t.textMuted }}>days</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: status.color, marginLeft: "auto" }}>{status.label}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: t.card, borderRadius: 16, padding: "20px 24px", border: `1px solid ${t.cardBorder}`, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: status.color, opacity: 0.8 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: t.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>Time in Stage</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 40, fontFamily: "'DM Mono', monospace", fontWeight: 700, color: t.text, lineHeight: 1 }}><AnimatedDays value={days} /></span>
            <span style={{ fontSize: 16, color: t.textMuted }}>days</span>
          </div>
          <p style={{ fontSize: 12, color: t.textDim, margin: "2px 0 0" }}>{stageLabel}</p>
        </div>
        <div style={{ padding: "4px 10px", borderRadius: 20, background: status.bg, border: `1px solid ${status.border}` }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: status.color }}>{status.label}</span>
        </div>
      </div>
      <div style={{ height: 6, background: t.input, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, #1B9C85, ${status.color})`, borderRadius: 3, transition: "width 1.5s cubic-bezier(0.22, 1, 0.36, 1)" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: t.textDim }}>0d</span>
        <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#E67E22" }}>14d</span>
        <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#E74C3C" }}>21d</span>
      </div>
    </div>
  );
}

export function getStageTimerData() { const d = loadTimerData(); const days = d ? getDaysElapsed(d.entered_at) : 0; return { days, status: getTimerStatus(days), label: d?.label || "Stage 0" }; }
