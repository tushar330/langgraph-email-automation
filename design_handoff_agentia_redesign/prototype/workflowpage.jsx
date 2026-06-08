/* workflowpage.jsx — Live Workflow / observability console */
function LegendDot({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: 99, background: `color-mix(in oklab, ${color} 30%, transparent)`, border: `1px solid ${color}` }} />
      <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-faint)' }}>{label}</span>
    </div>
  );
}

function WorkflowPage() {
  const exec = useStore(s => s.currentExecution);
  const isExec = useStore(s => s.isExecuting);
  const needsReview = exec?.workflow_status === 'needs_review';

  return (
    <PageShell>
      <PageHeader pulse kicker="Real-time orchestration engine" title="System Observability Console"
        sub="Visual execution trace of the active LangGraph workflow. Expand any log to inspect raw model output."
        right={needsReview ? (
          <button className="btn" onClick={() => actions.go('review')}
            style={{ background: 'color-mix(in oklab, var(--warn) 12%, transparent)', border: '1px solid var(--warn)', color: 'var(--warn)', animation: 'a-pulse 2s infinite' }}>
            <Icon name="shieldAlert" size={15} /> Paused · review draft
          </button>
        ) : null} />

      {exec && <MetricsPanel />}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,360px)', gap: 20, alignItems: 'stretch' }} className="wf-grid">
        <div className="panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 540 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--line)', background: 'rgba(255,255,255,.02)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ position: 'relative', display: 'inline-flex', width: 9, height: 9 }}>
                {isExec && <span className="ping" style={{ position: 'absolute', inset: 0, color: 'var(--accent)', borderRadius: 99 }} />}
                <span style={{ position: 'relative', width: 9, height: 9, borderRadius: 99, background: isExec ? 'var(--accent)' : 'var(--fg-faint)' }} />
              </span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>React-Flow Schematic Canvas</span>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <LegendDot color="var(--ok)" label="completed" />
              <LegendDot color="var(--accent)" label="running" />
              <LegendDot color="var(--fg-faint)" label="pending" />
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}><WorkflowGraph /></div>
        </div>
        <div style={{ minHeight: 540 }}><LogsTimeline /></div>
      </div>
    </PageShell>
  );
}

window.WorkflowPage = WorkflowPage;
