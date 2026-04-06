# DEC-011: ThinkSpace — Spatial Thinking Canvas

**Decision ID:** DEC-011
**Date:** April 5, 2026
**Participants:** DK (CEO/CPO), Claude (CTO), Daniel (COO)
**Status:** APPROVED
**Category:** UX/UI Architecture
**Notion:** https://www.notion.so/339e8e8a26388169be55ca8846b4b6e3

---

## Context

During competitive analysis of Craft.io, Productboard, and Airtable, DK's friend (2x founder, senior data scientist) tested the Arthur MCS Cockpit and flagged three critical UX issues: (1) main screen is overwhelming, (2) stage pages have too many elements competing for attention, (3) navigation between stages is confusing beyond the sidebar.

Daniel (COO) produced a deep competitive teardown identifying that Craft and Productboard are "systems of record" while Arthur must be a "system of decision." He identified Craft's drag-and-drop prioritization matrix and Guru view layer as patterns worth studying.

The team identified that several Arthur frameworks are inherently spatial — they work best when PMs can plot items on a 2D grid rather than filling in form fields.

---

## Decision

Build **ThinkSpace** — a reusable drag-and-drop 2D spatial thinking canvas component. One component, many configurations. Each framework provides its own axis labels, quadrant definitions, and carry-forward data source.

---

## Key Design Principles

1. **"The position IS the data."** When a PM drags an item to coordinates (25, 85) on a Risk vs Certainty grid, we store risk=85, certainty=25. Qualitative input, quantitative output.
2. **Canvas is always Step 2, never Step 1.** Flow: Input (list items) → Plot (ThinkSpace canvas) → Insight (auto-generated summary) → Action (stage-appropriate CTA).
3. **Guided + Freeform modes.** Guided mode shows one item at a time with pulse animation. Freeform shows all items at once.
4. **Carry-forward staging.** Items from prior stages arrive in an amber staging area at the bottom. PM drags each to where they think it belongs. Imported items are amber until placed.
5. **Coordinate readout while dragging.** Tooltip shows exact scores (e.g., "Risk: 82 | Certainty: 24 → Test First").
6. **Auto-generated insight summary.** After 3+ items plotted, summary panel shows quadrant distribution, top priority items, and stage-appropriate CTA.

---

## Frameworks Using ThinkSpace (12 across 6 stages)

- **Stage 0:** Competing Against Map, Forces of Progress
- **Stage 1:** RICE Priority Matrix, Product Strategy Canvas
- **Stage 2:** Assumption Map, Kano Model, Opportunity Solution Tree
- **Stage 3:** UX Hypothesis Canvas, Design Validation Matrix
- **Stage 4:** Dependency Map, Feature Sequencing
- **Stage 7:** Competitive Landscape Active

---

## Competitive Advantage

Daniel's assessment: "This is the first thing I've seen that Craft/Productboard cannot easily copy." Craft and Productboard are architecturally built on tables and discrete fields. ThinkSpace captures spatial and behavioral data that their data models cannot represent without re-architecture.

ThinkSpace coordinates feed directly into Validation Telemetry (confidence scoring) and eventually Sentinel (clustering, cross-framework reasoning, scenario simulation).

---

## Build Target

Sprint 12 — alongside Stage 1 framework build. First deployment on RICE Priority Matrix (Stage 1).

---

## Related Decisions

- **ThinkSketch** (lo-fi wireframe drawing canvas) deferred to Sprint 15+. Separate component.
- **UX Consistency Spec** (DEC-010) P0+P1 fixes apply during CP7 port — ThinkSpace is additive, not a replacement.

---

*© 2026 Arthur · Mission Control System*
