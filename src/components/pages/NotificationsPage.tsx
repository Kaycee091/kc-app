import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Bell, Check, UserPlus, Heart, MessageSquare, Shield, Trash2, Filter } from 'lucide-react';
import { clsx } from 'clsx';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadNotifCount, markNotificationsAsRead, acceptFriendRequest, rejectFriendRequest } = useSocial();
  const [filter, setFilter] = useState<'all' | 'unread' | 'requests'>('all');

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'requests') return n.type === 'friend_request';
    return true;
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Notifications Hub</h1>
            <p className="text-xs text-slate-500">Stay updated on friend requests, reactions, comments, and system notices.</p>
          </div>
        </div>

        {unreadNotifCount > 0 && (
          <Button variant="outline" size="sm" onClick={markNotificationsAsRead} leftIcon={<Check className="w-4 h-4" />}>
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={clsx('px-4 py-2 rounded-2xl text-xs font-bold transition-all', filter === 'all' ? 'bg-[#2563EB] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400')}
        >
          All Activity ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={clsx('px-4 py-2 rounded-2xl text-xs font-bold transition-all', filter === 'unread' ? 'bg-[#2563EB] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400')}
        >
          Unread ({unreadNotifCount})
        </button>
        <button
          onClick={() => setFilter('requests')}
          className={clsx('px-4 py-2 rounded-2xl text-xs font-bold transition-all', filter === 'requests' ? 'bg-[#2563EB] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400')}
        >
          Friend Requests
        </button>
      </div>

      {/* Stream */}
      {filteredNotifs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No Notifications</h3>
          <p className="text-xs text-slate-400 mt-1">You are all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((n) => (
            <div
              key={n.id}
              className={clsx(
                'p-4 rounded-3xl border transition-all flex items-start justify-between gap-4',
                !n.is_read
                  ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                  : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700'
              )}
            >
              <div className="flex items-start gap-3 min-w-0">
                <Avatar src={n.actor?.avatar_url} name={n.actor?.full_name || 'System'} size="md" />
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{n.title}</h4>
                  {n.message && <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>}
                  <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {n.type === 'friend_request' && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button size="sm" variant="primary" onClick={() => acceptFriendRequest(n.id)}>
                    Accept
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => rejectFriendRequest(n.id)}>
                    Decline
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
