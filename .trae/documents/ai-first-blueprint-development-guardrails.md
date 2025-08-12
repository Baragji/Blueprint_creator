# AI-First Blueprint Development Guardrails Framework

## Executive Summary

This document establishes **non-negotiable guardrails** for the AI-First Enterprise Blueprint application development. It prevents AI coding agents from deviating from established practices, taking shortcuts, or losing context mid-development. The framework enforces Test-Driven Development (TDD), maintains consistency across sessions, and requires human validation at key delivery points.

## Core Problem Statement

**Challenge**: AI coding agents lose context over time, leading to:
- Inconsistent coding practices within the same project
- Shortcuts and hardcoded solutions ("garbage veiled in diamonds")
- Deviation from established standards mid-development
- Integration issues when mixing different valid approaches
- Fake success indicators and untested code paths

## Non-Negotiable Baseline Standards

### 1. Test-Driven Development (TDD) - MANDATORY

**RED → GREEN → REFACTOR cycle for ALL code:**
- **RED**: Write failing test(s) first - NO CODE without failing test
- **GREEN**: Implement minimal code to pass the test
- **REFACTOR**: Clean up code without breaking tests
- **VALIDATE**: Submit delivery packet for approval

**Enforcement:**
- Pre-commit hooks block commits without test evidence
- CI pipeline requires proof of failing-then-passing test runs
- Coverage threshold: **85% minimum** (configurable per module)

### 2. Context Preservation System

**Mandatory after every coding action:**
```bash
python3 update_context.py "<what changed and why>"
python3 check_context.py  # Must be clean before proceeding
```

**Required files to maintain:**
- `current-session.md` - Current state and approach
- `NEXT_ACTIONS.md` - Planned next steps
- `ARCHITECTURE_DECISIONS.md` - Locked-in patterns and tools

**Auto-rejection rule**: Orchestrator MUST reject any agent step lacking:
- Latest `update_context.py` entry
- Fresh `current-session.md`/`NEXT_ACTIONS.md`

### 3. Consistency Enforcement

**One tool per concern (locked once chosen):**
- HTTP Client: `axios` (React), `fetch` (Node.js)
- Test Framework: `Jest` + `React Testing Library`
- State Management: `Redux Toolkit`
- Styling: `Tailwind CSS`
- Database ORM: `Prisma`
- API Framework: `Express.js`
- Type Checking: `TypeScript`
- Linting: `ESLint`
- Formatting: `Prettier`

**CI check rejects** introduction of alternative tools for same concern.

### 4. Prohibited Practices

**Absolutely forbidden:**
- Hardcoded secrets, URLs, or configuration
- Empty `try/catch` blocks or silent failures
- `console.log` or debug prints in production code
- `setTimeout` or `sleep` to "stabilize" tests
- Mocks in production code paths (tests only)
- TODO stubs or incomplete implementations
- Fake success responses or placeholder data

## Key Delivery Validation System

### Mandatory Stop Points

Agent MUST pause and submit delivery packet for validation after:
- **New React Component** (reusable UI components)
- **New API Endpoint** (backend routes and handlers)
- **Database Schema Changes** (migrations, new tables)
- **Authentication/Authorization Logic** (security-critical code)
- **Integration with External Services** (AI APIs, third-party services)
- **State Management Updates** (Redux slices, actions)
- **New Feature Module** (complete user-facing features)

### Delivery Packet Requirements

Agent must submit:

1. **Code Changes Summary**
   - What changed and why
   - Architecture decisions made
   - Dependencies added/removed

2. **TDD Evidence**
   - Link to failing test run log
   - Link to passing test run log
   - Test coverage report with delta
   - List of tests added/updated

3. **Quality Assurance**
   - Lint/format/type-check results
   - Security scan results
   - Build logs from clean container
   - Performance impact assessment

4. **Context Documentation**
   - Updated `current-session.md`
   - Updated `NEXT_ACTIONS.md`
   - Exact `update_context.py` entry used
   - Architecture decisions documented

5. **Environment Changes**
   - New environment variables required
   - Configuration changes needed
   - Deployment considerations

### Validation Response

**Human validator returns:**
- **APPROVE**: Agent may proceed to next task
- **REVISE**: Agent blocked until specific issues addressed

## Quality Gates (Automated)

### Pre-Commit Hooks (Local)

**Must pass to commit:**
```bash
# Fast unit tests for changed files only
npm test -- --findRelatedTests --passWithNoTests

# Code quality
npm run lint
npm run format:check
npm run type-check

# Security scans
npm audit --audit-level moderate
npm run scan:secrets
npm run scan:patterns  # Forbidden patterns

# Context validation
python3 check_context.py
```

### CI Pipeline (GitHub Actions)

