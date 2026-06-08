/* simulation.jsx — PageHeader, EmailSelector, SimulationControls, SimulationPage */
const { useState: useStateS } = React;

function PageShell({ children }) {
  return (
    <div style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto',
      padding: 'clamp(20px,3vw,30px) clamp(16px,4vw,40px) 56px', display: 'flex', flexDirection: 'column', gap: 22,
      animation: 'a-rise .55s var(--ease) both' }}>
      {children}
    </div>
  );
}

function PageHeader({ kicker, kickerIcon, title, sub, right, pulse }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'flex-end',
      paddingBottom: 20, borderBottom: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 620 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {kickerIcon ? <Icon name={kickerIcon} size={14} style={{ color: 'var(--accent-bright)' }} />
            : <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)', animation: pulse ? 'a-pulse 1.6s infinite' : 'none' }} />}
          <span className="kicker">{kicker}</span>
        </div>
        <h1 style={{ fontSize: 'clamp(22px,2.6vw,30px)', fontWeight: 600, letterSpacing: '-0.02em' }}>{title}</h1>
        <p style={{ marginTop: 7, fontSize: 13.5, lineHeight: 1.55, color: 'var(--fg-dim)' }}>{sub}</p>
      </div>
      {right}
    </div>
  );
}

function InfoTip({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 'var(--r)',
      background: 'rgba(255,255,255,.03)', border: '1px solid var(--line)', maxWidth: 340, fontSize: 11.5, lineHeight: 1.5, color: 'var(--fg-dim)' }}>
      <Icon name="info" size={16} style={{ color: 'var(--accent-bright)', flexShrink: 0 }} />
      <span>{children}</span>
    </div>
  );
}

