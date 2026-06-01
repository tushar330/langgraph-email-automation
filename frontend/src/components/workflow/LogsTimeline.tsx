'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { motion } from 'framer-motion';
import { Terminal, Clock, ChevronRight, ChevronDown, RefreshCw, Info } from 'lucide-react';
import { Chip } from '@/lib/uiHooks';

function formatStepName(step: string) {
  return step.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return '';
  }
}

export default function LogsTimeline() {
  const { currentExecution, isExecuting } = useWorkflowStore();
  const [expandedLogIndex, setExpandedLogIndex] = useState<number | null>(null);
  const logs = currentExecution?.workflow_logs || [];
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs.length]);

  const toggleExpand = (index: number) => setExpandedLogIndex(expandedLogIndex === index ? null : index);

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--line)', background: 'rgba(255,255,255,.02)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Terminal className="w-[15px] h-[15px]" style={{ color: 'var(--accent-bright)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.02em' }}>Observability Logs</span>
        </div>
        {logs.length > 0 && <Chip color="var(--fg-dim)" tone={0.08}>{logs.length} events</Chip>}
      </div>

      {/* Scroll area */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 16, minHeight: 0 }}>
        {logs.length === 0 ? (
          <div style={{ height: '100%', minHeight: 220, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
            {isExecuting ? (
              <div>
                <RefreshCw className="w-7 h-7 spin" style={{ color: 'var(--accent-bright)', margin: '0 auto 12px' }} />
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>Executing workflow</div>
                <div style={{ fontSize: 11, color: 'var(--fg-faint)', marginTop: 4 }}>Spinning up agents &amp; retrieving context…</div>
              </div>
            ) : (
              <div>
                <Terminal className="w-7 h-7" style={{ color: 'var(--fg-ghost)', margin: '0 auto 12px' }} />
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--fg-dim)' }}>No logs yet</div>
                <div style={{ fontSize: 11, color: 'var(--fg-faint)', marginTop: 4, maxWidth: 220 }}>Run a simulation to inspect the execution trace.</div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ position: 'absolute', left: 9, top: 8, bottom: 8, width: 1, background: 'var(--line)' }} />
            {logs.map((log, index) => {
              const isExpanded = expandedLogIndex === index;
              const hasDetails = log.details && Object.keys(log.details).length > 0;
              const dot = log.status === 'completed' ? 'var(--ok)' : log.status === 'failed' ? 'var(--bad)' : log.status === 'running' ? 'var(--accent)' : 'var(--fg-faint)';

              return (
                <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.04 }} style={{ position: 'relative', paddingLeft: 26 }}>
                  <span style={{ position: 'absolute', left: 6, top: 6, width: 8, height: 8, borderRadius: 99, background: dot, boxShadow: `0 0 0 4px color-mix(in oklab, ${dot} 18%, transparent)`, zIndex: 2, animation: log.status === 'running' ? 'a-pulse 1.2s infinite' : 'none' }} />
                  <div style={{ background: 'var(--ink-800)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: 11 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 12.5, fontWeight: 600 }}>{formatStepName(log.step)}</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 8.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-ghost)' }}>
                            <Clock className="w-2.5 h-2.5" /> {formatTime(log.timestamp)}
                          </span>
                        </div>
                        <p style={{ marginTop: 5, fontSize: 11.5, lineHeight: 1.5, color: 'var(--fg-dim)' }}>{log.message}</p>
                      </div>
                      {hasDetails && (
                        <button onClick={() => toggleExpand(index)} className="focus-ring" style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 7, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.05)', border: '1px solid var(--line)', color: 'var(--fg-dim)' }}>
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                    {isExpanded && hasDetails && (
                      <div style={{ marginTop: 11, paddingTop: 11, borderTop: '1px solid var(--line)', animation: 'a-fade .3s ease both' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent-bright)', fontWeight: 700, marginBottom: 8 }}>
                          <Info className="w-3 h-3" /> Execution metadata
                        </div>
                        <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 10.5, lineHeight: 1.55, background: 'var(--ink-900)', padding: 11, borderRadius: 8, border: '1px solid var(--line)', color: 'var(--fg-dim)', overflowX: 'auto' }}>
{JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
