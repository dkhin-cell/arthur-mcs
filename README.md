# Arthur · Mission Control System

**A Hypothesis-Driven Operating System for Product Leaders.**

Arthur MCS guides product managers through a 9-stage pipeline — from problem validation to post-launch truth — with evidence-gated GO/PIVOT/KILL decisions at every stage. Built by [David Aung Khin](https://github.com/dkhin-cell) as a solo founder product.

---

## Architecture

- **Level 1 (Shipped):** Vite + React, localStorage, deployed at dk-stage0.vercel.app
- **Level 2 (In Progress):** Next.js 14+ App Router, Supabase (PostgreSQL/Auth/RLS), Claude API (Sonnet), Tailwind + shadcn/ui
- **Level 3 (Planned):** Sentinel tier — multi-agent integrations, signal classification, cross-mission routing

## Repository Structure

```
arthur-mcs/
├── src/                    # Next.js App Router source
│   ├── app/                # Routes (stages, auth, intelligence, situation-room)
│   ├── components/         # React components (sidebar, stages 0-5)
│   └── lib/                # Services (supabase, permissions, telemetry, frameworks)
├── decisions/              # Product decision logs (DEC-001 to DEC-013)
├── prototypes/             # React demos (Pro tier V8, Free tier)
├── docs/                   # Reference documentation
│   ├── Arthur_MCS_Agent_Brief.md
│   ├── ARTHUR_MCS_UX_CONSISTENCY_SPEC_FINAL.md
│   ├── Arthur_MCS_Supernova_Feature_Specs.md
│   └── DK_PMOS_Technical_Spec_Stage0-2_MVP.md
├── AGENTS.md               # Multi-agent team roles
└── CLAUDE.md               # CTO agent context
```

## The 9 Stages

| Stage | Name | Question |
|-------|------|----------|
| 0 | Problem Scout | Is this a real problem worth solving? |
| 1 | Strategy Architect | Where to play, how to win, what to measure? |
| 2 | Opportunity Scout | What is the best opportunity to pursue? |
| 3 | Design Lab | What should the solution look and feel like? |
| 4 | Build Planner | What exactly are we building first? |
| 5 | Launch Pad | Are we ready to ship? |
| 6 | Scale Engine | How do we grow what's working? |
| 7 | Maturity Matrix | How do we sustain and defend? |
| 8 | Sunset Protocol | When and how do we wind down? |

Every stage has: Strategy Brief (PM inputs) → Frameworks (analysis tools) → Research (AI engine) → Decision Gate (GO/PIVOT/KILL).

## Decision Logs

13 product decisions documented in `/decisions/`. See [decisions/README.md](decisions/README.md) for the full index.

## Key Design Documents

- **Cornerstone Page:** Stage 1 Landing Page design is the binding template for all 9 stage landing pages ([DEC-010](decisions/010-stage1-landing-cornerstone.md))
- **UX Consistency Spec:** P0/P1/P2 fixes for cross-stage consistency ([docs/](docs/ARTHUR_MCS_UX_CONSISTENCY_SPEC_FINAL.md))
- **Technical Spec:** Stage 0-2 MVP architecture ([docs/](docs/DK_PMOS_Technical_Spec_Stage0-2_MVP.md))

## Agent Team

| Agent | Role |
|-------|------|
| DK (David Aung Khin) | CEO/CPO/Director of Agent Orchestration |
| Claude | CTO Advisor |
| Daniel (ChatGPT) | COO Advisor |
| Gemini | VP of Research & Analysis |
| Carter | CMO |
| Grok | VP of Engineering |

## Development

```bash
npm install
npm run dev
```

Deployed via Vercel (auto-deploy from main branch).

---

*© 2026 Arthur · Mission Control System — Banyan Canopy LLC*
