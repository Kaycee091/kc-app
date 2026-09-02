import React from 'react';
import { useSocial } from '../../context/SocialContext';
import { PostCard } from '../feed/PostCard';
import { Clock, Sparkles } from 'lucide-react';

export const MemoriesView: React.FC = () => {
  const { posts } = useSocial();
  const memoryPost = posts[2] || posts[0];

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-12 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-6 text-white space-y-2 shadow-lg">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
          <Clock className="w-3.5 h-3.5" />
          <span>On This Day — 2 Years Ago</span>
        </div>
        <h2 className="text-xl font-black">We hope you enjoy looking back on your memories!</h2>
        <p className="text-xs opacity-90">Memories are calculated from your previous KC posts on this date.</p>
      </div>

      {memoryPost && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">Memory Post</h4>
          <PostCard post={memoryPost} />
        </div>
      )}
    </div>
  );
};
