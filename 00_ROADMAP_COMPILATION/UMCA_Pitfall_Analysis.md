# AI Development Pitfalls – August 2025 Edition

## 1. Core AI Failure Patterns (with Your Additions)

1. **Looks right, is wrong** – Compiles, passes happy-path tests, but hides logic or security bugs. ("Garbage veiled in diamonds")
2. **Mocks & placeholders in production** – TODOs, stubs, dummy handlers left in shipped code.
3. **Hard-coded secrets/values** – Credentials, tokens, sensitive strings baked into code.
4. **Hallucinated packages/APIs** – Non-existent dependencies or endpoints, risking supply chain exploits.
5. **Security degradation over auto-refactors** – Each agent iteration drifts toward less secure patterns.
6. **Rigged tests & false confidence** – Tests that validate nothing but the current flawed implementation.
7. **Over-promising, under-delivering** – Glowing status reports, thin or broken artifacts.
8. **License & provenance traps** – AI code too close to GPL/copyleft sources, no attribution.
9. **Prompt/toolchain injection** – Malicious prompts altering generated code or exfiltrating data.
10. **Insecure defaults & patterns** – Weak crypto, permissive configs, unsafe logging.
11. **Phantom/stale APIs** – Calls to deprecated or imaginary services.
12. **Secret discovery by attackers** – AI-written code leaks exploitable credentials.
13. **Context loss** – AI drifts from prior requirements but pretends alignment; produces misdirected code.
14. **Bad documentation practice** – Outdated, shallow, or absent documentation for generated systems.
15. **Best practice violations** – Ignores established architectural, security, or coding guidelines.
16. **Inconsistent coding style/logic** – Fragmented patterns that hurt maintainability.
17. **Reinvents the wheel** – Builds from scratch instead of leveraging mature, proven systems.
18. **Bad dependency management** – Pins outdated or conflicting versions due to stale training data (e.g., recommending Python 3.10 when 3.13 is standard, or pinning XML lib v4 conflicting with other dependencies).
19. **Late production environment testing** – Skips or delays testing in realistic environments (e.g., Docker/K8s) until deployment, leading to late-breaking failures.

---

## 2. Business Context Package – Recommended Structure

A dedicated **"Business Context" package** should travel with the codebase to guide AI and human contributors.

### 2.1 Content Outline

- **Business Purpose** – High-level mission of the project and success metrics.
- **Functional Requirements** – Features, performance expectations, integration points.
- **Non-Functional Requirements** – Security, scalability, maintainability, compliance needs.
- **Key Constraints** – Budget, tech stack limits, regulatory boundaries.
- **Architectural Principles** – Layering, dependency rules, modularity.
- **Best Practice Checklist** – Language/framework-specific do’s and don’ts.

### 2.2 Code Template

```plaintext
src/
  feature_module/
    __init__.py
    controller.py
    service.py
    repository.py
    tests/
      test_service.py
  common/
    utils.py
    constants.py
```

- Enforces clear separation of concerns.
- Centralizes constants and utility functions.

### 2.3 Documentation Template

```markdown
# Module: [Name]

## Purpose
[Short description]

## Inputs / Outputs
- **Inputs:** [Parameters, formats]
- **Outputs:** [Return values, data formats]

## Dependencies
[List of external/internal dependencies]

## Example Usage
[Code snippet]
```

### 2.4 Testing Template

```python
import pytest
from feature_module.service import do_something

def test_do_something_valid():
    # Arrange
    input_data = {...}
    # Act
    result = do_something(input_data)
    # Assert
    assert result == {...}

def test_do_something_invalid():
    with pytest.raises(ValueError):
        do_something(None)
```

- Includes happy-path, edge cases, and failure scenarios.

---

## 3. CI/CD Enforcement (High-Level)

1. **Security Gates** – SAST, secret scanning, dependency allowlist.
2. **Quality Gates** – Linting, style consistency, branch coverage.
3. **Business Context Validation** – Ensure templates and documentation exist and are up-to-date.
4. **License Compliance** – SBOM and automated license scan.
5. **Package Reality Check** – Fail build if dependencies don’t exist, are unapproved, or are outdated/conflicting.
6. **Environment Parity** – Test in Docker/K8s mirrors before merge to detect environment-specific issues early.
