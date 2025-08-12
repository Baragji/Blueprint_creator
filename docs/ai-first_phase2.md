
# Pre‑Phase Roadmap Creator — Actionable Build Plan

## Objective

Deliver a planning‑only system that takes an idea and, through coordinated AI agents and rubric‑gated loops, produces a big‑tech quality “Plan Pack” ready for G0. Outputs include: One‑Pager, OKRs, Personas/JTBD, Architecture options + ADRs + diagrams, NFRs, Threat Model, DPIA draft + Data Map, Vendor/Tooling decisions, Delivery plan (Epics/Milestones/RACI/Release), FinOps cost model (FOCUS), Test strategy, Compliance mappings, and Decision Narratives for P0–P6.

---

## System Boundaries

- Planning scope only (no product code generation).
- Output is a versioned repository section “/planning” with all artifacts + plan‑pack.yaml + decision narratives.
- Human approval required at each P‑Gate; loops auto‑revise on rubric failures.
- Provenance logging for prompts, models, and diffs.

---

## High‑Level Architecture

- Orchestrator (state machine): Coordinates P0–P6, agent calls, critiques, rubric scoring, human approvals.
- Agent Workers (stateless):
  - Product Strategist, Systems Architect, Security & Privacy, SRE, Test/Quality, FinOps, Compliance/AI‑Gov, Editor/Reviewer (meta).
- Artifact Engine:
  - Templating, schema validation, file IO to Git workspace, diagram rendering (e.g., Mermaid → PNG).
- Scoring Engine:
  - Rubric and policy‑as‑code (OPA/Rego), completeness and consistency checks.
- Connectors:
  - Git (required). Optional: Jira/Linear (epics), Diagram export, Spreadsheet export.
- UI/CLI:
  - MVP: CLI with prompts and a JSON/TTY wizard. Later: web UI.

---

## Data Model (Core)

- Idea Intake (JSON) and Plan Pack (YAML). Keep schemas under “/planning/schemas/”.
- Artifact inventory keyed by path and semantic version.
- Gate outcomes with scores and narratives.

Example stubs (illustrative):

```yaml
# planning/plan-pack.yaml
version: 1.0
meta: { id: PLAN-2025-001, title: "<Product>", owner: "<Approver>" }
gates:
  P0: { status: approved|changes_requested, score: 0-100, narrative: decision-narratives/p0.md, artifacts: [intake/one-pager.md, strategy/okrs.md] }
  P1: { ... }  # personas, problem decomposition, competitive landscape
  P2: { ... }  # ADR options, diagrams, trade-offs
  P3: { ... }  # NFRs, threat-model, dpiA draft, data-map
  P4: { ... }  # tooling/vendors/licensing/modeL options
  P5: { ... }  # epics, milestones, RACI, release, finops cost model
  P6: { ... }  # final polish, compliance map, export
compliance:
  well_architected: ["Security","Reliability","Performance","Cost","Sustainability","Operational Excellence"]
budget:
  guardrails: { alert_at_pct: 80, block_at_pct: 100 }
reporting: { cadence: weekly }
```

---

## Planning Gates (P0–P6) and Required Artifacts

- P0 — Intake & Context
  - one‑pager.md, okrs.md, assumptions.md, stakeholder‑map.md
- P1 — Market/Users/Problem
  - personas.md, jtbd.md, problem‑decomposition.md, competitive‑analysis.md, top‑risks.md
- P2 — Solution Options & Architecture
  - solution/options/adr‑000x‑*.md (2–3 options), tradeoffs.md, diagrams (context/container/dataflow.mmd + rendered PNG)
- P3 — NFRs/Security/Privacy
  - nfrs.md (thresholds + measurement), security/threat‑model.md, privacy/data‑map.yaml, privacy/dpia‑draft.md, accessibility‑intent.md
- P4 — Tooling/Dependencies/Vendors
  - tooling/vendors.md, dependencies‑graph.md, licensing‑posture.md, model‑selection‑matrix.md (if AI), supply‑chain‑posture.md
- P5 — Delivery & FinOps
  - delivery/epics‑milestones.md, raci.md, release‑plan.md, training‑plan.md, finops/cost‑model.(csv|xlsx), finops/focus‑tags.md, budget‑guardrails.md
- P6 — Plan Pack Finalization
  - decision‑narratives/p0..p6.md, plan‑pack.yaml, compliance‑mapping.md; tag v1.0

Each gate:

- Draft → Cross‑Critique (Security/SRE/FinOps/Test) → Merge & Polish → Rubric Scoring → Human Approval or Loop.

---

## Rubrics and Policy‑as‑Code

- Completeness rubric (per gate): required artifacts present + schema valid.
- Consistency rubric:
  - NFRs ↔ Architecture ↔ Test Strategy align.
  - DPIA references data‑map flows.
  - Cost model reflects chosen vendors and scale assumptions.
- OPA/Rego policies to enforce minimal pass thresholds and block progression.

Illustrative Rego fragment:

```rego
package planning.gates

default pass = false

pass {
  input.gate == "P3"
  input.artifacts["nfrs/nfrs.md"].exists
  input.artifacts["security/threat-model.md"].exists
  input.artifacts["privacy/dpia-draft.md"].exists
  input.artifacts["privacy/data-map.yaml"].exists
  input.scores.coverage >= 80
}
```

---

## Agent Design (Prompts and I/O Contracts)

- All agents receive:
  - Inputs: idea intake, upstream artifacts, constraints (cloud/compliance), standards checklist.
  - Output format: strictly typed Markdown/CSV/YAML matching paths.
