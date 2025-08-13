Done. I evaluated the refinement brief against August 2025 best-practice sources, then merged and refined the Implementation Assistant prompt. It’s saved to canvas as **“05 Implementation Assistant — Excellence System Prompt.”**

# Brief validation (pass, with two minor clarifications)

* **Security standards & mappings:**

  * **OWASP ASVS v5.0** is current (released May 30, 2025). ([owasp.org][1])
  * **OWASP Top-10 for LLM Apps (2025)** remains the right reference for GenAI work. ([owasp.org][2])
  * **NIST CSF 2.0** is the latest CSF (Feb 26, 2024). ([nvlpubs.nist.gov][3], [NIST][4])
  * **NIST SSDF SP 800-218 v1.1** is still the authoritative SSDF; there is no ratified “218A” standard (some blogs mention it, but NIST’s official page lists only SP 800-218). **I kept SP 800-218**. ([csrc.nist.gov][5], [cisa.gov][6])
  * **ISO/IEC 42001:2023** is the current AI management system standard. ([ISO][7], [Microsoft Learn][8])
  * **EU AI Act:** GPAI obligations take effect **August 2, 2025**; timeline confirmed by the Commission and recent reporting. I kept AI-Act alignment where the product involves AI. ([Digital Strategy][9], [Reuters][10], [Wall Street Journal][11], [artificialintelligenceact.eu][12])

* **API & protocols:**

  * **OpenAPI 3.1** remains current; I referenced v3.1.1. ([OpenAPI Initiative Publications][13])
  * Error responses standardized to **RFC 9457 Problem Details** (obsoletes RFC 7807). ([rfc-editor.org][14], [datatracker.ietf.org][15])
  * **Idempotency-Key** header is still an **IETF Internet-Draft** (rev-06, Feb 2025). I retained it as a recommended practice with the caveat that it’s draft status, implemented by many APIs. ([datatracker.ietf.org][16])

* **Supply chain & CI gates:**

  * **CycloneDX v1.6** for SBOM is up-to-date (adds CBOM & attestations). ([cyclonedx.org][17])
  * **SLSA v1.0** provenance is supported across major CI ecosystems (Tekton, GitLab). I kept “SLSA v1.0 provenance” in the gates. ([SLSA][18], [Tekton][19], [docs.gitlab.com][20])
  * **Semgrep** for SAST in CI and **Gitleaks** for secrets scanning remain standard practice. ([semgrep.dev][21], [GitHub][22])

* **Observability & perf:**

  * **OpenTelemetry** (Collector + spec) is current and widely adopted; included as mandatory signals. ([OpenTelemetry][23])
  * **k6** and **Artillery** are current, actively maintained load-test tools; used for perf gates. ([Grafana Labs][24], [Artillery][25])

* **Testing approach:**

  * The “≥85% coverage” target is reasonable as a policy, but I noted it must be **meaningful** (not mock-only). I also implicitly encourage **integration with real deps** (via Testcontainers) and (optionally) **mutation testing** as a higher bar—kept out of the hard gate to stay practical, but compatible with Stryker/PITest if teams want it. ([Docker Documentation][26], [Testcontainers][27], [Home][28], [stryker-mutator.io][29], [pitest.org][30])

## Deviations (with evidence)

1. **Removed references to “NIST SP 800-218A”** (if implied): there’s no official 218A; the authoritative SSDF is **SP 800-218 v1.1**. ([csrc.nist.gov][5])
2. **Clarified Idempotency-Key** as “IETF draft” (not an RFC yet) while still recommending its use where appropriate. ([datatracker.ietf.org][16])
3. **Pinned SBOM/provenance formats** to **CycloneDX 1.6** and **SLSA v1.0 provenance**, reflecting 2025 adoption and tool support. ([cyclonedx.org][17], [SLSA][18])

If you want, I can now generate the ready-to-use CI snippets (GitHub Actions / GitLab CI) that enforce these gates for JS/TS, Python, and JVM stacks.

