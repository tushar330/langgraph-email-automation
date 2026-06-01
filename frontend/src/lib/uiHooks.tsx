'use client';

/* ============================================================
   Shared presentation hooks & atoms for the Iris/Azure redesign.
   Ported from design_handoff/prototype/primitives.jsx.
   Pure presentation — no business logic, no store, no fetch.
   ============================================================ */

import React, { useState, useEffect, useRef, useCallback } from 'react';

/* Reveal on scroll (stagger via inline transition-delay) */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    const targets = [...el.querySelectorAll('.reveal')] as Element[];
    if (el.classList.contains('reveal')) targets.unshift(el);
    targets.forEach((n) => io.observe(n));
    // safety net: reveal anyway if IO never fires
    const fallback = setTimeout(() => targets.forEach((n) => n.classList.add('in')), 2200);
    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, []);
  return ref;
}

/* 3D tilt following the pointer */
export function useTilt(max = 8) {
  const ref = useRef<HTMLDivElement>(null);
  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateZ(0)`;
      el.style.setProperty('--mx', `${(px * 100 + 50).toFixed(1)}%`);
      el.style.setProperty('--my', `${(py * 100 + 50).toFixed(1)}%`);
    },
    [max]
  );
  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
  }, []);
  return { ref, onMouseMove, onMouseLeave };
}

/* count-up number animation */
export function useCountUp(target: number, { duration = 900, decimals = 0 } = {}) {
  const [val, setVal] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    const start = performance.now();
    cancelAnimationFrame(raf.current);
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(target * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return decimals ? Number(val.toFixed(decimals)) : Math.round(val);
}

export function CountUp({ to, suffix = '', decimals = 0, duration = 900 }: { to: number; suffix?: string; decimals?: number; duration?: number }) {
  const v = useCountUp(to, { duration, decimals });
  return <>{v}{suffix}</>;
}

/* pointer parallax — returns a fn producing a translate string for a depth */
export function usePointerParallax(strength = 18) {
  const [t, setT] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setT({ x, y });
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  return (depth: number) => `translate3d(${(t.x * strength * depth).toFixed(2)}px, ${(t.y * strength * depth).toFixed(2)}px, 0)`;
}

/* confidence color helper — encodes 0.75 / 0.5 thresholds (status contract) */
export function confColor(s: number) {
  return s >= 0.75 ? 'var(--ok)' : s >= 0.5 ? 'var(--warn)' : 'var(--bad)';
}

export function ConfidenceBar({ score, height = 5, showPct = true, label }: { score: number; height?: number; showPct?: boolean; label?: string }) {
  const w = useCountUp(Math.round(score * 100), { duration: 800 });
  const color = confColor(score);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height, background: 'rgba(255,255,255,.06)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score * 100}%`, background: color, borderRadius: 99, transition: 'width 1s var(--ease)', boxShadow: `0 0 12px -2px ${color}` }} />
      </div>
      {showPct && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color }}>{w}%</span>}
      {label && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, fontWeight: 700, letterSpacing: '.1em', color: 'var(--fg-faint)', textTransform: 'uppercase' }}>{label}</span>}
    </div>
  );
}

/* status → visual config (reserved semantic colors) */
export function statusConfig(status: string) {
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
export function Chip({ children, color = 'var(--fg-dim)', tone = 0.1, style = {} }: { children: React.ReactNode; color?: string; tone?: number; style?: React.CSSProperties }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase',
      padding: '4px 9px', borderRadius: 99, color,
      background: `color-mix(in oklab, ${color} ${tone * 100}%, transparent)`,
      border: `1px solid color-mix(in oklab, ${color} 28%, transparent)`, ...style,
    }}>{children}</span>
  );
}

/* page header (Simulation / Workflow / Review) */
export function PageHeader({ kicker, kickerIcon: KickerIcon, title, sub, right, pulse }: { kicker: string; kickerIcon?: React.ElementType; title: string; sub: string; right?: React.ReactNode; pulse?: boolean }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 20, borderBottom: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 620 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {KickerIcon ? (
            <KickerIcon className="w-3.5 h-3.5" style={{ color: 'var(--accent-bright)' }} />
          ) : (
            <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)', animation: pulse ? 'a-pulse 1.6s infinite' : 'none' }} />
          )}
          <span className="kicker">{kicker}</span>
        </div>
        <h1 style={{ fontSize: 'clamp(22px,2.6vw,30px)', fontWeight: 600, letterSpacing: '-0.02em' }}>{title}</h1>
        <p style={{ marginTop: 7, fontSize: 13.5, lineHeight: 1.55, color: 'var(--fg-dim)' }}>{sub}</p>
      </div>
      {right}
    </div>
  );
}

/* small info tip pill */
export function InfoTip({ icon: TipIcon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 'var(--r)', background: 'rgba(255,255,255,.03)', border: '1px solid var(--line)', maxWidth: 340, fontSize: 11.5, lineHeight: 1.5, color: 'var(--fg-dim)' }}>
      <TipIcon className="w-4 h-4" style={{ color: 'var(--accent-bright)', flexShrink: 0 }} />
      <span>{children}</span>
    </div>
  );
}

/* page shell wrapper */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: 'clamp(20px,3vw,30px) clamp(16px,4vw,40px) 56px', display: 'flex', flexDirection: 'column', gap: 22, animation: 'a-rise .55s var(--ease) both' }}>
      {children}
    </div>
  );
}

/* section heading block */
export function SectionHead({ kicker, title, sub, align = 'center' }: { kicker: string; title: string; sub?: string; align?: 'center' | 'left' }) {
  return (
    <div className="reveal" style={{ textAlign: align, maxWidth: align === 'center' ? 640 : undefined, margin: align === 'center' ? '0 auto' : 0 }}>
      <div className="kicker" style={{ marginBottom: 14 }}>{kicker}</div>
      <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{title}</h2>
      {sub && <p style={{ marginTop: 14, color: 'var(--fg-dim)', fontSize: 15, lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}
