# Implementation Task Brief: IA-Foundation

**Task ID**: IA-Foundation  
**Objective**: Implement project foundation with authentication system using TDD methodology  
**Inputs**: AA-TaskAPI architecture specification (complete API contract + database schema)  
**Context**: First development cycle - establish project structure, database, and user authentication

## 🎯 TDD Workflow (Mandatory)

### **RED → GREEN → REFACTOR Cycle**
1. **RED**: Write failing tests first (authentication endpoints)
2. **GREEN**: Implement minimum code to pass tests  
3. **REFACTOR**: Clean up code while keeping tests green
4. **EVIDENCE**: Update context after each cycle completion

## 📋 Implementation Scope (Single Development Cycle)

### **Project Foundation**
- **Package Initialization**: Node.js project with Express, PostgreSQL, Jest
- **Directory Structure**: Follow AA specification (routes/, middleware/, controllers/)
- **Database Setup**: PostgreSQL connection, migration system
- **CI/CD Integration**: GitHub Actions workflow, UMCA scripts integration

### **Authentication System Implementation** 
- **User Model**: Database operations (create, findById, findByUsername)
- **Authentication Routes**: POST /auth/register, POST /auth/login, POST /auth/refresh
- **JWT Middleware**: Token generation, validation, refresh strategy
- **Security Features**: Password hashing, rate limiting, input validation

### **Testing Requirements**
- **Unit Tests**: User model, authentication controller, JWT utilities
- **Integration Tests**: Authentication endpoints end-to-end  
- **Security Tests**: Invalid token handling, rate limiting, SQL injection prevention
- **Coverage Target**: ≥85% test coverage for all implemented code

## 🧪 Acceptance Criteria (From AA Specification)

### **User Registration (POST /auth/register)**
```gherkin
Given I am an unregistered user
When I POST to /api/v1/auth/register with valid user data
Then I should receive a 201 status code
And I should receive a JWT token  
And I should receive user data without password hash
And the user should be created in the database

Given I POST with existing username
Then I should receive a 409 status code
And appropriate error message
```

### **User Login (POST /auth/login)**  
```gherkin
Given I am a registered user with valid credentials
When I POST to /api/v1/auth/login with correct credentials
Then I should receive a 200 status code
And I should receive a valid JWT token
And I should receive user data

Given I POST with incorrect password  
Then I should receive a 401 status code
And appropriate error message
```

### **JWT Token Validation**
```gherkin
Given I have a valid JWT token
When I make authenticated requests to protected endpoints
Then requests should be authorized successfully

Given I have an expired/invalid token
When I make authenticated requests
Then I should receive a 401 status code
```

### **Rate Limiting**
```gherkin
Given I make 5 failed login attempts in 1 minute
When I attempt to login again  
Then I should receive a 429 status code
And rate limit error message
```

## 🛠️ Technical Implementation Details

### **Database Schema (From AA Spec)**
```sql  
-- Implement these tables with migrations
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL, 
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_hash VARCHAR(255) NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### **Required Dependencies**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0", 
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "express-rate-limit": "^6.7.0",
    "helmet": "^6.1.5",
    "cors": "^2.8.5",
    "winston": "^3.8.2",
    "joi": "^17.9.1"
  },
  "devDependencies": {
    "jest": "^29.5.0",
    "supertest": "^6.3.3",
    "nodemon": "^2.0.22"
  }
}
```

### **Environment Variables**
```env
DB_HOST=localhost
DB_PORT=5432  
DB_NAME=task_management
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your-256-bit-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
NODE_ENV=development
PORT=3000
```

## ✅ Definition of Done

### **Code Quality**
- ✅ All tests pass locally and in CI pipeline
- ✅ Test coverage ≥85% (enforced by UMCA check-coverage.mjs)
- ✅ ESLint passes with no warnings
- ✅ No hardcoded secrets or TODOs in code

### **Security Requirements**  
- ✅ SAST scan passes (no critical/high security issues)
- ✅ Secrets scan passes (no exposed credentials)
- ✅ Password hashing implemented with bcryptjs
- ✅ JWT tokens signed with secure algorithm (HS256)
- ✅ Rate limiting active on authentication endpoints

### **CI/CD Integration**
- ✅ GitHub Actions pipeline passes all jobs
- ✅ SBOM generation successful
- ✅ Build artifacts created and provenance attached
- ✅ Coverage evidence generated in docs/execution/evidence/

### **Documentation & Evidence**
- ✅ API documentation updated for implemented endpoints
- ✅ Database migration scripts created and tested
- ✅ Context updated with implementation summary
- ✅ Evidence package includes test results, coverage report, security scans

## 🚀 Implementation Steps (TDD Process)

1. **Setup Project Structure** (30 min)
   - Initialize Node.js project with dependencies
   - Create directory structure per AA specification
   - Setup database connection and migration system

2. **RED: Write Authentication Tests** (45 min)
   - User registration endpoint tests
   - User login endpoint tests  
   - JWT validation middleware tests
   - Rate limiting tests

3. **GREEN: Implement Authentication** (90 min)
   - User model with database operations
   - Password hashing and validation
   - JWT token generation and validation
   - Authentication routes and controllers

4. **GREEN: Security & Middleware** (45 min)
   - Rate limiting middleware
   - Input validation middleware  
   - Error handling middleware
   - Security headers (Helmet.js)

5. **REFACTOR: Code Cleanup** (30 min)
   - Extract common utilities
   - Improve error messages
   - Code formatting and documentation

6. **Evidence Collection** (15 min)
   - Run test coverage report
   - Execute security scans
   - Update context with completion summary

**Total Estimated Time**: 4.25 hours (single development cycle)

## 📋 Context Update Command
```bash
# After completion, update context:
python3 scripts/update_context.py "IA-Foundation completed - Authentication system implemented with TDD, ≥85% coverage achieved"
```

## 🎯 Success Metrics

- **Functionality**: All authentication endpoints working per AA specification
- **Testing**: ≥85% coverage with comprehensive test suite
- **Security**: OWASP compliance, secure JWT implementation  
- **Performance**: Sub-200ms response times for auth endpoints
- **Quality**: Clean code, no security vulnerabilities, CI pipeline passing

---

**Master Coordinator**: Awaiting IA implementation completion with evidence package. G2→G3 gate progression pending successful authentication system delivery and quality validation.

**Implementation Priority**: HIGH - Foundation system blocks all subsequent development cycles.