/* app.jsx — root: routing, page transitions, Tweaks panel */
const { useState: useStateA, useEffect: useEffectA } = React;

/* accent palettes — each updates --accent family + rgb glow */
const ACCENTS = {
  Iris:  { h: 285, rgb: '139,120,255', label: 'Iris' },
  Azure: { h: 248, rgb: '96,135,255',  label: 'Azure' },
  Aqua:  { h: 190, rgb: '54,211,224',  label: 'Aqua' },
  Ember: { h: 42,  rgb: '247,170,74',  label: 'Ember' },
};

function applyAccent(name, motion) {
  const a = ACCENTS[name] || ACCENTS.Iris;
  const root = document.documentElement;
  root.style.setProperty('--accent',        `oklch(0.70 0.17 ${a.h})`);
  root.style.setProperty('--accent-bright',  `oklch(0.82 0.15 ${a.h})`);
  root.style.setProperty('--accent-deep',    `oklch(0.58 0.17 ${a.h})`);
  root.style.setProperty('--accent-rgb',     a.rgb);
  // Ember reads on light ink; others on dark
  root.style.setProperty('--accent-ink', name === 'Ember' || name === 'Aqua' ? '#08121a' : '#0a0712');
  document.body.dataset.motion = motion;
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "Iris",
  "motion": "cinematic",
  "depth": true,
  "grid": true
}/*EDITMODE-END*/;

function PageRouter() {
  const page = useStore(s => s.page);
  const [shown, setShown] = useStateA(page);
  const [phase, setPhase] = useStateA('in');

  useEffectA(() => {
    if (page === shown) return;
    setPhase('out');
    const t = setTimeout(() => { setShown(page); setPhase('in'); window.scrollTo({ top: 0, behavior: 'instant' }); }, 220);
    return () => clearTimeout(t);
  }, [page]);

  const Cmp = { home: Landing, simulation: SimulationPage, workflow: WorkflowPage, review: ReviewPage }[shown] || Landing;
  return (
    <div key={shown} style={{ opacity: phase === 'out' ? 0 : 1, transform: phase === 'out' ? 'translateY(10px)' : 'none',
      transition: 'opacity .22s var(--ease), transform .22s var(--ease)' }}>
      <Cmp />
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useEffectA(() => { applyAccent(t.accent, t.motion); }, [t.accent, t.motion]);
  useEffectA(() => { document.body.dataset.depth = t.depth ? 'on' : 'off'; }, [t.depth]);

  return (
    <>
      <div className="bg-atmosphere" />
      {t.grid && <div className="bg-grid" />}
      <Header />
      <PageRouter />

      <TweaksPanel>
        <TweakSection label="Identity" />
        <TweakColor label="Accent" value={ACCENTS[t.accent]?.rgb}
          options={Object.values(ACCENTS).map(a => `rgb(${a.rgb})`)}
          onChange={(v) => {
            const name = Object.keys(ACCENTS).find(k => `rgb(${ACCENTS[k].rgb})` === v) || 'Iris';
            setTweak('accent', name);
          }} />
        <TweakRadio label="Theme" value={t.accent}
          options={Object.keys(ACCENTS)} onChange={(v) => setTweak('accent', v)} />
        <TweakSection label="Motion & depth" />
        <TweakRadio label="Motion" value={t.motion}
          options={['crisp', 'cinematic']} onChange={(v) => setTweak('motion', v)} />
        <TweakToggle label="Depth & glass" value={t.depth} onChange={(v) => setTweak('depth', v)} />
        <TweakToggle label="Background grid" value={t.grid} onChange={(v) => setTweak('grid', v)} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
