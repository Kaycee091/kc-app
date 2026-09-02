import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Post } from '../../types/social';
import { Share2, Check, Copy } from 'lucide-react';

interface ShareModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ post, isOpen, onClose }) => {
  const [caption, setCaption] = useState('');
  const [shared, setShared] = useState(false);

  const handleShare = () => {
    setShared(true);
    setTimeout(() => {
      setShared(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Post" maxWidth="md">
      {shared ? (
        <div className="text-center py-6 space-y-2">
          <Check className="w-12 h-12 text-emerald-500 mx-auto" />
          <h4 className="font-bold text-sm">Post Shared Successfully!</h4>
        </div>
      ) : (
        <div className="space-y-4">
          <textarea
            rows={3}
            placeholder="Add a thought to this share..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          />

          <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-xs">
            <span className="font-bold block text-slate-900 dark:text-white">{post.author?.full_name}</span>
            <p className="text-slate-600 dark:text-slate-300 truncate mt-1">{post.content}</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleShare} leftIcon={<Share2 className="w-4 h-4" />}>
              Share Now
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
