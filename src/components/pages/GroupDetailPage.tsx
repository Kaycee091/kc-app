import React from 'react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { PostCard } from '../feed/PostCard';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Users, Lock, Globe, Shield, ArrowLeft } from 'lucide-react';
import { router } from '../../router';

interface GroupDetailPageProps {
  groupId: string;
}

export const GroupDetailPage: React.FC<GroupDetailPageProps> = ({ groupId }) => {
  const { groups, toggleJoinGroup, posts } = useSocial();
  const { user } = useAuth();

  const group = groups.find((g) => g.id === groupId) || groups[0];

  if (!group) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Group Not Found</h2>
        <Button variant="outline" className="mt-4" onClick={() => router.navigate('/groups')}>
          Back to Groups
        </Button>
      </div>
    );
  }

  const groupPosts = posts.filter((p) => p.group_id === group.id || p.content.toLowerCase().includes(group.name.toLowerCase()));

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Cover Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-700/80">
        <div className="h-48 sm:h-64 bg-cover bg-center relative" style={{ backgroundImage: `url(${group.cover_url})` }}>
          <button
            onClick={() => router.navigate('/groups')}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">{group.name}</h1>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  {group.privacy === 'public' ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  {group.privacy.toUpperCase()} GROUP
                </span>
                <span>•</span>
                <span>{group.members_count} Members</span>
              </div>
            </div>

            <Button
              variant={group.is_joined ? 'outline' : 'primary'}
              onClick={() => toggleJoinGroup(group.id)}
            >
              {group.is_joined ? 'Joined Group' : 'Join Group'}
            </Button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700 pt-3">
            {group.description || 'Welcome to this community. Share ideas, posts, and connect with members.'}
          </p>

          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={() => router.navigate(`/groups/${group.id}`)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] text-white"
            >
              Discussion Posts ({groupPosts.length})
            </button>
            <button
              onClick={() => router.navigate(`/groups/${group.id}/members`)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              Members ({group.members_count})
            </button>
          </div>
        </div>
      </div>

      {/* Group Content Stream */}
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 px-1">Community Activity</h3>
        {groupPosts.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500">No posts in this group yet. Be the first to post!</p>
          </div>
        ) : (
          groupPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
};
