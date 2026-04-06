# Arthur · Mission Control System — Agent Brief

**Version:** v7 · March 2026
**Status:** Stage 0 complete, deployed at dk-stage0.vercel.app
**Author:** David Aung Khin (DK)
**Stack:** Vite + React, localStorage, hash routing, Vercel auto-deploy

---

## What is Arthur MCS?

Arthur · Mission Control System is a hypothesis-driven operating system for product leaders. It guides PMs through 9 stages of product development — from problem validation to organizational influence — with interactive frameworks, decision gates, and continuous market intelligence at every stage.

Named after David's son and King Arthur's Round Table: the best decisions come from bringing the right evidence to the table, with humans making the final call.

## Brand Identity

- **Name:** Arthur · Mission Control System (Arthur MCS)
- **Company:** Arthur
- **Tagline:** "A Hypothesis-Driven Operating System for Product Leaders"
- **Logo:** Interlocking hexagon — Navy (#1B4F72) + Orange (#E67E22)
- **Design System:** DM Sans (body), DM Mono (labels/data), Playfair Display (headings)
- **Colors:** Navy #0B1929 (dark bg), Teal #1B9C85 (accent), light mode default
- **Footer:** © 2026 Arthur · Mission Control System

## Architecture

### 9 Stages (with icons)

| # | Stage | Icon | Status |
|---|-------|------|--------|
| 0 | Problem Validator | 🔬 | Active — 12 frameworks built |
| 1 | Strategy Architect | 🧭 | Next sprint — 9 frameworks specced |
| 2 | Opportunity Scout | 🎯 | Specced — 12 frameworks (incl. JTBD Persona Canvas) |
| 3 | Design & MVP | ✏️ | Coming |
| 4 | Planning & Roadmap | 🗺 | Coming |
| 5 | GTM & Adoption | 🚀 | Coming |
| 6 | Pricing & Monetization | 💎 | Coming |
| 7 | Product Evolution | 📊 | Coming |
| 8 | Communication & Influence | 🏛️ | Coming |

### Cross-Cutting Modules

- **📡 Intelligence Radar (Ambient Radar):** Continuous market surveillance. 7 tabs, 8 competitors across 3 tiers. Currently static data, evolves to RAG-powered with Supabase.
- **⚡ Validation Telemetry:** Real-time computed stats from localStorage. Confidence Meter (weighted from Mom Test commitment ladder), Stage Timer (day counter with amber/red thresholds), framework completion, forces net score, assumption risk, gate status.
- **🎖️ Situation Room:** A Situation → Questions → Path engine. Users describe their scenario in plain language → system surfaces 2–4 critical questions they must answer before proceeding → maps each question to stage(s), framework(s), and recommended artifacts with audience tags (team, stakeholders, leadership). Not a framework search engine — it translates messy situations into structured next moves. Consistent with system philosophy: gates advise, don't block; Situation Room guides, doesn't dictate. Build phases: v0 (predefined entry intents, fixed mapping, no AI), v1 (free text + Claude API intent classification), v2 (context-aware, pulls from user's Stage 0 data, past decisions, VT confidence trends). This is the layer that turns Arthur MCS from a workflow tool into a thinking partner. Sprint 3–4 target.

### Stage 0 Artifacts (Built & Deployed)

Input Panel, SWOT Analysis, TAM/SAM/SOM Calculator, Competitive Matrix, Value Proposition, Strategy Canvas, Mom Test Synthesizer, Forces of Progress, Kano Model, Competing Against Map, Assumption Tracker, Decision Gate (GO/PIVOT/KILL with 5 tabs).

All artifacts: auto-save to localStorage, PDF export, JSON save/load, Carter import capability.

## Three-Agent Workflow

| Agent | Role | Responsibilities |
|-------|------|-----------------|
| **Claude** | Build & Strategy | React components, architecture, deployment, UX decisions |
| **Carter (Manus)** | Intelligence & Deliverables | Deep research, competitive analysis, premium visual outputs (Customer Journey Maps, personas), structured JSON for framework import |
| **Gemini** | Analysis & Comparison | Strategic analysis, framework evaluation, methodology comparison |

### Carter ↔ Arthur MCS Data Flow

1. DK fills Input Panel → exports dispatch payload JSON
2. Pastes JSON to Carter with mission template specifying exact output schema
3. Carter returns structured JSON matching framework import schemas
4. DK imports into any framework via 📥 Import button
5. For premium visual outputs (journey maps, personas, reports): Carter produces the JSX component + paginated PDF. Claude integrates into the codebase.

## Current UI (v6)

- **Sidebar:** Icon-based stage navigation (no numbers, no artifacts). Cross-cutting modules (Radar + VT) at top. Settings, theme toggle, user profile at bottom. Overlay drawer on mobile, sticky on desktop.
- **Cockpit Main:** Personalized hero banner ("Good morning, David" + live status). Search field. Notification bell with badge. Recents row (4 cards). Favorites row (4 cards with ★). Active stage hero card with progress ring. Intelligence Radar card. VT widgets (Confidence Meter gauge + Stage Timer). Current Focus panel. Live stats from telemetry. 
- **Theme:** Light mode default, dark mode toggle. All components theme-aware via theme.js.
- **Demo Data:** RideX Jakarta rideshare scenario seeded on first load (13 localStorage keys).

## Quality Standard

Carter's V2 Customer Journey Map is the minimum quality bar for all artifacts: SVG icons, quoted sections, card layouts, paginated branded A4 PDF export, drop shadows, typographic detail, diamond/circle bullet variation.

## Roadmap

- **Now:** Ship v6 with VT + UX overhaul. Bug fixes.
- **Next Sprint:** Stage 1 build (9 frameworks) OR continued UX refinement.
- **Sprint 3–4:** Situation Room v0 (predefined intents, fixed question → stage → artifact mapping, no AI dependency). Validates user behavior before AI layer.
- **Jun/Jul:** Next.js + Supabase migration. Claude API in-app (no more copy-paste bridge). Real user accounts. Situation Room v1 (free text + AI intent classification).
- **Post-PMF:** RAG-powered intelligence, Situation Room v2 (context-aware routing from user data + VT), personal base rates, PMF gauge, multi-project analytics, team workspaces.

## Key Decisions

- Gates advise. They don't block. Human judgment at every transition.
- Situation Room guides. It doesn't dictate. Same philosophy — augment judgment, never replace it. The reframe: not "what frameworks should I use" but "what do I need to figure out next."
- No enterprise features until PMF validated for individual PMs and small teams.
- User Personas are NOT a standalone framework — user understanding distributed across JTBD, Mom Test, Value Prop, Forces of Progress. JTBD Persona Canvas added in Stage 2 per Carter's spec.
- Cost of Errors Framework (AI-Native Module 2) deferred — build core Stage 1 frameworks first.
- All prior names (DK PM OS, PM Mission Control, HYVE Mission Control) are deprecated. Use "Arthur MCS" or "Arthur · Mission Control System" only.

---

*Share this brief with any agent joining the project. It contains everything needed to contribute without re-reading the full conversation history.*
