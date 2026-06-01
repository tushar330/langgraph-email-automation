'use client';

import React from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { Mail, ArrowRight, Loader2, RefreshCw, WifiOff } from 'lucide-react';
import { Chip } from '@/lib/uiHooks';

/* tone dot colors per email category (decorative, not status) */
function getCategoryTheme(id: string) {
  switch (id) {
    case 'mock-1': return { tone: 'var(--ok)', name: 'Product Inquiry' };
    case 'mock-2': return { tone: 'var(--accent)', name: 'Refund Request' };
    case 'mock-3': return { tone: 'var(--info)', name: 'Tech Support' };
    case 'mock-4': return { tone: 'var(--bad)', name: 'Furious Feedback' };
    case 'mock-5': return { tone: 'var(--warn)', name: 'Internship Inquiry' };
    case 'mock-6': return { tone: 'var(--fg-faint)', name: 'Unsolicited / Spam' };
    default: return { tone: 'var(--accent)', name: 'Email Inquiry' };
  }
}

export default function EmailSelector() {
  const { simulationEmails, selectedEmailId, setSelectedEmailId, isLoadingEmails, backendWaking, error, fetchEmails, isExecuting } = useWorkflowStore();

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--line)', background: 'rgba(255,255,255,.02)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Mail className="w-[15px] h-[15px]" style={{ color: 'var(--accent-bright)' }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Select inbound email</span>
        </div>
        <Chip color="var(--fg-dim)" tone={0.08}>{simulationEmails.length} avail</Chip>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 9, minHeight: 0 }}>

        {/* Backend waking up */}
        {backendWaking && (
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
            <Loader2 className="w-5 h-5 spin" style={{ color: 'var(--accent-bright)' }} />
            <div>
              <p style={{ fontSize: 12, fontWeight: 600 }}>Waking up backend…</p>
              <p style={{ fontSize: 10, color: 'var(--fg-faint)', marginTop: 4, lineHeight: 1.5 }}>
                Render free tier sleeps after inactivity.<br />This takes ~20 seconds on first load.
              </p>
            </div>
            <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,.06)', borderRadius: 99, overflow: 'hidden', marginTop: 4 }}>
              <div className="animate-pulse" style={{ height: '100%', width: '75%', background: 'color-mix(in oklab, var(--accent) 60%, transparent)', borderRadius: 99 }} />
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {isLoadingEmails && !backendWaking && [1, 2, 3].map((i) => (
          <div key={i} style={{ padding: 12, borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: 'var(--ink-850)', display: 'flex', gap: 12 }}>
            <div className="skel" style={{ width: 9, height: 9, borderRadius: 99, marginTop: 4 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="skel" style={{ height: 10, width: '75%' }} />
              <div className="skel" style={{ height: 8, width: '100%' }} />
              <div className="skel" style={{ height: 8, width: '60%' }} />
            </div>
          </div>
        ))}

        {/* Error + retry */}
        {error && !isLoadingEmails && simulationEmails.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
            <WifiOff className="w-5 h-5" style={{ color: 'var(--bad)' }} />
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--bad)' }}>Could not reach backend</p>
              <p style={{ fontSize: 10, color: 'var(--fg-faint)', marginTop: 4 }}>The server may still be starting up.</p>
            </div>
            <button
              onClick={fetchEmails}
              className="focus-ring"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 'var(--r-sm)', background: 'rgba(255,255,255,.05)', border: '1px solid var(--line-2)', fontSize: 12, color: 'var(--fg-dim)' }}
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Email list */}
        {!isLoadingEmails && simulationEmails.map((email) => {
          const on = selectedEmailId === email.id;
          const theme = getCategoryTheme(email.id);
          return (
            <button
              key={email.id}
              disabled={isExecuting}
              onClick={() => setSelectedEmailId(email.id)}
              className="focus-ring"
              style={{
                textAlign: 'left', display: 'flex', gap: 12, padding: 12, borderRadius: 'var(--r-sm)',
                border: `1px solid ${on ? 'var(--accent-line)' : 'var(--line)'}`,
                background: on ? 'color-mix(in oklab, var(--accent) 8%, transparent)' : 'var(--ink-850)',
                cursor: isExecuting ? 'not-allowed' : 'pointer',
                opacity: isExecuting && !on ? 0.5 : 1,
                transition: 'all .25s var(--ease)',
              }}
            >
              <span style={{ marginTop: 4, width: 9, height: 9, borderRadius: 99, background: theme.tone, boxShadow: `0 0 0 4px color-mix(in oklab, ${theme.tone} 16%, transparent)`, flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email.sender}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--fg-faint)', flexShrink: 0 }}>{theme.name}</span>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 3, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email.subject}</div>
                <p style={{ fontSize: 11, color: 'var(--fg-faint)', marginTop: 4, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{email.body}</p>
              </div>
              <span style={{ alignSelf: 'center', width: 26, height: 26, borderRadius: 7, display: 'grid', placeItems: 'center', flexShrink: 0, background: on ? 'color-mix(in oklab, var(--accent) 14%, transparent)' : 'transparent', border: `1px solid ${on ? 'var(--accent-line)' : 'transparent'}`, color: on ? 'var(--accent-bright)' : 'var(--fg-ghost)', opacity: on ? 1 : 0, transition: 'all .25s' }}>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
