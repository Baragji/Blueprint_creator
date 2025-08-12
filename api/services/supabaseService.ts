/**
 * Supabase Service for Backend Authentication
 * Handles database operations and Supabase auth integration
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthEnv } from '../utils/jwt.js';
import {
  User,
  Organization,
  UserRole,
  OrganizationPlan,
  OrganizationSettings
} from '../types/auth.js';

export class SupabaseService {
  private client!: SupabaseClient;
  private serviceClient!: SupabaseClient;
  private configured = false;

  constructor() {
    const config = AuthEnv.getConfig();
    
    if (!config.supabaseUrl || !config.supabaseAnonKey || !config.supabaseServiceRoleKey) {
      // Don't throw during app boot; allow running without Supabase for local/dev.
      console.warn('Supabase not fully configured. Set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in .env to enable auth DB integration.');
      this.configured = false;
      return;
    }

    // Regular client for general operations
    this.client = createClient(config.supabaseUrl, config.supabaseAnonKey);
    
    // Service role client for admin operations
    this.serviceClient = createClient(
      config.supabaseUrl,
      config.supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    this.configured = true;
  }

  private ensureConfigured(): void {
    if (!this.configured) {
      throw new Error('Supabase is not configured. Please set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in your environment.');
    }
  }

  /**
   * Create a new user in Supabase Auth and database
   */
  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationId: string;
    role: UserRole;
  }): Promise<{ user: User; supabaseUser: any }> {
    this.ensureConfigured();
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await this.serviceClient.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Auto-confirm for now
        user_metadata: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          organization_id: userData.organizationId,
          role: userData.role
        }
      });

      if (authError) {
        throw new Error(`Supabase Auth error: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Failed to create user in Supabase Auth');
      }

      // Map roles to database enum values
      const dbRole = this.mapRoleToDbEnum(userData.role);

      // Create user record in database
      const { data: dbUser, error: dbError } = await this.serviceClient
        .from('users')
        .insert({
          id: authData.user.id, // Use Supabase Auth UUID
          organization_id: userData.organizationId,
          email: userData.email.toLowerCase(),
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: dbRole
        })
        .select()
        .single();

      if (dbError) {
        // Cleanup: delete auth user if database insert fails
        await this.serviceClient.auth.admin.deleteUser(authData.user.id);
        throw new Error(`Database error: ${dbError.message}`);
      }

      const user: User = {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name,
        organizationId: dbUser.organization_id,
        role: this.mapDbEnumToRole(dbUser.role),
        emailVerified: true, // Auto-verified for now
        isActive: true,
        createdAt: new Date(dbUser.created_at),
        updatedAt: new Date(dbUser.updated_at)
      };

      return { user, supabaseUser: authData.user };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Authenticate user with email and password
   */
  async authenticateUser(email: string, password: string): Promise<{ user: User; supabaseUser: any }> {
    this.ensureConfigured();
    try {
      // Authenticate with Supabase Auth
      const { data: authData, error: authError } = await this.serviceClient.auth.signInWithPassword({
        email: email.toLowerCase(),
        password
      });

      if (authError || !authData.user) {
        throw new Error('Invalid email or password');
      }

      // Get user from database
      const { data: dbUser, error: dbError } = await this.serviceClient
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (dbError || !dbUser) {
        throw new Error('User not found in database');
      }

      // Update last login
      await this.serviceClient
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', authData.user.id);

      const user: User = {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name,
        organizationId: dbUser.organization_id,
        role: this.mapDbEnumToRole(dbUser.role),
        emailVerified: true,
        isActive: true,
        lastLoginAt: new Date(),
        createdAt: new Date(dbUser.created_at),
        updatedAt: new Date(dbUser.updated_at)
      };

      return { user, supabaseUser: authData.user };
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  /**
   * Create a new organization
   */
  async createOrganization(orgData: {
    name: string;
    slug: string;
    plan?: OrganizationPlan;
    settings?: Partial<OrganizationSettings>;
  }): Promise<Organization> {
    this.ensureConfigured();
    try {
      const defaultSettings: OrganizationSettings = {
        maxProjects: 10,
        maxUsers: 5,
        aiAgentQuota: 100,
        allowedDomains: [],
        requireEmailVerification: false,
        enableSSO: false,
        auditRetentionDays: 90
      };

      const { data: org, error } = await this.serviceClient
        .from('organizations')
        .insert({
          name: orgData.name,
          slug: orgData.slug,
          settings: { ...defaultSettings, ...orgData.settings }
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        plan: orgData.plan || OrganizationPlan.FREE,
        isActive: true,
        settings: org.settings,
        createdAt: new Date(org.created_at),
        updatedAt: new Date(org.updated_at)
      };
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    this.ensureConfigured();
    try {
      const { data: dbUser, error } = await this.serviceClient
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !dbUser) {
        return null;
      }

      return {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name,
        organizationId: dbUser.organization_id,
        role: this.mapDbEnumToRole(dbUser.role),
        emailVerified: true,
        isActive: true,
        createdAt: new Date(dbUser.created_at),
        updatedAt: new Date(dbUser.updated_at)
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    this.ensureConfigured();
    try {
      const { data: dbUser, error } = await this.serviceClient
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error || !dbUser) {
        return null;
      }

      return {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name,
        organizationId: dbUser.organization_id,
        role: this.mapDbEnumToRole(dbUser.role),
        emailVerified: true,
        isActive: true,
        createdAt: new Date(dbUser.created_at),
        updatedAt: new Date(dbUser.updated_at)
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  /**
   * Get organization by ID
   */
  async getOrganizationById(orgId: string): Promise<Organization | null> {
    this.ensureConfigured();
    try {
      const { data: org, error } = await this.serviceClient
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();

      if (error || !org) {
        return null;
      }

      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        plan: OrganizationPlan.FREE, // Default to FREE if not specified
        isActive: true,
        settings: org.settings,
        createdAt: new Date(org.created_at),
        updatedAt: new Date(org.updated_at)
      };
    } catch (error) {
      console.error('Error getting organization by ID:', error);
      return null;
    }
  }

  /**
   * Check if organization slug is available
   */
  async isSlugAvailable(slug: string): Promise<boolean> {
    this.ensureConfigured();
    try {
      const { data, error } = await this.serviceClient
        .from('organizations')
        .select('id')
        .eq('slug', slug)
        .single();

      // If no error and no data, slug is available
      return error?.code === 'PGRST116' || !data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sign out user from Supabase Auth
   */
  async signOutUser(userId: string): Promise<void> {
    this.ensureConfigured();
    try {
      await this.serviceClient.auth.admin.signOut(userId);
    } catch (error) {
      console.error('Error signing out user:', error);
      // Don't throw - logout should succeed even if Supabase signout fails
    }
  }

  /**
   * Map UserRole enum to database enum values
   */
  private mapRoleToDbEnum(role: UserRole): string {
    const roleMap: Record<UserRole, string> = {
      [UserRole.SUPER_ADMIN]: 'owner', // Map to highest DB role
      [UserRole.ORG_ADMIN]: 'admin',
      [UserRole.PROJECT_MANAGER]: 'member',
      [UserRole.DEVELOPER]: 'member',
      [UserRole.VIEWER]: 'viewer'
    };
    return roleMap[role] || 'member';
  }

  /**
   * Map database enum values to UserRole enum
   */
  private mapDbEnumToRole(dbRole: string): UserRole {
    const roleMap: Record<string, UserRole> = {
      'owner': UserRole.ORG_ADMIN, // Owner maps to ORG_ADMIN in our system
      'admin': UserRole.ORG_ADMIN,
      'member': UserRole.PROJECT_MANAGER,
      'viewer': UserRole.VIEWER
    };
    return roleMap[dbRole] || UserRole.VIEWER;
  }
}

export const supabaseService = new SupabaseService();