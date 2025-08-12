/**
 * Backend Authentication Types and Interfaces
 * Defines all TypeScript types for the authentication system
 */

import { Request } from 'express';

// Core User and Organization interfaces
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  role: UserRole;
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: OrganizationPlan;
  isActive: boolean;
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

// Authentication Request/Response Types
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  user: UserProfile;
  tokens: TokenPair;
  organization: OrganizationProfile;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  emailVerified: boolean;
  permissions: Permission[];
}

export interface OrganizationProfile {
  id: string;
  name: string;
  slug: string;
  plan: OrganizationPlan;
  settings: OrganizationSettings;
}

// JWT Payload Types
export interface JWTPayload {
  sub: string; // User ID
  email: string;
  organizationId: string;
  role: UserRole;
  permissions: Permission[];
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface RefreshTokenPayload {
  sub: string; // User ID
  organizationId: string;
  tokenId: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

// Enhanced Express Request with authentication
export interface AuthenticatedRequest extends Request {
  user: UserProfile;
  token: string;
  organizationId: string;
}

// Enums and Union Types
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ORG_ADMIN = 'org_admin',
  PROJECT_MANAGER = 'project_manager',
  DEVELOPER = 'developer',
  VIEWER = 'viewer'
}

export enum Permission {
  // Organization permissions
  ORG_MANAGE = 'org:manage',
  ORG_VIEW = 'org:view',
  ORG_BILLING = 'org:billing',
  
  // User management
  USER_MANAGE = 'user:manage',
  USER_VIEW = 'user:view',
  USER_INVITE = 'user:invite',
  
  // Project permissions
  PROJECT_CREATE = 'project:create',
  PROJECT_MANAGE = 'project:manage',
  PROJECT_VIEW = 'project:view',
  PROJECT_DELETE = 'project:delete',
  
  // AI Agent permissions
  AGENT_MANAGE = 'agent:manage',
  AGENT_VIEW = 'agent:view',
  AGENT_EXECUTE = 'agent:execute',
  
  // Workflow permissions
  WORKFLOW_MANAGE = 'workflow:manage',
  WORKFLOW_VIEW = 'workflow:view',
  WORKFLOW_APPROVE = 'workflow:approve',
  
  // System permissions
  SYSTEM_ADMIN = 'system:admin',
  AUDIT_VIEW = 'audit:view'
}

export enum OrganizationPlan {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise'
}

// Configuration Types
export interface OrganizationSettings {
  maxProjects: number;
  maxUsers: number;
  aiAgentQuota: number;
  allowedDomains: string[];
  requireEmailVerification: boolean;
  enableSSO: boolean;
  auditRetentionDays: number;
  customBranding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

// Error Types
export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: any;
  timestamp: Date;
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  INVALID_EMAIL = 'INVALID_EMAIL',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  SESSION_EXPIRED = 'SESSION_EXPIRED'
}

// Session Management Types
export interface SessionData {
  userId: string;
  organizationId: string;
  email: string;
  role: UserRole;
  refreshTokenId: string;
  createdAt: Date;
  lastAccessAt: Date;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Rate Limiting Types
export interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Password validation
export interface PasswordValidationRules {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  forbiddenPatterns: string[];
}

// Default Permission Sets
export const DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    Permission.SYSTEM_ADMIN,
    Permission.ORG_MANAGE,
    Permission.ORG_VIEW,
    Permission.ORG_BILLING,
    Permission.USER_MANAGE,
    Permission.USER_VIEW,
    Permission.USER_INVITE,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_MANAGE,
    Permission.PROJECT_VIEW,
    Permission.PROJECT_DELETE,
    Permission.AGENT_MANAGE,
    Permission.AGENT_VIEW,
    Permission.AGENT_EXECUTE,
    Permission.WORKFLOW_MANAGE,
    Permission.WORKFLOW_VIEW,
    Permission.WORKFLOW_APPROVE,
    Permission.AUDIT_VIEW
  ],
  [UserRole.ORG_ADMIN]: [
    Permission.ORG_MANAGE,
    Permission.ORG_VIEW,
    Permission.ORG_BILLING,
    Permission.USER_MANAGE,
    Permission.USER_VIEW,
    Permission.USER_INVITE,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_MANAGE,
    Permission.PROJECT_VIEW,
    Permission.PROJECT_DELETE,
    Permission.AGENT_MANAGE,
    Permission.AGENT_VIEW,
    Permission.AGENT_EXECUTE,
    Permission.WORKFLOW_MANAGE,
    Permission.WORKFLOW_VIEW,
    Permission.WORKFLOW_APPROVE,
    Permission.AUDIT_VIEW
  ],
  [UserRole.PROJECT_MANAGER]: [
    Permission.ORG_VIEW,
    Permission.USER_VIEW,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_MANAGE,
    Permission.PROJECT_VIEW,
    Permission.AGENT_MANAGE,
    Permission.AGENT_VIEW,
    Permission.AGENT_EXECUTE,
    Permission.WORKFLOW_MANAGE,
    Permission.WORKFLOW_VIEW,
    Permission.WORKFLOW_APPROVE
  ],
  [UserRole.DEVELOPER]: [
    Permission.ORG_VIEW,
    Permission.USER_VIEW,
    Permission.PROJECT_VIEW,
    Permission.AGENT_VIEW,
    Permission.AGENT_EXECUTE,
    Permission.WORKFLOW_VIEW
  ],
  [UserRole.VIEWER]: [
    Permission.ORG_VIEW,
    Permission.PROJECT_VIEW,
    Permission.WORKFLOW_VIEW
  ]
};

// Environment Configuration Types
export interface AuthConfig {
  jwtSecret: string;
  jwtIssuer: string;
  jwtAudience: string;
  accessTokenExpiryMinutes: number;
  refreshTokenExpiryDays: number;
  bcryptSaltRounds: number;
  rateLimitWindowMs: number;
  maxLoginAttempts: number;
  sessionRedisUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
}