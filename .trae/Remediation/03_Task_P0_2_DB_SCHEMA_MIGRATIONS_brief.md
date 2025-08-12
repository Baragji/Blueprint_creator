# TASK BRIEF: P0.2 DATABASE SCHEMA & MIGRATIONS

## METADATA
- **id**: P0_2_DB_SCHEMA
- **objective**: Implement PostgreSQL schema using Prisma with migrations, seed, and Supabase RLS
- **scope**: prisma/schema.prisma, migrations/, supabase/migrations/
- **priority**: P0
- **phase**: Foundation Rebuild

## INPUTS
- **current_files**:
  - supabase/migrations/001_initial_schema.sql
  - supabase/migrations/002_rls_policies.sql
  - package.json
- **references**:
  - ai-first-blueprint-technical-architecture.md
  - ai-first-blueprint-development-guardrails.md

## OUTPUTS
- **new_files**:
  - prisma/schema.prisma (models: User, Organization, Project, Workflow, AIAgent, AuditLog)
  - prisma/migrations/* (generated via prisma migrate)
  - prisma/seed.ts (dev seed data)
- **modified_files**:
  - .env.example (DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE)
  - package.json (scripts: prisma:generate, prisma:migrate, prisma:seed)

## MODEL REQUIREMENTS
- User: id (cuid), email (unique), name, orgId (FK), roles (enum: OWNER, ADMIN, MEMBER), createdAt, updatedAt
- Organization: id, name, billingPlan, settings (JSON), limits (JSON), createdAt
- Project: id, orgId (FK), name, description, status, config (JSON), createdAt, updatedAt
- Workflow: id, projectId (FK), gate (enum: G0..G8), status, approverId, approvedAt, metadata (JSON)
- AIAgent: id, orgId (FK), type, config (JSON), performance (JSON), createdAt
- AuditLog: id, orgId (FK), actorId, action, targetType, targetId, meta (JSON), createdAt
- Indexes: composite indexes for orgId+id, projectId+gate, createdAt descending

## RLS & MULTI-TENANCY
- Enforce org-level isolation via org_id column in all tenant tables.
- Supabase policies: SELECT/INSERT/UPDATE restricted to users with matching org_id and role-based permissions.

## COMMANDS
```bash
pnpm add -D prisma ts-node
pnpm add @prisma/client
npx prisma init --datasource-provider postgresql
pnpm prisma generate
pnpm prisma migrate dev --name init_schema
pnpm ts-node prisma/seed.ts
```

## TOOLS
- Prisma ORM
- Supabase SQL for RLS policies

## ARTIFACTS
- Migration SQL files and logs
- Seed run output
- Prisma Studio screenshots showing records

## ACCEPTANCE CRITERIA
- prisma migrate dev completes and creates all tables and indexes.
- Seed inserts at least: 1 org, 1 owner user, 1 project, 1 workflow, 1 agent, 1 audit log.
- RLS policies prevent cross-org access in manual tests.

## REJECTION CONDITIONS
- Missing org_id on tenant tables; RLS not enforcing isolation.
- Prisma schema not aligned with technical architecture.
- Migrations not idempotent or fail on re-run.

## SAVE TO
`/Users/Yousef_1/Dokumenter/Ai_Coding/Blueprint_creator/.trae/Remediation/03_Task_P0_2_DB_SCHEMA_MIGRATIONS_brief.md`