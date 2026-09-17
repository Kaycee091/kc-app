import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { BanAppeal, AppealStatus } from '../../types/admin';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { AdminConfirmModal } from './AdminConfirmModal';
import { FileText, CheckCircle, XCircle, Search, UserCheck, ShieldAlert, Clock, AlertTriangle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export const AdminAppeals: React.FC = () => {
  const { appealsList, approveAppeal, rejectAppeal, setSelectedUserId, setActiveAdminRoute } = useAdmin();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'under_review' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [selectedAppeal, setSelectedAppeal] = useState<BanAppeal | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

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

  const filteredAppeals = appealsList.filter((appeal) => {
    const username = appeal.user?.username || '';
    const fullName = appeal.user?.full_name || '';
    const email = appeal.user?.email || '';
    const message = appeal.appeal_message || '';
    const id = appeal.id || '';

    const matchesSearch =
      username.toLowerCase().includes(search.toLowerCase()) ||
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      message.toLowerCase().includes(search.toLowerCase()) ||
      id.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && appeal.status !== statusFilter) return false;
    return true;
  });

  const handleApprove = (appeal: BanAppeal) => {
    setConfirmModalState({
      isOpen: true,
      title: `Approve Ban Appeal #${appeal.id}`,
      description: `Approving this appeal will unban @${appeal.user?.username || 'user'}, restore their access to Connecta, and record this administrative decision.`,
      action: async () => {
        setIsProcessing(true);
        await approveAppeal(appeal.id, adminNotes);
        setIsProcessing(false);
        setSelectedAppeal(null);
        setAdminNotes('');
        setActionSuccessMessage(`Appeal #${appeal.id} approved. @${appeal.user?.username || 'User'} has been unbanned.`);
        setTimeout(() => setActionSuccessMessage(null), 4000);
      },
    });
  };

  const handleReject = (appeal: BanAppeal) => {
    setConfirmModalState({
      isOpen: true,
      title: `Reject Ban Appeal #${appeal.id}`,
      description: `Rejecting this appeal will keep @${appeal.user?.username || 'user'} banned. The appeal and reason will be archived.`,
      action: async () => {
        setIsProcessing(true);
        await rejectAppeal(appeal.id, adminNotes);
        setIsProcessing(false);
        setSelectedAppeal(null);
        setAdminNotes('');
        setActionSuccessMessage(`Appeal #${appeal.id} rejected. Account remains banned.`);
        setTimeout(() => setActionSuccessMessage(null), 4000);
      },
    });
  };

  const handleViewUserProfile = (userId: string) => {
    setSelectedAppeal(null);
    setSelectedUserId(userId);
    setActiveAdminRoute('users');
  };

  const getStatusBadge = (status: AppealStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold';
      case 'under_review':
        return 'bg-blue-100 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 font-bold';
      case 'approved':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold';
      case 'rejected':
        return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 font-medium';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" /> Ban Appeals Management
          </h2>
          <p className="text-xs text-slate-500">Review appeals submitted by banned users, inspect reasons, and approve or reject reinstatements.</p>
        </div>

        {/* Controls: Search and Status Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-56">
            <Input
              placeholder="Search user, email, message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
                  statusFilter === tab ? 'bg-white dark:bg-slate-700 text-[#2563EB] shadow-sm' : 'text-slate-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-slide-down">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Appeals Table / List */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
        {filteredAppeals.length === 0 ? (
          <div className="text-center py-12 p-6 space-y-2">
            <CheckCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 dark:text-slate-200">No Appeals Found</h3>
            <p className="text-xs text-slate-400">There are no appeals matching the current status and search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                  <th className="p-4">Appeal ID</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Ban Reason</th>
                  <th className="p-4">Appeal Message</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                {filteredAppeals.map((appeal) => (
                  <tr key={appeal.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">{appeal.id}</td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={appeal.user?.avatar_url} name={appeal.user?.full_name || 'User'} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">
                            {appeal.user?.full_name || 'User'}
                          </p>
                          <span className="text-[11px] text-slate-400">@{appeal.user?.username || 'user'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 max-w-xs truncate text-slate-600 dark:text-slate-300 font-semibold">
                      {appeal.ban_reason || 'Policy violation'}
                    </td>

                    <td className="p-4 max-w-sm truncate text-slate-800 dark:text-slate-200">
                      {appeal.appeal_message}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase ${getStatusBadge(appeal.status)}`}>
                        {appeal.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-4 text-slate-400 text-[11px]">
                      {formatDistanceToNow(new Date(appeal.created_at || Date.now()), { addSuffix: true })}
                    </td>

                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAppeal(appeal);
                          setAdminNotes(appeal.admin_notes || '');
                        }}
                      >
                        Review Appeal
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Appeal Review Modal */}
      {selectedAppeal && (
        <Modal
          isOpen={!!selectedAppeal}
          onClose={() => setSelectedAppeal(null)}
          title={`Review Ban Appeal #${selectedAppeal.id}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-xs">
            {/* User Info Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={selectedAppeal.user?.avatar_url} name={selectedAppeal.user?.full_name || 'User'} size="md" />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {selectedAppeal.user?.full_name}
                  </h4>
                  <p className="text-slate-400 text-xs">
                    @{selectedAppeal.user?.username} · {selectedAppeal.user?.email}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">User ID: {selectedAppeal.user?.id || selectedAppeal.user_id}</p>
                </div>
              </div>

              {selectedAppeal.user?.id && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleViewUserProfile(selectedAppeal.user!.id)}
                >
                  View Profile
                </Button>
              )}
            </div>

            {/* Ban Reason */}
            <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-1">
              <span className="font-bold text-rose-700 dark:text-rose-400 text-[11px] block uppercase">Original Ban Reason:</span>
              <p className="text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                {selectedAppeal.ban_reason || 'Policy violation'}
              </p>
            </div>

            {/* User Appeal Message */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white text-[11px] block uppercase">User's Appeal Statement:</span>
              <p className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed font-medium bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                "{selectedAppeal.appeal_message}"
              </p>

              {selectedAppeal.supporting_info && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-500 text-[10px] block uppercase">Supporting Information:</span>
                  <p className="text-slate-700 dark:text-slate-300 text-xs">{selectedAppeal.supporting_info}</p>
                </div>
              )}

              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                <span>Submitted: {format(new Date(selectedAppeal.created_at || Date.now()), 'PPP · p')}</span>
                <span className={`px-2 py-0.5 rounded-full uppercase font-bold ${getStatusBadge(selectedAppeal.status)}`}>
                  Status: {selectedAppeal.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Moderator Notes input */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Administrative Notes / Response
              </label>
              <Input
                placeholder="Enter notes explaining the approval or rejection decision..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 justify-end">
              <Button variant="ghost" onClick={() => setSelectedAppeal(null)}>
                Close
              </Button>

              <Button
                variant="danger"
                onClick={() => handleReject(selectedAppeal)}
                isLoading={isProcessing}
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Reject Appeal
              </Button>

              <Button
                variant="primary"
                onClick={() => handleApprove(selectedAppeal)}
                isLoading={isProcessing}
                leftIcon={<CheckCircle className="w-4 h-4" />}
              >
                Approve Appeal & Unban User
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal */}
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
