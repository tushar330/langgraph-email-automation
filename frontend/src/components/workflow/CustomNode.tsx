import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mail, Tag, Database, PenTool, CheckCircle, UserCheck, Send } from 'lucide-react';
import { confColor } from '@/lib/uiHooks';

export interface CustomNodeData {
  label: string;
  sublabel?: string;
  status: 'completed' | 'running' | 'failed' | 'pending';
  icon: 'inbox' | 'classify' | 'rag' | 'writer' | 'proofread' | 'review' | 'send';
  confidence?: number;
  badge?: string;
  details?: string;
}

const iconMap = {
  inbox: Mail,
  classify: Tag,
  rag: Database,
  writer: PenTool,
  proofread: CheckCircle,
  review: UserCheck,
  send: Send,
};

/* status → visual (reserved semantic colors; accent = running only) */
function nodeVisual(status: CustomNodeData['status']) {
  switch (status) {
    case 'completed': return { border: 'var(--ok)', glow: 'var(--ok-rgb)', icon: 'var(--ok)', bg: 'color-mix(in oklab, var(--ok) 9%, var(--ink-800))' };
    case 'running': return { border: 'var(--accent)', glow: 'var(--accent-rgb)', icon: 'var(--accent-bright)', bg: 'color-mix(in oklab, var(--accent) 11%, var(--ink-800))' };
    case 'failed': return { border: 'var(--bad)', glow: 'var(--bad-rgb)', icon: 'var(--bad)', bg: 'color-mix(in oklab, var(--bad) 9%, var(--ink-800))' };
    default: return { border: 'var(--line-2)', glow: '0,0,0', icon: 'var(--fg-faint)', bg: 'var(--ink-800)' };
  }
}

function CustomNode({ data }: { data: CustomNodeData }) {
  const IconComponent = iconMap[data.icon] || Mail;
  const v = nodeVisual(data.status);
  const badgeColor = data.status === 'completed' ? 'var(--ok)' : data.status === 'failed' ? 'var(--bad)' : data.status === 'running' ? 'var(--accent-bright)' : 'var(--fg-faint)';

  return (
    <div
      style={{
        width: 220,
        borderRadius: 'var(--r-sm)',
        border: `1px solid ${v.border}`,
        background: v.bg,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: 12,
        position: 'relative',
        boxShadow: data.status !== 'pending' ? `0 0 22px -6px rgba(${v.glow}, .5)` : 'var(--e1)',
        transition: 'all .5s var(--ease)',
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-white/10 !border-0 !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-white/10 !border-0 !w-2 !h-2" />

      {/* running ping */}
      {data.status === 'running' && (
        <span style={{ position: 'absolute', top: 9, right: 9, display: 'inline-flex', width: 8, height: 8 }}>
          <span className="ping" style={{ position: 'absolute', inset: 0, color: 'var(--accent)', borderRadius: 99 }} />
          <span style={{ position: 'relative', width: 8, height: 8, borderRadius: 99, background: 'var(--accent)' }} />
        </span>
      )}

      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center', flexShrink: 0, background: data.status === 'pending' ? 'rgba(255,255,255,.05)' : `color-mix(in oklab, ${v.icon} 16%, transparent)`, color: v.icon, transition: 'all .5s var(--ease)' }}>
          <IconComponent className="w-[15px] h-[15px]" />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--fg)' }}>{data.label}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-faint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.sublabel}</div>
        </div>
        {data.confidence != null && data.status === 'completed' && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: confColor(data.confidence) }}>{Math.round(data.confidence * 100)}%</span>
        )}
      </div>

      {/* badge row */}
      {data.badge && (
        <div style={{ marginTop: 10, paddingTop: 9, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 99, color: badgeColor, background: `color-mix(in oklab, ${badgeColor} 12%, transparent)`, border: `1px solid color-mix(in oklab, ${badgeColor} 22%, transparent)` }}>
            {data.badge}
          </span>
        </div>
      )}
    </div>
  );
}

export default memo(CustomNode);
