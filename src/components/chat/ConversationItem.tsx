import React from 'react';
import { Conversation } from '../../types';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import { format, isToday, isYesterday } from 'date-fns';
import { Image as ImageIcon, FileText, Mic, CheckCheck } from 'lucide-react';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  isOnline?: boolean;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onSelect,
  isOnline = false,
}) => {
  const { user } = useAuth();

  // Extract display name & avatar for direct or group chat
  const isGroup = conversation.type === 'group';
  let displayName = conversation.name || 'Conversation';
  let avatarUrl = conversation.avatar_url;

  if (!isGroup) {
    const otherMember = conversation.members.find((m) => m.user_id !== user?.id)?.user;
    if (otherMember) {
      displayName = otherMember.full_name;
      avatarUrl = otherMember.avatar_url;
    }
  }

  // Format last message timestamp
  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const lastMsg = conversation.last_message;

  const renderLastMessageContent = () => {
    if (!lastMsg) return <span className="italic text-slate-400">No messages yet</span>;
    if (lastMsg.deleted_at) return <span className="italic text-slate-400">This message was deleted</span>;

    const isSenderMe = lastMsg.sender_id === user?.id;
    const prefix = isSenderMe ? 'You: ' : isGroup && lastMsg.sender ? `${lastMsg.sender.full_name.split(' ')[0]}: ` : '';

    if (lastMsg.message_type === 'image') {
      return (
        <span className="flex items-center gap-1">
          <span>{prefix}</span>
          <ImageIcon className="w-3.5 h-3.5 text-indigo-500 inline" /> Photo
        </span>
      );
    }
    if (lastMsg.message_type === 'file') {
      return (
        <span className="flex items-center gap-1">
          <span>{prefix}</span>
          <FileText className="w-3.5 h-3.5 text-[#5B5FEF] inline" /> {lastMsg.file_name || 'Document'}
        </span>
      );
    }
    if (lastMsg.message_type === 'voice') {
      return (
        <span className="flex items-center gap-1">
          <span>{prefix}</span>
          <Mic className="w-3.5 h-3.5 text-rose-500 inline" /> Voice message
        </span>
      );
    }

    return <span>{prefix}{lastMsg.content}</span>;
  };

  return (
    <div
      onClick={onSelect}
      className={clsx(
        'group relative flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all duration-200 border',
        isActive
          ? 'bg-[#5B5FEF]/10 dark:bg-[#5B5FEF]/20 border-[#5B5FEF]/30 dark:border-[#5B5FEF]/40 shadow-sm'
          : 'bg-transparent border-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
      )}
    >
      <Avatar
        src={avatarUrl}
        name={displayName}
        size="md"
        isOnline={isOnline}
        showOnlineStatus={!isGroup}
        isGroup={isGroup}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-1">
          <h4
            className={clsx(
              'text-sm font-semibold truncate transition-colors',
              isActive
                ? 'text-[#5B5FEF] dark:text-indigo-400 font-bold'
                : 'text-slate-900 dark:text-slate-100'
            )}
          >
            {displayName}
          </h4>

          {lastMsg && (
            <span
              className={clsx(
                'text-[11px] font-medium flex-shrink-0',
                conversation.unread_count && conversation.unread_count > 0
                  ? 'text-[#5B5FEF] font-bold'
                  : 'text-slate-400 dark:text-slate-500'
              )}
            >
              {formatTime(lastMsg.created_at)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
            {renderLastMessageContent()}
          </div>

          {conversation.unread_count && conversation.unread_count > 0 ? (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#5B5FEF] text-white text-[11px] font-bold shadow-md shadow-[#5B5FEF]/30 animate-pulse">
              {conversation.unread_count}
            </span>
          ) : (
            lastMsg && lastMsg.sender_id === user?.id && (
              <CheckCheck
                className={clsx(
                  'w-4 h-4 flex-shrink-0',
                  lastMsg.status === 'read' ? 'text-indigo-500' : 'text-slate-400'
                )}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};
