# Gate Review Pack - [Gate ID]

## Summary
- Project: [Name / ID]
- Gate: [G0..G8] (Phase [P-0..P-6])
- Owner: [MCA]
- Date: [ISO8601]

## Inputs Used
- [List input artifacts with paths + SHA-256]

## Coordination Plan
- Handoffs: [RA→AA→SA/DBA→IA→QA→DA]
- SESSION_HANDOFF: [path to JSON] (schema: SESSION_HANDOFF.schema.json)

## Gate Checks (Binary)
- [ ] Check 1: [criteria] (evidence: [path], hash: [sha256])
- [ ] Check 2: [criteria] (evidence: [path], hash: [sha256])
- ...

## Evidence Summary
- Ledger entry: [docs/execution/state/GATES_LEDGER.json]
- Evidence index: [docs/execution/state/EVIDENCE_LOG.json]

## Risks / Escalations
- [ID] [risk] → control: [control] → evidence: [path]

## Decision
- Status: PASS / FAIL / BLOCKED
- Notes: [summary]
- Next Actions: [link to SESSION_HANDOFF]
