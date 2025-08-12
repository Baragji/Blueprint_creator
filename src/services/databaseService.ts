import { supabase } from '../lib/supabase';
import type {
  Organization,
  User,
  Project,
  Workflow,
  AIAgent,
  Database
} from '../lib/supabase';

export interface SchemaValidationResult {
  isValid: boolean;
  missingTables: string[];
  errors?: string[];
}

export interface CreateOrganizationData {
  name: string;
  slug: string;
  settings?: Record<string, any>;
}

export interface CreateProjectData {
  organization_id: string;
  name: string;
  description?: string;
  status?: 'planning' | 'active' | 'paused' | 'completed' | 'archived';
  configuration?: Record<string, any>;
}

export interface CreateWorkflowData {
  project_id: string;
  type: 'plan_pack' | 'g_gate' | 'custom';
  definition: Record<string, any>;
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  state?: Record<string, any>;
}

export class DatabaseService {
  private readonly requiredTables = [
    'organizations',
    'users',
    'projects',
    'project_members',
    'workflows',
    'gates',
    'ai_agents',
    'tasks',
    'approvals',
    'documents',
    'audit_logs',
    'metrics'
  ];

  /**
   * Validates that all required database tables exist
   */
  async validateSchema(): Promise<SchemaValidationResult> {
    try {
      const { data, error } = await supabase.rpc('get_table_names');
      
      if (error) {
        throw new Error(`Failed to validate schema: ${error.message}`);
      }

      if (!data) {
        throw new Error('Failed to validate schema: No data returned');
      }

      const existingTables = data.map((row: { table_name: string }) => row.table_name);
      const missingTables = this.requiredTables.filter(
        table => !existingTables.includes(table)
      );

      return {
        isValid: missingTables.length === 0,
        missingTables
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error during schema validation');
    }
  }

  /**
   * Creates a new organization
   */
  async createOrganization(data: CreateOrganizationData): Promise<Organization> {
    try {
      const { data: organization, error } = await supabase
        .from('organizations')
        .insert({
          name: data.name,
          slug: data.slug,
          settings: data.settings || {}
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Organization slug already exists');
        }
        throw new Error(`Failed to create organization: ${error.message}`);
      }

      if (!organization) {
        throw new Error('Failed to create organization: No data returned');
      }

      return organization;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error during organization creation');
    }
  }

  /**
   * Creates a new project
   */
  async createProject(data: CreateProjectData): Promise<Project> {
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          organization_id: data.organization_id,
          name: data.name,
          description: data.description,
          status: data.status || 'planning',
          configuration: data.configuration || {}
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create project: ${error.message}`);
      }

      if (!project) {
        throw new Error('Failed to create project: No data returned');
      }

      return project;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error during project creation');
    }
  }

  /**
   * Gets a project by ID
   */
  async getProject(id: string): Promise<Project> {
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Project not found');
        }
        throw new Error(`Failed to get project: ${error.message}`);
      }

      if (!project) {
        throw new Error('Project not found');
      }

      return project;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error during project retrieval');
    }
  }

  /**
   * Gets all projects for an organization
   */
  async getProjectsByOrganization(organizationId: string): Promise<Project[]> {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get projects: ${error.message}`);
      }

      return projects || [];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error during projects retrieval');
    }
  }

  /**
   * Creates a new workflow
   */
  async createWorkflow(data: CreateWorkflowData): Promise<Workflow> {
    try {
      const { data: workflow, error } = await supabase
        .from('workflows')
        .insert({
          project_id: data.project_id,
          type: data.type,
          definition: data.definition,
          status: data.status || 'pending',
          state: data.state || {}
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create workflow: ${error.message}`);
      }

      if (!workflow) {
        throw new Error('Failed to create workflow: No data returned');
      }

      return workflow;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error during workflow creation');
    }
  }

  /**
   * Gets workflows for a project
   */
  async getWorkflowsByProject(projectId: string): Promise<Workflow[]> {
    try {
      const { data: workflows, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get workflows: ${error.message}`);
      }

      return workflows || [];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error during workflows retrieval');
    }
  }

  /**
   * Updates a workflow status
   */
  async updateWorkflowStatus(
    id: string, 
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled',
    state?: Record<string, any>
  ): Promise<Workflow> {
    try {
      const updateData: any = { status };
      if (state) {
        updateData.state = state;
      }

      const { data: workflow, error } = await supabase
        .from('workflows')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update workflow: ${error.message}`);
      }

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      return workflow;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error during workflow update');
    }
  }

  /**
   * Creates or updates AI agents for a project
   */
  async upsertAIAgent(data: {
    project_id: string;
    agent_type: 'planner' | 'implementer' | 'security' | 'test' | 'sre' | 'finops' | 'governance' | 'docs';
    status?: 'active' | 'inactive' | 'error' | 'maintenance';
    configuration?: Record<string, any>;
    performance_metrics?: Record<string, any>;
  }): Promise<AIAgent> {
    try {
      const { data: agent, error } = await supabase
        .from('ai_agents')
        .upsert({
          project_id: data.project_id,
          agent_type: data.agent_type,
          status: data.status || 'inactive',
          configuration: data.configuration || {},
          performance_metrics: data.performance_metrics || {}
        }, {
          onConflict: 'project_id,agent_type'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to upsert AI agent: ${error.message}`);
      }

      if (!agent) {
        throw new Error('Failed to upsert AI agent: No data returned');
      }

      return agent;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error during AI agent upsert');
    }
  }

  /**
   * Gets AI agents for a project
   */
  async getAIAgentsByProject(projectId: string): Promise<AIAgent[]> {
    try {
      const { data: agents, error } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('project_id', projectId)
        .order('agent_type');

      if (error) {
        throw new Error(`Failed to get AI agents: ${error.message}`);
      }

      return agents || [];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error during AI agents retrieval');
    }
  }
}