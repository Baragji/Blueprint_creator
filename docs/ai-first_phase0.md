# Pre‑Phase Roadmap Creator: Comprehensive Planning System (Big‑Tech Standard)

## Objective

Build a pre‑Phase‑1 planning system where a user submits an idea and a set of coordinated AI agents iteratively create, refine, and finalize a complete plan to big‑tech standards—covering architecture, dependencies, tools, risks, NFRs, cost model, governance, and delivery plan. The output is a signed “Plan Pack” ready to enter G0 of the main blueprint.

---

## Scope and Assumptions

- Scope: Planning only (no product code generation). Produces a complete, reviewable, versioned planning dossier.
- Standards: Align to SSDF, Well‑Architected, NIST AI RMF, ISO/IEC 42001, OWASP LLM Top 10, GDPR/DPIA (as applicable).
- Operating mode: Human‑led approvals with AI agents providing drafts, critiques, and merged outcomes.
- Integration baseline: Git (source of truth), optional APIs (Jira/Linear), and local “compose” environment.
- Assumptions:
  - You can use a modern LLM provider (OpenAI/Anthropic) and/or local models.
  - GitHub or GitLab available for repo and PR flows.
  - Minimal secrets for planning system (no production data).

Open questions:

- Which cloud and compliance regimes apply (e.g., HIPAA/PCI/SOC2)?
- Preferred PM tool (Jira/Linear) and diagramming (Mermaid/PlantUML/Draw.io)?
- Data residency/PII constraints for LLM prompts?
- Branding/template preferences for artifacts?

---

## Planning Lifecycle (P‑Gates) and Deliverables

Introduce planning gates P0–P6 (pre‑G0). Each gate yields artifacts, a decision narrative, and a rubric score. Failing a gate triggers agent critique and revision loop.

1) P0 — Intake & Context

- Inputs: Problem statement, target users, constraints, success criteria, timeline/budget rough order.
- Outputs: One‑Pager v1, Stakeholder map, Initial OKR hypotheses, Assumptions list.
- Gate: P0‑Go requires clarity and minimal ambiguity score.

2) P1 — Market, Users, and Problem Definition

- Outputs: JTBD/Persona brief, Problem decomposition, Alternatives landscape, Key risks top‑10.
- Gate: P1‑Go requires problem‑solution fit hypothesis and competitive alt analysis.

3) P2 — Solution Options & Architecture Exploration

- Outputs: 2–3 Architecture options (ADR format), Diagrams, Trade‑off matrix, Build vs buy matrix.
- Gate: P2‑Go requires recommended option with rationale and rollback paths.

4) P3 — NFRs, Security/Privacy, Compliance

- Outputs: NFR set (reliability, perf, security, privacy, scalability, cost), Threat model (STRIDE/LINDDUN), DPIA pre‑draft, Data map & retention, Accessibility intent (WCAG 2.2 AA).
- Gate: P3‑Go requires NFR coverage, mitigations, and compliance mapping.

5) P4 — Tooling, Dependencies, Vendors

- Outputs: Dependency graph, Vendor shortlist, Licensing posture, AI model selection matrix, MLOps/LLMOps approach (if relevant), cost implications.
- Gate: P4‑Go requires vendor/tool decision narrative and supply chain posture.

6) P5 — Delivery Strategy & Cost Model

- Outputs: Epics/Milestones plan, RACI/DRIs (mapped to AI agents), Release plan, Training plan, FinOps cost model (FOCUS‑aligned), Budget guardrails.
- Gate: P5‑Go requires feasible plan and budget guardrails.

7) P6 — Plan Pack Finalization (Pre‑G0)

- Outputs: Signed Plan Pack: One‑Pager, OKRs, Architecture ADR, NFRs, Risk register, Data map/DPIA draft, Tool/vendor decisions, Delivery plan, Cost model, Decision narrative.
- Gate: Human approval; “Plan Pack v1.0” tag created; proceed to G0.

---

## Agents and Responsibilities

- Product Strategist (Planner)
  - Intake synthesis, OKRs, personas, JTBD, competitive analysis.
