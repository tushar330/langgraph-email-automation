'use client';

import React from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import WorkflowGraph from '@/components/workflow/WorkflowGraph';
import LogsTimeline from '@/components/workflow/LogsTimeline';
import MetricsPanel from '@/components/dashboard/MetricsPanel';
import { Activity, ShieldAlert, Cpu } from 'lucide-react';
import Link from 'next/link';

export default function LiveWorkflowPage() {
  const { currentExecution, isExecuting } = useWorkflowStore();

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6 relative z-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-[10px] font-mono text-primary font-bold tracking-widest uppercase">
              REAL-TIME ORCHESTRATION ENGINE
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            System Observability Console
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Visual execution trace of the active LangGraph email automation workflow. Select node cards to review model outputs.
          </p>
        </div>

        {/* Quick Review Navigation Badge */}
        {currentExecution?.workflow_status === 'needs_review' && (
          <Link 
            href="/review"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/25 text-xs text-orange-400 font-bold hover:bg-orange-500/20 transition-all glow-orange animate-pulse"
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Workflow Paused: Review Reply Draft</span>
          </Link>
        )}
      </div>

      {/* Metrics Row */}
      {currentExecution && (
        <div className="shrink-0">
          <MetricsPanel />
        </div>
      )}

      {/* Main Flow Canvas & Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 min-h-[500px]">
        
        {/* React Flow Board */}
        <div className="flex flex-col border border-white/5 rounded-2xl bg-charcoal/30 overflow-hidden relative glass-panel min-h-[480px]">
          {/* Header toolbar */}
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/5 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-primary/20 flex items-center justify-center">
                <span className={`w-1.5 h-1.5 rounded-full bg-primary ${isExecuting ? 'animate-ping' : ''}`} />
              </div>
              <span className="text-xs font-semibold tracking-wider text-white">REACT-FLOW SCHEMATIC CANVAS</span>
            </div>
            
            <div className="flex items-center gap-4 text-[9px] font-mono text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500/20 border border-green-500/50" />
                <span>COMPLETED</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary/20 border border-primary/50" />
                <span>RUNNING</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white/5 border border-white/10" />
                <span>PENDING</span>
              </div>
            </div>
          </div>

          {/* Interactive Canvas container */}
          <div className="flex-1 min-h-0 relative">
            <WorkflowGraph />
          </div>
        </div>

        {/* System Logs Timeline */}
        <div className="h-[400px] lg:h-auto shrink-0 lg:shrink flex flex-col">
          <LogsTimeline />
        </div>

      </div>

    </div>
  );
}
