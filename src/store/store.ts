import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import projectSlice from './slices/projectSlice'
import workflowSlice from './slices/workflowSlice'
import agentSlice from './slices/agentSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    projects: projectSlice,
    workflows: workflowSlice,
    agents: agentSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch