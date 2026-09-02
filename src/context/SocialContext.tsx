import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Post,
  Story,
  UserProfile,
  MarketplaceListing,
  Group,
  Page,
  EventItem,
  NotificationItem,
  MemoryItem,
  ReactionType,
  PostPrivacy,
  ReportItem
} from '../types/social';
import {
  DEMO_USERS,
  DEMO_POSTS,
  DEMO_STORIES,
  DEMO_MARKETPLACE,
  DEMO_GROUPS,
  DEMO_PAGES,
  DEMO_EVENTS,
  DEMO_NOTIFICATIONS
} from '../services/mockSocialData';
import { realtimeEngine } from '../services/realtimeService';
import { useAuth } from './AuthContext';

export type ActiveTab =
  | 'feed'
  | 'friends'
  | 'watch'
  | 'marketplace'
  | 'groups'
  | 'pages'
  | 'events'
  | 'memories'
  | 'saved'
  | 'profile'
  | 'messages'
  | 'admin';

interface SocialContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  viewingProfileUser: UserProfile | null;
  setViewingProfileUser: (user: UserProfile | null) => void;
  posts: Post[];
  createPost: (data: {
    content: string;
    mediaUrls?: string[];
    privacy: PostPrivacy;
    feeling?: string;
    location?: string;
    bgStyle?: string;
    pollQuestion?: string;
    pollOptions?: string[];
  }) => Promise<void>;
  toggleReaction: (postId: string, reactionType: ReactionType) => Promise<void>;
  addComment: (postId: string, content: string, parentId?: string, imageUrl?: string) => Promise<void>;
  toggleSavePost: (postId: string) => void;
  deletePost: (postId: string) => void;
  stories: Story[];
  createStory: (data: { mediaUrl?: string; textContent?: string; bgColor?: string }) => Promise<void>;
  friends: UserProfile[];
  friendRequests: NotificationItem[];
  sendFriendRequest: (targetUserId: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  followingIds: string[];
  toggleFollow: (targetUserId: string) => void;
  marketplaceListings: MarketplaceListing[];
  createListing: (data: Partial<MarketplaceListing>) => void;
  groups: Group[];
  toggleJoinGroup: (groupId: string) => void;
  createGroup: (name: string, description: string, privacy: 'public' | 'private') => void;
  pages: Page[];
  toggleFollowPage: (pageId: string) => void;
  events: EventItem[];
  toggleRsvpEvent: (eventId: string, status: 'going' | 'interested' | 'not_going') => void;
  notifications: NotificationItem[];
  unreadNotifCount: number;
  markNotificationsAsRead: () => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  reports: ReportItem[];
  submitReport: (itemType: 'post' | 'comment' | 'user' | 'marketplace' | 'group', itemId: string, reason: string) => void;
  resolveReport: (reportId: string, action: 'dismiss' | 'delete') => void;
  blockedUsers: string[];
  toggleBlockUser: (targetUserId: string) => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [viewingProfileUser, setViewingProfileUser] = useState<UserProfile | null>(null);

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('kc_posts');
    return saved ? JSON.parse(saved) : DEMO_POSTS;
  });

  const [stories, setStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem('kc_stories');
    return saved ? JSON.parse(saved) : DEMO_STORIES;
  });

  const [friends, setFriends] = useState<UserProfile[]>(() => [DEMO_USERS[1], DEMO_USERS[2]]);
  const [followingIds, setFollowingIds] = useState<string[]>(['user_sarah', 'user_john']);
  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>(DEMO_MARKETPLACE);
  const [groups, setGroups] = useState<Group[]>(DEMO_GROUPS);
  const [pages, setPages] = useState<Page[]>(DEMO_PAGES);
  const [events, setEvents] = useState<EventItem[]>(DEMO_EVENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEMO_NOTIFICATIONS);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('kc_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('kc_stories', JSON.stringify(stories));
  }, [stories]);

  // Real-time Event Listeners
  useEffect(() => {
    const unsubPost = realtimeEngine.subscribe('new_post', (newPost: Post) => {
      setPosts((prev) => [newPost, ...prev.filter((p) => p.id !== newPost.id)]);
    });

    const unsubReaction = realtimeEngine.subscribe('post_reaction', ({ postId, userId, reactionType }) => {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const existing = p.reactions.filter((r) => r.user_id !== userId);
          return {
            ...p,
            reactions: [...existing, { id: `r_${Date.now()}`, user_id: userId, reaction_type: reactionType }],
          };
        })
      );
    });

    const unsubComment = realtimeEngine.subscribe('post_comment', ({ postId, comment }) => {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            comments: [...p.comments, comment],
            comments_count: p.comments_count + 1,
          };
        })
      );
    });

    return () => {
      unsubPost();
      unsubReaction();
      unsubComment();
    };
  }, []);

  const createPost = async (data: {
    content: string;
    mediaUrls?: string[];
    privacy: PostPrivacy;
    feeling?: string;
    location?: string;
    bgStyle?: string;
    pollQuestion?: string;
    pollOptions?: string[];
  }) => {
    if (!user) return;

    const newPost: Post = {
      id: `post_${Date.now()}`,
      author_id: user.id,
      author: user,
      content: data.content,
      privacy: data.privacy,
      feeling: data.feeling,
      location: data.location,
      bg_style: data.bgStyle,
      media: data.mediaUrls?.map((url, i) => ({ id: `m_${Date.now()}_${i}`, media_type: 'image', url })),
      poll: data.pollQuestion
        ? {
            question: data.pollQuestion,
            options: (data.pollOptions || []).map((txt, idx) => ({ id: `opt_${idx}`, text: txt, votes: [] })),
          }
        : undefined,
      reactions: [],
      comments: [],
      comments_count: 0,
      shares_count: 0,
      created_at: new Date().toISOString(),
    };

    setPosts((prev) => [newPost, ...prev]);
    realtimeEngine.broadcast('new_post', newPost);
  };

  const toggleReaction = async (postId: string, reactionType: ReactionType) => {
    if (!user) return;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const existingSame = p.reactions.find((r) => r.user_id === user.id && r.reaction_type === reactionType);
        let updatedReactions;
        if (existingSame) {
          updatedReactions = p.reactions.filter((r) => r.user_id !== user.id);
        } else {
          const filteredOther = p.reactions.filter((r) => r.user_id !== user.id);
          updatedReactions = [...filteredOther, { id: `r_${Date.now()}`, user_id: user.id, reaction_type: reactionType, user }];
        }
        return { ...p, reactions: updatedReactions };
      })
    );
    realtimeEngine.broadcast('post_reaction', { postId, userId: user.id, reactionType });
  };

  const addComment = async (postId: string, content: string, parentId?: string, imageUrl?: string) => {
    if (!user) return;
    const newComment = {
      id: `c_${Date.now()}`,
      post_id: postId,
      author_id: user.id,
      author: user,
      parent_id: parentId,
      content,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: [...p.comments, newComment],
          comments_count: p.comments_count + 1,
        };
      })
    );
    realtimeEngine.broadcast('post_comment', { postId, comment: newComment });
  };

  const toggleSavePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, is_saved: !p.is_saved } : p))
    );
  };

  const deletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const createStory = async (data: { mediaUrl?: string; textContent?: string; bgColor?: string }) => {
    if (!user) return;
    const newStory: Story = {
      id: `story_${Date.now()}`,
      author_id: user.id,
      author: user,
      media_url: data.mediaUrl,
      text_content: data.textContent,
      bg_color: data.bgColor || 'linear-gradient(135deg, #2563EB, #8B5CF6)',
      expires_at: new Date(Date.now() + 24 * 3600000).toISOString(),
      created_at: new Date().toISOString(),
      views_count: 1,
    };
    setStories((prev) => [newStory, ...prev]);
  };

  const sendFriendRequest = (targetUserId: string) => {
    const target = DEMO_USERS.find((u) => u.id === targetUserId);
    if (!target || !user) return;
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      recipient_id: targetUserId,
      actor_id: user.id,
      actor: user,
      type: 'friend_request',
      title: `${user.full_name} sent you a friend request`,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const acceptFriendRequest = (requestId: string) => {
    const notif = notifications.find((n) => n.id === requestId);
    if (notif && notif.actor) {
      setFriends((prev) => [...prev, notif.actor!]);
    }
    setNotifications((prev) => prev.filter((n) => n.id !== requestId));
  };

  const rejectFriendRequest = (requestId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== requestId));
  };

  const toggleFollow = (targetUserId: string) => {
    setFollowingIds((prev) =>
      prev.includes(targetUserId) ? prev.filter((id) => id !== targetUserId) : [...prev, targetUserId]
    );
  };

  const createListing = (data: Partial<MarketplaceListing>) => {
    if (!user) return;
    const newListing: MarketplaceListing = {
      id: `mp_${Date.now()}`,
      seller_id: user.id,
      seller: user,
      title: data.title || 'New Item',
      price: data.price || 0,
      category: data.category || 'General',
      condition: data.condition || 'New',
      description: data.description || '',
      location: data.location || user.location || 'San Francisco, CA',
      image_url: data.image_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
    };
    setMarketplaceListings((prev) => [newListing, ...prev]);
  };

  const toggleJoinGroup = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, is_joined: !g.is_joined } : g))
    );
  };

  const createGroup = (name: string, description: string, privacy: 'public' | 'private') => {
    if (!user) return;
    const newGroup: Group = {
      id: `group_${Date.now()}`,
      name,
      description,
      privacy,
      created_by: user.id,
      members_count: 1,
      is_joined: true,
      cover_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80',
    };
    setGroups((prev) => [newGroup, ...prev]);
  };

  const toggleFollowPage = (pageId: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === pageId ? { ...p, is_following: !p.is_following } : p))
    );
  };

  const toggleRsvpEvent = (eventId: string, status: 'going' | 'interested' | 'not_going') => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, rsvp_status: status } : e))
    );
  };

  const unreadNotifCount = notifications.filter((n) => !n.is_read).length;

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const submitReport = (itemType: 'post' | 'comment' | 'user' | 'marketplace' | 'group', itemId: string, reason: string) => {
    if (!user) return;
    const newReport: ReportItem = {
      id: `rep_${Date.now()}`,
      item_type: itemType,
      item_id: itemId,
      reporter_id: user.id,
      reason,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    setReports((prev) => [newReport, ...prev]);
  };

  const resolveReport = (reportId: string, action: 'dismiss' | 'delete') => {
    const targetReport = reports.find((r) => r.id === reportId);
    if (targetReport && action === 'delete') {
      if (targetReport.item_type === 'post') deletePost(targetReport.item_id);
    }
    setReports((prev) => prev.filter((r) => r.id !== reportId));
  };

  const toggleBlockUser = (targetUserId: string) => {
    setBlockedUsers((prev) =>
      prev.includes(targetUserId) ? prev.filter((id) => id !== targetUserId) : [...prev, targetUserId]
    );
  };

  return (
    <SocialContext.Provider
      value={{
        activeTab,
        setActiveTab,
        viewingProfileUser,
        setViewingProfileUser,
        posts,
        createPost,
        toggleReaction,
        addComment,
        toggleSavePost,
        deletePost,
        stories,
        createStory,
        friends,
        friendRequests: notifications.filter((n) => n.type === 'friend_request'),
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        followingIds,
        toggleFollow,
        marketplaceListings,
        createListing,
        groups,
        toggleJoinGroup,
        createGroup,
        pages,
        toggleFollowPage,
        events,
        toggleRsvpEvent,
        notifications,
        unreadNotifCount,
        markNotificationsAsRead,
        globalSearchQuery,
        setGlobalSearchQuery,
        reports,
        submitReport,
        resolveReport,
        blockedUsers,
        toggleBlockUser,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) throw new Error('useSocial must be used within a SocialProvider');
  return context;
};
