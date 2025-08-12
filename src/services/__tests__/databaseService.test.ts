import { DatabaseService } from '../databaseService';
import { supabase } from '../../lib/supabase';

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('DatabaseService', () => {
  let databaseService: DatabaseService;

  beforeEach(() => {
    jest.clearAllMocks();
    databaseService = new DatabaseService();
  });

  describe('Schema Validation', () => {
    it('should validate that all required tables exist', async () => {
      const mockTableData = [
        { table_name: 'organizations' },
        { table_name: 'users' },
        { table_name: 'projects' },
        { table_name: 'project_members' },
        { table_name: 'workflows' },
        { table_name: 'gates' },
        { table_name: 'ai_agents' },
        { table_name: 'tasks' },
        { table_name: 'approvals' },
        { table_name: 'documents' },
        { table_name: 'audit_logs' },
        { table_name: 'metrics' },
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: mockTableData,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });

      const result = await databaseService.validateSchema();
      expect(result.isValid).toBe(true);
      expect(result.missingTables).toEqual([]);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_table_names');
    });

    it('should identify missing tables', async () => {
      const mockTableData = [
        { table_name: 'organizations' },
        { table_name: 'users' },
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: mockTableData,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });

      const result = await databaseService.validateSchema();
      expect(result.isValid).toBe(false);
      expect(result.missingTables).toContain('projects');
      expect(result.missingTables).toContain('workflows');
    });

    it('should handle database errors during validation', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' } as any,
        count: null,
        status: 500,
        statusText: 'Internal Server Error'
      } as any);

      await expect(databaseService.validateSchema()).rejects.toThrow(
        'Failed to validate schema: Database connection failed'
      );
    });
  });

  describe('Organization Management', () => {
    it('should create a new organization', async () => {
      const mockOrgData = {
        id: 'org-123',
        name: 'Test Organization',
        slug: 'test-org',
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockOrgData,
              error: null,
            }),
          }),
        }),
      } as any);

      const result = await databaseService.createOrganization({
        name: 'Test Organization',
        slug: 'test-org',
      });

      expect(result).toEqual(mockOrgData);
      expect(mockSupabase.from).toHaveBeenCalledWith('organizations');
    });

    it('should handle duplicate organization slug', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: '23505', message: 'duplicate key value' },
            }),
          }),
        }),
      } as any);

      await expect(
        databaseService.createOrganization({
          name: 'Test Organization',
          slug: 'existing-slug',
        })
      ).rejects.toThrow('Organization slug already exists');
    });
  });

  describe('Project Management', () => {
    it('should create a new project', async () => {
      const mockProjectData = {
        id: 'project-123',
        organization_id: 'org-123',
        name: 'Test Project',
        description: 'A test project',
        status: 'planning',
        configuration: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProjectData,
              error: null,
            }),
          }),
        }),
      } as any);

      const result = await databaseService.createProject({
        organization_id: 'org-123',
        name: 'Test Project',
        description: 'A test project',
      });

      expect(result).toEqual(mockProjectData);
      expect(mockSupabase.from).toHaveBeenCalledWith('projects');
    });

    it('should get project by id', async () => {
      const mockProjectData = {
        id: 'project-123',
        name: 'Test Project',
        status: 'active',
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProjectData,
              error: null,
            }),
          }),
        }),
      } as any);

      const result = await databaseService.getProject('project-123');
      expect(result).toEqual(mockProjectData);
    });

    it('should handle project not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'No rows found' },
            }),
          }),
        }),
      } as any);

      await expect(databaseService.getProject('nonexistent')).rejects.toThrow(
        'Project not found'
      );
    });
  });

  describe('Workflow Management', () => {
    it('should create a new workflow', async () => {
      const mockWorkflowData = {
        id: 'workflow-123',
        project_id: 'project-123',
        type: 'plan_pack',
        status: 'pending',
        definition: { gates: ['G1', 'G2', 'G3'] },
        state: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockWorkflowData,
              error: null,
            }),
          }),
        }),
      } as any);

      const result = await databaseService.createWorkflow({
        project_id: 'project-123',
        type: 'plan_pack',
        definition: { gates: ['G1', 'G2', 'G3'] },
      });

      expect(result).toEqual(mockWorkflowData);
      expect(mockSupabase.from).toHaveBeenCalledWith('workflows');
    });
  });
});