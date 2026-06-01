'use client';

import React, { useEffect } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import ReviewForm from '@/components/review/ReviewForm';
import { ShieldCheck, Info } from 'lucide-react';
import { PageShell, PageHeader, InfoTip } from '@/lib/uiHooks';

export default function HumanReviewPage() {
  const { loadPausedExecutionsFromSession } = useWorkflowStore();

  useEffect(() => {
    loadPausedExecutionsFromSession();
  }, [loadPausedExecutionsFromSession]);

  return (
    <PageShell>
      <PageHeader
        kickerIcon={ShieldCheck}
        kicker="Operational compliance overrides"
        title="Human Review Board"
        sub="Audit queued AI replies that failed confidence checks or were flagged for manual dispatch."
        right={<InfoTip icon={Info}>You can edit the draft directly before clicking <strong style={{ color: 'var(--fg)' }}>Approve &amp; Dispatch</strong>.</InfoTip>}
      />
      <ReviewForm />
    </PageShell>
  );
}
