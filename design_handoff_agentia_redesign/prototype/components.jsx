/* components.jsx — Header / top nav */
const { useState: useStateC } = React;

function Logo({ size = 34 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
      <div style={{
        width: size, height: size, borderRadius: 10, display: 'grid', placeItems: 'center',
        background: 'linear-gradient(145deg, var(--accent-bright), var(--accent-deep))',
        boxShadow: '0 6px 18px -6px rgba(var(--accent-rgb), .7), inset 0 1px 0 rgba(255,255,255,.35)',
      }}>
        <Icon name="command" size={size * 0.52} stroke={2} style={{ color: 'var(--accent-ink)' }} />
      </div>
      <div style={{ lineHeight: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 17, letterSpacing: '.06em' }}>AGENTIA</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, fontWeight: 600, letterSpacing: '.26em', color: 'var(--accent-bright)', marginTop: 2 }}>WORKFLOW ENGINE</div>
      </div>
    </div>
  );
}

function Header() {
  const page = useStore(s => s.page);
  const pausedCount = useStore(s => Object.keys(s.pausedExecutions).length);
  const go = (p) => store.set({ page: p });

  const items = [
    { id: 'home', label: 'Home', icon: 'cpu' },
    { id: 'simulation', label: 'Simulation', icon: 'play' },
    { id: 'workflow', label: 'Live Workflow', icon: 'activity' },
    { id: 'review', label: 'Human Review', icon: 'shieldAlert', badge: pausedCount },
  ];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50, width: '100%',
      padding: '14px clamp(16px, 4vw, 40px)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      background: 'color-mix(in oklab, var(--ink-900) 62%, transparent)',
      backdropFilter: 'blur(18px) saturate(1.2)', WebkitBackdropFilter: 'blur(18px) saturate(1.2)',
      borderBottom: '1px solid var(--line)',
    }}>
      <button onClick={() => go('home')} className="focus-ring" style={{ background: 'none', border: 'none', padding: 0 }}>
        <Logo />
      </button>

      <nav style={{
        display: 'flex', alignItems: 'center', gap: 4, padding: 5, borderRadius: 99,
        border: '1px solid var(--line)', background: 'color-mix(in oklab, var(--ink-800) 60%, transparent)',
      }}>
        {items.map(item => {
          const active = page === item.id;
          return (
            <button key={item.id} onClick={() => go(item.id)} className="focus-ring"
              style={{
                position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '9px 15px', borderRadius: 99, border: '1px solid transparent',
                fontSize: 13, fontWeight: 500, fontFamily: 'var(--sans)',
                color: active ? 'var(--fg)' : 'var(--fg-dim)', background: active ? 'rgba(255,255,255,.06)' : 'transparent',
                borderColor: active ? 'var(--line-2)' : 'transparent',
                transition: 'color .25s var(--ease), background .25s var(--ease), border-color .25s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--fg)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--fg-dim)'; }}
            >
              <Icon name={item.icon} size={15} style={{ color: active ? 'var(--accent-bright)' : 'inherit' }} />
              <span className="nav-label">{item.label}</span>
              {item.badge > 0 && (
                <span style={{ position: 'relative', display: 'inline-flex', width: 7, height: 7 }}>
                  <span className="ping" style={{ position: 'absolute', inset: 0, color: 'var(--warn)', borderRadius: 99 }} />
                  <span style={{ position: 'relative', width: 7, height: 7, borderRadius: 99, background: 'var(--warn)' }} />
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="header-meta">
        <span className="pill" style={{ fontFamily: 'var(--mono)' }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--ok)', boxShadow: '0 0 8px var(--ok)' }} />
          v2.0 · LIVE
        </span>
      </div>
    </header>
  );
}

window.Header = Header;
