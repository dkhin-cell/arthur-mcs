# Decision 002 — Guided Entry Layer Killed, Intent Merged

**Date:** 2026-03-28  
**Status:** DECIDED  
**Agents Involved:** Claude (CTO Advisor) · Carter (Research/Data)  
**Director:** DK (Founder & Product Lead)  
**Outcome:** KILLED as standalone → MERGED into existing components

---

### Context

DK identified a critical first-time user problem: new users landing on the Cockpit saw a dashboard with no data and no clear entry point. His product instinct — shaped by years of observing how users interact with complex systems — told him that the first 60 seconds determine whether a PM stays or leaves. Arthur needed a guided entry experience.

---

### DK's Original Vision

DK designed the Guided Entry Layer concept: a full-screen overlay inspired by Claude.ai's centered input pattern. His spec was detailed — "What are you working on today?" centered entry box, 6 QuickJump chips (Validate, Roadmap, PRD, Scout, Radar, VT), a dedicated `GuidedEntryLayer.jsx` component with `EntryBox`, `QuickJumpChips`, and `EntryRouter.js`. Phase A keyword matching, Phase B Claude API intent classification. Toggle to classic Cockpit view.

DK's thinking was strategic: the guided entry addresses the analyst-identified W2 weakness (time-to-value) by giving new users an immediate action path rather than an empty dashboard.

---

### The Debate

**Claude's pushback (CTO):**  
GEL was creating a parallel entry system alongside the Cockpit. Two components doing overlapping jobs — the Cockpit search box already existed. At Level 2 with mission cards, GEL would conflict with the Cockpit's role as mission command center. Architecturally: scope creep disguised as UX improvement.

**DK's critical evaluation:**  
DK didn't defend GEL for its own sake. He separated the *intent* from the *implementation*: "The user need is real — new users need guidance. The Cockpit search box is passive. The empty state is especially bad. But you're right that building a separate component creates maintenance burden."

This is the key moment: DK recognized that Claude's architectural concern was valid, but also held firm that the user problem was real and couldn't be dismissed. He pushed for a synthesis: "Can we upgrade what exists to carry the GEL intent instead of building something new?"

**The merge decision (DK's directive):**  
DK directed the solution: upgrade three existing touchpoints instead of building one new component. Cockpit search box gets the proactive placeholder + 8 chips. Situation Room gets improved keyword matching. Empty State Cockpit becomes its own designed experience for zero-data users. At Level 2, chips become permanent cross-mission shortcuts with Mission Picker modal.

---

### The Decision

**What DK chose:**  
Kill GEL as standalone. Merge intent into existing components. Phase B Claude API classification stays planned for Jun/Jul but lives in Situation Room.

**What DK rejected:**  
The full GEL overlay with toggle, dedicated component tree, and separate routing logic — his own original spec.

**Key tradeoff DK accepted:**  
The distributed approach (guidance spread across 3 touchpoints) is less obvious than a single full-screen "start here" moment. DK accepted this risk, mitigated by the ESC design — when there's no data, the Cockpit *becomes* the guided entry.

---

### What Shipped

- Empty State Cockpit deployed with `hasStageData()` detection, 8 locked chips, Browse By Stage accordion, Situation Room hint
- Cockpit search box upgraded with intent-aware placeholder
- GEL removed from Sprint 3 backlog and Notion Product Hub
- Level 2 Cockpit spec updated: chips persist as cross-mission shortcuts

---

### Lessons / Patterns

**DK kills his own features when the architecture says no.** This is rare in founders — most defend their original vision. DK evaluated Claude's technical pushback on its merits, agreed with the diagnosis, and directed a better solution that preserved his strategic intent. This pattern — "kill the implementation, keep the intent" — became the "Merge before you build" principle.

**Separating intent from implementation is a VP-level product skill.** A junior PM would have either defended GEL or abandoned the user need entirely. DK did neither — he held the user problem as non-negotiable while accepting that his proposed solution was wrong. Then he directed the agents toward a synthesis that addressed the problem without the architectural cost.

---

*Arthur MCS Decision Log — © 2026 Arthur · Mission Control System*
