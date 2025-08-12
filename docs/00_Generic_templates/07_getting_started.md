# Getting Started with the MC (for non-coders)

Use this if you’re starting a new or empty project and want the AI to coordinate the work.

## What to say first
Paste this as your first message to the MC:

```
Help me coordinate finishing this project.
I am non-technical; please choose the right approach automatically.
```

If you know you’re building something new (e.g., a web app), you can say:

```
Help me plan and finish a simple web app.
I am non-technical; please choose the right approach automatically.
```

If you want to skip planning and do a tiny one-off task right now:

```
Small task now: set up linting and a single test.
```

## What the MC will do
1) Prepare the workspace (creates execution folders and state files if missing).
2) Decide the right mode automatically (Adaptive Mode Selection):
   - MC+Planner (recommended for most new projects): produces a plan/roadmap (plan.json), then executes tasks step-by-step.
   - MC-only: for a small targeted task in a simple repo.
   - Multi-agent: for large/regulated work (Architect/Security/QA). The MC will ask once before using this.
3) If planning is needed, the MC will request a plan from the Planner (plan.json).
4) Decompose the plan into small tasks the Executor can perform and the Validator can verify.

If the situation is ambiguous, the MC may ask exactly one brief question and will default to MC+Planner if you don’t respond.

## Where things go
- Briefs: `docs/execution/briefs/`
- Executor reports: `docs/execution/reports/executor/`
- Validator reports: `docs/execution/reports/validator/`
- Evidence: `docs/execution/evidence/`
- State files: `docs/execution/state/` (CURRENT_STATE.md, EVIDENCE_LOG.md, SESSION_HANDOFF.md)
- Plan (if used): `docs/execution/plan.json`

## Safety defaults
- No paid services or external network calls by default.
- No destructive commands.
- No containers unless explicitly enabled.

## What you’ll see next
- If planning is needed: the Planner creates `plan.json` and (optionally) a short `Architecture.md`.
- If a task is small and clear: the MC gives the Executor a single micro-task.
- The Validator checks results with a zero-trust policy (must show a failing case first, then a passing fix).

## If you’re unsure
Just say: “Help me coordinate finishing this project.”
The MC will choose the safe path automatically and only ask you one short question if needed.

---

## Files in this Generic Version
- Planner prompt: `docs/02_Execution_framework/02_templates_prompt_workflows/02_workflow_templates/Generic_version/00_planner.md`
- MC Coordinator: `docs/02_Execution_framework/02_templates_prompt_workflows/02_workflow_templates/Generic_version/01_mc-coordinator.md`
- Task Executor: `docs/02_Execution_framework/02_templates_prompt_workflows/02_workflow_templates/Generic_version/02_task-executor.md`
- Zero-Trust Validator: `docs/02_Execution_framework/02_templates_prompt_workflows/02_workflow_templates/Generic_version/03_zero-trust-validator.md`
- Plan JSON template: `docs/02_Execution_framework/02_templates_prompt_workflows/02_workflow_templates/Generic_version/06_plan_json_template.json`

These are designed to work together so non-technical users can start safely without making technical choices upfront.
