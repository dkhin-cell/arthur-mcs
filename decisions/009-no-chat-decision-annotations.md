# Decision 009 — No Internal Chat: Decision Annotations as the Collaboration Model

**Date:** 2026-04-03  
**Status:** DECIDED  
**Agents Involved:** Claude (CTO Advisor) · Daniel (COO Advisor)  
**Director:** DK (Founder & Product Lead)  
**Outcome:** SPECCED — Decision Annotations, Reactions, and Gate Participation for Team Tier

---

### Context

DK was pressure-testing the Team Tier architecture (target Aug–Sept 2026) when he raised a fundamental question that neither Claude nor Daniel had proactively addressed: how do team members actually collaborate on decisions inside Arthur? DK framed it with a deliberate scope test — "whether it's a 12-person startup or a 20,000-strong corp like Uber, is there a way they can communicate through Arthur? Not just Slack push/receive. I mean something where they can instantly share and align."

This question exposed a gap in the existing Team Tier spec. Both Claude and Daniel had designed the multi-tenant data layer (RLS, mission_members, org scoping) but neither had addressed the human interaction model.

---

### DK's Strategic Framing

DK approached this from his operational experience — having worked across both small teams and large organizations in the SEA mobility space. He recognized that a 12-person startup where everyone is in one Slack channel has fundamentally different coordination needs than 5% of Uber (roughly 1,000 people) spread across multiple product teams and geographies.

His question wasn't "should we build chat?" — it was "what does decision alignment look like at both scales, and can one architecture serve both?" This multi-scale thinking forced the agents to design a system that works universally rather than optimizing for one company size.

---

### The Debate

**Claude's initial position (CTO):**  
No chat. No messaging. No notification inbox. Arthur is a decision system, not a communication system. Communication happens in Slack. Arthur pushes structured context into Slack channels. Proposed lightweight alternative: simple comments on artifacts.

**DK's evaluation of Claude's position:**  
DK accepted the "no chat" principle immediately — he understood that building a messaging system would distract from Arthur's core value. But he pressed further: "So it's just Slack push/receive and updates? No live interaction where they can instantly share something?" This question pushed Claude to articulate the "through Arthur" model more concretely — Supabase Realtime for live data updates, shared situational awareness rather than messaging.

**Daniel's pushback (COO) — escalating DK's concern:**  
Daniel took DK's question and sharpened it into a product risk: if Arthur only has dashboards and Slack push-outs, it becomes a "read-only intelligence system" where PMs still coordinate decisions elsewhere. Arthur becomes secondary, not primary.

Daniel's key reframe, building on DK's instinct: "Communication happens outside. But decision alignment happens inside."

**Daniel's concrete proposal:**

1. **Decision Annotations** — structured, typed input (Evidence Challenge, Risk Flag, Data Update) with impact scoring that feeds back into confidence computation
2. **Lightweight Reactions** — agree/disagree/needs_evidence as system-aware signals, not social gestures
3. **Decision Gate Participation** — tracking who approved, who raised concerns, who blocked, computing alignment alongside confidence

**DK's validation of Daniel's model:**  
DK asked the critical follow-up that shaped the final architecture: "Where will team members actually see these? Will it show up on the screen? Or will it be patched through VT and SR?" This forced Claude to map the entire UI surface area — inline on artifacts, summarized on Decision Gates, through VT on the Cockpit, and feeding into Situation Room routing. Without DK's question, the annotation system could have been specced as a backend feature without clear UI integration.

**Claude's revised position (CTO):**  
Accepted Daniel's three upgrades. Proposed phased build: annotations + gate participation at Team Tier launch, reactions as fast follow. Added `resolved` boolean to annotations so addressed challenges stop depressing confidence scores.

---

### The Decision

**What DK approved:**  
Three new Supabase tables at Team Tier launch: `decision_annotations`, `annotation_reactions`, `decision_participants`. Extend `decision_gates` with `alignment_score`. All subscribe to Supabase Realtime.

**Where annotations surface (per DK's requirement for visibility):**

- Inline on artifacts — colored dot indicator, expandable to show annotation details + reactions
- Summarized on Decision Gates — evidence challenge counts, participant stance indicators (green/amber/red)
- Through VT on Cockpit — confidence + alignment scores side by side, Mission Pulse notifications when alignment drops
- Situation Room reads alignment from Mission Brief and modifies routing when disagreement is unresolved

**What DK rejected:**  
Internal chat/messaging, notification inbox, cursor presence/typing indicators, comments without system weight.

**Arthur's official position (set by DK):**  
Slack is where teams talk. Arthur is where teams decide. This distinction is non-negotiable.

**Key tradeoff DK accepted:**  
Building structured decision alignment features is more complex than a chat widget or plain comments. The annotations, reactions, and participation tracking all need to integrate across the entire pipeline (artifacts → VT → Cockpit → SR → Claude API gate assessment). DK chose depth of integration over speed of delivery, understanding that the compound effect — every team interaction making the decision system smarter — is Arthur's moat.

---

### What's Specced

- 3 new tables: `decision_annotations`, `annotation_reactions`, `decision_participants`
- Schema includes RLS policies scoped to org + mission membership
- Supabase Realtime subscriptions for all three tables
- Claude API gate assessment upgraded to factor in annotation summaries and participant stances
- VT extended to compute alignment score alongside confidence
- Build phased: Phase 1 (annotations + participation) with Team Tier launch, Phase 2 (reactions) as fast follow

---

### Lessons / Patterns

**DK's multi-scale thinking drives architecture.** The question "does this work for 12 people AND 20,000?" forced a design that's universal rather than niche. This is a product leadership pattern — testing architecture against extreme use cases before building, not after.

**DK orchestrates agent disagreement into convergence.** Claude proposed comments. Daniel said comments weren't enough. DK didn't pick a winner — he asked the question ("where does this show up?") that forced both agents to converge on a specific, integrated solution. This is the Director role in action: not deciding between agents, but directing them toward synthesis.

**"Communication happens outside. Decision alignment happens inside."** This principle, surfaced through the DK → Claude → Daniel → DK feedback loop, is now Arthur's official position on team collaboration. It originated from DK's initial question about real-time sharing, was refined through two rounds of agent debate, and was validated by DK's UI visibility requirement.

---

*Arthur MCS Decision Log — © 2026 Arthur · Mission Control System*
