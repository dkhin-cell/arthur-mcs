# DK PM Agentic Operating System — Technical Specification

## Stage 0–2 MVP Build for PMF Testing

**Version:** 1.0.0
**Date:** March 25, 2026
**Author:** Carter (Manus) + DK
**Purpose:** Complete technical specification for building the Stage 0–2 MVP with Claude. Hand this document to Claude Code and start building.

---

## 1. Architecture Overview

### 1.1 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (User)                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Next.js Frontend (Vercel)             │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │  │
│  │  │ Stage 0  │ │ Stage 1  │ │ Stage 2  │          │  │
│  │  │ Problem  │ │ Strategy │ │ Opport.  │          │  │
│  │  │ Validator│ │ Architect│ │ Scout    │          │  │
│  │  └──────────┘ └──────────┘ └──────────┘          │  │
│  │       │              │             │              │  │
│  │  ┌────┴──────────────┴─────────────┴────────┐    │  │
│  │  │          Shared Services Layer            │    │  │
│  │  │  Context Engine │ Export │ Carry-Forward  │    │  │
│  │  └──────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│                   Next.js API Routes                     │
│                     /api/research                        │
│                     /api/gate                            │
│                     /api/export                          │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   ┌────▼────┐  ┌─────▼─────┐  ┌───▼────┐
   │ Claude  │  │ Supabase  │  │ Carter │
   │ API     │  │ Postgres  │  │ (Manus)│
   │ Sonnet 4│  │ + Storage │  │ Deep   │
   │         │  │           │  │Research│
   └─────────┘  └───────────┘  └────────┘
```

### 1.2 Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Stage Independence** | No auto-triggers between stages. Human makes every gate decision. Stages are navigable but Stage 1/2 show "Stage 0 gate not yet passed" visual indicator. |
| **60/40 Rule** | AI handles research, synthesis, formatting (60%). Human handles judgment, tradeoffs, decisions (40%). |
| **Hypothesis-Driven** | Every AI workflow answers a specific hypothesis. No open-ended "tell me about the market" calls. |
| **Artifact-First Output** | Every workflow produces a concrete, exportable artifact. No chat-style responses. |
| **Carry Forward, Don't Repeat** | Human selects what moves between stages. System suggests carry-forward items but never auto-imports. |
| **Decision Integrity** | Decision Gates provide GO/PIVOT/KILL suggestions. The word "suggestion" appears on every gate output. Human decides. |

### 1.3 Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 14+ (App Router) | React-based, server components, API routes built in, stays on Vercel |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid UI development, consistent design system, dark mode support |
| **Database** | Supabase (PostgreSQL) | Free tier, Postgres + Auth + Realtime + Storage in one package |
| **AI Engine** | Claude API (Sonnet 4) | Primary reasoning engine for research and decision gates |
| **Background Jobs** | Inngest (or Vercel serverless with polling) | Async AI calls so UI doesn't freeze |
| **File Storage** | Supabase Storage | Interview transcripts, exported PDFs, research artifacts |
| **Deployment** | Vercel | Free tier, automatic deploys from GitHub |
| **Repo** | GitHub | Version control, CI/CD with Vercel |
| **Carter Dispatch** | Copy-paste bridge (Sprint 1) → API bridge (later) | Deep parallel research via Manus |

---

## 2. Database Schema

### 2.1 Core Tables

```sql
-- Projects table: one project = one product being validated
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stage progress tracking
CREATE TABLE stage_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  stage INTEGER NOT NULL CHECK (stage >= 0 AND stage <= 2),
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'gate_pending', 'passed', 'pivoted', 'killed')),
  gate_decision TEXT CHECK (gate_decision IN ('go', 'pivot', 'kill', NULL)),
  gate_decided_at TIMESTAMPTZ,
  gate_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, stage)
);

-- Stage 0 Input Panel data
CREATE TABLE stage0_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  problem_hypothesis TEXT,
  target_segment TEXT,
  jtbd_situation TEXT,
  jtbd_motivation TEXT,
  jtbd_outcome TEXT,
  industry_keywords TEXT[], -- array of strings
  not_solving TEXT[], -- array of strings
  team_unique_insight INTEGER CHECK (team_unique_insight BETWEEN 1 AND 5),
  team_build_capability INTEGER CHECK (team_build_capability BETWEEN 1 AND 5),
  team_strategic_fit INTEGER CHECK (team_strategic_fit BETWEEN 1 AND 5),
  assumptions_to_invalidate TEXT[], -- array of strings
  transcripts TEXT, -- raw interview transcripts (paste)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id)
);

-- Competitors (shared across stages, entered in Stage 0)
CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('direct', 'indirect', 'non_obvious')),
  url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stage 1 Input Panel data
CREATE TABLE stage1_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  -- Carry-forward from Stage 0 (human-selected)
  validated_problem TEXT,
  primary_jtbd TEXT,
  key_evidence_summary TEXT,
  -- Stage 1 specific inputs
  vision_statement TEXT,
  where_to_play TEXT,
  how_to_win TEXT,
  what_not_to_do TEXT,
  north_star_candidates TEXT[], -- array of candidate metrics
  time_horizon TEXT, -- '6_months', '12_months', '18_months'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id)
);

