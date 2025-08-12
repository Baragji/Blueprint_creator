import { ProjectService } from '../projectService';
import { supabase } from '../../lib/supabase';
import type { Project, Organization, User } from '../../lib/supabase';

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn()
    }
  }
}));

const mockSupabase = supabase as any;

describe('ProjectService', () => {
  let projectService: ProjectService;
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com'
  };
  
  const mockOrganization: Organization = {
    id: 'org-123',
    name: 'Test Organization',
    slug: 'test-org',
    settings: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const mockProject: Project = {
    id: 'project-123',
    organization_id: 'org-123',
    name: 'Test Project',
    description: 'A test project',
    status: 'planning',
    configuration: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    projectService = new ProjectService();
    
    // Mock auth user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });
  });

  describe('Project Creation', () => {
    it('should create a new project successfully', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProject,
            error: null
          })
        })
      });
      
      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      });

      const projectData = {
        name: 'Test Project',
        description: 'A test project',
        organization_id: 'org-123'
      };

      const result = await projectService.createProject(projectData);

      expect(result).toEqual(mockProject);
      expect(mockSupabase.from).toHaveBeenCalledWith('projects');
      expect(mockInsert).toHaveBeenCalledWith({
        ...projectData,
        status: 'planning',
        configuration: {}
      });
    });

    it('should handle project creation errors', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
          })
        })
      });
      
      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      });

      const projectData = {
        name: 'Test Project',
        description: 'A test project',
        organization_id: 'org-123'
      };

      await expect(projectService.createProject(projectData))
        .rejects.toThrow('Failed to create project: Database error');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: '',
        organization_id: 'org-123'
      };

      await expect(projectService.createProject(invalidData as any))
        .rejects.toThrow('Project name is required');
    });
  });

  describe('Project Retrieval', () => {
    it('should get project by id', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProject,
            error: null
          })
        })
      });
      
      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await projectService.getProjectById('project-123');

      expect(result).toEqual(mockProject);
      expect(mockSupabase.from).toHaveBeenCalledWith('projects');
      expect(mockSelect).toHaveBeenCalledWith('*');
    });

    it('should handle project not found', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }
          })
        })
      });
      
      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await projectService.getProjectById('nonexistent');
      expect(result).toBeNull();
    });

    it('should get projects by organization', async () => {
      const mockProjects = [mockProject, { ...mockProject, id: 'project-456', name: 'Another Project' }];
      
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockProjects,
            error: null
          })
        })
      });
      
      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await projectService.getProjectsByOrganization('org-123');

      expect(result).toEqual(mockProjects);
      expect(mockSupabase.from).toHaveBeenCalledWith('projects');
    });
  });

  describe('Project Updates', () => {
    it('should update project status', async () => {
      const updatedProject = { ...mockProject, status: 'active' as const };
      
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: updatedProject,
              error: null
            })
          })
        })
      });
      
      mockSupabase.from.mockReturnValue({
        update: mockUpdate
      });

      const result = await projectService.updateProjectStatus('project-123', 'active');

      expect(result).toEqual(updatedProject);
      expect(mockUpdate).toHaveBeenCalledWith({ 
        status: 'active',
        updated_at: expect.any(String)
      });
    });

    it('should update project configuration', async () => {
      const newConfig = { theme: 'dark', notifications: true };
      const updatedProject = { ...mockProject, configuration: newConfig };
      
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: updatedProject,
              error: null
            })
          })
        })
      });
      
      mockSupabase.from.mockReturnValue({
        update: mockUpdate
      });

      const result = await projectService.updateProjectConfiguration('project-123', newConfig);

      expect(result).toEqual(updatedProject);
      expect(mockUpdate).toHaveBeenCalledWith({ 
        configuration: newConfig,
        updated_at: expect.any(String)
      });
    });
  });

  describe('Project Members', () => {
    it('should add member to project', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              project_id: 'project-123',
              user_id: 'user-456',
              role: 'member',
              joined_at: new Date().toISOString()
            },
            error: null
          })
        })
      });
      
      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      });

      const result = await projectService.addProjectMember('project-123', 'user-456', 'member');

      expect(result).toBeDefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('project_members');
      expect(mockInsert).toHaveBeenCalledWith({
        project_id: 'project-123',
        user_id: 'user-456',
        role: 'member'
      });
    });

    it('should get project members', async () => {
      const mockMembers = [
        {
          project_id: 'project-123',
          user_id: 'user-456',
          role: 'member',
          joined_at: new Date().toISOString(),
          users: {
            id: 'user-456',
            email: 'member@example.com',
            first_name: 'John',
            last_name: 'Doe'
          }
        }
      ];
      
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: mockMembers,
          error: null
        })
      });
      
      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await projectService.getProjectMembers('project-123');

      expect(result).toEqual(mockMembers);
      expect(mockSelect).toHaveBeenCalledWith('*, users(id, email, first_name, last_name)');
    });
  });

  describe('Project Deletion', () => {
    it('should delete project', async () => {
      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      });
      
      mockSupabase.from.mockReturnValue({
        delete: mockDelete
      });

      await projectService.deleteProject('project-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('projects');
      expect(mockDelete).toHaveBeenCalled();
    });

    it('should handle deletion errors', async () => {
      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Cannot delete project with active workflows' }
        })
      });
      
      mockSupabase.from.mockReturnValue({
        delete: mockDelete
      });

      await expect(projectService.deleteProject('project-123'))
        .rejects.toThrow('Failed to delete project: Cannot delete project with active workflows');
    });
  });
});