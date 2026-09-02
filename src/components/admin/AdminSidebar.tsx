import React, { useState } from 'react';
import { useAdmin, AdminRoute } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Image,
  Globe,
  Calendar,
  Store,
  Mail,
  Flag,
  ShieldAlert,
  BarChart2,
  Bell,
  History,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';
import { clsx } from 'clsx';

export const AdminSidebar: React.FC = () => {
  const { activeAdminRoute, setActiveAdminRoute, stats } = useAdmin();
  const { user, logout } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const navGroups: {
    title: string;
    items: { id: AdminRoute; label: string; icon: React.ReactNode; badge?: number }[];
  }[] = [
    {
      title: 'OVERVIEW',
      items: [{ id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> }],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
        { id: 'posts', label: 'Posts', icon: <FileText className="w-4 h-4" /> },
        { id: 'comments', label: 'Comments', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'stories', label: 'Stories', icon: <Image className="w-4 h-4" /> },
        { id: 'groups', label: 'Groups', icon: <Users className="w-4 h-4" /> },
        { id: 'pages', label: 'Pages', icon: <Globe className="w-4 h-4" /> },
        { id: 'events', label: 'Events', icon: <Calendar className="w-4 h-4" /> },
        { id: 'marketplace', label: 'Marketplace', icon: <Store className="w-4 h-4" /> },
        { id: 'messages', label: 'Messages', icon: <Mail className="w-4 h-4" /> },
      ],
    },
    {
      title: 'MODERATION',
      items: [
        { id: 'reports', label: 'Reports', icon: <Flag className="w-4 h-4" />, badge: stats.pendingReports },
        { id: 'moderation', label: 'Moderation Queue', icon: <ShieldAlert className="w-4 h-4" />, badge: 8 },
      ],
    },
    {
      title: 'ANALYTICS',
      items: [{ id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> }],
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
        { id: 'logs', label: 'Admin Logs', icon: <History className="w-4 h-4" /> },
        { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <aside
      className={clsx(
        'h-screen sticky top-0 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 z-40 border-r border-slate-800',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header & Toggle */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#2563EB]/40">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-black text-white tracking-tight text-base block leading-none">Connecta</span>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">ADMIN PANEL</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors mx-auto"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Streams */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-none">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!isCollapsed && (
              <h5 className="text-[10px] font-black tracking-wider uppercase text-slate-500 px-3 mb-1">
                {group.title}
              </h5>
            )}

            {group.items.map((item) => {
              const isActive = activeAdminRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveAdminRoute(item.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 relative group',
                    isActive
                      ? 'bg-[#2563EB] text-white font-bold shadow-md shadow-[#2563EB]/30'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className={clsx(isActive ? 'text-white' : 'text-slate-400 group-hover:text-white')}>
                    {item.icon}
                  </span>

                  {!isCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={clsx(
                        'px-1.5 py-0.5 rounded-full text-[10px] font-black',
                        isActive ? 'bg-white text-[#2563EB]' : 'bg-rose-500 text-white'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-800 flex flex-col gap-2 flex-shrink-0 bg-slate-950/40">
        {!isCollapsed && (
          <div className="flex items-center gap-3 px-2 py-1">
            <Avatar src={user?.avatar_url} name={user?.full_name || 'Admin'} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>

    </aside>
  );
};