-- Stage 2 Input Panel data
CREATE TABLE stage2_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  -- Carry-forward from Stage 1 (human-selected)
  strategy_summary TEXT,
  north_star_metric TEXT,
  input_metrics TEXT[],
  okrs_summary TEXT,
  -- Stage 2 specific inputs
  opportunity_hypotheses TEXT[], -- array of opportunity statements
  target_user_segments TEXT[],
  research_questions TEXT[],
  behavioral_signals_to_track TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id)
);

-- Research results (from Claude API or Carter dispatch)
CREATE TABLE research_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  stage INTEGER NOT NULL,
  mission_type TEXT NOT NULL,
  -- mission_type values:
  -- Stage 0: 'full', 'market_sizing', 'competitive_intel', 'interview_synthesis',
  --          'regulatory_scan', 'evidence_scan', 'tam_sanity_check'
  -- Stage 1: 'strategy_analysis', 'competitive_strategy', 'vision_stress_test',
  --          'okr_generation', 'north_star_validation'
  -- Stage 2: 'opportunity_research', 'jtbd_deep_dive', 'rice_data_collection',
  --          'assumption_testing', 'behavioral_evidence'
  source TEXT NOT NULL CHECK (source IN ('claude_api', 'carter_dispatch', 'manual')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  request_payload JSONB, -- the dispatch payload sent
  result_payload JSONB, -- the structured results received
  confidence_level TEXT CHECK (confidence_level IN ('high', 'medium', 'low')),
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Framework data (editable by user after AI population)
CREATE TABLE framework_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  stage INTEGER NOT NULL,
  framework_name TEXT NOT NULL,
  -- framework_name values:
  -- Stage 0: 'swot', 'tam_sam_som', 'competitive_matrix', 'competing_against_map',
  --          'mom_test', 'forces_of_progress', 'strategy_canvas', 'kano',
  --          'customer_journey_map', 'value_proposition'
  -- Stage 1: 'v2mom', 'product_strategy_canvas', 'business_model_canvas',
  --          'north_star_selector', 'input_output_metrics', 'okrs', 'daci',
  --          'vision_clarity_test', 'pestle'
  -- Stage 2: 'jtbd_canvas', 'rww_enhanced', 'rice_calculator', 'dvuf_planner',
  --          'opportunity_solution_tree', 'kano_model', 'assumption_map',
  --          'behavioral_signal_tracker', 'hypothesis_template',
  --          'multi_perspective_review', 'beachhead_market'
  data JSONB NOT NULL, -- framework-specific structured data
  populated_by TEXT CHECK (populated_by IN ('ai', 'manual', 'hybrid')),
  last_edited_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, stage, framework_name)
);

-- Decision gate results
CREATE TABLE gate_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  stage INTEGER NOT NULL,
  ai_recommendation TEXT CHECK (ai_recommendation IN ('go', 'pivot', 'kill')),
  ai_confidence INTEGER CHECK (ai_confidence BETWEEN 0 AND 100),
  validation_brief JSONB, -- structured brief matching Playbook template
  exit_criteria JSONB, -- array of {criterion, status, evidence, gap}
  first_principles_invalidation JSONB, -- devil's advocate results
  forces_of_progress_gate JSONB, -- Stage 0 specific
  human_decision TEXT CHECK (human_decision IN ('go', 'pivot', 'kill', NULL)),
  human_notes TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, stage)
);

