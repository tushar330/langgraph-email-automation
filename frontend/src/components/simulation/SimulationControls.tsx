'use client';

import React, { useState } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { Play, RefreshCw } from 'lucide-react';
import { Chip } from '@/lib/uiHooks';

export default function SimulationControls() {
  const { simulationEmails, selectedEmailId, runSimulation, isExecuting } = useWorkflowStore();
  const [forceReview, setForceReview] = useState(false);

  const email = simulationEmails.find((e) => e.id === selectedEmailId);

  const handleRun = async () => {
    if (!selectedEmailId) return;
    try {
      await runSimulation(selectedEmailId, forceReview);
    } catch (e) {
      console.error(e);
    }
  };

  if (!email) {
    return (
      <div className="panel" style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-faint)', fontSize: 13 }}>
        Select an email from the left panel to begin.
      </div>
    );
  }

  return (
    <div className="panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Email preview */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span className="kicker">Email preview</span>
          <Chip color="var(--fg-dim)" tone={0.08}>id · {email.id}</Chip>
        </div>
        <div style={{ borderRadius: 'var(--r)', border: '1px solid var(--line)', background: 'var(--ink-850)', padding: 16 }}>
          {([['From', email.sender], ['Subject', email.subject]] as const).map(([k, v]) => (
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '64px 1fr', fontSize: 12.5, paddingBottom: 9, marginBottom: 9, borderBottom: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--fg-faint)' }}>{k}</span>
              <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v}</span>
            </div>
          ))}
          <p style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--fg-dim)', whiteSpace: 'pre-line', maxHeight: 150, overflowY: 'auto' }}>{email.body}</p>
        </div>
      </div>

      {/* Settings */}
      <div>
        <span className="kicker" style={{ display: 'block', marginBottom: 12 }}>Simulation settings</span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: 15, borderRadius: 'var(--r)', border: '1px solid var(--line)', background: 'var(--ink-850)' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Human review</div>
            <div style={{ fontSize: 11.5, color: 'var(--fg-faint)', marginTop: 3, lineHeight: 1.45, maxWidth: 280 }}>Fails the confidence gate so the draft always routes to the operator board.</div>
          </div>
          <button
            onClick={() => setForceReview(!forceReview)}
            disabled={isExecuting}
            className="focus-ring"
            aria-pressed={forceReview}
            aria-label="Human review"
            style={{
              width: 50, height: 28, borderRadius: 99, flexShrink: 0, position: 'relative',
              border: '1px solid', borderColor: forceReview ? 'var(--accent-line)' : 'var(--line-2)',
              background: forceReview ? 'color-mix(in oklab, var(--accent) 28%, transparent)' : 'rgba(255,255,255,.05)',
              transition: 'all .3s var(--ease)', opacity: isExecuting ? 0.5 : 1, cursor: isExecuting ? 'not-allowed' : 'pointer',
            }}
          >
            <span style={{ position: 'absolute', top: 2, left: forceReview ? 24 : 2, width: 22, height: 22, borderRadius: 99, background: forceReview ? 'var(--accent)' : 'var(--fg-faint)', transition: 'all .3s var(--ease)', boxShadow: '0 2px 6px rgba(0,0,0,.4)' }} />
          </button>
        </div>
      </div>

      {/* Execute */}
      <button
        onClick={handleRun}
        disabled={isExecuting}
        className="btn-iris-primary focus-ring"
        style={{ width: '100%', padding: 16, opacity: isExecuting ? 0.7 : 1, cursor: isExecuting ? 'not-allowed' : 'pointer' }}
      >
        {isExecuting ? (
          <><RefreshCw className="w-4 h-4 spin" /> Running AI agents…</>
        ) : (
          <><Play className="w-[15px] h-[15px]" fill="currentColor" strokeWidth={0} /> Execute agent workflow</>
        )}
      </button>
    </div>
  );
}
