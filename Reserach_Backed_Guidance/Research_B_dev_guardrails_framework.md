Here’s a clean brief you can hand to your dev (and paste into your repo’s `/docs/` as “Guardrails.md”). It keeps your intent but makes it enforceable.

# Non-Negotiable Guardrails (before invoking any coding agent)

1. Baseline standards

* TDD-first on all new code and bug fixes. No code without a failing test first. Follow the RED → GREEN → REFACTOR loop.&#x20;
* Context persistence after every action via `python3 update_context.py "<what changed>"`; status via `python3 check_context.py`.&#x20;
* One coding style per language (formatter + linter + type-checker) enforced locally and in CI.
* No hardcoded secrets/keys/URLs; use env + secret manager.
* No silent stubs or fake success (no empty try/except, no `pass`, no `sleep` to “stabilize tests”).
* Mocks allowed only in tests; never in production code paths.
* Small, incremental commits; each commit must keep the repo green (tests pass).
* Every key delivery pauses for validation before proceeding.

2. Local pre-commit (must pass to commit)

* Fast unit tests for changed scope only.
* Lint/format/type-check.
* Secrets/keys scan + forbidden patterns scan (e.g., `eval`, print-debug, TODO stubs).
* Commit msg template filled (see below).

3. CI gates (must pass to merge)

* Full test suite + coverage threshold (set a number; block below it).
* Build in clean container to catch env drift.
* Security & license scan of dependencies.
* Artifact upload: test report, coverage, SBOM, and “delivery packet” (below).

---

# Operating Protocol (while the coding agent works)

A. TDD & context discipline

* For each task: write failing test(s) → minimal code to pass → refactor. After each step run `update_context.py` and keep `current-session.md` / `NEXT_ACTIONS.md` current to prevent context loss.&#x20;

B. Iterative, validated building

* After any “key delivery” (new module, API, migration, schema, public component), the agent must STOP and submit a Delivery Packet to the validator (human or QA bot), then wait for APPROVE/REVISE.
* Key deliveries are defined in the task brief; the orchestrator enforces this pause.

C. Consistency guard (prevents mixed practices)

* Lock project conventions per language and architecture (e.g., one HTTP client, one test framework, one DI pattern).
* CI check rejects diffs introducing a second pattern/tool for the same concern (e.g., adding `requests` when `httpx` is the standard).

---

# Delivery Packet (what the agent must send for validation)

* Diff summary (what changed and why).
* Tests added/updated + proof they failed first (attach failing run log) and then passed.
* Coverage delta and hotspots.
* Run logs from clean container build.
* Any new env vars/secrets required and where they’re read.
* Updated context files (`current-session.md`, `NEXT_ACTIONS.md`) and the exact `update_context.py` entry used.&#x20;

Validator returns: **APPROVE** (proceed) or **REVISE** (block next tasks; reply with concrete fixes).

---

# Definition of Done (for any task)

* Failing test(s) existed first; now all tests pass locally & in CI.
* Code formatted, linted, typed; no TODO stubs; no console prints.
* No secrets or hardcoded config; env documented.
* Coverage meets threshold and didn’t regress critical areas.
* Context updated and `check_context.py` is clean.&#x20;
* Delivery Packet approved.

---

# PR Template (drop into `.github/pull_request_template.md`)

```md
## What & Why
- Summary:
- Linked task:

## TDD Evidence
- Link to failing test run:
- Link to passing test run:
- Tests added/updated:

## Quality Gates
- [ ] Lint/format/type-check pass locally
- [ ] Full CI green
- Coverage before: __% → after: __% (threshold: __%)
- Secrets scan: pass
- Forbidden patterns scan: pass

## Context
- `update_context.py` entry: "<paste>"
- `current-session.md` and `NEXT_ACTIONS.md` updated ✔️

## Review Notes
- Risks / roll-back:
- Follow-up tasks:
```

---

# Commit Message Template (enforce with commitlint)

```
type(scope): short summary

Why:
What changed:
Tests:
Context update: <paste the exact update_context.py message>  ← required :contentReference[oaicite:5]{index=5}
```

---

# GuardrailsSpec (YAML you can keep in `/guardrails/spec.yml`)

```yaml
version: 1
tdd:
  required: true
  workflow: [RED, GREEN, REFACTOR]
  context_scripts:
    update: "python3 update_context.py"
    check: "python3 check_context.py"
stopping_points:
  key_deliveries:
    - "new_module"
    - "public_api"
    - "db_migration"
    - "shared_ui_component"
  require_validation_ack: true
quality:
  local_precommit:
    - tests_changed_scope_only
    - lint
    - format
    - typecheck
    - secrets_scan
    - forbidden_patterns_scan
  ci:
    - full_test_suite
    - coverage_threshold: 85
    - containerized_build: true
    - dep_security_scan: true
consistency:
  singletons:
    - http_client: "httpx"
    - test_framework: "pytest"
    - formatter: "black"
    - linter: "ruff"
    - type_checker: "mypy"
    - mock_library: "pytest-mock"
  block_on_alternative_tool_introduction: true
prohibited:
  - hardcoded_secrets
  - print_debug
  - eval_usage
  - sleep_in_tests
deliverable_packet:
  require:
    - diff_summary
    - tdd_evidence_failing_then_passing
    - coverage_report
    - container_build_logs
    - env_changes
    - context_files_updated
definition_of_done:
  - tests_written_first_and_all_green
  - quality_gates_passed
  - coverage_met
  - context_clean
  - delivery_packet_approved
```

---

# Notes on TDD adaptation to your system

* Your TDD guide is canonical for this repo; agents must follow it exactly and update context after every action to avoid context loss and enable smooth handoffs.&#x20;
* If you have a separate context manager/orchestrator, have it auto-reject any agent step that lacks the latest `update_context.py` entry and fresh `current-session.md`/`NEXT_ACTIONS.md`.&#x20;
