'use client';

import React, { useEffect } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import ReviewForm from '@/components/review/ReviewForm';
import { ShieldCheck, Info } from 'lucide-react';

export default function HumanReviewPage() {
  const { loadPausedExecutionsFromSession } = useWorkflowStore();

  useEffect(() => {
    loadPausedExecutionsFromSession();
  }, [loadPausedExecutionsFromSession]);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6 relative z-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-mono text-primary font-bold tracking-widest uppercase">
              OPERATIONAL COMPLIANCE OVERRIDES
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Human Review Board
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Audit queued AI replies that failed confidence checks or were flagged for manual dispatch review.
          </p>
        </div>

        {/* Global info tip */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/5 max-w-sm text-[10px] leading-relaxed text-gray-400">
          <Info className="w-4 h-4 text-primary shrink-0" />
          <span>
            You can modify the draft response directly in the text editor before clicking <strong>Approve & Dispatch</strong>.
          </span>
        </div>
      </div>

      {/* Main Review Form container */}
      <div className="flex-1">
        <ReviewForm />
      </div>

    </div>
  );
}