**Must pass to merge:**
```yaml
# Full test suite
- name: Run all tests
  run: npm test -- --coverage --watchAll=false
  
# Coverage threshold
- name: Check coverage
  run: npm run test:coverage:check  # Fails if < 85%
  
# Clean container build
- name: Docker build
  run: docker build -t ai-blueprint .
  
# Security & dependency scans
- name: Security audit
  run: npm audit --audit-level high
  
- name: License scan
  run: npm run scan:licenses
  
# Generate artifacts
- name: Generate SBOM
  run: npm run generate:sbom
```

## AI-First Blueprint Specific Rules

### Frontend (React) Standards

**Component Structure:**
```typescript
// REQUIRED: Every component must have tests
// ComponentName.tsx
// ComponentName.test.tsx
// ComponentName.stories.tsx (for Storybook)

// REQUIRED: TypeScript interfaces
interface ComponentProps {
  // Explicit prop types
}

// REQUIRED: Error boundaries for user-facing components
const ComponentName: React.FC<ComponentProps> = ({ ...props }) => {
  // Implementation
};

export default ComponentName;
```

**State Management:**
- All global state through Redux Toolkit
- Local state with `useState` for component-specific data
- No prop drilling beyond 2 levels
- Async operations through RTK Query

### Backend (Node.js/Express) Standards

**API Endpoint Structure:**
```typescript
// REQUIRED: Every endpoint must have tests
// routes/endpoint.ts
// routes/endpoint.test.ts

// REQUIRED: Input validation with Joi/Zod
// REQUIRED: Error handling middleware
// REQUIRED: Authentication/authorization checks
// REQUIRED: OpenAPI documentation

router.post('/api/endpoint', 
  validateInput(schema),
  authenticateUser,
  authorizeAction,
  async (req, res, next) => {
    try {
      // Implementation
    } catch (error) {
      next(error); // Never silent failures
    }
  }
);
```

**Database Operations:**
- All queries through Prisma ORM
- Transactions for multi-table operations
- Input sanitization and parameterized queries
- Database migrations with rollback scripts

### AI Integration Standards

**AI Service Calls:**
```typescript
// REQUIRED: Retry logic with exponential backoff
// REQUIRED: Rate limiting
// REQUIRED: Cost tracking
// REQUIRED: Error handling for API failures
// REQUIRED: Prompt versioning and logging

interface AIServiceConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  retryAttempts: number;
}

class AIService {
  async callAI(prompt: string, config: AIServiceConfig): Promise<AIResponse> {
    // Implementation with all requirements
  }
}
```

## Context Management Scripts

### update_context.py
```python
#!/usr/bin/env python3
import sys
import json
from datetime import datetime

def update_context(message):
    """Update context with timestamped entry"""
    if not message:
        print("Error: Context message required")
        sys.exit(1)
    
    entry = {
        "timestamp": datetime.now().isoformat(),
        "message": message,
        "session_id": get_current_session_id()
    }
    
    # Append to context log
    with open('.trae/context/session.jsonl', 'a') as f:
        f.write(json.dumps(entry) + '\n')
    
    # Update current session markdown
    update_session_md(message)
    
    print(f"Context updated: {message}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 update_context.py '<message>'")
        sys.exit(1)
    
    update_context(sys.argv[1])
```

### check_context.py
```python
#!/usr/bin/env python3
import os
import sys
from datetime import datetime, timedelta

def check_context():
    """Verify context is current and complete"""
    issues = []
    
    # Check required files exist
    required_files = [
        '.trae/context/current-session.md',
        '.trae/context/NEXT_ACTIONS.md',
        '.trae/context/ARCHITECTURE_DECISIONS.md'
    ]
    
    for file_path in required_files:
        if not os.path.exists(file_path):
            issues.append(f"Missing required file: {file_path}")
    
    # Check last update recency
    session_file = '.trae/context/session.jsonl'
    if os.path.exists(session_file):
        with open(session_file, 'r') as f:
            lines = f.readlines()
            if lines:
                last_entry = json.loads(lines[-1])
                last_update = datetime.fromisoformat(last_entry['timestamp'])
                if datetime.now() - last_update > timedelta(hours=1):
                    issues.append("Context not updated in over 1 hour")
    
    if issues:
        print("Context check FAILED:")
        for issue in issues:
            print(f"  - {issue}")
        sys.exit(1)
    else:
        print("Context check PASSED")

if __name__ == "__main__":
    check_context()
```

## Commit Message Template

**Enforced with commitlint:**
```
type(scope): short summary

Why: [Business justification]
What changed: [Technical details]
Tests: [Test evidence]
Context update: [Exact update_context.py message]

Breaking changes: [If any]
Follow-up tasks: [If any]
```

**Types:** feat, fix, docs, style, refactor, test, chore
**Scopes:** frontend, backend, api, database, auth, ai, docs

## Pull Request Template

