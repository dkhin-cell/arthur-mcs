# Arthur MCS — Supernova-Inspired Feature Specs

**Version:** 1.0.0  
**Author:** Claude (CTO Advisor) + DK  
**Date:** March 29, 2026  
**Origin:** Competitive analysis of Supernova.io — patterns worth adopting, reframed for Arthur's methodology-first architecture.  
**Status:** Spec ready. Not yet in sprint backlog.

---

## Priority & Sizing Summary

| # | Feature | Priority | Size | Value | Sprint Target | Dependency |
|---|---------|----------|------|-------|---------------|------------|
| **#1** | Mission Brief (Situation Room Context) | **P0** | Small (1 component + 1 utility) | Makes Situation Room stage-aware instead of stage-blind | Sprint 3 (with SR v0) | Scoped key prefixes from Permission-Ready spec |
| **#4** | Document Import (Framework Auto-Population) | **P1** | Medium (Phase A: parser. Phase B: Claude API) | Eliminates cold-start for Stage 1+. Accelerates VT data availability | Phase A: Sprint 2 polish. Phase B: Jun/Jul with Claude API | Stage 1 field schema finalized |
| **#5** | Evidence Propagation Principle | **P2** | Zero code (design principle documentation) | Sharpens positioning. Codifies what carry-forward already does | Immediate (add to specs) | None |

---

# Spec #5: Evidence Propagation Principle

**Priority: P2 — Design Principle (Zero Code)**

## 5.1 What This Is

This is not a feature. It is a design principle that codifies what Arthur's carry-forward and gate system already enforces, and gives it a name for positioning and internal reference.

## 5.2 The Principle

> **Evidence Propagation Rule:** No stage may generate outputs that contradict validated conclusions from prior stages. The system structurally enforces consistency — downstream stages inherit and build upon upstream evidence, never override it without an explicit gate decision.

In practice this means:

- If Stage 0 KILLs "enterprise segment" as a target user, Stage 1 frameworks cannot include enterprise-focused strategy without first returning to Stage 0 and reversing the decision through the gate.
- If Stage 1 declares "We will NOT build a super-app" in the What NOT to Do field, Stage 3 design prototyping cannot include super-app features without a Stage 1 gate revision.
- Carry-forward is the enforcement mechanism. Items selected for carry-forward are read-only constraints in the receiving stage. They can be viewed, referenced, and built upon — but not silently edited.

## 5.3 Why This Matters for Positioning

The anti-ChatPRD message becomes: "ChatPRD generates a beautiful document for an idea nobody validated. Arthur won't even let you open Stage 2 until Stage 0 and Stage 1 evidence supports it."

More precisely: "Arthur's system is grounded in your validated evidence. It can't recommend what your own data killed."

This is the same principle Supernova uses with design tokens (AI can only generate prototypes using real components from the system), translated to PM methodology (the system can only advance work that builds on validated evidence from prior stages).

## 5.4 Where to Document

Add to the following specs as a named principle:

1. **Technical Spec (Stage 0-2 MVP)** — Add to Section 1.2 "Design Principles" as a new row:

```
| Evidence Propagation | Downstream stages inherit upstream conclusions as constraints. 
Carry-forward items are read-only in receiving stages. Contradicting 
a prior stage's validated output requires returning to that stage 
and revising the gate decision. |
```

2. **Agent Brief** — Add under "Key Decisions":

```
- Evidence Propagation Rule: No stage generates outputs that contradict 
  validated prior-stage conclusions. Carry-forward items are read-only 
  constraints. Reversing an upstream conclusion requires reopening that 
  stage's gate.
```

3. **Playbook V3** — Carter should reference this in the "Why 9 Stages" rationale section as a differentiator vs. flat-methodology approaches (Lean Startup, Double Diamond) that have no structural enforcement of evidence consistency.

## 5.5 Future Enforcement (Not for Now)

When Claude API is integrated (Jun/Jul), any AI-generated framework content (OKRs, PRD, research synthesis) should be prompted with carry-forward constraints from prior stages. The system prompt template includes:

