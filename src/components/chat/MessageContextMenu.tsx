import React from 'react';
import { Message } from '../../types';
import { Reply, Copy, Edit2, Trash2, Smile, Forward } from 'lucide-react';
import { clsx } from 'clsx';

const EMOJI_REACTIONS = ['❤️', '😂', '👍', '😮', '😢', '🔥'];

interface MessageContextMenuProps {
  message: Message;
  isOwn: boolean;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onReply: (msg: Message) => void;
  onReact: (msgId: string, emoji: string) => void;
  onCopy: (content: string) => void;
  onEdit: (msg: Message) => void;
  onDelete: (msgId: string, mode: 'for_me' | 'for_everyone') => void;
}

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  message,
  isOwn,
  position,
  onClose,
  onReply,
  onReact,
  onCopy,
  onEdit,
  onDelete,
}) => {
  if (!position) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      onClick={onClose}
    >
      <div
        className="absolute z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 min-w-[200px] animate-fade-in"
        style={{
          left: Math.min(position.x, window.innerWidth - 220),
          top: Math.min(position.y, window.innerHeight - 280),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Quick Emoji Reaction bar */}
        <div className="flex items-center justify-between px-2 py-1.5 mb-1.5 border-b border-slate-100 dark:border-slate-800">
          {EMOJI_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onReact(message.id, emoji);
                onClose();
              }}
              className="text-lg hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Action Items */}
        <div className="space-y-0.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <button
            onClick={() => {
              onReply(message);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Reply className="w-4 h-4 text-[#5B5FEF]" />
            <span>Reply</span>
          </button>

          <button
            onClick={() => {
              onCopy(message.content);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Copy className="w-4 h-4 text-slate-500" />
            <span>Copy Text</span>
          </button>

          {isOwn && message.message_type === 'text' && !message.deleted_at && (
            <button
              onClick={() => {
                onEdit(message);
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit2 className="w-4 h-4 text-indigo-500" />
              <span>Edit Message</span>
            </button>
          )}

          <button
            onClick={() => {
              onDelete(message.id, 'for_me');
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Delete for me</span>
          </button>

          {isOwn && !message.deleted_at && (
            <button
              onClick={() => {
                onDelete(message.id, 'for_everyone');
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete for everyone</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
