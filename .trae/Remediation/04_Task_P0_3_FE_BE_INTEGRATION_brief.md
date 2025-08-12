# TASK BRIEF: P0.3 FRONTEND ⇄ BACKEND INTEGRATION

## METADATA
- **id**: P0_3_FE_BE_INTEGRATION
- **objective**: Standardize API responses, connect frontend components to real backend data, and implement robust error handling
- **scope**: api/app.ts, api/routes/*, src/services/*, src/pages/*, src/components/*
- **priority**: P0
- **phase**: Foundation Rebuild

## INPUTS
- **current_files**:
  - api/app.ts, api/routes/planpack.ts, api/routes/auth.ts
  - src/services/projectService.ts, src/pages/Dashboard.tsx, src/components/
- **references**:
  - ai-first-blueprint-development-guardrails.md

## OUTPUTS
- **new_files**:
  - api/middleware/response.ts (standard response shape)
  - src/components/ErrorBoundary.tsx
- **modified_files**:
  - All API routes to return { success, data, error:{code,message,details} }
  - Frontend services and pages to consume standardized responses

## IMPLEMENTATION REQUIREMENTS
- Wrap all successful responses as { success: true, data }
- Wrap all failures as { success: false, error: { code, message, details? } }
- Add global error handler in api/app.ts to format errors consistently
- Add React ErrorBoundary and loading skeletons in key pages (Dashboard, Projects, ProjectDetail)
- Replace mock data with live calls in Dashboard and Projects

## COMMANDS
```bash
pnpm test
pnpm run dev
```

## ARTIFACTS
- Screenshots: dashboard showing DB-backed projects
- Network logs showing standardized responses
- Test runs covering success and failure paths

## ACCEPTANCE CRITERIA
- All API routes return standardized shape and proper HTTP codes
- Dashboard and Projects pages render live data and handle errors gracefully
- No mock/placeholder data present in UI

## REJECTION CONDITIONS
- Non-standard responses or missing error details
- UI crashes on failed requests
- Hardcoded data in components

## SAVE TO
`/Users/Yousef_1/Dokumenter/Ai_Coding/Blueprint_creator/.trae/Remediation/04_Task_P0_3_FE_BE_INTEGRATION_brief.md`