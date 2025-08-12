import { supabase } from '../lib/supabase';
import type { Project, ProjectMember } from '../lib/supabase';

export interface CreateProjectData {
  name: string;
  description?: string;
  organization_id: string;
}

export interface ProjectMemberWithUser extends ProjectMember {
  users: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export class ProjectService {
  /**
   * Create a new project
   */
  async createProject(data: CreateProjectData): Promise<Project> {
    // Validate required fields
    if (!data.name || data.name.trim() === '') {
      throw new Error('Project name is required');
    }

    if (!data.organization_id) {
      throw new Error('Organization ID is required');
    }

    const projectData = {
      ...data,
      name: data.name.trim(),
      status: 'planning' as const,
      configuration: {}
    };

    const { data: project, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return project;
  }

  /**
   * Get project by ID
   */
  async getProjectById(id: string): Promise<Project | null> {
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to get project: ${error.message}`);
    }

    return project;
  }

  /**
   * Get all projects for an organization
   */
  async getProjectsByOrganization(organizationId: string): Promise<Project[]> {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get projects: ${error.message}`);
    }

    return projects || [];
  }

  /**
   * Update project status
   */
  async updateProjectStatus(
    id: string, 
    status: 'planning' | 'active' | 'paused' | 'completed' | 'archived'
  ): Promise<Project> {
    const { data: project, error } = await supabase
      .from('projects')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update project status: ${error.message}`);
    }

    return project;
  }

  /**
   * Update project configuration
   */
  async updateProjectConfiguration(id: string, configuration: Record<string, any>): Promise<Project> {
    const { data: project, error } = await supabase
      .from('projects')
      .update({ 
        configuration,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update project configuration: ${error.message}`);
    }

    return project;
  }

  /**
   * Add a member to a project
   */
  async addProjectMember(
    projectId: string, 
    userId: string, 
    role: string = 'member'
  ): Promise<ProjectMember> {
    const { data: member, error } = await supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: userId,
        role
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to add project member: ${error.message}`);
    }

    return member;
  }

  /**
   * Get all members of a project
   */
  async getProjectMembers(projectId: string): Promise<ProjectMemberWithUser[]> {
    const { data: members, error } = await supabase
      .from('project_members')
      .select('*, users(id, email, first_name, last_name)')
      .eq('project_id', projectId);

    if (error) {
      throw new Error(`Failed to get project members: ${error.message}`);
    }

    return members || [];
  }

  /**
   * Remove a member from a project
   */
  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to remove project member: ${error.message}`);
    }
  }

  /**
   * Update project member role
   */
  async updateProjectMemberRole(
    projectId: string, 
    userId: string, 
    role: string
  ): Promise<ProjectMember> {
    const { data: member, error } = await supabase
      .from('project_members')
      .update({ role })
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update project member role: ${error.message}`);
    }

    return member;
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  /**
   * Get projects for the current user
   */
  async getUserProjects(): Promise<Project[]> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Get projects where user is a member
    const { data: projectMembers, error } = await supabase
      .from('project_members')
      .select('project_id, projects(*)')
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to get user projects: ${error.message}`);
    }

    const projects = (projectMembers as any[] | null)?.flatMap(pm => {
      const p = (pm as any).projects;
      return p ? (Array.isArray(p) ? p : [p]) : [];
    }) ?? [];

    return projects as Project[];
  }

  /**
   * Check if user has access to project
   */
  async hasProjectAccess(projectId: string, userId?: string): Promise<boolean> {
    let currentUserId = userId;
    
    if (!currentUserId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return false;
      }
      currentUserId = user.id;
    }

    const { data: member, error } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('project_id', projectId)
      .eq('user_id', currentUserId)
      .single();

    return !error && !!member;
  }

  /**
   * Get project statistics
   */
  async getProjectStats(projectId: string): Promise<{
    totalMembers: number;
    activeWorkflows: number;
    completedTasks: number;
    pendingTasks: number;
  }> {
    // Get member count
    const { count: memberCount, error: memberError } = await supabase
      .from('project_members')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    if (memberError) {
      throw new Error(`Failed to get member count: ${memberError.message}`);
    }

    // Get workflow count
    const { count: workflowCount, error: workflowError } = await supabase
      .from('workflows')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .in('status', ['running', 'pending']);

    if (workflowError) {
      throw new Error(`Failed to get workflow count: ${workflowError.message}`);
    }

    // Get task counts
    const { count: completedTaskCount, error: completedError } = await supabase
      .from('tasks')
      .select('workflow_id, workflows!inner(project_id)', { count: 'exact', head: true })
      .eq('workflows.project_id', projectId)
      .eq('status', 'completed');

    const { count: pendingTaskCount, error: pendingError } = await supabase
      .from('tasks')
      .select('workflow_id, workflows!inner(project_id)', { count: 'exact', head: true })
      .eq('workflows.project_id', projectId)
      .in('status', ['pending', 'running']);

    if (completedError || pendingError) {
      throw new Error('Failed to get task counts');
    }

    return {
      totalMembers: memberCount || 0,
      activeWorkflows: workflowCount || 0,
      completedTasks: completedTaskCount || 0,
      pendingTasks: pendingTaskCount || 0
    };
  }
}