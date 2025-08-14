# UMCA FINAL ROADMAP — EXCELLENCE (v2.1)

**Date**: 2025‑08‑14  
**Scope**: Turn the eight Excellence System Prompts into a single, auditable **execution program** that closes all identified gaps and delivers production outcomes with **binary gates** and **evidence‑first** coordination.  
**Audience**: MCA + RA/AA/SA/IA/QA/DBA/DA + Exec/Ops.  
**Briefs Referenced**: Final Roadmap Excellence Brief; prior roadmaps & critiques; pitfall analysis; MCA/RA/AA/SA/IA/QA/DBA/DA excellence prompts.

---

## 0) NORTH STAR & SUCCESS CRITERIA

**North Star**: Deliver **repeatable, end‑to‑end releases** that are secure, compliant, observable, and reversible, with all artifacts traceable via state files and evidence hashes.

**Success Criteria (executive‑level)**
- Every release passes **G0→G8** with **no subjective approvals**; all gates are binary & evidenced.
- **DORA Four Keys** reported each release; improve one band in 2 quarters.
- **Compliance‑ready**: ASVS v5 alignment, SBOM (CycloneDX 1.6), SLSA v1.0 provenance; AI governance (ISO/IEC 42001) where applicable.
- **EU AI Act (GPAI) readiness** where in scope: transparency, copyright notes, risk assessment, incident reporting path.
- **Restorable prod**: last backup verified; restore rehearsal evidence < 30 days old.

---

## 1) OPERATING MODEL (UMCA)

- **MCA** is the orchestrator + gatekeeper; maintains state & evidence integrity; stops on unverifiable claims.
- **RA → AA → SA/DBA → IA → QA → DA** conveyor with **explicit handoff contracts** (as in the eight prompts).
- **Single Source of Truth**: `docs/execution/state/*` (PROJECT_BRIEF, TECH_SPEC, GATES_LEDGER, EVIDENCE_LOG, CURRENT_STATE, SESSION_HANDOFF).
- **Evidence Before Progress**: no artifact ⇒ no gate move. **Checksums on everything.**
- **Zero Redundancy**: assistants reference each other; no duplicated specs.

---

## 2) PHASE PLAN (P‑0 → P‑6) MAPPED TO GATES

> Each phase ends with a **Gate Review** (G‑gate set in MCA). All outputs follow the **Required Output Format** from the respective Excellence prompts.

### P‑0 PRE‑FLIGHT (G0/G1) — Governance & Baselines (Week 0–1)
**Objectives**: Stand up state, evidence, and guardrails to make every subsequent step deterministic.
- Create `docs/execution/state/*` skeletons. Define **hash policy** & **evidence ledger**.
- Confirm **standards set** for this project (ASVS v5, NIST CSF 2.0, SSDF, ISO/IEC 42001 if AI, EU AI Act if EU exposure).
- Tooling baseline: repo scaffolds, CI runners, SAST/secrets (Semgrep/Gitleaks), SBOM (CycloneDX), provenance (SLSA), signature (Cosign), policy (Kyverno/OPA), OTel collector, dashboards.
- Define **RACI** and escalation rules (from MCA §6).
- **Deliverables**: MCA Orchestration Spec; baseline state files; risk register; initial runbooks; CI seed jobs.
- **Gate**: G1 passes when state files exist, schemas validate, and seed CI proves SBOM/provenance/signing on a stub build.

### P‑1 FOUNDATIONS (G2) — Research→Architecture→Security (Week 1–3)
**RA**: Options & Primary Recommendation with DecisionRecord JSON + CSV matrix; evidence ≥3 authoritative sources/option.  
**AA**: Architecture Spec; OpenAPI 3.1; DB schema + migrations; acceptance tests; threat model draft.  
**SA**: Security Spec; STRIDE; controls + CI security gates; compliance mapping; security.feature.

**Gate**: G2 passes when AA contracts compile, migrations dry‑run with rollback, SA controls are implementable & mapped, and all three packages checksum into the ledger.

### P‑2 THIN SLICE MVP (G3/G4) — DB + Code + Tests (Week 3–6)
**DBA**: forward/rollback migrations; EXPLAIN plans for top queries; RLS/roles; HA/DR runbooks; observability.  
**IA**: TDD‑first minimal implementation; coverage ≥85%; SBOM + provenance; OTel hooks; perf smoke.  
**QA**: validation spec; contract/integration/E2E; perf & a11y (if UI); evidence bundle.

**Gate**: G3 when DB safety & perf budgets met. G4 when QA gates pass (tests/coverage, SAST, secrets, SBOM/provenance, perf & a11y) and evidence logged.

