import React, { useState } from 'react';
import { Message } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { format } from 'date-fns';
import { Check, CheckCheck, FileText, Download, Play, Pause, CornerUpLeft, Smile } from 'lucide-react';
import { clsx } from 'clsx';

interface MessageBubbleProps {
  message: Message;
  showSenderName?: boolean;
  onContextMenu: (e: React.MouseEvent, msg: Message) => void;
  onReact: (msgId: string, emoji: string) => void;
  highlightText?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showSenderName = false,
  onContextMenu,
  onReact,
  highlightText,
}) => {
  const { user } = useAuth();
  const isOwn = message.sender_id === user?.id;

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration] = useState('0:14');

  const formatTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'HH:mm');
    } catch {
      return '';
    }
  };

  const handleAudioPlayToggle = () => {
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio) {
      let current = 0;
      const interval = setInterval(() => {
        current += 10;
        setAudioProgress(current);
        if (current >= 100) {
          clearInterval(interval);
          setIsPlayingAudio(false);
          setAudioProgress(0);
        }
      }, 150);
    }
  };

  const renderContent = () => {
    if (message.deleted_at) {
      return (
        <span className="italic text-slate-400 dark:text-slate-500 text-xs">
          This message was deleted
        </span>
      );
    }

    if (message.message_type === 'image' && message.file_url) {
      return (
        <div className="space-y-2">
          <img
            src={message.file_url}
            alt={message.file_name || 'Attachment'}
            className="rounded-2xl max-w-xs sm:max-w-sm max-h-64 object-cover cursor-pointer hover:opacity-95 transition-opacity shadow-md"
            onClick={() => window.open(message.file_url, '_blank')}
          />
          {message.content && <p className="text-sm font-normal">{message.content}</p>}
        </div>
      );
    }

    if (message.message_type === 'file') {
      return (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 max-w-xs">
          <div className="w-10 h-10 rounded-xl bg-[#5B5FEF]/20 text-[#5B5FEF] flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{message.file_name || 'Document.pdf'}</p>
            <p className="text-[10px] opacity-70">
              {message.file_size ? `${(message.file_size / (1024 * 1024)).toFixed(1)} MB` : '2.4 MB'}
            </p>
          </div>
          <a
            href={message.file_url || '#'}
            download={message.file_name}
            target="_blank"
            rel="noreferrer"
            className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      );
    }

    if (message.message_type === 'voice') {
      return (
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 min-w-[200px]">
          <button
            onClick={handleAudioPlayToggle}
            className="w-9 h-9 rounded-full bg-[#5B5FEF] text-white flex items-center justify-center shadow-md flex-shrink-0"
          >
            {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-1 h-4">
              <span className="animate-wave-1 w-1 bg-[#5B5FEF] rounded-full" />
              <span className="animate-wave-2 w-1 bg-[#5B5FEF] rounded-full" />
              <span className="animate-wave-3 w-1 bg-[#5B5FEF] rounded-full" />
              <span className="animate-wave-4 w-1 bg-[#5B5FEF] rounded-full" />
              <div className="flex-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden ml-1">
                <div className="h-full bg-[#5B5FEF] transition-all duration-150" style={{ width: `${audioProgress}%` }} />
              </div>
            </div>
            <p className="text-[10px] opacity-70 font-mono">{audioDuration}</p>
          </div>
        </div>
      );
    }

    // Standard text message with in-chat search highlight
    if (highlightText && message.content.toLowerCase().includes(highlightText.toLowerCase())) {
      const parts = message.content.split(new RegExp(`(${highlightText})`, 'gi'));
      return (
        <span className="whitespace-pre-wrap break-words leading-relaxed text-sm font-normal">
          {parts.map((part, i) =>
            part.toLowerCase() === highlightText.toLowerCase() ? (
              <mark key={i} className="bg-amber-300 dark:bg-amber-500 text-slate-900 px-0.5 rounded">
                {part}
              </mark>
            ) : (
              part
            )
          )}
        </span>
      );
    }

    return (
      <p className="whitespace-pre-wrap break-words leading-relaxed text-sm font-normal">
        {message.content}
      </p>
    );
  };

  // Group reactions by emoji
  const reactionsMap = (message.reactions || []).reduce<Record<string, number>>((acc, curr) => {
    acc[curr.reaction] = (acc[curr.reaction] || 0) + 1;
    return acc;
  }, {});

  return (
    <div
      onContextMenu={(e) => onContextMenu(e, message)}
      className={clsx(
        'group relative flex gap-2.5 max-w-[85%] sm:max-w-[75%]',
        isOwn ? 'ml-auto flex-row-reverse' : ''
      )}
    >
      {/* Avatar for received group messages */}
      {!isOwn && (
        <Avatar
          src={message.sender?.avatar_url}
          name={message.sender?.full_name || 'User'}
          size="sm"
          className="mt-1"
        />
      )}

      <div className="space-y-1 min-w-0">
        {/* Sender Name in group chat */}
        {showSenderName && !isOwn && message.sender && (
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 pl-1">
            {message.sender.full_name}
          </p>
        )}

        {/* Message Bubble Container */}
        <div
          className={clsx(
            'relative px-4 py-2.5 rounded-3xl shadow-sm transition-all duration-200',
            isOwn
              ? 'bg-[#5B5FEF] text-white rounded-br-sm'
              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm border border-slate-100 dark:border-slate-700/50'
          )}
        >
          {/* Quoted Reply block */}
          {message.reply_message && (
            <div
              className={clsx(
                'mb-2 p-2 rounded-xl text-xs border-l-4 flex items-center gap-2 cursor-pointer opacity-90',
                isOwn
                  ? 'bg-white/15 border-white text-white'
                  : 'bg-slate-100 dark:bg-slate-700/80 border-[#5B5FEF] text-slate-800 dark:text-slate-200'
              )}
            >
              <CornerUpLeft className="w-3.5 h-3.5 flex-shrink-0" />
              <div className="truncate">
                <span className="font-bold block">
                  {message.reply_message.sender_id === user?.id ? 'You' : message.reply_message.sender?.full_name || 'Reply'}
                </span>
                <span className="truncate block opacity-85">{message.reply_message.content}</span>
              </div>
            </div>
          )}

          {renderContent()}

          {/* Footer: timestamp, edited status, read receipts */}
          <div
            className={clsx(
              'flex items-center justify-end gap-1 mt-1 text-[10px]',
              isOwn ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
            )}
          >
            {message.edited_at && <span className="italic mr-1">(edited)</span>}
            <span>{formatTime(message.created_at)}</span>

            {isOwn && (
              <span title={message.status}>
                {message.status === 'read' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-sky-300" />
                ) : message.status === 'delivered' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-white/80" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-white/80" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Reaction Badges Pill Bar */}
        {Object.keys(reactionsMap).length > 0 && (
          <div className={clsx('flex items-center gap-1 pt-0.5', isOwn ? 'justify-end' : 'justify-start')}>
            {Object.entries(reactionsMap).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => onReact(message.id, emoji)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:scale-105 transition-transform"
              >
                <span>{emoji}</span>
                {count > 1 && <span className="font-bold text-[10px] text-slate-600 dark:text-slate-300">{count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