```
"The following conclusions have been validated and must not be contradicted:
- Stage 0 verdict: {verdict}
- Target user: {target_segment}  
- JTBD: {jtbd}
- What we are NOT solving: {not_solving}
- Strategy: {how_to_win}

Generate your output consistent with these constraints. 
Flag any tension explicitly rather than silently overriding."
```

This is not a current build item. It's an architectural note for the Claude API integration sprint.

---

# Spec #1: Mission Brief (Situation Room Project Context)

**Priority: P0 — Ships with Situation Room v0 (Sprint 3)**

## 1.1 Problem Statement

Situation Room v0 plans to route PM intents to stages, frameworks, and artifacts. But it routes blind — it doesn't know what stage the PM is in, what their confidence score is, what Radar alerts are active, or what gaps exist. This means routing is generic rather than contextual.

Supernova solved this for their prototyping tool: every AI session starts with the team's full design system context pre-loaded. Arthur should do the same — every Situation Room session starts with a Mission Brief that reflects the PM's current evidence state.

## 1.2 What It Does

The Mission Brief is a persistent, auto-updating card displayed at the top of the Situation Room panel. It aggregates data from all three cross-cutting modules and the active stage into a single snapshot. The PM never fills it out — it assembles itself from localStorage.

## 1.3 Data Sources

| Mission Brief Field | localStorage Source | Key (using Permission-Ready convention) |
|---|---|---|
| Active Stage | Scan all stage keys for latest `in_progress` status | `project:{id}:stage:{n}:gate` — find highest stage without a gate decision |
| Active Stage Completion | Count populated frameworks vs. total frameworks for active stage | `project:{id}:stage:{n}:framework:*` — count non-null keys |
| Stage 0 Verdict | Stage 0 gate decision | `project:{id}:stage:0:gate` → `.decision` |
| Confidence Score | VT ConfidenceMeter | `project:{id}:module:vt:confidence` → `.score` |
| Confidence Trend | Compare current score to score at last gate decision | `project:{id}:module:vt:confidence` vs. `project:{id}:stage:{n-1}:gate` → `.evidenceSnapshot.confidenceScore` |
| Stage Timer | VT StageTimer | `project:{id}:module:vt:stage_timer` → `.dayCount`, `.threshold` |
| Critical Gaps | VT readiness criteria with status `fail` or `partial` | `project:{id}:module:vt:readiness` → filter by `.status !== 'pass'` |
| Radar Alerts | Count high-severity Radar signals | `project:{id}:module:radar:signals` → filter by `.severity === 'high'` |
| Open Assumptions | Assumptions with status `untested` from Assumption Tracker | `project:{id}:stage:{n}:framework:assumption_map` → filter by `.status === 'untested'` |

## 1.4 Display Spec

```
┌──────────────────────────────────────────────────┐
│  MISSION BRIEF                          [auto]   │
│                                                   │
│  Active Stage: Stage 1 (Strategy Architect)       │
│  Completion:   ████████░░  7/10 frameworks        │
│                                                   │
│  Stage 0 Verdict:    GO ✓                         │
│  Confidence Score:   72 ■■■■■■■░░░  (amber)       │
│  Trend:              ↓ from 78 at Stage 0 gate    │
│  Stage Timer:        Day 14 / 21  (amber)         │
│                                                   │
│  ⚠ Critical Gaps (2):                             │
│    • AV strategy undefined                        │
│    • AI differentiation not validated              │
│                                                   │
│  🔴 Radar Alerts: 3 high-severity                 │
│    • Grab $300M funding                           │
│    • Grab × Anthropic partnership                 │
│    • Grab × Rivian AV pilot                       │
│                                                   │
│  📋 Untested Assumptions: 4                       │
└──────────────────────────────────────────────────┘
```

## 1.5 Component Architecture

**File:** `src/components/MissionBrief.jsx`

