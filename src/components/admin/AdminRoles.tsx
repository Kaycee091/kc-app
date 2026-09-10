import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AdminRole } from '../../types/admin';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Shield, Key, CheckCircle, UserCheck, Plus } from 'lucide-react';

export const AdminRoles: React.FC = () => {
  const { usersList, changeUserRole } = useAdmin();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<AdminRole>('moderator');

  const adminUsers = usersList.filter((u) => u.role && u.role !== 'user');
  const standardUsers = usersList.filter((u) => u.role === 'user');

  const handlePromoteStaff = () => {
    if (!selectedUserId) return;
    changeUserRole(selectedUserId, selectedRole);
    setIsAddModalOpen(false);
    setSelectedUserId('');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-500" /> Admin Staff & Role Management
          </h1>
          <p className="text-xs text-slate-500">Configure administrative access levels and privileges across Connecta staff members.</p>
        </div>

        <Button size="sm" variant="primary" onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Promote Staff Member
        </Button>
      </div>

      {/* Roles Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { role: 'super_admin', title: 'Super Admin', desc: 'Unrestricted control over platform settings, users, & staff roles.', color: 'bg-rose-500/10 text-rose-500' },
          { role: 'admin', title: 'Administrator', desc: 'Full user moderation, content deletion, & announcement dispatch.', color: 'bg-indigo-500/10 text-indigo-500' },
          { role: 'moderator', title: 'Moderator', desc: 'Report queue processing, post hiding, & content policy enforcement.', color: 'bg-amber-500/10 text-amber-500' },
          { role: 'support', title: 'Support Staff', desc: 'User ticket response, account verification, & basic user assistance.', color: 'bg-emerald-500/10 text-emerald-500' },
        ].map((r) => (
          <div key={r.role} className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${r.color}`}>{r.title}</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Staff Roster */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
          Active Administrative Staff Roster ({adminUsers.length})
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {adminUsers.map((u) => (
            <div key={u.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center gap-3">
                <Avatar src={u.avatar_url} name={u.full_name} size="md" />
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    {u.full_name}
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  </h4>
                  <p className="text-[11px] text-slate-400">@{u.username} • {u.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={u.role}
                  onChange={(e) => changeUserRole(u.id, e.target.value as AdminRole)}
                  className="py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="support">Support</option>
                  <option value="user">Demote to Standard User</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promote Staff Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Promote User to Staff Role" maxWidth="md">
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select User</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            >
              <option value="">-- Choose User Account --</option>
              {standardUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} (@{u.username})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Staff Role Level</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as AdminRole)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
            >
              <option value="moderator">Moderator</option>
              <option value="admin">Administrator</option>
              <option value="support">Support Staff</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handlePromoteStaff} disabled={!selectedUserId}>
              Assign Role
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