- Systems Architect
  - Solution options, diagrams, trade‑off analysis, dependency graph, ADRs.
- Security & Privacy
  - Threat model, control mapping, DPIA pre‑draft, data flows and retention.
- SRE/Observability
  - NFRs, SLOs, error budgets, golden signals, operability plan.
- FinOps
  - FOCUS normalization, cost model, budget guardrails, weekly report scaffold.
- Test/Quality
  - Test strategy, acceptance criteria, coverage targets, perf/chaos plans.
- Compliance & AI Governance
  - ISO/IEC 42001/NIST AI RMF mapping; OWASP LLM Top 10 checks (if AI product).
- Editor/Reviewer (Meta‑agent)
  - Cross‑agent critique, deduplication, consistency, narrative polish.

These agents work in cycles: Draft → Cross‑Critique → Merge → Human Review → Revise.

---

## Orchestration and State Machine

Use a workflow engine (e.g., Temporal) to encode gates, loops, and approvals.

```typescript
// types.ts
export type Gate = 'P0'|'P1'|'P2'|'P3'|'P4'|'P5'|'P6';
export interface ArtifactRef { kind: string; path: string; version: string; }
export interface GateOutcome { gate: Gate; passed: boolean; score: number; artifacts: ArtifactRef[]; narrativePath: string; comments: string[]; }

// orchestrator.ts
export class PlanningWorkflow {
  async runIdeaIntake(idea: string): Promise<GateOutcome[]> {
    const outcomes: GateOutcome[] = [];
    outcomes.push(await this.runP0(idea));
    for (const gate of ['P1','P2','P3','P4','P5','P6'] as Gate[]) {
      const prev = outcomes[outcomes.length - 1];
      if (!prev.passed) break;
      outcomes.push(await this.runGateWithLoops(gate));
    }
    return outcomes;
  }

  private async runGateWithLoops(gate: Gate, maxLoops = 3): Promise<GateOutcome> {
    for (let i=0; i<maxLoops; i++) {
      const draft = await this.produceDraft(gate);
      const critiques = await this.crossCritique(gate, draft);
      const merged = await this.mergeAndRevise(gate, draft, critiques);
      const evaluated = await this.evaluateGate(gate, merged);
      const approved = await this.requestHumanApproval(gate, evaluated);
      if (approved.passed) return approved;
    }
    return { gate, passed: false, score: 0, artifacts: [], narrativePath: '', comments: ['Exceeded loops'] };
  }
}
```

---

## Data Model and Repository Layout

All artifacts are versioned in Git as the source of truth. Propose a dedicated “plan‑pack” repo or a “/planning” folder.

```
/planning/
  intake/one-pager.md
  strategy/okrs.md
  market/personas.md
  solution/options/
    adr-0001-arch-option-a.md
    adr-0002-arch-option-b.md
  architecture/diagrams/
    context.mmd
    container.mmd
  nfrs/nfrs.md
  risk/risk-register.csv
  privacy/data-map.yaml
  privacy/dpia-draft.md
  security/threat-model.md
  tooling/vendors.md
  delivery/epics-milestones.md
  delivery/release-plan.md
  finops/cost-model.xlsx
  finops/focus-tags.md
  quality/test-strategy.md
  governance/compliance-mapping.md
  decision-narratives/
    p0.md
    p1.md
    ...
  plan-pack.yaml
```

### Plan Pack Schema (YAML)

```yaml
# planning/plan-pack.yaml
version: 1.0
meta:
  id: PLAN-YYYYMMDD-001
  title: "<Product/Initiative>"
  owner: "<Human approver>"
gates:
  P0:
    status: approved|changes_requested
    score: 0-100
    artifacts:
      - { kind: "one_pager", path: "intake/one-pager.md", version: "v1.2" }
    narrative: "decision-narratives/p0.md"
  P1: { ... }
  P2: { ... }
  P3: { ... }
  P4: { ... }
  P5: { ... }
  P6: { ... }
compliance:
  well_architected: ["Security","Reliability","Performance","Cost","Sustainability","Operational Excellence"]
  ssdf: ["PW.1","PW.5","RV.1", "..."]
  nist_ai_rmf: ["Map","Measure","Manage","Govern"]
  iso_42001: ["policy","risk","controls","impact"]
budget:
  baseline_monthly_usd: 0
  guardrails:
    alert_at_pct: 80
    block_at_pct: 100
  reporting:
    cadence: weekly
    recipients: ["<you@company.com>"]
```

