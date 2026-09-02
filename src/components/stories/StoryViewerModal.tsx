import React, { useState, useEffect } from 'react';
import { Story } from '../../types/social';
import { Avatar } from '../ui/Avatar';
import { X, Eye, Heart, Send } from 'lucide-react';

interface StoryViewerModalProps {
  story: Story;
  onClose: () => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({ story, onClose }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          onClose();
          return 100;
        }
        return prev + 2;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm h-[520px] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-4">
        
        {/* Story Background / Media */}
        {story.media_url ? (
          <img src={story.media_url} alt="Story" className="absolute inset-0 w-full h-full object-cover -z-10" />
        ) : (
          <div
            className="absolute inset-0 w-full h-full -z-10 flex items-center justify-center p-6 text-center text-white text-xl font-bold"
            style={{ background: story.bg_color || 'linear-gradient(135deg, #2563EB, #8B5CF6)' }}
          >
            {story.text_content}
          </div>
        )}

        {/* Top Progress Bar & Author */}
        <div className="space-y-3 z-10">
          <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar src={story.author?.avatar_url} name={story.author?.full_name || 'User'} size="sm" />
              <div>
                <h4 className="text-xs font-bold text-white drop-shadow">{story.author?.full_name}</h4>
                <p className="text-[10px] text-white/80">Active 24h Story</p>
              </div>
            </div>

            <button onClick={onClose} className="p-1 text-white hover:opacity-80">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Bottom Reaction & Reply Input */}
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20">
            <input
              type="text"
              placeholder={`Reply to ${story.author?.first_name || 'story'}...`}
              className="w-full text-xs bg-transparent text-white placeholder:text-white/60 focus:outline-none"
            />
            <button className="text-rose-500 hover:scale-125 transition-transform">
              <Heart className="w-5 h-5 fill-current" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-white/80 px-2">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {story.views_count || 124} views
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