### P‑3 DELIVERY SYSTEM (G5) — CI/CD, Policy, Observability (Week 5–7)
**DA**: CI pipeline (test→coverage→SAST→secrets→SBOM→provenance→sign→verify→deploy); K8s/infra manifests with **PSS enforced** namespaces; Kyverno image‑verify; OTel dashboards & alerts; backup/restore automation.

**Gate**: G5 when signed images verified in cluster, rollout strategy (canary/blue‑green) proven in staging, and restore rehearsal passes.

### P‑4 SCALE & HARDEN (G6) — Multi‑service & Compliance (Week 7–10)
- Add 1–2 additional services following the same conveyor.
- Formalize **ASVS v5 control evidence**; finalize threat model; license review.
- If **AI/GPAI** in scope: training data summary notes, copyright policy, risk assessment, red‑team/adversarial testing plan, incident reporting workflow.

**Gate**: G6 when all compliance artifacts exist, cross‑artifact consistency holds, and critical‑path risks are mitigated or waived with expiry.

### P‑5 PRODUCTIONIZATION (G7) — SRE & Operations (Week 10–12)
- SLOs live; on‑call/incident process; chaos & failure drills; DORA telemetry and release annotations.
- Final restore rehearsal; disaster runbook sign‑off; regional policy variants if needed.

**Gate**: G7 when SLO/error budgets wired, ops runbooks validated, and DR evidence is current.

### P‑6 POST‑LAUNCH IMPROVEMENT (G8) — Learn & Optimize (Week 12+)
- Retrospective; DORA trends; backlog of tech debt & security hardening; cost/perf optimization; renew evidence cadence; schedule next roadmap.

**Gate**: G8 when learnings + improvement plan are baselined in state files and approved.

---

## 3) DELIVERABLES CHECKLIST (CANONICAL SET)
**Always produced per brief** (file names `<BriefID>_<YYYYMMDD>_<artifact>`), and recorded in **GATES_LEDGER** with checksums:
- **MCA**: Orchestration Spec; State Files; Evidence Index; Package Manifest.  
- **RA**: Research Report; DecisionRecord JSON; Comparative CSV.  
- **AA**: ARCH_SPEC; `api.oas.yaml`; DB schema & migrations; threats; acceptance.  
- **SA**: SEC_SPEC; STRIDE threats; controls.yaml; security.feature; CI security gates.  
- **DBA**: DB spec; migrations (fwd/back); perf; security; HA/DR; observability; evidence.  
- **IA**: IMPL_SPEC; tests; src; CI; evidence.  
- **QA**: VALIDATION_SPEC; tests; CI verify; evidence; QA→DA/MCA packets.  
- **DA**: DEPLOYMENT.md; CI/CD; k8s/infra manifests; observability; runbooks; evidence.

---

## 4) RISK & PITFALL COVERAGE (19 → Controls)
**Principles**: detect early, isolate impact, require evidence to unfreeze.  
**Examples** (tailor to your Pitfall Analysis):
- **Unclear ownership / circular deps** → MCA critical‑path analysis + stub/contract tests; SESSION_HANDOFF with owners/dates.  
- **Spec drift** → CI doc‑lint + hash validation across packages; fail on mismatch.  
- **Rollback impossible** → expand‑migrate‑contract, dual‑write/outbox; require restore rehearsal before cutover.
- **Security vs performance** → two‑variant plan; pilot KPI; staged enablement with SLO guardrails.  
- **Compliance ambiguity (EU AI Act)** → generate regional variants; attach policy gates; if residual risk HIGH →
  **no‑go memo** with business impact.  
- **Observability gaps** → block prod deploys; spin temporary OTel path; resume only when alerts green.

> Full mapping lives in `EVIDENCE_LOG.md` (risks ↔ controls ↔ evidence).

---

## 5) METRICS & REPORTING
- **Delivery**: DORA four keys; release frequency; change failure rate; MTTR; lead time.
- **Quality**: coverage %, SAST/secrets findings, perf budgets, a11y defects.
- **Security/Supply chain**: SBOM generated, provenance attached, signature verification logs, policy conformance.
- **Reliability/DR**: backup freshness, last restore rehearsal timestamp, RPO/RTO proof.
- **Compliance**: ASVS v5 coverage, AI governance status (ISO 42001), AI Act items (if in scope).

Outputs consolidated to `docs/execution/evidence/` + **DORA snapshot JSON** per release.

---

