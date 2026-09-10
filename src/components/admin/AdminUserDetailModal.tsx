import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input';
import { useAdmin } from '../../context/AdminContext';
import { useSocial } from '../../context/SocialContext';
import { AdminRole, AdminUser } from '../../types/admin';
import { Shield, CheckCircle, Ban, AlertTriangle, Trash2, Key, History, Mail, Calendar, MapPin, Globe } from 'lucide-react';
import { clsx } from 'clsx';

interface AdminUserDetailModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminUserDetailModal: React.FC<AdminUserDetailModalProps> = ({ user, isOpen, onClose }) => {
  const { suspendUser, unsuspendUser, banUser, unbanUser, deleteUserAccount, changeUserRole } = useAdmin();
  const { posts, reports } = useSocial();
  const [activeTab, setActiveTab] = useState<'account' | 'profile' | 'activity' | 'moderation'>('account');
  const [reason, setReason] = useState('');

  if (!user) return null;

  const userPosts = posts.filter((p) => p.author_id === user.id || p.author?.username === user.username);
  const userReports = reports.filter((r) => r.reporter_id === user.id || r.item_id === user.id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Administrator View: ${user.full_name}`} maxWidth="xl">
      <div className="space-y-6 text-xs">
        {/* User Card Header */}
        <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Avatar src={user.avatar_url} name={user.full_name} size="lg" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                {user.full_name}
                {user.is_verified && <CheckCircle className="w-4 h-4 text-emerald-500" />}
              </h3>
              <p className="text-slate-500 font-bold">@{user.username} • {user.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full font-black uppercase text-[10px] bg-[#2563EB]/10 text-[#2563EB]">
                ROLE: {user.role} | STATUS: {user.status}
              </span>
            </div>
          </div>

          {/* Quick Status Action Controls */}
          <div className="flex flex-wrap gap-2">
            {user.status === 'suspended' ? (
              <Button size="sm" variant="outline" onClick={() => unsuspendUser(user.id)}>
                Unsuspend
              </Button>
            ) : (
              <Button size="sm" variant="danger" onClick={() => suspendUser(user.id, reason || 'Suspended by admin')}>
                Suspend
              </Button>
            )}

            {user.status === 'banned' ? (
              <Button size="sm" variant="outline" onClick={() => unbanUser(user.id)}>
                Unban
              </Button>
            ) : (
              <Button size="sm" variant="danger" onClick={() => banUser(user.id, reason || 'Banned by admin')}>
                Ban
              </Button>
            )}
          </div>
        </div>

        {/* Subtabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {(['account', 'profile', 'activity', 'moderation'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'px-4 py-2 rounded-xl font-bold capitalize transition-all',
                activeTab === tab ? 'bg-[#2563EB] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'account' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between"><span className="text-slate-500">User ID</span><span className="font-mono font-bold text-slate-900 dark:text-white">{user.id}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Registration Date</span><span className="font-bold text-slate-900 dark:text-white">{new Date(user.joined_at || Date.now()).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Last Active</span><span className="font-bold text-slate-900 dark:text-white">{new Date(user.last_active || Date.now()).toLocaleString()}</span></div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white">Role Assignment</h4>
              <select
                value={user.role}
                onChange={(e) => changeUserRole(user.id, e.target.value as AdminRole)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
              >
                <option value="user">User (Standard)</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
                <option value="support">Support</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex justify-between"><span className="text-slate-500">Full Name</span><span className="font-bold text-slate-900 dark:text-white">{user.full_name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Location</span><span className="font-bold text-slate-900 dark:text-white">{user.location || 'San Francisco, CA'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Bio</span><span className="font-bold text-slate-900 dark:text-white">{user.bio || 'No bio provided.'}</span></div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white">User Posts ({userPosts.length})</h4>
            {userPosts.length === 0 ? (
              <p className="text-slate-400">No posts published by this user.</p>
            ) : (
              userPosts.map((p) => (
                <div key={p.id} className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 font-medium">
                  <p className="font-bold text-slate-900 dark:text-white">{p.content}</p>
                  <span className="text-[10px] text-slate-400">{new Date(p.created_at).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="space-y-4">
            <Input
              label="Moderation Action Note / Reason"
              placeholder="Reason for suspension or ban..."
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}
            />
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="danger" size="sm" onClick={() => deleteUserAccount(user.id)} leftIcon={<Trash2 className="w-4 h-4" />}>
                Permanently Delete Account
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
