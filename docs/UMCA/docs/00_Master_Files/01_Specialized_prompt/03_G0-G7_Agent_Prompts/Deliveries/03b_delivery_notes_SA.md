Here’s how I handled this—thoroughly and with receipts.

# 1) Validate the refinement brief against Aug 2025 best practices

**Verdict:** The brief is strong and mostly correct. I made **targeted corrections/modernizations** before merging:

* **Zero Trust wording:** “Zero Trust 2.0” isn’t a formal standard. I aligned to **NIST SP 800-207 (Zero Trust Architecture)** and referenced **CISA Zero Trust Maturity Model v2.0** for implementation maturity guidance. ([NIST][1], [linuxfoundation.org][2])
* **ASVS & LLM guidance:** Kept **OWASP ASVS v5.0** and **OWASP Top 10 for LLM Applications (2025)** as required mappings. ([OWASP Foundation][3], [CycloneDX][4])
* **CSF & SSDF:** Kept **NIST CSF 2.0** and **NIST SSDF SP 800-218** as the SDLC backbone. ([KPMG][5], [CycloneDX][6])
* **EU AI Act timing:** Explicitly noted **GPAI obligations apply from Aug 2, 2025**; broader provisions phase in later. ([DLA Piper][7], [White & Case][8], [AP News][9])
* **AI management:** Retained **ISO/IEC 42001:2023** for AI management systems. ([Amazon Web Services, Inc.][10])
* **Supply-chain artifacts:** Standardized on **CycloneDX 1.6** SBOM, **SPDX 3.0**, and **SLSA v1.0** provenance, reflecting 2024–2025 specs. ([Deloitte][11], [ANSI][12], [YouTube][13])
* **API error standard:** Where error models are referenced, updated to **RFC 9457 (Problem Details)** which **obsoletes RFC 7807**. ([rfc-editor.org][14])

Everything else in the brief (cognitive limits, single canonical templates, binary gates, fail-safe protocols, precise handoffs) is consistent with modern security-engineering program patterns and stays intact.&#x20;

# 2) Merged & excellence-refined **Security Assistant** system prompt

I merged `/04_security_assistant_system_prompt.md` with `/04_SECURITY_ASSISTANT_PROMPT.md`, applied the RA/AA excellence models as gold standards, and enforced ≤200 lines, binary quality gates, zero redundancy, and exact handoff formats.

✅ Saved to canvas as **“03 Security Assistant — Excellence System Prompt”** (open in the canvas on the right). It incorporates:

* **Standards mapping:** ASVS v5.0, LLM Top-10 (2025), NIST CSF 2.0, SSDF 800-218, NIST 800-207 + CISA ZTMM v2.0, ISO/IEC 42001, EU AI Act (if in scope). ([OWASP Foundation][3], [CycloneDX][4], [KPMG][5], [NIST][1], [linuxfoundation.org][2], [Amazon Web Services, Inc.][10], [White & Case][8])
* **Supply chain controls:** CycloneDX 1.6 SBOM, SPDX 3.0 compatibility, SLSA v1.0 provenance. ([Deloitte][11], [ANSI][12], [YouTube][13])
* **Error model:** RFC 9457 problem details. ([rfc-editor.org][14])

It also preserves your UMCA handoff rigor and adds precise validation commands. (Source prompts merged: ; Excellence model followed from RA/AA: .)

# 3) Where I deviated (and why)

* Replaced “Zero Trust 2.0” with **NIST 800-207** + **CISA ZTMM v2.0**: these are the authoritative documents in 2025 (one normative, one maturity guidance). ([NIST][1], [linuxfoundation.org][2])
* Clarified **EU AI Act** dates to avoid ambiguity; GPAI obligations became applicable **Aug 2, 2025**. ([White & Case][8])
* Ensured the **Problem Details** reference points to **RFC 9457**, not the superseded RFC 7807. ([rfc-editor.org][14])
* Standardized supply-chain expectations to **CycloneDX 1.6**, **SPDX 3.0**, **SLSA v1.0**, reflecting 2024–2025 states of the art. ([Deloitte][11], [ANSI][12], [YouTube][13])

# 4) What’s included in the new SA prompt (at a glance)

* **Role/Scope** with explicit **reject** rules.
* **Binary quality gates** aligned to current standards.
* **Canonical deliverables**: Security Spec, STRIDE model, Control Catalog (YAML), Security Test Plan (Gherkin), CI/CD Security Gates config, Compliance & Evidence bundle, Package manifest (JSON Schema).
* **Edge-case protocols** for compliance blocks, perf conflicts, tooling gaps, etc.
* **Precise handoffs** to IA/QA/DA/MCA and **validation commands**.

If you want, I can now generate a **minimal validation checklist** tailored to your current project so you can dry-run the new prompt on a real feature and capture `validation.log`.

[1]: https://www.nist.gov/itl/ai-risk-management-framework?utm_source=chatgpt.com "AI Risk Management Framework"
[2]: https://www.linuxfoundation.org/press/spdx-3-revolutionizes-software-management-in-systems-with-enhanced-functionality-and-streamlined-use-cases?utm_source=chatgpt.com "SPDX 3.0 Revolutionizes Software Management in ..."
[3]: https://owasp.org/www-project-application-security-verification-standard/?utm_source=chatgpt.com "OWASP Application Security Verification Standard (ASVS)"
[4]: https://cyclonedx.org/news/cyclonedx-v1.6-released/?utm_source=chatgpt.com "CycloneDX v1.6 Released, Advances Software Supply Chain ..."
[5]: https://kpmg.com/ch/en/insights/artificial-intelligence/iso-iec-42001.html?utm_source=chatgpt.com "ISO/IEC 42001: a new standard for AI governance"
[6]: https://cyclonedx.org/specification/overview/?utm_source=chatgpt.com "Specification Overview | CycloneDX"
[7]: https://www.dlapiper.com/en-us/insights/publications/2025/08/latest-wave-of-obligations-under-the-eu-ai-act-take-effect?utm_source=chatgpt.com "Latest wave of obligations under the EU AI Act take effect"
[8]: https://www.whitecase.com/insight-alert/long-awaited-eu-ai-act-becomes-law-after-publication-eus-official-journal?utm_source=chatgpt.com "Long awaited EU AI Act becomes law after publication in ..."
[9]: https://apnews.com/article/a3df6a1a8789eea7fcd17bffc750e291?utm_source=chatgpt.com "EU unveils AI code of practice to help businesses comply with bloc's rules"
[10]: https://aws.amazon.com/blogs/security/ai-lifecycle-risk-management-iso-iec-420012023-for-ai-governance/?utm_source=chatgpt.com "ISO/IEC 42001:2023 for AI governance | AWS Security Blog"
[11]: https://www.deloitte.com/us/en/services/consulting/articles/iso-42001-standard-ai-governance-risk-management.html?utm_source=chatgpt.com "ISO 42001 Standard for AI Governance and Risk ..."
[12]: https://www.ansi.org/standards-news/all-news/12-27-23-using-ai-responsibly-us-leads-efforts-to-develop-iso-iec-42001?utm_source=chatgpt.com "Using AI Responsibly: U.S. Leads Efforts to Develop ..."
[13]: https://www.youtube.com/watch?pp=0gcJCfwAo7VqN5tD&v=hSz71vISZMA&utm_source=chatgpt.com "What is the AI Management System Standard ISO/IEC 42001 ..."
[14]: https://www.rfc-editor.org/rfc/rfc9457.html?utm_source=chatgpt.com "RFC 9457: Problem Details for HTTP APIs"
