import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Conversation, Message, UserProfile } from '../types/social';
import { DEMO_CONVERSATIONS, DEMO_MESSAGES, DEMO_USERS } from '../services/mockSocialData';
import { realtimeEngine } from '../services/realtimeService';
import { useAuth } from './AuthContext';

interface MessengerContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  setActiveConversation: (conv: Conversation | null) => void;
  openDockedChat: (targetUser: UserProfile) => void;
  dockedChats: UserProfile[];
  closeDockedChat: (userId: string) => void;
  messagesMap: Record<string, Message[]>;
  sendMessage: (conversationId: string, content: string, type?: 'text' | 'image' | 'file' | 'voice', fileUrl?: string) => Promise<void>;
  typingMap: Map<string, string>;
  sendTypingSignal: (conversationId: string) => void;
}

const MessengerContext = createContext<MessengerContextType | undefined>(undefined);

export const MessengerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('kc_conversations');
    return saved ? JSON.parse(saved) : DEMO_CONVERSATIONS;
  });

  const [activeConversation, setActiveConversation] = useState<Conversation | null>(DEMO_CONVERSATIONS[0]);
  const [dockedChats, setDockedChats] = useState<UserProfile[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('kc_messages');
    return saved ? JSON.parse(saved) : DEMO_MESSAGES;
  });
  const [typingMap, setTypingMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    localStorage.setItem('kc_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('kc_messages', JSON.stringify(messagesMap));
  }, [messagesMap]);

  // Real-time Event Listener for Messenger
  useEffect(() => {
    const unsubMessage = realtimeEngine.subscribe('chat_message', (msg: Message) => {
      setMessagesMap((prev) => {
        const list = prev[msg.conversation_id] || [];
        if (list.some((m) => m.id === msg.id)) return prev;
        return {
          ...prev,
          [msg.conversation_id]: [...list, msg],
        };
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversation_id ? { ...c, last_message: msg, updated_at: msg.created_at } : c
        )
      );
    });

    const unsubTyping = realtimeEngine.subscribe('chat_typing', ({ conversationId, username }) => {
      setTypingMap((prev) => new Map(prev).set(conversationId, username));
      setTimeout(() => {
        setTypingMap((prev) => {
          const next = new Map(prev);
          next.delete(conversationId);
          return next;
        });
      }, 3000);
    });

    return () => {
      unsubMessage();
      unsubTyping();
    };
  }, []);

  const openDockedChat = (targetUser: UserProfile) => {
    if (!dockedChats.some((u) => u.id === targetUser.id)) {
      setDockedChats((prev) => [...prev.slice(-2), targetUser]); // max 3 docked chats
    }
  };

  const closeDockedChat = (userId: string) => {
    setDockedChats((prev) => prev.filter((u) => u.id !== userId));
  };

  const sendMessage = async (
    conversationId: string,
    content: string,
    type: 'text' | 'image' | 'file' | 'voice' = 'text',
    fileUrl?: string
  ) => {
    if (!user) return;
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversation_id: conversationId,
      sender_id: user.id,
      sender: user,
      content,
      message_type: type,
      file_url: fileUrl,
      created_at: new Date().toISOString(),
      status: 'sent',
    };

    setMessagesMap((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, last_message: newMsg, updated_at: newMsg.created_at } : c))
    );

    realtimeEngine.broadcast('chat_message', newMsg);
  };

  const sendTypingSignal = (conversationId: string) => {
    if (!user) return;
    realtimeEngine.broadcast('chat_typing', {
      conversationId,
      username: user.first_name,
    });
  };

  return (
    <MessengerContext.Provider
      value={{
        conversations,
        activeConversation,
        setActiveConversation,
        openDockedChat,
        dockedChats,
        closeDockedChat,
        messagesMap,
        sendMessage,
        typingMap,
        sendTypingSignal,
      }}
    >
      {children}
    </MessengerContext.Provider>
  );
};

export const useMessenger = () => {
  const context = useContext(MessengerContext);
  if (!context) throw new Error('useMessenger must be used within a MessengerProvider');
  return context;
};
