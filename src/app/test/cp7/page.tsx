"use client";

import Link from "next/link";
import { STAGES_NAV } from "@/lib/theme";

// Complete route map from Level 1 main.jsx (95 routes total)
const ALL_ROUTES = [
  // Cockpit + Cross-cutting
  { path: "/", label: "Cockpit (Root)", stage: "Home" },
  { path: "/intelligence", label: "Intelligence Module", stage: "Cross-cutting" },
  { path: "/situation-room", label: "Situation Room", stage: "Cross-cutting" },
  
  // Stage 0 (14 routes)
  { path: "/stage/0", label: "Stage 0 Landing", stage: "Stage 0" },
  { path: "/stage/0/input", label: "Input Panel", stage: "Stage 0" },
  { path: "/stage/0/swot", label: "SWOT Analysis", stage: "Stage 0" },
  { path: "/stage/0/competitive", label: "Competitive Matrix", stage: "Stage 0" },
  { path: "/stage/0/tam", label: "TAM Calculator", stage: "Stage 0" },
  { path: "/stage/0/competing", label: "Competing Against Map", stage: "Stage 0" },
  { path: "/stage/0/assumptions", label: "Assumption Tracker", stage: "Stage 0" },
  { path: "/stage/0/kano", label: "Kano Model", stage: "Stage 0" },
  { path: "/stage/0/momtest", label: "Mom Test Synthesizer", stage: "Stage 0" },
  { path: "/stage/0/value-prop", label: "Value Proposition", stage: "Stage 0" },
  { path: "/stage/0/canvas", label: "Strategy Canvas", stage: "Stage 0" },
  { path: "/stage/0/forces", label: "Forces of Progress", stage: "Stage 0" },
  { path: "/stage/0/gate", label: "Decision Gate", stage: "Stage 0" },
  
  // Stage 1 (12 routes)
  { path: "/stage/1", label: "Stage 1 Landing", stage: "Stage 1" },
  { path: "/stage/1/input", label: "Input Panel", stage: "Stage 1" },
  { path: "/stage/1/v2mom", label: "V2MOM", stage: "Stage 1" },
  { path: "/stage/1/strategy-canvas", label: "Product Strategy Canvas", stage: "Stage 1" },
  { path: "/stage/1/bmc", label: "Business Model Canvas", stage: "Stage 1" },
  { path: "/stage/1/pestle", label: "PESTLE Analysis", stage: "Stage 1" },
  { path: "/stage/1/north-star", label: "North Star Selector", stage: "Stage 1" },
  { path: "/stage/1/metric-map", label: "Metric Map", stage: "Stage 1" },
  { path: "/stage/1/okr", label: "OKR Builder", stage: "Stage 1" },
  { path: "/stage/1/daci", label: "DACI", stage: "Stage 1" },
  { path: "/stage/1/vision-test", label: "Vision Clarity Test", stage: "Stage 1" },
  { path: "/stage/1/gate", label: "Decision Gate", stage: "Stage 1" },
  
  // Stage 2 (13 routes)
  { path: "/stage/2", label: "Stage 2 Landing", stage: "Stage 2" },
  { path: "/stage/2/input", label: "Input Panel", stage: "Stage 2" },
  { path: "/stage/2/jtbd", label: "JTBD Canvas", stage: "Stage 2" },
  { path: "/stage/2/rww", label: "RWW Enhanced", stage: "Stage 2" },
  { path: "/stage/2/rice", label: "RICE Calculator", stage: "Stage 2" },
  { path: "/stage/2/dvuf", label: "DVUF Planner", stage: "Stage 2" },
  { path: "/stage/2/beachhead", label: "Beachhead Market", stage: "Stage 2" },
  { path: "/stage/2/ost", label: "Opportunity Solution Tree", stage: "Stage 2" },
  { path: "/stage/2/kano", label: "Kano Model", stage: "Stage 2" },
  { path: "/stage/2/assumptions", label: "Assumption Map", stage: "Stage 2" },
  { path: "/stage/2/signals", label: "Signal Tracker", stage: "Stage 2" },
  { path: "/stage/2/hypothesis", label: "Hypothesis Template", stage: "Stage 2" },
  { path: "/stage/2/multi-perspective", label: "Multi-Perspective Review", stage: "Stage 2" },
  { path: "/stage/2/gate", label: "Decision Gate", stage: "Stage 2" },
  
  // Stage 3 (7 routes)
  { path: "/stage/3", label: "Stage 3 Landing", stage: "Stage 3" },
  { path: "/stage/3/input", label: "Input Panel", stage: "Stage 3" },
  { path: "/stage/3/journey", label: "Customer Journey Map", stage: "Stage 3" },
  { path: "/stage/3/userflow", label: "User Flow & IA", stage: "Stage 3" },
  { path: "/stage/3/ux-hypothesis", label: "UX Hypothesis Canvas", stage: "Stage 3" },
  { path: "/stage/3/prototype", label: "Prototype Spec", stage: "Stage 3" },
  { path: "/stage/3/usability", label: "Usability Test Plan", stage: "Stage 3" },
  { path: "/stage/3/gate", label: "Decision Gate", stage: "Stage 3" },
  
  // Stage 4 (9 routes)
  { path: "/stage/4", label: "Stage 4 Landing", stage: "Stage 4" },
  { path: "/stage/4/input", label: "Input Panel", stage: "Stage 4" },
  { path: "/stage/4/brief", label: "Living Brief", stage: "Stage 4" },
  { path: "/stage/4/roadmap", label: "Roadmap", stage: "Stage 4" },
  { path: "/stage/4/daci", label: "DACI", stage: "Stage 4" },
  { path: "/stage/4/okr", label: "OKRs", stage: "Stage 4" },
  { path: "/stage/4/dependencies", label: "Dependency Map", stage: "Stage 4" },
  { path: "/stage/4/stories", label: "User Stories", stage: "Stage 4" },
  { path: "/stage/4/acceptance", label: "Acceptance Criteria", stage: "Stage 4" },
  { path: "/stage/4/gate", label: "Decision Gate", stage: "Stage 4" },
  
  // Stage 5 (7 routes)
  { path: "/stage/5", label: "Stage 5 Landing", stage: "Stage 5" },
  { path: "/stage/5/input", label: "Input Panel", stage: "Stage 5" },
  { path: "/stage/5/beachhead", label: "Beachhead Execution", stage: "Stage 5" },
  { path: "/stage/5/mvp", label: "MVP Scope", stage: "Stage 5" },
  { path: "/stage/5/metrics", label: "Launch Metrics", stage: "Stage 5" },
  { path: "/stage/5/feedback", label: "Feedback Loops", stage: "Stage 5" },
  { path: "/stage/5/kill", label: "Kill Criteria", stage: "Stage 5" },
  { path: "/stage/5/gate", label: "Decision Gate", stage: "Stage 5" },
  
  // Stage 6 (7 routes)
  { path: "/stage/6", label: "Stage 6 Landing", stage: "Stage 6" },
  { path: "/stage/6/input", label: "Input Panel", stage: "Stage 6" },
  { path: "/stage/6/performance", label: "Performance", stage: "Stage 6" },
  { path: "/stage/6/economics", label: "Unit Economics", stage: "Stage 6" },
  { path: "/stage/6/expansion", label: "Expansion", stage: "Stage 6" },
  { path: "/stage/6/competitive", label: "Competitive Response", stage: "Stage 6" },
  { path: "/stage/6/experiments", label: "Experiments", stage: "Stage 6" },
  { path: "/stage/6/gate", label: "Decision Gate", stage: "Stage 6" },
  
  // Stage 7 (7 routes)
  { path: "/stage/7", label: "Stage 7 Landing", stage: "Stage 7" },
  { path: "/stage/7/input", label: "Input Panel", stage: "Stage 7" },
  { path: "/stage/7/health", label: "Health Monitor", stage: "Stage 7" },
  { path: "/stage/7/satisfaction", label: "Satisfaction", stage: "Stage 7" },
  { path: "/stage/7/deprecation", label: "Feature Deprecation", stage: "Stage 7" },
  { path: "/stage/7/competitive", label: "Competitive Landscape", stage: "Stage 7" },
  { path: "/stage/7/refresh", label: "Refresh Strategy", stage: "Stage 7" },
  { path: "/stage/7/gate", label: "Decision Gate", stage: "Stage 7" },
  
  // Stage 8 (7 routes)
  { path: "/stage/8", label: "Stage 8 Landing", stage: "Stage 8" },
  { path: "/stage/8/input", label: "Input Panel", stage: "Stage 8" },
  { path: "/stage/8/portfolio", label: "Portfolio Allocation", stage: "Stage 8" },
  { path: "/stage/8/opportunity", label: "Opportunity Cost", stage: "Stage 8" },
  { path: "/stage/8/kill-criteria", label: "Kill Criteria", stage: "Stage 8" },
  { path: "/stage/8/horizon", label: "Investment Horizon", stage: "Stage 8" },
  { path: "/stage/8/impact", label: "Org Impact", stage: "Stage 8" },
  { path: "/stage/8/gate", label: "Decision Gate", stage: "Stage 8" },
];

