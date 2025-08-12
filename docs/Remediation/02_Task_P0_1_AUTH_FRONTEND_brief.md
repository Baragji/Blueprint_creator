# TASK BRIEF: P0.1 AUTHENTICATION FRONTEND

## METADATA
- **id**: P0_1_AUTH_FRONTEND
- **objective**: Wire frontend AuthService to real backend endpoints with robust UX states
- **scope**: src/services/authService.ts, src/pages/Login.tsx, src/store, src/types/auth.ts, src/App.tsx
- **priority**: P0
- **phase**: Foundation Rebuild

## INPUTS
- **current_files**:
  - src/services/authService.ts (contains TODOs and placeholder logic)
  - src/pages/Login.tsx
  - src/store/
  - src/types/auth.ts
  - api/routes/auth.ts (backend contract)
- **references**:
  - ai-first-blueprint-technical-architecture.md
  - ai-first-blueprint-development-guardrails.md

## OUTPUTS
- **modified_files**:
  - src/services/authService.ts (real API calls: /register, /login, /logout, /refresh)
  - src/pages/Login.tsx (error states, loading, remember me, MFA prompt placeholder)
  - src/store/slices/authSlice.ts (actions for login/logout/refresh and selectors)
  - src/App.tsx (protected routes wrapper)
- **new_files**:
  - src/components/AuthGuard.tsx (protect routes)
  - src/hooks/useAuth.ts (encapsulate auth logic)
  - src/utils/http.ts (axios/fetch wrapper with interceptors for token refresh)
  - src/test/auth.e2e.spec.ts (Playwright/Cypress or RTL E2E)

## IMPLEMENTATION REQUIREMENTS
- Use token storage strategy: accessToken in memory + httpOnly refresh cookie or secure local storage fallback with rotation.
- Implement global HTTP interceptor: attach access token, handle 401 by refreshing once, then logout.
- Add AuthGuard that checks auth state and redirects to /login.
- Login page: form validation, disabled state during API call, visible error messages, success redirect.
- Persist user profile in Redux store; rehydrate on page load via /me or refresh.
- Add logout that clears store, tokens, and navigates to /login.
- Unit tests for service and slice; integration test for Login flow.

## COMMANDS
```bash
pnpm add axios
pnpm add -D @testing-library/react @testing-library/jest-dom
pnpm test -- --testPathPattern=auth
pnpm run dev
```

## TOOLS
- React Testing Library + Jest
- Axios (or fetch with wrapper)
- Redux Toolkit

## ARTIFACTS
- Unit test outputs and coverage
- E2E test screenshots for login success/failure
- Postman proof calling backend via browser devtools logs

## ACCEPTANCE CRITERIA
- Successful login shows dashboard with user’s name; failed login shows error without leaving page.
- Token auto-refresh on 401; if refresh fails, user is logged out.
- Protected routes redirect unauthenticated users to /login.
- Coverage ≥85% on auth service and slice.

## REJECTION CONDITIONS
- Any silent failures without user feedback.
- Tokens stored insecurely or left uncleared on logout.
- No tests or coverage below threshold.

## SAVE TO
`/Users/Yousef_1/Dokumenter/Ai_Coding/Blueprint_creator/.trae/Remediation/02_Task_P0_1_AUTH_FRONTEND_brief.md`