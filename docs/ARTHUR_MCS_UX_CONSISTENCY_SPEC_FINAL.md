# Arthur MCS — UX Consistency Spec (Corrected)
## Based on Full Level 1 Codebase Audit

**Date:** April 4, 2026  
**Author:** Claude (CTO) — corrected from Level 1 source audit  
**Scope:** All 27 stage pages (9 landings + 9 inputs + 9 gates) + 20 Stage 1-2 framework files  
**Source:** /home/claude/megapatch/src/ (88 files, Level 1 complete codebase)  
**Purpose:** Provide exact fix list for CP7 Level 2 port. Every inconsistency traced to actual file + line.

---

## CRITICAL FIX: Remove All "Carter" / "Dispatch" References

### What happened
The original Tech Spec V1 included a "Carter dispatch" workflow — a copy-paste bridge for deep research between DK and Carter (CMO agent). This was an **internal development workflow**, not a product feature. The Level 1 build included Carter import/dispatch buttons across Stage 1-2 frameworks because the source code was written before the Carter workflow was deprecated from the UI.

### What must change
**"Carter" must NEVER appear in the client-facing Arthur MCS interface.** No PM user will know who Carter is. Remove all references.

### Files affected (21 files)

**Frameworks with "Import from Carter" button (14 files):**
- BeachheadMarket.jsx — prompt("Paste Carter's JSON:")
- BusinessModelCanvas.jsx — importFromCarter() + "Import from Carter" button
- DACI.jsx — importFromCarter() + "Import" button
- DVUFPlanner.jsx — prompt("Paste Carter's JSON:")
- JTBDCanvas.jsx — prompt("Paste Carter's JSON:")
- MetricMap.jsx — importFromCarter() + "Import" button
- NorthStarSelector.jsx — importFromCarter() + "Import" button
- OKRBuilder.jsx — importFromCarter() + "Import" button
- PestleAnalysis.jsx — importFromCarter() + "Import from Carter" button
- ProductStrategyCanvas.jsx — importFromCarter() + "Import from Carter" button
- RICECalculator.jsx — prompt("Paste Carter's JSON:")
- RWWEnhanced.jsx — prompt("Paste Carter's JSON:")
- V2MOM.jsx — (check for Carter reference)
- VisionClarityTest.jsx — (check for Carter reference)

**Gates with "Import from Carter" (1 file):**
- Stage1DecisionGate.jsx — importFromCarter() + "Import from Carter" button

**Inputs with "Import from Carter" (2 files):**
- Stage1InputPanel.jsx — importFromManus() + "Import from Carter" button + "Imported from Carter" toast
- Stage2InputPanel.jsx — importFromCarter() + "Import from Carter" button

**Landings with "Dispatch To Carter" (3 files):**
- Stage0Landing.jsx — group desc: "Dispatch To Carter"
- Stage1Landing.jsx — group desc: "Dispatch To Carter"
- Stage2Landing.jsx — group desc: "Dispatch To Carter"

**Main.jsx (1 file):**
- main.jsx — check for Carter references in splash/routing

### Fix
1. **Remove** all `importFromCarter()` / `importFromManus()` functions
2. **Remove** all "Import from Carter" / "Import" buttons that reference Carter
3. **Replace** group desc "Dispatch To Carter" with "Research & Analysis" on landing pages
4. **Replace** "Awaiting Dispatch" status with "Not Started" or remove entirely
5. **Replace** "Export Dispatch Payload" with "Export Data" or just "Export"
6. **Keep** the generic Import/Export buttons that do JSON clipboard operations — these are useful. Just remove Carter-specific prompt text. Change `prompt("Paste Carter's JSON:")` to `prompt("Paste JSON data:")`

---

## Audit: Landing Pages (9 files)

### Stat Box 4th Label — INCONSISTENT

| Stage | Current 4th Label | Should Be |
|---|---|---|
| 0 | "Decision" | ✅ Correct |
| 1 | **"Completion"** | ❌ → Change to "Decision" |
| 2 | "Decision" | ✅ Correct |
| 3 | "Decision" | ✅ Correct |
| 4 | **"Brief Level"** | ✅ Keep — Stage 4 is unique (Living Brief progressive naming) |
| 5-8 | "Decision" | ✅ Correct |

**Fix:** Stage 1 only — change "Completion" to "Decision".  
**Exception:** Stage 4 keeps "Brief Level" — this is a decided feature, not an inconsistency.

### Stat Box 2nd Label — INCONSISTENT

