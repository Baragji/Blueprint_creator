# TASK BRIEF: P0.1 AUTHENTICATION BACKEND

## METADATA
- **id**: P0_1_AUTH_BACKEND
- **objective**: Implement production-grade authentication system with real JWT + Supabase integration
- **scope**: api/routes/auth.ts, api/middleware/, api/services/
- **priority**: P0 - BLOCKING ALL OTHER WORK
- **phase**: Foundation Rebuild

## INPUTS
- **current_files**: 
  - api/routes/auth.ts (contains TODO stubs)
  - src/services/authService.ts (frontend service)
  - package.json (dependencies)
  - .env.example (environment template)
- **dependencies**: Database schema must exist (P0.2)
- **references**: 
  - ai-first-blueprint-technical-architecture.md
  - ai-first-blueprint-development-guardrails.md

## OUTPUTS
- **new_files**:
  - api/middleware/auth.ts (JWT validation middleware)
  - api/middleware/rateLimiter.ts (rate limiting)
  - api/services/authService.ts (backend auth service)
  - api/utils/validation.ts (input validation)
  - api/types/auth.ts (authentication types)
- **modified_files**:
  - api/routes/auth.ts (complete implementation)
  - package.json (new dependencies)
  - .env.example (auth environment variables)

## IMPLEMENTATION REQUIREMENTS

### 1. Registration Endpoint (/api/auth/register)
**Method**: POST
**Payload**: { email, password, firstName, lastName, organizationName? }
**Implementation**:
- Input validation (email format, password strength 8+ chars, special chars)
- Supabase user creation with error handling
- Organization creation for new users (if organizationName provided)
- JWT access token (15min expiry) + refresh token (7 days)
- Database user record with profile information
- Password hashing with bcrypt (salt rounds: 12)
- Email verification flow initiation

### 2. Login Endpoint (/api/auth/login)
**Method**: POST
**Payload**: { email, password }
**Implementation**:
- Supabase authentication verification
- Rate limiting: 5 attempts per 15 minutes per IP
- JWT token pair generation (access + refresh)
- Session storage in Redis with TTL
- User profile data enrichment
- Organization context loading
- Last login timestamp update

### 3. Logout Endpoint (/api/auth/logout)
**Method**: POST
**Headers**: Authorization: Bearer <token>
**Implementation**:
- JWT token validation and extraction
- Token blacklisting in Redis
- Session cleanup and invalidation
- Supabase session termination
- Security headers (Clear-Site-Data)

### 4. Token Refresh Endpoint (/api/auth/refresh)
**Method**: POST
**Payload**: { refreshToken }
**Implementation**:
- Refresh token validation against Redis store
- New access token generation (15min TTL)
- Refresh token rotation for security
- User context re-validation

### 5. Authentication Middleware
**File**: api/middleware/auth.ts
**Functions**:
- `authenticateToken`: JWT validation for protected routes
- `requireRole`: Role-based access control
- `requireOrganization`: Organization-level permissions
- Error responses with proper HTTP codes

### 6. Rate Limiting Middleware
**File**: api/middleware/rateLimiter.ts
**Implementation**:
- Redis-backed rate limiting
- Different limits per endpoint type
- IP-based and user-based limiting
- Graceful degradation handling

## COMMANDS
```bash
# Install dependencies
pnpm add jsonwebtoken bcryptjs express-rate-limit redis ioredis
pnpm add -D @types/jsonwebtoken @types/bcryptjs

# Database connection test
node -e "const { createClient } = require('@supabase/supabase-js'); console.log('Testing Supabase connection...');"

# JWT secret generation
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Run auth tests
pnpm test -- --testPathPattern=auth

# Start development server
pnpm run dev
```

## TOOLS
- **Testing**: Jest + Supertest for API testing
- **Validation**: Joi or Zod for input validation
- **Security**: helmet for security headers
- **Logging**: winston for structured logging
- **Monitoring**: prometheus metrics for auth events

## ARTIFACTS
- **test_files**:
  - api/__tests__/auth.test.ts (complete test suite)
  - api/__tests__/middleware/auth.test.ts
  - postman/auth_collection.json (API testing)
- **documentation**:
  - docs/api/authentication.md (API documentation)
  - docs/security/jwt_implementation.md
- **evidence**:
  - test_coverage_report.html (>85% coverage)
  - security_scan_results.txt
  - postman_test_results.json

## ACCEPTANCE CRITERIA
1. **Functional Requirements**:
   - All 4 endpoints (/register, /login, /logout, /refresh) return correct HTTP codes
   - JWT tokens generated with proper expiry and validation
   - Rate limiting blocks excessive requests (5/15min for login)
   - Password validation enforces complexity rules
   - Organization creation works for new registrations

2. **Security Requirements**:
   - No hardcoded secrets (all from environment variables)
   - Passwords properly hashed with bcrypt
   - JWT tokens signed with strong secret (64+ bytes)
   - Rate limiting prevents brute force attacks
   - Input validation prevents injection attacks

3. **Integration Requirements**:
   - Supabase user creation and authentication working
   - Redis session storage and cleanup functioning
   - Frontend AuthService can call all endpoints successfully
   - Error responses include proper error codes and messages

4. **Quality Requirements**:
   - Test coverage ≥85% for all auth routes and middleware
   - All tests pass (unit + integration + E2E)
   - TypeScript strict mode with no errors
   - ESLint and Prettier compliance
   - No TODO comments or placeholder code

## REJECTION CONDITIONS
- Any endpoint returns 500 errors or empty responses
- Hardcoded values found in authentication logic
- Test coverage below 85%
- Security vulnerabilities detected in scan
- Frontend AuthService cannot authenticate users
- Rate limiting not functioning properly
- JWT tokens malformed or insecure

## EVIDENCE REQUIREMENTS
1. **Working Code Evidence**:
   - Git commit hash with all auth implementation
   - File listing showing all new/modified files
   - `git diff --stat` output showing changes

2. **Test Evidence**:
   - Jest test results with coverage report
   - Postman collection run results
   - E2E test screenshots of login/logout flow

3. **Security Evidence**:
   - Security scan results (no high/critical issues)
   - JWT token decode example showing proper structure
   - Rate limiting demonstration logs

4. **Integration Evidence**:
   - Frontend login/logout working in browser
   - Supabase dashboard showing created users
   - Redis keys showing active sessions

## DEPENDENCIES
- **Upstream**: P0.2 Database Schema must be complete
- **Downstream**: All other features depend on authentication

## SAVE TO
`/Users/Yousef_1/Dokumenter/Ai_Coding/Blueprint_creator/.trae/Remediation/01_Task_P0_1_AUTH_BACKEND_brief.md`