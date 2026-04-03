/**
 * situationRoomData.js — Intent Taxonomy for Situation Room v1
 * 11 predefined PM scenarios (8 original + 3 new).
 * Covers Stages 0-3 frameworks.
 * No AI dependency — pure static mapping.
 * Phase B (Jun/Jul): Claude API replaces matchIntent() with context-aware classification.
 */

export const INTENTS = {
  new_feature: {
    label: "New Feature",
    icon: "✨",
    description: "Adding a new capability to an existing product",
    keywords: ["feature", "add", "build", "capability", "functionality", "enhancement", "new", "ship"],
    questions: [
      { id: "nf_q1", text: "Who is this for, and what behavior changes?", stages: [0], frameworks: ["forces_of_progress", "mom_test", "value_proposition"], artifact: { name: "Customer segment definition", audience: "Team" } },
      { id: "nf_q2", text: "What alternatives exist today, and why would users switch?", stages: [0], frameworks: ["competing_against", "strategy_canvas"], artifact: { name: "Competitive positioning brief", audience: "Stakeholders" } },
      { id: "nf_q3", text: "How does this align with your current North Star metric?", stages: [1], frameworks: ["north_star", "metric_map", "okr"], artifact: { name: "Strategic alignment check", audience: "Leadership" } },
    ],
    recommended_path: [0, 1],
  },

  new_market: {
    label: "New Market",
    icon: "🌍",
    description: "Entering a new geography, segment, or vertical",
    keywords: ["market", "expand", "geography", "segment", "international", "vertical", "enter", "launch"],
    questions: [
      { id: "nm_q1", text: "Is the problem you solve universal, or does it change in this market?", stages: [0], frameworks: ["mom_test", "assumption_tracker", "pestle"], artifact: { name: "Market-problem fit assessment", audience: "Leadership" } },
      { id: "nm_q2", text: "Who are the incumbents, and what's their unfair advantage?", stages: [0], frameworks: ["competitive_matrix", "competing_against"], artifact: { name: "Competitive landscape map", audience: "Stakeholders" } },
      { id: "nm_q3", text: "What's your beachhead — the first segment you can dominate?", stages: [0, 2], frameworks: ["tam_calculator", "beachhead", "bmc"], artifact: { name: "Beachhead market brief", audience: "Leadership" } },
      { id: "nm_q4", text: "What regulatory or cultural barriers could block entry?", stages: [1], frameworks: ["pestle", "assumption_tracker"], artifact: { name: "Market entry risk register", audience: "Leadership" } },
    ],
    recommended_path: [0, 1, 2],
  },

  pricing_change: {
    label: "Pricing Change",
    icon: "💰",
    description: "Changing pricing model, adding tiers, or adjusting monetization",
    keywords: ["pricing", "monetization", "subscription", "tier", "freemium", "revenue", "charge", "price", "monetize"],
    questions: [
      { id: "pc_q1", text: "What value does the user get that justifies the price change?", stages: [0], frameworks: ["value_proposition", "forces_of_progress"], artifact: { name: "Value-price alignment document", audience: "Team" } },
      { id: "pc_q2", text: "What breaks in your current model if this succeeds?", stages: [1], frameworks: ["bmc", "v2mom"], artifact: { name: "Revenue sensitivity model", audience: "Leadership" } },
      { id: "pc_q3", text: "How will competitors respond, and can you defend the position?", stages: [0, 1], frameworks: ["competing_against", "strategy_canvas"], artifact: { name: "Competitive response playbook", audience: "Stakeholders" } },
    ],
    recommended_path: [0, 1],
  },

  pivot: {
    label: "Pivot",
    icon: "🔄",
    description: "Fundamentally changing direction — new problem, new segment, or new approach",
    keywords: ["pivot", "change direction", "restart", "rethink", "fundamentally", "wrong", "failed", "not working"],
    questions: [
      { id: "pv_q1", text: "What evidence told you the current direction is wrong?", stages: [0], frameworks: ["mom_test", "assumption_tracker", "decision_gate"], artifact: { name: "Pivot rationale document", audience: "Leadership" } },
      { id: "pv_q2", text: "What do you keep, and what do you throw away?", stages: [0, 1], frameworks: ["swot", "value_proposition", "v2mom"], artifact: { name: "Asset audit — keep vs kill", audience: "Team" } },
      { id: "pv_q3", text: "Is the new direction validated, or are you pivoting into another hypothesis?", stages: [0], frameworks: ["forces_of_progress", "kano", "tam_calculator"], artifact: { name: "New hypothesis validation plan", audience: "Stakeholders" } },
    ],
    recommended_path: [0],
  },

  scale: {
    label: "Scale",
    icon: "🚀",
    description: "Growing what's working — more users, more markets, more capacity",
    keywords: ["scale", "grow", "growth", "expand", "more users", "bigger", "accelerate", "10x"],
    questions: [
      { id: "sc_q1", text: "What's your evidence that this is ready to scale vs. still being validated?", stages: [0], frameworks: ["mom_test", "assumption_tracker"], artifact: { name: "Scale readiness assessment", audience: "Leadership" } },
      { id: "sc_q2", text: "What breaks first when you 10x — people, process, or technology?", stages: [1], frameworks: ["daci", "bmc", "okr"], artifact: { name: "Bottleneck analysis", audience: "Team" } },
      { id: "sc_q3", text: "Are your metrics still the right ones at 10x scale?", stages: [1], frameworks: ["north_star", "metric_map"], artifact: { name: "Metrics evolution brief", audience: "Stakeholders" } },
    ],
    recommended_path: [0, 1],
  },

  competitive_response: {
    label: "Competitive Response",
    icon: "⚔️",
    description: "A competitor made a move and you need to decide how to respond",
    keywords: ["competitor", "competitive", "response", "threat", "launched", "copied", "undercut", "rival"],
    questions: [
      { id: "cr_q1", text: "Is this a real threat to your core users, or a distraction?", stages: [0], frameworks: ["competing_against", "competitive_matrix", "forces_of_progress"], artifact: { name: "Threat assessment brief", audience: "Leadership" } },
      { id: "cr_q2", text: "Does responding require changing your strategy, or just your tactics?", stages: [1], frameworks: ["v2mom", "strategy_canvas"], artifact: { name: "Strategic vs tactical response plan", audience: "Stakeholders" } },
      { id: "cr_q3", text: "What's your unfair advantage that they can't copy in 6 months?", stages: [0, 1], frameworks: ["swot", "value_proposition"], artifact: { name: "Moat analysis", audience: "Leadership" } },
    ],
    recommended_path: [0, 1],
  },

  cost_reduction: {
    label: "Cost Reduction",
    icon: "✂️",
    description: "Cutting costs, removing features, or simplifying the product",
    keywords: ["cost", "reduce", "cut", "simplify", "remove", "deprecate", "sunset", "budget", "lean"],
    questions: [
      { id: "cd_q1", text: "Which features are actually used, and by whom?", stages: [0], frameworks: ["kano", "mom_test"], artifact: { name: "Feature usage audit", audience: "Team" } },
      { id: "cd_q2", text: "What's the switching cost for users who lose a feature?", stages: [0], frameworks: ["forces_of_progress", "competing_against"], artifact: { name: "Migration risk assessment", audience: "Stakeholders" } },
      { id: "cd_q3", text: "Does this simplification align with or contradict your strategy?", stages: [1], frameworks: ["v2mom", "north_star"], artifact: { name: "Cost-strategy alignment check", audience: "Leadership" } },
    ],
    recommended_path: [0, 1],
  },

  platform_play: {
    label: "Platform Play",
    icon: "🏗",
    description: "Building a platform, ecosystem, or marketplace on top of your product",
    keywords: ["platform", "ecosystem", "marketplace", "api", "third-party", "developer", "integration"],
    questions: [
      { id: "pp_q1", text: "Do you have enough single-player value before adding multiplayer?", stages: [0], frameworks: ["mom_test", "value_proposition", "forces_of_progress"], artifact: { name: "Single-player value assessment", audience: "Team" } },
      { id: "pp_q2", text: "What's the chicken-and-egg problem, and how do you solve it?", stages: [0, 1], frameworks: ["assumption_tracker", "competing_against", "bmc"], artifact: { name: "Network effects bootstrap plan", audience: "Leadership" } },
      { id: "pp_q3", text: "What does the business model look like at platform scale?", stages: [1], frameworks: ["bmc", "tam_calculator", "okr"], artifact: { name: "Platform economics model", audience: "Stakeholders" } },
    ],
    recommended_path: [0, 1],
  },

  // ── NEW INTENTS (Sprint 6) ──

  validate_test: {
    label: "Validate / Test",
    icon: "🧪",
    description: "Testing an idea, assumption, or hypothesis before committing resources",
    keywords: ["validate", "test", "experiment", "hypothesis", "prove", "disprove", "evidence", "research", "interview", "survey", "pretotype"],
    questions: [
      { id: "vt_q1", text: "What specific assumption are you testing, and what would disprove it?", stages: [2], frameworks: ["assumption_map", "hypothesis_template"], artifact: { name: "Hypothesis card with success criteria", audience: "Team" } },
      { id: "vt_q2", text: "What's the cheapest, fastest way to get a signal?", stages: [2], frameworks: ["dvuf", "hypothesis_template"], artifact: { name: "Experiment design", audience: "Team" } },
      { id: "vt_q3", text: "What behavioral signal would confirm users actually want this?", stages: [2], frameworks: ["signal_tracker", "mom_test"], artifact: { name: "Behavioral signal definition", audience: "Team" } },
      { id: "vt_q4", text: "Is this a design hypothesis or a business hypothesis?", stages: [2, 3], frameworks: ["ux_hypothesis", "assumption_map"], artifact: { name: "Hypothesis classification", audience: "Team" } },
    ],
    recommended_path: [2],
  },

  stress_test: {
    label: "Stress Test / Devil's Advocate",
    icon: "🔥",
    description: "Challenge your own thinking — find the holes before someone else does",
    keywords: ["stress test", "devil's advocate", "challenge", "poke holes", "critique", "invalidate", "wrong", "weak", "risk", "pre-mortem", "first principles"],
    questions: [
      { id: "st_q1", text: "What's the single assumption that, if wrong, kills the entire plan?", stages: [0, 2], frameworks: ["assumption_tracker", "assumption_map"], artifact: { name: "Fatal assumption identification", audience: "Team" } },
      { id: "st_q2", text: "If this fails in 12 months, what was the most likely cause?", stages: [0, 2, 3], frameworks: ["decision_gate", "stage2_gate", "stage3_gate"], artifact: { name: "Pre-mortem analysis", audience: "Leadership" } },
      { id: "st_q3", text: "What evidence would make you kill this right now?", stages: [0], frameworks: ["decision_gate", "forces_of_progress"], artifact: { name: "Kill criteria definition", audience: "Stakeholders" } },
      { id: "st_q4", text: "Are you building this because the data says to, or because you want to?", stages: [0, 1], frameworks: ["mom_test", "assumption_tracker", "v2mom"], artifact: { name: "Confirmation bias audit", audience: "Team" } },
    ],
    recommended_path: [0],
  },

  design_ux: {
    label: "Design / UX",
    icon: "✏️",
    description: "Working on user experience, prototyping, or usability testing",
    keywords: ["design", "ux", "ui", "prototype", "wireframe", "usability", "user experience", "user interface", "figma", "mockup", "user testing", "journey"],
    questions: [
      { id: "dx_q1", text: "What JTBD is this design solving, and how will you measure success?", stages: [3], frameworks: ["ux_hypothesis", "journey_map"], artifact: { name: "Design brief with success criteria", audience: "Team" } },
      { id: "dx_q2", text: "What's the minimum fidelity needed to test your riskiest UX assumption?", stages: [3], frameworks: ["prototype_spec", "usability_test"], artifact: { name: "Prototype scope definition", audience: "Team" } },
      { id: "dx_q3", text: "What's the user flow from entry to success?", stages: [3], frameworks: ["userflow_ia", "journey_map"], artifact: { name: "User flow diagram", audience: "Team" } },
    ],
    recommended_path: [3],
  },
};

