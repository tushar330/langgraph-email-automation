/* review.jsx — Human Review board */
const { useState: useStateR, useEffect: useEffectR } = React;

function ReviewEmpty() {
  return (
    <div className="panel" style={{ minHeight: 420, display: 'grid', placeItems: 'center', textAlign: 'center', padding: 32 }}>
      <div style={{ maxWidth: 420 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 20px',
          background: 'color-mix(in oklab, var(--ok) 8%, transparent)', border: '1px solid color-mix(in oklab, var(--ok) 25%, transparent)' }}>
          <Icon name="shieldCheck" size={28} style={{ color: 'var(--ok)' }} />
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 600 }}>Queue is clear</h3>
        <p style={{ fontSize: 13.5, color: 'var(--fg-dim)', marginTop: 10, lineHeight: 1.6 }}>
          All workflows have been routed or auto-approved. Run a simulation with <strong style={{ color: 'var(--accent-bright)' }}>Force Human Review</strong> on to pause one here.
        </p>
        <button className="btn btn-ghost" style={{ marginTop: 22 }} onClick={() => actions.go('simulation')}>
          <Icon name="play" size={14} /> Go to simulation
        </button>
      </div>
    </div>
  );
}

function MiniMetric({ label, value, color }) {
  return (
    <div style={{ borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: 'var(--ink-850)', padding: 12 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg-faint)', fontWeight: 600 }}>{label}</div>
      <div style={{ marginTop: 7, fontSize: 13, fontWeight: 600, color: color || 'var(--fg)', textTransform: 'capitalize', fontFamily: color ? 'var(--mono)' : 'var(--sans)' }}>{value}</div>
    </div>
  );
}

function ReviewForm() {
  const paused = useStore(s => s.pausedExecutions);
  const keys = Object.keys(paused);
  const [activeId, setActiveId] = useStateR(keys[0] || null);
  const [draft, setDraft] = useStateR('');
  const [editing, setEditing] = useStateR(false);
  const [flash, setFlash] = useStateR(null);

  const current = activeId && paused[activeId] ? paused[activeId] : (keys[0] ? paused[keys[0]] : null);

  useEffectR(() => {
    if (current) { setDraft(current.generated_response || ''); setActiveId(current.id); setEditing(false); }
  }, [current?.id]);

  if (keys.length === 0 || !current) return <ReviewEmpty />;

  const decide = (ok) => {
    setFlash(ok ? 'approved' : 'rejected');
    setTimeout(() => { ok ? actions.approve(current.id, draft) : actions.reject(current.id); setFlash(null); }, 650);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,260px) minmax(0,1fr)', gap: 20, alignItems: 'start' }} className="review-grid">
      {/* queue */}
      <div className="panel" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--fg-faint)', fontWeight: 600, paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
          Pending audit queue ({keys.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
          {keys.map(k => {
            const it = paused[k];
            const on = current.id === it.id;
            return (
              <button key={k} onClick={() => setActiveId(it.id)} className="focus-ring"
                style={{ textAlign: 'left', padding: 12, borderRadius: 'var(--r-sm)',
                  border: `1px solid ${on ? 'var(--accent-line)' : 'var(--line)'}`,
                  background: on ? 'color-mix(in oklab, var(--accent) 8%, transparent)' : 'var(--ink-850)', transition: 'all .25s' }}>
                <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.email.sender}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-faint)', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.email.subject}</div>
                <div style={{ marginTop: 8 }}><Chip color="var(--warn)" tone={0.1}>{it.category.replace(/_/g,' ')}</Chip></div>
              </button>
            );
          })}
        </div>
      </div>

      {/* work area */}
      <div className="panel" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', overflow: 'hidden' }}>
        {flash && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'grid', placeItems: 'center', animation: 'a-fade .2s ease',
            background: 'color-mix(in oklab, var(--ink-900) 75%, transparent)', backdropFilter: 'blur(4px)' }}>
            <div style={{ textAlign: 'center', animation: 'a-pop .35s var(--ease)' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 12px',
                background: `color-mix(in oklab, ${flash === 'approved' ? 'var(--ok)' : 'var(--bad)'} 16%, transparent)`,
                border: `1px solid ${flash === 'approved' ? 'var(--ok)' : 'var(--bad)'}` }}>
                <Icon name={flash === 'approved' ? 'checkCircle' : 'xCircle'} size={28} style={{ color: flash === 'approved' ? 'var(--ok)' : 'var(--bad)' }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{flash === 'approved' ? 'Dispatched via Gmail' : 'Draft discarded'}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
          <div>
            <span className="kicker">Human-in-the-loop gateway</span>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 6 }}>Reviewing reply for {current.email.sender}</h3>
            <p style={{ fontSize: 12, color: 'var(--fg-faint)', marginTop: 4 }}>Subject · {current.email.subject}</p>
          </div>
          <Chip color="var(--warn)" tone={0.12} style={{ flexShrink: 0 }}>Awaiting approval</Chip>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12 }}>
          <MiniMetric label="Classification" value={current.category.replace(/_/g,' ')} />
          <MiniMetric label="Classifier conf" value={`${Math.round(current.category_confidence*100)}%`} color="var(--accent-bright)" />
          <MiniMetric label="Draft conf" value={`${Math.round(current.response_confidence*100)}%`} color={confColor(current.response_confidence)} />
        </div>

        <div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg-faint)', fontWeight: 600 }}>Inbound message</span>
          <div style={{ marginTop: 8, padding: 14, borderRadius: 'var(--r)', border: '1px solid var(--line)', background: 'var(--ink-850)', fontSize: 12.5, lineHeight: 1.6, color: 'var(--fg-dim)', maxHeight: 110, overflowY: 'auto' }}>
            {current.email.body}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg-faint)', fontWeight: 600 }}>
              <Icon name="edit" size={13} style={{ color: 'var(--accent-bright)' }} /> AI generated draft
            </span>
            <button onClick={() => setEditing(e => !e)} className="focus-ring"
              style={{ fontFamily: 'var(--mono)', fontSize: 10.5, padding: '5px 11px', borderRadius: 7, background: 'rgba(255,255,255,.05)', border: '1px solid var(--line)', color: 'var(--fg-dim)' }}>
              {editing ? 'Preview mode' : 'Edit response'}
            </button>
          </div>
          {editing ? (
            <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={9} className="focus-ring"
              style={{ width: '100%', resize: 'vertical', background: 'var(--ink-900)', border: '1px solid var(--accent-line)', borderRadius: 'var(--r)',
                padding: 15, fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.6, color: 'var(--fg)', outline: 'none', boxSizing: 'border-box' }} />
          ) : (
            <div style={{ padding: 15, borderRadius: 'var(--r)', border: '1px solid var(--line)', background: 'var(--ink-850)', fontSize: 13, lineHeight: 1.65, color: 'var(--fg-dim)', whiteSpace: 'pre-line', maxHeight: 230, overflowY: 'auto' }}>{draft}</div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 14, paddingTop: 4 }} className="review-actions">
          <button onClick={() => decide(false)} className="btn" style={{ flex: 1, background: 'color-mix(in oklab, var(--bad) 8%, transparent)', border: '1px solid color-mix(in oklab, var(--bad) 28%, transparent)', color: 'var(--bad)' }}>
            <Icon name="xCircle" size={16} /> Discard draft
          </button>
          <button onClick={() => decide(true)} className="btn btn-primary" style={{ flex: 1 }}>
            <Icon name="checkCircle" size={16} /> Approve & dispatch
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewPage() {
  const count = useStore(s => Object.keys(s.pausedExecutions).length);
  return (
    <PageShell>
      <PageHeader kickerIcon="shieldCheck" kicker="Operational compliance overrides" title="Human Review Board"
        sub="Audit queued AI replies that failed confidence checks or were flagged for manual dispatch."
        right={<InfoTip>You can edit the draft directly before clicking <strong style={{ color: 'var(--fg)' }}>Approve &amp; Dispatch</strong>.</InfoTip>} />
      <ReviewForm />
    </PageShell>
  );
}

window.ReviewPage = ReviewPage;