[1]: https://owasp.org/www-project-application-security-verification-standard/?utm_source=chatgpt.com "OWASP Application Security Verification Standard (ASVS)"
[2]: https://owasp.org/www-project-top-10-for-large-language-model-applications/?utm_source=chatgpt.com "OWASP Top 10 for Large Language Model Applications"
[3]: https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf?utm_source=chatgpt.com "The NIST Cybersecurity Framework (CSF) 2.0"
[4]: https://www.nist.gov/cyberframework?utm_source=chatgpt.com "Cybersecurity Framework | NIST"
[5]: https://csrc.nist.gov/pubs/sp/800/218/final?utm_source=chatgpt.com "Secure Software Development Framework (SSDF) Version 1.1 ..."
[6]: https://www.cisa.gov/resources-tools/resources/nist-sp-800-218-secure-software-development-framework-v11-recommendations-mitigating-risk-software?utm_source=chatgpt.com "NIST SP 800-218, Secure Software Development ..."
[7]: https://www.iso.org/standard/42001?utm_source=chatgpt.com "ISO/IEC 42001:2023 - AI management systems"
[8]: https://learn.microsoft.com/en-us/compliance/regulatory/offering-iso-42001?utm_source=chatgpt.com "ISO/IEC 42001:2023 Artificial intelligence management ..."
[9]: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai?utm_source=chatgpt.com "AI Act | Shaping Europe's digital future - European Union"
[10]: https://www.reuters.com/world/europe/artificial-intelligence-rules-go-ahead-no-pause-eu-commission-says-2025-07-04/?utm_source=chatgpt.com "EU sticks with timeline for AI rules"
[11]: https://www.wsj.com/tech/ai/eu-lays-out-voluntary-ai-code-of-practice-to-guide-companies-on-compliance-638497a8?utm_source=chatgpt.com "EU Lays Out AI Code of Practice to Guide Companies on Compliance"
[12]: https://artificialintelligenceact.eu/implementation-timeline/?utm_source=chatgpt.com "Implementation Timeline | EU Artificial Intelligence Act"
[13]: https://spec.openapis.org/oas/v3.1.1.html?utm_source=chatgpt.com "OpenAPI Specification v3.1.1"
[14]: https://www.rfc-editor.org/rfc/rfc9457.html?utm_source=chatgpt.com "RFC 9457: Problem Details for HTTP APIs"
[15]: https://datatracker.ietf.org/doc/html/rfc9457?utm_source=chatgpt.com "RFC 9457 - Problem Details for HTTP APIs - IETF Datatracker"
[16]: https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/history/?utm_source=chatgpt.com "History for draft-ietf-httpapi-idempotency-key-header -06"
[17]: https://cyclonedx.org/docs/1.6/json/?utm_source=chatgpt.com "CycloneDX v1.6 JSON Reference"
[18]: https://slsa.dev/spec/v1.0/provenance?utm_source=chatgpt.com "SLSA • Provenance"
[19]: https://tekton.dev/docs/chains/slsa-provenance/?utm_source=chatgpt.com "SLSA Provenance - Tekton"
[20]: https://docs.gitlab.com/ci/pipeline_security/slsa/provenance_v1/?utm_source=chatgpt.com "SLSA provenance specification"
[21]: https://semgrep.dev/docs/cli-reference?utm_source=chatgpt.com "CLI reference"
[22]: https://github.com/gitleaks/gitleaks?utm_source=chatgpt.com "GitHub - gitleaks/gitleaks: Find secrets with Gitleaks"
[23]: https://opentelemetry.io/docs/collector/?utm_source=chatgpt.com "Collector"
[24]: https://grafana.com/docs/k6/latest/?utm_source=chatgpt.com "Grafana k6 documentation"
[25]: https://www.artillery.io/docs?utm_source=chatgpt.com "Welcome · Artillery Docs"
[26]: https://docs.docker.com/testcontainers/?utm_source=chatgpt.com "Testcontainers"
[27]: https://testcontainers.com/?utm_source=chatgpt.com "Testcontainers"
[28]: https://docs.spring.io/spring-boot/reference/testing/testcontainers.html?utm_source=chatgpt.com "Testcontainers :: Spring Boot"
[29]: https://stryker-mutator.io/docs/?utm_source=chatgpt.com "What is mutation testing?"
[30]: https://pitest.org/?utm_source=chatgpt.com "PIT Mutation Testing"
