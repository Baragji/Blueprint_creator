/**
 * Production Authentication Service with Supabase, Redis sessions, and bcrypt password hashing
 */
import bcrypt from 'bcryptjs';
import {
  User,
  Organization,
  RegisterRequest,
  LoginRequest,
  UserProfile,
  OrganizationProfile,
  AuthConfig,
  UserRole,
  OrganizationPlan,
  OrganizationSettings,
  DEFAULT_PERMISSIONS,
  SessionData,
  TokenPair,
} from '../types/auth.js';
import { AuthEnv, generateTokenPair, signRefreshToken } from '../utils/jwt.js';
import { supabaseService } from './supabaseService.js';
import { sessionService } from './sessionService.js';

function createDefaultOrgSettings(): OrganizationSettings {
  return {
    maxProjects: 10,
    maxUsers: 5,
    aiAgentQuota: 100,
    allowedDomains: [],
    requireEmailVerification: false,
    enableSSO: false,
    auditRetentionDays: 90
  };
}

export class AuthService {
  private get config(): AuthConfig {
    return AuthEnv.getConfig();
  }

  private createUserProfile(user: User, organization: Organization): UserProfile {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organizationId: user.organizationId,
      emailVerified: user.emailVerified,
      permissions: DEFAULT_PERMISSIONS[user.role] || []
    };
  }

  private createOrganizationProfile(org: Organization): OrganizationProfile {
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      settings: org.settings
    };
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.config.bcryptSaltRounds);
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private async createSession(user: UserProfile, refreshTokenId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const sessionData: SessionData = {
      userId: user.id,
      organizationId: user.organizationId,
      email: user.email,
      role: user.role,
      refreshTokenId,
      createdAt: new Date(),
      lastAccessAt: new Date(),
      expiresAt: new Date(Date.now() + this.config.refreshTokenExpiryDays * 24 * 60 * 60 * 1000),
      ipAddress,
      userAgent
    };

    await sessionService.storeSession(user.id, sessionData, this.config.refreshTokenExpiryDays * 24 * 60 * 60);
  }

  async register(request: RegisterRequest, ipAddress?: string, userAgent?: string): Promise<{
    user: UserProfile;
    organization: OrganizationProfile;
    tokens: TokenPair;
  }> {
    const { email, password, firstName, lastName, organizationName } = request;

    // Check if user already exists
    const existingUser = await supabaseService.getUserByEmail(email);
    if (existingUser) {
      throw new Error(`User with email ${email} already exists`);
    }

    // Create organization first
    const orgSlug = (organizationName || `${firstName}-${lastName}`)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Ensure slug is unique
    const isSlugAvailable = await supabaseService.isSlugAvailable(orgSlug);
    const finalSlug = isSlugAvailable ? orgSlug : `${orgSlug}-${Date.now()}`;

    const organization = await supabaseService.createOrganization({
      name: organizationName || `${firstName} ${lastName}'s Organization`,
      slug: finalSlug,
      plan: OrganizationPlan.FREE,
      settings: createDefaultOrgSettings()
    });

    // Create user with hashed password
    const hashedPassword = await this.hashPassword(password);
    const { user } = await supabaseService.createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      organizationId: organization.id,
      role: UserRole.ORG_ADMIN // First user in org is admin
    });

    // Create profiles
    const userProfile = this.createUserProfile(user, organization);
    const orgProfile = this.createOrganizationProfile(organization);

    // Generate tokens
    const tokens = generateTokenPair(userProfile);
    const { tokenId } = signRefreshToken(userProfile);

    // Store refresh token and session
    await sessionService.storeRefreshToken(
      tokenId,
      { sub: user.id, organizationId: user.organizationId, tokenId, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + this.config.refreshTokenExpiryDays * 24 * 60 * 60, iss: this.config.jwtIssuer, aud: this.config.jwtAudience },
      this.config.refreshTokenExpiryDays * 24 * 60 * 60
    );
    
    await this.createSession(userProfile, tokenId, ipAddress, userAgent);

    return {
      user: userProfile,
      organization: orgProfile,
      tokens
    };
  }

  async login(request: LoginRequest, ipAddress?: string, userAgent?: string): Promise<{
    user: UserProfile;
    organization: OrganizationProfile;
    tokens: TokenPair;
  }> {
    const { email, password } = request;

    try {
      // Authenticate with Supabase
      const { user, supabaseUser } = await supabaseService.authenticateUser(email, password);

      // Get organization
      const organization = await supabaseService.getOrganizationById(user.organizationId);
      if (!organization || !organization.isActive) {
        throw new Error('Organization not found or inactive');
      }

      // Create profiles
      const userProfile = this.createUserProfile(user, organization);
      const orgProfile = this.createOrganizationProfile(organization);

      // Generate tokens
      const tokens = generateTokenPair(userProfile);
      const { tokenId } = signRefreshToken(userProfile);

      // Store refresh token and session
      await sessionService.storeRefreshToken(
        tokenId,
        { sub: user.id, organizationId: user.organizationId, tokenId, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + this.config.refreshTokenExpiryDays * 24 * 60 * 60, iss: this.config.jwtIssuer, aud: this.config.jwtAudience },
        this.config.refreshTokenExpiryDays * 24 * 60 * 60
      );
      
      await this.createSession(userProfile, tokenId, ipAddress, userAgent);

      return {
        user: userProfile,
        organization: orgProfile,
        tokens
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid email or password');
    }
  }

  async findUserById(userId: string): Promise<User | null> {
    return await supabaseService.getUserById(userId);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await supabaseService.getUserByEmail(email);
  }

  async findOrganizationById(orgId: string): Promise<Organization | null> {
    return await supabaseService.getOrganizationById(orgId);
  }

  async logout(userId: string, refreshTokenId?: string, accessTokenJti?: string): Promise<void> {
    try {
      // Invalidate refresh token if provided
      if (refreshTokenId) {
        await sessionService.invalidateRefreshToken(refreshTokenId);
      }

      // Blacklist access token if provided
      if (accessTokenJti) {
        const expiryTimestamp = Math.floor(Date.now() / 1000) + this.config.accessTokenExpiryMinutes * 60;
        await sessionService.blacklistToken(accessTokenJti, expiryTimestamp);
      }

      // Clear user session
      await sessionService.clearUserSessions(userId);

      // Sign out from Supabase
      await supabaseService.signOutUser(userId);
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw - logout should always succeed from client perspective
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const payload = await sessionService.validateRefreshToken(refreshToken);
      if (!payload) {
        throw new Error('Invalid refresh token');
      }

      // Check if user sessions were cleared
      const sessionCleared = await sessionService.wereSessionsCleared(payload.sub, payload.iat);
      if (sessionCleared) {
        throw new Error('Session invalidated');
      }

      // Get user and organization
      const user = await this.findUserById(payload.sub);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      const organization = await this.findOrganizationById(user.organizationId);
      if (!organization || !organization.isActive) {
        throw new Error('Organization not found or inactive');
      }

      // Create user profile
      const userProfile = this.createUserProfile(user, organization);

      // Generate new token pair
      const tokens = generateTokenPair(userProfile);
      const { tokenId: newTokenId } = signRefreshToken(userProfile);

      // Invalidate old refresh token and store new one
      await sessionService.invalidateRefreshToken(payload.tokenId);
      await sessionService.storeRefreshToken(
        newTokenId,
        { sub: user.id, organizationId: user.organizationId, tokenId: newTokenId, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + this.config.refreshTokenExpiryDays * 24 * 60 * 60, iss: this.config.jwtIssuer, aud: this.config.jwtAudience },
        this.config.refreshTokenExpiryDays * 24 * 60 * 60
      );

      // Update session
      await this.createSession(userProfile, newTokenId);

      return tokens;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error('Token refresh failed');
    }
  }
}

export const authService = new AuthService();