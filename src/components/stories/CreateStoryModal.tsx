import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useSocial } from '../../context/SocialContext';
import { uploadFile } from '../../services/storageService';
import { Image, Type } from 'lucide-react';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ isOpen, onClose }) => {
  const { createStory } = useSocial();
  const [type, setType] = useState<'photo' | 'text'>('photo');
  const [mediaUrl, setMediaUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [bgColor, setBgColor] = useState('linear-gradient(135deg, #2563EB, #8B5CF6)');
  const [isUploading, setIsUploading] = useState(false);

  const BG_PRESETS = [
    'linear-gradient(135deg, #2563EB, #8B5CF6)',
    'linear-gradient(135deg, #EC4899, #8B5CF6)',
    'linear-gradient(135deg, #10B981, #3B82F6)',
    'linear-gradient(135deg, #F59E0B, #EF4444)',
  ];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadFile(file);
      setMediaUrl(res.url);
    } catch (e) {}
    setIsUploading(false);
  };

  const handleCreate = async () => {
    await createStory({
      mediaUrl: type === 'photo' ? mediaUrl : undefined,
      textContent: type === 'text' ? textContent : undefined,
      bgColor: type === 'text' ? bgColor : undefined,
    });
    setMediaUrl('');
    setTextContent('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create 24h Story" maxWidth="md">
      <div className="space-y-4">
        {/* Toggle story mode */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            onClick={() => setType('photo')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-colors ${
              type === 'photo' ? 'bg-white dark:bg-slate-700 text-[#2563EB] shadow-sm' : 'text-slate-500'
            }`}
          >
            <Image className="w-4 h-4" /> Photo Story
          </button>
          <button
            onClick={() => setType('text')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-colors ${
              type === 'text' ? 'bg-white dark:bg-slate-700 text-[#2563EB] shadow-sm' : 'text-slate-500'
            }`}
          >
            <Type className="w-4 h-4" /> Text Story
          </button>
        </div>

        {type === 'photo' ? (
          <div className="space-y-3">
            {mediaUrl ? (
              <img src={mediaUrl} alt="Story Preview" className="w-full h-64 object-cover rounded-2xl" />
            ) : (
              <label className="w-full h-64 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <Image className="w-10 h-10 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Click to upload photo</span>
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </label>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div
              className="w-full h-64 rounded-2xl p-6 flex items-center justify-center text-center text-white text-lg font-bold shadow-inner"
              style={{ background: bgColor }}
            >
              {textContent || 'Type your story text here...'}
            </div>
            <textarea
              rows={2}
              placeholder="Write something..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Background:</span>
              {BG_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setBgColor(preset)}
                  className="w-6 h-6 rounded-full border-2 border-white shadow"
                  style={{ background: preset }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate} isLoading={isUploading}>
            Share to Story
          </Button>
        </div>
      </div>
    </Modal>
  );
};
