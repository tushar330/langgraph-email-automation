'use client';

import React from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { Mail, ArrowRight } from 'lucide-react';

export default function EmailSelector() {
  const { simulationEmails, selectedEmailId, setSelectedEmailId } = useWorkflowStore();

  const getCategoryTheme = (id: string) => {
    switch (id) {
      case 'mock-1': // Product Inquiry
        return { color: 'bg-green-500', name: 'Product Inquiry' };
      case 'mock-2': // Refund Request
        return { color: 'bg-orange-500', name: 'Refund Request' };
      case 'mock-3': // Tech Support
        return { color: 'bg-blue-500', name: 'Tech Support' };
      case 'mock-4': // Angry Customer
        return { color: 'bg-red-500', name: 'Furious Feedback' };
      case 'mock-5': // Internship
        return { color: 'bg-purple-500', name: 'Internship Inquiry' };
      case 'mock-6': // Spam
        return { color: 'bg-gray-500', name: 'Unsolicited/Spam' };
      default:
        return { color: 'bg-primary', name: 'Email Inquiry' };
    }
  };

  return (
    <div className="flex flex-col h-full bg-charcoal/40 border border-white/5 rounded-2xl overflow-hidden glass-panel">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold tracking-wider text-white font-sans">SELECT SIMULATION EMAIL</span>
        </div>
        <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2.5 py-0.5 rounded border border-white/5">
          {simulationEmails.length} AVAILABLE
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {simulationEmails.map((email) => {
          const isSelected = selectedEmailId === email.id;
          const theme = getCategoryTheme(email.id);

          return (
            <button
              key={email.id}
              onClick={() => setSelectedEmailId(email.id)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 relative group flex items-start gap-3.5 ${
                isSelected
                  ? 'border-primary/40 bg-primary/5 shadow-[0_0_15px_rgba(255,107,0,0.03)]'
                  : 'border-white/5 bg-[#0b0b0b]/40 hover:border-white/10 hover:bg-[#0b0b0b]/75'
              }`}
            >
              {/* Category Dot indicator */}
              <div className="flex flex-col items-center mt-1">
                <span className={`w-2 h-2 rounded-full ${theme.color} ring-4 ring-white/5`} />
              </div>

              {/* Text metadata */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[11px] font-bold text-gray-300 truncate tracking-wide">
                    {email.sender}
                  </span>
                  <span className="text-[9px] font-mono text-gray-500 shrink-0 font-medium">
                    {theme.name.toUpperCase()}
                  </span>
                </div>
                <h4 className={`text-xs font-semibold mt-1 truncate transition-colors ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                  {email.subject}
                </h4>
                <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                  {email.body}
                </p>
              </div>

              {/* Hover arrow */}
              <div className={`p-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-500 transition-all self-center shrink-0 ${
                isSelected ? 'text-primary border-primary/20 bg-primary/10' : 'opacity-0 group-hover:opacity-100'
              }`}>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
