Here’s the DevOps round—kept to the same “surgical precision” you asked for:

# 1) Validation of the refinement brief (Aug 2025 state-of-the-art)

**Verdict:** The *EXCELLENCE\_REFINEMENT\_BRIEF\_DevOps\_Assistant* is directionally correct and largely aligned with 2025 best practices, with a few places that needed modernizing or tightening. I applied those updates while merging the two source prompts into a single canonical DA prompt.

### What I validated (and why)

* **≤200-line cognitive cap** is sensible and matches our RA/AA/SA/IA/QA excellence templates. I kept the merged DA prompt within this cap to reduce parsing ambiguity and improve consistency.&#x20;
* **Gate consolidation to 5–7 binary checks**: retained and implemented as 7 crisp gates (tests/coverage; SAST; secrets; SBOM/provenance; runtime policy; SLO/perf; observability; backup/DR). This matches modern pipeline design and keeps failure modes obvious.&#x20;
* **Edge-case coverage:** the brief’s edge scenarios are valid and common in 2025 production rollouts; I codified them as 10 fail-safe protocols.&#x20;
* **Template unification:** both original DA prompts had overlapping templates; I merged into one canonical deliverable set + JSON package schema to ensure programmatic verification.

### Where I updated the brief to reflect Aug 2025 practice (with evidence)

* **Kubernetes baseline & schedule.** I standardized the prompt on **Kubernetes v1.33.x** (latest **1.33.3** released 2025-07-15) and noted the **v1.34.0** release window (2025-08-27) to avoid referencing features still in flux during this week. ([Kubernetes][1], [kubernetes.dev][2])
* **Pod Security:** enforced **Pod Security Standards (PSS)** via **Pod Security Admission** namespace labels; PSP remains removed since 1.25. This is the recommended baseline in 2025. ([Kubernetes][3])
* **Supply-chain security:** made **Cosign** signing + **Kyverno verifyImages** mandatory (with attestations when applicable) and kept **CycloneDX 1.6** SBOM + **SLSA v1.0** provenance as the standard artifacts. ([Sigstore][4], [release-1-9-0.kyverno.io][5], [Kyverno][6], [cyclonedx.org][7], [SLSA][8])
* **Policy-as-code:** prefer **Kyverno** policies for PSS conformance and image verification; OPA Gatekeeper referenced as an alternative. (Kyverno introduced ImageValidatingPolicy in v1.15.) ([Kyverno][9], [open-policy-agent.github.io][10])
* **Observability:** baseline on **OpenTelemetry Collector** with Prometheus/Grafana—current, vendor-neutral and widely supported. ([OpenTelemetry][11])
* **IaC choice:** recognized the ecosystem shift by allowing **Terraform *or* OpenTofu (1.7+)** to avoid licensing constraints and reflect current usage. ([GitHub][12])
* **Image & IaC scanning:** **Trivy** called out for image/IaC/K8s scans—actively maintained and commonly adopted in 2025. ([trivy.dev][13])
* **Backup/DR:** standardized on **Velero** (or platform equivalent) for cluster+PV backups and restore rehearsals. ([velero.io][14])
* **Outcome reporting:** I removed the non-standard “FOCUS” metric reference from one source prompt and aligned on **DORA Four Keys** (optionally complemented with **SPACE** signals for DevEx), which are current and research-anchored.  ([dora.dev][15], [queue.acm.org][16])

> Note: wherever I deviated from the original files it’s for currency and verifiability (examples just above). Original sources used or merged: UMCA DA system prompt and the expert DA domain prompt.

---

# 2) What changed vs the two source prompts (at a glance)

* **One canonical template** (deployment package, CI, k8s/infra manifests, obs/runbooks, evidence, package JSON). Previously overlapping sections are merged and de-duplicated.
* **Seven binary gates** (strict, minimal, automatable) replace diffuse checks spread across both prompts.
* **Handoff precision** via a **DA.Package** JSON schema to make MCA/QA handoffs machine-verifiable.
* **Runtime policies promoted to first-class gates** (PSS + Kyverno verifyImages) rather than optional guidance. ([Kubernetes][3], [release-1-9-0.kyverno.io][5])
* **Modern baselines** pinned (K8s 1.33.x, SLSA v1.0, CycloneDX 1.6, OTel, Cosign/Kyverno, Trivy, Velero, OpenTofu). ([Kubernetes][1], [SLSA][8], [cyclonedx.org][7], [OpenTelemetry][11], [Sigstore][4], [trivy.dev][17], [velero.io][14], [GitHub][12])

