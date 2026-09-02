import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  FileText,
  MessageSquare,
  Flag,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  UserPlus,
  Bell,
  BarChart2,
  Shield,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { stats, setActiveAdminRoute, auditLogs } = useAdmin();
  const [chartFilter, setChartFilter] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const quickActions = [
    { label: 'Manage Users', route: 'users' as const, icon: <Users className="w-4 h-4 text-blue-500" /> },
    { label: 'Review Reports', route: 'reports' as const, icon: <Flag className="w-4 h-4 text-rose-500" />, badge: stats.pendingReports },
    { label: 'Moderate Content', route: 'moderation' as const, icon: <ShieldAlert className="w-4 h-4 text-amber-500" /> },
    { label: 'Send Announcement', route: 'notifications' as const, icon: <Bell className="w-4 h-4 text-purple-500" /> },
    { label: 'View Analytics', route: 'analytics' as const, icon: <BarChart2 className="w-4 h-4 text-emerald-500" /> },
  ];

  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'created an account', time: new Date(Date.now() - 4 * 60000).toISOString(), icon: <UserPlus className="w-4 h-4 text-blue-500" /> },
    { id: 2, user: 'Sarah Adams', action: 'reported a post for inappropriate content', time: new Date(Date.now() - 15 * 60000).toISOString(), icon: <Flag className="w-4 h-4 text-rose-500" /> },
    { id: 3, user: 'David Miller', action: 'created a new group "KC Photographers"', time: new Date(Date.now() - 42 * 60000).toISOString(), icon: <Users className="w-4 h-4 text-indigo-500" /> },
    { id: 4, user: 'Alex Johnson', action: 'updated auto-moderation thresholds', time: new Date(Date.now() - 120 * 60000).toISOString(), icon: <Shield className="w-4 h-4 text-emerald-500" /> },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl shadow-xl">
        <div className="space-y-1">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Connecta SaaS Administration</span>
          <h1 className="text-2xl font-black">Good morning, {user?.first_name || 'Admin'} 👋</h1>
          <p className="text-xs text-slate-400">Here's what's happening across Connecta network today.</p>
        </div>

        {/* Quick Action Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => setActiveAdminRoute(action.route)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-xs font-bold text-white transition-all shadow-sm relative"
            >
              {action.icon}
              <span>{action.label}</span>
              {action.badge !== undefined && action.badge > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black">
                  {action.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Users */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Users</span>
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.totalUsers.toLocaleString()}
            </h3>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-500 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{stats.userGrowthRate}% from last week</span>
            </div>
          </div>
        </div>

        {/* Total Posts */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Posts Today</span>
            <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-500">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.postsToday.toLocaleString()}
            </h3>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-500 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{stats.postGrowthRate}% from last week</span>
            </div>
          </div>
        </div>

        {/* Pending Reports */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Pending Reports</span>
            <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500">
              <Flag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.pendingReports}
            </h3>
            <div className="flex items-center gap-1 text-xs font-bold text-rose-500 mt-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{stats.reportsChangeRate}% from last week</span>
            </div>
          </div>
        </div>

        {/* Suspended Accounts */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Suspended Users</span>
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.suspendedUsers}
            </h3>
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 mt-1">
              <span>Stable moderation status</span>
            </div>
          </div>
        </div>

      </div>

      {/* Analytics Line Chart & Distribution Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Growth Line Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">User Growth Analytics</h3>
              <p className="text-xs text-slate-400">Daily registrations & active users count</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl text-xs font-bold">
              {(['7d', '30d', '90d', '1y'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setChartFilter(f)}
                  className={clsx(
                    'px-2.5 py-1 rounded-lg transition-all',
                    chartFilter === f ? 'bg-white dark:bg-slate-800 text-[#2563EB] shadow-sm' : 'text-slate-500'
                  )}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Line Chart Graphic */}
          <div className="h-56 w-full pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="currentColor" className="text-slate-100 dark:text-slate-700/40" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="currentColor" className="text-slate-100 dark:text-slate-700/40" strokeDasharray="4 4" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="currentColor" className="text-slate-100 dark:text-slate-700/40" strokeDasharray="4 4" />

              {/* Area */}
              <polygon points="0,150 0,130 80,110 160,120 240,70 320,85 400,40 500,20 500,150" fill="url(#chartGradient)" />

              {/* Smooth Spline Line */}
              <path
                d="M0,130 Q40,120 80,110 T160,120 T240,70 T320,85 T400,40 T500,20"
                fill="none"
                stroke="#2563EB"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data Points */}
              <circle cx="80" cy="110" r="4" fill="#2563EB" className="animate-ping" />
              <circle cx="240" cy="70" r="4" fill="#2563EB" />
              <circle cx="400" cy="40" r="4" fill="#2563EB" />
              <circle cx="500" cy="20" r="5" fill="#8B5CF6" />
            </svg>
          </div>
        </div>

        {/* Content Type Distribution */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Content Distribution</h3>
            <p className="text-xs text-slate-400">Breakdown of network posts & media</p>
          </div>

          <div className="space-y-3 py-2">
            {[
              { label: 'Text Posts', pct: 45, color: 'bg-[#2563EB]' },
              { label: 'Photo & Image Galleries', pct: 30, color: 'bg-purple-500' },
              { label: '24h Stories', pct: 15, color: 'bg-rose-500' },
              { label: 'Marketplace Listings', pct: 10, color: 'bg-emerald-500' },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{item.pct}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-center">
            <span className="text-[11px] font-bold text-slate-400">Total Network Items: 48,504</span>
          </div>
        </div>

      </div>

      {/* Recent Activity Stream & Admin Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Activity Stream */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Live Activity</h3>
            <span className="text-[11px] font-bold text-[#2563EB]">Live Feed</span>
          </div>

          <div className="space-y-3">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 flex-shrink-0 mt-0.5">
                  {act.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-900 dark:text-slate-100 font-medium">
                    <strong className="font-bold">{act.user}</strong> {act.action}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {formatDistanceToNow(new Date(act.time), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log Preview */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Admin Audit Trail</h3>
            <button onClick={() => setActiveAdminRoute('logs')} className="text-xs font-bold text-[#2563EB] hover:underline">
              View All Logs →
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{log.admin_name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] text-[9px] font-bold uppercase">
                    {log.action}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{log.details}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
