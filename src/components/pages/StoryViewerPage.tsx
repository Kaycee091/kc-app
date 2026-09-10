import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { ArrowLeft, Heart, Send, Plus, Eye, Sparkles } from 'lucide-react';
import { router } from '../../router';
import { CreateStoryModal } from '../stories/CreateStoryModal';

interface StoryViewerPageProps {
  storyId?: string;
}

export const StoryViewerPage: React.FC<StoryViewerPageProps> = ({ storyId }) => {
  const { stories } = useSocial();
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const activeStory = stories[activeStoryIndex] || stories[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <button onClick={() => router.navigate('/feed')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-900 dark:text-white">Stories Hub</h1>
            <p className="text-xs text-slate-500">24-Hour Ephemeral Photos & Videos</p>
          </div>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Create Story
        </Button>
      </div>

      {/* Main Full-Screen Story Display */}
      {activeStory ? (
        <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
          {/* Main Card */}
          <div
            className="w-full max-w-sm h-[520px] rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all"
            style={{ background: activeStory.bg_color || 'linear-gradient(135deg, #2563EB, #8B5CF6)' }}
          >
            {/* Story Header */}
            <div className="flex items-center gap-3 relative z-10 bg-black/30 backdrop-blur-md p-3 rounded-2xl">
              <Avatar src={activeStory.author?.avatar_url} name={activeStory.author?.full_name || 'User'} size="sm" />
              <div>
                <p className="text-xs font-bold text-white">{activeStory.author?.full_name}</p>
                <p className="text-[10px] text-white/80">{new Date(activeStory.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            {/* Media or Text Content */}
            {activeStory.media_url ? (
              <img src={activeStory.media_url} alt="Story Media" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="my-auto text-center px-4 relative z-10">
                <p className="text-xl font-black text-white drop-shadow-md leading-relaxed">{activeStory.text_content}</p>
              </div>
            )}

            {/* Story Footer Controls */}
            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 text-white text-xs font-bold backdrop-blur-md">
                <Eye className="w-3.5 h-3.5" />
                <span>{activeStory.views_count || 1} Views</span>
              </div>

              <button className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-colors">
                <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
              </button>
            </div>
          </div>

          {/* Story Selector List */}
          <div className="w-full md:w-64 space-y-2">
            <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">All Active Stories ({stories.length})</h4>
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {stories.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => setActiveStoryIndex(idx)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                    activeStoryIndex === idx
                      ? 'bg-[#2563EB]/10 border-[#2563EB] text-[#2563EB] font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <Avatar src={s.author?.avatar_url} name={s.author?.full_name || 'User'} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{s.author?.full_name}</p>
                    <p className="text-[10px] opacity-70 truncate">{s.text_content || 'Photo Story'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No Active Stories</h3>
          <p className="text-xs text-slate-400 mt-1">Be the first to share a 24h story!</p>
        </div>
      )}

      <CreateStoryModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
};
