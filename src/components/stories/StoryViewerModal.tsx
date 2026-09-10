import React, { useState, useEffect } from 'react';
import { Story } from '../../types/social';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { X, Eye, Heart, Send, Flame, Sparkles, Trash2, User } from 'lucide-react';
import { DEMO_USERS } from '../../services/mockSocialData';

interface StoryViewerModalProps {
  story: Story;
  onClose: () => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({ story, onClose }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [showViewers, setShowViewers] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sentMessage, setSentMessage] = useState(false);
  const [reactedEmoji, setReactedEmoji] = useState<string | null>(null);

  const isOwner = story.author_id === user?.id;

  useEffect(() => {
    if (showViewers) return; // Pause timer when viewers list is open
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
  }, [onClose, showViewers]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSentMessage(true);
    setReplyText('');
    setTimeout(() => setSentMessage(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm h-[540px] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-4">
        
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

            <div className="flex items-center gap-1">
              <button onClick={onClose} className="p-1 text-white hover:opacity-80">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Story Quick Reactions overlay */}
        {reactedEmoji && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-bounce">
            <span className="text-6xl drop-shadow-2xl">{reactedEmoji}</span>
          </div>
        )}

        {/* Bottom Reaction & Reply Input */}
        <div className="space-y-2 z-10">
          {/* Quick Reaction Bar */}
          <div className="flex justify-center gap-3">
            {['❤️', '🔥', '😂', '😮', '👏'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setReactedEmoji(emoji);
                  setTimeout(() => setReactedEmoji(null), 1500);
                }}
                className="text-2xl hover:scale-125 transition-transform drop-shadow"
              >
                {emoji}
              </button>
            ))}
          </div>

          <form onSubmit={handleSendReply} className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${story.author?.first_name || 'story'}...`}
              className="w-full text-xs bg-transparent text-white placeholder:text-white/60 focus:outline-none"
            />
            <button type="submit" className="text-white hover:text-[#2563EB]">
              <Send className="w-4 h-4" />
            </button>
          </form>

          {sentMessage && (
            <p className="text-[11px] text-center font-bold text-emerald-400">
              Reply sent to {story.author?.first_name}!
            </p>
          )}

          <div className="flex items-center justify-between text-[11px] text-white/90 px-2 pt-1">
            <button
              onClick={() => setShowViewers(true)}
              className="flex items-center gap-1 font-bold hover:underline"
            >
              <Eye className="w-3.5 h-3.5" /> Seen by {story.views_count || 12} viewers
            </button>
          </div>
        </div>

        {/* Viewers List Drawer Popup */}
        {showViewers && (
          <div className="absolute inset-x-0 bottom-0 bg-slate-900/95 text-white rounded-t-3xl p-4 space-y-3 z-30 animate-fade-in max-h-72 overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h5 className="font-bold text-xs flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#2563EB]" /> Story Viewers ({DEMO_USERS.length})
              </h5>
              <button onClick={() => setShowViewers(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {DEMO_USERS.map((u) => (
                <div key={u.id} className="flex items-center gap-2 text-xs">
                  <Avatar src={u.avatar_url} name={u.full_name} size="sm" />
                  <div className="flex-1">
                    <p className="font-bold">{u.full_name}</p>
                    <p className="text-[10px] text-slate-400">@{u.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

