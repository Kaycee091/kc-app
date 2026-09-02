import React, { useState } from 'react';
import { PostComment } from '../../types/social';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { Send, Image as ImageIcon, CornerDownRight } from 'lucide-react';
import { uploadFile } from '../../services/storageService';

interface CommentSectionProps {
  comments: PostComment[];
  onAddComment: (content: string, parentId?: string, imageUrl?: string) => Promise<void>;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ comments, onAddComment }) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [replyToId, setReplyToId] = useState<string | undefined>(undefined);
  const [commentImage, setCommentImage] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() && !commentImage) return;

    await onAddComment(commentText.trim(), replyToId, commentImage);
    setCommentText('');
    setReplyToId(undefined);
    setCommentImage(undefined);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadFile(file);
      setCommentImage(res.url);
    } catch (e) {}
    setIsUploading(false);
  };

  return (
    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex items-start gap-2.5">
        <Avatar src={user?.avatar_url} name={user?.full_name || 'User'} size="sm" />
        <div className="flex-1 relative flex items-center bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#2563EB]">
          <input
            type="text"
            placeholder={replyToId ? 'Write a reply...' : 'Write a comment...'}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full py-2 pl-3 pr-16 text-xs font-medium bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />

          <div className="absolute right-2 flex items-center gap-1">
            <label className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
              <ImageIcon className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            <button type="submit" disabled={isUploading} className="p-1 text-[#2563EB] hover:scale-110 transition-transform">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {commentImage && (
        <div className="pl-10">
          <img src={commentImage} alt="Attachment" className="h-16 rounded-xl object-cover border" />
        </div>
      )}

      {/* Comment Stream */}
      <div className="space-y-3 pl-1">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-2">
            <div className="flex items-start gap-2.5">
              <Avatar src={comment.author?.avatar_url} name={comment.author?.full_name || 'User'} size="sm" />
              <div className="flex-1">
                <div className="inline-block bg-slate-100 dark:bg-slate-800/90 px-3 py-2 rounded-2xl max-w-md">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    {comment.author?.full_name}
                  </h5>
                  <p className="text-xs text-slate-800 dark:text-slate-200 mt-0.5 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                  {comment.image_url && (
                    <img src={comment.image_url} alt="Comment media" className="mt-2 rounded-xl max-h-40 object-cover" />
                  )}
                </div>

                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold pl-2 mt-1">
                  <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                  <button onClick={() => setReplyToId(comment.id)} className="hover:text-[#2563EB]">
                    Reply
                  </button>
                </div>
              </div>
            </div>

            {/* Nested Comment Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="pl-9 space-y-2 border-l-2 border-slate-200 dark:border-slate-800 ml-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex items-start gap-2 pt-1">
                    <Avatar src={reply.author?.avatar_url} name={reply.author?.full_name || 'User'} size="xs" />
                    <div className="inline-block bg-slate-100 dark:bg-slate-800/90 px-3 py-1.5 rounded-2xl text-xs">
                      <span className="font-bold text-slate-900 dark:text-white block">{reply.author?.full_name}</span>
                      <span>{reply.content}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