```javascript
// Pseudocode — actual implementation follows v6 component patterns

import { getKeysForProject, moduleKey, frameworkKey } from '../utils/storageKeys';

function MissionBrief({ projectId }) {
  // Auto-assemble from localStorage on mount + interval refresh
  const briefData = useMissionBriefData(projectId);

  return (
    <div className="mission-brief-card">
      <div className="brief-header">MISSION BRIEF</div>
      
      <div className="brief-section">
        <ActiveStageDisplay 
          stage={briefData.activeStage} 
          completion={briefData.completion} 
        />
      </div>

      <div className="brief-section">
        <ConfidenceDisplay 
          score={briefData.confidenceScore}
          trend={briefData.confidenceTrend}
          stageTimer={briefData.stageTimer}
        />
      </div>

      {briefData.criticalGaps.length > 0 && (
        <div className="brief-section brief-warning">
          <GapsList gaps={briefData.criticalGaps} />
        </div>
      )}

      {briefData.radarAlerts.length > 0 && (
        <div className="brief-section brief-alert">
          <RadarAlertsSummary alerts={briefData.radarAlerts} />
        </div>
      )}

      <div className="brief-section">
        <AssumptionCount count={briefData.untestedAssumptions} />
      </div>
    </div>
  );
}
```

**Data hook:** `src/hooks/useMissionBriefData.js`

```javascript
function useMissionBriefData(projectId) {
  const [data, setData] = useState(null);

  useEffect(() => {
    function assemble() {
      // 1. Find active stage (highest stage without completed gate)
      const activeStage = findActiveStage(projectId);

      // 2. Calculate completion for active stage
      const completion = calculateStageCompletion(projectId, activeStage);

      // 3. Read Stage 0 verdict
      const stage0Gate = readGate(projectId, 0);

      // 4. Read VT data
      const vtConfidence = readModule(projectId, 'vt', 'confidence');
      const vtTimer = readModule(projectId, 'vt', 'stage_timer');
      const vtReadiness = readModule(projectId, 'vt', 'readiness');

      // 5. Read Radar alerts
      const radarSignals = readModule(projectId, 'radar', 'signals');
      const highAlerts = (radarSignals?.signals || [])
        .filter(s => s.severity === 'high');

      // 6. Read untested assumptions from active stage
      const assumptions = readFramework(projectId, activeStage, 'assumption_map');
      const untested = (assumptions?.items || [])
        .filter(a => a.status === 'untested');

      // 7. Calculate confidence trend
      const prevGate = readGate(projectId, activeStage - 1);
      const prevConfidence = prevGate?.evidenceSnapshot?.confidenceScore || null;

      // 8. Extract critical gaps from readiness criteria
      const gaps = (vtReadiness?.criteria || [])
        .filter(c => c.status === 'fail' || c.status === 'partial')
        .map(c => c.description);

      setData({
        activeStage,
        completion,
        stage0Verdict: stage0Gate?.decision || null,
        confidenceScore: vtConfidence?.score || null,
        confidenceTrend: prevConfidence 
          ? { direction: vtConfidence?.score > prevConfidence ? 'up' : 'down', from: prevConfidence }
          : null,
        stageTimer: vtTimer || null,
        criticalGaps: gaps,
        radarAlerts: highAlerts,
        untestedAssumptions: untested.length,
      });
    }

    assemble();
    // Refresh every 30 seconds (catches Radar updates, VT recalculations)
    const interval = setInterval(assemble, 30000);
    return () => clearInterval(interval);
  }, [projectId]);

  return data;
}
```

## 1.6 Integration with Situation Room v0 Intent Routing

The Mission Brief doesn't just display — it **modifies routing behavior.** When a PM selects a predefined intent, the Situation Room routing logic reads the Mission Brief data to filter and prioritize its response.

**Routing rules that use Mission Brief data:**

| Condition | Routing Modification |
|---|---|
| Active stage < intent's target stage | Intercept: "You haven't completed [Stage X] yet. These gaps need resolution first: [gaps from brief]." Route to current stage instead. |
| Confidence score < 40 (red) | Add warning to any route: "Your evidence confidence is critically low. Consider gathering more data before acting on this." |
| Radar alerts > 0 that match intent keywords | Prepend Radar context: "This may be related to [N] active Radar alerts: [alert summaries]. Consider these when reviewing frameworks." |
| Stage 0 verdict = KILL or PIVOT | Block intents that assume a validated problem: "Stage 0 resulted in [KILL/PIVOT]. This intent assumes a validated problem space. Revisit Stage 0 first." |
| Stage Timer in red zone | Add urgency note: "You've been in Stage [N] for [X] days, past the recommended threshold. Consider whether analysis paralysis is a factor." |

