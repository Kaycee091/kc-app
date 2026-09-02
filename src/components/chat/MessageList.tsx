import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../../types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { format, isToday, isYesterday } from 'date-fns';
import { ArrowDown } from 'lucide-react';
import { clsx } from 'clsx';

interface MessageListProps {
  messages: Message[];
  typingUsers: Map<string, string>;
  onContextMenu: (e: React.MouseEvent, msg: Message) => void;
  onReact: (msgId: string, emoji: string) => void;
  highlightText?: string;
  isGroup?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  typingUsers,
  onContextMenu,
  onReact,
  highlightText,
  isGroup = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [hasNewMessagesBelow, setHasNewMessagesBelow] = useState(false);

  // Auto scroll to bottom
  const scrollToBottom = (smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    setShowScrollBottom(false);
    setHasNewMessagesBelow(false);
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length === 0]);

  // Handle scroll position detection
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollBottom(!isBottom);
    if (isBottom) setHasNewMessagesBelow(false);
  };

  // Auto scroll on new message if near bottom
  useEffect(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;

    if (isNearBottom) {
      scrollToBottom(true);
    } else {
      setHasNewMessagesBelow(true);
    }
  }, [messages]);

  // Date Separator Helper
  const formatDateLabel = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isToday(date)) return 'Today';
      if (isYesterday(date)) return 'Yesterday';
      return format(date, 'EEEE, MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  // Group messages by Date string key
  const groupedMessages = messages.reduce<Record<string, Message[]>>((acc, msg) => {
    const key = formatDateLabel(msg.created_at);
    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {});

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-[#5B5FEF] flex items-center justify-center mb-3 shadow-inner">
          <span className="text-3xl">👋</span>
        </div>
        <h4 className="text-base font-bold text-slate-900 dark:text-white">Start the conversation</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
          Send your first message to connect in real time!
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-6 relative"
    >
      {Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
        <div key={dateLabel} className="space-y-4">
          {/* Date Separator Pill */}
          <div className="flex items-center justify-center my-2">
            <span className="px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 shadow-sm border border-slate-300/40 dark:border-slate-700/50">
              {dateLabel}
            </span>
          </div>

          {/* Message Bubbles */}
          <div className="space-y-3">
            {msgs.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                showSenderName={isGroup}
                onContextMenu={onContextMenu}
                onReact={onReact}
                highlightText={highlightText}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Typing Indicator */}
      <TypingIndicator typingUsers={typingUsers} />

      <div ref={bottomRef} />

      {/* Floating Scroll to Bottom / New Message Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className={clsx(
            'sticky bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-2 rounded-full shadow-xl transition-all duration-200 text-xs font-bold z-30',
            hasNewMessagesBelow
              ? 'bg-[#5B5FEF] text-white shadow-[#5B5FEF]/40 animate-bounce'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
          )}
        >
          <ArrowDown className="w-4 h-4" />
          <span>{hasNewMessagesBelow ? 'New messages' : 'Bottom'}</span>
        </button>
      )}
    </div>
  );
};
