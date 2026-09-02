import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Plus } from 'lucide-react';
import { CreateStoryModal } from './CreateStoryModal';
import { StoryViewerModal } from './StoryViewerModal';
import { Story } from '../../types/social';

export const StoryTray: React.FC = () => {
  const { stories } = useSocial();
  const { user } = useAuth();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  return (
    <div className="w-full flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
      {/* Create Story Card */}
      <div
        onClick={() => setIsCreateOpen(true)}
        className="w-28 h-44 sm:w-32 sm:h-48 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm relative overflow-hidden flex-shrink-0 cursor-pointer group hover:scale-[1.02] transition-transform"
      >
        <img
          src={user?.avatar_url}
          alt={user?.full_name}
          className="w-full h-32 sm:h-36 object-cover group-hover:scale-105 transition-transform"
        />
        <div className="absolute inset-x-0 bottom-0 bg-white dark:bg-slate-800 p-2 text-center flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center -mt-6 border-4 border-white dark:border-slate-800 shadow-md">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-900 dark:text-white mt-1">Create Story</span>
        </div>
      </div>

      {/* Active Stories List */}
      {stories.map((story) => (
        <div
          key={story.id}
          onClick={() => setSelectedStory(story)}
          className="w-28 h-44 sm:w-32 sm:h-48 rounded-2xl relative overflow-hidden flex-shrink-0 cursor-pointer group hover:scale-[1.02] transition-transform shadow-md"
        >
          {story.media_url ? (
            <img
              src={story.media_url}
              alt="Story"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center p-3 text-center text-white text-xs font-bold"
              style={{ background: story.bg_color || 'linear-gradient(135deg, #2563EB, #8B5CF6)' }}
            >
              {story.text_content}
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 p-2.5 flex flex-col justify-between">
            <div className="story-ring inline-block w-9 h-9">
              <Avatar src={story.author?.avatar_url} name={story.author?.full_name || 'User'} size="sm" />
            </div>
            <span className="text-xs font-bold text-white drop-shadow truncate">
              {story.author?.full_name}
            </span>
          </div>
        </div>
      ))}

      {/* Modals */}
      <CreateStoryModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      {selectedStory && (
        <StoryViewerModal story={selectedStory} onClose={() => setSelectedStory(null)} />
      )}
    </div>
  );
};
