import React from 'react';
import { Conversation } from '../../types';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { ArrowLeft, Search, Info, Phone, Video, MoreVertical } from 'lucide-react';
import { clsx } from 'clsx';

interface ChatHeaderProps {
  conversation: Conversation;
  onBackMobile: () => void;
  onToggleSearch: () => void;
  isSearchActive: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  onBackMobile,
  onToggleSearch,
  isSearchActive,
}) => {
  const { user } = useAuth();
  const { onlineUsers, isDetailsPanelOpen, setIsDetailsPanelOpen } = useChat();

  const isGroup = conversation.type === 'group';
  let displayName = conversation.name || 'Group Chat';
  let avatarUrl = conversation.avatar_url;
  let isOnline = false;
  let subtitleText = '';

  if (!isGroup) {
    const otherMember = conversation.members.find((m) => m.user_id !== user?.id)?.user;
    if (otherMember) {
      displayName = otherMember.full_name;
      avatarUrl = otherMember.avatar_url;
      isOnline = onlineUsers.get(otherMember.id) ?? otherMember.is_online;
      subtitleText = isOnline ? '● Online' : 'Offline';
    }
  } else {
    subtitleText = `${conversation.members.length} members`;
  }

  return (
    <div className="h-16 px-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between z-20 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Back Button */}
        <button
          onClick={onBackMobile}
          className="md:hidden p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          title="Back to conversations"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <Avatar
          src={avatarUrl}
          name={displayName}
          size="md"
          isOnline={isOnline}
          showOnlineStatus={!isGroup}
          isGroup={isGroup}
        />

        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
            {displayName}
          </h3>
          <p
            className={clsx(
              'text-xs font-medium truncate',
              isOnline && !isGroup ? 'text-emerald-500 font-semibold' : 'text-slate-500 dark:text-slate-400'
            )}
          >
            {subtitleText}
          </p>
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleSearch}
          className={clsx(
            'p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
            isSearchActive && 'bg-[#5B5FEF]/10 text-[#5B5FEF] dark:text-indigo-400'
          )}
          title="Search in conversation"
        >
          <Search className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsDetailsPanelOpen(!isDetailsPanelOpen)}
          className={clsx(
            'p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:flex',
            isDetailsPanelOpen && 'bg-[#5B5FEF]/10 text-[#5B5FEF] dark:text-indigo-400'
          )}
          title="View profile & details"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