## 1.7 What This Does NOT Include

- Mission Brief does not accept user input — it's read-only, auto-assembled.
- Mission Brief does not persist separately — it's computed on demand from existing data.
- Mission Brief does not require AI — it's pure localStorage reads and math.
- Mission Brief does not appear on the Cockpit — it's Situation Room only.

## 1.8 Effort Estimate

- 1 React component (`MissionBrief.jsx`)
- 1 data hook (`useMissionBriefData.js`)
- 5-8 localStorage read helpers (most already exist or are trivial)
- Routing rule modifications in Situation Room intent handler
- ~1 day implementation once Situation Room v0 shell exists

---

# Spec #4: Document Import (Framework Auto-Population)

**Priority: P1 — Phase A ships with Stage 1 polish (Sprint 2). Phase B ships Jun/Jul.**

## 4.1 Problem Statement

When a PM finishes Stage 0 and opens Stage 1, they face 10 empty framework tabs. The carry-forward system passes some data (problem statement, JTBD, competitor landscape), but strategic fields like Vision Statement, Where to Play, How to Win, and What NOT to Do are blank.

Most PMs already have fragments of this thinking somewhere — a strategy doc, a pitch deck, investor notes, a Slack thread, a Google Doc. The cold-start problem slows time-to-value and delays when VT has enough data to score meaningfully.

Supernova solved this for design teams: import your Figma file and production codebase, and the system is immediately populated with real data. Arthur should do the same for PM thinking: import your existing strategy artifacts, and the system pre-fills what it can.

## 4.2 What It Does

A "Quick Import" panel at the top of any stage's Input Panel. The PM pastes unstructured text (strategy doc, pitch deck notes, competitive analysis, investor memo, Slack thread). The system extracts structured data and maps it to the stage's input fields and framework schemas.

Two phases:

- **Phase A (No AI):** Keyword-based parser that matches text patterns to fields. ~40-50% hit rate. PM reviews and corrects.
- **Phase B (Claude API):** AI-powered extraction that understands context. ~80-90% hit rate. PM reviews and confirms.

## 4.3 Phase A: Keyword Parser (Sprint 2)

### 4.3.1 UX Flow

```
1. PM opens Stage 1 Input Panel
2. Sees "Quick Import" banner at top: 
   "Paste an existing strategy doc, pitch deck, or notes to pre-fill fields."
3. Clicks "Import" → textarea expands
4. PM pastes raw text (any format, any length)
5. Clicks "Extract & Map"
6. System shows extraction results:
   - Each field: extracted value + confidence badge (HIGH/MEDIUM/LOW)
   - PM can accept, edit, or reject each extraction
   - Unmatched fields remain empty
7. PM clicks "Apply to Fields" → accepted values populate input fields
8. Quick Import panel collapses. Fields are editable as normal.
```

### 4.3.2 Parser Architecture

**File:** `src/utils/documentImport.js`

```javascript
/**
 * Extract structured fields from unstructured text.
 * Phase A: keyword-based pattern matching.
 * Phase B: replace with Claude API call.
 * 
 * @param {string} rawText      - Pasted document content
 * @param {number} targetStage  - Stage number (determines which fields to extract)
 * @returns {Array<ExtractedField>}
 */
export function extractFields(rawText, targetStage) {
  const fieldDefs = FIELD_DEFINITIONS[targetStage];
  const results = [];

  for (const fieldDef of fieldDefs) {
    const extraction = matchField(rawText, fieldDef);
    if (extraction) {
      results.push({
        fieldId: fieldDef.id,
        fieldLabel: fieldDef.label,
        extractedValue: extraction.value,
        confidence: extraction.confidence,  // 'high' | 'medium' | 'low'
        matchedPattern: extraction.pattern,  // which rule matched
        accepted: null,  // PM decides: true/false/null
      });
    }
  }

  return results;
}
```

### 4.3.3 Field Definitions per Stage

