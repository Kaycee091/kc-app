import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { ChatSidebar } from './ChatSidebar';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageComposer } from './MessageComposer';
import { ChatDetailsPanel } from './ChatDetailsPanel';
import { SearchOverlay } from './SearchOverlay';
import { MessageContextMenu } from './MessageContextMenu';
import { NewChatModal } from './NewChatModal';
import { GroupModal } from './GroupModal';
import { ProfileModal } from '../profile/ProfileModal';
import { SettingsModal } from '../settings/SettingsModal';
import { Message } from '../../types';

export const ChatLayout: React.FC = () => {
  const {
    activeConversation,
    setActiveConversation,
    messages,
    sendMessage,
    editMessage,
    deleteMessage,
    toggleReaction,
    typingUsers,
    sendTypingSignal,
    inChatSearchQuery,
    setInChatSearchQuery,
    inChatSearchIndex,
    setInChatSearchIndex,
    isDetailsPanelOpen,
    setIsDetailsPanelOpen,
  } = useChat();

  // Mobile View state (conversations vs active_chat)
  const [mobileView, setMobileView] = useState<'sidebar' | 'chat'>('sidebar');

  // Modals state
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // In-chat Search toggle
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Quoted reply state
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Context Menu position state
  const [contextMenuState, setContextMenuState] = useState<{
    message: Message;
    position: { x: number; y: number };
  } | null>(null);

  // Calculate matching messages for in-chat search
  const searchMatches = inChatSearchQuery.trim()
    ? messages.filter((m) => m.content.toLowerCase().includes(inChatSearchQuery.toLowerCase()))
    : [];

  const handleSelectConversation = () => {
    setMobileView('chat');
  };

  const handleBackMobile = () => {
    setMobileView('sidebar');
    setActiveConversation(null);
  };

  const handleContextMenu = (e: React.MouseEvent, message: Message) => {
    e.preventDefault();
    setContextMenuState({
      message,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleCopyText = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleEditMessage = (msg: Message) => {
    const newText = prompt('Edit message:', msg.content);
    if (newText && newText !== msg.content) {
      editMessage(msg.id, newText);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F9FC] dark:bg-[#0F172A]">
      
      {/* 1. SIDEBAR PANEL (Desktop / Tablet / Mobile) */}
      <div
        className={`${
          mobileView === 'sidebar' ? 'block w-full' : 'hidden'
        } md:block flex-shrink-0 h-full`}
      >
        <ChatSidebar
          onOpenNewChat={() => setIsNewChatOpen(true)}
          onOpenGroup={() => setIsGroupOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </div>

      {/* 2. MAIN CHAT AREA */}
      <div
        className={`${
          mobileView === 'chat' ? 'block w-full' : 'hidden'
        } md:flex flex-1 flex-col h-full bg-[#F8F9FC] dark:bg-[#0F172A] relative min-w-0`}
      >
        {activeConversation ? (
          <>
            {/* Header */}
            <ChatHeader
              conversation={activeConversation}
              onBackMobile={handleBackMobile}
              onToggleSearch={() => setIsSearchActive(!isSearchActive)}
              isSearchActive={isSearchActive}
            />

            {/* Search Overlay */}
            {isSearchActive && (
              <SearchOverlay
                query={inChatSearchQuery}
                onChangeQuery={setInChatSearchQuery}
                onClose={() => {
                  setIsSearchActive(false);
                  setInChatSearchQuery('');
                }}
                matchCount={searchMatches.length}
                currentIndex={inChatSearchIndex}
                onNext={() =>
                  setInChatSearchIndex((prev) => (searchMatches.length > 0 ? (prev + 1) % searchMatches.length : 0))
                }
                onPrev={() =>
                  setInChatSearchIndex((prev) =>
                    searchMatches.length > 0 ? (prev - 1 + searchMatches.length) % searchMatches.length : 0
                  )
                }
              />
            )}

            {/* Messages Stream */}
            <MessageList
              messages={messages}
              typingUsers={typingUsers}
              onContextMenu={handleContextMenu}
              onReact={toggleReaction}
              highlightText={inChatSearchQuery}
              isGroup={activeConversation.type === 'group'}
            />

            {/* Message Composer */}
            <MessageComposer
              onSendMessage={sendMessage}
              onTyping={sendTypingSignal}
              replyingTo={replyingTo}
              onClearReply={() => setReplyingTo(null)}
            />
          </>
        ) : (
          /* Empty Chat state when no conversation is selected */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-[#5B5FEF] flex items-center justify-center shadow-lg shadow-[#5B5FEF]/15">
              <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none">
                <path d="M28 32C28 26.4772 32.4772 22 38 22H62C67.5228 22 72 26.4772 72 32V52C72 57.5228 67.5228 62 62 62H46L34 72V62H38C32.4772 62 28 57.5228 28 52V32Z" fill="currentColor" fillOpacity="0.2" />
                <path d="M54 26L38 46H50L46 66L62 46H50L54 26Z" fill="currentColor" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Welcome to Connecta
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Select a conversation from the sidebar or start a new one to begin messaging in real time.
            </p>
          </div>
        )}
      </div>

      {/* 3. DETAILS PANEL (Desktop view toggle) */}
      {activeConversation && isDetailsPanelOpen && (
        <div className="hidden lg:block h-full">
          <ChatDetailsPanel
            conversation={activeConversation}
            onClose={() => setIsDetailsPanelOpen(false)}
          />
        </div>
      )}

      {/* Context Menu Overlay */}
      {contextMenuState && (
        <MessageContextMenu
          message={contextMenuState.message}
          isOwn={contextMenuState.message.sender_id === activeConversation?.members[0]?.user_id}
          position={contextMenuState.position}
          onClose={() => setContextMenuState(null)}
          onReply={(msg) => setReplyingTo(msg)}
          onReact={toggleReaction}
          onCopy={handleCopyText}
          onEdit={handleEditMessage}
          onDelete={deleteMessage}
        />
      )}

      {/* Dialog Modals */}
      <NewChatModal isOpen={isNewChatOpen} onClose={() => setIsNewChatOpen(false)} />
      <GroupModal isOpen={isGroupOpen} onClose={() => setIsGroupOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

    </div>
  );
};