// Framework display names — includes Stage 2 + 3 frameworks
export const FRAMEWORK_NAMES = {
  forces_of_progress: "Forces of Progress",
  mom_test: "Mom Test Synthesizer",
  value_proposition: "Value Proposition",
  competing_against: "Competing Against Map",
  strategy_canvas: "Strategy Canvas",
  competitive_matrix: "Competitive Matrix",
  assumption_tracker: "Assumption Tracker",
  swot: "SWOT Analysis",
  tam_calculator: "TAM/SAM/SOM",
  kano: "Kano Model",
  decision_gate: "Decision Gate (Stage 0)",
  pestle: "PESTLE Analysis",
  v2mom: "V2MOM",
  bmc: "Business Model Canvas",
  north_star: "North Star Selector",
  metric_map: "Input/Output Metric Map",
  okr: "OKR Builder",
  daci: "DACI Framework",
  vision_test: "Vision Clarity Test",
  // Stage 2
  jtbd: "JTBD Canvas",
  rice: "RICE Calculator",
  rww: "RWW Enhanced",
  dvuf: "DVUF Planner",
  beachhead: "Beachhead Market",
  ost: "Opportunity Solution Tree",
  assumption_map: "Assumption Map",
  signal_tracker: "Behavioral Signal Tracker",
  hypothesis_template: "Hypothesis Template",
  multi_perspective: "Multi-Perspective Review",
  stage2_gate: "Decision Gate (Stage 2)",
  // Stage 3
  journey_map: "Customer Journey Map",
  userflow_ia: "User Flow & IA Mapper",
  ux_hypothesis: "UX Hypothesis Canvas",
  prototype_spec: "Prototype Spec",
  usability_test: "Usability Test Plan",
  stage3_gate: "Decision Gate (Stage 3)",
  // Stage 4
  living_brief: "Living Brief Engine",
  roadmap: "Roadmap",
  daci_exec: "DACI (Execution)",
  okr_exec: "OKRs (Execution)",
  dependency_map: "Dependency Map",
  user_stories: "User Stories",
  acceptance_criteria: "Acceptance Criteria",
  stage4_gate: "Decision Gate (Stage 4)",
  // Stage 5
  beachhead_exec: "Beachhead Execution Plan",
  mvp_scope: "MVP Scope Definition",
  launch_metrics: "Launch Metrics Dashboard",
  feedback_loops: "Feedback Loop Planner",
  kill_criteria_5: "Kill Criteria",
  stage5_gate: "Decision Gate (Stage 5)",
  // Stage 6
  performance_dash: "Performance Dashboard",
  expansion_seq: "Expansion Sequencing",
  unit_economics: "Unit Economics at Scale",
  competitive_response: "Competitive Response Tracker",
  experiment_log: "A/B Test & Experiment Log",
  stage6_gate: "Decision Gate (Stage 6)",
  // Stage 7
  health_monitor: "Performance Health Monitor",
  feature_deprecation: "Feature Deprecation Audit",
  competitive_active: "Competitive Landscape (Active)",
  satisfaction_tracker: "User Satisfaction Tracker",
  refresh_strategy: "Retraining / Refresh Strategy",
  stage7_gate: "Decision Gate (Stage 7)",
  // Stage 8
  portfolio_alloc: "Portfolio Allocation View",
  opportunity_cost: "Opportunity Cost Analysis",
  kill_criteria_8: "Strategic Kill Criteria",
  investment_horizon: "Investment Horizon",
  org_impact: "Organizational Impact Assessment",
  stage8_gate: "Decision Gate (Stage 8)",
};

