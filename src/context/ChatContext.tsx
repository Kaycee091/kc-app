import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Conversation, Message, MessageReaction, UserProfile, TypingIndicator, AppSettings } from '../types';
import { DEMO_CONVERSATIONS, DEMO_MESSAGES, DEMO_USERS } from '../services/mockData';
import { realtimeEngine } from '../services/realtimeService';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  setActiveConversation: (conv: Conversation | null) => void;
  messages: Message[];
  sendMessage: (content: string, type?: 'text' | 'image' | 'file' | 'voice', fileData?: { url: string; name: string; size: number }, replyToId?: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string, mode: 'for_me' | 'for_everyone') => Promise<void>;
  toggleReaction: (messageId: string, reaction: string) => Promise<void>;
  markAsRead: (conversationId: string) => void;
  typingUsers: Map<string, string>; // userId -> username
  sendTypingSignal: () => void;
  onlineUsers: Map<string, boolean>; // userId -> is_online
  allUsers: UserProfile[];
  createDirectConversation: (userId: string) => Promise<Conversation>;
  createGroupConversation: (name: string, memberIds: string[], avatarUrl?: string) => Promise<Conversation>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  inChatSearchQuery: string;
  setInChatSearchQuery: (query: string) => void;
  inChatSearchIndex: number;
  setInChatSearchIndex: (idx: number | ((prev: number) => number)) => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  isDetailsPanelOpen: boolean;
  setIsDetailsPanelOpen: (open: boolean) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  readReceipts: true,
  onlineVisibility: true,
  soundEnabled: true,
  desktopNotifications: false,
  blockedUsers: [],
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('connecta_conversations');
    return saved ? JSON.parse(saved) : DEMO_CONVERSATIONS;
  });

  const [activeConversation, setActiveConversationState] = useState<Conversation | null>(() => {
    const saved = localStorage.getItem('connecta_conversations');
    const list = saved ? JSON.parse(saved) : DEMO_CONVERSATIONS;
    return list[0] || null;
  });

  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('connecta_messages');
    return saved ? JSON.parse(saved) : DEMO_MESSAGES;
  });

  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<Map<string, boolean>>(new Map());
  const [allUsers] = useState<UserProfile[]>(DEMO_USERS);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inChatSearchQuery, setInChatSearchQuery] = useState<string>('');
  const [inChatSearchIndex, setInChatSearchIndex] = useState<number>(0);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState<boolean>(true);

  const [settings, setSettingsState] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('connecta_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('connecta_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('connecta_messages', JSON.stringify(messagesMap));
  }, [messagesMap]);

  useEffect(() => {
    localStorage.setItem('connecta_settings', JSON.stringify(settings));
  }, [settings]);

  // Audio sound notification trigger
  const playNotificationSound = useCallback(() => {
    if (!settings.soundEnabled) return;
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}
  }, [settings.soundEnabled]);

  // Active conversation helper
  const setActiveConversation = (conv: Conversation | null) => {
    setActiveConversationState(conv);
    if (conv) {
      markAsRead(conv.id);
    }
  };

  const markAsRead = useCallback((conversationId: string) => {
    if (!user) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c))
    );
    setMessagesMap((prev) => {
      const convMsgs = prev[conversationId] || [];
      const updated = convMsgs.map((m) => {
        if (m.sender_id !== user.id && m.status !== 'read') {
          return {
            ...m,
            status: 'read' as const,
            reads: [...(m.reads || []), { id: `read_${Date.now()}`, message_id: m.id, user_id: user.id, read_at: new Date().toISOString() }]
          };
        }
        return m;
      });
      return { ...prev, [conversationId]: updated };
    });
  }, [user]);

  // Real-time Event Listeners
  useEffect(() => {
    // 1. Listen for new messages
    const unsubscribeMessage = realtimeEngine.subscribe('new_message', (incomingMsg: Message) => {
      setMessagesMap((prev) => {
        const convMsgs = prev[incomingMsg.conversation_id] || [];
        // Prevent duplicates
        if (convMsgs.some((m) => m.id === incomingMsg.id)) return prev;

        const isCurrentActive = activeConversation?.id === incomingMsg.conversation_id;
        const finalStatus: 'read' | 'delivered' = isCurrentActive && incomingMsg.sender_id !== user?.id ? 'read' : 'delivered';

        const updatedMsg = { ...incomingMsg, status: finalStatus };
        return {
          ...prev,
          [incomingMsg.conversation_id]: [...convMsgs, updatedMsg],
        };
      });

      // Update conversation list preview & unread count
      setConversations((prev) => {
        return prev.map((c) => {
          if (c.id === incomingMsg.conversation_id) {
            const isCurrentActive = activeConversation?.id === incomingMsg.conversation_id;
            const incUnread = (!isCurrentActive && incomingMsg.sender_id !== user?.id) ? (c.unread_count || 0) + 1 : 0;
            return {
              ...c,
              last_message: incomingMsg,
              updated_at: incomingMsg.created_at,
              unread_count: incUnread,
            };
          }
          return c;
        }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      });

      if (incomingMsg.sender_id !== user?.id) {
        playNotificationSound();
      }
    });

    // 2. Listen for message edits
    const unsubscribeEdit = realtimeEngine.subscribe('message_edit', ({ messageId, conversationId, content }) => {
      setMessagesMap((prev) => {
        const msgs = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: msgs.map((m) =>
            m.id === messageId ? { ...m, content, edited_at: new Date().toISOString() } : m
          ),
        };
      });
    });

    // 3. Listen for message deletions
    const unsubscribeDelete = realtimeEngine.subscribe('message_delete', ({ messageId, conversationId }) => {
      setMessagesMap((prev) => {
        const msgs = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: msgs.map((m) =>
            m.id === messageId ? { ...m, deleted_at: new Date().toISOString(), content: 'This message was deleted' } : m
          ),
        };
      });
    });

    // 4. Listen for reactions
    const unsubscribeReaction = realtimeEngine.subscribe('reaction_toggle', ({ messageId, conversationId, userId, reaction }) => {
      setMessagesMap((prev) => {
        const msgs = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: msgs.map((m) => {
            if (m.id !== messageId) return m;
            const existing = m.reactions || [];
            const hasSame = existing.some((r) => r.user_id === userId && r.reaction === reaction);
            let updatedReactions: MessageReaction[];
            if (hasSame) {
              updatedReactions = existing.filter((r) => !(r.user_id === userId && r.reaction === reaction));
            } else {
              updatedReactions = [...existing, { id: `rx_${Date.now()}`, message_id: messageId, user_id: userId, reaction, created_at: new Date().toISOString() }];
            }
            return { ...m, reactions: updatedReactions };
          }),
        };
      });
    });

    // 5. Listen for typing signals
    const unsubscribeTyping = realtimeEngine.subscribe('typing_signal', (data: TypingIndicator) => {
      if (data.user_id === user?.id) return;
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.set(data.user_id, data.username);
        return next;
      });
      setTimeout(() => {
        setTypingUsers((prev) => {
          const next = new Map(prev);
          next.delete(data.user_id);
          return next;
        });
      }, 3000);
    });

    // 6. Listen for online presence
    const unsubscribePresence = realtimeEngine.subscribe('presence_change', ({ userId, isOnline }) => {
      setOnlineUsers((prev) => {
        const next = new Map(prev);
        next.set(userId, isOnline);
        return next;
      });
    });

    return () => {
      unsubscribeMessage();
      unsubscribeEdit();
      unsubscribeDelete();
      unsubscribeReaction();
      unsubscribeTyping();
      unsubscribePresence();
    };
  }, [activeConversation, user, playNotificationSound]);

  // Send Message implementation
  const sendMessage = async (
    content: string,
    type: 'text' | 'image' | 'file' | 'voice' = 'text',
    fileData?: { url: string; name: string; size: number },
    replyToId?: string
  ) => {
    if (!activeConversation || !user) return;

    let replyMessage: Message | undefined;
    if (replyToId) {
      const convMsgs = messagesMap[activeConversation.id] || [];
      replyMessage = convMsgs.find((m) => m.id === replyToId);
    }

    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversation_id: activeConversation.id,
      sender_id: user.id,
      content,
      message_type: type,
      file_url: fileData?.url,
      file_name: fileData?.name,
      file_size: fileData?.size,
      reply_to: replyToId,
      reply_message: replyMessage,
      created_at: new Date().toISOString(),
      status: 'sent',
      sender: user,
      reactions: [],
      reads: [],
    };

    // Optimistic UI insert
    setMessagesMap((prev) => ({
      ...prev,
      [activeConversation.id]: [...(prev[activeConversation.id] || []), newMsg],
    }));

    // Update conversation last message preview
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? { ...c, last_message: newMsg, updated_at: newMsg.created_at }
          : c
      ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    );

    // Broadcast in real-time
    realtimeEngine.broadcast('new_message', newMsg);

    // Supabase DB persist if configured
    if (isSupabaseConfigured) {
      try {
        await supabase.from('messages').insert({
          id: newMsg.id,
          conversation_id: newMsg.conversation_id,
          sender_id: newMsg.sender_id,
          content: newMsg.content,
          message_type: newMsg.message_type,
          file_url: newMsg.file_url,
          file_name: newMsg.file_name,
          file_size: newMsg.file_size,
          reply_to: newMsg.reply_to,
        });
      } catch (e) {
        console.warn('Failed to insert message to Supabase DB:', e);
      }
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    if (!activeConversation) return;
    setMessagesMap((prev) => {
      const msgs = prev[activeConversation.id] || [];
      return {
        ...prev,
        [activeConversation.id]: msgs.map((m) =>
          m.id === messageId ? { ...m, content: newContent, edited_at: new Date().toISOString() } : m
        ),
      };
    });
    realtimeEngine.broadcast('message_edit', { messageId, conversationId: activeConversation.id, content: newContent });
  };

  const deleteMessage = async (messageId: string, mode: 'for_me' | 'for_everyone') => {
    if (!activeConversation) return;
    if (mode === 'for_everyone') {
      setMessagesMap((prev) => {
        const msgs = prev[activeConversation.id] || [];
        return {
          ...prev,
          [activeConversation.id]: msgs.map((m) =>
            m.id === messageId ? { ...m, deleted_at: new Date().toISOString(), content: 'This message was deleted' } : m
          ),
        };
      });
      realtimeEngine.broadcast('message_delete', { messageId, conversationId: activeConversation.id });
    } else {
      // Remove locally from UI
      setMessagesMap((prev) => ({
        ...prev,
        [activeConversation.id]: (prev[activeConversation.id] || []).filter((m) => m.id !== messageId),
      }));
    }
  };

  const toggleReaction = async (messageId: string, reaction: string) => {
    if (!activeConversation || !user) return;
    setMessagesMap((prev) => {
      const msgs = prev[activeConversation.id] || [];
      return {
        ...prev,
        [activeConversation.id]: msgs.map((m) => {
          if (m.id !== messageId) return m;
          const existing = m.reactions || [];
          const hasSame = existing.some((r) => r.user_id === user.id && r.reaction === reaction);
          let updatedReactions: MessageReaction[];
          if (hasSame) {
            updatedReactions = existing.filter((r) => !(r.user_id === user.id && r.reaction === reaction));
          } else {
            updatedReactions = [...existing, { id: `rx_${Date.now()}`, message_id: messageId, user_id: user.id, reaction, created_at: new Date().toISOString() }];
          }
          return { ...m, reactions: updatedReactions };
        }),
      };
    });

    realtimeEngine.broadcast('reaction_toggle', {
      messageId,
      conversationId: activeConversation.id,
      userId: user.id,
      reaction,
    });
  };

  const sendTypingSignal = () => {
    if (!activeConversation || !user) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    realtimeEngine.broadcast('typing_signal', {
      conversation_id: activeConversation.id,
      user_id: user.id,
      username: user.full_name.split(' ')[0],
      timestamp: Date.now(),
    });
  };

  const createDirectConversation = async (targetUserId: string): Promise<Conversation> => {
    const targetUser = allUsers.find((u) => u.id === targetUserId) || {
      id: targetUserId,
      username: 'user',
      full_name: 'Contact User',
      is_online: true,
    };

    // Check existing direct conversation
    const existing = conversations.find(
      (c) => c.type === 'direct' && c.members.some((m) => m.user_id === targetUserId)
    );
    if (existing) {
      setActiveConversation(existing);
      return existing;
    }

    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      type: 'direct',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      members: [
        { id: `cm_${Date.now()}_1`, conversation_id: `conv_${Date.now()}`, user_id: user?.id || 'current_user', role: 'admin', joined_at: new Date().toISOString() },
        { id: `cm_${Date.now()}_2`, conversation_id: `conv_${Date.now()}`, user_id: targetUserId, role: 'member', joined_at: new Date().toISOString(), user: targetUser },
      ],
      unread_count: 0,
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversation(newConv);
    return newConv;
  };

  const createGroupConversation = async (name: string, memberIds: string[], avatarUrl?: string): Promise<Conversation> => {
    const groupMembers = memberIds.map((id, index) => {
      const foundUser = allUsers.find((u) => u.id === id);
      return {
        id: `cm_g_${Date.now()}_${index}`,
        conversation_id: `conv_g_${Date.now()}`,
        user_id: id,
        role: 'member' as const,
        joined_at: new Date().toISOString(),
        user: foundUser,
      };
    });

    const newGroup: Conversation = {
      id: `conv_group_${Date.now()}`,
      type: 'group',
      name,
      avatar_url: avatarUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
      created_by: user?.id || 'current_user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      members: [
        { id: `cm_admin_${Date.now()}`, conversation_id: `conv_g_${Date.now()}`, user_id: user?.id || 'current_user', role: 'admin', joined_at: new Date().toISOString() },
        ...groupMembers,
      ],
      unread_count: 0,
    };

    setConversations((prev) => [newGroup, ...prev]);
    setActiveConversation(newGroup);
    return newGroup;
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...newSettings }));
  };

  const activeMessages = activeConversation ? messagesMap[activeConversation.id] || [] : [];

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        setActiveConversation,
        messages: activeMessages,
        sendMessage,
        editMessage,
        deleteMessage,
        toggleReaction,
        markAsRead,
        typingUsers,
        sendTypingSignal,
        onlineUsers,
        allUsers,
        createDirectConversation,
        createGroupConversation,
        searchQuery,
        setSearchQuery,
        inChatSearchQuery,
        setInChatSearchQuery,
        inChatSearchIndex,
        setInChatSearchIndex,
        settings,
        updateSettings,
        isDetailsPanelOpen,
        setIsDetailsPanelOpen,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
