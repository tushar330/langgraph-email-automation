'use client';

import React, { useState } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Clock, ChevronRight, ChevronDown, CheckCircle2, RefreshCw, XCircle, Info } from 'lucide-react';

export default function LogsTimeline() {
  const { currentExecution, isExecuting } = useWorkflowStore();
  const [expandedLogIndex, setExpandedLogIndex] = useState<number | null>(null);

  const logs = currentExecution?.workflow_logs || [];

  const toggleExpand = (index: number) => {
    setExpandedLogIndex(expandedLogIndex === index ? null : index);
  };

  const formatStepName = (step: string) => {
    return step
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-charcoal/40 border border-white/5 rounded-2xl overflow-hidden glass-panel">
      {/* Title Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold tracking-wider text-white">SYSTEM OBSERVABILITY LOGS</span>
        </div>
        {logs.length > 0 && (
          <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
            {logs.length} EVENTS
          </span>
        )}
      </div>

      {/* Logs Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            {isExecuting ? (
              <>
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                <div>
                  <h4 className="text-xs font-semibold text-white tracking-wide">EXECUTING WORKFLOW</h4>
                  <p className="text-[10px] text-gray-500 mt-1">Spinning up LLM agents & retrieving context...</p>
                </div>
              </>
            ) : (
              <>
                <Terminal className="w-8 h-8 text-gray-700" />
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 tracking-wide">NO LOGS AVAILABLE</h4>
                  <p className="text-[10px] text-gray-600 mt-1">Select an email and run a simulation to inspect execution trace.</p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5">
            <AnimatePresence>
              {logs.map((log, index) => {
                const isExpanded = expandedLogIndex === index;
                const hasDetails = log.details && Object.keys(log.details).length > 0;
                
                // Color dots by step status
                let dotColor = 'bg-gray-600 ring-gray-600/20';
                if (log.status === 'completed') dotColor = 'bg-green-500 ring-green-500/20';
                if (log.status === 'failed') dotColor = 'bg-red-500 ring-red-500/20';
                if (log.status === 'running') dotColor = 'bg-primary ring-primary/20 animate-pulse';

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="relative pl-7 flex flex-col group"
                  >
                    {/* Timeline Dot */}
                    <div className={`absolute left-[9px] top-1.5 w-2 h-2 rounded-full ring-4 ${dotColor} z-10`} />

                    {/* Content Card */}
                    <div className="bg-[#0b0b0b]/60 border border-white/5 hover:border-white/10 rounded-xl p-3 transition-all duration-300">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white tracking-wide">
                              {formatStepName(log.step)}
                            </span>
                            <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {formatTime(log.timestamp)}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                            {log.message}
                          </p>
                        </div>

                        {hasDetails && (
                          <button
                            onClick={() => toggleExpand(index)}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          >
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>

                      {/* Expandable JSON details */}
                      {isExpanded && hasDetails && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-3.5 pt-3.5 border-t border-white/5 overflow-hidden"
                        >
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary uppercase tracking-wider mb-2">
                            <Info className="w-3 h-3" />
                            <span>Execution Metadata</span>
                          </div>
                          <pre className="text-[10px] font-mono bg-black/60 p-3 rounded-lg border border-white/5 text-gray-300 overflow-x-auto max-w-full leading-relaxed">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
