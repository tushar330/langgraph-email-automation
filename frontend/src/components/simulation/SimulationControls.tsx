'use client';

import React, { useState } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { Play, ToggleLeft, ToggleRight, Sparkles, Send, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SimulationControls() {
  const router = useRouter();
  const { simulationEmails, selectedEmailId, runSimulation, isExecuting } = useWorkflowStore();
  const [forceReview, setForceReview] = useState(false);

  const selectedEmail = simulationEmails.find((e) => e.id === selectedEmailId);

  const handleRun = async () => {
    if (!selectedEmailId) return;
    try {
      const res = await runSimulation(selectedEmailId, forceReview);
      
      // If it requires human review, redirect or alert the user
      if (res.workflow_status === 'needs_review') {
        // We can let them view it on the graph or review page
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!selectedEmail) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-gray-500 bg-charcoal/40 border border-white/5 rounded-2xl glass-panel">
        Select an email from the left panel to begin.
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-charcoal/40 border border-white/5 rounded-2xl p-6 space-y-6 glass-panel">
      {/* Email Preview Header */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono text-primary font-bold tracking-widest uppercase">EMAIL PREVIEW</span>
          <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
            ID: {selectedEmail.id}
          </span>
        </div>

        <div className="bg-black/45 border border-white/5 rounded-xl p-4.5 space-y-3 font-sans">
          <div className="grid grid-cols-[60px_1fr] text-xs pb-2 border-b border-white/5">
            <span className="text-gray-500 font-medium">From:</span>
            <span className="text-white font-semibold truncate">{selectedEmail.sender}</span>
          </div>
          <div className="grid grid-cols-[60px_1fr] text-xs pb-2 border-b border-white/5">
            <span className="text-gray-500 font-medium">Subject:</span>
            <span className="text-white font-semibold">{selectedEmail.subject}</span>
          </div>
          <div className="pt-2 text-xs leading-relaxed text-gray-300 whitespace-pre-line max-h-[160px] overflow-y-auto pr-2">
            {selectedEmail.body}
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="space-y-4">
        <span className="text-[10px] font-mono text-gray-500 font-bold tracking-widest uppercase block">SIMULATION SETTINGS</span>
        
        <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0b0b0b]/40 hover:bg-[#0b0b0b]/60 transition-colors">
          <div className="flex flex-col gap-1 pr-6">
            <span className="text-xs font-semibold text-white">Force Human Review</span>
            <span className="text-[10px] text-gray-500 leading-relaxed">
              Forces the agent confidence threshold check to fail, routing the draft to the review board.
            </span>
          </div>
          <button
            onClick={() => setForceReview(!forceReview)}
            disabled={isExecuting}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 shrink-0"
          >
            {forceReview ? (
              <ToggleRight className="w-9 h-9 text-primary" />
            ) : (
              <ToggleLeft className="w-9 h-9 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Trigger CTA */}
      <div className="pt-2">
        <button
          onClick={handleRun}
          disabled={isExecuting}
          className={`w-full py-4 rounded-xl font-sans font-bold text-xs tracking-wider uppercase transition-all duration-500 flex items-center justify-center gap-2.5 relative overflow-hidden group ${
            isExecuting
              ? 'bg-white/5 text-gray-500 border border-white/5'
              : 'bg-primary hover:bg-primary-light text-black shadow-lg shadow-primary/20 hover:shadow-primary/45 border-0 cursor-pointer active:scale-[0.98]'
          }`}
        >
          {isExecuting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>RUNNING AI AGENTS...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-black stroke-0" />
              <span>EXECUTE AGENT WORKFLOW</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
