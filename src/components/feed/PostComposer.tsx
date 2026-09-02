import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { Avatar } from '../ui/Avatar';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Image, Video, BarChart2, Smile, MapPin, Globe, Users, Lock, X, Plus } from 'lucide-react';
import { uploadFile } from '../../services/storageService';
import { PostPrivacy } from '../../types/social';

const FEELINGS_LIST = [
  '😊 happy', '🥰 loved', '🎉 excited', '😎 cool', '🤔 thoughtful', 
  '☕ relaxed', '🎧 listening to music', '✈️ traveling', '💪 motivated'
];

const BG_STYLES = [
  { id: 'default', css: '' },
  { id: 'gradient-blue', css: 'bg-gradient-to-tr from-[#2563EB] to-[#8B5CF6] text-white font-bold text-lg p-8 rounded-2xl' },
  { id: 'gradient-[#2563EB]', css: 'bg-gradient-to-tr from-[#EC4899] to-[#8B5CF6] text-white font-bold text-lg p-8 rounded-2xl' },
  { id: 'gradient-dark', css: 'bg-gradient-to-tr from-[#0F172A] to-[#1E293B] text-white font-bold text-lg p-8 rounded-2xl' },
];

interface PostComposerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { createPost } = useSocial();

  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<PostPrivacy>('public');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [feeling, setFeeling] = useState('');
  const [location, setLocation] = useState('');
  const [bgStyle, setBgStyle] = useState('');
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['Option 1', 'Option 2']);
  const [isUploading, setIsUploading] = useState(false);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of files) {
        const res = await uploadFile(file);
        setMediaUrls((prev) => [...prev, res.url]);
      }
    } catch (e) {}
    setIsUploading(false);
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaUrls.length === 0 && !pollQuestion) return;

    await createPost({
      content: content.trim(),
      mediaUrls,
      privacy,
      feeling,
      location,
      bgStyle,
      pollQuestion: showPoll ? pollQuestion : undefined,
      pollOptions: showPoll ? pollOptions.filter((o) => o.trim()) : undefined,
    });

    setContent('');
    setMediaUrls([]);
    setFeeling('');
    setLocation('');
    setBgStyle('');
    setShowPoll(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Post" maxWidth="lg">
      <form onSubmit={handlePostSubmit} className="space-y-4">
        
        {/* Author Header & Privacy selector */}
        <div className="flex items-center gap-3">
          <Avatar src={user?.avatar_url} name={user?.full_name || 'User'} size="md" />
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              {user?.full_name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as PostPrivacy)}
                className="py-1 px-2 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <option value="public">🌎 Public</option>
                <option value="friends">👥 Friends</option>
                <option value="only_me">🔒 Only me</option>
              </select>

              {feeling && (
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] text-[10px] font-semibold">
                  is {feeling}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Post Textarea with optional background style */}
        <div className={bgStyle ? bgStyle : ''}>
          <textarea
            rows={4}
            placeholder={`What's on your mind, ${user?.first_name || 'friend'}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-sm font-medium bg-transparent placeholder:text-slate-400 focus:outline-none resize-none"
          />
        </div>

        {/* Media Preview Grid */}
        {mediaUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 border border-slate-200 dark:border-slate-700 rounded-2xl">
            {mediaUrls.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} alt="Upload" className="w-full h-28 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => setMediaUrls((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Poll Builder */}
        {showPoll && (
          <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
            <input
              type="text"
              placeholder="Ask a question..."
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              className="w-full p-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
            {pollOptions.map((opt, idx) => (
              <input
                key={idx}
                type="text"
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChange={(e) => {
                  const copy = [...pollOptions];
                  copy[idx] = e.target.value;
                  setPollOptions(copy);
                }}
                className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            ))}
            <button
              type="button"
              onClick={() => setPollOptions((prev) => [...prev, `Option ${prev.length + 1}`])}
              className="text-xs text-[#2563EB] font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add option
            </button>
          </div>
        )}

        {/* Background style selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400">Styling:</span>
          {BG_STYLES.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setBgStyle(st.css)}
              className={`w-6 h-6 rounded-full border-2 border-white shadow ${
                st.id === 'default' ? 'bg-slate-200' : st.css.split(' ')[0]
              }`}
            />
          ))}
        </div>

        {/* Add to Post Toolbar */}
        <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Add to your post:</span>

          <div className="flex items-center gap-1">
            <label className="p-2 text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-colors">
              <Image className="w-5 h-5" />
              <input type="file" multiple accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" />
            </label>

            <button
              type="button"
              onClick={() => setShowPoll(!showPoll)}
              className="p-2 text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <BarChart2 className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setFeeling(FEELINGS_LIST[Math.floor(Math.random() * FEELINGS_LIST.length)])}
              className="p-2 text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setLocation('San Francisco, CA')}
              className="p-2 text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <MapPin className="w-5 h-5" />
            </button>
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full shadow-lg" isLoading={isUploading}>
          Publish Post
        </Button>
      </form>
    </Modal>
  );
};
