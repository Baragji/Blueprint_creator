/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables for frontend Supabase client');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database types based on our schema
export interface Organization {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  organization_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'archived';
  configuration: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  project_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export interface Workflow {
  id: string;
  project_id: string;
  type: 'plan_pack' | 'g_gate' | 'custom';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  definition: Record<string, any>;
  state: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Gate {
  id: string;
  workflow_id: string;
  gate_code: string;
  status: string;
  requirements: Record<string, any>;
  artifacts: Record<string, any>;
  created_at: string;
  completed_at?: string;
}

export interface AIAgent {
  id: string;
  project_id: string;
  agent_type: 'planner' | 'implementer' | 'security' | 'test' | 'sre' | 'finops' | 'governance' | 'docs';
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  configuration: Record<string, any>;
  performance_metrics: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  workflow_id: string;
  agent_id: string;
  task_type: string;
  status: string;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  created_at: string;
  completed_at?: string;
}

export interface Approval {
  id: string;
  gate_id: string;
  user_id: string;
  approved: boolean;
  feedback?: string;
  created_at: string;
}

export interface Document {
  id: string;
  project_id: string;
  document_type: string;
  title: string;
  content: string;
  file_path?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  project_id?: string;
  user_id?: string;
  action: string;
  details: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface Metric {
  id: string;
  project_id: string;
  metric_type: string;
  value: number;
  metadata: Record<string, any>;
  recorded_at: string;
}

// Database schema type
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Omit<Organization, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Organization, 'id' | 'created_at'>>;
      };
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'id' | 'created_at'>>;
      };
      project_members: {
        Row: ProjectMember;
        Insert: Omit<ProjectMember, 'joined_at'>;
        Update: Partial<ProjectMember>;
      };
      workflows: {
        Row: Workflow;
        Insert: Omit<Workflow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Workflow, 'id' | 'created_at'>>;
      };
      gates: {
        Row: Gate;
        Insert: Omit<Gate, 'id' | 'created_at'>;
        Update: Partial<Omit<Gate, 'id' | 'created_at'>>;
      };
      ai_agents: {
        Row: AIAgent;
        Insert: Omit<AIAgent, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AIAgent, 'id' | 'created_at'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at'>;
        Update: Partial<Omit<Task, 'id' | 'created_at'>>;
      };
      approvals: {
        Row: Approval;
        Insert: Omit<Approval, 'id' | 'created_at'>;
        Update: Partial<Omit<Approval, 'id' | 'created_at'>>;
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Document, 'id' | 'created_at'>>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'created_at'>;
        Update: Partial<Omit<AuditLog, 'id' | 'created_at'>>;
      };
      metrics: {
        Row: Metric;
        Insert: Omit<Metric, 'id'>;
        Update: Partial<Omit<Metric, 'id'>>;
      };
    };
    Functions: {
      get_table_names: {
        Args: Record<PropertyKey, never>;
        Returns: { table_name: string }[];
      };
    };
  };
}