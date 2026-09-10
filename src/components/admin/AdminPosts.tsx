import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AdminConfirmModal } from './AdminConfirmModal';
import { FileText, Eye, EyeOff, Trash2, ShieldCheck, Flag, ThumbsUp, MessageSquare, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const AdminPosts: React.FC = () => {
  const { postsList, hiddenPostIds, hidePost, restorePost, deletePost, deleteComment } = useAdmin();

  const [filter, setFilter] = useState<'all' | 'published' | 'hidden'>('all');
  const [search, setSearch] = useState('');
  const [selectedPostComments, setSelectedPostComments] = useState<string | null>(null);

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

  const filteredPosts = postsList.filter((post) => {
    const isHidden = hiddenPostIds.includes(post.id);
    const matchesSearch =
      post.content.toLowerCase().includes(search.toLowerCase()) ||
      post.author?.full_name.toLowerCase().includes(search.toLowerCase()) ||
      post.author?.username.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'published') return !isHidden;
    if (filter === 'hidden') return isHidden;
    return true;
  });

  const togglePostVisibility = (postId: string) => {
    const isHidden = hiddenPostIds.includes(postId);
    if (isHidden) {
      restorePost(postId);
    } else {
      hidePost(postId);
    }
  };

  const triggerDeletePost = (postId: string) => {
    setConfirmModalState({
      isOpen: true,
      title: 'Delete Post Permanently',
      description: 'Are you sure you want to permanently delete this post and all associated comments?',
      action: () => deletePost(postId),
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Posts & Comments Moderation</h2>
          <p className="text-xs text-slate-500">Monitor published posts, moderate network feed items, and remove comments.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search posts or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            {(['all', 'published', 'hidden'] as const).map((tab) => (
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
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 dark:text-slate-200">No Posts Found</h3>
            <p className="text-xs text-slate-400">No network posts match the current search filter.</p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isHidden = hiddenPostIds.includes(post.id);
            const isShowingComments = selectedPostComments === post.id;

            return (
              <div
                key={post.id}
                className={`p-4 bg-white dark:bg-slate-800 rounded-3xl border ${
                  isHidden ? 'border-amber-300 dark:border-amber-900 opacity-80' : 'border-slate-200/80 dark:border-slate-700/80'
                } shadow-sm space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar src={post.author?.avatar_url} name={post.author?.full_name || 'User'} size="md" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {post.author?.full_name || 'Anonymous User'}{' '}
                        <span className="text-slate-400 text-[11px] font-normal">@{post.author?.username || 'user'}</span>
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {formatDistanceToNow(new Date(post.created_at || Date.now()), { addSuffix: true })} · ID: {post.id}
                      </p>
                    </div>
                  </div>

                  {isHidden && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase">
                      Hidden from Feed
                    </span>
                  )}
                </div>

                {post.content && (
                  <p className="text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl leading-relaxed">
                    {post.content}
                  </p>
                )}

                {/* Media Preview */}
                {post.media && post.media.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {post.media.map((m) => (
                      <img key={m.id} src={m.url} alt="Post media" className="w-24 h-24 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                  <div className="flex items-center gap-4 text-slate-500 font-semibold text-[11px]">
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5 text-blue-500" /> {post.reactions?.length || 0} Likes</span>
                    <button
                      onClick={() => setSelectedPostComments(isShowingComments ? null : post.id)}
                      className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-purple-500" /> {post.comments?.length || 0} Comments
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={isHidden ? 'primary' : 'outline'}
                      onClick={() => togglePostVisibility(post.id)}
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
                      Delete Post
                    </Button>
                  </div>
                </div>

                {/* Comments Drawer */}
                {isShowingComments && post.comments && post.comments.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl">
                    <h5 className="font-bold text-[11px] text-slate-700 dark:text-slate-300">Comments Moderation</h5>
                    {post.comments.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 text-xs">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">{c.author?.full_name || 'User'}: </span>
                          <span className="text-slate-700 dark:text-slate-300">{c.content}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="danger"
                          className="py-1 px-2 text-[10px]"
                          onClick={() => deleteComment(post.id, c.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
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
