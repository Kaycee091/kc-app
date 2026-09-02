import React, { useState } from 'react';
import { BarChart2, TrendingUp, Users, FileText, Share2, Heart } from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const [range, setRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Platform Analytics & Growth</h2>
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

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Daily Active Users (DAU)</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">4,820</h3>
          <span className="text-xs font-bold text-emerald-500">↑ +14.2% DAU ratio</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Monthly Active Users (MAU)</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">12,450</h3>
          <span className="text-xs font-bold text-emerald-500">↑ +9.8% MAU growth</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">User Retention Rate</span>
          <h3 className="text-2xl font-black text-[#2563EB]">78.4%</h3>
          <span className="text-xs font-bold text-emerald-500">↑ 30-day retention</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Avg Session Duration</span>
          <h3 className="text-2xl font-black text-purple-500">18m 42s</h3>
          <span className="text-xs font-bold text-purple-500">High engagement</span>
        </div>
      </div>

      {/* Interactive Bar Chart for Engagement */}
      <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">User Engagement Metrics</h3>

        <div className="h-64 flex items-end justify-between gap-4 pt-6 pb-2 px-4 border-b border-slate-100 dark:border-slate-700">
          {[
            { day: 'Mon', posts: 140, comments: 320, reactions: 840 },
            { day: 'Tue', posts: 180, comments: 410, reactions: 950 },
            { day: 'Wed', posts: 160, comments: 390, reactions: 910 },
            { day: 'Thu', posts: 210, comments: 480, reactions: 1120 },
            { day: 'Fri', posts: 250, comments: 540, reactions: 1340 },
            { day: 'Sat', posts: 290, comments: 620, reactions: 1580 },
            { day: 'Sun', posts: 230, comments: 490, reactions: 1210 },
          ].map((bar) => (
            <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="w-full flex items-end justify-center gap-1.5 h-48">
                <div className="w-3 bg-[#2563EB] rounded-t-lg transition-all" style={{ height: `${bar.posts / 3}%` }} title={`Posts: ${bar.posts}`} />
                <div className="w-3 bg-purple-500 rounded-t-lg transition-all" style={{ height: `${bar.comments / 7}%` }} title={`Comments: ${bar.comments}`} />
                <div className="w-3 bg-emerald-500 rounded-t-lg transition-all" style={{ height: `${bar.reactions / 18}%` }} title={`Reactions: ${bar.reactions}`} />
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
