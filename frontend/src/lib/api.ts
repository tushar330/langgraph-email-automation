export interface EmailDetails {
  subject: string;
  sender: string;
  body: string;
}

export interface WorkflowLog {
  step: string;
  status: 'completed' | 'running' | 'failed' | 'pending';
  timestamp: string;
  message: string;
  details?: Record<string, any>;
}

export interface WorkflowExecutionResponse {
  workflow_status: 'processing' | 'needs_review' | 'approved' | 'sent' | 'failed' | 'retry';
  email: {
    subject: string;
    sender: string;
    body: string;
  };
  category: string;
  category_confidence: number;
  response_confidence: number;
  requires_human_review: boolean;
  generated_response: string;
  workflow_logs: WorkflowLog[];
  metadata: {
    is_simulation: boolean;
    id: string;
    threadId?: string;
    messageId?: string;
  };
}

export interface SimulationEmail {
  id: string;
  sender: string;
  subject: string;
  body: string;
  threadId: string;
  messageId: string;
  references?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = {
  async ping(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(8000) });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getSimulationEmails(): Promise<SimulationEmail[]> {
    const res = await fetch(`${API_BASE_URL}/simulation/emails`);
    if (!res.ok) {
      throw new Error(`Failed to fetch simulation emails: ${res.statusText}`);
    }
    return res.json();
  },

  async runSimulation(id: string, forceReview = false): Promise<WorkflowExecutionResponse> {
    const res = await fetch(`${API_BASE_URL}/simulation/run/${id}?force_review=${forceReview}`, {
      method: 'POST',
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Workflow execution failed: ${errorText || res.statusText}`);
    }
    return res.json();
  },

  async approveWorkflow(id: string | null, approved: boolean, generatedResponse?: string): Promise<WorkflowExecutionResponse> {
    const res = await fetch(`${API_BASE_URL}/workflow/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        approved,
        generated_response: generatedResponse,
      }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Workflow approval failed: ${errorText || res.statusText}`);
    }
    return res.json();
  },
};
