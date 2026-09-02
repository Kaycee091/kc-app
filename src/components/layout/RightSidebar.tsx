import React from 'react';
import { useSocial } from '../../context/SocialContext';
import { useMessenger } from '../../context/MessengerContext';
import { Avatar } from '../ui/Avatar';
import { Gift, ExternalLink, UserCheck, UserX } from 'lucide-react';
import { DEMO_USERS } from '../../services/mockSocialData';

export const RightSidebar: React.FC = () => {
  const { friendRequests, acceptFriendRequest, rejectFriendRequest } = useSocial();
  const { openDockedChat } = useMessenger();

  const contacts = DEMO_USERS.slice(1);

  return (
    <aside className="w-72 lg:w-80 flex-shrink-0 hidden lg:flex flex-col h-[calc(100vh-3.5rem)] sticky top-14 p-3 overflow-y-auto border-l border-slate-200/60 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm space-y-5">
      
      {/* Sponsored Banner */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sponsored</h4>
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm group cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80"
            alt="KC Cloud Conference"
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#2563EB] transition-colors truncate">
              KC Cloud Tech Summit 2026
            </h5>
            <p className="text-[11px] text-slate-500 truncate">kc.app/summit</p>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Friend Requests Widget */}
      {friendRequests.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Friend Requests</h4>
            <span className="text-xs font-bold text-[#2563EB]">{friendRequests.length}</span>
          </div>

          <div className="space-y-2">
            {friendRequests.map((req) => (
              <div
                key={req.id}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-2"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar src={req.actor?.avatar_url} name={req.actor?.full_name || 'User'} size="md" />
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {req.actor?.full_name}
                    </h5>
                    <p className="text-[10px] text-slate-400 truncate">1 mutual friend</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => acceptFriendRequest(req.id)}
                    className="py-1.5 px-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(req.id)}
                    className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Birthdays Widget */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Birthdays</h4>
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200/60 dark:border-purple-900/40 text-xs">
          <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          <p className="text-slate-700 dark:text-slate-200 font-medium">
            <strong className="text-slate-900 dark:text-white">Sarah Adams</strong> and 2 others have birthdays today.
          </p>
        </div>
      </div>

      {/* Active Contacts Messenger List */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Contacts</h4>
          <span className="text-[11px] font-semibold text-emerald-500">● Live</span>
        </div>

        <div className="space-y-1">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => openDockedChat(contact)}
              className="flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors group"
            >
              <Avatar
                src={contact.avatar_url}
                name={contact.full_name}
                size="md"
                isOnline={contact.is_online}
                showOnlineStatus
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#2563EB] transition-colors truncate">
                {contact.full_name}
              </span>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
};
