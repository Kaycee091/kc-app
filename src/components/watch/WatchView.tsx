import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Video, Play, Eye, ThumbsUp, MessageSquare, Share2, Bookmark, UserPlus, Flame, Tv, Sparkles, Search } from 'lucide-react';
import { clsx } from 'clsx';

interface VideoPost {
  id: string;
  title: string;
  creatorName: string;
  creatorAvatar: string;
  creatorId: string;
  videoUrl: string;
  views: number;
  category: 'trending' | 'gaming' | 'tech' | 'entertainment' | 'shorts';
  likesCount: number;
  commentsCount: number;
  timeAgo: string;
}

const DEMO_VIDEOS: VideoPost[] = [
  {
    id: 'vid_1',
    title: 'Building Connecta: The Next-Gen Production Social Network Architecture',
    creatorName: 'Connecta Dev Team',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    creatorId: 'user_alex',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    views: 45200,
    category: 'tech',
    likesCount: 3820,
    commentsCount: 412,
    timeAgo: '2 hours ago',
  },
  {
    id: 'vid_2',
    title: 'Top 10 Design Patterns for Modern Web & Mobile Applications in 2026',
    creatorName: 'Sarah Adams UI/UX',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    creatorId: 'user_sarah',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    views: 89100,
    category: 'trending',
    likesCount: 7420,
    commentsCount: 890,
    timeAgo: '5 hours ago',
  },
  {
    id: 'vid_3',
    title: 'Epic Gaming Showcase & Championship Tournament Highlights',
    creatorName: 'John Doe Gaming',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    creatorId: 'user_john',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    views: 124000,
    category: 'gaming',
    likesCount: 15300,
    commentsCount: 1420,
    timeAgo: '1 day ago',
  },
];

export const WatchView: React.FC = () => {
  const { followingIds, toggleFollow } = useSocial();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  const [savedVideos, setSavedVideos] = useState<Record<string, boolean>>({});

  const filteredVideos = DEMO_VIDEOS.filter((v) => {
    const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.creatorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleLikeVideo = (id: string) => {
    setLikedVideos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSaveVideo = (id: string) => {
    setSavedVideos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {/* Header & Categories Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-700/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Connecta Watch</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Discover trending videos, tech reviews & creator streams</p>
            </div>
          </div>
        </div>

        {/* Video Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search videos or creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-2xl bg-slate-100 dark:bg-slate-700/70 border-none text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          {[
            { id: 'all', label: 'All Videos', icon: Tv },
            { id: 'trending', label: 'Trending', icon: Flame },
            { id: 'gaming', label: 'Gaming', icon: Sparkles },
            { id: 'tech', label: 'Tech & Dev', icon: Video },
            { id: 'entertainment', label: 'Entertainment', icon: Play },
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-full flex items-center gap-1.5 whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-[#2563EB] text-[#ffffff] shadow-md shadow-[#2563EB]/30'
                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Video Feed */}
      <div className="space-y-4">
        {filteredVideos.map((video) => {
          const isFollowing = followingIds.includes(video.creatorId);
          const isLiked = likedVideos[video.id];
          const isSaved = savedVideos[video.id];

          return (
            <div
              key={video.id}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 overflow-hidden space-y-3 p-4"
            >
              {/* Creator Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar src={video.creatorAvatar} name={video.creatorName} size="md" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{video.creatorName}</h4>
                    <p className="text-[10px] text-slate-400">{video.timeAgo} • {video.views.toLocaleString()} views</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleFollow(video.creatorId)}
                  className={clsx(
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1',
                    isFollowing
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                      : 'bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#2563EB]/20'
                  )}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </button>
              </div>

              {/* Video Title */}
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {video.title}
              </h3>

              {/* HTML5 Video Player */}
              <div className="rounded-2xl overflow-hidden bg-black aspect-video relative group">
                <video
                  src={video.videoUrl}
                  controls
                  poster={video.creatorAvatar}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/80 text-xs font-bold text-slate-600 dark:text-slate-300">
                <button
                  onClick={() => toggleLikeVideo(video.id)}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all',
                    isLiked ? 'text-[#2563EB] bg-blue-50 dark:bg-blue-950/60' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                  )}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{isLiked ? 'Liked' : 'Like'} ({video.likesCount + (isLiked ? 1 : 0)})</span>
                </button>

                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                  <MessageSquare className="w-4 h-4" />
                  <span>Comment ({video.commentsCount})</span>
                </button>

                <button
                  onClick={() => toggleSaveVideo(video.id)}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all',
                    isSaved ? 'text-purple-500 bg-purple-50 dark:bg-purple-950/60' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                  )}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
