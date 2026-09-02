import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { PostCard } from '../feed/PostCard';
import { Bookmark, Filter } from 'lucide-react';

export const SavedItemsView: React.FC = () => {
  const { posts } = useSocial();
  const savedPosts = posts.filter((p) => p.is_saved);

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-12 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-purple-500" />
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Saved Collection</h2>
            <p className="text-xs text-slate-500">Your bookmarked posts, videos, and products.</p>
          </div>
        </div>
      </div>

      {savedPosts.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No saved items yet</h4>
          <p className="text-xs text-slate-400">Click the bookmark icon on any post or marketplace listing to save it here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {savedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};
