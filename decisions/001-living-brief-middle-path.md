# Decision 001 — The PRD Question: Living Brief as Middle Path

**Date:** 2026-03-15  
**Status:** DECIDED  
**Agents Involved:** Claude (CTO Advisor)  
**Director:** DK (Founder & Product Lead)  
**Outcome:** SPECCED — Stage 4 Living Brief Engine

---

### Context

DK identified a critical product tension early in the build: every PM tool on the market promises PRD generation. ChatPRD's entire value proposition is "generate PRDs faster." Arthur MCS, with its 9-stage hypothesis-driven methodology, explicitly delays PRD generation until all gates have been passed. But DK recognized that this philosophical purity could become a product liability — if a user at Stage 0 asks "generate my PRD" and Arthur refuses, that PM walks away and never comes back.

DK framed the core question: "How do we give the user what they need without compromising the methodology that makes Arthur different?"

---

### DK's Strategic Vision

DK's insight was that the user's request for a PRD isn't wrong — it's premature. The PM doesn't actually want a PRD at Stage 0. They want a document that captures their thinking in a shareable format. The problem isn't the desire for a document — it's that they're calling it the wrong thing too early, and giving them a document labeled "PRD" would signal to their stakeholders that the problem is validated and the solution is defined, when neither is true.

DK pushed for a third path: "We need to give the user *something* when they ask for a PRD, even at Stage 0. Refusing outright makes Arthur feel rigid. But generating a fake PRD undermines everything we stand for. There has to be a middle ground."

This "Middle Path" framing — meeting users where they are without compromising methodology — became a recurring design principle across Arthur, originating from DK's thinking on this exact problem.

---

### The Debate

**Claude's initial position (CTO):**  
Generating a PRD at Stage 0 would undermine Arthur's entire value proposition. If we give users a PRD before they've validated the problem, we're no different from ChatPRD — just slower. The methodology exists precisely to prevent premature commitment to solutions.

**DK's counter:**  
Agreed on the principle, but challenged the implementation. "The user need is real. A PM at Stage 0 needs to communicate their thinking to stakeholders. They need *a document*. Can we give them a document that's honest about where they are — not a PRD, but something that serves the same communication need while being transparent about evidence quality?"

**DK's breakthrough idea:**  
"What if the document *evolves* with progress? At Stage 0 it's clearly labeled as early-stage thinking. As the user passes gates, the document upgrades. The PRD label only appears when it's actually earned." This concept — a single evolving document with honest evidence scoring — came directly from DK. Claude then architected the technical implementation.

**Claude's architecture response:**  
Built on DK's concept: the Living Brief Engine with progressive naming (Working Draft → Problem Brief → Strategy Brief → Opportunity Brief → Product Brief → PRD), Evidence Propagation flowing through every section, and Claude API draft generation constrained by evidence quality.

---

### The Decision

**What DK chose:**  
The **Living Brief Engine** — a single evolving document that progresses through named stages as evidence accumulates. Every claim carries a visible confidence score. The document naming convention makes maturity level explicit. PRD is the *final* name, earned only after full gate passage with user stories and acceptance criteria complete.

**What DK rejected:**  
(1) Refusing to generate any document before Stage 4 — "too hostile, violates Middle Path."  
(2) Generating a PRD at any stage with a disclaimer — "the label 'PRD' carries implicit authority regardless of disclaimers."  
(3) A separate "Quick PRD" feature that bypasses the framework — "would create a backdoor that undermines the entire methodology."

**Key tradeoff DK accepted:**  
Building the Living Brief Engine is significantly more complex than either refusing or generating a static PRD. It requires Evidence Propagation, stage-aware naming logic, and Claude API draft generation. DK chose product integrity over speed, understanding this was a Stage 4 feature that wouldn't ship until after the Supabase migration.

---

### What Shipped

- Living Brief Engine specced as Stage 4 feature (post-Supabase)
- Document naming progression locked: Working Draft → Problem Brief → Strategy Brief → Opportunity Brief → Product Brief → PRD
- Evidence Propagation requirement added to Living Brief spec
- Anti-PRD positioning crystallized by DK: "ChatPRD completes your document. Arthur completes your thinking."
- Middle Path established as a recurring design principle for all future product decisions

---

### Lessons / Patterns

**The Middle Path is DK's design philosophy.** When the methodology says "no" but the user need is real, DK's approach is never pure refusal or pure compliance. It's finding a third option that respects both the methodology and the user's legitimate need. The Living Brief is the canonical example.

**DK's competitive positioning instinct proved correct.** Weeks after this decision, a Reddit user independently validated the gap when they described ChatPRD as "optimized for speed not quality" and "missing strategic context." The Living Brief directly addresses both criticisms — not by being faster than ChatPRD, but by being more honest.

---

*Arthur MCS Decision Log — © 2026 Arthur · Mission Control System*