## 6) TOOLCHAIN BASELINE (ADAPT PER ORG)
- **CI/CD**: GitHub/GitLab/ADO with pipeline templates enforcing gates.
- **Security**: Semgrep (SAST), Gitleaks (secrets), Trivy (image/IaC).
- **Supply Chain**: CycloneDX 1.6 SBOM; SLSA v1.0 provenance; Cosign signing & verify.
- **Runtime Policy**: Kubernetes with **Pod Security Standards (restricted)** via namespace labels; **Kyverno** verify‑images & attestations; NetworkPolicies; minimal RBAC.
- **Observability**: OpenTelemetry Collector; Prometheus/Grafana; release annotations.
- **DB**: PostgreSQL 17.x; PgBouncer; pgBackRest/WAL‑G; CloudNativePG (if K8s).
- **Agents (optional)**: LangGraph/CrewAI for orchestrating RA/AA/… tasks; LiteLLM as gateway for model routing & spend guardrails.

---

## 7) ROLES & RACI (EXCERPT)
- **MCA**: owns GATES_LEDGER, EVIDENCE_LOG, approvals; halts on unverifiable claims.
- **RA**: evidence‑backed options; DecisionRecord; handoffs to AA/SA/DA.
- **AA**: contracts, threats, DB; handoffs to IA/DBA/SA/QA.
- **SA**: controls, threat model, CI gates, compliance map.
- **DBA**: migrations, performance, HA/DR, telemetry.
- **IA**: tests‑first code, perf hooks, SBOM/provenance.
- **QA**: validation, perf/a11y, evidence; sign‑off.
- **DA**: CI/CD, policy, deploy, backup/DR, DORA.

---

## 8) WEEK‑BY‑WEEK TIMELINE (REFERENCE 12‑WEEK)
- **Wk 0–1**: P‑0 (governance, state, CI seeds) → **G1**  
- **Wk 1–3**: P‑1 (RA/AA/SA) → **G2**  
- **Wk 3–6**: P‑2 (DBA/IA/QA thin slice) → **G3/G4**  
- **Wk 5–7**: P‑3 (DA deploy system) → **G5**  
- **Wk 7–10**: P‑4 (scale & compliance) → **G6**  
- **Wk 10–12**: P‑5 (prod & SRE) → **G7**  
- **Post**: P‑6 (optimize) → **G8**

---

## 9) AI‑SPECIFIC ADDENDUM (USE WHEN APPLICABLE)
- **Governance**: ISO/IEC 42001 control objectives; AI risk register; model/data lineage.
- **EU AI Act (GPAI)**: training data summary notes, copyright & opt‑out policy, risk assessments, adversarial/red team plan, incident reporting; monitor systemic‑risk thresholds; Code of Practice adoption.
- **Security**: LLM Top‑10 threats; prompt‑injection defenses; output handling; content filters; model/router budget guardrails; telemetry for model events.

---

## 10) GATE REVIEW PACK (PER PHASE)
Each review includes: Summary; Inputs Used; Coordination Plan; Gate Checks (pass/fail + remediation); Evidence Summary (paths + checksums); Risks/Escalations; Next Actions (SESSION_HANDOFF).  
**Format**: structured Markdown (as in the Excellence prompts) + package.json manifest.

---

## 11) STARTER COMMANDS (ADAPT)
- **Package schema**: `jsonschema -i <pkg>.json <schema>.json`  
- **Hashes**: `shasum -a 256 $(git ls-files) > checksums.txt`  
- **OpenAPI**: `npx @redocly/cli lint AA_*_api.oas.yaml`  
- **Migrations**: `psql "$DSN" -v ON_ERROR_STOP=1 -f migrations/001_init.sql`  
- **SAST/Secrets**: `semgrep scan --config auto` · `gitleaks detect --no-git`  
- **SBOM/Prov/Sign**: `cyclonedx-cli make -o sbom.cdx.json` · `cosign sign $IMAGE`  
- **Policy**: `kubectl label ns <ns> pod-security.kubernetes.io/enforce=restricted --overwrite`  
- **Verify**: `kyverno verify images` (verifyImages/ImageValidatingPolicy)  
- **OTel**: run Collector; check `/metrics` & trace samples  
- **DORA**: export to `docs/execution/evidence/dora.json`

---

## 12) CLOSURE & CONTINUOUS IMPROVEMENT
- Baseline learnings; archive evidence; rotate keys/certs; schedule next risk/controls review; keep standards fresh (annual refresh or sooner for security).

> This roadmap is **execution‑ready**: every step has owners, artifacts, and binary gates. Plug into your repos and start with **P‑0** today.

