import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial, ActiveTab } from '../../context/SocialContext';
import { useMessenger } from '../../context/MessengerContext';
import { Avatar } from '../ui/Avatar';
import { ConnectionBadge } from '../ui/ConnectionBadge';
import {
  Search,
  Home,
  Users,
  Tv,
  Store,
  MessageSquare,
  Bell,
  User,
  Settings,
  Shield,
  LogOut,
  X,
  Bookmark,
  Calendar,
  Clock
} from 'lucide-react';
import { clsx } from 'clsx';
import { NotificationDropdown } from '../notifications/NotificationDropdown';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    activeTab,
    setActiveTab,
    globalSearchQuery,
    setGlobalSearchQuery,
    unreadNotifCount,
    markNotificationsAsRead,
    setViewingProfileUser,
  } = useSocial();
  const { conversations } = useMessenger();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  const handleNavClick = (tab: ActiveTab) => {
    if (tab === 'profile' && user) {
      setViewingProfileUser(user);
    }
    setActiveTab(tab);
  };

  return (
    <header className="sticky top-0 z-40 h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 flex items-center justify-between transition-colors">
      
      {/* LEFT: Logo & Search Bar */}
      <div className="flex items-center gap-3 min-w-0">
        {/* KC Brand Logo */}
        <div
          onClick={() => handleNavClick('feed')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#8B5CF6] flex items-center justify-center shadow-md shadow-[#2563EB]/25 group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-xl tracking-tighter">KC</span>
          </div>
          <span className="hidden sm:inline-block font-black text-xl tracking-tight text-slate-900 dark:text-white">
            KC
          </span>
        </div>

        {/* Global Search Input */}
        <div className="relative flex items-center max-w-xs w-full hidden sm:flex">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search KC people, posts, groups..."
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all"
          />
          {globalSearchQuery && (
            <button
              onClick={() => setGlobalSearchQuery('')}
              className="absolute right-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* CENTER: Main Navigation Tabs (Desktop) */}
      <nav className="hidden md:flex items-center gap-1 h-full">
        <button
          onClick={() => handleNavClick('feed')}
          className={clsx(
            'h-full px-6 flex items-center justify-center border-b-4 transition-all relative',
            activeTab === 'feed'
              ? 'border-[#2563EB] text-[#2563EB] dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
          )}
          title="Home Feed"
        >
          <Home className="w-6 h-6" />
        </button>

        <button
          onClick={() => handleNavClick('friends')}
          className={clsx(
            'h-full px-6 flex items-center justify-center border-b-4 transition-all relative',
            activeTab === 'friends'
              ? 'border-[#2563EB] text-[#2563EB] dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
          )}
          title="Friends"
        >
          <Users className="w-6 h-6" />
        </button>

        <button
          onClick={() => handleNavClick('watch')}
          className={clsx(
            'h-full px-6 flex items-center justify-center border-b-4 transition-all relative',
            activeTab === 'watch'
              ? 'border-[#2563EB] text-[#2563EB] dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
          )}
          title="Watch Videos"
        >
          <Tv className="w-6 h-6" />
        </button>

        <button
          onClick={() => handleNavClick('marketplace')}
          className={clsx(
            'h-full px-6 flex items-center justify-center border-b-4 transition-all relative',
            activeTab === 'marketplace'
              ? 'border-[#2563EB] text-[#2563EB] dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
          )}
          title="Marketplace"
        >
          <Store className="w-6 h-6" />
        </button>

        <button
          onClick={() => handleNavClick('groups')}
          className={clsx(
            'h-full px-6 flex items-center justify-center border-b-4 transition-all relative',
            activeTab === 'groups'
              ? 'border-[#2563EB] text-[#2563EB] dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
          )}
          title="Groups"
        >
          <Users className="w-6 h-6" />
        </button>
      </nav>

      {/* RIGHT: Notifications, Messenger & Profile Menu */}
      <div className="flex items-center gap-2">
        <ConnectionBadge />

        {/* Messenger Drawer Toggle */}
        <button
          onClick={() => handleNavClick('messages')}
          className={clsx(
            'relative p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors',
            activeTab === 'messages' && 'bg-[#2563EB]/10 text-[#2563EB]'
          )}
          title="Messenger"
        >
          <MessageSquare className="w-5 h-5" />
          {totalUnreadMessages > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-md animate-pulse">
              {totalUnreadMessages}
            </span>
          )}
        </button>

        {/* Notifications Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) markNotificationsAsRead();
            }}
            className="relative p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold shadow-md animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <NotificationDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* Profile Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="focus:outline-none ring-2 ring-transparent focus:ring-[#2563EB] rounded-full transition-all"
          >
            <Avatar
              src={user?.avatar_url}
              name={user?.full_name || 'User'}
              size="md"
              isOnline
              showOnlineStatus
            />
          </button>

          {showUserDropdown && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-slide-up"
              onClick={() => setShowUserDropdown(false)}
            >
              <div
                onClick={() => handleNavClick('profile')}
                className="p-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <Avatar src={user?.avatar_url} name={user?.full_name || 'User'} size="md" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.full_name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">See your profile</p>
                </div>
              </div>

              <button
                onClick={() => handleNavClick('profile')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <User className="w-4 h-4 text-[#2563EB]" />
                <span>View Profile</span>
              </button>

              <button
                onClick={() => handleNavClick('saved')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Bookmark className="w-4 h-4 text-purple-500" />
                <span>Saved Items</span>
              </button>

              <button
                onClick={() => handleNavClick('admin')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Admin Moderation</span>
              </button>

              <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
