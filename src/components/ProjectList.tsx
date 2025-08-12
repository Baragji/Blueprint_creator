import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Users, 
  Calendar, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Archive,
  CheckCircle
} from 'lucide-react';
import { ProjectService } from '../services/projectService';
import type { Project } from '../lib/supabase';

interface ProjectListProps {
  organizationId: string;
  onProjectSelect?: (project: Project) => void;
  refreshTrigger?: number;
}

interface ProjectStats {
  totalMembers: number;
  activeWorkflows: number;
  completedTasks: number;
  pendingTasks: number;
}

interface ProjectWithStats extends Project {
  stats?: ProjectStats;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  organizationId,
  onProjectSelect,
  refreshTrigger
}) => {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const projectService = new ProjectService();

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const projectsData = await projectService.getProjectsByOrganization(organizationId);
      
      // Load stats for each project
      const projectsWithStats = await Promise.all(
        projectsData.map(async (project) => {
          try {
            const stats = await projectService.getProjectStats(project.id);
            return { ...project, stats };
          } catch (err) {
            console.warn(`Failed to load stats for project ${project.id}:`, err);
            return project;
          }
        })
      );
      
      setProjects(projectsWithStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [organizationId, refreshTrigger]);

  const handleStatusChange = async (projectId: string, newStatus: Project['status']) => {
    try {
      await projectService.updateProjectStatus(projectId, newStatus);
      await loadProjects(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project status');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await projectService.deleteProject(projectId);
      await loadProjects(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return <Play className="h-3 w-3" />;
      case 'planning':
        return <Edit className="h-3 w-3" />;
      case 'paused':
        return <Pause className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'archived':
        return <Archive className="h-3 w-3" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={loadProjects}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500">Create your first project to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
        <p className="text-sm text-gray-600 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="divide-y divide-gray-200">
        {projects.map((project) => (
          <div
            key={project.id}
            className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onProjectSelect?.(project)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {getStatusIcon(project.status)}
                    {project.status}
                  </span>
                </div>
                
                {project.description && (
                  <p className="text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                )}

                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{project.stats?.totalMembers || 0} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                  {project.stats && (
                    <>
                      <div className="text-blue-600">
                        {project.stats.activeWorkflows} active workflows
                      </div>
                      <div className="text-green-600">
                        {project.stats.completedTasks} completed tasks
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProject(selectedProject === project.id ? null : project.id);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {selectedProject === project.id && (
                  <div className="absolute right-0 top-10 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(project.id, project.status === 'active' ? 'paused' : 'active');
                        setSelectedProject(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      {project.status === 'active' ? (
                        <><Pause className="h-4 w-4" /> Pause Project</>
                      ) : (
                        <><Play className="h-4 w-4" /> Activate Project</>
                      )}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(project.id, 'archived');
                        setSelectedProject(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Archive className="h-4 w-4" /> Archive
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                        setSelectedProject(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};