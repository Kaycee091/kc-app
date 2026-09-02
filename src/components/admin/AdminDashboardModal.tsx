import React from 'react';
import { useSocial } from '../../context/SocialContext';
import { Shield, Check, Trash2, X } from 'lucide-react';
import { Button } from '../ui/Button';

export const AdminDashboardModal: React.FC = () => {
  const { reports, resolveReport, setActiveTab } = useSocial();

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-rose-500" />
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Admin Moderation Dashboard</h2>
            <p className="text-xs text-slate-500">Review reported posts, manage community guidelines & safety.</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {reports.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
            <Shield className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">All Reports Resolved</h4>
            <p className="text-xs text-slate-400 mt-1">No pending content flags or reported posts.</p>
          </div>
        ) : (
          reports.map((rep) => (
            <div key={rep.id} className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold uppercase">
                  {rep.item_type} Report
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                  Reason: {rep.reason}
                </p>
                <p className="text-[11px] text-slate-400">Target ID: {rep.item_id}</p>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => resolveReport(rep.id, 'dismiss')}>
                  Dismiss
                </Button>
                <Button size="sm" variant="danger" onClick={() => resolveReport(rep.id, 'delete')} leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
                  Delete Content
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
