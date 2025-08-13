Done. I read and synthesized all four assets and produced a single, copy-pasteable system prompt that unifies them. You can download it here:

**[Download `UNIFIED_MASTER_COORDINATOR_AI_PROMPT.md`](sandbox:/mnt/data/UNIFIED_MASTER_COORDINATOR_AI_PROMPT.md)**

## What I merged (and where it shows up)

* **Repository auto-detection + adaptive mode + canonical dirs** → carried over into the **ROLE**, **CONFIGURATION**, **WORKFLOW**, and **CANONICAL DIRECTORY STRUCTURE** sections.
* **Guardrails + TDD/Delivery Packet + CI gates** → consolidated into **QUALITY CONTROLS**, **WORKFLOW**, and the explicit **Delivery Packet** checklist.
* **G0–G8 lifecycle, governance, SBOM/SLSA, OTel, FinOps** → integrated in **ENTERPRISE COMPLIANCE & LIFECYCLE (G0–G8)** and **IMMEDIATE STARTUP INSTRUCTIONS**.
* **Specialized AI roles (RA/AA/IA/QA) + task templates + hard quality gates** → preserved under **SPECIALIZED AI TEAM ROLES & TASK BRIEFS** and wired into the main workflow.
* **Dashboard/portal alignment** (for wiring evidence/metrics later) remains compatible with your HTML blueprint.

### External standards I aligned to (authoritative sources)

* **SAST (Semgrep)**, **secret scanning (Gitleaks)**, **SBOM (CycloneDX)**, **provenance (SLSA)**, **DORA metrics**, **NIST AI RMF 1.0**, **ISO/IEC 42001**, **WCAG 2.2 AA**, **OWASP ASVS**, **OWASP Top-10 for LLM apps**, **OpenTelemetry**, **FinOps FOCUS**. ([semgrep.dev][1]) ([GitHub][2], [gitleaks.io][3]) ([cyclonedx.org][4], [GitHub][5]) ([SLSA][6], [GitHub][7]) ([dora.dev][8], [Google Cloud][9], [docs.gitlab.com][10]) ([NIST][11], [nvlpubs.nist.gov][12]) ([ISO][13]) ([W3C][14]) ([OWASP][15]) ([OWASP][16], [OWASP Gen AI Security Project][17]) ([OpenTelemetry][18]) ([focus.finops.org][19])

---

## How to put this in your repo (so MCA can use it immediately)

If you’re on your machine:

```bash
# from your repo root
curl -L -o UNIFIED_MASTER_COORDINATOR_AI_PROMPT.md "file://$PWD/UNIFIED_MASTER_COORDINATOR_AI_PROMPT.md"
# or just download the file above and place it at repo root, then:
git add UNIFIED_MASTER_COORDINATOR_AI_PROMPT.md
git commit -m "docs: add UNIFIED_MASTER_COORDINATOR_AI_PROMPT (MCA system prompt)"
git push
```

*(If you want me to open a PR later, say the word and tell me which branch name you want.)*

---

## What this prompt enables the Master Coordinator to do

1. **Auto-detect repo state** (root, manifests, project type) and create the canonical **`docs/execution/*`** structure with state, briefs, evidence, and changelogs.&#x20;
2. **Orchestrate the RA/AA/IA/QA team** using strict, copy-ready task brief templates (one task = one outcome).&#x20;
3. **Enforce enterprise-grade gates**: TDD, coverage ≥85%, **Semgrep** (block High/Critical), **Gitleaks** (block any), **CycloneDX SBOM**, **SLSA provenance**, artifact uploads, and required approvals. ([semgrep.dev][20], [GitHub][21], [cyclonedx.org][4], [SLSA][6])
4. **Run the full G0–G8 lifecycle** with human sign-offs at key gates, including **NIST AI RMF** & **ISO/IEC 42001** governance and **WCAG 2.2 AA** accessibility checks.  ([NIST][11], [ISO][13], [W3C][14])
5. **Publish evidence and outcomes** (tests, scans, SBOM, provenance, screenshots) and write **DORA** & **FOCUS** JSON into `docs/execution/evidence/` for dashboards. ([dora.dev][8], [focus.finops.org][22])
6. **Instrument operability** with **OpenTelemetry** traces/metrics/logs from the start. ([OpenTelemetry][18])