-- Carry-forward selections (what human chose to bring to next stage)
CREATE TABLE carry_forward (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  from_stage INTEGER NOT NULL,
  to_stage INTEGER NOT NULL,
  item_type TEXT NOT NULL, -- 'problem_statement', 'jtbd', 'evidence', 'metric', etc.
  item_label TEXT NOT NULL,
  item_data JSONB NOT NULL,
  selected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Export history
CREATE TABLE exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  stage INTEGER,
  format TEXT NOT NULL CHECK (format IN ('pdf', 'json', 'markdown', 'csv')),
  file_url TEXT, -- Supabase Storage URL
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2 Indexes

```sql
CREATE INDEX idx_stage_progress_project ON stage_progress(project_id);
CREATE INDEX idx_research_results_project_stage ON research_results(project_id, stage);
CREATE INDEX idx_framework_data_project_stage ON framework_data(project_id, stage);
CREATE INDEX idx_gate_results_project ON gate_results(project_id);
CREATE INDEX idx_carry_forward_project ON carry_forward(project_id, from_stage);
```

---

## 3. API Routes

### 3.1 Project Management

```
POST   /api/projects                    → Create new project
GET    /api/projects                    → List all projects
GET    /api/projects/[id]              → Get project with all stage data
DELETE /api/projects/[id]              → Delete project and all data
```

### 3.2 Stage Input Panels

```
GET    /api/projects/[id]/stage/[n]/inputs    → Get stage inputs
PUT    /api/projects/[id]/stage/[n]/inputs    → Save/update stage inputs
```

### 3.3 Research Engine

```
POST   /api/projects/[id]/stage/[n]/research  → Trigger research workflow
  Body: { mission_type: string }
  Returns: { job_id: string, status: 'pending' }

GET    /api/projects/[id]/stage/[n]/research/[job_id]  → Poll research status
  Returns: { status: 'pending'|'running'|'completed'|'failed', result?: object }

GET    /api/projects/[id]/stage/[n]/research  → List all research results for stage
```

### 3.4 Framework Data

```
GET    /api/projects/[id]/stage/[n]/frameworks           → Get all framework data for stage
GET    /api/projects/[id]/stage/[n]/frameworks/[name]    → Get specific framework
PUT    /api/projects/[id]/stage/[n]/frameworks/[name]    → Save/update framework data
POST   /api/projects/[id]/stage/[n]/frameworks/[name]/populate  → Populate from research results
```

### 3.5 Decision Gates

```
POST   /api/projects/[id]/stage/[n]/gate/generate   → Generate AI gate assessment
GET    /api/projects/[id]/stage/[n]/gate             → Get gate results
PUT    /api/projects/[id]/stage/[n]/gate/decide      → Record human decision
  Body: { decision: 'go'|'pivot'|'kill', notes: string }
```

### 3.6 Carry-Forward

```
GET    /api/projects/[id]/stage/[n]/carry-forward/available  → Items available to carry forward
POST   /api/projects/[id]/stage/[n]/carry-forward/select     → Select items to carry forward
  Body: { items: [{ item_type, item_label, item_data }] }
GET    /api/projects/[id]/stage/[n]/carry-forward/received   → Items received from previous stage
```

### 3.7 Export

```
POST   /api/projects/[id]/export
  Body: { stage?: number, format: 'pdf'|'json'|'markdown'|'csv' }
  Returns: { file_url: string }
```

### 3.8 Carter Dispatch (Copy-Paste Bridge)

```
POST   /api/projects/[id]/stage/[n]/carter/export-context
  Returns: { context_json: string }
  → Generates the full dispatch payload for copy-paste to Carter

POST   /api/projects/[id]/stage/[n]/carter/import-results
  Body: { results_json: string }
  → Parses Carter's results payload and populates frameworks
```

---

## 4. Frontend Component Architecture

### 4.1 Page Structure

```
/                           → Project list / dashboard
/project/[id]               → Project overview (all stages at a glance)
/project/[id]/stage/0       → Stage 0: Problem Validator
/project/[id]/stage/0/input → Art 1: Input Panel
/project/[id]/stage/0/frameworks → Art 3: Framework Suite (tabbed)
/project/[id]/stage/0/research   → Art 2: Research Engine
/project/[id]/stage/0/gate       → Art 4: Decision Gate
/project/[id]/stage/1       → Stage 1: Strategy Architect
/project/[id]/stage/1/input
/project/[id]/stage/1/frameworks
/project/[id]/stage/1/research
/project/[id]/stage/1/gate
/project/[id]/stage/2       → Stage 2: Opportunity Scout
/project/[id]/stage/2/input
/project/[id]/stage/2/frameworks
/project/[id]/stage/2/research
/project/[id]/stage/2/gate
```

### 4.2 Shared Components

| Component | Purpose |
|-----------|---------|
| `StageNav` | Left sidebar navigation showing all 3 stages with status indicators (not started / in progress / gate pending / passed / pivoted / killed) |
| `ArtifactTabs` | Tab bar within each stage: Input → Frameworks → Research → Gate |
| `StatusBadge` | Color-coded badge for stage/gate status |
| `ResearchStatus` | Loading indicator with progress when AI research is running |
| `ExportButton` | Dropdown with PDF/JSON/Markdown/CSV options |
| `CarryForwardSelector` | Checklist UI for selecting items to carry to next stage |
| `CarterDispatchPanel` | "Copy Context for Carter" button + "Import Carter Results" paste area |
| `GateSuggestionBanner` | Prominent banner showing AI recommendation with "THIS IS A SUGGESTION — YOU DECIDE" label |
| `FrameworkTab` | Generic tabbed container for framework views |
| `EditableTable` | Table component with inline editing for framework data |
| `ConfidenceIndicator` | Visual bar showing AI confidence level (0-100) |
| `SourcesList` | Expandable list of sources with URLs, titles, dates |
| `WarningBanner` | Yellow banner showing AI warnings/gaps for human review |

### 4.3 Stage 0 Components (Problem Validator)

#### Art 1: Input Panel (`Stage0Input`)

| Field | Type | Validation | Notes |
|-------|------|-----------|-------|
| Problem Hypothesis | Textarea | Flags solution-first language (regex: "build", "create", "develop", "launch" → warning) | Red warning banner if solution-first detected |
| Target User Segment | Text input | Required | |
| JTBD — Situation | Textarea | Required | "When I am..." |
| JTBD — Motivation | Textarea | Required | "I want to..." |
| JTBD — Outcome | Textarea | Required | "So I can..." |
| Competitors | Repeatable group (up to 10) | Name (required), Type (select: direct/indirect/non_obvious), URL (optional) | |
| Industry Keywords | Tag input | At least 2 | Used for research targeting |
| Not Solving | Tag input | At least 1 | Explicit scope boundaries |
| Team Unique Insight | Slider 1-5 | Required | |
| Team Build Capability | Slider 1-5 | Required | |
| Team Strategic Fit | Slider 1-5 | Required | |
| Assumptions to Invalidate | Repeatable text | At least 1 | What you want the research to challenge |
| Interview Transcripts | Large textarea or file upload | Optional | Raw paste or .txt/.md upload |

**Buttons:**
- "Save Draft" → saves to Supabase
- "Export as JSON" → downloads dispatch payload
- "Copy Context for Carter" → copies structured JSON to clipboard
- "Proceed to Frameworks →" → navigates to Art 3

#### Art 3: Framework Suite (`Stage0Frameworks`)

**Tab 1: SWOT Analysis**
- 4-quadrant grid (Strengths, Weaknesses, Opportunities, Threats)
- Each quadrant: editable list of items
- Each item has: text, source (AI/manual), confidence (1-5)
- "Populate from Research" button → pulls from research_results
- Color coding: green (S), amber (W), blue (O), red (T)

**Tab 2: TAM/SAM/SOM Calculator**
- Three nested circles visualization (Recharts or D3)
- Editable values: TAM ($), SAM ($), SOM ($)
- Percentage displays (SAM/TAM, SOM/SAM)
- Adjustable sliders for assumptions
- Sanity check section: risks, methodology notes, source basis
- "Populate from Research" button

**Tab 3: Competitive Matrix**
- Scored table: rows = competitors, columns = dimensions
- Default dimensions: Price, Features, UX, Market Share, Innovation, Trust
- Scores 1-5 with heatmap coloring (1=red, 3=amber, 5=green)
- Editable: add/remove competitors, add/remove dimensions, change scores
- Positioning gaps highlighted
- "Populate from Research" button

**Tab 4: Competing Against Map** (V2)
- Categories: Direct competitors, Indirect competitors, Non-obvious alternatives (spreadsheets, manual processes, doing nothing)
- Visual map layout
- Editable

**Tab 5: Mom Test Synthesizer** (V2)
- Pain points table: pain, frequency count, severity (1-10), quotes
- Workarounds identified
- Time/money currently spent
- Commitment Ladder: L1 (compliment) → L5 (pre-paid)
- Signal strength distribution chart
- "Populate from Research" button (from interview_synthesis)

**Tab 6: Forces of Progress** (V2)
- Four-force diagram: Push (current pain), Pull (desired outcome), Anxiety (switching fear), Habit (current behavior)
- Each force: score (1-5), evidence items
- Net assessment: Push+Pull vs Anxiety+Habit
- Visual balance indicator
- "Populate from Research" button

**Tab 7: Strategy Canvas** (V2)
- Line chart (Recharts): X-axis = value factors, Y-axis = offering level (1-5)
- Multiple lines: your product + each competitor
- Editable value factors and scores
- "Populate from Research" button

**Tab 8: Kano Model** (V2)
- Interactive scatter plot
- Categories: Must-be, Performance, Attractive, Indifferent, Reverse
- Drag features between categories
- "Populate from Research" button

**Tab 9: Customer Journey Map** (NEW — from gap analysis)
- Stages: Awareness → Consideration → Decision → Onboarding → Usage → Advocacy
- For each stage: touchpoints, emotions (emoji scale), pain points, opportunities
- Editable grid layout
- "Populate from Research" button

**Tab 10: Value Proposition** (NEW — from gap analysis)
- 6-part JTBD value proposition canvas
- Who (target user), Why (motivation), What Before (current state), How (your solution), What After (desired outcome), Alternatives (what they'd do without you)
- Editable card layout
- Consumes Stage 0 JTBD input automatically

#### Art 2: Research Engine (`Stage0Research`)

**Mission Types:**

| Mission | Claude API Prompt Template | Output Feeds |
|---------|--------------------------|-------------|
| `full` | Runs all 5 workflows below sequentially | All framework tabs + Decision Gate |
| `market_sizing` | TAM/SAM/SOM estimation with top-down + bottom-up | TAM/SAM/SOM Calculator |
| `competitive_intel` | Competitor features, pricing, sentiment, gaps | Competitive Matrix + SWOT (O/T) + Strategy Canvas |
| `interview_synthesis` | Pain points, workarounds, JTBD patterns, commitment levels | Mom Test + Forces of Progress + SWOT (S/W) |
| `regulatory_scan` | APIs, policy changes, infrastructure shifts | SWOT (O/T) + Decision Gate risk |
| `evidence_scan` | Public reviews, forums, social mentions | Decision Gate evidence summary |
| `tam_sanity_check` | Top-down vs bottom-up variance analysis | TAM Calculator risk overlay |

**UI Layout:**
- Mission type selector (dropdown or card grid)
- "Run Research" button → triggers async Claude API call
- Status indicator: Pending → Running (with spinner) → Completed
- Results panel: structured output matching results payload schema
- "Push to Frameworks" button → populates relevant framework tabs
- "Copy for Carter" button → exports dispatch payload for deep research
- "Import Carter Results" → paste area for Carter's structured JSON output

**Research Status Flow:**
```
User clicks "Run Research"
  → POST /api/projects/[id]/stage/0/research { mission_type }
  → API creates research_results row (status: 'pending')
  → API triggers background job (Inngest or serverless function)
  → Returns job_id to frontend
  → Frontend polls GET /api/.../research/[job_id] every 3 seconds
  → Background job calls Claude API with skill template + user inputs
  → Claude returns structured JSON
  → Background job writes result to research_results (status: 'completed')
  → Frontend detects completion, displays results
  → User reviews, clicks "Push to Frameworks"
```

#### Art 4: Decision Gate (`Stage0Gate`)

**Components:**

1. **Problem Validation Brief** (matches Playbook template exactly)
   - Problem Statement (auto-populated from inputs + research)
   - Evidence Summary (aggregated from all research results)
   - Unique Insight (from team capability + research gaps)
   - Team Capability Assessment (from input scores)
   - AI Recommendation: GO / PIVOT / KILL (clearly labeled "SUGGESTION ONLY")
   - Next Steps (conditional on recommendation)

2. **Exit Criteria Checklist** (7 criteria)
   - Each criterion: description, status (pass/fail/partial), evidence, gap
   - Visual: green check / red X / amber warning
   - Summary: X of 7 pass, Y partial, Z fail

3. **First Principles Invalidation** (Devil's Advocate)
   - Counter-arguments with severity scores (1-5)
   - Counter-evidence for each
   - Rebuttals
   - Survival assessment

4. **Forces of Progress Gate Check**
   - Push+Pull score vs Anxiety+Habit score
   - Net score
   - Adoption risk flag (yes/no)

5. **Human Decision Panel**
   - Three buttons: GO / PIVOT / KILL
   - Notes textarea (required)
   - "This decision is yours. The AI recommendation above is a suggestion based on available evidence."
   - Confirmation modal: "Are you sure? This will mark Stage 0 as [decision] and unlock Stage 1."

### 4.4 Stage 1 Components (Strategy Architect)

#### Art 1: Input Panel (`Stage1Input`)

**Carry-Forward Section** (top of page):
- Shows items selected from Stage 0 carry-forward
- Read-only display with "Edit carry-forward selections" link
- Items: validated problem statement, primary JTBD, key evidence, competitor landscape summary

**Stage 1 Inputs:**

| Field | Type | Notes |
|-------|------|-------|
| Vision Statement | Textarea | "In [timeframe], [product] will [outcome] for [users] by [approach]" |
| Where to Play | Textarea | Market segment, geography, user type |
| How to Win | Textarea | Competitive advantage, differentiation |
| What NOT to Do | Textarea | Explicit exclusions |
| North Star Candidates | Repeatable text | 2-5 candidate metrics |
| Time Horizon | Select | 6 months / 12 months / 18 months |

#### Art 3A: Framework Suite Part 1 (`Stage1FrameworksA`)

**Tab 1: V2MOM**
- Vision, Values, Methods, Obstacles, Measures
- 5-section editable card layout

**Tab 2: Product Strategy Canvas**
- Multi-section canvas: Target User, Problem, Value Prop, Solution, Channels, Revenue, Metrics, Unfair Advantage
- Editable card grid

**Tab 3: Business Model Canvas**
- Standard 9-block BMC layout
- Key Partners, Key Activities, Key Resources, Value Propositions, Customer Relationships, Channels, Customer Segments, Cost Structure, Revenue Streams

**Tab 4: PESTLE Analysis** (NEW — from gap analysis)
- 6-section grid: Political, Economic, Social, Technological, Legal, Environmental
- Each section: factors list with impact rating (high/medium/low) and timeframe (now/6mo/12mo)

#### Art 3B: Framework Suite Part 2 (`Stage1FrameworksB`)

**Tab 5: North Star Metric Selector**
- Candidate metrics table
- Scoring criteria: reflects user value, measures product growth, indicates business health
- Score each candidate 1-5 on each criterion
- Winner highlighted

**Tab 6: Input/Output Metric Map**
- Visual flow: Input Metrics → North Star → Output Metrics
- Editable: add/remove metrics, draw connections
- Each metric: name, current value, target, owner

**Tab 7: OKRs**
- Objectives (3-5) with Key Results (2-4 per objective)
- Each KR: metric, baseline, target, confidence (1-10)
- "Generate OKRs" button → Claude API generates from strategy inputs

**Tab 8: DACI**
- Decision matrix: Driver, Approver, Contributors, Informed
- Editable table for key decisions

**Tab 9: Vision Clarity Test**
- Checklist: Is the vision specific? Measurable? Time-bound? Inspiring? Differentiating?
- Each criterion: pass/fail with evidence
- AI stress-test: "What would make this vision fail?"

#### Art 2: Research Engine (`Stage1Research`)

| Mission | Claude API Prompt Template | Output Feeds |
|---------|--------------------------|-------------|
| `strategy_analysis` | Analyze strategy against market conditions | Product Strategy Canvas + V2MOM |
| `competitive_strategy` | How competitors are positioned strategically | Strategy Canvas + SWOT |
| `vision_stress_test` | Challenge the vision statement | Vision Clarity Test |
| `okr_generation` | Generate OKRs from strategy + North Star | OKRs tab |
| `north_star_validation` | Validate North Star metric choice against benchmarks | North Star Selector |

#### Art 4: Decision Gate (`Stage1Gate`)

**Strategy Validation Brief:**
- Strategy summary (1-2 paragraphs)
- North Star Metric with rationale
- Input metrics identified
- Explicit tradeoffs documented
- At least one thing NOT optimizing for

**Exit Criteria** (Stage 1 specific):
1. Strategy articulated in 1-2 paragraphs
2. One North Star Metric selected with rationale
3. 3-5 input metrics identified
4. Explicit tradeoffs documented
5. At least one thing NOT optimizing for
6. OKRs defined with measurable key results
7. DACI established for key decisions

### 4.5 Stage 2 Components (Opportunity Scout)

#### Art 1: Input Panel (`Stage2Input`)

**Carry-Forward Section:**
- Strategy summary, North Star Metric, input metrics, OKRs from Stage 1

**Stage 2 Inputs:**

| Field | Type | Notes |
|-------|------|-------|
| Opportunity Hypotheses | Repeatable textarea | "We believe [user segment] has [unmet need] because [evidence]" |
| Target User Segments | Repeatable text | Specific segments to research |
| Research Questions | Repeatable text | What you need to learn |
| Behavioral Signals to Track | Repeatable text | Observable behaviors that validate opportunity |

#### Art 3A: Framework Suite Part 1 (`Stage2FrameworksA`)

**Tab 1: JTBD Canvas**
- Expanded JTBD for each opportunity
- Functional, emotional, social jobs
- Current solutions and satisfaction levels

**Tab 2: RWW Enhanced**
- Real (is the market real?), Win (can we win?), Worth (is it worth doing?)
- Scoring matrix with evidence for each

**Tab 3: RICE Calculator**
- Table: Opportunity, Reach, Impact, Confidence, Effort, RICE Score
- Auto-calculated scores
- Sortable by RICE score
- Editable values

**Tab 4: DVUF Validation Planner**
- For each opportunity: Desirability, Viability, Usability, Feasibility
- Experiment design for each dimension
- Pretotype methodology integration (NEW — from gap analysis)

**Tab 5: Beachhead Market Selector** (NEW — from gap analysis)
- Market segment evaluation matrix
- Criteria: size, accessibility, urgency, willingness to pay, strategic value
- Score each segment, identify beachhead

#### Art 3B: Framework Suite Part 2 (`Stage2FrameworksB`)

**Tab 6: Opportunity Solution Tree**
- Visual tree: Outcome → Opportunities → Solutions → Experiments
- Expandable/collapsible nodes
- Drag to reorder

**Tab 7: Kano Model**
- Feature categorization: Must-be, Performance, Attractive, Indifferent, Reverse
- Interactive plot

**Tab 8: Assumption Map**
- 2x2 matrix: Importance (high/low) × Evidence (strong/weak)
- Drag assumptions between quadrants
- High-importance + weak-evidence = test first

**Tab 9: Behavioral Signal Tracker**
- Table: Signal, Expected Behavior, Actual Behavior, Status (confirmed/denied/inconclusive)
- Evidence links

**Tab 10: Hypothesis Template**
- Structured template: "We believe [hypothesis]. We will test this by [experiment]. We will measure [metric]. We will know we are right if [success criteria]."
- Repeatable for multiple hypotheses

**Tab 11: Multi-Perspective Review**
- Evaluate opportunity from: User, Business, Technology, Market perspectives
- Each perspective: score (1-5), key considerations, risks

#### Art 2: Research Engine (`Stage2Research`)

| Mission | Claude API Prompt Template | Output Feeds |
|---------|--------------------------|-------------|
| `opportunity_research` | Deep dive on specific opportunity | JTBD Canvas + RWW |
| `jtbd_deep_dive` | Detailed JTBD analysis for target segment | JTBD Canvas |
| `rice_data_collection` | Gather data for RICE scoring inputs | RICE Calculator |
| `assumption_testing` | Find evidence for/against key assumptions | Assumption Map |
| `behavioral_evidence` | Search for behavioral signals in market | Behavioral Signal Tracker |

#### Art 4: Decision Gate (`Stage2Gate`)

**Opportunity Validation Brief:**
- Top-ranked opportunity with evidence
- RICE scores for all opportunities
- Assumptions tested vs untested
- Behavioral evidence summary
- Recommended next stage focus

**Exit Criteria** (Stage 2 specific):
1. At least 3 opportunities identified and scored
2. Top opportunity has RICE score with evidence
3. Key assumptions mapped (importance × evidence)
4. Behavioral validation signals defined
5. Beachhead market identified
6. Experiment plan for top 2-3 assumptions
7. Clear "not pursuing" list with rationale

---

## 5. Skills Templates (`/lib/skills/`)

### 5.1 Directory Structure

```
/lib/skills/
├── stage0/
│   ├── market-sizing.json
│   ├── competitive-intel.json
│   ├── interview-synthesis.json
│   ├── regulatory-scan.json
│   ├── evidence-scan.json
│   ├── tam-sanity-check.json
│   └── gate-assessment.json
├── stage1/
│   ├── strategy-analysis.json
│   ├── competitive-strategy.json
│   ├── vision-stress-test.json
│   ├── okr-generation.json
│   ├── north-star-validation.json
│   └── gate-assessment.json
├── stage2/
│   ├── opportunity-research.json
│   ├── jtbd-deep-dive.json
│   ├── rice-data-collection.json
│   ├── assumption-testing.json
│   ├── behavioral-evidence.json
│   └── gate-assessment.json
└── shared/
    ├── system-context.json      ← Global context (equivalent to CLAUDE.md)
    └── output-schema.json       ← Shared output format rules
```

### 5.2 Skill Template Format

Each skill template is a JSON file with:

```json
{
  "skill_name": "market-sizing",
  "stage": 0,
  "version": "1.0.0",
  "description": "Estimate TAM/SAM/SOM with top-down and bottom-up approaches",
  "system_prompt": "You are a market research analyst...",
  "user_prompt_template": "Given the following problem hypothesis and market context, estimate TAM/SAM/SOM...\n\nProblem: {{problem_hypothesis}}\nSegment: {{target_segment}}\nKeywords: {{keywords}}\nCompetitors: {{competitors}}\n\nProvide your response as valid JSON matching this schema: {{output_schema}}",
  "input_variables": ["problem_hypothesis", "target_segment", "keywords", "competitors"],
  "output_schema": "... (reference to results payload schema section)",
  "model": "claude-sonnet-4-20250514",
  "temperature": 0.3,
  "max_tokens": 4000,
  "tools": ["web_search"],
  "quality_notes": "Strong for public markets with reports. Moderate for niche/emerging markets. Human override likely needed for SOM assumptions."
}
```

### 5.3 System Context Template (`shared/system-context.json`)

```json
{
  "role": "You are an AI research and analysis engine embedded in the DK PM Agentic Operating System.",
  "principles": [
    "Every output must be structured JSON matching the provided schema.",
    "Cite sources with URLs for every factual claim.",
    "Flag confidence levels honestly: high (70%+ from authoritative sources), medium (mixed quality), low (limited data, high inference).",
    "When data is unavailable, say so explicitly. Never fabricate data points.",
    "Provide counter-arguments and risks alongside findings.",
    "Your output is a SUGGESTION. The human makes all decisions."
  ],
  "output_rules": [
    "Valid JSON only. No markdown wrapping. No prose mixed in.",
    "Arrays must be consistently structured (same fields per object).",
    "Scores use 1-5 for ratings, 0-100 for confidence.",
    "Sources must include URL, title, and date accessed."
  ]
}
```

---

## 6. Carter (Manus) Integration

### 6.1 Sprint 1: Copy-Paste Bridge

**Export Context Flow:**
1. User clicks "Copy Context for Carter" in Research Engine tab
2. System generates dispatch payload JSON from current project data
3. JSON copied to clipboard
4. User pastes into Carter (Manus) conversation
5. Carter runs deep parallel research
6. Carter returns structured JSON results
7. User clicks "Import Carter Results" in Research Engine tab
8. Pastes Carter's JSON output
9. System parses and populates framework tabs

**Dispatch Payload Schema** (already spec'd — version 1.0.0):

```json
{
  "schema_version": "1.0.0",
  "stage": 0,
  "mission_type": "full | market_sizing | competitive_intel | ...",
  "inputs": {
    "problem_hypothesis": "string",
    "target_segment": "string",
    "jtbd": { "situation": "string", "motivation": "string", "outcome": "string" },
    "competitors": [{ "name": "string", "type": "string", "url": "string|null" }],
    "keywords": ["string"],
    "not_solving": ["string"],
    "team_capability": { "unique_insight": "1-5", "build_capability": "1-5", "strategic_fit": "1-5" },
    "assumptions_to_invalidate": ["string"],
    "transcripts": "string|null"
  }
}
```

**Results Payload Schema:** See `/home/ubuntu/dk_results_payload_schema.json` (version 1.0.0, already spec'd with full field definitions, framework mappings, and Padauk examples).

### 6.2 Future: API Bridge

When ready to upgrade from copy-paste:

```
POST /api/projects/[id]/stage/[n]/carter/dispatch
  → Sends dispatch payload to Manus API endpoint
  → Returns job_id
  → Frontend polls for results
  → Results auto-populate frameworks when complete
```

This requires a Manus API endpoint (not available today). The copy-paste bridge is functionally equivalent — same data contracts, same results format. The only difference is the transport mechanism.

---

## 7. Export System

### 7.1 Supported Formats

| Format | Content | Use Case |
|--------|---------|----------|
| **PDF** | Formatted report with all framework visualizations | Stakeholder sharing, portfolio, printing |
| **JSON** | Raw structured data for all frameworks + research | Data portability, Carter dispatch, backup |
| **Markdown** | Human-readable text version of all outputs | Documentation, GitHub, blog posts |
| **CSV** | Tabular data (competitive matrix, RICE scores, etc.) | Spreadsheet analysis |

### 7.2 Export Scopes

- **Single framework** → Export one framework tab
- **Single stage** → Export all artifacts for one stage
- **Full project** → Export all stages with carry-forward connections
- **Decision Gate Brief** → Export gate assessment as standalone document

---

## 8. Build Sequence

### 8.1 Per-Stage Build Order

Follow the same sequence for each stage: **Art 1 → Art 3 → Art 2 → Art 4**

Rationale:
1. **Art 1 (Input Panel)** first — nail the information architecture, define what data exists
2. **Art 3 (Framework Suite)** second — build the display layer, know exactly what shape the data needs to be
3. **Art 2 (Research Engine)** third — now you know what format the frameworks expect, build the AI that produces it
4. **Art 4 (Decision Gate)** last — synthesis layer needs good upstream data from Art 2 + Art 3

### 8.2 Overall Build Order

```
Phase 1: Foundation
  ├── Project/database setup (Supabase schema, Next.js scaffold)
  ├── Shared components (StageNav, ArtifactTabs, ExportButton, etc.)
  └── Skills template structure (/lib/skills/)

Phase 2: Stage 0 (Problem Validator)
  ├── Art 1: Stage0Input component + API routes
  ├── Art 3: Framework tabs (SWOT, TAM, Competitive Matrix first → then V2 tabs)
  ├── Art 2: Research Engine + Claude API integration + skill templates
  ├── Art 4: Decision Gate + gate assessment skill
  └── Carter dispatch: Copy-paste bridge (export context + import results)

Phase 3: Stage 1 (Strategy Architect)
  ├── Carry-forward: Stage 0 → Stage 1 selection UI
  ├── Art 1: Stage1Input component
  ├── Art 3A + 3B: Framework tabs
  ├── Art 2: Research Engine (Stage 1 missions)
  └── Art 4: Decision Gate

Phase 4: Stage 2 (Opportunity Scout)
  ├── Carry-forward: Stage 1 → Stage 2 selection UI
  ├── Art 1: Stage2Input component
  ├── Art 3A + 3B: Framework tabs
  ├── Art 2: Research Engine (Stage 2 missions)
  └── Art 4: Decision Gate

Phase 5: Polish
  ├── Export system (PDF, JSON, Markdown, CSV)
  ├── Full Padauk validation run
  ├── Bug fixes and UX refinement
  └── Deploy to production Vercel
```

---

## 9. Framework Count Summary

| Stage | MVP Frameworks | V2 Additions | New (from gap analysis) | Total |
|-------|---------------|-------------|------------------------|-------|
| Stage 0 | SWOT, TAM/SAM/SOM, Competitive Matrix | Competing Against Map, Mom Test, Forces of Progress, Strategy Canvas, Kano | Customer Journey Map, Value Proposition | **10** |
| Stage 1 | V2MOM, Product Strategy Canvas, BMC, North Star Selector, Input/Output Metrics, OKRs, DACI, Vision Clarity Test | — | PESTLE | **9** |
| Stage 2 | JTBD Canvas, RWW Enhanced, RICE Calculator, DVUF Planner, OST, Kano Model, Assumption Map, Behavioral Signal Tracker, Hypothesis Template, Multi-Perspective Review | — | Beachhead Market, Pretotype (integrated into DVUF) | **11** |
| **Total** | | | | **30 frameworks + 3 new = 33 total** |

Note: The 5 gaps identified (Customer Journey Map, Value Proposition, PESTLE, Beachhead Market, Pretotype) bring the total to 33 frameworks across Stages 0-2. Pretotype methodology is integrated into the existing DVUF Validation Planner rather than being a separate framework, keeping the count at 33.

---

## 10. Data Contracts Quick Reference

### 10.1 Dispatch Payload (App → Carter/Claude)

See Section 6.1 for full schema. Key fields:
- `stage`: 0, 1, or 2
- `mission_type`: stage-specific mission identifier
- `inputs`: all user inputs from Art 1

### 10.2 Results Payload (Carter/Claude → App)

See `/home/ubuntu/dk_results_payload_schema.json` for full schema (version 1.0.0). Key sections:
- `metadata`: sources, confidence, warnings
- `market_sizing`: TAM/SAM/SOM data → feeds calculator
- `competitive_intel`: competitor profiles → feeds matrix + SWOT
- `interview_synthesis`: pain points, commitment levels → feeds Mom Test + Forces of Progress
- `regulatory_scan`: regulatory factors → feeds SWOT + gate risk
- `evidence_scan`: public evidence → feeds gate evidence summary
- `decision_gate`: validation brief, exit criteria, first principles invalidation

### 10.3 Framework Data (Supabase)

Each framework stores its data as JSONB in the `framework_data` table. The schema varies by framework but follows consistent patterns:
- Tables: `{ rows: [{ col1: val, col2: val, ... }], columns: [...] }`
- Grids: `{ quadrants: { q1: [...], q2: [...], q3: [...], q4: [...] } }`
- Canvases: `{ sections: { section_name: { items: [...] } } }`
- Scores: `{ items: [{ name: str, scores: { dim1: 1-5, dim2: 1-5 }, total: num }] }`

---

## 11. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Claude API
ANTHROPIC_API_KEY=your_claude_api_key

# Inngest (if using for background jobs)
INNGEST_EVENT_KEY=your_inngest_key
INNGEST_SIGNING_KEY=your_signing_key

# App
NEXT_PUBLIC_APP_URL=https://dk-stage0.vercel.app
```

---

## 12. Quality Flags

Honest assessment of where AI output quality varies — where human override will frequently be needed:

| Area | AI Quality | Human Override Needed |
|------|-----------|---------------------|
| Market sizing (public markets) | **Strong** | Rarely |
| Market sizing (niche/emerging) | **Moderate** | Often — assumptions need validation |
| Competitor features/pricing | **Strong** | Occasionally — private pricing may be wrong |
| Competitor sentiment | **Strong** | Rarely — review platforms are reliable |
| Interview synthesis | **Moderate** | Often — nuance in transcripts requires human judgment |
| Commitment level inference | **Weak** | Always — AI can't reliably distinguish L3 from L5 |
| Forces of Progress (anxiety/habit scores) | **Weak** | Always — emotional switching costs are subjective |
| TAM/SAM/SOM for novel markets | **Weak** | Always — no existing data to reference |
| Regulatory impact severity | **Moderate** | Often — jurisdiction-specific nuance |
| First Principles Invalidation | **Strong** | Rarely — AI is good at finding counter-arguments |
| RICE scoring data | **Moderate** | Often — Reach and Effort estimates are speculative |
| Behavioral signal detection | **Moderate** | Often — correlation vs causation judgment |

---

*This specification is version 1.0.0. Hand it to Claude Code and start building Phase 1 (Foundation) immediately.*
