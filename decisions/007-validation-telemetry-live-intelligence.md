# Decision 007 — Validation Telemetry: From Mock Data to Live Intelligence

**Date:** 2026-03-20  
**Status:** DECIDED  
**Agents Involved:** Claude (CTO Advisor) · Carter (Research/Data Agent)  
**Director:** DK (Founder & Product Lead)  
**Outcome:** SHIPPED — VT integrated into Cockpit with RideX demo data

---

### Context

DK identified the demo problem: Arthur's Cockpit showed hardcoded numbers — fake progress bars, static stats. His directive was clear: "We need to show architecture and framework and workflows, but without data we can't show anything." DK understood that investors and users judge products by what they see, not what's specced.

---

### DK's Direction

DK drove two key decisions:

**1. Live-computed stats, not better mock data.**  
When Carter proposed 10 data intelligence features, DK and Claude evaluated each against the "buildable on localStorage now" constraint. DK approved only #1 (Confidence Meter) and #2 (Stage Timer) for immediate build, deferring everything requiring Supabase. This scope discipline — building only what's deployable today — kept the sprint focused.

**2. RideX Jakarta as canonical demo scenario.**  
DK chose the rideshare scenario deliberately: universally understood industry, DK has deep SEA mobility experience to validate the demo data's realism, and it keeps the tool feeling general rather than personal. When Carter built the seed data, DK's domain expertise ensured the commitment levels, competitive entries, and assumption data were realistic enough to be convincing in an investor demo.

DK's requirement that VT seamlessly integrate with the existing Cockpit UX — "make sure the VT code seamlessly integrates main codebase in terms of UI/UX visual elements, flow, placement" — drove the compact mode components that embed in Cockpit stat boxes rather than living on a separate page.

---

### The Decision

**What DK approved:**  
Five-file VT module with RideX seed data. Confidence Meter with weighted scoring. Stage Timer with threshold warnings. ValidationTelemetry.js as pure compute utility. All wired into Cockpit, replacing every hardcoded number.

**DK's demo narrative:**  
"Here's a PM who's been validating a problem for 14 days. Here's their evidence quality. Here's what the market intelligence is telling them. Here's the Decision Gate recommending GO."

---

### Lessons / Patterns

**DK understands that the demo IS the product at pre-revenue stage.** Empty frameworks are wireframes. Populated frameworks with a compelling scenario are a product demo. This commercial instinct — building for the demo, not just for the architecture — is what separates founders who get funded from founders who get compliments on their code.

---

*Arthur MCS Decision Log — © 2026 Arthur · Mission Control System*
