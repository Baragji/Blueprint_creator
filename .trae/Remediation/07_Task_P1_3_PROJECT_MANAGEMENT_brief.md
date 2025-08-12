# TASK BRIEF: P1.3 PROJECT MANAGEMENT SYSTEM

## METADATA
- **id**: P1_3_PROJECTS
- **objective**: Implement full project lifecycle management with multi-tenant RBAC and audit logging
- **scope**: api/routes/projects.ts, api/services/projects/, src/pages/Projects.tsx, src/pages/ProjectDetail.tsx, src/components/projects/
- **priority**: P1
- **phase**: Core Feature Implementation

## INPUTS
- **references**:
  - ai-first-blueprint-technical-architecture.md
  - ai-first-blueprint-product-requirements.md

## OUTPUTS
- **new_files**:
  - api/routes/projects.ts (CRUD endpoints with RBAC)
  - api/services/projects/service.ts
  - src/pages/Projects.tsx (list with create)
  - src/pages/ProjectDetail.tsx (config tabs: Overview, Agents, Workflow, Team, Settings)
- **modified_files**:
  - prisma/schema.prisma (Project model finalized)
  - src/store/slices/projectsSlice.ts

## IMPLEMENTATION REQUIREMENTS
- CRUD with validation and standardized responses
- Multi-tenant isolation by org_id; RBAC: OWNER/ADMIN/MEMBER
- Config tabs: agent selection/config, workflow gates, team permissions, budgets
- AuditLog entries for all operations
- Search/sort/pagination server-side

## COMMANDS
```bash
pnpm test -- --testPathPattern=projects
pnpm run dev
```

## TOOLS
- Prisma for DB
- React Query or Redux Toolkit Query for data fetching

## ARTIFACTS
- Test results and coverage
- Screenshots of Projects list and detail views
- Audit logs entries sample dump

## ACCEPTANCE CRITERIA
- End-to-end CRUD functional with multi-tenant RBAC
- Config changes persisted and reflected in UI
- Audit logs recorded for every operation

## REJECTION CONDITIONS
- Cross-tenant data leakage
- Missing audit logs or incorrect RBAC enforcement
- UI uses mock data

## SAVE TO
`/Users/Yousef_1/Dokumenter/Ai_Coding/Blueprint_creator/.trae/Remediation/07_Task_P1_3_PROJECT_MANAGEMENT_brief.md`