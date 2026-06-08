/* graph.jsx — WorkflowGraph (React-Flow-like), MetricsPanel, LogsTimeline */
const { useState: useStateG, useEffect: useEffectG, useRef: useRefG } = React;

/* fit a fixed canvas into its parent width */
function useFitScale(baseW, baseH) {
  const ref = useRefG(null);
  const [scale, setScale] = useStateG(1);
  useEffectG(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      setScale(Math.min(1, w / baseW));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [baseW]);
  return { ref, scale };
}

function nodeVisual(status) {
  switch (status) {
    case 'completed': return { border: 'var(--ok)', glow: 'var(--ok-rgb)', icon: 'var(--ok)', bg: 'color-mix(in oklab, var(--ok) 9%, var(--ink-800))' };
    case 'running':   return { border: 'var(--accent)', glow: 'var(--accent-rgb)', icon: 'var(--accent-bright)', bg: 'color-mix(in oklab, var(--accent) 11%, var(--ink-800))' };
    case 'failed':    return { border: 'var(--bad)', glow: 'var(--bad-rgb)', icon: 'var(--bad)', bg: 'color-mix(in oklab, var(--bad) 9%, var(--ink-800))' };
    default:          return { border: 'var(--line-2)', glow: '0,0,0', icon: 'var(--fg-faint)', bg: 'var(--ink-800)' };
  }
}

function GraphNode({ node, status, confidence }) {
  const v = nodeVisual(status);
  return (
    <div style={{ position: 'absolute', left: node.x, top: node.y, width: NW, height: NH,
      borderRadius: 'var(--r-sm)', border: `1px solid ${v.border}`, background: v.bg,
      backdropFilter: 'blur(8px)', padding: 11, boxSizing: 'border-box',
      boxShadow: status !== 'pending' ? `0 0 22px -6px rgba(${v.glow}, .5)` : 'var(--e1)',
      transition: 'all .5s var(--ease)' }}>
      {status === 'running' && (
        <span style={{ position: 'absolute', top: 9, right: 9, display: 'inline-flex', width: 8, height: 8 }}>
          <span className="ping" style={{ position: 'absolute', inset: 0, color: 'var(--accent)', borderRadius: 99 }} />
          <span style={{ position: 'relative', width: 8, height: 8, borderRadius: 99, background: 'var(--accent)' }} />
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center', flexShrink: 0,
          background: status === 'pending' ? 'rgba(255,255,255,.05)' : `color-mix(in oklab, ${v.icon} 16%, transparent)`, color: v.icon, transition: 'all .5s var(--ease)' }}>
          <Icon name={node.icon} size={15} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.label}</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--fg-faint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.sub}</div>
        </div>
        {confidence != null && status === 'completed' && (
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, color: confColor(confidence) }}>{Math.round(confidence*100)}%</span>
        )}
      </div>
    </div>
  );
}