export default function CP7TestPage() {
  const routesByStage = ALL_ROUTES.reduce((acc, route) => {
    if (!acc[route.stage]) acc[route.stage] = [];
    acc[route.stage].push(route);
    return acc;
  }, {} as Record<string, typeof ALL_ROUTES>);

  const stageOrder = ["Home", "Cross-cutting", ...Array.from({ length: 9 }, (_, i) => `Stage ${i}`)];

  return (
    <div style={{ minHeight: "100vh", background: "#F4F6F8", padding: "40px 24px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#1B2631", marginBottom: 8 }}>
          CP7 Route Verification
        </h1>
        <p style={{ fontSize: 14, color: "#5D6D7E", marginBottom: 32 }}>
          All {ALL_ROUTES.length} routes from Level 1 → Level 2 mapping. Click each to verify rendering.
        </p>

        {stageOrder.map(stageName => {
          const routes = routesByStage[stageName];
          if (!routes) return null;

          return (
            <div key={stageName} style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1B2631", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                {stageName}
                <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#95A5A6", fontWeight: 500 }}>
                  {routes.length} routes
                </span>
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
                {routes.map(route => (
                  <Link
                    key={route.path}
                    href={route.path}
                    style={{
                      display: "block",
                      padding: "12px 14px",
                      background: "#FFFFFF",
                      border: "1px solid #E8EAED",
                      borderRadius: 8,
                      textDecoration: "none",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = "#1B9C85";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "#E8EAED";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1B2631", marginBottom: 2 }}>
                      {route.label}
                    </div>
                    <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#95A5A6" }}>
                      {route.path}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
