# Arthur MCS — UX Consistency Spec (Corrected)
## Based on Full Level 1 Codebase Audit + Cornerstone Page Lock

**Date:** April 4-5, 2026
**Author:** Claude (CTO) — corrected from Level 1 source audit
**Cornerstone Lock:** DK (CEO/CPO) — April 5, 2026
**Scope:** All 27 stage pages (9 landings + 9 inputs + 9 gates) + 20 Stage 1-2 framework files
**Notion Source of Truth:** Page 338e8e8a-2638-8134-8708-e229f58592b3
**React Reference:** arthur-pro-tier.jsx (V8 final)

---

## BINDING: Level 2 Stage 1 Landing — Cornerstone Page

**All 9 Stage Landing Pages across Level 2 and Level 3 Sentinel MUST follow this structure exactly. No deviations without explicit DK approval. All agents must verify compliance before pushing code.**

### Page Structure (Top to Bottom)
1. **Stage Header** — Orange dot + "STAGE N" label (12px, 700, #99A5B3) + Stage name h1 (26px, 750, #1A2332) + Description (14px, #6B7D8F)
2. **4 Stage Navigation Buttons** — Grid: 2x2 mobile, 1x4 desktop. All equal weight, no highlighting. Order: Strategy Brief (#1), Frameworks (#2), Research (#3), Decision Gate (#4)
3. **Related Missions** — Accordion on mobile (default closed), grid on desktop. Colored initial badges (Linear-style, no emoji). Gray borders only.
4. **4 Stat Boxes** — Artifacts Touched, Readiness Criteria, Gate Status, Decision
5. **Recommended Next Banner** — Blue bg (#EAF2FB), border #C5DAF0
6. **Framework Cards Grid** — 2-column desktop, 1-column mobile
7. **Gate Preview Section (Desktop Only)** — Summary Before Decision + Readiness Criteria checklist (7 items, 2-col) + GO/PIVOT/KILL buttons + tagline
8. **Footer** — "© 2026 Arthur · Mission Control System"

### Key Changes from Level 1
- "Input Panel" renamed to "Strategy Brief"
- Frameworks button scrolls to section (does NOT navigate away)
- Gate Preview is desktop-only
- Related Missions with colored initial badges (no emoji)
- Sidebar: closed <1024px, always-on >=1024px

### Typography
| Element | Size | Weight | Color |
|---|---|---|---|
| Stage label | 12px | 700 | #99A5B3 |
| Stage name (h1) | 26px | 750 | #1A2332 |
| Stage description | 14px | 400 | #6B7D8F |
| Nav button title | 16px | 600 | #3D5066 |
| Nav button desc | 12px | 400 | #99A5B3 |
| Stat box label | 11px | 650 | #99A5B3 |
| Stat box value | 22px | 700 | #1A2332 |
| Framework card name | 14px | 650 | #1A2332 |
| Framework card desc | 13px | 400 | #6B7D8F |
| Footer | 12px | 400 | #99A5B3 |

### Colors
| Usage | Color |
|---|---|
| Background | #F5F7FA |
| Surface / cards | #FFFFFF |
| Border default | #E0E4EA |
| Navy primary | #1B4F72 |
| Active/highlight bg | #EAF2FB |
| Text primary | #1A2332 |
| Text secondary | #3D5066 |
| Text muted | #6B7D8F |
| Text disabled | #99A5B3 |
| Orange accent | #E67E22 |
| GO green | #27AE60 |
| KILL red | #E74C3C |

---

## CRITICAL FIX: Remove All "Carter" / "Dispatch" References

**"Carter" must NEVER appear in client-facing UI.** 21 files affected. Remove all `importFromCarter()` functions, "Import from Carter" buttons, "Dispatch To Carter" group labels, "Awaiting Dispatch" status text. Replace with "Research & Analysis", "Not Started", "Export Data".

Keep generic Import/Export JSON buttons — just change prompt text from "Paste Carter's JSON:" to "Paste JSON data:"

---

## P0 Fixes (Remove Before Any PM Sees This)

| Fix | Files |
|---|---|
| Remove ALL Carter references | 21 files |
| Remove Import from Stage 1 gate | 1 file |
| Remove Dispatch language from inputs | 3 files |
| Standardize gate tagline | 9 files |

## P1 Fixes (Apply During CP7 Port)

| Fix | Files |
|---|---|
| Stage 1 Landing: "Completion" → "Decision" | 1 file |
| Stage 5-8 Landing: "Readiness" → "Readiness Criteria" | 4 files |
| Add back links to Input Panels | 8 files |
| Standardize gate buttons (Save/Export/Clear) | 9 files |
| Landing group "Dispatch To Carter" → "Research & Analysis" | 3 files |

## P2 Fixes (Follow-up Sprint)

| Fix | Files |
|---|---|
| Add Brief + Forces tabs to Stage 5-8 gates | 4 files |
| Convert gate criteria to detailed objects | 7 files |
| Stage 4 gate: add 2 criteria to reach 7 | 1 file |
| Add section nav to inputs with >4 fields | 4 files |
| Add flow hint pills to Stage 5-8 landings | 4 files |

## Exceptions

- Stage 4 "Brief Level" stat box — KEEP (decided feature)
- Stage 7 color #C0392B — already correct
- Generic Import/Export JSON buttons on frameworks — KEEP

---

## Implementation Note

When porting Level 1 → Level 2, apply ALL P0 and P1 fixes during the port. Do NOT port Carter references, inconsistent labels, or missing back links. Port the corrected version. P2 fixes are content additions for a follow-up sprint.

The Cornerstone Page in Notion is the single source of truth for landing page design. If this file and Notion conflict, Notion wins.

---

*© 2026 Arthur · Mission Control System*
