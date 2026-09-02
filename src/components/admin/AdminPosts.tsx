import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { useAdmin } from '../../context/AdminContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { AdminConfirmModal } from './AdminConfirmModal';
import { FileText, Eye, EyeOff, Trash2, ShieldCheck, Flag, ThumbsUp, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const AdminPosts: React.FC = () => {
  const { posts, deletePost } = useSocial();
  const { logAdminAction } = useAdmin();

  const [filter, setFilter] = useState<'all' | 'reported' | 'published' | 'hidden'>('all');
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    action: () => {},
  });

  const toggleHidePost = (postId: string) => {
    const isHidden = hiddenPostIds.includes(postId);
    setHiddenPostIds((prev) => (isHidden ? prev.filter((id) => id !== postId) : [...prev, postId]));
    logAdminAction(isHidden ? 'Restored Post Visibility' : 'Hid Post from Network Feed', 'post', postId, 'Admin moderation action');
  };

  const triggerDeletePost = (postId: string) => {
    setConfirmModalState({
      isOpen: true,
      title: 'Delete Post Permanently',
      description: 'Are you sure you want to permanently delete this post and all associated comments?',
      action: () => {
        deletePost(postId);
        logAdminAction('Deleted Post Permanently', 'post', postId, 'Deleted per community guidelines');
      },
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Posts Moderation</h2>
          <p className="text-xs text-slate-500">Monitor published posts, review reported content, and moderate feed items.</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
          {(['all', 'reported', 'published', 'hidden'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filter === tab ? 'bg-white dark:bg-slate-700 text-[#2563EB] shadow-sm' : 'text-slate-500'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {posts.map((post) => {
          const isHidden = hiddenPostIds.includes(post.id);
          return (
            <div
              key={post.id}
              className={`p-4 bg-white dark:bg-slate-800 rounded-3xl border ${
                isHidden ? 'border-amber-300 dark:border-amber-900 opacity-75' : 'border-slate-200/80 dark:border-slate-700/80'
              } shadow-sm space-y-3`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar src={post.author?.avatar_url} name={post.author?.full_name || 'User'} size="md" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{post.author?.full_name}</h4>
                    <p className="text-[10px] text-slate-400">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })} · ID: {post.id}
                    </p>
                  </div>
                </div>

                {isHidden && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">
                    Hidden from Feed
                  </span>
                )}
              </div>

              {post.content && (
                <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl">
                  {post.content}
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                <div className="flex items-center gap-3 text-slate-400 font-semibold text-[11px]">
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {post.reactions.length}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {post.comments_count}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isHidden ? 'primary' : 'outline'}
                    onClick={() => toggleHidePost(post.id)}
                    leftIcon={isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  >
                    {isHidden ? 'Restore Post' : 'Hide Post'}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => triggerDeletePost(post.id)}
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AdminConfirmModal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalState.action}
        title={confirmModalState.title}
        description={confirmModalState.description}
      />
    </div>
  );
};
