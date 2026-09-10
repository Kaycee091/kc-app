import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { AdminConfirmModal } from './AdminConfirmModal';
import { Flag, ShieldAlert, Check, X, AlertTriangle, Trash2, UserX, Search, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ReportItem } from '../../services/reportsService';

export const AdminReports: React.FC = () => {
  const {
    reportsList,
    resolveReport,
    dismissReport,
    assignModerator,
    suspendUser,
    hidePost,
    deletePost,
    logAdminAction,
  } = useAdmin();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_review' | 'resolved' | 'dismissed'>('all');
  const [targetFilter, setTargetFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    action: () => {},
  });

  const filteredReports = reportsList.filter((r) => {
    const matchesSearch =
      r.reporter_name.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase()) ||
      (r.target_title && r.target_title.toLowerCase().includes(search.toLowerCase())) ||
      (r.details && r.details.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (targetFilter !== 'all' && r.target_type !== targetFilter) return false;
    return true;
  });

  const handleResolveAction = (report: ReportItem, actionType: 'resolve_only' | 'hide_content' | 'suspend_user') => {
    if (actionType === 'hide_content' && report.target_type === 'post') {
      hidePost(report.target_id);
    } else if (actionType === 'suspend_user' && report.target_id) {
      suspendUser(report.target_id, `Suspended due to report #${report.id}`);
    }

    resolveReport(report.id, resolutionNotes || `Action taken: ${actionType}`);
    setSelectedReport(null);
    setResolutionNotes('');
  };

  const handleDismissAction = (report: ReportItem) => {
    dismissReport(report.id, resolutionNotes || 'Dismissed by moderator');
    setSelectedReport(null);
    setResolutionNotes('');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Flag className="w-5 h-5 text-rose-500" /> Content & Account Reports
          </h2>
          <p className="text-xs text-slate-500">Review reported user accounts, posts, marketplace items, and moderate policy violations.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-full sm:w-48">
            <Input
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
            />
          </div>

          <select
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value)}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Targets</option>
            <option value="post">Posts</option>
            <option value="comment">Comments</option>
            <option value="user">Users</option>
            <option value="marketplace">Marketplace</option>
            <option value="group">Groups</option>
          </select>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            {(['all', 'pending', 'in_review', 'resolved', 'dismissed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-2.5 py-1.5 rounded-xl transition-all capitalize ${
                  statusFilter === tab ? 'bg-white dark:bg-slate-700 text-[#2563EB] shadow-sm' : 'text-slate-500'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12 p-6 space-y-2">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 dark:text-slate-200">No Reports Found</h3>
            <p className="text-xs text-slate-400">All submitted reports have been reviewed or match no filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase text-[10px] font-black tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-4">Report ID</th>
                  <th className="p-4">Reporter</th>
                  <th className="p-4">Target Type</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">{report.id}</td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 dark:text-white block">{report.reporter_name}</span>
                      <span className="text-[10px] text-slate-400">@{report.reporter_username}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 dark:bg-blue-950/60 text-[#2563EB]">
                        {report.target_type}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate">
                      {report.reason}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          report.status === 'pending'
                            ? 'bg-rose-100 text-rose-700'
                            : report.status === 'in_review'
                            ? 'bg-amber-100 text-amber-700'
                            : report.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {report.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {formatDistanceToNow(new Date(report.created_at || Date.now()), { addSuffix: true })}
                    </td>
                    <td className="p-4 text-right">
                      <Button size="sm" variant="outline" onClick={() => setSelectedReport(report)}>
                        Review Report
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Review Modal */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`Report Review: #${selectedReport.id}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-xs">
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 space-y-2">
              <div className="flex justify-between"><span className="text-slate-500">Target Type</span><span className="font-bold uppercase text-blue-600">{selectedReport.target_type}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Target ID</span><span className="font-mono font-bold text-slate-900 dark:text-white">{selectedReport.target_id}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Reporter</span><span className="font-bold text-slate-900 dark:text-white">{selectedReport.reporter_name} (@{selectedReport.reporter_username})</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Reason</span><span className="font-bold text-rose-600 dark:text-rose-400">{selectedReport.reason}</span></div>
            </div>

            {selectedReport.details && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-500 block mb-1">Details & Context:</span>
                <p className="text-slate-800 dark:text-slate-200">{selectedReport.details}</p>
              </div>
            )}

            <Input
              label="Resolution Notes"
              placeholder="Enter notes explaining moderation action taken..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
            />

            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 justify-end">
              <Button variant="ghost" onClick={() => handleDismissAction(selectedReport)} leftIcon={<X className="w-4 h-4" />}>
                Dismiss Report
              </Button>
              {selectedReport.target_type === 'post' && (
                <Button variant="outline" onClick={() => handleResolveAction(selectedReport, 'hide_content')} leftIcon={<Trash2 className="w-4 h-4" />}>
                  Hide Target Post
                </Button>
              )}
              <Button variant="danger" onClick={() => handleResolveAction(selectedReport, 'suspend_user')} leftIcon={<UserX className="w-4 h-4" />}>
                Suspend Target User
              </Button>
              <Button variant="primary" onClick={() => handleResolveAction(selectedReport, 'resolve_only')} leftIcon={<Check className="w-4 h-4" />}>
                Mark Resolved
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