| Stage | Current | Should Be |
|---|---|---|
| 0-4 | "Readiness Criteria" | ✅ Correct |
| 5-8 | **"Readiness"** | ❌ → Change to "Readiness Criteria" |

**Fix:** 4 files (Stage5-8Landing.tsx) — expand "Readiness" to "Readiness Criteria".

### Landing Group Descriptions

| Stage | Current Group | Fix |
|---|---|---|
| 0 | "Dispatch To Carter" | → "Research & Analysis" |
| 1 | "Dispatch To Carter" | → "Research & Analysis" |
| 2 | "Dispatch To Carter" | → "Research & Analysis" |
| 3+ | No Carter reference | ✅ OK |

### Missing Elements on Stage 5-8 Landings

Stage 5-8 landings were batch-generated and are thinner than Stage 0-4 landings. They are missing:
- Flow hint pills (Input → Execution → Metrics → Gate)
- Readiness Criteria section at bottom (they have readiness but as checkboxes, not the detailed section)
- Flow arrows between groups

**Recommendation:** Add these in Level 2 port. Not blocking but improves consistency.

---

## Audit: Input Panels (9 files)

### Back Links — INCONSISTENT

| Stage | Has Back Link? | Fix |
|---|---|---|
| 0 | ✅ "← Back To Stage 0" | Keep |
| 1-8 | ❌ No back link | → Add "← Back To Stage {N}" |

**Fix:** 8 files need back link added.

### Import Buttons — CARTER CONTAMINATION

| Stage | Current Buttons | Should Be |
|---|---|---|
| 0 | Export only | ✅ Correct |
| 1 | Export + **Import from Carter** | ❌ → Remove Carter import |
| 2 | Export + **Import from Carter** | ❌ → Remove Carter import |
| 3 | Export + Import (generic) | ✅ OK if prompt says "Paste JSON data:" |
| 4 | Export + Import (generic) | ✅ OK if prompt says "Paste JSON data:" |
| 5-8 | Export only | ✅ Correct |

### Section Navigation

| Stage | Has Section Nav? |
|---|---|
| 0 | ✅ Yes (7 sections) |
| 1-8 | ❌ No |

**Recommendation:** Add section nav to inputs with >4 fields (Stages 1-4) in Level 2. Not blocking.

### "Dispatch" Language

Stage 0-2 Input Panels use "Dispatch Payload" language (from Carter era).

**Fix:** Replace:
- "Generate Dispatch Payload" → "Export Data"
- "dispatch_payload.json" → "export_data.json"
- "Dispatch To Manus" → "Export Session Data"
- "Copy this payload and paste it into Manus..." → Remove this instruction entirely

---

## Audit: Decision Gates (9 files)

### CRITICAL: No Import Buttons on Gates

A Decision Gate is where you review evidence and make GO/PIVOT/KILL decisions. There is NO reason to import data at the gate. Evidence should already be in the system from prior stages. If more data is needed, go back to the framework.

| Stage | Current Import | Fix |
|---|---|---|
| 0 | No import | ✅ Correct |
| 1 | **"Import from Carter"** | ❌ → REMOVE |
| 2-8 | No import | ✅ Correct |

### Tab Structure — INCONSISTENT

| Stage | Tabs | Tab Names |
|---|---|---|
| 0 | 5 tabs | Validation Brief, Readiness, First Principles, Forces, Decision |
| 1 | 5 tabs | Strategy Brief, Readiness, Stress Test, Forces, Decision |
| 2 | 5 tabs | Opportunity Brief, Readiness, Pre-Mortem, Assumption Assessment, Decision |
| 3 | 5 tabs | Design Brief, Readiness, Pre-Mortem, UX Validation, Decision |
| 4 | 5 tabs | Planning Brief, Readiness, Pre-Mortem, Risk Assessment, Decision |
| 5-8 | 3 tabs | Readiness, Pre-Mortem, Decision (missing Brief + Forces) |

**Canonical standard (from Stage 0-1 pattern):**
Every gate should have 5 tabs:
1. **{Stage} Brief** — stage-specific summary fields
2. **Readiness Criteria** — 7 criteria with pass/partial/fail/pending
3. **{Stage} Challenge** — counter-arguments, stress tests, or pre-mortems
4. **Forces Assessment** — Push/Pull/Anxiety/Habit sliders
5. **GO / PIVOT / KILL** — decision panel with notes + confirmation

**Fix:** Stages 5-8 gates need Brief tab and Forces Assessment tab added. This is the largest standardization effort.

### Gate Taglines — INCONSISTENT

