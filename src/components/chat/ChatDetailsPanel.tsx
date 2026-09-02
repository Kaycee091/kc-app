import React, { useState } from 'react';
import { Conversation } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../ui/Avatar';
import { X, Image as ImageIcon, FileText, Ban, Flag, ShieldAlert, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ChatDetailsPanelProps {
  conversation: Conversation;
  onClose: () => void;
}

export const ChatDetailsPanel: React.FC<ChatDetailsPanelProps> = ({ conversation, onClose }) => {
  const { user } = useAuth();
  const { messages, onlineUsers, updateSettings, settings } = useChat();

  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const isGroup = conversation.type === 'group';
  let targetUser = conversation.members.find((m) => m.user_id !== user?.id)?.user;
  
  const displayName = isGroup ? conversation.name || 'Group Chat' : targetUser?.full_name || 'User';
  const username = isGroup ? `${conversation.members.length} members` : `@${targetUser?.username || 'user'}`;
  const avatarUrl = isGroup ? conversation.avatar_url : targetUser?.avatar_url;
  const bio = isGroup ? 'Group Chat for team collaboration' : targetUser?.bio || 'No bio available';
  const isOnline = targetUser ? (onlineUsers.get(targetUser.id) ?? targetUser.is_online) : false;

  // Filter shared media & files from messages
  const sharedMedia = messages.filter((m) => m.message_type === 'image' && m.file_url);
  const sharedFiles = messages.filter((m) => m.message_type === 'file' && m.file_url);

  const isBlocked = targetUser ? settings.blockedUsers.includes(targetUser.id) : false;

  const handleToggleBlock = () => {
    if (!targetUser) return;
    const currentBlocked = settings.blockedUsers;
    const updated = isBlocked
      ? currentBlocked.filter((id) => id !== targetUser!.id)
      : [...currentBlocked, targetUser.id];

    updateSettings({ blockedUsers: updated });
    setIsBlockModalOpen(false);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setIsReportModalOpen(false);
      setReportSubmitted(false);
      setReportReason('');
    }, 1500);
  };

  return (
    <div className="w-80 border-l border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex flex-col h-full z-20 animate-fade-in">
      {/* Header */}
      <div className="h-16 px-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Contact Details
        </h3>
        <button
          onClick={onClose}
          className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* User / Group Card */}
        <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <Avatar
            src={avatarUrl}
            name={displayName}
            size="xl"
            isOnline={isOnline}
            showOnlineStatus={!isGroup}
            isGroup={isGroup}
            className="mb-3"
          />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {displayName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {username}
          </p>

          {!isGroup && (
            <span
              className={clsx(
                'mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold',
                isOnline
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              )}
            >
              {isOnline ? 'Online' : 'Offline'}
            </span>
          )}
        </div>

        {/* Bio Section */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">About</h4>
          <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            {bio}
          </p>
        </div>

        {/* Shared Media Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Shared Media</h4>
            <span className="text-xs font-semibold text-[#5B5FEF]">{sharedMedia.length}</span>
          </div>

          {sharedMedia.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No shared photos</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {sharedMedia.slice(0, 6).map((m) => (
                <img
                  key={m.id}
                  src={m.file_url}
                  alt="Shared media"
                  className="w-full h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(m.file_url, '_blank')}
                />
              ))}
            </div>
          )}
        </div>

        {/* Shared Files Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Shared Files</h4>
            <span className="text-xs font-semibold text-[#5B5FEF]">{sharedFiles.length}</span>
          </div>

          {sharedFiles.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No shared documents</p>
          ) : (
            <div className="space-y-2">
              {sharedFiles.slice(0, 3).map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <FileText className="w-4 h-4 text-[#5B5FEF]" />
                  <span className="truncate flex-1 font-medium">{f.file_name || 'Document.pdf'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions: Block & Report */}
        {!isGroup && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              onClick={() => setIsBlockModalOpen(true)}
              className={clsx(
                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors',
                isBlocked
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 hover:bg-rose-100'
              )}
            >
              <Ban className="w-4 h-4" />
              <span>{isBlocked ? 'Unblock User' : 'Block User'}</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Flag className="w-4 h-4 text-amber-500" />
              <span>Report User</span>
            </button>
          </div>
        )}

      </div>

      {/* BLOCK CONFIRMATION MODAL */}
      <Modal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        title={isBlocked ? 'Unblock User' : 'Block User'}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {isBlocked
              ? `Are you sure you want to unblock ${displayName}? They will be able to message you again.`
              : `Are you sure you want to block ${displayName}? Blocked users cannot send you messages or view your online status.`}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsBlockModalOpen(false)}>
              Cancel
            </Button>
            <Button variant={isBlocked ? 'primary' : 'danger'} onClick={handleToggleBlock}>
              {isBlocked ? 'Confirm Unblock' : 'Block'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* REPORT USER MODAL */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report User"
      >
        {reportSubmitted ? (
          <div className="text-center py-4 space-y-2">
            <Check className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-sm">Report Submitted</h4>
            <p className="text-xs text-slate-500">Thank you for keeping Connecta safe.</p>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Please state why you are reporting <strong>{displayName}</strong>.
            </p>
            <textarea
              required
              rows={3}
              placeholder="Spam, harassment, inappropriate behavior..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-[#5B5FEF] focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsReportModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger">
                Submit Report
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
