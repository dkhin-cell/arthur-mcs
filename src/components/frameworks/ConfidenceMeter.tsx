// ConfidenceMeter.tsx — Ported from Level 1 ConfidenceMeter.jsx
'use client';
// @ts-nocheck
/**
 * ConfidenceMeter.jsx — Theme-Aware
 * Reads Mom Test data from localStorage, computes weighted confidence score.
 * Supports light/dark mode via theme prop.
 */
import { useState, useEffect } from "react";

const MOMTEST_KEY = "dk-stage0-momtest";
const COMMITMENT_WEIGHTS = { 1: 0.1, 2: 0.3, 3: 0.5, 4: 0.8, 5: 1.0 };
const COMMITMENT_COLORS = { 1: "#E74C3C", 2: "#E67E22", 3: "#F1C40F", 4: "#27AE60", 5: "#1B9C85" };
const THRESHOLD = 0.70;

function computeConfidence(interviews) {
  if (!interviews || !interviews.length) return 0;
  const sum = interviews.reduce((acc, i) => acc + (COMMITMENT_WEIGHTS[i.commitment_level] || 0), 0);
  return sum / (interviews.length * 1.0);
}

function getCommitmentDistribution(interviews) {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (!interviews) return dist;
  interviews.forEach(i => { const l = i.commitment_level; if (l >= 1 && l <= 5) dist[l]++; });
  return dist;
}

function loadMomTestData() {
  try { const raw = window.localStorage.getItem(MOMTEST_KEY); if (raw) { const d = JSON.parse(raw); return d.interviews || []; } } catch (e) {}
  return [];
}