### Key JSON Schemas

Idea Intake:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "IdeaIntake",
  "type": "object",
  "properties": {
    "title": { "type": "string" },
    "problem": { "type": "string" },
    "targetUsers": { "type": "string" },
    "constraints": { "type": "string" },
    "successCriteria": { "type": "string" },
    "timeline": { "type": "string" },
    "budgetHint": { "type": "string" }
  },
  "required": ["title","problem","targetUsers","successCriteria"]
}
```

Risk Register CSV headers:

```csv
risk_id,category,description,likelihood,impact,mitigation,owner,status,review_date
```

---

## Prompting Strategy and Self‑Critique

- Each agent uses a role‑specific prompt with:
  - Inputs: intake JSON, upstream artifacts, constraints, standards.
  - Outputs: strictly typed (Markdown, CSV, YAML) conforming to templates.
- Critique loop:
  - Reviewer agents (Security, SRE, FinOps) score against rubrics (coverage, consistency, feasibility).
  - Meta‑agent aggregates critiques; Architect/Planner revises.
- Provenance:
  - Log prompts, model versions, diffs per artifact; attach to `decision-narratives/Pn.md`.

Example Agent Prompt (Architect):

```text
Role: Systems Architect
Task: Produce 2-3 architecture options with diagrams and a trade-off matrix.
Inputs: One-Pager v1, Personas, NFRs draft, Constraints, Compliance requirements.
Output:
- Markdown ADR files named adr-XXXX-<option>.md
- Mermaid diagrams in architecture/diagrams/
- Trade-off matrix in solution/options/tradeoffs.md
Constraints:
- Map to Well-Architected pillars
- Identify rollback strategy and blast radius per option
- Include data flows for privacy assessment
```

---

## Gate Rubrics and Automated Checks

Implement “policy as code” to score gates and enforce minimums.

- Coverage checks:
  - All required artifacts present and valid against schemas.
  - NFRs include thresholds and measurement methods.
  - Threat model lists top STRIDE categories and mitigations.
  - DPIA draft references data map flows.
  - FinOps model includes FOCUS tags and guardrails.
- Consistency checks:
  - NFRs ↔ Architecture ↔ Test strategy alignment.
  - Tool/vendor choices ↔ NFRs and budget.
- Compliance mapping completeness.
- Approval policy (OPA/Rego):

```rego
package planning.gates

default pass = false

# Example: P3 must include NFRs, Threat Model, DPIA draft, Data Map
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

## UI/UX Workflow

- Web app (Next.js/React) or CLI wizard.
- Steps:
  1. Intake form (validates IdeaIntake schema).
  2. Select standards (compliance set, cloud preference).
  3. Run P0→P6 with progress UI, show draft artifacts and critiques.
  4. Inline diff viewer for revisions.
  5. Approve each gate; regenerate on fail with agent loops.
  6. Export/Tag Plan Pack v1.0 and open G0 ticket.

---

## Integrations

- Git provider (required): repo creation, branches, PRs for Pn gates.
- PM tool (optional): sync epics/milestones at P5.
- Diagramming (optional): Mermaid → PNG via CI job; or PlantUML/Draw.io.
- Spreadsheet (optional): Cost model export to XLSX + CSV.

---

## MVP Slice (2–4 weeks)

- CLI or minimal web UI for Intake → P2:
  - Agents: Planner, Architect, Editor.
  - Artifacts: One‑pager, Personas, 2 architecture options with trade‑offs, decision narrative.
  - Git repository output with plan‑pack.yaml.
  - Simple rubric checks (coverage, coherence).

Stretch to P3–P5 in subsequent sprints.

---

## Example Commands and Project Skeleton

