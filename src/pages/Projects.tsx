import React, { useState } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import { ProjectForm } from '../components/ProjectForm';
import { ProjectList } from '../components/ProjectList';
import type { Project } from '../lib/supabase';

// Mock organization ID for now - in a real app this would come from auth context
const MOCK_ORGANIZATION_ID = 'org-123';

export const Projects: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleProjectCreated = (project: Project) => {
    setShowCreateForm(false);
    setRefreshTrigger(prev => prev + 1); // Trigger refresh of project list
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    // In a real app, this might navigate to a project detail page
    console.log('Selected project:', project);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            </div>
            
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Create Project Form */}
          {showCreateForm && (
            <ProjectForm
              organizationId={MOCK_ORGANIZATION_ID}
              onProjectCreated={handleProjectCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          )}

          {/* Project List */}
          <ProjectList
            organizationId={MOCK_ORGANIZATION_ID}
            onProjectSelect={handleProjectSelect}
            refreshTrigger={refreshTrigger}
          />

          {/* Selected Project Info */}
          {selectedProject && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Selected: {selectedProject.name}
              </h3>
              <p className="text-blue-700">
                Status: {selectedProject.status} | Created: {new Date(selectedProject.created_at).toLocaleDateString()}
              </p>
              {selectedProject.description && (
                <p className="text-blue-600 mt-2">{selectedProject.description}</p>
              )}
              <button
                onClick={() => setSelectedProject(null)}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};