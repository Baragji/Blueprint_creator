/**
 * Authentication Types
 * 
 * Defines the TypeScript interfaces and types for authentication-related data structures.
 * These types ensure type safety across the authentication system.
 */

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'owner' | 'admin' | 'user'
  organizationId: string
  createdAt?: string
  updatedAt?: string
  lastLoginAt?: string
  isActive?: boolean
}

export interface Organization {
  id: string
  name: string
  domain?: string
  settings: {
    allowSelfRegistration: boolean
    requireEmailVerification: boolean
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
    }
  }
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterCredentials {
  email: string
  password: string
  firstName: string
  lastName: string
  organizationName: string
  organizationDomain?: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
  organization?: Organization
}

export interface TokenRefreshResponse {
  token: string
  refreshToken: string
}

export interface AuthError {
  message: string
  code: string
  field?: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  newPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface EmailVerificationRequest {
  token: string
}

// Auth state for Redux store
export interface AuthState {
  user: User | null
  organization: Organization | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  token: string | null
  refreshToken: string | null
}

// Auth action types
export const AUTH_ACTIONS = {
  LOGIN_START: 'auth/loginStart',
  LOGIN_SUCCESS: 'auth/loginSuccess',
  LOGIN_FAILURE: 'auth/loginFailure',
  REGISTER_START: 'auth/registerStart',
  REGISTER_SUCCESS: 'auth/registerSuccess',
  REGISTER_FAILURE: 'auth/registerFailure',
  LOGOUT: 'auth/logout',
  REFRESH_TOKEN_START: 'auth/refreshTokenStart',
  REFRESH_TOKEN_SUCCESS: 'auth/refreshTokenSuccess',
  REFRESH_TOKEN_FAILURE: 'auth/refreshTokenFailure',
  CLEAR_ERROR: 'auth/clearError',
  SET_USER: 'auth/setUser',
  UPDATE_USER: 'auth/updateUser'
} as const

export type AuthActionType = typeof AUTH_ACTIONS[keyof typeof AUTH_ACTIONS]

// Validation schemas (for runtime validation)
export const ValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email format'
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Password must be at least 6 characters'
  },
  firstName: {
    required: true,
    minLength: 1,
    message: 'First name is required'
  },
  lastName: {
    required: true,
    minLength: 1,
    message: 'Last name is required'
  },
  organizationName: {
    required: true,
    minLength: 1,
    message: 'Organization name is required'
  }
} as const

// Permission types
export type Permission = 
  | 'project:create'
  | 'project:read'
  | 'project:update'
  | 'project:delete'
  | 'user:invite'
  | 'user:remove'
  | 'user:update_role'
  | 'organization:update'
  | 'organization:delete'
  | 'billing:view'
  | 'billing:update'

export interface RolePermissions {
  owner: Permission[]
  admin: Permission[]
  user: Permission[]
}

// Default role permissions
export const DEFAULT_PERMISSIONS: RolePermissions = {
  owner: [
    'project:create', 'project:read', 'project:update', 'project:delete',
    'user:invite', 'user:remove', 'user:update_role',
    'organization:update', 'organization:delete',
    'billing:view', 'billing:update'
  ],
  admin: [
    'project:create', 'project:read', 'project:update', 'project:delete',
    'user:invite', 'user:remove', 'user:update_role'
  ],
  user: [
    'project:read', 'project:update'
  ]
}