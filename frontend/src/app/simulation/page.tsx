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
import { PageShell, PageHeader, InfoTip, Chip } from '@/lib/uiHooks';

export default function SimulationPage() {
  const { fetchEmails, error, currentExecution, isExecuting } = useWorkflowStore();
  const needsReview = currentExecution?.workflow_status === 'needs_review';

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  return (
    <PageShell>
      <PageHeader
        pulse
        kicker="Sandbox simulation env"
        title="Agent Execution Board"
        sub="Select a custom inbound email to trigger the multi-stage LangGraph workflow. Watch state transitions stream in real time."
        right={<InfoTip icon={Info}>Toggle <strong style={{ color: 'var(--fg)' }}>Human Review</strong> to test the operator override path.</InfoTip>}
      />

      {/* Error alert */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: 'var(--r)', border: '1px solid color-mix(in oklab, var(--bad) 28%, transparent)', background: 'color-mix(in oklab, var(--bad) 6%, transparent)', fontSize: 12.5, color: 'var(--bad)' }}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Human review required banner (amber = needs review) */}
      {needsReview && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: 16, borderRadius: 'var(--r)', border: '1px solid color-mix(in oklab, var(--warn) 32%, transparent)', background: 'color-mix(in oklab, var(--warn) 7%, transparent)', boxShadow: '0 0 24px -8px color-mix(in oklab, var(--warn) 40%, transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: 9, borderRadius: 'var(--r-sm)', background: 'color-mix(in oklab, var(--warn) 14%, transparent)', border: '1px solid color-mix(in oklab, var(--warn) 28%, transparent)', color: 'var(--warn)', flexShrink: 0 }}>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.02em', textTransform: 'uppercase', color: 'var(--warn)' }}>Human Review Required</p>
              <p style={{ fontSize: 11.5, color: 'var(--fg-dim)', marginTop: 2 }}>
                The AI draft confidence was below the auto-send threshold. An operator must review and approve or reject the reply before it is dispatched.
              </p>
            </div>
          </div>
          <Link href="/review" className="focus-ring" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 'var(--r-sm)', background: 'color-mix(in oklab, var(--warn) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--warn) 32%, transparent)', color: 'var(--warn)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', flexShrink: 0 }}>
            <span>Open Review Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Board grid */}
      <div className="sim-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,340px) minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ height: 300 }}><EmailSelector /></div>
          <SimulationControls />
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          <MetricsPanel />
          <div className="sim-canvas-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,330px)', gap: 20 }}>
            {/* Graph panel */}
            <div className="panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 460 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--line)', background: 'rgba(255,255,255,.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <Play className="w-3.5 h-3.5" style={{ color: 'var(--accent-bright)' }} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Orchestration Graph</span>
                </div>
                {isExecuting && <Chip color="var(--accent-bright)" tone={0.12}>active</Chip>}
              </div>
              <div style={{ flex: 1, minHeight: 0, position: 'relative' }}><WorkflowGraph /></div>
            </div>
            {/* Logs */}
            <div style={{ minHeight: 460 }}><LogsTimeline /></div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
