'use client';

import React, { useEffect } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import EmailSelector from '@/components/simulation/EmailSelector';
import SimulationControls from '@/components/simulation/SimulationControls';
import MetricsPanel from '@/components/dashboard/MetricsPanel';
import WorkflowGraph from '@/components/workflow/WorkflowGraph';
import LogsTimeline from '@/components/workflow/LogsTimeline';
import { AlertCircle, Play, Info, ShieldAlert, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SimulationPage() {
  const { fetchEmails, error, currentExecution, isExecuting } = useWorkflowStore();
  const needsReview = currentExecution?.workflow_status === 'needs_review';

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6 relative z-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-mono text-primary font-bold tracking-widest uppercase">
              SANDBOX SIMULATION ENV
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Agent Execution Board
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Select a custom inbound email to trigger the multi-stage LangGraph workflow. Monitor state transition logs in real-time.
          </p>
        </div>

        {/* Global info tip */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/5 max-w-sm text-[10px] leading-relaxed text-gray-400">
          <Info className="w-4 h-4 text-primary shrink-0" />
          <span>
            Toggle <strong>'Force Human Review'</strong> to test the operator override mechanism on the review board.
          </span>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Human review required banner */}
      {needsReview && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-orange-500/30 bg-orange-500/5 shadow-[0_0_20px_rgba(255,107,0,0.05)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 shrink-0">
              <ShieldAlert className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-orange-400 tracking-wide uppercase">Human Review Required</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                The AI draft confidence was below the auto-send threshold. An operator must review and approve or reject the reply before it is dispatched.
              </p>
            </div>
          </div>
          <Link
            href="/review"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider transition-all shrink-0"
          >
            <span>Open Review Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Main Board Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start flex-1">
        
        {/* Left Side: Selectors & Configuration */}
        <div className="flex flex-col gap-6 h-full">
          <div className="h-[280px] lg:h-[320px] shrink-0">
            <EmailSelector />
          </div>
          <div className="flex-1">
            <SimulationControls />
          </div>
        </div>

        {/* Right Side: Visualizers & Logs */}
        <div className="flex flex-col gap-6 h-full min-w-0">
          
          {/* Top Row: Metrics Panel */}
          <div className="shrink-0">
            <MetricsPanel />
          </div>

          {/* Bottom Grid: React Flow Visualizer & Live logs */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 min-h-[500px] flex-1">
            
            {/* React Flow Engine Canvas */}
            <div className="flex flex-col border border-white/5 rounded-2xl bg-charcoal/30 overflow-hidden relative glass-panel min-h-[450px]">
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/5 shrink-0">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold tracking-wider text-white">ORCHESTRATION GRAPH VISUALIZER</span>
                </div>
                {isExecuting && (
                  <span className="text-[8px] font-mono bg-primary/10 border border-primary/25 text-primary px-2 py-0.5 rounded font-bold uppercase animate-pulse">
                    ACTIVE PROCESSING
                  </span>
                )}
              </div>
              <div className="flex-1 min-h-0 relative">
                <WorkflowGraph />
              </div>
            </div>

            {/* Logs Timeline sidebar */}
            <div className="h-[400px] xl:h-auto shrink-0 xl:shrink">
              <LogsTimeline />
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