function Gauge({ score, size = 200, t }) {
  const [animated, setAnimated] = useState(0);
  const radius = size * 0.38;
  const cx = size / 2, cy = size * 0.52;
  const startAngle = -210, endAngle = 30, totalAngle = endAngle - startAngle;

  useEffect(() => {
    let frame; const start = performance.now();
    function tick(now) { const p = Math.min((now - start) / 1500, 1); setAnimated((1 - Math.pow(1 - p, 4)) * score); if (p < 1) frame = requestAnimationFrame(tick); }
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  }, [score]);

  function polar(angle) { const rad = (angle * Math.PI) / 180; return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }; }
  function arcPath(sA, eA) { const s = polar(sA), e = polar(eA); return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${Math.abs(eA - sA) > 180 ? 1 : 0} 1 ${e.x} ${e.y}`; }

  const scoreAngle = startAngle + totalAngle * animated;
  const color = animated >= 0.7 ? "#1B9C85" : animated >= 0.5 ? "#E67E22" : "#E74C3C";
  const label = animated >= 0.7 ? "Strong" : animated >= 0.5 ? "Building" : "Early";
  const needleEnd = polar(scoreAngle);
  const threshPoint = polar(startAngle + totalAngle * THRESHOLD);

  return (
    <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
      <path d={arcPath(startAngle, startAngle + totalAngle * 0.5)} fill="none" stroke={t.zoneWeak || "#FDEDEC"} strokeWidth={size * 0.06} strokeLinecap="round" />
      <path d={arcPath(startAngle + totalAngle * 0.5, startAngle + totalAngle * 0.7)} fill="none" stroke={t.zoneMid || "#FEF5E7"} strokeWidth={size * 0.06} strokeLinecap="round" />
      <path d={arcPath(startAngle + totalAngle * 0.7, endAngle)} fill="none" stroke={t.zoneStrong || "#EAFAF1"} strokeWidth={size * 0.06} strokeLinecap="round" />
      {animated > 0.01 && <path d={arcPath(startAngle, scoreAngle)} fill="none" stroke={color} strokeWidth={size * 0.06} strokeLinecap="round" />}
      <circle cx={threshPoint.x} cy={threshPoint.y} r={3} fill={t.text} opacity={0.3} />
      <line x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={size * 0.03} fill={color} />
      <text x={cx} y={cy - size * 0.08} textAnchor="middle" fill={t.text} fontFamily="'DM Mono', monospace" fontSize={size * 0.18} fontWeight="700">{(animated * 100).toFixed(0)}</text>
      <text x={cx} y={cy + size * 0.04} textAnchor="middle" fill={t.textMuted} fontFamily="'DM Sans', sans-serif" fontSize={size * 0.06} fontWeight="500">{label} Signal</text>
    </svg>
  );
}

function CommitmentBars({ distribution, total, t }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {[5, 4, 3, 2, 1].map(level => {
        const count = distribution[level] || 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={level} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 65, fontSize: 11, fontFamily: "'DM Mono', monospace", color: t.textMuted, textAlign: "right", flexShrink: 0 }}>L{level}</div>
            <div style={{ flex: 1, height: 16, background: t.input, borderRadius: 8, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: COMMITMENT_COLORS[level], borderRadius: 8, transition: "width 1.2s cubic-bezier(0.22, 1, 0.36, 1)", minWidth: count > 0 ? 20 : 0 }} />
            </div>
            <div style={{ width: 24, fontSize: 12, fontFamily: "'DM Mono', monospace", color: t.text, fontWeight: 600, textAlign: "center" }}>{count}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function ConfidenceMeter({ compact = false, t }) {
  const [interviews, setInterviews] = useState([]);
  useEffect(() => { setInterviews(loadMomTestData()); const h = (e) => { if (e.key === MOMTEST_KEY) setInterviews(loadMomTestData()); }; window.addEventListener("storage", h); return () => window.removeEventListener("storage", h); }, []);

  // Fallback theme if not provided
  if (!t) t = { text: "#1B2631", textMuted: "#5D6D7E", textDim: "#95A5A6", input: "#F1F5F9", card: "#fff", cardBorder: "#E8EAED", accent: "#1B9C85", zoneWeak: "#FDEDEC", zoneMid: "#FEF5E7", zoneStrong: "#EAFAF1" };

  const confidence = computeConfidence(interviews);
  const distribution = getCommitmentDistribution(interviews);
  const l3Plus = interviews.filter(i => i.commitment_level >= 3).length;

  if (compact) {
    return (
      <div style={{ background: t.card, borderRadius: 12, padding: "14px 16px", border: `1px solid ${t.cardBorder}`, textAlign: "center" }}>
        <p style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: t.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>Confidence</p>
        <Gauge score={confidence} size={150} t={t} />
        <p style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: t.textDim, margin: "4px 0 0" }}>{interviews.length} interviews · {l3Plus} L3+</p>
      </div>
    );
  }

  return (
    <div style={{ background: t.card, borderRadius: 16, padding: "20px 24px", border: `1px solid ${t.cardBorder}`, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: confidence >= 0.7 ? "#1B9C85" : confidence >= 0.5 ? "#E67E22" : "#E74C3C", opacity: 0.8, borderRadius: "16px 16px 0 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: t.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>Evidence Strength</p>
        <div style={{ padding: "3px 8px", borderRadius: 20, fontSize: 10, fontFamily: "'DM Mono', monospace", fontWeight: 600, color: confidence >= THRESHOLD ? "#1B9C85" : "#E67E22", background: confidence >= THRESHOLD ? "#1B9C8518" : "#E67E2218", border: `1px solid ${confidence >= THRESHOLD ? "#1B9C8540" : "#E67E2240"}` }}>
          {confidence >= THRESHOLD ? "Above Threshold" : `Below ${(THRESHOLD * 100).toFixed(0)}% Threshold`}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><Gauge score={confidence} size={220} t={t} /></div>
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <p style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: t.textDim, margin: 0 }}>Commitment Distribution</p>
          <p style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: t.textMuted, margin: 0 }}>{interviews.length} interviews · <strong style={{ color: "#1B9C85" }}>{l3Plus} L3+</strong></p>
        </div>
        <CommitmentBars distribution={distribution} total={interviews.length} t={t} />
      </div>
    </div>
  );
}

export function getConfidenceScore() {
  const interviews = loadMomTestData();
  return { score: computeConfidence(interviews), total: interviews.length, l3Plus: interviews.filter(i => i.commitment_level >= 3).length, distribution: getCommitmentDistribution(interviews) };
}
