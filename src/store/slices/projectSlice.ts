import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'paused' | 'completed' | 'archived'
  configuration: Record<string, any>
  createdAt: string
  updatedAt: string
  organizationId: string
}

interface ProjectMember {
  userId: string
  projectId: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  joinedAt: string
}

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  projectMembers: ProjectMember[]
  isLoading: boolean
  error: string | null
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  projectMembers: [],
  isLoading: false,
  error: null,
}

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    fetchProjectsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchProjectsSuccess: (state, action: PayloadAction<Project[]>) => {
      state.isLoading = false
      state.projects = action.payload
      state.error = null
    },
    fetchProjectsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    setCurrentProject: (state, action: PayloadAction<Project>) => {
      state.currentProject = action.payload
    },
    createProjectSuccess: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload)
    },
    updateProjectSuccess: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex(p => p.id === action.payload.id)
      if (index !== -1) {
        state.projects[index] = action.payload
      }
      if (state.currentProject?.id === action.payload.id) {
        state.currentProject = action.payload
      }
    },
    deleteProjectSuccess: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter(p => p.id !== action.payload)
      if (state.currentProject?.id === action.payload) {
        state.currentProject = null
      }
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  fetchProjectsStart,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  setCurrentProject,
  createProjectSuccess,
  updateProjectSuccess,
  deleteProjectSuccess,
  clearError,
} = projectSlice.actions

export default projectSlice.reducer