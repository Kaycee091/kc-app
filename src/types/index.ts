export type UserStatus = 'online' | 'offline' | 'away';

export interface UserProfile {
  id: string;
  user_id?: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  email?: string;
  is_online: boolean;
  last_seen?: string;
  created_at?: string;
  updated_at?: string;
}

export type ConversationType = 'direct' | 'group';

export interface ConversationMember {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  user?: UserProfile;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string;
  avatar_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  members: ConversationMember[];
  last_message?: Message;
  unread_count?: number;
}

export type MessageType = 'text' | 'image' | 'file' | 'voice' | 'system';

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: string; // Emoji char: ❤️, 😂, 👍, 😮, 😢, 🔥
  created_at: string;
}

export interface MessageRead {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  reply_to?: string;
  reply_message?: Message;
  created_at: string;
  updated_at?: string;
  edited_at?: string;
  deleted_at?: string;
  sender?: UserProfile;
  reactions?: MessageReaction[];
  reads?: MessageRead[];
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface TypingIndicator {
  conversation_id: string;
  user_id: string;
  username: string;
  timestamp: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  readReceipts: boolean;
  onlineVisibility: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
  blockedUsers: string[];
}