```bash
# Initialize a planning project from an idea
plan create --title "AI Support Assistant" --problem "Reduce time to resolution" --users "Support agents" \
  --success "MTTR ↓ 40% within 3 months" --timeline "MVP in 8 weeks" --budgetHint "Lean"

# Run planning gates sequentially
plan run --gates P0-P2

# Re-run with critiques applied
plan revise --gate P2

# Produce final Plan Pack
plan finalize --tag v1.0
```

Directory skeleton auto-generated:

```text
/planning
  ... (as described in repository layout)
```

---

## Success Metrics

- Time‑to‑Plan: P0→P6 in ≤ 5 business days (typical inputs).
- Completeness Score: ≥ 85% rubric coverage without manual edits.
- Revision Cycles: ≤ 2 loops per gate on average.
- Cost Model Error: ±20% vs actuals at first quarter (track later).
- Stakeholder Satisfaction: ≥ 4/5 via post‑approval survey.

SLAs:

- Gate run turnaround: ≤ 10 minutes per gate draft at default model settings.
- Export/Versioning: instantaneous tagging and PR creation.

---

## Security, Privacy, and Provenance

- Secrets: stored in Vault; planning system has read‑only repo access except creating plan repo.
- Data: no PII beyond stakeholder contact; redact/scrub prompts if required.
- Provenance: log prompt+model, artifact hashes, diff signatures; attach to narratives.
- Privacy: DPIA pre‑draft produced at P3 with clear data classification.

---

## Deliverable Templates (Samples)

One‑Pager (intake/one‑pager.md):

```markdown
# One-Pager — <Product Name>
- Problem: <...>
- Users/Personas: <...>
- Value Proposition: <...>
- Success Metrics (OKRs): <O:.. KRs:..>
- Scope (In/Out): <...>
- Constraints/Assumptions: <...>
- Timeline: <...>
- Risks (Top-5): <...>
```

Architecture ADR (solution/options/adr-0001-arch-option-a.md):

```markdown
# ADR-0001: Architecture Option A — <Title>
- Status: Proposed
- Context: <problem, constraints, NFRs>
- Decision: <option summary>
- Rationale: <trade-offs, Well-Architected mapping>
- Consequences: <positive/negative, blast radius>
- Rollback Plan: <...>
- Diagram: architecture/diagrams/context.mmd
```

NFRs (nfrs/nfrs.md):

```markdown
- Reliability: 99.9% monthly SLO; error budget policy; on-call process.
- Performance: P95 latency ≤ 250ms for endpoint X under Y RPS.
- Security: ASVS L2; SAST/DAST before GA; SBOM and signing.
- Privacy: DPIA required; data minimization; retention 90 days for logs.
- Scalability: handle 10x traffic with ≤ 20% cost increase per req.
- Cost: $X baseline/month; alert at 80%, block merges at 100%.
- Accessibility: WCAG 2.2 AA for end-user surfaces.
```

Risk Register (risk/risk-register.csv): headers shown above.

---

## Implementation Milestones

1) Sprint 1 (Week 1–2)

- CLI prototype (Intake, P0‑P2), Git writer, artifact templates, basic rubric engine.
- Agents: Planner, Architect, Editor.

2) Sprint 2 (Week 3–4)

- Add P3 (Security/Privacy) with threat model and DPIA draft; add Security agent.
- Add diagram export, critique loops, and decision narratives.

3) Sprint 3 (Week 5–6)

- Add P4‑P5 (Tooling/Vendors, Delivery/FinOps), FinOps agent and cost model generator.
- PM tool sync for epics/milestones.

4) Sprint 4 (Week 7–8)

- P6 polishing, compliance mappings, final Plan Pack exporter, web UI.

---

## Summary

This plan delivers a comprehensive, big‑tech‑grade planning system that turns an idea into a complete, reviewable Plan Pack through agent collaboration, critique loops, and human approvals. It aligns to your existing blueprint, outputs versioned artifacts ready for G0, and enforces quality via policy‑as‑code, rubrics, and provenance.

This blueprint is ready to implement as an MVP (CLI or web) and iteratively expand to full coverage of P0–P6.
