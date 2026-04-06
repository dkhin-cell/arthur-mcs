# DEC-012: Stage 4 Export Gate + Payload Architecture

**Decision ID:** DEC-012
**Date:** April 4, 2026
**Participants:** DK (CEO/CPO), Claude (CTO), Daniel (COO)
**Status:** APPROVED
**Category:** Product Architecture
**Notion:** https://www.notion.so/338e8e8a2638816dbb02f107314aec64

---

## Decision

Stage 4 is the export gate for rapid prototyping. When Stage 4's Decision Gate returns GO with sufficient VT confidence, the Export Panel activates — allowing PMs to send validated decision payloads to build tools (Cursor, Claude Code, v0, Linear, etc.).

**One canonical payload → Export Router → tool-specific format.**

Arthur stores ONE canonical decision object per mission. The Export Router transforms it per destination tool. The PM never thinks about formats.

---

## Canonical Payload Shape

```json
{
  "mission": "string",
  "stage": 4,
  "gate_decision": "go",
  "confidence": 87,
  "problem": "string (from Stage 0)",
  "target_user": "string (from Stage 0)",
  "hypothesis": "string (from Stage 0-2)",
  "user_stories": ["array (from Stage 4)"],
  "acceptance_criteria": ["array (from Stage 4)"],
  "not_in_scope": ["array (from Stage 4)"],
  "evidence_summary": {"object — aggregated from Stages 0-3"},
  "kill_criteria": ["array (from Stage 5)"]
}
```

---

## Tool-Specific Formats

- **Cursor / Claude Code:** Markdown spec with embedded constraints
- **Linear / Jira:** JSON tickets with RICE priority pre-calculated
- **Figma:** Design brief with user journey + UX hypotheses
- **n8n / Zapier:** Webhook JSON triggered by gate decisions
- **Amplitude / Mixpanel:** Tracking plan with event names + success thresholds from OKRs
- **Slack:** Notification blocks — mission status, gate decisions
- **GitHub:** Issues from acceptance criteria

---

## Pricing Tiers

- **Pro ($19.99):** Copy-paste export — JSON + Markdown to clipboard
- **Sentinel ($49.99):** One-click push via direct API integrations to 30+ tools
- **Enterprise:** Custom export pipelines + webhook configurations

---

## Competitive Differentiation vs Productboard

Productboard pushes features (name + description + vote count) to Jira as epics/stories.

Arthur exports validated decision packages (hypothesis + evidence trail + acceptance criteria + confidence score + kill criteria) to 30+ tools in tool-optimized formats.

**Productboard tells engineering WHAT to build. Arthur tells engineering WHY, WHETHER, and EXACTLY what done looks like — with evidence.**

---

## Key Principle

Arthur does NOT generate code, mock UIs, or auto-advance stages. Arthur generates **validated specs** that make build tools work faster and smarter. The PM decides when to export. The gate advises, humans decide.

---

*© 2026 Arthur · Mission Control System*
