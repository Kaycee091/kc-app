import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { BarChart2, TrendingUp, Users, FileText, Share2, Heart, ShieldAlert } from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const { stats } = useAdmin();
  const [range, setRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-emerald-500" /> Platform Analytics & Growth
          </h2>
          <p className="text-xs text-slate-500">Comprehensive network usage metrics, retention analytics, and user engagement charts.</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
          {(['7d', '30d', '90d', '1y'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-xl uppercase transition-all ${
                range === r ? 'bg-white dark:bg-slate-700 text-[#2563EB] shadow-sm' : 'text-slate-500'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Active Users</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.activeUsers.toLocaleString()}</h3>
          <span className="text-xs font-bold text-emerald-500">↑ +{stats.userGrowthRate}% user growth</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Posts</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalPosts.toLocaleString()}</h3>
          <span className="text-xs font-bold text-emerald-500">↑ +{stats.postGrowthRate}% post activity</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Comments</span>
          <h3 className="text-2xl font-black text-[#2563EB]">{stats.commentsToday.toLocaleString()}</h3>
          <span className="text-xs font-bold text-blue-500">High interaction rate</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Pending Reports</span>
          <h3 className="text-2xl font-black text-rose-500">{stats.pendingReports}</h3>
          <span className="text-xs font-bold text-slate-400">Moderation resolution queue</span>
        </div>
      </div>

      {/* Interactive Bar Chart for Engagement */}
      <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Weekly Network Engagement Activity</h3>

        <div className="h-64 flex items-end justify-between gap-4 pt-6 pb-2 px-4 border-b border-slate-100 dark:border-slate-700">
          {[
            { day: 'Mon', posts: Math.max(10, stats.totalPosts * 12), comments: Math.max(20, stats.commentsToday * 15), reactions: Math.max(50, stats.activeUsers * 2) },
            { day: 'Tue', posts: Math.max(15, stats.totalPosts * 15), comments: Math.max(25, stats.commentsToday * 18), reactions: Math.max(60, stats.activeUsers * 2.5) },
            { day: 'Wed', posts: Math.max(12, stats.totalPosts * 14), comments: Math.max(22, stats.commentsToday * 16), reactions: Math.max(55, stats.activeUsers * 2.2) },
            { day: 'Thu', posts: Math.max(18, stats.totalPosts * 18), comments: Math.max(28, stats.commentsToday * 20), reactions: Math.max(70, stats.activeUsers * 2.8) },
            { day: 'Fri', posts: Math.max(22, stats.totalPosts * 22), comments: Math.max(32, stats.commentsToday * 24), reactions: Math.max(85, stats.activeUsers * 3.1) },
            { day: 'Sat', posts: Math.max(28, stats.totalPosts * 26), comments: Math.max(40, stats.commentsToday * 28), reactions: Math.max(100, stats.activeUsers * 3.5) },
            { day: 'Sun', posts: Math.max(20, stats.totalPosts * 20), comments: Math.max(30, stats.commentsToday * 22), reactions: Math.max(75, stats.activeUsers * 2.9) },
          ].map((bar) => (
            <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="w-full flex items-end justify-center gap-1.5 h-48">
                <div className="w-3 bg-[#2563EB] rounded-t-lg transition-all" style={{ height: `${Math.min(100, bar.posts / 3)}%` }} title={`Posts: ${bar.posts}`} />
                <div className="w-3 bg-purple-500 rounded-t-lg transition-all" style={{ height: `${Math.min(100, bar.comments / 5)}%` }} title={`Comments: ${bar.comments}`} />
                <div className="w-3 bg-emerald-500 rounded-t-lg transition-all" style={{ height: `${Math.min(100, bar.reactions / 10)}%` }} title={`Reactions: ${bar.reactions}`} />
              </div>
              <span className="text-[11px] font-bold text-slate-500">{bar.day}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-6 text-xs font-bold">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#2563EB]" /> Posts</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-500" /> Comments</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500" /> Reactions</span>
        </div>
      </div>
    </div>
  );
};
