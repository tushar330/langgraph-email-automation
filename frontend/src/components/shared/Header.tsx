'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWorkflowStore } from '@/store/workflowStore';
import { useEffect } from 'react';
import { ShieldAlert, Cpu, Activity, Play } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { pausedExecutions, loadPausedExecutionsFromSession } = useWorkflowStore();
  const pendingCount = Object.keys(pausedExecutions).length;

  useEffect(() => {
    loadPausedExecutionsFromSession();
  }, [loadPausedExecutionsFromSession]);

  const navItems = [
    { label: 'Home', path: '/', icon: <Cpu className="w-4 h-4" /> },
    { label: 'Simulation', path: '/simulation', icon: <Play className="w-4 h-4" /> },
    { label: 'Live Workflow', path: '/workflow', icon: <Activity className="w-4 h-4" /> },
    { 
      label: 'Human Review', 
      path: '/review', 
      icon: <ShieldAlert className="w-4 h-4" />,
      badge: pendingCount > 0 ? pendingCount : null
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-6 py-4 flex justify-between items-center bg-[#030303]/40 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center shadow-lg shadow-primary/20">
          <Cpu className="w-5 h-5 text-black stroke-[2.5]" />
        </div>
        <div>
          <span className="font-sans font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-primary-light">
            AGENTIA
          </span>
          <span className="font-mono text-[9px] block text-primary font-bold tracking-[0.2em] -mt-1">
            WORKFLOW ENGINE
          </span>
        </div>
      </div>

      <nav className="flex items-center gap-1.5 p-1 rounded-full border border-white/5 bg-charcoal/30 backdrop-blur-xl">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`relative px-4 py-2 text-xs font-medium rounded-full transition-all duration-300 flex items-center gap-2 ${
                isActive
                  ? 'text-white bg-white/5 shadow-inner border border-white/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge !== null && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
          V1.0.0 // LOCALHOST
        </span>
      </div>
    </header>
  );
}
