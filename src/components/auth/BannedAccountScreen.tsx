import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types/social';
import { BanAppeal } from '../../types/admin';
import { appealsService } from '../../services/appealsService';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ShieldAlert, AlertTriangle, Send, LogOut, RefreshCw, FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface BannedAccountScreenProps {
  user: UserProfile;
  onLogout: () => void;
}

export const BannedAccountScreen: React.FC<BannedAccountScreenProps> = ({ user, onLogout }) => {
  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [appealMessage, setAppealMessage] = useState('');
  const [supportingInfo, setSupportingInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [myAppeal, setMyAppeal] = useState<BanAppeal | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isSuspended = user.status === 'suspended';

  // Load existing appeal on mount
  useEffect(() => {
    appealsService.getMyAppeal(user.id).then((app) => {
      if (app) setMyAppeal(app);
    });
  }, [user.id]);

  const handleCheckStatus = async () => {
    setIsCheckingStatus(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/v1/users/${user.id}/`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'active') {
          setStatusMessage('Your account has been unbanned! Reloading...');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
          return;
        }
      }
      const app = await appealsService.getMyAppeal(user.id);
      if (app) setMyAppeal(app);
      setStatusMessage('Account status checked: still restricted.');
    } catch {
      setStatusMessage('Could not reach verification server. Please try again.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealMessage.trim()) {
      setSubmitError('Please provide a message explaining your appeal.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const result = await appealsService.submitAppeal({
      userId: user.id,
      appealMessage: appealMessage.trim(),
      supportingInfo: supportingInfo.trim(),
      banReason: user.ban_reason || 'Policy violation',
      userProfile: user,
    });

    setIsSubmitting(false);

    if (result.success && result.appeal) {
      setMyAppeal(result.appeal);
      setAppealModalOpen(false);
      setAppealMessage('');
      setSupportingInfo('');
    } else {
      setSubmitError(result.error || 'Failed to submit appeal. Please try again.');
    }
  };

  const banDateFormatted = user.banned_at
    ? format(new Date(user.banned_at), 'PPP · p')
    : 'Recently';

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 select-none animate-fade-in">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 p-6 sm:p-8 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldAlert className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {isSuspended ? 'Account Suspended' : 'Your Account Has Been Banned'}
          </h1>
          <p className="text-xs sm:text-sm text-rose-100 mt-1 font-medium">
            Access to Connecta features and network services has been revoked.
          </p>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm">
          
          {/* User ID card */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <Avatar src={user.avatar_url} name={user.full_name || 'User'} size="md" />
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-slate-900 dark:text-white truncate">
                {user.full_name}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                @{user.username} · {user.email}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400">
              {isSuspended ? 'Suspended' : 'Banned'}
            </span>
          </div>

          {/* Ban Details Box */}
          <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
              <span className="font-semibold">Action Timestamp</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{banDateFormatted}</span>
            </div>

            <div className="pt-2 border-t border-rose-100 dark:border-rose-900/40">
              <span className="font-bold text-rose-700 dark:text-rose-400 block mb-1">Reason for Ban:</span>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-rose-100 dark:border-rose-900/40">
                {user.ban_reason ? user.ban_reason : 'No specific reason was provided by administration.'}
              </p>
            </div>
          </div>

          {/* Appeal Status Card (if appeal submitted) */}
          {myAppeal && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-500" /> Ban Appeal Status
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    myAppeal.status === 'pending'
                      ? 'bg-amber-100 text-amber-700'
                      : myAppeal.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {myAppeal.status.replace('_', ' ')}
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-xs italic">
                "{myAppeal.appeal_message}"
              </p>

              {myAppeal.admin_notes && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-[11px] text-slate-500 block">Moderator Response:</span>
                  <p className="text-slate-700 dark:text-slate-200 text-xs">{myAppeal.admin_notes}</p>
                </div>
              )}

              <span className="text-[10px] text-slate-400 block">
                Submitted {format(new Date(myAppeal.created_at || Date.now()), 'PPP')}
              </span>
            </div>
          )}

          {/* Feedback message */}
          {statusMessage && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 text-xs text-center font-semibold">
              {statusMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            {!myAppeal || myAppeal.status === 'rejected' ? (
              <Button
                variant="primary"
                className="w-full py-3 text-sm font-bold shadow-lg shadow-blue-500/25"
                onClick={() => setAppealModalOpen(true)}
                leftIcon={<Send className="w-4 h-4" />}
              >
                {myAppeal?.status === 'rejected' ? 'Submit New Appeal' : 'Appeal Ban'}
              </Button>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2 font-medium">
                <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>Your appeal is currently being reviewed by administrators. Please check back later.</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 py-2.5 text-xs font-bold"
                onClick={handleCheckStatus}
                isLoading={isCheckingStatus}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Check Status
              </Button>

              <Button
                variant="ghost"
                className="flex-1 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                onClick={onLogout}
                leftIcon={<LogOut className="w-3.5 h-3.5" />}
              >
                Log Out
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Appeal Submission Modal */}
      <Modal
        isOpen={appealModalOpen}
        onClose={() => setAppealModalOpen(false)}
        title="Submit Ban Appeal"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitAppeal} className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            If you believe your account was banned in error or you would like to request reconsideration, please provide a detailed explanation.
          </p>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Why should your account be reinstated? <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Explain why your ban should be lifted, acknowledge rules, or provide context..."
              value={appealMessage}
              onChange={(e) => setAppealMessage(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Supporting Information <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Any additional details, links, or contact details..."
              value={supportingInfo}
              onChange={(e) => setSupportingInfo(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
            />
          </div>

          {submitError && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 text-xs font-bold">
              {submitError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setAppealModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting} leftIcon={<Send className="w-3.5 h-3.5" />}>
              Submit Appeal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
