import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Gate {
  id: string
  workflowId: string
  gateCode: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'approved' | 'rejected'
  requirements: Record<string, any>
  artifacts: Record<string, any>
  createdAt: string
  completedAt?: string
}

interface Workflow {
  id: string
  projectId: string
  type: 'plan_pack' | 'g_gate' | 'custom'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  definition: Record<string, any>
  state: Record<string, any>
  createdAt: string
  updatedAt: string
}

interface Task {
  id: string
  workflowId: string
  agentId: string
  taskType: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  inputData: Record<string, any>
  outputData: Record<string, any>
  createdAt: string
  completedAt?: string
}

interface WorkflowState {
  workflows: Workflow[]
  currentWorkflow: Workflow | null
  gates: Gate[]
  tasks: Task[]
  isLoading: boolean
  error: string | null
}

const initialState: WorkflowState = {
  workflows: [],
  currentWorkflow: null,
  gates: [],
  tasks: [],
  isLoading: false,
  error: null,
}

const workflowSlice = createSlice({
  name: 'workflows',
  initialState,
  reducers: {
    fetchWorkflowsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchWorkflowsSuccess: (state, action: PayloadAction<Workflow[]>) => {
      state.isLoading = false
      state.workflows = action.payload
      state.error = null
    },
    fetchWorkflowsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    setCurrentWorkflow: (state, action: PayloadAction<Workflow>) => {
      state.currentWorkflow = action.payload
    },
    updateWorkflowStatus: (state, action: PayloadAction<{ id: string; status: Workflow['status'] }>) => {
      const workflow = state.workflows.find(w => w.id === action.payload.id)
      if (workflow) {
        workflow.status = action.payload.status
      }
      if (state.currentWorkflow?.id === action.payload.id) {
        state.currentWorkflow.status = action.payload.status
      }
    },
    setGates: (state, action: PayloadAction<Gate[]>) => {
      state.gates = action.payload
    },
    updateGateStatus: (state, action: PayloadAction<{ id: string; status: Gate['status'] }>) => {
      const gate = state.gates.find(g => g.id === action.payload.id)
      if (gate) {
        gate.status = action.payload.status
      }
    },
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload
    },
    updateTaskStatus: (state, action: PayloadAction<{ id: string; status: Task['status'] }>) => {
      const task = state.tasks.find(t => t.id === action.payload.id)
      if (task) {
        task.status = action.payload.status
      }
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  fetchWorkflowsStart,
  fetchWorkflowsSuccess,
  fetchWorkflowsFailure,
  setCurrentWorkflow,
  updateWorkflowStatus,
  setGates,
  updateGateStatus,
  setTasks,
  updateTaskStatus,
  clearError,
} = workflowSlice.actions

export default workflowSlice.reducer