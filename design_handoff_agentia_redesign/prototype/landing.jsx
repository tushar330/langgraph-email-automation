/* landing.jsx — hero, features, workflow stages, tech stack, footer */
const { useState: useStateL, useEffect: useEffectL, useRef: useRefL } = React;

/* ---- floating preview dashboard (3D tilt + animated connectors) ---- */
function HeroPreview() {
  const tilt = useTilt(7);
  const conf = useCountUp(62, { duration: 1600 });
  return (
    <div className="reveal" style={{ perspective: 1000, transitionDelay: '.15s' }}>
      <div ref={tilt.ref} onMouseMove={tilt.onMouseMove} onMouseLeave={tilt.onMouseLeave} className="tilt"
        style={{
          position: 'relative', borderRadius: 'var(--r-xl)', overflow: 'hidden',
          background: 'color-mix(in oklab, var(--ink-800) 80%, transparent)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--line-2)', boxShadow: 'var(--e3), var(--glow)',
          height: 430,
        }}>
        {/* sheen following pointer */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4,
          background: 'radial-gradient(420px circle at var(--mx,50%) var(--my,30%), rgba(255,255,255,.06), transparent 50%)' }} />
        {/* window header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '13px 16px', borderBottom: '1px solid var(--line)', background: 'rgba(255,255,255,.03)' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['var(--bad)','var(--warn)','var(--ok)'].map((c,i) =>
              <span key={i} style={{ width: 10, height: 10, borderRadius: 99, background: `color-mix(in oklab, ${c} 55%, transparent)` }} />)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.14em', color: 'var(--fg-faint)' }}>
            <Icon name="terminal" size={13} style={{ color: 'var(--accent-bright)' }} />
            STATE_ORCHESTRATOR
          </div>
          <span style={{ position: 'relative', display: 'inline-flex', width: 9, height: 9 }}>
            <span className="ping" style={{ position: 'absolute', inset: 0, color: 'var(--ok)', borderRadius: 99 }} />
            <span style={{ position: 'relative', width: 9, height: 9, borderRadius: 99, background: 'var(--ok)' }} />
          </span>
        </div>

        {/* canvas */}
        <div style={{ position: 'relative', height: 'calc(100% - 47px)' }}>
          {/* animated connectors */}
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} preserveAspectRatio="none" viewBox="0 0 420 380">
            <path d="M 120 70 C 200 70, 220 120, 300 130" fill="none" stroke="var(--accent-line)" strokeWidth="1.5" strokeDasharray="5 5" style={{ animation: 'a-flow 1s linear infinite' }} />
            <path d="M 300 160 C 240 200, 180 200, 130 250" fill="none" stroke="var(--accent-line)" strokeWidth="1.5" strokeDasharray="5 5" style={{ animation: 'a-flow 1.3s linear infinite' }} />
            <path d="M 130 290 C 200 320, 250 320, 300 330" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="1.5" />
          </svg>

          {/* node cards */}
          <FloatCard top={26} left={20} icon="inbox" color="var(--ok)" title="Inbox Loaded" sub="1 message detected" delay=".3s" />
          <FloatCard top={92} right={20} icon="tag" color="var(--accent)" title="AI Classifier" sub="confidence · 96%" delay=".5s" />
          <FloatCard top={186} left={26} icon="database" color="var(--fg-dim)" title="Chroma RAG Search" sub="retrieving context…" delay=".7s" />

          {/* review card with live counter */}
          <div className="reveal" style={{ position: 'absolute', bottom: 18, right: 18, width: 224, transitionDelay: '.9s' }}>
            <div style={{ borderRadius: 'var(--r)', border: '1px solid var(--warn)', padding: 12,
              background: 'color-mix(in oklab, var(--warn) 8%, var(--ink-850))', boxShadow: '0 0 24px -6px color-mix(in oklab, var(--warn) 50%, transparent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center', background: 'color-mix(in oklab, var(--warn) 16%, transparent)', color: 'var(--warn)' }}>
                  <Icon name="shieldAlert" size={15} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>Review Required</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--warn)' }}>confidence · {conf}%</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 7, marginTop: 11, paddingTop: 11, borderTop: '1px solid var(--line)' }}>
                <span style={{ flex: 1, textAlign: 'center', padding: '6px 0', borderRadius: 7, fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--bad)', background: 'color-mix(in oklab, var(--bad) 10%, transparent)', border: '1px solid color-mix(in oklab, var(--bad) 22%, transparent)' }}>Discard</span>
                <span style={{ flex: 1, textAlign: 'center', padding: '6px 0', borderRadius: 7, fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent-ink)', background: 'var(--accent)' }}>Approve</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function FloatCard({ top, left, right, icon, color, title, sub, delay }) {
  return (
    <div className="reveal" style={{ position: 'absolute', top, left, right, width: 196, transitionDelay: delay,
      animation: 'a-drift 9s ease-in-out infinite', animationDelay: delay }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 'var(--r-sm)',
        border: `1px solid color-mix(in oklab, ${color} 30%, transparent)`, background: 'color-mix(in oklab, var(--ink-750) 92%, transparent)', boxShadow: 'var(--e2)' }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, display: 'grid', placeItems: 'center', background: `color-mix(in oklab, ${color} 14%, transparent)`, color }}>
          <Icon name={icon} size={14} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--fg-faint)' }}>{sub}</div>
        </div>
      </div>
    </div>
  );
}

