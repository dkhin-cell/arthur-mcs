// ValidationTelemetry.ts — Aggregated data for Cockpit dashboard
// Scans all dk-stage* localStorage keys and computes telemetry stats

export interface TelemetryData {
  confidence: { score: number; interviews: number };
  timer: { days: number; elapsed: number };
  radar: { high: number; total: number };
  frameworks: { touched: number; total: number };
  gate: { status: string; passed: number; total: number };
  assumptions: { total: number; highRisk: number };
  forces: { net: number };
}

const FRAMEWORK_KEYS = [
  { key: "dk-stage0-session",     label: "Input Panel",        group: "input" },
  { key: "dk-stage0-swot",        label: "SWOT Analysis",      group: "framework" },
  { key: "dk-stage0-tam",         label: "TAM Calculator",     group: "framework" },
  { key: "dk-stage0-competitive", label: "Competitive Matrix",  group: "framework" },
  { key: "dk-stage0-competing",   label: "Competing Against",   group: "framework" },
  { key: "dk-stage0-momtest",     label: "Mom Test",            group: "framework" },
  { key: "dk-stage0-forces",      label: "Forces of Progress",  group: "framework" },
  { key: "dk-stage0-kano",        label: "Kano Model",          group: "framework" },
  { key: "dk-stage0-valueprop",   label: "Value Proposition",   group: "framework" },
  { key: "dk-stage0-canvas",      label: "Strategy Canvas",     group: "framework" },
  { key: "dk-stage0-assumptions", label: "Assumption Tracker",  group: "framework" },
  { key: "dk-stage0-gate",        label: "Decision Gate",       group: "gate" },
];

const COMMITMENT_WEIGHTS: Record<number, number> = { 1: 0.1, 2: 0.3, 3: 0.5, 4: 0.8, 5: 1.0 };

function readKey(key: string): any {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function getFrameworkStats() {
  const touched = FRAMEWORK_KEYS.filter(f => readKey(f.key) !== null).length;
  return { touched, total: FRAMEWORK_KEYS.length };
}

function getConfidenceScore() {
  const momtest = readKey("dk-stage0-momtest");
  if (!momtest || !momtest.interviews) return { score: 0, interviews: 0 };
  
  const interviews = momtest.interviews || [];
  if (interviews.length === 0) return { score: 0, interviews: 0 };
  
  let totalScore = 0;
  let totalWeight = 0;
  
  interviews.forEach((interview: any) => {
    const commitment = interview.commitment || 3;
    const weight = COMMITMENT_WEIGHTS[commitment] || 0.5;
    const hasEvidence = interview.evidence && interview.evidence.length > 20;
    const score = hasEvidence ? 1 : 0.3;
    totalScore += score * weight;
    totalWeight += weight;
  });
  
  return {
    score: totalWeight > 0 ? totalScore / totalWeight : 0,
    interviews: interviews.length
  };
}

function getTimerDays() {
  const timer = readKey("dk-stage0-timer");
  if (!timer || !timer.startDate) return { days: 0, elapsed: 0 };
  const start = new Date(timer.startDate);
  const now = new Date();
  const elapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return { days: elapsed, elapsed };
}

function getRadarStats() {
  const radar = readKey("dk-stage0-radar");
  if (!radar || !radar.signals) return { high: 0, total: 0 };
  const signals = radar.signals || [];
  const high = signals.filter((s: any) => s.severity === "high").length;
  return { high, total: signals.length };
}

function getGateStatus() {
  const gate = readKey("dk-stage0-gate");
  if (!gate) return { status: "pending", passed: 0, total: 7 };
  const criteria = gate.criteria || [];
  const passed = criteria.filter((c: any) => c.met).length;
  return {
    status: passed === criteria.length ? "ready" : passed > criteria.length / 2 ? "review" : "pending",
    passed,
    total: criteria.length || 7
  };
}

function getAssumptionStats() {
  const assumptions = readKey("dk-stage0-assumptions");
  if (!assumptions || !assumptions.items) return { total: 0, highRisk: 0 };
  const items = assumptions.items || [];
  const highRisk = items.filter((a: any) => a.risk === "high").length;
  return { total: items.length, highRisk };
}

function getForcesNet() {
  const forces = readKey("dk-stage0-forces");
  if (!forces) return { net: 0 };
  const pushing = (forces.pushing || []).length;
  const pulling = (forces.pulling || []).length;
  return { net: pushing - pulling };
}

export function getTelemetry(): TelemetryData {
  return {
    confidence: getConfidenceScore(),
    timer: getTimerDays(),
    radar: getRadarStats(),
    frameworks: getFrameworkStats(),
    gate: getGateStatus(),
    assumptions: getAssumptionStats(),
    forces: getForcesNet()
  };
}
