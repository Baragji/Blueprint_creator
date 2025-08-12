import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AIAgent {
  id: string
  projectId: string
  agentType: 'planner' | 'implementer' | 'security' | 'test' | 'sre' | 'finops' | 'governance' | 'docs'
  status: 'active' | 'inactive' | 'error' | 'maintenance'
  configuration: Record<string, any>
  performanceMetrics: {
    tasksCompleted: number
    averageExecutionTime: number
    successRate: number
    costPerTask: number
  }
  createdAt: string
  updatedAt: string
}

interface AgentState {
  agents: AIAgent[]
  activeJobs: number
  overallHealth: 'healthy' | 'warning' | 'critical'
  isLoading: boolean
  error: string | null
}

const initialState: AgentState = {
  agents: [],
  activeJobs: 0,
  overallHealth: 'healthy',
  isLoading: false,
  error: null,
}

const agentSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    fetchAgentsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchAgentsSuccess: (state, action: PayloadAction<AIAgent[]>) => {
      state.isLoading = false
      state.agents = action.payload
      state.error = null
    },
    fetchAgentsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    updateAgentStatus: (state, action: PayloadAction<{ id: string; status: AIAgent['status'] }>) => {
      const agent = state.agents.find(a => a.id === action.payload.id)
      if (agent) {
        agent.status = action.payload.status
      }
    },
    updateAgentConfiguration: (state, action: PayloadAction<{ id: string; configuration: Record<string, any> }>) => {
      const agent = state.agents.find(a => a.id === action.payload.id)
      if (agent) {
        agent.configuration = { ...agent.configuration, ...action.payload.configuration }
      }
    },
    updateAgentMetrics: (state, action: PayloadAction<{ id: string; metrics: Partial<AIAgent['performanceMetrics']> }>) => {
      const agent = state.agents.find(a => a.id === action.payload.id)
      if (agent) {
        agent.performanceMetrics = { ...agent.performanceMetrics, ...action.payload.metrics }
      }
    },
    setActiveJobs: (state, action: PayloadAction<number>) => {
      state.activeJobs = action.payload
    },
    setOverallHealth: (state, action: PayloadAction<AgentState['overallHealth']>) => {
      state.overallHealth = action.payload
    },
    addAgent: (state, action: PayloadAction<AIAgent>) => {
      state.agents.push(action.payload)
    },
    removeAgent: (state, action: PayloadAction<string>) => {
      state.agents = state.agents.filter(a => a.id !== action.payload)
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  fetchAgentsStart,
  fetchAgentsSuccess,
  fetchAgentsFailure,
  updateAgentStatus,
  updateAgentConfiguration,
  updateAgentMetrics,
  setActiveJobs,
  setOverallHealth,
  addAgent,
  removeAgent,
  clearError,
} = agentSlice.actions

export default agentSlice.reducer