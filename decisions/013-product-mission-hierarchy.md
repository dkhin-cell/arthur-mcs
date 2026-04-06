# DEC-013: Product → Mission Hierarchy in Sidebar

**Decision ID:** DEC-013
**Date:** April 5, 2026
**Participants:** DK (CEO/CPO), Claude (CTO), Daniel (COO), Grok (VP Engineering)
**Status:** APPROVED (Unanimous — Option B)
**Category:** Information Architecture
**Notion:** https://www.notion.so/339e8e8a2638811e8ca9eeb66d6d5d8c

---

## Context

During UX/UI refinement, the sidebar header was redesigned to show two levels of context: Product (top-level container) and Mission (specific workstream). This introduced a Product → Mission hierarchy that needed formal decision.

**Example:**
- Product: Uber SEA Phase 3 Jakarta
  - Mission: RideX Jakarta (rideshare launch) — Stage 1
  - Mission: UberEats Jakarta (food delivery pilot) — Stage 0
  - Mission: Driver Supply Program (recruitment) — Stage 2

---

## Options Considered

**Option A — Product created at onboarding.** Every mission must belong to a product. Extra step during onboarding.

**Option B — Product is optional, auto-created from first mission.** PM creates a mission directly. Arthur auto-creates a product container behind the scenes. If PM adds a second mission, they can group them. Frictionless onboarding.

**Option C — Product level only in Pro and above.** Free tier has no product concept. Feels artificial — gates structure not value.

---

## Decision: Option B — Implicit Product Model (v1)

**Unanimous across all agents.**

### Daniel (COO) Assessment
- Option A breaks PLG (adds friction before value)
- Option C gates structure not value (feels artificial)
- Option B maps cleanly to tiers: Free = product invisible, Pro = product emerges when 2+ missions, Sentinel = portfolio later
- Key insight: "Mission is the atomic unit of PM work." Not Feature, not Epic, not Task. This is Arthur's differentiation.
- "If you choose A, you act like B2B SaaS PM. If you choose B, you act like PLG founder."

### Grok (VP Engineering) Assessment
- New `products` table: id, owner_id, name, description, ownership_type, created_at, updated_at
- Add `product_id` foreign key to existing `missions` table
- Migration path: On first mission creation, auto-insert product row with same name. Later grouping via "Move to Product" UI
- Effort: Option B = Small (2-3 days)

### Claude (CTO) Assessment
- Option B preserves PLG velocity, keeps schema clean for future portfolio views, no onboarding friction
- Products table ships in Sprint 12 as part of Supabase schema update
- Product label hidden for single-mission users, revealed when second mission created

---

## Implementation

- **Free tier:** 1 mission, product concept invisible
- **Pro tier:** Product grouping visible when 2+ missions exist
- **Sentinel/Enterprise:** Portfolio views across products (Sprint 18-19)
- **Sprint 12:** Ship products table + sidebar UX update

---

## Competitive Positioning

- Craft.io: Portfolio → Initiative → Epic (enterprise-heavy)
- Productboard: Product → Features (feedback layer)
- Arthur: Product (context) → Missions (execution units) → Stages (state machine)
- Others organize work. Arthur organizes thinking + execution state.

---

*© 2026 Arthur · Mission Control System*