/* ---- animated headline (word-by-word rise) ---- */
function Headline() {
  const line1 = ['Visualize', 'autonomous'];
  const line2 = ['AI', 'email', 'workflows'];
  let i = 0;
  const Word = ({ children, accent }) => {
    const d = (i++ * 0.07 + 0.1).toFixed(2);
    return (
      <span style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingRight: '0.28em' }}>
        <span style={{ display: 'inline-block', animation: `a-rise .8s var(--ease) both`, animationDelay: `${d}s`,
          color: accent ? 'transparent' : 'inherit',
          background: accent ? 'linear-gradient(100deg, var(--accent-bright), var(--accent) 55%, var(--fg))' : 'none',
          WebkitBackgroundClip: accent ? 'text' : 'initial', backgroundClip: accent ? 'text' : 'initial' }}>{children}</span>
      </span>
    );
  };
  return (
    <h1 style={{ fontSize: 'clamp(34px, 5.4vw, 66px)', fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 1.04 }}>
      <div>{line1.map((w,k) => <Word key={k}>{w}</Word>)}</div>
      <div>{line2.map((w,k) => <Word key={k} accent>{w}</Word>)}</div>
    </h1>
  );
}

/* ---- feature card (tilt) ---- */
function FeatureCard({ f, i }) {
  const tilt = useTilt(6);
  return (
    <div className="reveal" style={{ transitionDelay: `${i * 0.06}s`, perspective: 800 }}>
      <div ref={tilt.ref} onMouseMove={tilt.onMouseMove} onMouseLeave={tilt.onMouseLeave} className="tilt card"
        style={{ padding: 22, height: '100%', position: 'relative', overflow: 'hidden', cursor: 'default' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(300px circle at var(--mx,50%) var(--my,50%), color-mix(in oklab, var(--accent) 9%, transparent), transparent 60%)', opacity: .9 }} />
        <div style={{ position: 'relative' }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, display: 'grid', placeItems: 'center',
            background: 'color-mix(in oklab, var(--accent) 12%, transparent)', border: '1px solid var(--accent-line)', color: 'var(--accent-bright)', marginBottom: 16 }}>
            <Icon name={f.icon} size={20} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>{f.title}</h3>
          <p style={{ marginTop: 8, fontSize: 13.5, lineHeight: 1.6, color: 'var(--fg-dim)' }}>{f.desc}</p>
        </div>
      </div>
    </div>
  );
}

/* ---- interactive workflow stages ---- */
function StagesShowcase() {
  const [active, setActive] = useStateL(0);
  useEffectL(() => {
    const t = setInterval(() => setActive(a => (a + 1) % STAGES_SHOWCASE.length), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8,
      paddingLeft: 4 }}>
      <div style={{ position: 'absolute', left: 19, top: 18, bottom: 18, width: 1, background: 'var(--line-2)' }} />
      {STAGES_SHOWCASE.map((s, idx) => {
        const on = active === idx;
        return (
          <button key={idx} onClick={() => setActive(idx)} className="focus-ring"
            style={{ position: 'relative', textAlign: 'left', display: 'flex', gap: 16, padding: '14px 16px 14px 50px',
              borderRadius: 'var(--r)', border: `1px solid ${on ? 'var(--accent-line)' : 'transparent'}`,
              background: on ? 'color-mix(in oklab, var(--accent) 8%, transparent)' : 'transparent',
              transition: 'all .5s var(--ease)', cursor: 'pointer' }}>
            <span style={{ position: 'absolute', left: 8, top: 13, width: 24, height: 24, borderRadius: 99, display: 'grid', placeItems: 'center',
              background: on ? 'var(--accent)' : 'var(--ink-750)', border: `1px solid ${on ? 'var(--accent)' : 'var(--line-2)'}`,
              color: on ? 'var(--accent-ink)' : 'var(--fg-faint)', transition: 'all .5s var(--ease)', transform: on ? 'scale(1.12)' : 'scale(1)',
              boxShadow: on ? '0 0 16px -2px var(--accent)' : 'none', zIndex: 2 }}>
              <Icon name={s.icon} size={12} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: on ? 'var(--accent-bright)' : 'var(--fg)' }}>{s.title}</span>
                {on && <Chip color="var(--accent-bright)" tone={0.12} style={{ fontSize: 8 }}>Active</Chip>}
              </div>
              <p style={{ marginTop: 4, fontSize: 12.5, lineHeight: 1.55, color: on ? 'var(--fg-dim)' : 'var(--fg-faint)' }}>{s.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function Landing() {
  const reveal = useReveal();
  const par = usePointerParallax(20);
  const go = (p) => store.set({ page: p });

  return (
    <div ref={reveal} style={{ position: 'relative', zIndex: 1 }}>
      {/* floating orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-8%', left: '14%', width: 560, height: 560, borderRadius: '50%',
          background: 'radial-gradient(circle, color-mix(in oklab, var(--accent) 16%, transparent), transparent 65%)', filter: 'blur(40px)',
          transform: par(0.6), animation: 'a-drift 16s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '6%', right: '8%', width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, color-mix(in oklab, var(--info) 12%, transparent), transparent 65%)', filter: 'blur(40px)',
          transform: par(-0.4), animation: 'a-drift2 20s ease-in-out infinite' }} />
      </div>

      {/* HERO */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: 'clamp(48px,7vw,104px) clamp(20px,4vw,40px) clamp(56px,7vw,120px)',
        display: 'grid', gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,.95fr)', gap: 'clamp(28px,5vw,64px)', alignItems: 'center' }} className="hero-grid">
        <div>
          <div className="reveal" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '7px 14px', borderRadius: 99,
            border: '1px solid var(--accent-line)', background: 'color-mix(in oklab, var(--accent) 7%, transparent)', marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />
            <span className="kicker" style={{ fontSize: 10 }}>Observable agent orchestration</span>
          </div>
          <Headline />
          <p className="reveal" style={{ marginTop: 22, maxWidth: 520, fontSize: 'clamp(15px,1.4vw,17px)', lineHeight: 1.65, color: 'var(--fg-dim)', transitionDelay: '.1s' }}>
            An end-to-end engine that ingests, classifies, and answers customer email — built on LangGraph, Groq, and Gemini, with vector retrieval, confidence gatekeeping, and real-time human-in-the-loop overrides.
          </p>
          <div className="reveal" style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 32, transitionDelay: '.18s' }}>
            <button className="btn btn-primary" onClick={() => go('simulation')}>
              <Icon name="play" size={15} fill="currentColor" stroke={0} /> Run a simulation
            </button>
            <button className="btn btn-ghost" onClick={() => go('workflow')}>
              <Icon name="activity" size={15} style={{ color: 'var(--accent-bright)' }} /> Explore live graph
            </button>
          </div>
          <div className="reveal" style={{ display: 'flex', gap: 26, marginTop: 40, flexWrap: 'wrap', transitionDelay: '.24s' }}>
            {[['8','agent nodes'],['0.75','confidence gate'],['6','sandbox scenarios']].map(([n,l],k) =>
              <div key={k}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>{n}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fg-faint)', marginTop: 2 }}>{l}</div>
              </div>)}
          </div>
        </div>
        <HeroPreview />
      </section>

      {/* FEATURES */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: 'clamp(40px,6vw,88px) clamp(20px,4vw,40px)', borderTop: '1px solid var(--line)' }}>
        <SectionHead kicker="Engine capabilities" title="Designed for observability & reliability"
          sub="Traditional AI pipelines run inside a black box. Agentia opens the hood — visual clarity at every transition." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginTop: 48 }}>
          {FEATURES.map((f, i) => <FeatureCard key={i} f={f} i={i} />)}
        </div>
      </section>

      {/* STAGES */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: 'clamp(40px,6vw,88px) clamp(20px,4vw,40px)', borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,.82fr) minmax(0,1.18fr)', gap: 'clamp(28px,5vw,64px)', alignItems: 'center' }} className="stages-grid">
          <div className="reveal">
            <div className="kicker" style={{ marginBottom: 14 }}>Workflow stages</div>
            <h2 style={{ fontSize: 'clamp(26px,3vw,38px)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Anatomy of the automation chain</h2>
            <p style={{ marginTop: 16, fontSize: 15, lineHeight: 1.65, color: 'var(--fg-dim)' }}>
              Watch the system ingest, categorize, validate, and dispatch — updating statefully and halting the moment human intervention is required.
            </p>
            <button className="btn btn-primary" style={{ marginTop: 28 }} onClick={() => go('simulation')}>
              Run demo simulation <Icon name="arrowRight" size={15} />
            </button>
          </div>
          <div className="reveal" style={{ transitionDelay: '.1s' }}><StagesShowcase /></div>
        </div>
      </section>

      {/* TECH STACK */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: 'clamp(40px,6vw,88px) clamp(20px,4vw,40px)', borderTop: '1px solid var(--line)' }}>
        <SectionHead kicker="Engineering stack" title="Built on industry-standard AI frameworks"
          sub="State-of-the-art tools across the agentic lifecycle — from vector databases to live flow rendering." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 14, marginTop: 48 }}>
          {TECH.map((t, i) => (
            <div key={i} className="reveal card" style={{ padding: 18, textAlign: 'center', transitionDelay: `${i*0.05}s`, transition: 'transform .35s var(--ease), border-color .3s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--accent-line)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--line)'; }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--accent-bright)', fontWeight: 600 }}>{t.cat}</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 8 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: 'var(--fg-faint)', marginTop: 7, lineHeight: 1.45 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: 'clamp(40px,5vw,72px) clamp(20px,4vw,40px) 56px', borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', gap: 32, alignItems: 'start' }} className="footer-grid">
          <div>
            <Logo size={30} />
            <p style={{ marginTop: 16, fontSize: 13, lineHeight: 1.65, color: 'var(--fg-faint)', maxWidth: 440 }}>
              A showcase of stateful multi-agent orchestration, semantic vector retrieval, and human-in-the-loop audit overrides. Built for portfolio and evaluation.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="kicker" style={{ color: 'var(--fg-faint)' }}>Resources</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
              {[['github','GitHub'],['linkedin','LinkedIn'],['externalLink','Resume']].map(([ic,l]) =>
                <a key={l} href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--fg-dim)', transition: 'color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--fg)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-dim)'}>
                  <Icon name={ic} size={15} /> {l}
                </a>)}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 36, paddingTop: 22, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.06em', color: 'var(--fg-ghost)' }}>
          <span>© {new Date().getFullYear()} AGENTIA · ALL RIGHTS RESERVED</span>
          <span>BUILT WITH NEXT.JS · LANGGRAPH · CHROMADB</span>
        </div>
      </footer>
    </div>
  );
}

window.Landing = Landing;
