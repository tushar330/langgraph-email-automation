/* primitives.jsx — shared hooks & small UI atoms */
const { useState, useEffect, useRef, useCallback } = React;

/* Reveal on scroll (stagger via inline transition-delay) */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    const targets = [...el.querySelectorAll('.reveal')];
    if (el.classList.contains('reveal')) targets.unshift(el);
    targets.forEach(n => io.observe(n));
    // safety net: if IO never fires (backgrounded tab, unsupported), reveal anyway
    const fallback = setTimeout(() => targets.forEach(n => n.classList.add('in')), 2200);
    return () => { io.disconnect(); clearTimeout(fallback); };
  }, []);
  return ref;
}

/* 3D tilt following the pointer */
function useTilt(max = 8) {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateZ(0)`;
    el.style.setProperty('--mx', `${(px * 100 + 50).toFixed(1)}%`);
    el.style.setProperty('--my', `${(py * 100 + 50).toFixed(1)}%`);
  }, [max]);
  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
  }, []);
  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}

/* count-up number animation */
function useCountUp(target, { duration = 900, decimals = 0 } = {}) {
  const [val, setVal] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    cancelAnimationFrame(raf.current);
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(from + (target - from) * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return decimals ? val.toFixed(decimals) : Math.round(val);
}
function CountUp({ to, suffix = '', decimals = 0, duration = 900 }) {
  const v = useCountUp(to, { duration, decimals });
  return <>{v}{suffix}</>;
}

/* pointer parallax — returns a translate string for a given depth (px) */
function usePointerParallax(strength = 18) {
  const [t, setT] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setT({ x, y });
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  return (depth) => `translate3d(${(t.x * strength * depth).toFixed(2)}px, ${(t.y * strength * depth).toFixed(2)}px, 0)`;
}

/* confidence color helpers */
function confColor(s) { return s >= 0.75 ? 'var(--ok)' : s >= 0.5 ? 'var(--warn)' : 'var(--bad)'; }

function ConfidenceBar({ score, height = 5, showPct = true, label }) {
  const w = useCountUp(Math.round(score * 100), { duration: 800 });
  const color = confColor(score);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height, background: 'rgba(255,255,255,.06)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score * 100}%`, background: color, borderRadius: 99,
          transition: 'width 1s var(--ease)', boxShadow: `0 0 12px -2px ${color}` }} />
      </div>
      {showPct && <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, color }}>{w}%</span>}
      {label && <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, fontWeight: 700, letterSpacing: '.1em', color: 'var(--fg-faint)', textTransform: 'uppercase' }}>{label}</span>}
    </div>
  );
}

/* status → visual config (reserved semantic colors) */
function statusConfig(status) {
  switch (status) {
    case 'needs_review': return { text: 'Needs Review', color: 'var(--warn)' };
    case 'approved':     return { text: 'Approved',     color: 'var(--info)' };
    case 'sent':         return { text: 'Dispatched',   color: 'var(--ok)' };
    case 'failed':       return { text: 'Failed',       color: 'var(--bad)' };
    case 'skipped':      return { text: 'Skipped',      color: 'var(--fg-faint)' };
    case 'processing':   return { text: 'Processing',   color: 'var(--accent)' };
    default:             return { text: 'Idle',         color: 'var(--fg-faint)' };
  }
}

/* tinted chip */
function Chip({ children, color = 'var(--fg-dim)', tone = 0.1, style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase',
      padding: '4px 9px', borderRadius: 99, color,
      background: `color-mix(in oklab, ${color} ${tone * 100}%, transparent)`,
      border: `1px solid color-mix(in oklab, ${color} 28%, transparent)`, ...style,
    }}>{children}</span>
  );
}

/* section heading block */
function SectionHead({ kicker, title, sub, align = 'center' }) {
  return (
    <div className="reveal" style={{ textAlign: align, maxWidth: align === 'center' ? 640 : 'none', margin: align === 'center' ? '0 auto' : 0 }}>
      <div className="kicker" style={{ marginBottom: 14 }}>{kicker}</div>
      <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{title}</h2>
      {sub && <p style={{ marginTop: 14, color: 'var(--fg-dim)', fontSize: 15, lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}

Object.assign(window, {
  useReveal, useTilt, useCountUp, CountUp, usePointerParallax,
  confColor, ConfidenceBar, statusConfig, Chip, SectionHead,
});
