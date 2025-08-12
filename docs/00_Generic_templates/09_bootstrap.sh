#!/usr/bin/env zsh
# Bootstrap script to scaffold docs-as-code execution structure for the Autonomous Coding Framework (generic version)
# Safe defaults: offline, non-destructive, idempotent.

set -euo pipefail

# Root is assumed to be the repository root. This script is stored under Generic_version.
# It will create the execution directories under the repo root's docs/ path.

ROOT_DIR="$(pwd)"
DOCS_ROOT="$ROOT_DIR/docs/execution"

mkd() {
  local d="$1"
  if [[ ! -d "$d" ]]; then
    mkdir -p "$d"
    echo "Created: $d"
  else
    echo "Exists:  $d"
  fi
}

mkf() {
  local f="$1"
  local content="$2"
  if [[ ! -f "$f" ]]; then
    printf "%s" "$content" > "$f"
    echo "Created: $f"
  else
    echo "Exists:  $f"
  fi
}

# 1) Create canonical directories
mkd "$DOCS_ROOT/briefs"
mkd "$DOCS_ROOT/reports/executor"
mkd "$DOCS_ROOT/reports/validator"
mkd "$DOCS_ROOT/state"
mkd "$DOCS_ROOT/evidence"

# 2) Seed state files (idempotent)
NOW_TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
mkf "$DOCS_ROOT/state/CURRENT_STATE.md" "# Current State\n\nInitialized: $NOW_TS\nStatus: Ready\nNotes: Repository scaffolded by 09_bootstrap.sh (Generic Version)\n"
mkf "$DOCS_ROOT/state/EVIDENCE_LOG.md" "# Evidence Log\n\n- Initialized: $NOW_TS\n"
mkf "$DOCS_ROOT/state/SESSION_HANDOFF.md" "# Session Handoff\n\nNext: Place a task brief in docs/execution/briefs/ and run the Executor.\nMC will gate the next task based on Validator decision.\n"

# 3) Optionally place a sample plan if none exists
SAMPLE_PLAN_SRC="${ROOT_DIR}/docs/02_Execution_framework/02_templates_prompt_workflows/02_workflow_templates/Generic_version/08_sample_plan.json"
PLAN_DST="$DOCS_ROOT/plan.json"
if [[ -f "$SAMPLE_PLAN_SRC" && ! -f "$PLAN_DST" ]]; then
  cp "$SAMPLE_PLAN_SRC" "$PLAN_DST"
  echo "Copied sample plan to: $PLAN_DST"
else
  if [[ -f "$PLAN_DST" ]]; then
    echo "Exists:  $PLAN_DST"
  else
    echo "Sample plan not found at $SAMPLE_PLAN_SRC; skipping copy"
  fi
fi

# 4) Print summary
cat <<EOF

Bootstrap complete.
- Briefs:              $DOCS_ROOT/briefs/
- Executor reports:    $DOCS_ROOT/reports/executor/
- Validator reports:   $DOCS_ROOT/reports/validator/
- Evidence:            $DOCS_ROOT/evidence/
- State:               $DOCS_ROOT/state/
- Plan (optional):     $DOCS_ROOT/plan.json

Next steps:
1) If planning is needed, open the Planner prompt (00_planner.md) and create plan.json (or edit the sample).
2) Otherwise, create a brief in docs/execution/briefs/ and proceed with MC → Executor → Validator.
EOF
