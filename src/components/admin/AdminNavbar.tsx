import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../ui/Avatar';
import { Search, Bell, Sun, Moon, Shield, LogOut, ArrowLeft, X, AlertCircle } from 'lucide-react';

interface AdminNavbarProps {
  onSwitchToApp: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ onSwitchToApp }) => {
  const { user, logout } = useAuth();
  const { adminSearchQuery, setAdminSearchQuery, stats, setActiveAdminRoute } = useAdmin();
  const { theme, setTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const notifications = [
    { id: 1, text: 'New content report submitted by Sarah', time: '5m ago', priority: 'high' },
    { id: 2, text: 'Spike in new user registrations (+48 today)', time: '1h ago', priority: 'info' },
    { id: 3, text: 'Auto-moderation flagged 2 posts for review', time: '2h ago', priority: 'medium' },
  ];

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      
      {/* Global Admin Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search users, posts, reports, groups..."
            value={adminSearchQuery}
            onChange={(e) => setAdminSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 transition-all"
          />
          {adminSearchQuery && (
            <button
              onClick={() => setAdminSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Navbar Actions */}
      <div className="flex items-center gap-3">
        {/* Switch back to normal Connecta App */}
        <button
          onClick={onSwitchToApp}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
          title="Back to Social Application"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Connecta App</span>
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {stats.pendingReports > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black shadow-md animate-pulse">
                {stats.pendingReports}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Admin Alerts</h4>
                <span className="text-[10px] text-slate-400">3 Alerts</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 text-xs flex items-start gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{n.text}</p>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAdminMenu(!showAdminMenu)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Avatar src={user?.avatar_url} name={user?.full_name || 'Admin'} size="sm" />
            <div className="hidden lg:block text-left pr-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{user?.full_name}</p>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
                {user?.role || 'super_admin'}
              </span>
            </div>
          </button>

          {showAdminMenu && (
            <div
              className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1 z-50 text-xs font-semibold"
              onClick={() => setShowAdminMenu(false)}
            >
              <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                <p className="font-bold text-slate-900 dark:text-white">{user?.full_name}</p>
                <p className="text-[11px] text-slate-400">{user?.email}</p>
              </div>

              <button
                onClick={() => setActiveAdminRoute('settings')}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Shield className="w-4 h-4 text-[#2563EB]" />
                <span>Admin Settings</span>
              </button>

              <button
                onClick={onSwitchToApp}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ArrowLeft className="w-4 h-4 text-purple-500" />
                <span>Switch to Connecta</span>
              </button>

              <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