// Framework routes — includes Stage 2 + 3 routes
export const FRAMEWORK_ROUTES = {
  forces_of_progress: "#/stage0/forces",
  mom_test: "#/stage0/momtest",
  value_proposition: "#/stage0/value-prop",
  competing_against: "#/stage0/competing",
  strategy_canvas: "#/stage0/canvas",
  competitive_matrix: "#/stage0/competitive",
  assumption_tracker: "#/stage0/assumptions",
  swot: "#/stage0/swot",
  tam_calculator: "#/stage0/tam",
  kano: "#/stage0/kano",
  decision_gate: "#/stage0/brief",
  pestle: "#/stage1/pestle",
  v2mom: "#/stage1/v2mom",
  bmc: "#/stage1/bmc",
  north_star: "#/stage1/north-star",
  metric_map: "#/stage1/metric-map",
  okr: "#/stage1/okr",
  daci: "#/stage1/daci",
  vision_test: "#/stage1/vision-test",
  // Stage 2
  jtbd: "#/stage2/jtbd",
  rice: "#/stage2/rice",
  rww: "#/stage2/rww",
  dvuf: "#/stage2/dvuf",
  beachhead: "#/stage2/beachhead",
  ost: "#/stage2/ost",
  assumption_map: "#/stage2/assumptions",
  signal_tracker: "#/stage2/signals",
  hypothesis_template: "#/stage2/hypothesis",
  multi_perspective: "#/stage2/multi-perspective",
  stage2_gate: "#/stage2/gate",
  // Stage 3
  journey_map: "#/stage3/journey",
  userflow_ia: "#/stage3/userflow",
  ux_hypothesis: "#/stage3/ux-hypothesis",
  prototype_spec: "#/stage3/prototype",
  usability_test: "#/stage3/usability",
  stage3_gate: "#/stage3/gate",
  // Stage 4
  living_brief: "#/stage4/brief",
  roadmap: "#/stage4/roadmap",
  daci_exec: "#/stage4/daci",
  okr_exec: "#/stage4/okr",
  dependency_map: "#/stage4/dependencies",
  user_stories: "#/stage4/stories",
  acceptance_criteria: "#/stage4/acceptance",
  stage4_gate: "#/stage4/gate",
  // Stage 5
  beachhead_exec: "#/stage5/beachhead",
  mvp_scope: "#/stage5/mvp",
  launch_metrics: "#/stage5/metrics",
  feedback_loops: "#/stage5/feedback",
  kill_criteria_5: "#/stage5/kill",
  stage5_gate: "#/stage5/gate",
  // Stage 6
  performance_dash: "#/stage6/performance",
  expansion_seq: "#/stage6/expansion",
  unit_economics: "#/stage6/economics",
  competitive_response: "#/stage6/competitive",
  experiment_log: "#/stage6/experiments",
  stage6_gate: "#/stage6/gate",
  // Stage 7
  health_monitor: "#/stage7/health",
  feature_deprecation: "#/stage7/deprecation",
  competitive_active: "#/stage7/competitive",
  satisfaction_tracker: "#/stage7/satisfaction",
  refresh_strategy: "#/stage7/refresh",
  stage7_gate: "#/stage7/gate",
  // Stage 8
  portfolio_alloc: "#/stage8/portfolio",
  opportunity_cost: "#/stage8/opportunity",
  kill_criteria_8: "#/stage8/kill-criteria",
  investment_horizon: "#/stage8/horizon",
  org_impact: "#/stage8/impact",
  stage8_gate: "#/stage8/gate",
};

// Stage metadata — includes Stages 2 + 3
export const STAGE_NAMES = {
  0: "Problem Validator",
  1: "Strategy Architect",
  2: "Opportunity Scout",
  3: "Design & MVP",
  4: "Planning & Roadmap",
  5: "Build & Ship",
  6: "Scale & Optimize",
  7: "Maturity & Maintenance",
  8: "Portfolio & Investment",
};

export const STAGE_COLORS = {
  0: "#E74C3C",
  1: "#E67E22",
  2: "#F1C40F",
  3: "#2ECC71",
  4: "#3498DB",
  5: "#9B59B6",
  6: "#1ABC9C",
  7: "#C0392B",
  8: "#34495E",
};

// Improved keyword matching for v1 — scores multi-word matches higher
export function matchIntent(input) {
  if (!input || !input.trim()) return null;
  const lower = input.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const [key, intent] of Object.entries(INTENTS)) {
    let score = 0;
    for (const kw of intent.keywords) {
      if (lower.includes(kw)) {
        // Multi-word keywords score higher (more specific)
        score += kw.split(" ").length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = key;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}
