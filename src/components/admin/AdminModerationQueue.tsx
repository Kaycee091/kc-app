import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useSocial } from '../../context/SocialContext';
import { Button } from '../ui/Button';
import { ShieldAlert, Check, Trash2, ArrowUpRight, Filter } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

export const AdminModerationQueue: React.FC = () => {
  const { logAdminAction } = useAdmin();
  const { deletePost } = useSocial();

  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const queueItems = [
    {
      id: 'mod_1',
      content: 'Limited offer! Click this suspicious link to claim $500 gift voucher immediately!',
      author: { name: 'Bot Account', username: 'spammer_99', avatar: '' },
      reason: 'AI Spam Detection Filter',
      reportCount: 4,
      priority: 'high' as const,
      created_at: '10m ago',
    },
    {
      id: 'mod_2',
      content: 'Inappropriate media upload flagged by automated NSFW detection model.',
      author: { name: 'David Miller', username: 'david_m', avatar: '' },
      reason: 'Automated NSFW Classifier',
      reportCount: 2,
      priority: 'medium' as const,
      created_at: '30m ago',
    },
  ];

  const filteredItems = priorityFilter === 'all'
    ? queueItems
    : queueItems.filter((i) => i.priority === priorityFilter);

  const handleApprove = (id: string) => {
    logAdminAction('Approved Content in Moderation Queue', 'post', id, 'Content marked safe');
  };

  const handleRemove = (id: string) => {
    logAdminAction('Removed Content from Moderation Queue', 'post', id, 'Content removed by moderator');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Moderation Queue</h2>
          <p className="text-xs text-slate-500">Review content requiring moderator attention before public distribution.</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
          {(['all', 'high', 'medium', 'low'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
                priorityFilter === p ? 'bg-white dark:bg-slate-700 text-[#2563EB] shadow-sm' : 'text-slate-500'
              }`}
            >
              {p} Priority
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={item.author.name} size="md" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.author.name}</h4>
                  <p className="text-[10px] text-slate-400">@{item.author.username} · {item.created_at}</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                item.priority === 'high' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
              }`}>
                {item.priority} Priority
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-200">
              <span className="text-[10px] font-bold text-rose-500 block mb-1">Trigger: {item.reason} ({item.reportCount} reports)</span>
              <p>{item.content}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <Button size="sm" variant="ghost" onClick={() => handleApprove(item.id)}>
                Approve (Mark Safe)
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleRemove(item.id)} leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
                Remove Content
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
