# DEC-010: Stage 1 Landing Page — Cornerstone Design

**Date:** April 5, 2026
**Status:** APPROVED — LOCKED
**Participants:** DK (CEO/CPO), Claude (CTO)
**Trigger:** Friend's UX feedback + Daniel's competitive teardown + need for production-ready Stage Landing Page template
**Applies To:** All 9 Stage Landing Pages, Level 2 (Next.js + Supabase), Level 3 Sentinel
**Notion Spec:** [UX Consistency Spec — Cornerstone Page](https://www.notion.so/338e8e8a263881348708e229f58592b3)

---

## Summary

Designed and locked the Stage 1 Landing Page as the cornerstone template for all Stage Landing Pages in Arthur MCS. This was an ~8-hour iterative session producing 9+ React prototype versions, competitive research, and architectural decisions that affect every page in the product.

The landing page serves dual personas: PM III (working bottom-up through frameworks) and VP/CPO (making top-down gate decisions from leadership meetings).

---

## Decision 1: Page Structure (Top to Bottom)

**APPROVED**

1. Stage Header — colored dot + stage label + h1 name + description
2. 4 Stage Navigation Buttons — Strategy Brief, Frameworks, Research, Decision Gate
3. Related Missions — accordion on mobile, full grid on desktop
4. 4 Stat Boxes — Artifacts Touched, Readiness Criteria, Gate Status, Decision
5. Recommended Next Banner — with carry-forward count
6. Framework Cards Grid — 2-column desktop, 1-column mobile
7. Gate Preview Section (desktop only) — Summary Before Decision + Readiness Criteria checklist + GO/PIVOT/KILL buttons
8. Footer — © 2026 Arthur · Mission Control System

**Rationale:** This order prioritizes navigation (what can I do?), then context (where am I relative to others?), then status (how far along am I?), then action (what should I do next?), then work (the frameworks), then decision readiness (am I ready for the gate?).

---

## Decision 2: "Input Panel" Renamed to "Strategy Brief"

**APPROVED**

- Old name: "Input Panel" — generic, confusing, sounds like data entry
- New name: "Strategy Brief" — clear, implies high-level strategic direction
- Description: "Enter Vision, Constraints | View Carry-Forward"
- PM enters: vision statement, where to play, how to win, what NOT to do, North Star candidates, time horizon
- Plus carry-forward data review from Stage 0

**Rationale:** "Input Panel" was confusing because PMs couldn't tell if they were supposed to fill in framework data there or somewhere else. "Strategy Brief" makes it clear this is the high-level direction-setting document, not individual framework work.

---

## Decision 3: Stage Navigation Buttons

**APPROVED**

| Position | Button | Icon | Description | Behavior |
|----------|--------|------|-------------|----------|
| #1 | Strategy Brief | 📋 | Enter Vision, Constraints \| View Carry-Forward | Navigates to separate view |
| #2 | Frameworks | 🧩 | Utilize 9 Analysis Tools | Scrolls to framework section on same page |
| #3 | Research | 🔬 | AI Research Engine | Navigates to separate view |
| #4 | Decision Gate | ⚖️ | GO / PIVOT / KILL | Navigates to separate view |

- All buttons equal weight — NO highlighting, no active state
- Grid: 2×2 on mobile (<1024px), 1×4 on desktop (1024px+)
- Title: 16px, weight 600, #3D5066
- Description: 12px, #99A5B3
- Icon: 22px

**Rationale:** Strategy Brief is #1 to subtly guide PMs to set direction first. Frameworks scrolls down because the framework cards are already on this page — navigating away would be confusing. No highlighting because this is a landing/navigation page, not a "you are here" indicator.

---

## Decision 4: Related Missions Component

**APPROVED — LOCKED (Mobile view locked separately)**

### Naming
- Renamed from "Mission Context" to "Related Missions"
- Shows missions under the same Product that the current mission belongs to

### Visual Design
- Colored initial badges (no emoji) — Linear-style professional look
- Gray borders only (#E0E4EA) — no color coding on boxes or stage numbers
- Mission name: 14px, weight 600, consistent across all cards
- Stage numbers removed from sibling cards (V8)
- Container: "Related Missions" left + "Product: [Product Name]" right

### Ownership Rules
- Progress bar + "You" tag shown ONLY on missions owned by current user
- Other PMs' missions show "Owner: [Name]" only — no progress bar
- Hero card (active mission): "You" + "ACTIVE" tags + progress bar
- "You" tag uses styled blue pill badge (#EAF2FB background, #1B4F72 text) — same style on hero and sibling cards

### Dynamic Grid (Desktop 1024px+)
- 0 siblings: section hidden entirely
- 1+1: two boxes, 50/50
- 1+2: three boxes, 33/33/33
- 1+3: four boxes, 25/25/25/25
- 1+4: hero left (33%) + 2×2 siblings right (66%), hero spans 2 rows

### Mobile (<1024px) — LOCKED
- Collapsible accordion, default CLOSED
- Header: "Related Missions (count) ▾" with blue pill badge
- Product name on second line
- When expanded: hero full-width top, siblings in rows of 2
- DO NOT CHANGE mobile layout without explicit DK instruction

### Team Tier Visibility (Deferred to Aug-Sept 2026)
- PMs see only missions they own or are members of
- CPO/VP role gets product-wide visibility
- Maps to mission_members table + role field

**Competitive Research:** Craft.io and Productboard use NO emoji for projects. Linear uses SVG icons with colored backgrounds. Notion is the outlier (general-purpose tool). Arthur follows Linear's professional approach with colored initial badges.

---

## Decision 5: No Separate Tablet Layout

**APPROVED**

- Two modes only: mobile (<1024px) and desktop (1024px+)
- No separate tablet breakpoint
- iPad Pro 11" landscape (1194px) → desktop mode
- iPad Pro 12.9" portrait (1024px) → desktop mode
- iPad Air landscape (1180px) → desktop mode
- All tablets in portrait → mobile mode

**Rationale:** A separate tablet layout was causing inconsistencies and layout headaches (hero-left + 2×2 grid looked bad with varying mission counts). Simplifying to two modes eliminates an entire category of layout bugs.

---

## Decision 6: Gate Preview on Landing Page (Desktop Only)

**APPROVED**

Shows current gate readiness on the landing page without navigating to Decision Gate:

### Components (top to bottom within outer white box)
1. "Summary Before Decision" title (18px, bold, black)
2. Three score boxes: Readiness Criteria (0/7), Forces Assessment (0), Strategy Stress Tests (0/0) — box titles black (#1A2332)
3. 🚦 Readiness Criteria checklist — 7 items in 2-column grid, 16px checkboxes, 14px text (#3D5066)
4. Divider line
5. GO / PIVOT / KILL buttons — 180px wide, centered, 18px font, colored borders on tinted backgrounds
6. Tagline: "Gates advise. They don't block. You decide." — 14px, black, italic

**Hidden on mobile** — mobile is for review/monitoring, not working.

### Dual Persona Value
- **PM III:** Tracks readiness progress over days/weeks. "I'm at 4/7 — keep going" or "6/7 — time to decide."
- **VP/CPO:** Comes from leadership meeting, needs quick gate action. Can see readiness state and go straight to Decision Gate — or KILL the mission from context visible on the landing page.

**Rationale:** Having GO/PIVOT/KILL visible on the landing page is the first step toward CPO View. When Decision Gate Participation ships (Team Tier, Aug-Sept 2026), VP/CPO can register their stance directly from this preview.

---

## Decision 7: Decision Gate Architecture

**CONFIRMED**

### PM Input Points (Only Two)
1. **Strategy Brief** — vision, constraints, carry-forward review
2. **Frameworks** — whichever 3-4-5 the PM chooses to fill (out of 9 available)

### Gate Auto-Generation (Claude API, Sprint 13+)
- **Tab 1 — Strategy Brief:** Auto-synthesized from Strategy Brief inputs + framework data + carry-forward. PM reviews, doesn't write.
- **Tab 2 — Readiness Criteria:** Auto-scored against 7 criteria. Checks outcomes not framework completion.
- **Tab 3 — Strategy Stress Test:** AI-generated challenges to the strategy.
- **Tab 4 — Forces Assessment:** PM manually scores 4 sliders (Push/Pull/Anxiety/Habit). ~30 seconds.
- **Tab 5 — GO/PIVOT/KILL:** Summary panel + mandatory decision notes + three buttons.

### Key Insight: Framework Completion ≠ Readiness
- PMs will NEVER complete all 9 frameworks (typically 3-4, rarely 5)
- Readiness Criteria check outcomes: "Is the strategy articulated?" not "Did you fill in PESTLE?"
- "Artifacts Touched: 3/9" is informational. "Readiness Criteria: 6/7" is what matters for the gate.
- A PM who fills 3 frameworks well can pass 6/7 criteria. A PM who fills 9 poorly might pass 2/7.

### 7 Readiness Criteria for Stage 1
1. Strategy articulated in 1-2 paragraphs
2. One North Star Metric selected with rationale
3. 3-5 input metrics identified
4. Explicit tradeoffs documented
5. At least one thing NOT optimizing for
6. OKRs defined with measurable key results
7. DACI established for key decisions

---

## Decision 8: Mobile vs Desktop Differentiation

**APPROVED**

- **Mobile (<1024px):** Review/monitoring experience. No gate preview. Accordion for Related Missions. Compact framework cards (5% reduced padding). 2×2 nav buttons. Footer.
- **Desktop (1024px+):** Premium working experience. Full gate preview with readiness criteria + GO/PIVOT/KILL. Expanded Related Missions. 1×4 nav buttons. Footer.

**Rationale:** 90% of PMs will not use their phones to complete PESTLE or V2MOM. Mobile is for checking status, reviewing data, and monitoring progress — not data entry. Desktop gets the premium working features.

---

## Decision 9: Sidebar Behavior

**APPROVED**

- Desktop (1024px+): sidebar always visible, 280px, solid #FFFFFF, border #E0E4EA
- Mobile + tablet portrait (<1024px): sidebar CLOSED by default, opens as full-screen overlay with semi-transparent backdrop, closes on selection
- Situation Room icon: 🎖️ (confirmed from Agent Brief)
- "Intelligence" replaces "Cross-Cutting" as section label (Ambient Radar + Validation Telemetry)

---

## Decision 10: Cornerstone Enforcement

**APPROVED**

The Stage 1 Landing Page design is now the **binding cornerstone** for all 9 Stage Landing Pages:

- Documented in Notion: "Level 2 Stage 1 Landing — Cornerstone Page" section in UX Consistency Spec
- All agents (Claude, Grok, Daniel, Gemini, Carter) must verify compliance before pushing stage landing page code
- No deviations without explicit DK approval
- If a component is not in this spec, it doesn't belong
- If a font/color/spacing differs, it's a bug
- React reference: arthur-pro-tier.jsx (V8 final)

---

## Alternatives Considered

### Mission Icons
- **Emoji (rejected):** Craft.io and Productboard don't use emoji. Looks unprofessional for a PM tool.
- **Auto-generated from name (rejected):** Not technically feasible without AI image generation. Overengineered.
- **Colored initial badges (approved):** Linear-style. Professional, scalable, requires no user action.

### Stage Color Coding on Related Missions
- **Colored top borders per stage (rejected):** Made it look like Slack. Too many colors.
- **Stage numbers in stage color (rejected):** Still too many colors for a contextual component.
- **No color, dark gray text (approved):** Clean, professional. Color belongs inside the stage workspace, not on sibling cards.

### Tablet-Specific Layout
- **Three breakpoints (rejected):** Hero-left + 2×2 grid was inconsistent with varying mission counts.
- **Two breakpoints (approved):** Mobile (<1024px) and desktop (1024px+). Simpler, fewer bugs, consistent.

### Flow Pills (Input → Frameworks → Research → Gate)
- **Linear sequence pills (rejected):** Confused users — this is a landing/navigation page, not a sequential workflow.
- **4 navigation buttons (approved):** Clear, equal weight, each takes you somewhere specific.

---

## Files

| File | Description |
|------|-------------|
| arthur-pro-tier.jsx | V8 final — Pro tier demo with Stage 1 landing page |
| arthur-pro-tier-v7.jsx | V7 backup for rollback |
| arthur-free-tier.jsx | Free tier demo with Stage 0 landing page |

---

## Version History

| Version | Changes |
|---------|---------|
| V1-V3 | Initial builds, rendering issues, sidebar fixes |
| V4 | Solid white sidebar, correct icons, proper mobile overlay |
| V5 | 6 missions → 5 missions, Mission Context → Related Missions |
| V6 | Colored initial badges replace emoji, sidebar breakpoint at 1024px |
| V7 | Desktop locked — gray borders, no color coding, compact sibling cards |
| V7 → V8 | Dynamic grid (1+1, 1+2, 1+3, 1+4), two breakpoints only, mobile accordion |
| V8 | Stage nav buttons, Strategy Brief rename, Gate Preview, footer, mobile compact |
| V8 final | Gate Preview refinement — outer box, 2-col readiness checklist, bigger fonts, black text |

---

## Notion References

- [UX Consistency Spec — Cornerstone Page](https://www.notion.so/338e8e8a263881348708e229f58592b3)
- [Session Update — April 5, 2026 (Evening UX Iteration)](https://www.notion.so/339e8e8a2638814c9527d96616b5a59e)
- [Session Update — April 5, 2026 (Final Landing Page Iteration)](https://www.notion.so/339e8e8a263881868ef5cceabceefbab)
- [Session Update — April 5, 2026 (Major UX/UI Refinement)](https://www.notion.so/339e8e8a26388196acc8e5b22284a0bf)
- [ThinkSpace & Focus State Engine — Complete Spec](https://www.notion.so/339e8e8a263881cdb222f2a46bf4840d)

---

*© 2026 Arthur · Mission Control System*
