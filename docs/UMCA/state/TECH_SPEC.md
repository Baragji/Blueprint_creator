# Technical Specification - Blueprint Creator

**Version**: 1.0  
**Last Updated**: 2025-01-27  
**Status**: Initial Architecture Analysis

## System Architecture

### High-Level Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React/TS)    │◄──►│   (Node/Express)│◄──►│   (Supabase)    │
│   Port: 5173    │    │   Port: 3001    │    │   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Files  │    │   Ollama Service│    │   File Storage  │
│   (Dist/Build)  │    │   (AI/LLM)      │    │   (Local/Cloud) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Technology Stack

### Frontend Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite 5+
- **Styling**: TailwindCSS 3+
- **State Management**: Redux Toolkit
- **Routing**: React Router 6+
- **Testing**: Jest + React Testing Library
- **Type Checking**: TypeScript 5+

### Backend Stack
- **Runtime**: Node.js 20+ LTS
- **Framework**: Express.js 4+
- **Language**: TypeScript
- **Authentication**: JWT with refresh tokens
- **Validation**: Joi/Zod schema validation
- **Testing**: Jest + Supertest
- **Process Management**: PM2 (production)

### Database & External Services
- **Primary DB**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **AI/LLM**: Ollama integration
- **File Storage**: Supabase Storage or local filesystem

### DevOps & Tooling
- **Package Manager**: npm/pnpm
- **CI/CD**: GitHub Actions
- **Containerization**: Docker + Docker Compose
- **Security Scanning**: Semgrep (SAST), Gitleaks (secrets)
- **Dependency Analysis**: npm audit, Snyk
- **SBOM Generation**: CycloneDX
- **Code Quality**: ESLint, Prettier, Husky

## API Contracts

### Authentication Endpoints
```typescript
// POST /api/auth/register
interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface RegisterResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  tokens: {
    access: string;
    refresh: string;
  };
}

// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user: UserProfile;
  tokens: TokenPair;
}

// POST /api/auth/refresh
interface RefreshRequest {
  refreshToken: string;
}

interface RefreshResponse {
  success: boolean;
  tokens: TokenPair;
}
```

### Project Management Endpoints
```typescript
// GET /api/projects
interface ProjectsResponse {
  projects: Project[];
  pagination: PaginationInfo;
}

// POST /api/projects
interface CreateProjectRequest {
  name: string;
  description: string;
  type: 'web' | 'service' | 'library' | 'cli';
  template?: string;
}

// GET /api/projects/:id
interface ProjectResponse {
  project: Project;
  blueprints: Blueprint[];
}
```

## Database Schema

### Core Entities

```sql
-- Users table (managed by Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  project_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blueprints table
CREATE TABLE blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  content JSONB NOT NULL,
  version VARCHAR(20) DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table (for refresh token management)
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Security Architecture

### Authentication Flow
1. User registers/logs in via Supabase Auth
2. Backend validates credentials and issues JWT pair (access + refresh)
3. Access tokens expire in 15 minutes, refresh tokens in 7 days
4. All API endpoints require valid JWT (except auth endpoints)
5. Refresh endpoint allows token renewal without re-authentication

### Security Controls
- **Input Validation**: All request payloads validated with schemas
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: SameSite cookies, CSRF tokens
- **Rate Limiting**: Per-endpoint and per-user limits
- **Secrets Management**: Environment variables, no hardcoded secrets

## Non-Functional Requirements

### Performance
- **API Response Time**: <200ms for simple queries, <1s for complex
- **Frontend Load Time**: <2s for first contentful paint
- **Database Queries**: Optimized with proper indexing
- **Caching**: Redis for session data and frequently accessed content

### Scalability
- **Horizontal Scaling**: Stateless API design for multiple instances
- **Database Scaling**: Read replicas for query distribution
- **CDN**: Static asset distribution via CDN
- **Load Balancing**: Nginx or cloud load balancer

### Reliability
- **Uptime Target**: 99.9% availability
- **Error Handling**: Graceful degradation and user-friendly error messages
- **Monitoring**: OpenTelemetry instrumentation for traces/metrics/logs
- **Backup Strategy**: Automated database backups, point-in-time recovery

### Security
- **Data Encryption**: TLS 1.3 in transit, AES-256 at rest
- **Access Control**: Role-based permissions, principle of least privilege
- **Audit Logging**: All sensitive operations logged with user context
- **Compliance**: OWASP ASVS Level 2, GDPR data protection

## Deployment Architecture

### Development Environment
```yaml
# docker-compose.yml
services:
  frontend:
    build: .
    ports: ["5173:5173"]
    environment:
      - VITE_API_URL=http://localhost:3001
  
  backend:
    build: ./api
    ports: ["3001:3001"]
    environment:
      - DATABASE_URL=${SUPABASE_DB_URL}
      - JWT_SECRET=${JWT_SECRET}
  
  database:
    image: supabase/postgres:latest
    environment:
      - POSTGRES_DB=blueprint_creator
```

### Production Environment
- **Container Orchestration**: Docker + Docker Compose or Kubernetes
- **Reverse Proxy**: Nginx with SSL termination
- **Process Management**: PM2 for Node.js processes
- **Monitoring**: Prometheus + Grafana, OpenTelemetry
- **Logging**: Centralized logging with structured JSON format

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Jest + React Testing Library (≥85% coverage)
- **Component Tests**: Isolated component testing
- **Integration Tests**: API integration testing
- **E2E Tests**: Playwright for critical user journeys

### Backend Testing
- **Unit Tests**: Jest for business logic (≥85% coverage)
- **Integration Tests**: Supertest for API endpoints
- **Database Tests**: Test database with migrations
- **Contract Tests**: API contract validation

### Quality Gates
- All tests must pass before merge
- Coverage threshold enforced at ≥85%
- Security scans (SAST, secrets, dependencies)
- Performance regression testing

---

*This specification evolves through the G0-G8 development lifecycle and is maintained by the Master Coordinator AI.*