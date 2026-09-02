import React, { useState } from 'react';
import { useMessenger } from '../../context/MessengerContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Send, Image, Paperclip, Search, Phone, Video } from 'lucide-react';
import { format } from 'date-fns';

export const FullMessengerView: React.FC = () => {
  const { user } = useAuth();
  const { conversations, activeConversation, setActiveConversation, messagesMap, sendMessage, sendTypingSignal } = useMessenger();
  const [text, setText] = useState('');

  const currentConv = activeConversation || conversations[0];
  const messages = currentConv ? messagesMap[currentConv.id] || [] : [];
  const otherMember = currentConv?.members.find((m) => m.id !== user?.id);

  const handleSend = async () => {
    if (!text.trim() || !currentConv) return;
    await sendMessage(currentConv.id, text.trim(), 'text');
    setText('');
  };

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl animate-fade-in">
      
      {/* Left Conversations Sidebar */}
      <div className="w-full sm:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Messages</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((conv) => {
            const member = conv.members.find((m) => m.id !== user?.id);
            const isActive = currentConv?.id === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${
                  isActive ? 'bg-[#2563EB]/10 dark:bg-[#2563EB]/20 border border-[#2563EB]/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Avatar src={member?.avatar_url} name={member?.full_name || 'User'} size="md" isOnline showOnlineStatus />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{member?.full_name}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{conv.last_message?.content || 'No messages yet'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Main Chat Window */}
      <div className="hidden sm:flex flex-1 flex-col h-full bg-slate-50/50 dark:bg-slate-950/40">
        {currentConv ? (
          <>
            {/* Header */}
            <div className="h-14 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={otherMember?.avatar_url} name={otherMember?.full_name || 'User'} size="md" isOnline showOnlineStatus />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{otherMember?.full_name}</h4>
                  <span className="text-[11px] text-emerald-500 font-semibold">● Online</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isOwn = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl text-xs ${
                        isOwn
                          ? 'bg-[#2563EB] text-white rounded-br-none'
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <span className="text-[9px] opacity-70 block text-right mt-1">
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Composer */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  sendTypingSignal(currentConv.id);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 text-xs py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
              <button onClick={handleSend} className="p-2.5 rounded-xl bg-[#2563EB] text-white">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
            Select a conversation to start messaging
          </div>
        )}
      </div>

    </div>
  );
};
