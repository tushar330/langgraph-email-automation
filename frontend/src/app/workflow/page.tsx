'use client';

import React from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import WorkflowGraph from '@/components/workflow/WorkflowGraph';
import LogsTimeline from '@/components/workflow/LogsTimeline';
import MetricsPanel from '@/components/dashboard/MetricsPanel';
import { Activity, ShieldAlert, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PageShell, PageHeader } from '@/lib/uiHooks';

const LEGEND = [
  { label: 'Completed', color: 'var(--ok)' },
  { label: 'Running', color: 'var(--accent)' },
  { label: 'Pending', color: 'var(--fg-faint)' },
];

export default function LiveWorkflowPage() {
  const { currentExecution, isExecuting } = useWorkflowStore();
  const needsReview = currentExecution?.workflow_status === 'needs_review';

  return (
    <PageShell>
      <PageHeader
        kickerIcon={Activity}
        kicker="Real-time orchestration engine"
        title="System Observability Console"
        sub="Visual execution trace of the active LangGraph email automation workflow. Inspect node cards and live transition logs."
        right={
          needsReview ? (
            <Link
              href="/review"
              className="focus-ring"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 'var(--r-sm)', background: 'color-mix(in oklab, var(--warn) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--warn) 32%, transparent)', color: 'var(--warn)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', animation: 'a-pulse 1.8s infinite' }}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Paused · review draft</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : undefined
        }
      />

      {/* Metrics */}
      {currentExecution && <MetricsPanel />}

      {/* Canvas + logs */}
      <div className="wf-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,360px)', gap: 20, flex: 1, minHeight: 500 }}>
        {/* Graph panel */}
        <div className="panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 480 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--line)', background: 'rgba(255,255,255,.02)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
                {isExecuting && <span className="ping" style={{ position: 'absolute', inset: 0, color: 'var(--accent)', borderRadius: 99 }} />}
                <span style={{ position: 'relative', width: 8, height: 8, borderRadius: 99, background: 'var(--accent)' }} />
              </span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>React-Flow Schematic Canvas</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {LEGEND.map((l) => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--fg-faint)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: `color-mix(in oklab, ${l.color} 28%, transparent)`, border: `1px solid ${l.color}` }} />
                  <span>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <WorkflowGraph />
          </div>
        </div>

        {/* Logs */}
        <div style={{ minHeight: 480, display: 'flex', flexDirection: 'column' }}>
          <LogsTimeline />
        </div>
      </div>
    </PageShell>
  );
}