```javascript
const FIELD_DEFINITIONS = {
  // Stage 1: Strategy Architect
  1: [
    {
      id: 'vision_statement',
      label: 'Vision Statement',
      patterns: [
        { regex: /vision[:\s]+(.{20,200})/i, confidence: 'high' },
        { regex: /in\s+\d+\s+(?:months?|years?)[,\s]+(?:we|our\s+product)\s+will\s+(.{20,200})/i, confidence: 'high' },
        { regex: /our\s+(?:goal|mission|aim)\s+is\s+to\s+(.{20,150})/i, confidence: 'medium' },
      ]
    },
    {
      id: 'where_to_play',
      label: 'Where to Play',
      patterns: [
        { regex: /(?:target\s+market|market\s+segment|geography|region)[:\s]+(.{10,200})/i, confidence: 'high' },
        { regex: /(?:we\s+will\s+(?:focus|target|serve|enter))\s+(.{10,150})/i, confidence: 'medium' },
        { regex: /(?:initial\s+market|beachhead|first\s+market)[:\s]+(.{10,150})/i, confidence: 'high' },
      ]
    },
    {
      id: 'how_to_win',
      label: 'How to Win',
      patterns: [
        { regex: /(?:competitive\s+advantage|differentiat|how\s+we\s+win|unfair\s+advantage|moat)[:\s]+(.{10,200})/i, confidence: 'high' },
        { regex: /(?:we\s+(?:differentiate|compete|win)\s+by)\s+(.{10,200})/i, confidence: 'medium' },
        { regex: /(?:unique|proprietary|defensible)[:\s]+(.{10,150})/i, confidence: 'low' },
      ]
    },
    {
      id: 'what_not_to_do',
      label: 'What NOT to Do',
      patterns: [
        { regex: /(?:we\s+will\s+not|we\s+won'?t|not\s+building|out\s+of\s+scope|exclusions?)[:\s]+(.{10,200})/i, confidence: 'high' },
        { regex: /(?:explicitly\s+(?:avoid|exclude|decline))[:\s]+(.{10,150})/i, confidence: 'high' },
        { regex: /(?:anti-?goals?|non-?goals?)[:\s]+(.{10,200})/i, confidence: 'medium' },
      ]
    },
    {
      id: 'north_star_candidates',
      label: 'North Star Metric Candidates',
      patterns: [
        { regex: /(?:north\s+star|key\s+metric|primary\s+metric|success\s+metric)[:\s]+(.{5,100})/i, confidence: 'high' },
        { regex: /(?:we\s+(?:measure|track|optimize\s+for))\s+(.{5,100})/i, confidence: 'medium' },
      ]
    },
    {
      id: 'time_horizon',
      label: 'Time Horizon',
      patterns: [
        { regex: /(?:time\s*(?:frame|horizon|line)|planning\s+horizon)[:\s]*(\d+\s*(?:months?|years?))/i, confidence: 'high' },
        { regex: /(?:over\s+the\s+next|within)\s+(\d+\s*(?:months?|years?))/i, confidence: 'medium' },
      ]
    },
  ],

  // Stage 0: Problem Validator
  0: [
    {
      id: 'problem_hypothesis',
      label: 'Problem Hypothesis',
      patterns: [
        { regex: /(?:problem|pain\s+point|challenge)[:\s]+(.{20,200})/i, confidence: 'high' },
        { regex: /(?:users?\s+(?:struggle|can'?t|have\s+difficulty))\s+(.{20,200})/i, confidence: 'medium' },
      ]
    },
    {
      id: 'target_segment',
      label: 'Target User Segment',
      patterns: [
        { regex: /(?:target\s+(?:user|customer|audience|segment))[:\s]+(.{10,150})/i, confidence: 'high' },
        { regex: /(?:designed\s+for|built\s+for|serving)\s+(.{10,150})/i, confidence: 'medium' },
      ]
    },
    {
      id: 'competitors',
      label: 'Known Competitors',
      patterns: [
        { regex: /(?:competitor|alternative|competing\s+with)[:\s]+(.{5,200})/i, confidence: 'medium' },
        { regex: /(?:vs\.?|versus|compared\s+to)\s+(.{5,100})/i, confidence: 'low' },
      ]
    },
    {
      id: 'not_solving',
      label: 'What We Are NOT Solving',
      patterns: [
        { regex: /(?:not\s+solving|out\s+of\s+scope|will\s+not\s+address)[:\s]+(.{10,200})/i, confidence: 'high' },
      ]
    },
  ],

  // Stage 2: Opportunity Scout
  2: [
    {
      id: 'opportunity_hypotheses',
      label: 'Opportunity Hypotheses',
      patterns: [
        { regex: /(?:opportunit(?:y|ies)|potential\s+feature|idea)[:\s]+(.{10,200})/i, confidence: 'medium' },
        { regex: /(?:we\s+(?:could|should|might)\s+(?:build|create|offer))\s+(.{10,200})/i, confidence: 'medium' },
      ]
    },
    {
      id: 'target_user_segments',
      label: 'Target User Segments',
      patterns: [
        { regex: /(?:user\s+segment|persona|cohort)[:\s]+(.{10,150})/i, confidence: 'medium' },
      ]
    },
  ],
};
```

