import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../ui/Avatar';
import { ConversationItem } from './ConversationItem';
import { ConnectionBadge } from '../ui/ConnectionBadge';
import { Search, Plus, Users, Settings, User as UserIcon, LogOut, MessageSquare } from 'lucide-react';
import { clsx } from 'clsx';

interface ChatSidebarProps {
  onOpenNewChat: () => void;
  onOpenGroup: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  onOpenNewChat,
  onOpenGroup,
  onOpenProfile,
  onOpenSettings,
}) => {
  const { user, logout } = useAuth();
  const { conversations, activeConversation, setActiveConversation, onlineUsers, searchQuery, setSearchQuery } = useChat();

  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'unread' | 'groups'>('all');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Filter conversations based on tab & search term
  const filteredConversations = conversations.filter((conv) => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (conv.type === 'group') {
        if (!conv.name?.toLowerCase().includes(q)) return false;
      } else {
        const other = conv.members.find((m) => m.user_id !== user?.id)?.user;
        if (!other?.full_name.toLowerCase().includes(q) && !other?.username.toLowerCase().includes(q)) {
          return false;
        }
      }
    }

    // Tab filter
    if (activeTabFilter === 'unread') return (conv.unread_count || 0) > 0;
    if (activeTabFilter === 'groups') return conv.type === 'group';
    return true;
  });

  return (
    <div className="w-full md:w-80 lg:w-96 flex flex-col h-full bg-white/70 dark:bg-slate-900/70 border-r border-slate-200/80 dark:border-slate-800 backdrop-blur-xl z-10 transition-all">
      
      {/* Top Header & Brand Branding */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#5B5FEF] to-[#7C3AED] flex items-center justify-center shadow-md shadow-[#5B5FEF]/25">
              <svg className="w-6 h-6 text-white" viewBox="0 0 100 100" fill="none">
                <path d="M28 32C28 26.4772 32.4772 22 38 22H62C67.5228 22 72 26.4772 72 32V52C72 57.5228 67.5228 62 62 62H46L34 72V62H38C32.4772 62 28 57.5228 28 52V32Z" fill="white" fillOpacity="0.2" />
                <path d="M54 26L38 46H50L46 66L62 46H50L54 26Z" fill="white" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Connecta
              </h2>
              <ConnectionBadge />
            </div>
          </div>

          {/* User Profile Trigger & Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="focus:outline-none ring-2 ring-transparent focus:ring-[#5B5FEF] rounded-full transition-all"
            >
              <Avatar
                src={user?.avatar_url}
                name={user?.full_name || 'User'}
                size="md"
                isOnline
                showOnlineStatus
              />
            </button>

            {showUserDropdown && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-slide-up"
                onClick={() => setShowUserDropdown(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.full_name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    @{user?.username}
                  </p>
                </div>

                <button
                  onClick={onOpenProfile}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-[#5B5FEF]" />
                  <span>Profile</span>
                </button>

                <button
                  onClick={onOpenSettings}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Settings</span>
                </button>

                <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search messages or contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/30 focus:border-[#5B5FEF] transition-all"
          />
        </div>

        {/* Filter Tabs & New Action Buttons */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTabFilter('all')}
              className={clsx(
                'px-3 py-1 rounded-lg text-xs font-bold transition-all',
                activeTabFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-[#5B5FEF] dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              All
            </button>
            <button
              onClick={() => setActiveTabFilter('unread')}
              className={clsx(
                'px-3 py-1 rounded-lg text-xs font-bold transition-all',
                activeTabFilter === 'unread'
                  ? 'bg-white dark:bg-slate-700 text-[#5B5FEF] dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              Unread
            </button>
            <button
              onClick={() => setActiveTabFilter('groups')}
              className={clsx(
                'px-3 py-1 rounded-lg text-xs font-bold transition-all',
                activeTabFilter === 'groups'
                  ? 'bg-white dark:bg-slate-700 text-[#5B5FEF] dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              Groups
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenGroup}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Create group chat"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenNewChat}
              className="p-2 rounded-xl bg-[#5B5FEF] text-white hover:bg-[#4A4EC5] shadow-md shadow-[#5B5FEF]/25 transition-all"
              title="Start new chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-[#5B5FEF] flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No conversations found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Find someone and send your first message.
            </p>
            <button
              onClick={onOpenNewChat}
              className="px-4 py-2 rounded-xl bg-[#5B5FEF] text-white text-xs font-bold shadow-md hover:bg-[#4A4EC5]"
            >
              New Chat
            </button>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isGroup = conv.type === 'group';
            let isOnline = false;
            if (!isGroup) {
              const other = conv.members.find((m) => m.user_id !== user?.id)?.user;
              if (other) {
                isOnline = onlineUsers.get(other.id) ?? other.is_online;
              }
            }
            return (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={activeConversation?.id === conv.id}
                onSelect={() => setActiveConversation(conv)}
                isOnline={isOnline}
              />
            );
          })
        )}
      </div>

    </div>
  );
};
