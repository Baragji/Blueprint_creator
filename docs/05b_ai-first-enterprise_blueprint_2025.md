# enterprise_blueprint_2025.md
**Tailored for a 1‑person founder (non‑coder) + an “AI dev team” (Aug 2025).**  
Timestamp: 2025-08-11 12:33 UTC

> Goal: Ship enterprise‑grade software with safety, reliability, and compliance—using AI as the primary engineering workforce and you as the sole human DRI.

---

## 0) Operating Model — “AI‑First, Human‑Led”
**Your role (non‑coder):** Product Owner, Risk Owner, and final approver.  
**AI roles (automated prompts/agents):**
- **Planner** (breaks work into RFCs, stories, acceptance criteria).  
- **Implementer** (writes code, infra, migrations).  
- **Security Reviewer** (SSDF/ASVS checks, SBOM/SLSA, secret & license policy).  
- **Test Engineer** (unit/contract/E2E/perf/chaos).  
- **SRE/Observability** (SLOs, error budgets, OTel, alerts).  
- **AI Governance** (model & prompt cards, evals, red teaming, DPIA updates).  
- **FinOps** (cost forecasts, FOCUS normalization, savings plans).  
- **Docs/Comms** (release notes, runbooks, user docs).

**How decisions flow:**  
Planner drafts → Security/Test/SRE/FinOps agents gate → You approve → Implementer merges.  
**Human‑oversight principle:** You always approve “Go” at each gate and for any user‑impacting change. (The blueprint below encodes those gates.)

---

## 1) Phases & Quality Gates (scaled for AI teams)

### G0 — Strategy & Risk Scoping (1–3 days)
- Vision, target users, North Star Metric & OKRs.  
- Initial risk register; data map; regulatory scan (GDPR + EU AI Act scope, if applicable).  
- Accessibility intent: WCAG 2.2 AA baked into acceptance criteria.  
**Exit G0:** One‑pager + decision narrative approved by you.

### G1 — Feasibility & Architecture (2–5 days)
- Context diagram, service boundaries, data flows; Well‑Architected mapping.  
- Non‑functional requirements (reliability, perf, security, privacy, scalability, cost).  
- Build‑vs‑buy; vendor/DPA & licensing policy; data classification & retention.  
- Threat modeling (STRIDE/LINDDUN) + privacy‑by‑design controls.  
**Exit G1:** Architecture & NFRs signed; high risks & costs known.

### G2 — Guardrails & Controls Setup (2–5 days, **before** writing lots of code)  
**Composer‑first**: one `docker-compose.guardrails.yml` with pinned image digests.  
- **Secure SDLC (SSDF) policy**; code review rules; secrets management; dep & license scanning; vuln SLAs.  
- **Supply chain**: SBOM (SPDX/CycloneDX), provenance & **SLSA** level target, **Sigstore/Cosign** signing, OpenSSF **Scorecard** checks.  
- **CI/CD**: trunk‑based dev; gated merges; artifact repo; preview envs per PR.  
- **Release safety**: feature flags; canary/blue‑green; auto‑rollback thresholds.  
- **Observability**: OpenTelemetry (traces, metrics, logs) via OTLP; golden signals dashboard.  
- **SRE**: SLOs & error budgets; on‑call rota (AI alerts to you), incident runbooks/postmortems.  
- **Data/Privacy**: DPIA plan; data retention/deletion; DPO contact (virtual).  
- **AI governance** (if AI in product): ISO/IEC 42001 alignment; NIST AI RMF profile; OWASP LLM Top 10; model/prompt cards; eval harness and red teaming.  
**Exit G2:** CI/CD green; controls enforced; dashboards live; runbooks ready.

### G3 — Detailed Design & Test Strategy (2–4 days)
- RFCs for each service/feature; API contracts + versioning; schema & migration plan.  
- UX flows & content strategy; accessibility criteria (WCAG 2.2 AA).  
- Test strategy: unit/integration/contract/E2E, performance budgets, chaos tests; experimentation plan (flags, cohorts, guardrails).  
**Exit G3:** Approved RFCs and acceptance/test criteria.

### G4 — Delivery Plan (≤2 days)
- Milestones/epics; RACI/DRIs (mapped to AI roles); critical path & dependencies.  
- Release plan (environments, change windows, comms) + training.  
- Capacity & cost plan (FinOps: run‑rate, burst/AI compute).  
**Exit G4:** Plan feasible; resources (agents/tools/budgets) allocated.

### G5 — Build & Integrate (iterative)
- Small PRs; pair/mob between AI agents for complex areas.  
- Tests are gates; preview env per PR; artifact signed + provenance attached; SBOM emitted per build.  
- OTel instrumentation added with each change; dashboards auto‑updated.  
- Continuous security (dep updates, license checks, IaC/container scans).  
- **If AI product features**: dataset governance, evals (quality/bias/safety), jailbreak & resilience tests.  
**Exit G5 per increment:** All checks green; release notes/runbooks updated.

