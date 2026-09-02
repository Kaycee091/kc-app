import React from 'react';
import { useSocial } from '../../context/SocialContext';
import { Avatar } from '../ui/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, UserPlus, Check, X } from 'lucide-react';

interface NotificationDropdownProps {
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { notifications, acceptFriendRequest, rejectFriendRequest } = useSocial();

  return (
    <div
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 py-3 z-50 animate-slide-up"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-700">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
        {notifications.length === 0 ? (
          <p className="text-xs text-center text-slate-400 py-6">No new notifications</p>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="p-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <Avatar src={n.actor?.avatar_url} name={n.actor?.full_name || 'User'} size="md" />

              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-900 dark:text-slate-100 font-medium">
                  {n.title}
                </p>
                <span className="text-[10px] text-slate-400">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </span>

                {n.type === 'friend_request' && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => acceptFriendRequest(n.id)}
                      className="px-3 py-1 rounded-xl bg-[#2563EB] text-white text-xs font-bold shadow-sm hover:bg-blue-700"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => rejectFriendRequest(n.id)}
                      className="px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
