export type ReactionType = 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry';
export type PostPrivacy = 'public' | 'friends' | 'only_me';

export interface UserProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  phone?: string;
  email?: string;
  dob?: string;
  gender?: string;
  location?: string;
  work?: string;
  education?: string;
  relationship_status?: string;
  website?: string;
  is_verified?: boolean;
  is_online: boolean;
  last_seen?: string;
  created_at?: string;
  followers_count?: number;
  following_count?: number;
  friends_count?: number;
  role?: 'super_admin' | 'admin' | 'moderator' | 'support' | 'user';
  status?: 'active' | 'suspended' | 'banned' | 'pending';
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // user IDs who voted
}

export interface PostPoll {
  question: string;
  options: PollOption[];
}

export interface PostMedia {
  id: string;
  media_type: 'image' | 'video';
  url: string;
}

export interface PostReaction {
  id: string;
  user_id: string;
  reaction_type: ReactionType;
  user?: UserProfile;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  author?: UserProfile;
  parent_id?: string;
  content: string;
  image_url?: string;
  created_at: string;
  reactions?: PostReaction[];
  replies?: PostComment[];
}

export interface Post {
  id: string;
  author_id: string;
  author?: UserProfile;
  group_id?: string;
  group_name?: string;
  page_id?: string;
  page_name?: string;
  content: string;
  media?: PostMedia[];
  privacy: PostPrivacy;
  feeling?: string;
  location?: string;
  bg_style?: string;
  poll?: PostPoll;
  reactions: PostReaction[];
  comments: PostComment[];
  comments_count: number;
  shares_count: number;
  is_saved?: boolean;
  created_at: string;
}

export interface Story {
  id: string;
  author_id: string;
  author?: UserProfile;
  media_url?: string;
  text_content?: string;
  bg_color?: string;
  expires_at: string;
  created_at: string;
  views_count?: number;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  friend?: UserProfile;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  cover_url?: string;
  privacy: 'public' | 'private';
  created_by: string;
  members_count: number;
  is_joined?: boolean;
  rules?: string[];
}

export interface Page {
  id: string;
  name: string;
  username: string;
  description: string;
  avatar_url?: string;
  cover_url?: string;
  followers_count: number;
  is_following?: boolean;
}

export interface MarketplaceListing {
  id: string;
  seller_id: string;
  seller?: UserProfile;
  title: string;
  price: number;
  category: string;
  condition: string;
  description: string;
  location: string;
  image_url: string;
  created_at: string;
  is_saved?: boolean;
}

export interface EventItem {
  id: string;
  organizer_id: string;
  organizer?: UserProfile;
  title: string;
  description: string;
  location: string;
  start_time: string;
  cover_url?: string;
  rsvp_status?: 'going' | 'interested' | 'not_going';
  attendees_count: number;
}

export interface NotificationItem {
  id: string;
  recipient_id: string;
  actor_id: string;
  actor?: UserProfile;
  type: 'friend_request' | 'friend_accept' | 'like' | 'reaction' | 'comment' | 'reply' | 'tag' | 'message';
  title: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface MemoryItem {
  id: string;
  original_post: Post;
  years_ago: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender?: UserProfile;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'voice';
  file_url?: string;
  created_at: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  avatar_url?: string;
  members: UserProfile[];
  last_message?: Message;
  unread_count?: number;
  updated_at: string;
}

export interface ReportItem {
  id: string;
  item_type: 'post' | 'comment' | 'user' | 'marketplace' | 'group';
  item_id: string;
  reporter_id: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}
