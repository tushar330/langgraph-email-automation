import { create } from 'zustand';
import { api, SimulationEmail, WorkflowExecutionResponse } from '@/lib/api';

interface WorkflowState {
  simulationEmails: SimulationEmail[];
  selectedEmailId: string | null;
  currentExecution: WorkflowExecutionResponse | null;
  isExecuting: boolean;
  isLoadingEmails: boolean;
  backendWaking: boolean;
  error: string | null;
  pausedExecutions: Record<string, WorkflowExecutionResponse>;
  lastPausedExecution: WorkflowExecutionResponse | null;
  activeStep: string | null;

  // Actions
  fetchEmails: () => Promise<void>;
  setSelectedEmailId: (id: string | null) => void;
  runSimulation: (id: string, forceReview?: boolean) => Promise<WorkflowExecutionResponse>;
  approveWorkflow: (id: string | null, approved: boolean, responseText?: string) => Promise<WorkflowExecutionResponse>;
  clearExecution: () => void;
  loadPausedExecutionsFromSession: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  simulationEmails: [],
  selectedEmailId: null,
  currentExecution: null,
  isExecuting: false,
  isLoadingEmails: false,
  backendWaking: false,
  error: null,
  pausedExecutions: {},
  lastPausedExecution: null,
  activeStep: null,

  fetchEmails: async () => {
    set({ isLoadingEmails: true, error: null });

    // Wake up Render's cold-start instance before fetching.
    // Ping up to 6 times (30s total) then proceed regardless.
    const alive = await api.ping();
    if (!alive) {
      set({ backendWaking: true });
      let attempts = 0;
      while (attempts < 5) {
        await new Promise((r) => setTimeout(r, 5000));
        const ok = await api.ping();
        if (ok) break;
        attempts++;
      }
      set({ backendWaking: false });
    }

    // Retry the actual emails fetch up to 3 times
    let lastError: string | null = null;
    for (let i = 0; i < 3; i++) {
      try {
        const emails = await api.getSimulationEmails();
        set({ simulationEmails: emails, isLoadingEmails: false, error: null });
        if (emails.length > 0 && !get().selectedEmailId) {
          set({ selectedEmailId: emails[0].id });
        }
        return;
      } catch (err: any) {
        lastError = err.message || 'Failed to fetch emails';
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    set({ error: lastError, isLoadingEmails: false });
  },

  setSelectedEmailId: (id) => {
    set({ selectedEmailId: id });
  },

  runSimulation: async (id, forceReview = false) => {
    set({ isExecuting: true, error: null, currentExecution: null, activeStep: 'load_inbox_emails' });
    try {
      // We simulate animation steps for UI visual appeal
      // Let's call the api directly
      const response = await api.runSimulation(id, forceReview);
      
      set({ currentExecution: response });
      
      // If it paused for review, save it
      if (response.workflow_status === 'needs_review') {
        const updatedPaused = { ...get().pausedExecutions, [id]: response };
        set({ 
          pausedExecutions: updatedPaused,
          lastPausedExecution: response
        });
        localStorage.setItem('paused_executions', JSON.stringify(updatedPaused));
      }

      set({ isExecuting: false, activeStep: null });
      return response;
    } catch (err: any) {
      set({ error: err.message || 'Execution failed', isExecuting: false, activeStep: null });
      throw err;
    }
  },

  approveWorkflow: async (id, approved, responseText) => {
    set({ isExecuting: true, error: null });
    try {
      const response = await api.approveWorkflow(id, approved, responseText);
      set({ currentExecution: response });

      // Remove from paused records
      const updatedPaused = { ...get().pausedExecutions };
      if (id && updatedPaused[id]) {
        delete updatedPaused[id];
      }
      
      // Update last paused state
      let nextLastPaused: WorkflowExecutionResponse | null = null;
      const keys = Object.keys(updatedPaused);
      if (keys.length > 0) {
        nextLastPaused = updatedPaused[keys[keys.length - 1]];
      }

      set({ 
        pausedExecutions: updatedPaused,
        lastPausedExecution: nextLastPaused,
        isExecuting: false
      });

      localStorage.setItem('paused_executions', JSON.stringify(updatedPaused));
      return response;
    } catch (err: any) {
      set({ error: err.message || 'Approval failed', isExecuting: false });
      throw err;
    }
  },

  clearExecution: () => {
    set({ currentExecution: null, error: null });
  },

  loadPausedExecutionsFromSession: () => {
    try {
      const saved = localStorage.getItem('paused_executions');
      if (saved) {
        const parsed = JSON.parse(saved);
        const keys = Object.keys(parsed);
        set({
          pausedExecutions: parsed,
          lastPausedExecution: keys.length > 0 ? parsed[keys[keys.length - 1]] : null
        });
      }
    } catch (e) {
      console.error('Failed to load paused executions', e);
    }
  }
}));