function WorkflowGraph() {
  const exec = useStore(s => s.currentExecution);
  const isExec = useStore(s => s.isExecuting);
  const { ref, scale } = useFitScale(720, 600);
  const nodeStatus = exec?.nodeStatus || {};

  const edgeState = (e) => {
    const sf = nodeStatus[e.from], st = nodeStatus[e.to];
    if (!sf || !st) return 'idle';
    if ((sf === 'completed' || sf === 'failed') && st === 'running') return 'active';
    if (sf && st) return 'done';
    return 'idle';
  };

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', height: 600 * scale, overflow: 'hidden' }}>
      {/* subtle dotted backdrop */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px)', backgroundSize: '22px 22px', opacity: .6 }} />
      <div style={{ position: 'absolute', top: 0, left: '50%', width: 720, height: 600, transform: `translateX(-50%) scale(${scale})`, transformOrigin: 'top center' }}>
        {/* edges */}
        <svg width="720" height="600" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M1,1 L6,4 L1,7" fill="none" stroke="context-stroke" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>
          {EDGES.map(e => {
            const st = edgeState(e);
            const stroke = st === 'active' ? 'var(--accent)' : st === 'done' ? 'var(--ok)' : 'var(--line-2)';
            const mid = edgeMid(e);
            return (
              <g key={e.id}>
                <path d={edgePath(e)} fill="none" stroke={stroke}
                  strokeWidth={st === 'active' ? 2.4 : st === 'done' ? 2 : 1.4}
                  strokeDasharray={st === 'active' ? '6 6' : 'none'}
                  style={st === 'active' ? { animation: 'a-flow .8s linear infinite' } : {}}
                  markerEnd="url(#arrow)" opacity={st === 'idle' ? .5 : 1} />
                {e.label && (
                  <g transform={`translate(${mid.x}, ${mid.y})`}>
                    <rect x="-26" y="-9" width="52" height="18" rx="5" fill="var(--ink-850)" stroke="var(--line)" />
                    <text x="0" y="3.5" textAnchor="middle" fontSize="8.5" fontFamily="var(--mono)" letterSpacing="0.5"
                      fill={st === 'active' ? 'var(--accent-bright)' : 'var(--fg-faint)'}>{e.label}</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
        {/* nodes */}
        {NODES.map(n => (
          <GraphNode key={n.id} node={n} status={nodeStatus[n.id] || 'pending'}
            confidence={n.id === 'classify' ? exec?.category_confidence : (n.id === 'proof' ? exec?.response_confidence : null)} />
        ))}
      </div>

      {/* empty hint */}
      {!exec && !isExec && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
          <div style={{ textAlign: 'center', color: 'var(--fg-faint)' }}>
            <Icon name="activity" size={30} style={{ color: 'var(--fg-ghost)', margin: '0 auto 10px' }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-dim)' }}>Graph idle</div>
            <div style={{ fontSize: 11.5, marginTop: 4 }}>Run a simulation to trace the execution path.</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Metrics ------------------------------- */
function MetricCard({ label, icon, children }) {
  return (
    <div className="panel" style={{ padding: 16, minHeight: 108, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '.13em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--fg-faint)' }}>{label}</span>
        <Icon name={icon} size={14} style={{ color: 'var(--fg-ghost)' }} />
      </div>
      <div style={{ marginTop: 10 }}>{children}</div>
    </div>
  );
}

function MetricsPanel() {
  const exec = useStore(s => s.currentExecution);
  const isExec = useStore(s => s.isExecuting);
  const status = exec?.workflow_status || 'idle';
  const sc = statusConfig(isExec ? 'processing' : status);
  const cat = exec?.category;
  const catConf = exec?.category_confidence || 0;
  const respConf = exec?.response_confidence || 0;
  const steps = exec?.logs?.length || 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
      <MetricCard label="Workflow Status" icon="zap">
        {isExec ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--accent-bright)', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700 }}>
            <Icon name="refresh" size={14} className="spin" /> EXECUTING…
          </span>
        ) : (
          <Chip color={sc.color} tone={0.12} style={{ fontSize: 11 }}>{sc.text}</Chip>
        )}
      </MetricCard>

      <MetricCard label="Classified Category" icon="tag">
        {cat ? (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{cat.replace(/_/g,' ')}</div>
            <div style={{ marginTop: 8 }}><ConfidenceBar score={catConf} height={4} /></div>
          </div>
        ) : <span style={{ fontSize: 13, color: 'var(--fg-faint)', fontStyle: 'italic' }}>Unclassified</span>}
      </MetricCard>

      <MetricCard label="Draft Confidence" icon="gauge">
        {respConf > 0 ? (
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color: confColor(respConf) }}>{Math.round(respConf*100)}%</div>
            <div style={{ marginTop: 6 }}><ConfidenceBar score={respConf} height={4} showPct={false} label={respConf >= 0.75 ? 'trusted' : 'low conf'} /></div>
          </div>
        ) : <span style={{ fontSize: 13, color: 'var(--fg-faint)', fontStyle: 'italic' }}>No score yet</span>}
      </MetricCard>

      <MetricCard label="Orchestration Steps" icon="layers">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 700 }}>{steps}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg-faint)' }}>logs recorded</span>
        </div>
      </MetricCard>
    </div>
  );
}

