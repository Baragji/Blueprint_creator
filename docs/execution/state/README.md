# Execution State Directory

This folder is the single source of truth for gate progress and evidence.

## Files

- GATES_LEDGER.json (schema: ../schemas/GATES_LEDGER.schema.json)
- EVIDENCE_LOG.json (schema: ../schemas/EVIDENCE_LOG.schema.json)
- SESSION_HANDOFF.json (schema: ../schemas/SESSION_HANDOFF.schema.json)
- PROJECT_BRIEF.md / TECH_SPEC.md / CURRENT_STATE.md

## Validation

- Validate JSON files with jsonschema.
- Compute checksums: `shasum -a 256 $(git ls-files) > checksums.txt`.
- Add a Gate Review Pack for each phase in ../templates.
