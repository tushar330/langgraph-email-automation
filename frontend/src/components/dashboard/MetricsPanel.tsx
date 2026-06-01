'use client';

import React from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { Zap, Tag, BarChart2, Layers, RefreshCw } from 'lucide-react';
import { statusConfig, confColor } from '@/lib/uiHooks';

function MetricCard({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="panel" style={{ padding: 16, minHeight: 110, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 'var(--r-lg)' }}>
      <div className="flex justify-between items-center">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--fg-faint)' }}>{label}</span>
        <Icon className="w-3.5 h-3.5" style={{ color: 'var(--fg-faint)' }} />
      </div>
      <div style={{ marginTop: 10 }}>{children}</div>
    </div>
  );
}

export default function MetricsPanel() {
  const { currentExecution, isExecuting } = useWorkflowStore();

  const status = currentExecution?.workflow_status || 'idle';
  const sc = statusConfig(status);
  const category = currentExecution?.category || null;
  const categoryConf = currentExecution?.category_confidence || 0;
  const responseConf = currentExecution?.response_confidence || 0;
  const logSteps = currentExecution?.workflow_logs.length || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {/* Workflow Status */}
      <MetricCard label="Workflow Status" icon={Zap}>
        {isExecuting ? (
          <div className="flex items-center gap-2" style={{ color: 'var(--accent-bright)', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700 }}>
            <RefreshCw className="w-3.5 h-3.5 spin" />
            <span>EXECUTING…</span>
          </div>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 rounded-full uppercase"
            style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '.06em', padding: '5px 12px',
              color: sc.color,
              background: `color-mix(in oklab, ${sc.color} 12%, transparent)`,
              border: `1px solid color-mix(in oklab, ${sc.color} 28%, transparent)`,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 99, background: sc.color }} />
            {sc.text}
          </span>
        )}
      </MetricCard>

      {/* Classified Category */}
      <MetricCard label="Classified Category" icon={Tag}>
        {category ? (
          <div>
            <span className="block truncate uppercase" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.02em', color: 'var(--fg)' }}>
              {category.replace(/_/g, ' ')}
            </span>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,.06)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${categoryConf * 100}%`, background: 'var(--accent)', borderRadius: 99, transition: 'width 1s var(--ease)' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--accent-bright)' }}>
                {Math.round(categoryConf * 100)}%
              </span>
            </div>
          </div>
        ) : (
          <span style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--fg-ghost)' }}>Unclassified</span>
        )}
      </MetricCard>

      {/* Draft Confidence */}
      <MetricCard label="Draft Confidence" icon={BarChart2}>
        {responseConf > 0 ? (
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: confColor(responseConf) }}>
              {Math.round(responseConf * 100)}%
            </span>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,.06)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${responseConf * 100}%`, background: confColor(responseConf), borderRadius: 99, transition: 'width 1s var(--ease)', boxShadow: `0 0 12px -2px ${confColor(responseConf)}` }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-faint)' }}>
                {responseConf >= 0.75 ? 'TRUSTED' : 'LOW CONF'}
              </span>
            </div>
          </div>
        ) : (
          <span style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--fg-ghost)' }}>No confidence score</span>
        )}
      </MetricCard>

      {/* Orchestration Steps */}
      <MetricCard label="Orchestration Steps" icon={Layers}>
        <div className="flex items-baseline gap-1.5">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--fg)' }}>{logSteps}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-faint)' }}>Logs Recorded</span>
        </div>
      </MetricCard>
    </div>
  );
}
