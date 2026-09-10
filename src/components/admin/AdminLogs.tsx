import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Search, History, Shield, Trash2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { AdminConfirmModal } from './AdminConfirmModal';

export const AdminLogs: React.FC = () => {
  const { auditLogs, clearAuditLogs } = useAdmin();
  const [search, setSearch] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('all');

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const filteredLogs = auditLogs.filter((l) => {
    const matchesSearch =
      l.admin_name.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.target_id.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (targetTypeFilter !== 'all' && l.target_type !== targetTypeFilter) return false;
    return true;
  });

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(auditLogs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `connecta_audit_logs_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-500" /> Admin Audit Logs
          </h2>
          <p className="text-xs text-slate-500">Append-only security log tracking every administrative action, moderation decision, and system override.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="w-full sm:w-48">
            <Input
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
            />
          </div>

          <select
            value={targetTypeFilter}
            onChange={(e) => setTargetTypeFilter(e.target.value)}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Targets</option>
            <option value="user">User</option>
            <option value="post">Post</option>
            <option value="report">Report</option>
            <option value="setting">Setting</option>
            <option value="group">Group</option>
            <option value="marketplace">Marketplace</option>
          </select>

          <Button size="sm" variant="outline" onClick={handleExportJSON} leftIcon={<Download className="w-3.5 h-3.5" />}>
            Export JSON
          </Button>

          <Button size="sm" variant="danger" onClick={() => setConfirmModalOpen(true)} leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
            Clear Logs
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 p-6 space-y-2">
            <History className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 dark:text-slate-200">No Audit Logs Found</h3>
            <p className="text-xs text-slate-400">No logs match the selected filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Administrator</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target Type</th>
                  <th className="p-4">Target ID</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{log.admin_name}</p>
                        <span className="text-[10px] font-bold text-[#2563EB] uppercase">{log.admin_role}</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{log.action}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] uppercase font-bold text-slate-600 dark:text-slate-300">
                        {log.target_type}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-500">{log.target_id}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">{log.details}</td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {format(new Date(log.timestamp || Date.now()), 'MMM d, yyyy · HH:mm:ss')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={clearAuditLogs}
        title="Clear Admin Audit Logs"
        description="Are you sure you want to clear all audit logs? This action is recorded."
      />
    </div>
  );
};
