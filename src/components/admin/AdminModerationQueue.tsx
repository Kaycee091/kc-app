import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Button } from '../ui/Button';
import { ShieldAlert, Check, Trash2, ArrowUpRight, Filter, AlertTriangle } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { formatDistanceToNow } from 'date-fns';

export const AdminModerationQueue: React.FC = () => {
  const { reportsList, resolveReport, dismissReport, hidePost, suspendUser, logAdminAction } = useAdmin();
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'pending' | 'in_review'>('all');

  const pendingReports = reportsList.filter((r) => r.status === 'pending' || r.status === 'in_review');

  const filteredItems = priorityFilter === 'all'
    ? pendingReports
    : pendingReports.filter((r) => r.status === priorityFilter);

  const handleApproveContent = (reportId: string) => {
    dismissReport(reportId, 'Approved by moderator from Moderation Queue');
    logAdminAction('Approved Content in Moderation Queue', 'report', reportId, 'Marked content safe');
  };

  const handleRemoveContent = (reportId: string, targetType: string, targetId: string) => {
    if (targetType === 'post') {
      hidePost(targetId);
    }
    resolveReport(reportId, 'Content removed from Moderation Queue');
    logAdminAction('Removed Content in Moderation Queue', 'report', reportId, `Target ${targetType}:${targetId}`);
  };

  const handleSuspendAuthor = (reportId: string, userId: string) => {
    suspendUser(userId, 'Suspended directly from Moderation Queue review');
    resolveReport(reportId, 'User suspended from Moderation Queue');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" /> Moderation Queue
          </h2>
          <p className="text-xs text-slate-500">Review flagged content and pending reports requiring immediate moderator attention.</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
          {(['all', 'pending', 'in_review'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setPriorityFilter(status)}
              className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
                priorityFilter === status ? 'bg-white dark:bg-slate-700 text-[#2563EB] shadow-sm' : 'text-slate-500'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 space-y-2">
            <Check className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-700 dark:text-slate-200">Queue Clear!</h3>
            <p className="text-xs text-slate-400">There are no pending moderation items requiring review at this time.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={item.reporter_name} size="md" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Reported by {item.reporter_name} <span className="text-slate-400 font-normal">(@{item.reporter_username})</span>
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {formatDistanceToNow(new Date(item.created_at || Date.now()), { addSuffix: true })} · ID: {item.id}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-white">
                  {item.target_type} Flag
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-rose-500 block">Reason: {item.reason}</span>
                {item.target_title && <p className="font-bold text-slate-900 dark:text-white">Target: {item.target_title}</p>}
                {item.details && <p className="text-slate-600 dark:text-slate-300">{item.details}</p>}
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <Button size="sm" variant="ghost" onClick={() => handleApproveContent(item.id)}>
                  Approve (Mark Safe)
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleSuspendAuthor(item.id, item.target_id)}>
                  Suspend User
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleRemoveContent(item.id, item.target_type, item.target_id)} leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
                  Remove Content
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