- Meta‑agent (Editor) responsibilities:
  - Deduplicate, enforce tone/style, fix contradictions, assemble narratives.

Example output contract (TypeScript):

```ts
export interface GateDraft {
  gate: 'P0'|'P1'|'P2'|'P3'|'P4'|'P5'|'P6';
  artifacts: Array<{ path: string; mime: string; content: string }>;
  narrative: { path: string; content: string };
  notes: string[];
}
```

---

## Orchestrator (State Machine) Behavior

- Transitions: P0 → P1 → … → P6, with per‑gate loop up to N attempts (default 3).
- On failure: attach rubric failure reasons + critiques; re‑prompt agents with deltas.
- On human “approve”: commit artifacts, tag gate, proceed.
- On human “changes requested”: orchestrator composes deltas and re‑runs the loop.

Sequence (per gate):

1. ProduceDraft(gate)
2. CrossCritique(gate) [parallel security/sre/finops/test]
3. MergeAndPolish(gate)
4. ScoreWithRubrics(gate)
5. RequestHumanApproval(gate)
6. If pass → commit/tag → next gate; else loop.

---

## Repository Layout (Generated)

```
/planning/
  schemas/
  intake/one-pager.md
  strategy/okrs.md
  market/personas.md
  market/jtbd.md
  market/competitive-analysis.md
  solution/options/adr-0001-*.md
  solution/options/tradeoffs.md
  architecture/diagrams/{context,container,dataflow}.mmd
  architecture/diagrams/rendered/*.png
  nfrs/nfrs.md
  security/threat-model.md
  privacy/{data-map.yaml,dpia-draft.md}
  accessibility/intent.md
  tooling/{vendors.md,dependencies-graph.md,licensing-posture.md}
  ai/{model-selection-matrix.md}
  delivery/{epics-milestones.md,raci.md,release-plan.md,training-plan.md}
  finops/{cost-model.csv,focus-tags.md,budget-guardrails.md}
  quality/test-strategy.md
  governance/{compliance-mapping.md}
  decision-narratives/{p0.md..p6.md}
  plan-pack.yaml
```

---

## MVP Plan (2–4 Weeks)

- Week 1:
  - CLI scaffold: “plan init”, “plan run P0–P2”, “plan approve Pn”.
  - Artifact Engine with templates for P0–P2.
  - Planner, Architect, Editor agents.
  - Git writer (branch per gate; PR optional).
  - Basic rubric engine (completeness + minimal consistency).
- Week 2:
  - Critique loop: add Security and SRE reviewers for P2.
  - Diagram rendering (Mermaid → PNG) via CI or local container.
  - Decision narratives for P0–P2.
  - Provenance logging (prompt/model/diff hashes).
- Week 3:
  - P3 artifacts (NFRs, Threat model, DPIA draft, Data map).
  - OPA policies for P3 gate scoring.
  - Human approval UX in CLI (TTY prompt + diff preview).
- Week 4:
  - P4‑P5 artifacts, FinOps agent (FOCUS tags + cost model CSV), basic budget guardrails.
  - P6 finalization, plan‑pack.yaml emitter, tag v1.0.

Deliverable at end of Week 4: Complete Plan Pack for representative idea input, with reproducible pipeline and approvals.

---

## Success Metrics and SLAs

- Time‑to‑Plan: ≤ 5 business days for P0→P6 with one human approver.
- Gate Pass Rate: ≥ 80% pass on first attempt by Week 4 (after rubric tuning).
- Completeness Score: ≥ 85% rubric coverage at P6.
- Review Efficiency: ≤ 15 minutes human review per gate average (narratives effective).
- Provenance Coverage: 100% artifacts have prompt + model lineage.
- Performance: ≤ 10 minutes to draft a gate (default model settings).

---

## Risks and Mitigations

- Output variance (LLM): Use structured prompts, schemas, and critiques; temperature control; few‑shot exemplars.
- Compliance misalignment: Parameterize compliance profile; add policy‑as‑code checks; flag unknowns as risks.
- Diagram fidelity: Normalize on Mermaid, export via CI for visual parity.
- Cost accuracy early: Use sensitivity ranges; mark assumptions; define acceptable error bands.
- Vendor bias: Require explicit trade‑offs and licensing posture; include open‑source alternatives.

---

## Immediate Backlog (First 10 Issues)

1. Define IdeaIntake.json and PlanPack.yaml schemas.
2. Scaffold CLI with commands: init/run/approve/finalize.
3. Implement Artifact Engine with P0/P1 templates.
4. Implement Planner agent prompt + output validators.
5. Implement Architect agent prompt for P2 (options + ADR + diagrams).
6. Implement Editor meta‑agent and style guide.
7. Implement Rubric Engine v1 (completeness + minimal consistency).
8. Implement Git adapter (branch per gate; commit; optional PR).
9. Add Security & SRE critique prompts for P2 and merge logic.
10. Wire provenance logger (prompts, model ids, diffs) and narrative attachments.

---

## What You Already Have and How We Reuse It

- The HTML blueprint and markdown plan provide:
  - Gate model and guardrails we mirror for planning (P‑Gates).
  - Principles and acceptance checklist we adapt to rubric items.
  - Terminology and artifacts list we convert into templates.

We will reference those sources to seed templates and rubrics so the Plan Pack cleanly feeds into your G0–G8 lifecycle.

---

## Final Notes

This is an execution‑ready, staged plan to produce a “Plan Pack” system that meets big‑tech bar before any code is written. It explicitly defines gates, artifacts, agents, rubrics, provenance, and repository outputs, with a pragmatic MVP path and measurable success criteria.

