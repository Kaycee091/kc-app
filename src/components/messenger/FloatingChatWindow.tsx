import React, { useState, useRef } from 'react';
import { UserProfile, Message } from '../../types/social';
import { useMessenger } from '../../context/MessengerContext';
import { Avatar } from '../ui/Avatar';
import { X, Minus, Send, Paperclip, Mic, Image as ImageIcon } from 'lucide-react';
import { uploadFile } from '../../services/storageService';
import { format } from 'date-fns';

interface FloatingChatWindowProps {
  contact: UserProfile;
  onClose: () => void;
}

export const FloatingChatWindow: React.FC<FloatingChatWindowProps> = ({ contact, onClose }) => {
  const { conversations, messagesMap, sendMessage, sendTypingSignal, typingMap } = useMessenger();
  const [text, setText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Find or construct conversation ID
  const conversation = conversations.find((c) => c.members.some((m) => m.id === contact.id)) || conversations[0];
  const convMessages = conversation ? messagesMap[conversation.id] || [] : [];
  const isTyping = conversation ? typingMap.has(conversation.id) : false;

  const handleSend = async () => {
    if (!text.trim() || !conversation) return;
    await sendMessage(conversation.id, text.trim(), 'text');
    setText('');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversation) return;
    try {
      const uploaded = await uploadFile(file);
      await sendMessage(conversation.id, '', 'image', uploaded.url);
    } catch (e) {}
  };

  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        className="relative flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-full shadow-2xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:scale-105 transition-all"
      >
        <Avatar src={contact.avatar_url} name={contact.full_name} size="sm" isOnline showOnlineStatus />
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-slate-400 hover:text-slate-600 p-0.5">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-72 sm:w-80 h-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col z-50 animate-slide-up overflow-hidden">
      
      {/* Mini Chat Header */}
      <div className="h-12 px-3 bg-[#2563EB] text-white flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar src={contact.avatar_url} name={contact.full_name} size="xs" />
          <span className="text-xs font-bold truncate">{contact.full_name}</span>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(true)} className="p-1 hover:bg-white/20 rounded">
            <Minus className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
        {convMessages.map((msg) => {
          const isOwn = msg.sender_id !== contact.id;
          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[80%] ${isOwn ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <div
                className={`p-2.5 rounded-2xl ${
                  isOwn
                    ? 'bg-[#2563EB] text-white rounded-br-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none'
                }`}
              >
                {msg.message_type === 'image' && msg.file_url ? (
                  <img src={msg.file_url} alt="Sent file" className="rounded-xl max-h-36 object-cover" />
                ) : (
                  <span>{msg.content}</span>
                )}
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                {format(new Date(msg.created_at), 'HH:mm')}
              </span>
            </div>
          );
        })}

        {isTyping && (
          <p className="text-[10px] text-slate-400 italic animate-pulse">
            {contact.first_name} is typing...
          </p>
        )}
      </div>

      {/* Mini Composer */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50">
        <input type="file" ref={fileRef} accept="image/*" onChange={handleFileSelect} className="hidden" />
        <button onClick={() => fileRef.current?.click()} className="p-1.5 text-slate-400 hover:text-slate-600">
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          placeholder="Type message..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (conversation) sendTypingSignal(conversation.id);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 text-xs py-1.5 px-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
        />

        <button onClick={handleSend} className="p-1.5 text-[#2563EB] hover:scale-110 transition-transform">
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
