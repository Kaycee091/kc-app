import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial, ActiveTab } from '../../context/SocialContext';
import { Avatar } from '../ui/Avatar';
import {
  Home,
  Users,
  Store,
  Tv,
  Clock,
  Bookmark,
  Calendar,
  Shield,
  FileText,
  Settings
} from 'lucide-react';
import { clsx } from 'clsx';

export const LeftSidebar: React.FC = () => {
  const { user } = useAuth();
  const { activeTab, setActiveTab, setViewingProfileUser } = useSocial();

  const handleNav = (tab: ActiveTab) => {
    if (tab === 'profile' && user) {
      setViewingProfileUser(user);
    }
    setActiveTab(tab);
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'feed', label: 'Home Feed', icon: <Home className="w-5 h-5" />, color: 'text-[#2563EB]' },
    { id: 'friends', label: 'Friends', icon: <Users className="w-5 h-5" />, color: 'text-[#2563EB]' },
    { id: 'groups', label: 'Groups', icon: <Users className="w-5 h-5" />, color: 'text-indigo-500' },
    { id: 'marketplace', label: 'Marketplace', icon: <Store className="w-5 h-5" />, color: 'text-emerald-500' },
    { id: 'watch', label: 'Watch Videos', icon: <Tv className="w-5 h-5" />, color: 'text-rose-500' },
    { id: 'memories', label: 'Memories', icon: <Clock className="w-5 h-5" />, color: 'text-amber-500' },
    { id: 'saved', label: 'Saved Posts', icon: <Bookmark className="w-5 h-5" />, color: 'text-purple-500' },
    { id: 'events', label: 'Events', icon: <Calendar className="w-5 h-5" />, color: 'text-teal-500' },
    { id: 'admin', label: 'Admin Moderation', icon: <Shield className="w-5 h-5" />, color: 'text-red-500' },
  ];

  return (
    <aside className="w-64 lg:w-72 flex-shrink-0 hidden md:flex flex-col h-[calc(100vh-3.5rem)] sticky top-14 p-3 overflow-y-auto border-r border-slate-200/60 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
      
      {/* User Profile Card Shortcut */}
      <div
        onClick={() => handleNav('profile')}
        className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors mb-2"
      >
        <Avatar src={user?.avatar_url} name={user?.full_name || 'User'} size="md" />
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {user?.full_name}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">@{user?.username}</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={clsx(
                'w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl font-bold text-xs transition-all duration-150',
                isActive
                  ? 'bg-[#2563EB]/10 dark:bg-[#2563EB]/20 text-[#2563EB] dark:text-blue-400 shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              )}
            >
              <span className={clsx(isActive ? 'text-[#2563EB]' : item.color)}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-400 space-y-1 px-3">
        <p>KC Social Network © 2026</p>
        <p className="opacity-80">Privacy · Terms · Cookies · Settings</p>
      </div>

    </aside>
  );
};
