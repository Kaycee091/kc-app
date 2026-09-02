import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { UserPlus, UserCheck, UserX, Search } from 'lucide-react';
import { DEMO_USERS } from '../../services/mockSocialData';
import { useAuth } from '../../context/AuthContext';

export const FriendsView: React.FC = () => {
  const { friends, friendRequests, acceptFriendRequest, rejectFriendRequest, sendFriendRequest } = useSocial();
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState<'all' | 'requests' | 'suggestions'>('all');

  const suggestions = DEMO_USERS.filter((u) => u.id !== currentUser?.id && !friends.some((f) => f.id === u.id));

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Friends & Connections</h2>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${tab === 'all' ? 'bg-white dark:bg-slate-700 text-[#2563EB] shadow' : 'text-slate-500'}`}
          >
            All Friends ({friends.length})
          </button>
          <button
            onClick={() => setTab('requests')}
            className={`px-3 py-1.5 rounded-lg transition-all ${tab === 'requests' ? 'bg-white dark:bg-slate-700 text-[#2563EB] shadow' : 'text-slate-500'}`}
          >
            Requests ({friendRequests.length})
          </button>
          <button
            onClick={() => setTab('suggestions')}
            className={`px-3 py-1.5 rounded-lg transition-all ${tab === 'suggestions' ? 'bg-white dark:bg-slate-700 text-[#2563EB] shadow' : 'text-slate-500'}`}
          >
            Suggestions
          </button>
        </div>
      </div>

      {tab === 'all' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {friends.map((f) => (
            <div key={f.id} className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={f.avatar_url} name={f.full_name} size="lg" isOnline showOnlineStatus />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{f.full_name}</h4>
                  <p className="text-[11px] text-slate-400">@{f.username}</p>
                </div>
              </div>
              <UserCheck className="w-5 h-5 text-emerald-500" />
            </div>
          ))}
        </div>
      )}

      {tab === 'requests' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {friendRequests.length === 0 ? (
            <p className="text-xs text-slate-400 py-6">No pending friend requests</p>
          ) : (
            friendRequests.map((req) => (
              <div key={req.id} className="p-4 bg-white dark:bg-slate-800 rounded-3xl border space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar src={req.actor?.avatar_url} name={req.actor?.full_name || 'User'} size="lg" />
                  <div>
                    <h4 className="text-xs font-bold">{req.actor?.full_name}</h4>
                    <p className="text-[10px] text-slate-400">Sent a friend request</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="primary" onClick={() => acceptFriendRequest(req.id)}>
                    Confirm
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => rejectFriendRequest(req.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'suggestions' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {suggestions.map((u) => (
            <div key={u.id} className="p-4 bg-white dark:bg-slate-800 rounded-3xl border text-center space-y-3">
              <Avatar src={u.avatar_url} name={u.full_name} size="xl" className="mx-auto" />
              <div>
                <h4 className="text-xs font-bold">{u.full_name}</h4>
                <p className="text-[10px] text-slate-400">@{u.username}</p>
              </div>
              <Button size="sm" variant="outline" className="w-full" onClick={() => sendFriendRequest(u.id)} leftIcon={<UserPlus className="w-4 h-4" />}>
                Add Friend
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