/* ------------------------------- Logs ------------------------------- */
function fmtStep(s) { return s.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase()); }
function fmtTime(iso) { try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); } catch { return ''; } }

function LogRow({ log, index }) {
  const [open, setOpen] = useStateG(false);
  const has = log.details && Object.keys(log.details).length > 0;
  const dot = log.status === 'completed' ? 'var(--ok)' : log.status === 'failed' ? 'var(--bad)' : log.status === 'running' ? 'var(--accent)' : 'var(--fg-faint)';
  return (
    <div style={{ position: 'relative', paddingLeft: 26, animation: 'a-rise .4s var(--ease) both', animationDelay: `${index*0.04}s` }}>
      <span style={{ position: 'absolute', left: 6, top: 6, width: 8, height: 8, borderRadius: 99, background: dot,
        boxShadow: `0 0 0 4px color-mix(in oklab, ${dot} 18%, transparent)`, zIndex: 2, animation: log.status === 'running' ? 'a-pulse 1.2s infinite' : 'none' }} />
      <div className="card" style={{ borderRadius: 'var(--r-sm)', padding: 11, transition: 'border-color .3s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{fmtStep(log.step)}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-ghost)' }}>
                <Icon name="clock" size={10} /> {fmtTime(log.timestamp)}
              </span>
            </div>
            <p style={{ marginTop: 5, fontSize: 11.5, lineHeight: 1.5, color: 'var(--fg-dim)' }}>{log.message}</p>
          </div>
          {has && (
            <button onClick={() => setOpen(o => !o)} className="focus-ring" style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 7, display: 'grid', placeItems: 'center',
              background: 'rgba(255,255,255,.05)', border: '1px solid var(--line)', color: 'var(--fg-dim)' }}>
              <Icon name={open ? 'chevronDown' : 'chevronRight'} size={13} />
            </button>
          )}
        </div>
        {open && has && (
          <div style={{ marginTop: 11, paddingTop: 11, borderTop: '1px solid var(--line)', animation: 'a-fade .3s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent-bright)', fontWeight: 700, marginBottom: 8 }}>
              <Icon name="info" size={11} /> Execution metadata
            </div>
            <pre style={{ margin: 0, fontFamily: 'var(--mono)', fontSize: 10.5, lineHeight: 1.55, background: 'var(--ink-900)', padding: 11, borderRadius: 8, border: '1px solid var(--line)', color: 'var(--fg-dim)', overflowX: 'auto' }}>
{JSON.stringify(log.details, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function LogsTimeline() {
  const exec = useStore(s => s.currentExecution);
  const isExec = useStore(s => s.isExecuting);
  const logs = exec?.logs || [];
  const scrollRef = useRefG(null);
  useEffectG(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [logs.length]);

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--line)', background: 'rgba(255,255,255,.02)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Icon name="terminal" size={15} style={{ color: 'var(--accent-bright)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.02em' }}>Observability Logs</span>
        </div>
        {logs.length > 0 && <Chip color="var(--fg-dim)" tone={0.08}>{logs.length} events</Chip>}
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 16, minHeight: 0 }}>
        {logs.length === 0 ? (
          <div style={{ height: '100%', minHeight: 220, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
            {isExec ? (
              <div>
                <Icon name="refresh" size={28} className="spin" style={{ color: 'var(--accent-bright)', margin: '0 auto 12px' }} />
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>Executing workflow</div>
                <div style={{ fontSize: 11, color: 'var(--fg-faint)', marginTop: 4 }}>Spinning up agents & retrieving context…</div>
              </div>
            ) : (
              <div>
                <Icon name="terminal" size={28} style={{ color: 'var(--fg-ghost)', margin: '0 auto 12px' }} />
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--fg-dim)' }}>No logs yet</div>
                <div style={{ fontSize: 11, color: 'var(--fg-faint)', marginTop: 4, maxWidth: 220 }}>Run a simulation to inspect the execution trace.</div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ position: 'absolute', left: 9, top: 8, bottom: 8, width: 1, background: 'var(--line)' }} />
            {logs.map((log, i) => <LogRow key={i} log={log} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { WorkflowGraph, MetricsPanel, LogsTimeline });
