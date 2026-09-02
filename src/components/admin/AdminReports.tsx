import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { useAdmin } from '../../context/AdminContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { AdminConfirmModal } from './AdminConfirmModal';
import { Flag, ShieldAlert, Check, X, AlertTriangle, Trash2, UserX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ReportItem } from '../../types/social';

export const AdminReports: React.FC = () => {
  const { reports, resolveReport } = useSocial();
  const { suspendUser, banUser, logAdminAction } = useAdmin();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    action: () => { },
  });

  const categories = ['all', 'harassment', 'spam', 'hate', 'violence', 'nudity', 'scam', 'misinformation'];

  const demoReports: (ReportItem & { category: string; priority: 'high' | 'medium' | 'low'; description: string })[] = [
    {
      id: 'rep_101',
      item_type: 'post',
      item_id: 'post_1',
      reporter_id: 'user_sarah',
      reason: 'Harassment & Hate Speech',
      category: 'harassment',
      priority: 'high',
      description: 'User left aggressive comments violating community standards.',
      status: 'pending',
      created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    {
      id: 'rep_102',
      item_type: 'marketplace',
      item_id: 'mp_1',
      reporter_id: 'user_john',
      reason: 'Suspected Scam / Fake Listing',
      category: 'scam',
      priority: 'medium',
      description: 'Product listing uses stock images and requests off-platform payment.',
      status: 'pending',
      created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    },
    {
      id: 'rep_103',
      item_type: 'user',
      item_id: 'user_david',
      reporter_id: 'user_alex',
      reason: 'Impersonation & Fake Account',
      category: 'spam',
      priority: 'low',
      description: 'User created a duplicate profile impersonating a verified brand.',
      status: 'pending',
      created_at: new Date(Date.now() - 120 * 60000).toISOString(),
    },
  ];

  const displayReports = reports.length > 0 ? reports.map((r) => ({
    ...r,
    category: 'harassment',
    priority: 'high' as const,
    description: r.reason,
  })) : demoReports;

  const filteredReports = categoryFilter === 'all'
    ? displayReports
    : displayReports.filter((r) => r.category === categoryFilter);

  const handleRemoveContent = (reportId: string, itemId: string) => {
    resolveReport(reportId, 'delete');
    logAdminAction('Removed Reported Content', 'report', reportId, `Item ID: ${itemId}`);
    setSelectedReport(null);
  };

  const handleSuspendUser = (reportId: string, userId: string) => {
    setConfirmModalState({
      isOpen: true,
      title: 'Suspend Reported User',
      description: 'Are you sure you want to suspend this user account based on the submitted report?',
      action: () => {
        suspendUser(userId, 'Reported for policy violations');
        resolveReport(reportId, 'dismiss');
        setSelectedReport(null);
      },
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Reports Center</h2>
          <p className="text-xs text-slate-500">Review user-flagged posts, comments, profiles, and marketplace items.</p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold overflow-x-auto max-w-full scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl transition-all capitalize whitespace-nowrap ${categoryFilter === cat ? 'bg-white dark:bg-slate-700 text-[#2563EB] shadow-sm' : 'text-slate-500'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.length === 0 ? (
          <div className="md:col-span-2 p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
            <Check className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">No Reports Pending</h4>
            <p className="text-xs text-slate-400">All content reports have been reviewed and resolved.</p>
          </div>
        ) : (
          filteredReports.map((rep) => (
            <div key={rep.id} className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 text-[10px] font-bold uppercase">
                    {rep.item_type} Report
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${rep.priority === 'high' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                      }`}
                  >
                    {rep.priority} Priority
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {formatDistanceToNow(new Date(rep.created_at), { addSuffix: true })}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Reason: {rep.reason}</h4>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{rep.description}</p>
                <p className="text-[10px] font-mono text-slate-400 mt-1">Target ID: {rep.item_id}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                <Button size="sm" variant="outline" onClick={() => setSelectedReport(rep)}>
                  Review Details
                </Button>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => resolveReport(rep.id, 'dismiss')}>
                    Dismiss
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleRemoveContent(rep.id, rep.item_id)}>
                    Remove Content
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detailed Report Review Screen Modal */}
      {selectedReport && (
        <Modal isOpen={!!selectedReport} onClose={() => setSelectedReport(null)} title="Detailed Report Review Screen" maxWidth="md">
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2 border">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Report ID: {selectedReport.id}</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold uppercase">{selectedReport.item_type}</span>
              </div>
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">Violation Reason: {selectedReport.reason}</p>
              <p className="text-xs text-slate-700 dark:text-slate-300">Target Content ID: {selectedReport.item_id}</p>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">Moderator Resolution Actions:</h5>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="ghost" onClick={() => resolveReport(selectedReport.id, 'dismiss')}>
                  Dismiss Report
                </Button>
                <Button variant="danger" onClick={() => handleRemoveContent(selectedReport.id, selectedReport.item_id)} leftIcon={<Trash2 className="w-4 h-4" />}>
                  Remove Content
                </Button>
                <Button variant="outline" onClick={() => handleSuspendUser(selectedReport.id, selectedReport.reporter_id)} leftIcon={<ShieldAlert className="w-4 h-4" />}>
                  Suspend User
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="ghost" onClick={() => setSelectedReport(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <AdminConfirmModal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalState.action}
        title={confirmModalState.title}
        description={confirmModalState.description}
      />
    </div>
  );
};