---

# 3) Your merged DA “Excellence” prompt

I created the merged, excellence-refined **DevOps Assistant** system prompt and saved it to canvas:

**▶ 07 DevOps Assistant — Excellence System Prompt** (see the canvas pane)

It’s ≤200 lines, contains the unified deliverables + JSON schema, the 7 binary gates, explicit fail-safe protocols, modern baselines, and a compact “required output” section. It replaces “DORA & FOCUS” with **DORA** (and optional **SPACE**) and enforces **PSS + Kyverno verifyImages + Cosign** as runtime gates.  ([dora.dev][15], [Kyverno][9], [Sigstore][4])

---

## Citations for key modernizations

* Kubernetes 1.33.3 (latest) & 1.34 release timing; Pod Security Admission & PSS guidance. ([Kubernetes][1], [kubernetes.dev][2])
* Cosign image signing; Kyverno verifyImages / ImageValidatingPolicy. ([Sigstore][4], [release-1-9-0.kyverno.io][5], [Kyverno][6])
* CycloneDX 1.6; SLSA v1.0 provenance. ([cyclonedx.org][7], [SLSA][8])
* OpenTelemetry Collector docs. ([OpenTelemetry][11])
* OpenTofu 1.7.x releases (current IaC alternative). ([GitHub][12])
* Trivy documentation; Velero backup/restore docs. ([trivy.dev][17], [velero.io][14])
* DORA Four Keys (official). ([dora.dev][15])

If you want, I can also generate a compact **execution validation checklist** (before/after line counts, gate-by-gate mapping) in a second canvas doc.

[1]: https://kubernetes.io/releases/?utm_source=chatgpt.com "Releases"
[2]: https://www.kubernetes.dev/resources/release/?utm_source=chatgpt.com "Kubernetes v1.34 Release Information"
[3]: https://kubernetes.io/docs/concepts/security/pod-security-standards/?utm_source=chatgpt.com "Pod Security Standards"
[4]: https://docs.sigstore.dev/cosign/signing/signing_with_containers/?utm_source=chatgpt.com "Signing Containers"
[5]: https://release-1-9-0.kyverno.io/docs/writing-policies/verify-images/?utm_source=chatgpt.com "Verify Images"
[6]: https://kyverno.io/docs/policy-types/image-validating-policy/?utm_source=chatgpt.com "ImageValidatingPolicy"
[7]: https://cyclonedx.org/docs/1.6/json/?utm_source=chatgpt.com "CycloneDX v1.6 JSON Reference"
[8]: https://slsa.dev/spec/v1.0/?utm_source=chatgpt.com "SLSA specification"
[9]: https://kyverno.io/docs/?utm_source=chatgpt.com "Documentation"
[10]: https://open-policy-agent.github.io/gatekeeper/website/docs/?utm_source=chatgpt.com "Introduction | Gatekeeper - GitHub Pages"
[11]: https://opentelemetry.io/docs/collector/?utm_source=chatgpt.com "Collector"
[12]: https://github.com/opentofu/opentofu/releases?utm_source=chatgpt.com "Releases · opentofu/opentofu"
[13]: https://trivy.dev/?utm_source=chatgpt.com "Trivy"
[14]: https://velero.io/docs/v1.7/?utm_source=chatgpt.com "Velero Docs - Overview"
[15]: https://dora.dev/guides/dora-metrics-four-keys/?utm_source=chatgpt.com "DORA's software delivery metrics: the four keys"
[16]: https://queue.acm.org/detail.cfm?id=3454124&utm_source=chatgpt.com "The SPACE of Developer Productivity"
[17]: https://trivy.dev/v0.60/docs/?utm_source=chatgpt.com "Overview"
