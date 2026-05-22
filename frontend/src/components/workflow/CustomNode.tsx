import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mail, Tag, Database, PenTool, CheckCircle, UserCheck, Send, AlertTriangle } from 'lucide-react';

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

function CustomNode({ data }: { data: CustomNodeData }) {
  const IconComponent = iconMap[data.icon] || Mail;

  // Resolve colors based on status
  let borderClass = 'border-white/5';
  let glowClass = '';
  let bgClass = 'bg-charcoal/80';
  let iconColor = 'text-gray-400';

  if (data.status === 'completed') {
    borderClass = 'border-green-500/35';
    glowClass = 'shadow-[0_0_20px_rgba(34,197,94,0.08)]';
    bgClass = 'bg-[#0a1810]/95';
    iconColor = 'text-green-400';
  } else if (data.status === 'running') {
    borderClass = 'border-primary/50 animate-pulse';
    glowClass = 'shadow-[0_0_20px_rgba(255,107,0,0.12)]';
    bgClass = 'bg-[#1a1005]/95';
    iconColor = 'text-primary';
  } else if (data.status === 'failed') {
    borderClass = 'border-red-500/35';
    glowClass = 'shadow-[0_0_20px_rgba(239,68,68,0.08)]';
    bgClass = 'bg-[#1a0a0d]/95';
    iconColor = 'text-red-400';
  }

  return (
    <div className={`w-[220px] rounded-xl border p-3.5 backdrop-blur-md transition-all duration-500 ${bgClass} ${borderClass} ${glowClass}`}>
      {/* Handles */}
      <Handle type="target" position={Position.Top} className="!bg-white/10 !border-0 !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-white/10 !border-0 !w-2 !h-2" />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${data.status === 'running' ? 'bg-primary/10' : data.status === 'completed' ? 'bg-green-500/10' : data.status === 'failed' ? 'bg-red-500/10' : 'bg-white/5'} transition-all duration-500`}>
          <IconComponent className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-white tracking-wide truncate">{data.label}</div>
          <div className="text-[9px] text-gray-500 font-medium truncate">{data.sublabel}</div>
        </div>
      </div>

      {/* Dynamic Content Details */}
      {(data.confidence !== undefined || data.badge || data.details) && (
        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
          {data.confidence !== undefined ? (
            <div className="flex items-center gap-1">
              <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold">Confidence:</span>
              <span className={`text-[10px] font-mono font-bold ${data.confidence >= 0.75 ? 'text-green-400' : 'text-primary'}`}>
                {Math.round(data.confidence * 100)}%
              </span>
            </div>
          ) : (
            <div />
          )}

          {data.badge && (
            <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
              data.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/10' :
              data.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/10' :
              data.status === 'running' ? 'bg-primary/10 text-primary border border-primary/10' :
              'bg-white/5 text-gray-400 border border-white/5'
            }`}>
              {data.badge}
            </span>
          )}
        </div>
      )}

      {/* Progress status indicators */}
      {data.status === 'running' && (
        <div className="absolute top-2 right-2 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </div>
      )}
    </div>
  );
}

export default memo(CustomNode);
