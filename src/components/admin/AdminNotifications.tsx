import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Bell, Send, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export const AdminNotifications: React.FC = () => {
  const { systemNotifications, createSystemNotification } = useAdmin();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<'everyone' | 'new_users' | 'active_users' | 'admins'>('everyone');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    createSystemNotification(title, message, audience);
    setTitle('');
    setMessage('');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">System Announcements & Notifications</h2>
        <p className="text-xs text-slate-500">Broadcast network-wide announcements, maintenance notices, and targeted updates.</p>
      </div>

      <form onSubmit={handleSend} className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create System Announcement</h3>

        <Input
          label="Announcement Title"
          placeholder="e.g. Server Maintenance Notice"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Message Content</label>
          <textarea
            rows={3}
            placeholder="Type your system announcement message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Target Audience</label>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as any)}
            className="w-full p-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          >
            <option value="everyone">🌎 All Registered Users (Everyone)</option>
            <option value="new_users">🆕 New Registrations (Last 7 days)</option>
            <option value="active_users">⚡ Active Daily Users</option>
            <option value="admins">🛡️ Administrative Staff Only</option>
          </select>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" leftIcon={<Send className="w-4 h-4" />}>
            Broadcast Announcement
          </Button>
        </div>
      </form>

      {/* Dispatched History */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Broadcast History</h4>
        {systemNotifications.map((notif) => (
          <div key={notif.id} className="p-4 bg-white dark:bg-slate-800 rounded-3xl border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">{notif.title}</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] text-[10px] font-bold uppercase">
                Audience: {notif.target_audience}
              </span>
            </div>
            <p className="text-xs text-slate-500">{notif.message}</p>
            <span className="text-[10px] text-slate-400 block pt-1">
              Dispatched on {format(new Date(notif.created_at), 'PPP · HH:mm')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
