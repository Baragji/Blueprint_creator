/**
 * Validation utilities for authentication
 */
import { PasswordValidationRules, ValidationError, ValidationResult, RegisterRequest, LoginRequest } from '../types/auth.js';

export const defaultPasswordRules: PasswordValidationRules = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  forbiddenPatterns: ['password', '123456', 'qwerty']
};

export function validateEmail(email: string): ValidationResult {
  const errors: ValidationError[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push({ field: 'email', message: 'Invalid email format', code: 'invalid_email' });
  }
  return { isValid: errors.length === 0, errors };
}

export function validatePassword(password: string, rules: PasswordValidationRules = defaultPasswordRules): ValidationResult {
  const errors: ValidationError[] = [];
  if (!password || password.length < rules.minLength) {
    errors.push({ field: 'password', message: `Password must be at least ${rules.minLength} characters`, code: 'weak_password_length' });
  }
  if (rules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push({ field: 'password', message: 'Password must include at least one uppercase letter', code: 'weak_password_upper' });
  }
  if (rules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push({ field: 'password', message: 'Password must include at least one lowercase letter', code: 'weak_password_lower' });
  }
  if (rules.requireNumbers && !/[0-9]/.test(password)) {
    errors.push({ field: 'password', message: 'Password must include at least one number', code: 'weak_password_number' });
  }
  if (rules.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>\[\];'`~\-_=+\/\\]/.test(password)) {
    errors.push({ field: 'password', message: 'Password must include at least one special character', code: 'weak_password_special' });
  }
  if (rules.forbiddenPatterns.some((p) => password.toLowerCase().includes(p))) {
    errors.push({ field: 'password', message: 'Password contains forbidden patterns', code: 'weak_password_pattern' });
  }
  return { isValid: errors.length === 0, errors };
}

export function validateRegisterRequest(body: any): { valid: boolean; errors: ValidationError[]; sanitized?: RegisterRequest } {
  const errors: ValidationError[] = [];

  const emailResult = validateEmail(body?.email);
  if (!emailResult.isValid) errors.push(...emailResult.errors);

  const passwordResult = validatePassword(body?.password);
  if (!passwordResult.isValid) errors.push(...passwordResult.errors);

  if (!body?.firstName || typeof body?.firstName !== 'string') {
    errors.push({ field: 'firstName', message: 'First name is required', code: 'required' });
  }
  if (!body?.lastName || typeof body?.lastName !== 'string') {
    errors.push({ field: 'lastName', message: 'Last name is required', code: 'required' });
  }
  if (body?.organizationName && typeof body.organizationName !== 'string') {
    errors.push({ field: 'organizationName', message: 'Organization name must be a string', code: 'invalid' });
  }

  const valid = errors.length === 0;
  const sanitized: RegisterRequest | undefined = valid
    ? {
        email: String(body.email).trim().toLowerCase(),
        password: String(body.password),
        firstName: String(body.firstName).trim(),
        lastName: String(body.lastName).trim(),
        organizationName: body.organizationName ? String(body.organizationName).trim() : undefined
      }
    : undefined;

  return { valid, errors, sanitized };
}

export function validateLoginRequest(body: any): { valid: boolean; errors: ValidationError[]; sanitized?: LoginRequest } {
  const errors: ValidationError[] = [];

  const emailResult = validateEmail(body?.email);
  if (!emailResult.isValid) errors.push(...emailResult.errors);

  if (!body?.password || typeof body.password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required', code: 'required' });
  }

  const valid = errors.length === 0;
  const sanitized: LoginRequest | undefined = valid
    ? {
        email: String(body.email).trim().toLowerCase(),
        password: String(body.password)
      }
    : undefined;

  return { valid, errors, sanitized };
}