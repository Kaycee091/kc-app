import { Conversation, Message, UserProfile } from '../types/social';
import { DEMO_CONVERSATIONS, DEMO_MESSAGES } from './mockSocialData';
import { realtimeEngine } from './realtimeService';
import { authService } from './authService';

const CONVS_KEY = 'connecta_conversations_db';
const MESSAGES_KEY = 'connecta_messages_db';

class MessagingService {
  private conversations: Conversation[] = [];
  private messagesMap: Record<string, Message[]> = {};

  constructor() {
    const savedConvs = localStorage.getItem(CONVS_KEY);
    const savedMsgs = localStorage.getItem(MESSAGES_KEY);

    this.conversations = savedConvs ? JSON.parse(savedConvs) : DEMO_CONVERSATIONS;
    this.messagesMap = savedMsgs ? JSON.parse(savedMsgs) : DEMO_MESSAGES;
  }

  private persist() {
    localStorage.setItem(CONVS_KEY, JSON.stringify(this.conversations));
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(this.messagesMap));
  }

  getConversations(): Conversation[] {
    return this.conversations;
  }

  getMessages(conversationId: string): Message[] {
    return this.messagesMap[conversationId] || [];
  }

  async sendMessage(
    conversationId: string,
    content: string,
    type: 'text' | 'image' | 'file' | 'voice' = 'text',
    fileUrl?: string
  ): Promise<Message> {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthenticated');

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

    const currentList = this.messagesMap[conversationId] || [];
    this.messagesMap[conversationId] = [...currentList, newMsg];

    this.conversations = this.conversations.map((c) =>
      c.id === conversationId ? { ...c, last_message: newMsg, updated_at: newMsg.created_at } : c
    );

    this.persist();
    realtimeEngine.broadcast('chat_message', newMsg);
    return newMsg;
  }

  sendTypingSignal(conversationId: string) {
    const user = authService.getCurrentUser();
    if (!user) return;
    realtimeEngine.broadcast('chat_typing', {
      conversationId,
      username: user.first_name,
    });
  }
}

export const messagingService = new MessagingService();