function EmailSelector() {
  const emails = useStore(s => s.emails);
  const selectedId = useStore(s => s.selectedEmailId);
  const isExec = useStore(s => s.isExecuting);
  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--line)', background: 'rgba(255,255,255,.02)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Icon name="mail" size={15} style={{ color: 'var(--accent-bright)' }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Select inbound email</span>
        </div>
        <Chip color="var(--fg-dim)" tone={0.08}>{emails.length} avail</Chip>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 9, minHeight: 0 }}>
        {emails.map(email => {
          const on = selectedId === email.id;
          return (
            <button key={email.id} disabled={isExec} onClick={() => actions.setSelectedEmail(email.id)} className="focus-ring"
              style={{ textAlign: 'left', display: 'flex', gap: 12, padding: 12, borderRadius: 'var(--r-sm)',
                border: `1px solid ${on ? 'var(--accent-line)' : 'var(--line)'}`,
                background: on ? 'color-mix(in oklab, var(--accent) 8%, transparent)' : 'var(--ink-850)',
                cursor: isExec ? 'not-allowed' : 'pointer', opacity: isExec && !on ? .5 : 1,
                transition: 'all .25s var(--ease)' }}
              onMouseEnter={e => { if (!on && !isExec) e.currentTarget.style.borderColor = 'var(--line-strong)'; }}
              onMouseLeave={e => { if (!on) e.currentTarget.style.borderColor = 'var(--line)'; }}>
              <span style={{ marginTop: 4, width: 9, height: 9, borderRadius: 99, background: email.tone, boxShadow: `0 0 0 4px color-mix(in oklab, ${email.tone} 16%, transparent)`, flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email.sender}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--fg-faint)', flexShrink: 0 }}>{email.kind}</span>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 3, color: on ? 'var(--fg)' : 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email.subject}</div>
                <p style={{ fontSize: 11, color: 'var(--fg-faint)', marginTop: 4, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{email.body}</p>
              </div>
              <span style={{ alignSelf: 'center', width: 26, height: 26, borderRadius: 7, display: 'grid', placeItems: 'center', flexShrink: 0,
                background: on ? 'color-mix(in oklab, var(--accent) 14%, transparent)' : 'transparent',
                border: `1px solid ${on ? 'var(--accent-line)' : 'transparent'}`, color: on ? 'var(--accent-bright)' : 'var(--fg-ghost)', opacity: on ? 1 : 0, transition: 'all .25s' }}>
                <Icon name="arrowRight" size={14} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SimulationControls() {
  const emails = useStore(s => s.emails);
  const selectedId = useStore(s => s.selectedEmailId);
  const isExec = useStore(s => s.isExecuting);
  const force = useStore(s => s.forceReview);
  const email = emails.find(e => e.id === selectedId);
  if (!email) return null;

  return (
    <div className="panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span className="kicker">Email preview</span>
          <Chip color="var(--fg-dim)" tone={0.08}>id · {email.id}</Chip>
        </div>
        <div style={{ borderRadius: 'var(--r)', border: '1px solid var(--line)', background: 'var(--ink-850)', padding: 16 }}>
          {[['From', email.sender], ['Subject', email.subject]].map(([k,v]) =>
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '64px 1fr', fontSize: 12.5, paddingBottom: 9, marginBottom: 9, borderBottom: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--fg-faint)' }}>{k}</span>
              <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v}</span>
            </div>)}
          <p style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--fg-dim)', whiteSpace: 'pre-line', maxHeight: 150, overflowY: 'auto' }}>{email.body}</p>
        </div>
      </div>

      <div>
        <span className="kicker" style={{ display: 'block', marginBottom: 12 }}>Simulation settings</span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: 15, borderRadius: 'var(--r)', border: '1px solid var(--line)', background: 'var(--ink-850)' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Force human review</div>
            <div style={{ fontSize: 11.5, color: 'var(--fg-faint)', marginTop: 3, lineHeight: 1.45, maxWidth: 280 }}>Fails the confidence gate so the draft always routes to the operator board.</div>
          </div>
          <button onClick={() => actions.setForceReview(!force)} disabled={isExec} className="focus-ring"
            aria-pressed={force} style={{ width: 50, height: 28, borderRadius: 99, flexShrink: 0, position: 'relative',
              border: '1px solid', borderColor: force ? 'var(--accent-line)' : 'var(--line-2)',
              background: force ? 'color-mix(in oklab, var(--accent) 28%, transparent)' : 'rgba(255,255,255,.05)', transition: 'all .3s var(--ease)' }}>
            <span style={{ position: 'absolute', top: 2, left: force ? 24 : 2, width: 22, height: 22, borderRadius: 99,
              background: force ? 'var(--accent)' : 'var(--fg-faint)', transition: 'all .3s var(--ease)', boxShadow: '0 2px 6px rgba(0,0,0,.4)' }} />
          </button>
        </div>
      </div>

      <button className="btn btn-primary" disabled={isExec} onClick={() => actions.runSimulation(selectedId, force)}
        style={{ width: '100%', padding: 16, opacity: isExec ? .7 : 1 }}>
        {isExec ? <><Icon name="refresh" size={16} className="spin" /> Running AI agents…</>
                : <><Icon name="play" size={15} fill="currentColor" stroke={0} /> Execute agent workflow</>}
      </button>
    </div>
  );
}

function SimulationPage() {
  const isExec = useStore(s => s.isExecuting);
  return (
    <PageShell>
      <PageHeader pulse kicker="Sandbox simulation env" title="Agent Execution Board"
        sub="Select a custom inbound email to trigger the multi-stage LangGraph workflow. Watch state transitions stream in real time."
        right={<InfoTip>Toggle <strong style={{ color: 'var(--fg)' }}>Force Human Review</strong> to test the operator override path.</InfoTip>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,340px) minmax(0,1fr)', gap: 20, alignItems: 'start' }} className="sim-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ height: 300 }}><EmailSelector /></div>
          <SimulationControls />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          <MetricsPanel />
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,330px)', gap: 20 }} className="sim-canvas-grid">
            <div className="panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--line)', background: 'rgba(255,255,255,.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <Icon name="play" size={14} style={{ color: 'var(--accent-bright)' }} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Orchestration Graph</span>
                </div>
                {isExec && <Chip color="var(--accent-bright)" tone={0.12}>active</Chip>}
              </div>
              <div style={{ flex: 1 }}><WorkflowGraph /></div>
            </div>
            <div style={{ minHeight: 460 }}><LogsTimeline /></div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

Object.assign(window, { PageShell, PageHeader, InfoTip, SimulationPage });