| Stage | Current Tagline |
|---|---|
| 0 | "This decision is yours." |
| 1 | "This is a suggestion. Gates advise. You decide." |
| 2-4 | Mixed: "Gates advise. You decide." / "Gates advise. They don't block. You decide." |
| 5-8 | "Gates advise. They don't block. You decide." |

**Canonical:** "Gates advise. They don't block. You decide."

**Fix:** Standardize all 9 gates to use the canonical tagline.

### Gate Button Set — INCONSISTENT

| Stage | Current Buttons |
|---|---|
| 0 | Save, PDF, Clear |
| 1 | Export, Import Carter, Save, Clear |
| 2-8 | Export, Save |

**Canonical:** Every gate gets: 💾 Save Gate | 📤 Export | 🗑 Clear

**Fix:** Standardize button set. Remove "Import from Carter" from Stage 1. Add Clear to all. Add Export to Stage 0. Remove PDF (requires library — defer to Level 2).

### Readiness Criteria Count — INCONSISTENT

| Stage | Criteria Count | Format |
|---|---|---|
| 0 | 7 | Detailed objects (text + threshold + status + evidence) |
| 1 | 7 | Detailed objects |
| 2 | 7 | String-only |
| 3 | 7 | String-only |
| 4 | 5 | String-only |
| 5-8 | 5-7 | String-only |

**Canonical:** 7 criteria per stage, all using detailed object format: `{ text, threshold, status, evidence, gap }`

**Fix:** 
- Stage 4: add 2 more criteria to reach 7
- Stages 2-8: convert string-only criteria to detailed objects with threshold + status + evidence fields

---

## Stage Colors (Verified)

| Stage | Color | Verified |
|---|---|---|
| 0 — Problem Validator | #E74C3C | ✅ |
| 1 — Strategy Architect | #E67E22 | ✅ |
| 2 — Opportunity Scout | #F1C40F | ✅ |
| 3 — Design & Prototype | #2ECC71 | ✅ |
| 4 — Planning & Roadmap | #3498DB | ✅ |
| 5 — Build & Ship | #1ABC9C | ✅ |
| 6 — Measure & Learn | #9B59B6 | ✅ |
| 7 — Maturity & Maintenance | #C0392B | ✅ (NOT #E74C3C — megapatch fix) |
| 8 — Sunset & Portfolio | #7F8C8D | ✅ |

---

## Summary: All Fixes by Priority

### P0 — Remove Before Any PM Sees This

| Fix | Files | Effort |
|---|---|---|
| Remove ALL "Carter" references | 21 files | Find-and-replace |
| Remove "Import" button from Stage 1 gate | 1 file | Delete function + button |
| Remove "Dispatch" language from inputs | 3 files | Text replacement |
| Standardize gate tagline | 9 files | Text replacement |

### P1 — Standardize for CP7 Port

| Fix | Files | Effort |
|---|---|---|
| Stage 1 Landing: "Completion" → "Decision" | 1 file | One label change |
| Stage 5-8 Landing: "Readiness" → "Readiness Criteria" | 4 files | Text change |
| Add back links to Input Panels | 8 files | Add one line each |
| Standardize gate button set (Save/Export/Clear) | 9 files | Normalize buttons |
| Landing group desc "Dispatch To Carter" → "Research & Analysis" | 3 files | Text change |

### P2 — Expand for Full Consistency

| Fix | Files | Effort |
|---|---|---|
| Add Brief + Forces tabs to Stage 5-8 gates | 4 files | Significant — new tab content |
| Convert gate criteria to detailed objects | 7 files | Restructure data |
| Stage 4 gate: add 2 criteria to reach 7 | 1 file | Content addition |
| Add section nav to inputs with >4 fields | 4 files | Component addition |
| Add flow hint pills to Stage 5-8 landings | 4 files | Component addition |

### Not Needed

| Item | Reason |
|---|---|
| Stage 4 "Brief Level" stat box | ✅ KEEP — decided feature (Living Brief progressive naming) |
| Stage 7 color fix | ✅ Already fixed (#C0392B) |
| Generic Import/Export buttons on frameworks | ✅ KEEP — useful for JSON data. Just remove Carter prompt text |

---

## Implementation Note for CP7 Port

When porting Level 1 → Level 2 (Next.js), apply ALL P0 and P1 fixes during the port. Do NOT port Carter references, inconsistent labels, or missing back links. Port the corrected version.

For P2 fixes (gate expansion, criteria detail objects): these are content additions, not structural changes. They can be done in a follow-up sprint after the core port is complete.

---

*© 2026 Arthur · Mission Control System*
