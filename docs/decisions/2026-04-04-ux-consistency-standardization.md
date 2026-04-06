# Decision Log: UX Consistency Standardization
**Decision ID:** DEC-010
**Date:** April 4-5, 2026
**Decision:** Apply P0+P1 UX fixes during all CP7 Level 2 ports. Cornerstone Landing Page spec is BINDING.
**Decided By:** DK (CEO/CPO) + Claude (CTO)
**Status:** ACTIVE — LOCKED April 5, 2026

## Context
During CP7 Phase 2 port (Vite → Next.js), a full Level 1 codebase audit revealed 21 files contaminated with "Carter" (internal development agent) references that were never meant to be client-facing. Additionally, significant UX inconsistencies across 27 stage pages were identified. On April 5, the Stage 1 Landing Page was locked as the Cornerstone design — all 9 stage landings must follow this structure exactly.

## Decision
1. ALL CP7 Level 2 ports must apply P0 and P1 fixes during the port.
2. "Carter" / "Dispatch" / "Import from Carter" references are permanently removed from the product UI.
3. The Level 2 Stage 1 Landing — Cornerstone Page (Notion page 338e8e8a-2638-8134-8708-e229f58592b3) is BINDING for ALL 9 stage landing pages across L2 and L3.
4. No deviations from the Cornerstone spec without explicit DK approval.
5. All agents (Claude, Grok, Daniel, Gemini, Carter) must verify compliance before pushing code.
6. P2 fixes (gate expansion, detailed criteria objects) follow in a separate sprint.

## Cornerstone Landing Page Structure (LOCKED)
1. Stage Header (orange dot + label + h1 + description)
2. 4 Stage Navigation Buttons (2x2 mobile, 1x4 desktop)
3. Related Missions (accordion mobile, grid desktop)
4. 4 Stat Boxes (Artifacts Touched, Readiness Criteria, Gate Status, Decision)
5. Recommended Next Banner
6. Framework Cards Grid
7. Gate Preview Section (desktop only — readiness criteria + GO/PIVOT/KILL)
8. Footer

**Key changes from Level 1:**
- "Input Panel" renamed to "Strategy Brief" — "Enter Vision, Constraints | View Carry-Forward"
- Frameworks button scrolls to section (does NOT navigate away)
- Gate Preview is desktop-only with Summary Before Decision scores + readiness checklist
- Related Missions container with colored initial badges (Linear-style, no emoji)
- Mobile: no gate preview, accordion for Related Missions
- Sidebar: closed <1024px, always-on >=1024px

**React reference:** arthur-pro-tier.jsx (V8 final)

## P0 Fixes (Remove Before Any PM Sees This)
- Remove ALL "Carter" references (21 files)
- Remove "Import" button from Stage 1 gate
- Remove "Dispatch" language from inputs
- Standardize gate tagline: "Gates advise. They don't block. You decide."

## P1 Fixes (Apply During CP7 Port)
- Stage 1 Landing: "Completion" → "Decision"
- Stage 5-8 Landing: "Readiness" → "Readiness Criteria"
- Add back links to all Input Panels
- Standardize gate button set (Save/Export/Clear)
- Landing group desc "Dispatch To Carter" → "Research & Analysis"

## P2 Fixes (Follow-up Sprint)
- Add Brief + Forces tabs to Stage 5-8 gates
- Convert gate criteria to detailed objects
- Stage 4 gate: add 2 criteria to reach 7
- Add section nav to inputs with >4 fields
- Add flow hint pills to Stage 5-8 landings

## Exceptions
- Stage 4 "Brief Level" stat box — KEEP (decided feature, Living Brief progressive naming)
- Stage 7 color #C0392B — already correct
- Generic Import/Export JSON buttons on frameworks — KEEP (remove Carter prompt text only)

## Spec Locations
- Notion: Product Hub → UX Consistency Spec (Corrected from L1 Audit) — page 338e8e8a-2638-8134-8708-e229f58592b3
- File: ARTHUR_MCS_UX_CONSISTENCY_SPEC_FINAL.md
- Memory: Item #30

## Impact
- Phase 2 Complete (Stages 0-8): P0+P1 applied during port
- Phase 3 (Frameworks): Apply during port (14 framework files with Carter refs)
- All future landing pages: Must comply with Cornerstone spec
