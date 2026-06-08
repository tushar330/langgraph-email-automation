'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWorkflowStore } from '@/store/workflowStore';
import { useEffect } from 'react';
import { Command, Cpu, Play, Activity, ShieldAlert } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { pausedExecutions, loadPausedExecutionsFromSession } = useWorkflowStore();
  const pendingCount = Object.keys(pausedExecutions).length;

  useEffect(() => {
    loadPausedExecutionsFromSession();
  }, [loadPausedExecutionsFromSession]);

  const navItems = [
    { label: 'Home', path: '/', icon: Cpu },
    { label: 'Simulation', path: '/simulation', icon: Play },
    { label: 'Live Workflow', path: '/workflow', icon: Activity },
    { label: 'Human Review', path: '/review', icon: ShieldAlert, badge: pendingCount },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full flex items-center justify-between gap-4 border-b"
      style={{
        padding: '14px clamp(16px, 4vw, 40px)',
        background: 'color-mix(in oklab, var(--ink-900) 62%, transparent)',
        backdropFilter: 'blur(18px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.2)',
        borderColor: 'var(--line)',
      }}
    >
      {/* Logo */}
      <Link href="/" className="focus-ring flex items-center gap-3" style={{ borderRadius: 10 }}>
        <div
          className="grid place-items-center"
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'linear-gradient(145deg, var(--accent-bright), var(--accent-deep))',
            boxShadow: '0 6px 18px -6px rgba(var(--accent-rgb), .7), inset 0 1px 0 rgba(255,255,255,.35)',
          }}
        >
          <Command className="w-[18px] h-[18px]" strokeWidth={2.2} style={{ color: 'var(--accent-ink)' }} />
        </div>
        <div className="leading-none">
          <div className="font-semibold text-[17px]" style={{ letterSpacing: '.06em', color: 'var(--fg)' }}>
            AGENTIA
          </div>
          <div
            className="font-mono font-semibold mt-0.5"
            style={{ fontSize: 8.5, letterSpacing: '.26em', color: 'var(--accent-bright)' }}
          >
            WORKFLOW ENGINE
          </div>
        </div>
      </Link>

      {/* Pill-group nav */}
      <nav
        className="flex items-center gap-1 rounded-full border"
        style={{
          padding: 5,
          borderColor: 'var(--line)',
          background: 'color-mix(in oklab, var(--ink-800) 60%, transparent)',
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className="focus-ring relative inline-flex items-center gap-2 rounded-full border text-[13px] font-medium transition-all duration-300"
              style={{
                padding: '9px 15px',
                color: isActive ? 'var(--fg)' : 'var(--fg-dim)',
                background: isActive ? 'rgba(255,255,255,.06)' : 'transparent',
                borderColor: isActive ? 'var(--line-2)' : 'transparent',
              }}
            >
              <Icon
                className="w-[15px] h-[15px]"
                style={{ color: isActive ? 'var(--accent-bright)' : 'inherit' }}
              />
              <span className="nav-label">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="relative inline-flex" style={{ width: 7, height: 7 }}>
                  <span
                    className="ping absolute inset-0 rounded-full"
                    style={{ color: 'var(--warn)' }}
                  />
                  <span
                    className="relative rounded-full"
                    style={{ width: 7, height: 7, background: 'var(--warn)' }}
                  />
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="header-meta" />
    </header>
  );
}
