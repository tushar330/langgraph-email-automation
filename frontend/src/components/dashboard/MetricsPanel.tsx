'use client';

import React from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { ShieldCheck, Tag, Zap, Layers, RefreshCw, BarChart2 } from 'lucide-react';

export default function MetricsPanel() {
  const { currentExecution, isExecuting } = useWorkflowStore();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'needs_review':
        return { text: 'Needs Review', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20 glow-orange' };
      case 'approved':
        return { text: 'Approved', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-blue-500/5' };
      case 'sent':
        return { text: 'Draft Dispatched', color: 'text-green-400 bg-green-500/10 border-green-500/20 glow-green' };
      case 'failed':
        return { text: 'Workflow Failed', color: 'text-red-400 bg-red-500/10 border-red-500/20 glow-red' };
      case 'processing':
        return { text: 'Processing', color: 'text-primary bg-primary/10 border-primary/20 animate-pulse' };
      default:
        return { text: 'Idle', color: 'text-gray-400 bg-white/5 border-white/5' };
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.75) return 'text-green-400';
    if (score >= 0.5) return 'text-orange-400';
    return 'text-red-400';
  };

  const getConfidenceBg = (score: number) => {
    if (score >= 0.75) return 'bg-green-500';
    if (score >= 0.5) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const status = currentExecution?.workflow_status || 'idle';
  const statusConfig = getStatusConfig(status);
  const category = currentExecution?.category || null;
  const categoryConf = currentExecution?.category_confidence || 0;
  const responseConf = currentExecution?.response_confidence || 0;
  const logSteps = currentExecution?.workflow_logs.length || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {/* Workflow Status */}
      <div className="bg-charcoal/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between glass-panel min-h-[110px]">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono text-gray-500 tracking-wider uppercase font-bold">Workflow Status</span>
          <Zap className="w-3.5 h-3.5 text-gray-500" />
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          {isExecuting ? (
            <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>EXECUTING...</span>
            </div>
          ) : (
            <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${statusConfig.color}`}>
              {statusConfig.text}
            </span>
          )}
        </div>
      </div>

      {/* AI Category */}
      <div className="bg-charcoal/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between glass-panel min-h-[110px]">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono text-gray-500 tracking-wider uppercase font-bold">Classified Category</span>
          <Tag className="w-3.5 h-3.5 text-gray-500" />
        </div>
        <div className="mt-2.5">
          {category ? (
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wide block truncate">
                {category.replace(/_/g, ' ')}
              </span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${categoryConf * 100}%` }} />
                </div>
                <span className="text-[9px] font-mono text-primary font-bold">
                  {Math.round(categoryConf * 100)}%
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xs font-medium text-gray-600 italic">Unclassified</span>
          )}
        </div>
      </div>

      {/* Response Confidence */}
      <div className="bg-charcoal/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between glass-panel min-h-[110px]">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono text-gray-500 tracking-wider uppercase font-bold">Draft Confidence</span>
          <BarChart2 className="w-3.5 h-3.5 text-gray-500" />
        </div>
        <div className="mt-2.5">
          {responseConf > 0 ? (
            <div>
              <span className={`text-sm font-mono font-bold tracking-tight ${getConfidenceColor(responseConf)}`}>
                {Math.round(responseConf * 100)}%
              </span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${getConfidenceBg(responseConf)}`} style={{ width: `${responseConf * 100}%` }} />
                </div>
                <span className="text-[8px] font-mono text-gray-500 font-bold uppercase tracking-wider">
                  {responseConf >= 0.75 ? 'TRUSTED' : 'LOW CONF'}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xs font-medium text-gray-600 italic">No confidence score</span>
          )}
        </div>
      </div>

      {/* Execution Stages */}
      <div className="bg-charcoal/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between glass-panel min-h-[110px]">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono text-gray-500 tracking-wider uppercase font-bold">Orchestration Steps</span>
          <Layers className="w-3.5 h-3.5 text-gray-500" />
        </div>
        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-mono font-bold text-white">
            {logSteps}
          </span>
          <span className="text-[9px] font-mono text-gray-500 font-bold uppercase tracking-wider">
            Logs Recorded
          </span>
        </div>
      </div>
    </div>
  );
}
