import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AdminUser, AdminRole } from '../../types/admin';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { AdminConfirmModal } from './AdminConfirmModal';
import { Search, Shield, ShieldAlert, UserX, UserCheck, Trash2, Eye, Edit2, Key, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export const AdminUsers: React.FC = () => {
  const {
    usersList,
    suspendUser,
    unsuspendUser,
    banUser,
    unbanUser,
    deleteUserAccount,
    changeUserRole,
  } = useAdmin();

  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'suspended' | 'banned' | 'admins'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Selected User Modal State
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Confirm Modal Trigger State
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

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterTab === 'active') return u.status === 'active';
    if (filterTab === 'suspended') return u.status === 'suspended';
    if (filterTab === 'banned') return u.status === 'banned';
    if (filterTab === 'admins') return u.role === 'super_admin' || u.role === 'admin' || u.role === 'moderator';
    return true;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getRoleBadge = (role: AdminRole) => {
    const badges: Record<AdminRole, string> = {
      super_admin: 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 font-black',
      admin: 'bg-blue-100 dark:bg-blue-950/60 text-[#2563EB] font-bold',
      moderator: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 font-bold',
      support: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 font-bold',
      user: 'bg-slate-100 dark:bg-slate-800 text-slate-600 font-semibold',
    };
    return badges[role] || badges.user;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'suspended') return 'bg-amber-100 text-amber-700 font-bold';
    if (status === 'banned') return 'bg-rose-100 text-rose-700 font-bold';
    return 'bg-emerald-100 text-emerald-700 font-bold';
  };

  const triggerSuspendConfirm = (user: AdminUser) => {
    setConfirmModalState({
      isOpen: true,
      title: `Suspend Account: ${user.full_name}`,
      description: `Are you sure you want to suspend @${user.username}? They will temporarily lose access to Connecta services.`,
      action: () => suspendUser(user.id),
    });
  };

  const triggerBanConfirm = (user: AdminUser) => {
    setConfirmModalState({
      isOpen: true,
      title: `Permanently Ban User: ${user.full_name}`,
      description: `WARNING: Banning @${user.username} will revoke access permanently across all devices.`,
      action: () => banUser(user.id),
    });
  };

  const triggerDeleteConfirm = (user: AdminUser) => {
    setConfirmModalState({
      isOpen: true,
      title: `Delete User Account: ${user.full_name}`,
      description: `DANGER: This action cannot be undone. All posts, messages, and profile information for @${user.username} will be deleted.`,
      action: () => deleteUserAccount(user.id),
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">User Management</h2>
          <p className="text-xs text-slate-500">View, moderate, search, and manage registered Connecta accounts.</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
          {(['all', 'active', 'suspended', 'banned', 'admins'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setFilterTab(tab);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterTab === tab ? 'bg-white dark:bg-slate-700 text-[#2563EB] shadow-sm' : 'text-slate-500'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, username, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No users matching search or filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={u.avatar_url} name={u.full_name} size="md" isOnline={u.is_online} showOnlineStatus />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{u.full_name}</p>
                          <p className="text-[11px] text-slate-400">@{u.username} · {u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase ${getStatusBadge(u.status)}`}>
                        {u.status}
                      </span>
                    </td>

                    <td className="p-4 text-slate-500">
                      {format(new Date(u.joined_at), 'MMM d, yyyy')}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="p-2 rounded-xl text-slate-500 hover:text-[#2563EB] hover:bg-slate-100 dark:hover:bg-slate-700"
                          title="View Profile Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {u.status === 'suspended' ? (
                          <button
                            onClick={() => unsuspendUser(u.id)}
                            className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50"
                            title="Unsuspend User"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => triggerSuspendConfirm(u)}
                            className="p-2 rounded-xl text-amber-500 hover:bg-amber-50"
                            title="Suspend User"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => triggerBanConfirm(u)}
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50"
                          title="Ban User"
                        >
                          <UserX className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => triggerDeleteConfirm(u)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Showing page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Selected User Details Modal (/admin/users/:id) */}
      {selectedUser && (
        <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Account Details" maxWidth="lg">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <Avatar src={selectedUser.avatar_url} name={selectedUser.full_name} size="xl" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedUser.full_name}</h3>
                <p className="text-xs text-slate-500">@{selectedUser.username} · {selectedUser.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase ${getRoleBadge(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase ${getStatusBadge(selectedUser.status)}`}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Change Role Selector */}
            <div className="p-3 rounded-2xl border space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Assign Administrative Role:</span>
              <div className="flex flex-wrap gap-2">
                {(['super_admin', 'admin', 'moderator', 'support', 'user'] as AdminRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      changeUserRole(selectedUser.id, r);
                      setSelectedUser({ ...selectedUser, role: r });
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition-all ${
                      selectedUser.role === r ? 'bg-[#2563EB] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog */}
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