```markdown
## What & Why
- **Summary**: 
- **Linked Issue/Task**: 
- **Business Value**: 

## TDD Evidence
- **Failing test run**: [Link to CI run showing failing tests]
- **Passing test run**: [Link to CI run showing passing tests]
- **Tests added/updated**: [List of test files]
- **Coverage impact**: Before: __% → After: __% (Threshold: 85%)

## Quality Gates
- [ ] All tests pass locally and in CI
- [ ] Lint/format/type-check pass
- [ ] Security scans pass
- [ ] No hardcoded secrets or config
- [ ] No TODO stubs or incomplete code
- [ ] Coverage threshold met
- [ ] Clean container build successful

## Context & Consistency
- **Context update entry**: "[Paste exact update_context.py message]"
- [ ] `current-session.md` updated
- [ ] `NEXT_ACTIONS.md` updated
- [ ] No new tools introduced for existing concerns
- [ ] Follows established patterns

## Delivery Packet
- [ ] Code changes documented
- [ ] Architecture decisions recorded
- [ ] Environment changes noted
- [ ] Performance impact assessed
- [ ] Security implications reviewed

## Validation
- **Human Reviewer**: [Required for key deliveries]
- **Approval Status**: [ ] APPROVED / [ ] NEEDS REVISION
- **Follow-up Actions**: [If any]
```

## Guardrails Configuration

### .trae/guardrails/config.yml
```yaml
version: 1.0
project: "ai-first-blueprint"

tdd:
  required: true
  workflow: ["RED", "GREEN", "REFACTOR", "VALIDATE"]
  coverage_threshold: 85
  context_scripts:
    update: "python3 update_context.py"
    check: "python3 check_context.py"

stopping_points:
  key_deliveries:
    - "react_component"
    - "api_endpoint"
    - "database_migration"
    - "auth_logic"
    - "external_integration"
    - "state_management"
    - "feature_module"
  require_validation: true
  timeout_hours: 24  # Max time before forced validation

quality_gates:
  local_precommit:
    - "test_changed_files"
    - "lint"
    - "format_check"
    - "type_check"
    - "security_scan"
    - "context_check"
  
  ci_pipeline:
    - "full_test_suite"
    - "coverage_check"
    - "container_build"
    - "dependency_audit"
    - "license_scan"
    - "sbom_generation"

consistency:
  locked_tools:
    http_client_frontend: "axios"
    http_client_backend: "fetch"
    test_framework: "jest"
    state_management: "redux-toolkit"
    styling: "tailwindcss"
    database_orm: "prisma"
    api_framework: "express"
    type_system: "typescript"
    linter: "eslint"
    formatter: "prettier"
  
  block_alternatives: true
  
prohibited_patterns:
  - "console.log"
  - "console.error"
  - "TODO"
  - "FIXME"
  - "setTimeout.*test"
  - "sleep.*test"
  - "hardcoded_secret"
  - "eval\("
  - "innerHTML"
  - "dangerouslySetInnerHTML"

delivery_packet:
  required_sections:
    - "code_changes_summary"
    - "tdd_evidence"
    - "quality_assurance"
    - "context_documentation"
    - "environment_changes"
  
  validation_timeout_hours: 4
  auto_reject_incomplete: true

definition_of_done:
  - "tests_written_first"
  - "all_tests_passing"
  - "coverage_threshold_met"
  - "quality_gates_passed"
  - "context_updated"
  - "delivery_packet_approved"
  - "no_prohibited_patterns"
  - "consistent_with_standards"
```

## Implementation Checklist

### Phase 1: Foundation Setup
- [ ] Create `.trae/guardrails/` directory structure
- [ ] Implement `update_context.py` and `check_context.py` scripts
- [ ] Configure pre-commit hooks
- [ ] Set up CI pipeline with quality gates
- [ ] Create PR and commit templates
- [ ] Document locked tool choices

### Phase 2: Enforcement Automation
- [ ] Configure automated coverage checking
- [ ] Set up security scanning tools
- [ ] Implement pattern detection for prohibited practices
- [ ] Create delivery packet validation system
- [ ] Set up orchestrator auto-rejection rules

### Phase 3: Monitoring & Metrics
- [ ] Track context update frequency
- [ ] Monitor consistency violations
- [ ] Measure delivery packet approval rates
- [ ] Generate quality metrics dashboard
- [ ] Create alerts for guardrail violations

## Success Metrics

**Quality Indicators:**
- Test coverage consistently ≥ 85%
- Zero hardcoded secrets in production
- 100% of key deliveries validated before proceeding
- Context updated within 1 hour of any code change
- Zero mixing of tools for same concerns

**Process Indicators:**
- Average delivery packet approval time < 4 hours
- Guardrail violation rate < 5%
- Context check pass rate > 95%
- CI pipeline success rate > 90%

## Conclusion

This guardrails framework transforms AI agent development from "hoping for quality" to "enforcing quality through automation." It prevents context loss, maintains consistency, and ensures every piece of code meets enterprise standards before integration.

The framework is designed to be:
- **Enforceable**: Automated checks prevent violations
- **Comprehensive**: Covers all aspects of development quality
- **Practical**: Integrates with existing tools and workflows
- **Scalable**: Supports team growth and project complexity

By implementing these guardrails, we ensure that the AI-First Enterprise Blueprint application maintains the highest quality standards throughout its development