### 4.3.4 Match Logic

```javascript
function matchField(rawText, fieldDef) {
  // Try patterns in order (highest confidence first, they're pre-sorted)
  for (const pattern of fieldDef.patterns) {
    const match = rawText.match(pattern.regex);
    if (match && match[1]) {
      return {
        value: match[1].trim(),
        confidence: pattern.confidence,
        pattern: pattern.regex.source,
      };
    }
  }
  return null;
}
```

### 4.3.5 Component Spec

**File:** `src/components/QuickImport.jsx`

```
┌──────────────────────────────────────────────────┐
│  📥 QUICK IMPORT                        [close]  │
│  Paste a strategy doc, pitch deck, or notes.      │
│  Arthur will extract and map to your fields.      │
│                                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │                                             │  │
│  │  [paste area — min 200px height]            │  │
│  │                                             │  │
│  └─────────────────────────────────────────────┘  │
│                                                   │
│  Source type: [Strategy Doc ▾]  (optional hint)   │
│                                                   │
│           [Extract & Map]                         │
│                                                   │
│  ─── EXTRACTION RESULTS ───                       │
│                                                   │
│  Vision Statement               [HIGH] ✓         │
│  "In 18 months, Uber will..."                     │
│  [Accept] [Edit] [Reject]                         │
│                                                   │
│  Where to Play                  [MEDIUM] ?        │
│  "Indonesia, starting with Jakarta"               │
│  [Accept] [Edit] [Reject]                         │
│                                                   │
│  How to Win                     [LOW] ⚠           │
│  "driver network density"                         │
│  [Accept] [Edit] [Reject]                         │
│                                                   │
│  What NOT to Do                 [not found]       │
│                                                   │
│           [Apply Accepted to Fields]              │
└──────────────────────────────────────────────────┘
```

### 4.3.6 Confidence Display