### G6 — Pre‑Launch Hardening
- Load/perf tests vs budgets; disaster/chaos game‑day.  
- Security pen‑test + remediation; DPIA completed; accessibility audit.  
- DR/BCP validated; cost burn forecast; alert review.  
**Exit G6:** Go/No‑Go by you + sign‑offs (Security/Privacy/SRE).

### G7 — Launch & Rollout
- Progressive delivery: canary → % rollouts → full, with auto‑rollback thresholds tied to SLOs.  
- War‑room protocol; customer comms; incident handling.

### G8 — Operate, Learn & Scale (continuous)
- Blameless postmortems with action SLAs.  
- **DORA metrics** (deploy freq, lead time, change‑fail %, MTTR) reported to you weekly.  
- FinOps loop (Inform→Optimize→Operate), rightsizing & savings plans; AI/compute guardrails.  
- Periodic security/privacy reviews; supply‑chain posture refresh; roadmap refresh.

---

## 2) “AI‑Only Dev Team” Guardrails (what’s different)

### A. Zero‑trust code acceptance
- **Every change** must pass: tests, linters, SAST/DAST, license & secret checks, SBOM create+diff, provenance attestation, signature verification, OTel trace in place, docs & changelog.  
- **Dual‑AI review**: Implementer PR → Security Reviewer + Test Engineer must independently approve. You only review the **decision narrative + dashboards**, not raw code.

### B. Provenance & auditability
- All AI actions are logged: prompt, model, temperature, tool access, generated diffs, reviewer comments.  
- Commits require **signed attestations** (Cosign) linking build artifacts ↔ SBOM ↔ provenance (SLSA).

### C. Human oversight & risk
- Human approvals required at G0/G1/G2/G6 and for **any** data scope change, privacy risk, or SLA/SLO change.  
- AI access to secrets and prod is **read‑only by default**, elevated by short‑lived tokens with just‑in‑time workflows.

### D. AI governance for product features
- Maintain **model cards** & **prompt cards**; run model evals and red teaming before each major release.  
- Keep a living DPIA; track AI Act scope; publish user‑facing transparency notes when needed.

### E. Cost controls (FinOps for AI)
- Track GPU/LLM usage per feature via tags; weekly cost & efficiency report; enforce budget guardrails that fail the build when forecasts exceed thresholds.

---

## 3) Minimal Tooling (docker‑compose guardrails, all replaceable later)
- Pre‑commit hooks + CI that run: secret scan, license scan, dep scan, SAST, IaC/container scans, tests, coverage gates, SBOM emit, Cosign sign/verify, Scorecard, OTel smoke test.  
- One‑command local spin‑up for preview envs and golden‑signal dashboards.

*(Exact tools are swappable; the blueprint cares about **controls**, not brands.)*

---

## 4) Artifacts (living)
- One‑pager, OKRs, risk register, data map, **DPIA**.  
- Architecture diagrams, RFCs, ADRs; API specs; schema/migrations.  
- Test plan & coverage dashboard; perf/chaos results.  
- **SLOs/error‑budget policy**; runbooks; incident/postmortem templates.  
- CI/CD config; **SBOMs**; **provenance attestations**; **release & rollback playbooks**.  
- UX flows, content, design‑system tokens; **accessibility checklist & audit** (WCAG 2.2 AA).  
- Cost model & **FinOps FOCUS** reports; launch/rollout comms; training/support docs.  

---

## 5) Weekly cadence (for a solo human)
- **Monday:** Review OKRs, DORA dashboard, cost report; approve next milestone.  
- **Midweek:** G5 demos from AI agents; accept/reject increments.  
- **Friday:** Postmortems + risk/roadmap refresh; publish change log to stakeholders.

---

## 6) Acceptance Checklist (copy into your issue tracker)
- [ ] G0: Vision/OKRs + risk scan approved  
- [ ] G1: Architecture/NFRs approved  
- [ ] G2: Guardrails enforced end‑to‑end (SSDF/SBOM/SLSA/Signing/Scorecard/OTel/SLOs/Flags)  
- [ ] G3: RFCs/design/test criteria approved  
- [ ] G4: Delivery plan & cost plan approved  
- [ ] G5: Increment meets all automated gates + docs updated  
- [ ] G6: Pen‑test + DPIA + accessibility audit passed; Go/No‑Go signed  
- [ ] G7: Canary/live SLOs healthy; rollback ready  
- [ ] G8: Postmortems done; DORA & FinOps reviewed; actions scheduled

---

## 7) Notes on scope & scaling
- If your product **does not** include AI features, keep the **AI governance** agent focused on *engineering* AI usage (code generation safety, prompt logging, provenance) and skip model‑eval steps.  
- If you later add contractors/humans, they inherit the same gates; nothing changes.

---

*End of file.*
