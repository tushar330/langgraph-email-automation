'use client';

import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { ShieldAlert, CheckCircle, XCircle, Info, Edit3, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReviewForm() {
  const { pausedExecutions, lastPausedExecution, approveWorkflow, isExecuting } = useWorkflowStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editedResponse, setEditedResponse] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const keys = Object.keys(pausedExecutions);
  const pendingCount = keys.length;

  // Selected execution to review
  const currentReview = activeId ? pausedExecutions[activeId] : lastPausedExecution;

  useEffect(() => {
    if (currentReview) {
      setEditedResponse(currentReview.generated_response || '');
      setActiveId(currentReview.metadata.id);
    } else {
      setEditedResponse('');
      setActiveId(null);
    }
    setIsEditing(false);
  }, [currentReview]);

  const handleApprove = async () => {
    if (!currentReview) return;
    try {
      await approveWorkflow(currentReview.metadata.id, true, editedResponse);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async () => {
    if (!currentReview) return;
    try {
      await approveWorkflow(currentReview.metadata.id, false);
    } catch (e) {
      console.error(e);
    }
  };

  if (pendingCount === 0 || !currentReview) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-charcoal/40 border border-white/5 rounded-2xl min-h-[400px] glass-panel space-y-4">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
          <ShieldAlert className="w-6 h-6 text-gray-500" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide">NO PENDING HUMAN REVIEWS</h3>
          <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
            All workflows have been successfully routed or auto-approved. Run a simulation with the 
            <strong className="text-primary"> 'Force Human Review' </strong> toggle turned on to pause execution here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 items-start">
      {/* Pending Reviews Sidebar */}
      <div className="flex flex-col bg-charcoal/40 border border-white/5 rounded-2xl p-4 glass-panel space-y-3">
        <span className="text-[10px] font-mono text-gray-500 font-bold tracking-widest uppercase pb-2 border-b border-white/5">
          PENDING AUDIT QUEUE ({pendingCount})
        </span>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {keys.map((key) => {
            const item = pausedExecutions[key];
            const isSelected = activeId === item.metadata.id;
            return (
              <button
                key={item.metadata.id}
                onClick={() => setActiveId(item.metadata.id)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                  isSelected
                    ? 'border-primary/45 bg-primary/5 text-white'
                    : 'border-white/5 bg-[#0b0b0b]/40 text-gray-400 hover:border-white/10 hover:bg-[#0b0b0b]/60'
                }`}
              >
                <div className="font-bold truncate">{item.email.sender}</div>
                <div className="text-[10px] text-gray-500 truncate mt-0.5">{item.email.subject}</div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5 text-gray-400">
                    {item.category.toUpperCase().replace('_', ' ')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Review Work Area */}
      <div className="flex flex-col bg-charcoal/40 border border-white/5 rounded-2xl p-6 glass-panel space-y-6">
        {/* Header Metadata */}
        <div className="flex justify-between items-start gap-4 pb-4 border-b border-white/5">
          <div>
            <span className="text-[9px] font-mono text-primary font-bold tracking-widest uppercase">HUMAN IN THE LOOP REVIEW GATEWAY</span>
            <h3 className="text-sm font-semibold text-white mt-1">Reviewing response for: {currentReview.email.sender}</h3>
            <p className="text-[11px] text-gray-500 mt-1">Subject: {currentReview.email.subject}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full uppercase tracking-wider glow-orange">
              Awaiting Approval
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-[#0b0b0b]/60 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[9px] font-mono text-gray-500 uppercase font-bold tracking-wider">Classification</span>
            <span className="text-xs font-semibold text-white mt-1.5 uppercase truncate">
              {currentReview.category.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="bg-[#0b0b0b]/60 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[9px] font-mono text-gray-500 uppercase font-bold tracking-wider">Classifier Confidence</span>
            <span className="text-xs font-mono font-bold text-primary mt-1.5">
              {Math.round(currentReview.category_confidence * 100)}%
            </span>
          </div>
          <div className="bg-[#0b0b0b]/60 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[9px] font-mono text-gray-500 uppercase font-bold tracking-wider">Draft Confidence</span>
            <span className="text-xs font-mono font-bold text-orange-400 mt-1.5">
              {Math.round(currentReview.response_confidence * 100)}%
            </span>
          </div>
        </div>

        {/* Original Inbound Email */}
        <div className="space-y-2">
          <span className="text-[9px] font-mono text-gray-500 font-bold uppercase tracking-wider block">INBOUND MESSAGE</span>
          <div className="p-4 rounded-xl border border-white/5 bg-[#0b0b0b]/40 text-xs text-gray-400 max-h-[120px] overflow-y-auto leading-relaxed">
            {currentReview.email.body}
          </div>
        </div>

        {/* Editable Generated Response */}
        <div className="space-y-3.5">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-mono text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-primary" />
              <span>AI GENERATED DRAFT RESPONSE</span>
            </span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-[10px] font-mono text-gray-400 hover:text-white px-2.5 py-1 rounded bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
            >
              {isEditing ? 'Preview Mode' : 'Edit Response'}
            </button>
          </div>

          <div className="relative">
            {isEditing ? (
              <textarea
                value={editedResponse}
                onChange={(e) => setEditedResponse(e.target.value)}
                disabled={isExecuting}
                rows={8}
                className="w-full bg-[#030303]/95 border border-primary/25 rounded-xl p-4.5 text-xs text-gray-200 focus:outline-none focus:border-primary font-mono focus:ring-1 focus:ring-primary/20 leading-relaxed"
              />
            ) : (
              <div className="w-full bg-[#0b0b0b]/75 border border-white/5 rounded-xl p-4.5 text-xs text-gray-300 font-sans whitespace-pre-line leading-relaxed max-h-[220px] overflow-y-auto">
                {editedResponse}
              </div>
            )}
          </div>
        </div>

        {/* Action Triggers */}
        <div className="pt-2 border-t border-white/5 flex gap-4">
          <button
            onClick={handleReject}
            disabled={isExecuting}
            className="flex-1 py-3.5 rounded-xl border border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2"
          >
            {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            <span>Discard / Reject Draft</span>
          </button>
          <button
            onClick={handleApprove}
            disabled={isExecuting}
            className="flex-1 py-3.5 rounded-xl bg-primary hover:bg-primary-light text-black text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/10 hover:shadow-primary/30"
          >
            {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            <span>Approve & Dispatch Reply</span>
          </button>
        </div>
      </div>
    </div>
  );
}
