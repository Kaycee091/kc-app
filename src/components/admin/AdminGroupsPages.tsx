import React from 'react';
import { useSocial } from '../../context/SocialContext';
import { useAdmin } from '../../context/AdminContext';
import { Button } from '../ui/Button';
import { Users, Globe, Shield, Trash2, CheckCircle2 } from 'lucide-react';

export const AdminGroupsPages: React.FC = () => {
  const { groups, pages, toggleFollowPage } = useSocial();
  const { logAdminAction } = useAdmin();

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Groups & Creator Pages Management</h2>
        <p className="text-xs text-slate-500">Monitor active communities, manage group statuses, and verify creator pages.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((g) => (
          <div key={g.id} className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{g.name}</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-bold uppercase">{g.privacy}</span>
            </div>
            <p className="text-xs text-slate-500">{g.description}</p>
            <div className="flex items-center justify-between pt-2 border-t text-xs">
              <span className="text-[11px] font-semibold text-slate-400">{g.members_count} members</span>
              <Button size="sm" variant="danger" onClick={() => logAdminAction('Suspended Group', 'group', g.id, `Group: ${g.name}`)}>
                Suspend Group
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
