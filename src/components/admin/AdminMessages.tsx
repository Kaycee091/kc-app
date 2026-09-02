import React from 'react';
import { Shield, Lock, AlertCircle, BarChart2, Mail, MessageSquare } from 'lucide-react';

export const AdminMessages: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-500" />
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">System Messaging Management</h2>
            <p className="text-xs text-slate-500">Privacy-first messaging analytics, abuse reports, and spam delivery metrics.</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-3xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-start gap-3">
        <Shield className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-slate-900 dark:text-white">End-to-End Privacy Enforced</h4>
          <p className="text-slate-600 dark:text-slate-300">
            Administrators are restricted from viewing private user message content. Moderation is strictly managed via reported chat metadata, abuse flags, and automated rate-limiting.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Messages Sent Today</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">14,820</h3>
          <span className="text-[10px] font-bold text-emerald-500">99.8% Delivery Success Rate</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Reported Chats</span>
          <h3 className="text-2xl font-black text-[#2563EB]">2</h3>
          <span className="text-[10px] font-bold text-slate-400">Requires Moderator Review</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Spam Accounts Blocked</span>
          <h3 className="text-2xl font-black text-rose-500">5</h3>
          <span className="text-[10px] font-bold text-rose-500">Rate-limit triggered</span>
        </div>
      </div>
    </div>
  );
};