---

## Quick validation checklist (what I preserved from your assets)

* Adaptive mode + auto-detection + canonical dirs.
* TDD-first, Delivery Packet, CI gates, context persistence.&#x20;
* G0–G8 lifecycle with supply-chain/security/compliance/OTel/FinOps.&#x20;
* RA/AA/IA/QA roles + standardized briefs and zero-trust validation.&#x20;

If you want, I can now (a) generate the CI workflow files that implement these gates, and (b) seed the `docs/execution` structure in your repo so the Master Coordinator has everything it expects.

[1]: https://semgrep.dev/docs/?utm_source=chatgpt.com "Docs home - Semgrep"
[2]: https://github.com/gitleaks/gitleaks?utm_source=chatgpt.com "Find secrets with Gitleaks - GitHub"
[3]: https://gitleaks.io/?utm_source=chatgpt.com "Gitleaks - Open Source Secret Scannng"
[4]: https://cyclonedx.org/?utm_source=chatgpt.com "CycloneDX Bill of Materials Standard | CycloneDX"
[5]: https://github.com/CycloneDX?utm_source=chatgpt.com "CycloneDX BOM Standard"
[6]: https://slsa.dev/?utm_source=chatgpt.com "SLSA • Supply-chain Levels for Software Artifacts"
[7]: https://github.com/slsa-framework/slsa-verifier?utm_source=chatgpt.com "Verify provenance from SLSA compliant builders"
[8]: https://dora.dev/guides/dora-metrics-four-keys/?utm_source=chatgpt.com "DORA's software delivery metrics: the four keys"
[9]: https://cloud.google.com/blog/products/devops-sre/using-the-four-keys-to-measure-your-devops-performance?utm_source=chatgpt.com "Use Four Keys metrics like change failure rate to measure ..."
[10]: https://docs.gitlab.com/user/analytics/dora_metrics/?utm_source=chatgpt.com "DevOps Research and Assessment (DORA) metrics"
[11]: https://www.nist.gov/itl/ai-risk-management-framework?utm_source=chatgpt.com "AI Risk Management Framework"
[12]: https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf?utm_source=chatgpt.com "Artificial Intelligence Risk Management Framework (AI RMF 1.0)"
[13]: https://www.iso.org/standard/42001?utm_source=chatgpt.com "ISO/IEC 42001:2023 - AI management systems"
[14]: https://www.w3.org/TR/WCAG22/?utm_source=chatgpt.com "Web Content Accessibility Guidelines (WCAG) 2.2"
[15]: https://owasp.org/www-project-application-security-verification-standard/?utm_source=chatgpt.com "OWASP Application Security Verification Standard (ASVS)"
[16]: https://owasp.org/www-project-top-10-for-large-language-model-applications/?utm_source=chatgpt.com "OWASP Top 10 for Large Language Model Applications"
[17]: https://genai.owasp.org/llm-top-10/?utm_source=chatgpt.com "LLMRisks Archive - OWASP Gen AI Security Project"
[18]: https://opentelemetry.io/docs/?utm_source=chatgpt.com "Documentation"
[19]: https://focus.finops.org/?utm_source=chatgpt.com "FOCUS™ - FinOps Open Cost & Usage Specification"
[20]: https://semgrep.dev/docs/semgrep-code/overview?utm_source=chatgpt.com "Semgrep Code overview"
[21]: https://github.com/gitleaks/gitleaks-action?utm_source=chatgpt.com "Protect your secrets using Gitleaks-Action - GitHub"
[22]: https://focus.finops.org/focus-specification/?utm_source=chatgpt.com "FOCUS Specification"
