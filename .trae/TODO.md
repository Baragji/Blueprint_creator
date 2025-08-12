# EXECUTOR TODO — PRODUCTION REMEDIATION PLAN

Status convention: [ ] open · [~] in-progress · [x] done
All tasks MUST meet Global Quality Gates before marking done.

## Phase 1 — Foundation Rebuild (P0 — Blocking)
- [ ] P0.1 Authentication (Backend + Frontend)
  - Backend: Implement /api/auth/register, /login, /logout; JWT (access+refresh); RBAC middleware; rate limiting; input validation.
  - Frontend: Wire AuthService to real endpoints; persistent sessions; error states.
  - Evidence: Postman collection; unit+integration+E2E tests; coverage ≥85%; no TODOs.
- [ ] P0.2 Database Schema & Migrations
  - Prisma schema (users, orgs, projects, workflows, ai_agents, audit_logs); migrations + rollback; seed data; indexes.
  - Supabase config + RLS policies; env-based connection.
  - Evidence: Migration logs; CRUD tests via Prisma; RLS tests.
- [ ] P0.3 Frontend ⇄ Backend Integration
  - Standard API response shape; proper HTTP codes; error boundaries.
  - Dashboard uses real DB data; project create/read/update/delete end-to-end.
  - Evidence: E2E flows (login → create project → view dashboard) green.
- [ ] P0.4 Env, CI, SecOps Baseline
  - .env.example; secret handling; lint/format/pre-commit hooks; basic CI pipeline (lint, test, typecheck).
  - Evidence: CI green on main; no secrets committed.

## Phase 2 — Core Features (P1)
- [ ] P1.1 Plan Pack Creator P0–P6 (Build from working PoC)
  - Multi-gate pipeline with real Ollama calls; artifacts persisted; human approval per gate; versioned outputs (PDF/HTML/JSON).
  - Evidence: End-to-end run from idea → approved plan pack; artifacts stored.
- [ ] P1.2 G0–G8 Development Lifecycle Engine
  - Gate logic, approvals, task assignment (AI/human), timeline view with real-time status.
  - Evidence: Demo project traverses G0→G8 with approvals recorded.
- [ ] P1.3 Project Management CRUD
  - Templates, configuration, team & roles, audit logging, multi-tenant isolation.
  - Evidence: RBAC tests; audit entries for all actions.

## Phase 3 — AI Agent Orchestration (P2)
- [ ] P2.1 AI Agent Management & Orchestration
  - Agent types (Planner, Security, SRE…); config; Redis-backed queue; retries; monitoring dashboard.
  - Evidence: Parallel agents executing tasks with metrics recorded.
- [ ] P2.2 Guardrails & Compliance
  - Zero-trust pipeline; SAST/DAST; secret/license scans; SBOM + provenance; policy gates.
  - Evidence: Non-compliant code blocked; reports archived.

## Phase 4 — Metrics & FinOps (P3)
- [ ] P3.1 DORA Metrics
  - Deploy frequency, lead time, change failure rate, MTTR collection and dashboards.
- [ ] P3.2 FinOps
  - AI usage/cost tracking; budgets and alerts; project/org cost breakdown.

## Global Quality Gates (apply to every item)
- Red/Green/Refactor TDD; coverage ≥85%; type-safe; no TODO/placeholder; no hardcoded secrets; standardized API errors; E2E happy-path and failure-path tests; artifacts stored under /artifacts with README of evidence; human approval required.

## Archived (done previously)
- [x] Server startup on :3001 fixed
- [x] Tailwind undefined classes fixed
- [x] Ollama local integration installed/configured
