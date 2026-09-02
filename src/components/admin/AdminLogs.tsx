import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Search, History, Shield } from 'lucide-react';
import { format } from 'date-fns';

export const AdminLogs: React.FC = () => {
  const { auditLogs } = useAdmin();
  const [search, setSearch] = useState('');

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.admin_name.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Admin Audit Logs</h2>
          <p className="text-xs text-slate-500">Append-only security log tracking every administrative action and system override.</p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">Administrator</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target Type</th>
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
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] uppercase font-bold">
                      {log.target_type}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 max-w-xs truncate">{log.details}</td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                    {format(new Date(log.timestamp), 'MMM d, yyyy · HH:mm:ss')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
