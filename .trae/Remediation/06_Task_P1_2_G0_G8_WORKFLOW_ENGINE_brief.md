# TASK BRIEF: P1.2 G0-G8 DEVELOPMENT LIFECYCLE WORKFLOW ENGINE

## METADATA
- **id**: P1_2_G_WORKFLOW
- **objective**: Implement complete G0-G8 development lifecycle with approvals, assignments, and visualization
- **scope**: api/routes/workflows.ts, api/services/workflows/, src/pages/Workflow.tsx, src/components/workflow/
- **priority**: P1
- **phase**: Core Feature Implementation

## INPUTS
- **references**:
  - ai-first-blueprint-technical-architecture.md
  - ai-first-blueprint-product-requirements.md

## OUTPUTS
- **new_files**:
  - api/routes/workflows.ts (CRUD + progression endpoints)
  - api/services/workflows/engine.ts (gate logic, approvals)
  - api/services/workflows/assignments.ts (AI/user tasks)
  - src/pages/Workflow.tsx (timeline UI)
  - src/components/workflow/GateTimeline.tsx
  - src/components/workflow/GateDetail.tsx
- **modified_files**:
  - prisma/schema.prisma (ensure Workflow model aligns with gates)

## IMPLEMENTATION REQUIREMENTS
- Gates: G0..G8 with statuses (Pending, InProgress, WaitingApproval, Approved, Rejected)
- Approval rules: role-based; approver cannot be requestor
- Assignment: to AI agents or users; track start/finish times and outcomes
- Automated quality gates: run tests, linters, security scans; block on failure
- Visualization: timeline with dependencies and current status

## COMMANDS
```bash
pnpm test -- --testPathPattern=workflow
pnpm run dev
```

## TOOLS
- Redis queue for background checks
- Jest/Vitest for tests
- Socket.io for live updates

## ARTIFACTS
- Unit/integration test results
- Screenshots of timeline UI with live data
- Logs from automated checks gating progression

## ACCEPTANCE CRITERIA
- Full G0-G8 progression with enforcement of approvals and checks
- UI reflects accurate live status and history
- Assignments to AI agents/users tracked and visible

## REJECTION CONDITIONS
- Gates can be skipped or auto-approved without policy
- Missing quality checks or unenforced failures
- UI not updating in real-time or inaccurate

## SAVE TO
`/Users/Yousef_1/Dokumenter/Ai_Coding/Blueprint_creator/.trae/Remediation/06_Task_P1_2_G0_G8_WORKFLOW_ENGINE_brief.md`