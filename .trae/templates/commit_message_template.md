# Commit Message Template

## Format
```
<type>(<scope>): <description>

<body>

<footer>
```

## Types
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries

## Scope
The scope should be the name of the component/module affected:
- **auth**: Authentication related changes
- **api**: Backend API changes
- **ui**: User interface changes
- **db**: Database related changes
- **config**: Configuration changes
- **deps**: Dependency updates

## Description
- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (.) at the end
- Maximum 72 characters

## Body
- Use the imperative, present tense
- Include motivation for the change and contrasts with previous behavior
- Wrap at 72 characters

## Footer
- Reference issues and breaking changes
- Format: `Closes #123` or `Fixes #456`
- Breaking changes: `BREAKING CHANGE: <description>`

## Examples

### Feature
```
feat(auth): add user registration with email verification

Implement user registration flow with email verification.
Users can now create accounts and must verify their email
before accessing the application.

- Add registration form component
- Implement email verification service
- Add registration API endpoints
- Update authentication flow

Closes #45
```

### Bug Fix
```
fix(api): resolve user session timeout issue

Fix session timeout not being properly handled when
user is inactive for extended periods.

The session middleware now correctly validates token
expiration and returns appropriate error responses.

Fixes #123
```

### Refactor
```
refactor(ui): extract reusable button components

Break down large form components into smaller,
reusable button components to improve maintainability
and consistency across the application.

- Create BaseButton component
- Create PrimaryButton and SecondaryButton variants
- Update existing forms to use new components
- Add comprehensive button tests
```

### Test
```
test(auth): add comprehensive authentication tests

Add missing test coverage for authentication flows
including login, logout, and session management.

- Add unit tests for auth service
- Add integration tests for auth endpoints
- Add E2E tests for login/logout flows
- Achieve 95% test coverage for auth module
```

## TDD Cycle Integration

When following TDD cycles, include the cycle phase in your commit:

### RED Phase
```
test(feature): add failing tests for user profile update

[RED] Write failing tests for user profile update functionality.
Tests cover validation, API integration, and UI updates.

Next: Implement minimal code to make tests pass.
```

### GREEN Phase
```
feat(profile): implement user profile update functionality

[GREEN] Add minimal implementation to make profile update tests pass.
Implements basic CRUD operations for user profile data.

Next: Refactor for better code organization.
```

### REFACTOR Phase
```
refactor(profile): improve profile update code organization

[REFACTOR] Restructure profile update code for better maintainability.
Extract validation logic and improve error handling.

All tests remain green. Ready for next TDD cycle.
```