| Level | Badge Color | Icon | Meaning |
|---|---|---|---|
| HIGH | Green (#27AE60) | ✓ | Strong pattern match. Likely correct. |
| MEDIUM | Amber (#F39C12) | ? | Possible match. PM should review carefully. |
| LOW | Red (#E74C3C) | ⚠ | Weak match. Extracted from context clues. Likely needs editing. |
| Not Found | Gray | — | No pattern matched. Field remains empty. |

### 4.3.7 VT Integration

When fields are populated via Quick Import, VT should immediately reflect the change:
- Stage completion percentage updates (more frameworks have data)
- Confidence score recalculates
- StageTimer is unaffected (import doesn't change how long you've been in the stage)

This happens automatically because VT reads from the same localStorage keys that Quick Import writes to. No special integration needed.

## 4.4 Phase B: Claude API Extraction (Jun/Jul)

### 4.4.1 What Changes

Replace the keyword parser with a Claude API call. The `extractFields()` function sends the raw text + the target stage's field schema to Claude and receives structured JSON back.

### 4.4.2 API Call Shape

```javascript
// Phase B replacement for matchField()
async function extractFieldsWithAI(rawText, targetStage) {
  const fieldDefs = FIELD_DEFINITIONS[targetStage];
  const fieldSchema = fieldDefs.map(f => ({
    id: f.id,
    label: f.label,
    description: f.description,  // add to field defs for AI context
    example: f.example,          // add to field defs for AI context
  }));

  // Include carry-forward constraints (Evidence Propagation Principle)
  const carryForward = readCarryForward(projectId, targetStage);

  const response = await callClaudeAPI({
    system: `You are an extraction engine for Arthur Mission Control System. 
Given a raw document and a set of target fields, extract values for each field.

Rules:
- Only extract what is EXPLICITLY stated. Do not infer.
- If a field has no clear match, return null for that field.
- Flag any tension between extracted values and carry-forward constraints.
- Return valid JSON only.

Carry-forward constraints (from prior validated stages):
${JSON.stringify(carryForward)}`,
    
    user: `Extract values for these fields from the document below.

TARGET FIELDS:
${JSON.stringify(fieldSchema, null, 2)}

DOCUMENT:
${rawText}

Return JSON array: [{ fieldId, extractedValue, confidence, reasoning }]`,
    
    model: 'claude-sonnet-4-20250514',
    temperature: 0.2,
    max_tokens: 2000,
  });

  return parseExtractionResponse(response);
}
```

### 4.4.3 Evidence Propagation in Phase B

Note the carry-forward constraints in the system prompt. This is Spec #5 in action: the AI extraction is grounded in validated prior-stage evidence. If the pasted document says "target market: enterprise" but Stage 0 carry-forward says "enterprise segment KILLED," the AI flags the tension rather than silently extracting a contradictory value.

## 4.5 What This Does NOT Include

- Document Import does not accept file uploads (Phase A). Text-only paste. File parsing is a future extension.
- Document Import does not auto-save. The PM must explicitly accept and apply extractions.
- Document Import does not replace manual entry. It pre-fills. The PM always reviews.
- Document Import does not run on the Cockpit or Situation Room. It's Stage Input Panel only.

## 4.6 Supported Source Types (Hint, Not Requirement)

The optional "Source type" dropdown helps the parser prioritize patterns:

| Source Type | Parser Behavior |
|---|---|
| Strategy Doc | Prioritize vision, strategy, market patterns |
| Pitch Deck | Prioritize problem, market size, competitor patterns |
| Investor Memo | Prioritize financials, market, competition patterns |
| Competitive Brief | Prioritize competitor names, positioning, feature patterns |
| Meeting Notes | Lower confidence on all matches (notes are less structured) |
| Other / Unknown | Default — try all patterns equally |

## 4.7 Effort Estimate

**Phase A (Sprint 2 polish):**
- 1 utility file (`documentImport.js`) with parser + field definitions
- 1 React component (`QuickImport.jsx`) with paste area + extraction results
- Integration into Stage 1 Input Panel (add banner + expand/collapse)
- ~2 days implementation

**Phase B (Jun/Jul with Claude API):**
- Replace `matchField()` with `extractFieldsWithAI()` in same utility file
- Add carry-forward constraint injection
- Add async loading state to QuickImport component
- ~1 day delta on top of Phase A (most of the UX is already built)

---

## Appendix: How the Three Specs Connect

```
Spec #5 (Evidence Propagation)
  ↓ defines the principle
  ↓
Spec #1 (Mission Brief)              Spec #4 (Document Import)
  │ enforces the principle              │ respects the principle
  │ at routing time                     │ at extraction time
  │                                     │
  │ "You can't work on Stage 2         │ "This document says 'enterprise'
  │  because Stage 0 isn't done."      │  but your Stage 0 killed enterprise.
  │                                     │  Flagging the tension."
  ↓                                     ↓
Situation Room routes you              Frameworks get pre-filled
to the right stage/framework           with evidence-consistent data
  ↓                                     ↓
  └─────────── VT scores both ──────────┘
               Confidence updates.
               Readiness recalculates.
               The loop continues.
```

The three specs are independent — each can be built without the others. But together they form a coherent system: #5 is the principle, #1 enforces it at the routing layer, #4 respects it at the data entry layer. VT ties it all together by scoring the result.

---

*© 2026 Arthur · Mission Control System*  
*Supernova-Inspired Feature Specs v1.0.0*
