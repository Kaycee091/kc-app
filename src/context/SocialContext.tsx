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
import { socialService } from '../services/socialService';
import { realtimeEngine } from '../services/realtimeService';
import { postsService } from '../services/postsService';
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
  | 'notifications'
  | 'search'
  | 'settings'
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
  votePoll: (postId: string, optionId: string) => void;
  editPost: (postId: string, content: string) => void;
  sharePost: (postId: string, comment?: string) => void;
  togglePinPost: (postId: string) => void;
  toggleCommentsDisabled: (postId: string) => void;
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
  createEvent: (data: Partial<EventItem>) => void;
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

export const normalizeEvent = (item: any): EventItem => {
  const title = item.title || item.name || 'Connecta Gathering';
  let startTime = item.start_time || item.event_date;
  if (!startTime || isNaN(new Date(startTime).getTime())) {
    startTime = new Date(Date.now() + 86400000 * 3).toISOString();
  }
  return {
    id: String(item.id || `evt_${Math.random().toString(36).slice(2, 9)}`),
    organizer_id: item.organizer_id || item.creator_id || 'system',
    organizer: item.organizer,
    title,
    name: title,
    description: item.description || 'Join us for an exciting gathering! Connect with attendees and experience great activities.',
    location: item.location || 'San Francisco, CA',
    start_time: startTime,
    event_date: startTime,
    end_time: item.end_time,
    cover_url: item.cover_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    rsvp_status: item.rsvp_status || null,
    attendees_count: typeof item.attendees_count === 'number' ? item.attendees_count : (typeof item.going_count === 'number' ? item.going_count : 18),
    interested_count: typeof item.interested_count === 'number' ? item.interested_count : 35,
    going_count: typeof item.going_count === 'number' ? item.going_count : (typeof item.attendees_count === 'number' ? item.attendees_count : 18),
    category: item.category || 'Tech & Culture',
    is_online: Boolean(item.is_online),
  };
};

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [viewingProfileUser, setViewingProfileUser] = useState<UserProfile | null>(null);

  const [posts, setPosts] = useState<Post[]>(() => postsService.getPosts(true));
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>(() => postsService.getHiddenPostIds());

  const [stories, setStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem('connecta_stories_db');
    return saved ? JSON.parse(saved) : DEMO_STORIES;
  });

  const [friends, setFriends] = useState<UserProfile[]>(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`connecta_friends_${user.id}`);
    if (saved) return JSON.parse(saved);
    if (user.is_new_user || user.friends_count === 0) return [];
    return [DEMO_USERS[1], DEMO_USERS[2]];
  });

  const [followingIds, setFollowingIds] = useState<string[]>(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`connecta_following_${user.id}`);
    if (saved) return JSON.parse(saved);
    if (user.is_new_user) return [];
    return ['user_sarah'];
  });
  
  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>(() => {
    const saved = localStorage.getItem('connecta_marketplace_db');
    return saved ? JSON.parse(saved) : DEMO_MARKETPLACE;
  });

  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('connecta_groups_db');
    const baseGroups: Group[] = saved ? JSON.parse(saved) : DEMO_GROUPS;
    if (user?.is_new_user) {
      const userJoined = localStorage.getItem(`connecta_joined_groups_${user.id}`);
      const joinedIds: string[] = userJoined ? JSON.parse(userJoined) : [];
      return baseGroups.map((g) => ({
        ...g,
        is_joined: joinedIds.includes(g.id),
      }));
    }
    return baseGroups;
  });

  const [pages, setPages] = useState<Page[]>(() => {
    const saved = localStorage.getItem('connecta_pages_db');
    return saved ? JSON.parse(saved) : DEMO_PAGES;
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('connecta_events_db');
    const rawList: any[] = saved ? JSON.parse(saved) : DEMO_EVENTS;
    return rawList.map(normalizeEvent);
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`connecta_notifications_${user.id}`);
    if (saved) return JSON.parse(saved);
    if (user.is_new_user) {
      return [
        {
          id: `welcome_notif_${user.id}`,
          recipient_id: user.id,
          actor: {
            id: 'system_connecta',
            name: 'Connecta System',
            avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
          },
          type: 'system',
          content: `Welcome to Connecta, ${user.first_name || 'friend'}! Start by connecting with friends and discovering communities.`,
          created_at: new Date().toISOString(),
          is_read: false,
        },
      ];
    }
    const globalSaved = localStorage.getItem('connecta_notifications_db');
    return globalSaved ? JSON.parse(globalSaved) : DEMO_NOTIFICATIONS;
  });

  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  
  const [reports, setReports] = useState<ReportItem[]>(() => {
    const saved = localStorage.getItem('connecta_reports_db');
    return saved ? JSON.parse(saved) : [];
  });

  const [blockedUsers, setBlockedUsers] = useState<string[]>(() => {
    const saved = localStorage.getItem('connecta_blocked_users_db');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('kc_posts', JSON.stringify(posts));
    localStorage.setItem('connecta_posts_db', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('kc_stories', JSON.stringify(stories));
    localStorage.setItem('connecta_stories_db', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem('connecta_marketplace_db', JSON.stringify(marketplaceListings));
  }, [marketplaceListings]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`connecta_friends_${user.id}`, JSON.stringify(friends));
    }
  }, [friends, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`connecta_following_${user.id}`, JSON.stringify(followingIds));
    }
  }, [followingIds, user]);

  useEffect(() => {
    localStorage.setItem('connecta_groups_db', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('connecta_pages_db', JSON.stringify(pages));
  }, [pages]);

  useEffect(() => {
    localStorage.setItem('connecta_events_db', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    fetch('/api/v1/events/')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const rawList = Array.isArray(data) ? data : (data.results || []);
        if (rawList.length > 0) {
          const apiEvents = rawList.map(normalizeEvent);
          setEvents((prev) => {
            const map = new Map(prev.map((e) => [e.id, e]));
            const mergedApi = apiEvents.map((ae: EventItem) => {
              const local = map.get(ae.id);
              return local ? { ...ae, rsvp_status: local.rsvp_status, attendees_count: local.attendees_count } : ae;
            });
            const apiIds = new Set(apiEvents.map((e: EventItem) => e.id));
            const clientOnly = prev.filter((e) => !apiIds.has(e.id));
            return [...clientOnly, ...mergedApi];
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem('connecta_notifications_db', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('connecta_reports_db', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('connecta_blocked_users_db', JSON.stringify(blockedUsers));
  }, [blockedUsers]);

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

    const unsubVisibility = realtimeEngine.subscribe('post_visibility_changed', () => {
      setHiddenPostIds(postsService.getHiddenPostIds());
    });

    const unsubAdminHide = realtimeEngine.subscribe('admin_post_hidden', () => {
      setHiddenPostIds(postsService.getHiddenPostIds());
      setPosts(postsService.getPosts(true));
    });

    const unsubAdminRestore = realtimeEngine.subscribe('admin_post_restored', () => {
      setHiddenPostIds(postsService.getHiddenPostIds());
      setPosts(postsService.getPosts(true));
    });

    const unsubAdminDeletePost = realtimeEngine.subscribe('admin_post_deleted', () => {
      setHiddenPostIds(postsService.getHiddenPostIds());
      setPosts(postsService.getPosts(true));
    });

    const unsubAdminComment = realtimeEngine.subscribe('admin_comment_deleted', () => {
      setPosts(postsService.getPosts(true));
    });

    const unsubSysNotif = realtimeEngine.subscribe('admin_system_notification', (sysNotif: any) => {
      const notifItem: NotificationItem = {
        id: sysNotif.id || `notif_${Date.now()}`,
        recipient_id: 'all',
        actor_id: 'user_alex',
        actor: {
          id: 'user_alex',
          username: 'Humble',
          first_name: 'Humble',
          last_name: 'Asogwa',
          full_name: 'Humble Asogwa (System Admin)',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          is_online: true,
        },
        type: 'system',
        title: sysNotif.title,
        message: sysNotif.message,
        created_at: sysNotif.created_at || new Date().toISOString(),
        is_read: false,
      };
      setNotifications((prev) => [notifItem, ...prev]);
    });

    const unsubReport = realtimeEngine.subscribe('new_report_submitted', (newReport: ReportItem) => {
      setReports((prev) => [newReport, ...prev.filter((r) => r.id !== newReport.id)]);
    });

    return () => {
      unsubPost();
      unsubReaction();
      unsubComment();
      unsubVisibility();
      unsubAdminHide();
      unsubAdminRestore();
      unsubAdminDeletePost();
      unsubAdminComment();
      unsubSysNotif();
      unsubReport();
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
    postsService.deletePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const votePoll = (postId: string, optionId: string) => {
    const updated = postsService.votePoll(postId, optionId);
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
  };

  const editPost = (postId: string, content: string) => {
    const updated = postsService.editPost(postId, content);
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
  };

  const sharePost = (postId: string, comment?: string) => {
    const shared = postsService.sharePost(postId, comment);
    setPosts((prev) => [shared, ...prev.map((p) => (p.id === postId ? { ...p, shares_count: p.shares_count + 1 } : p))]);
  };

  const togglePinPost = (postId: string) => {
    const updated = postsService.togglePinPost(postId);
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
  };

  const toggleCommentsDisabled = (postId: string) => {
    const updated = postsService.toggleCommentsDisabled(postId);
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
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
    setGroups((prev) => {
      const updated = prev.map((g) => {
        if (g.id === groupId) {
          const nextJoined = !g.is_joined;
          return {
            ...g,
            is_joined: nextJoined,
            members_count: nextJoined ? g.members_count + 1 : Math.max(0, g.members_count - 1),
          };
        }
        return g;
      });
      if (user) {
        const joinedIds = updated.filter((g) => g.is_joined).map((g) => g.id);
        localStorage.setItem(`connecta_joined_groups_${user.id}`, JSON.stringify(joinedIds));
      }
      return updated;
    });
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
      prev.map((e) => {
        if (e.id !== eventId) return e;
        const prevStatus = e.rsvp_status;
        const newStatus = prevStatus === status ? null : status;
        let attendees = e.attendees_count || 0;
        let interested = e.interested_count || 0;

        if (prevStatus === 'going') attendees = Math.max(0, attendees - 1);
        if (prevStatus === 'interested') interested = Math.max(0, interested - 1);

        if (newStatus === 'going') attendees += 1;
        if (newStatus === 'interested') interested += 1;

        return {
          ...e,
          rsvp_status: newStatus,
          attendees_count: attendees,
          interested_count: interested,
        };
      })
    );

    // Call backend RSVP endpoint asynchronously
    fetch(`/api/v1/events/${eventId}/rsvp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  };

  const createEvent = (data: Partial<EventItem>) => {
    if (!user) return;
    const newEvent = normalizeEvent({
      ...data,
      id: `evt_${Date.now()}`,
      organizer_id: user.id,
      organizer: user,
      rsvp_status: 'going',
      attendees_count: 1,
    });
    setEvents((prev) => [newEvent, ...prev]);

    // Also attempt to push to backend if available
    fetch('/api/v1/events/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newEvent.title,
        description: newEvent.description,
        location: newEvent.location,
        event_date: newEvent.start_time,
        category: newEvent.category,
        cover_url: newEvent.cover_url,
      }),
    }).catch(() => {});
  };

  const unreadNotifCount = notifications.filter((n) => !n.is_read).length;

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const submitReport = (itemType: 'post' | 'comment' | 'user' | 'marketplace' | 'group', itemId: string, reason: string) => {
    if (!user) return;
    const newReport = socialService.submitReport(itemType as any, itemId, reason);
    setReports((prev) => [newReport, ...prev.filter((r) => r.id !== newReport.id)]);
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
        votePoll,
        editPost,
        sharePost,
        togglePinPost,
        toggleCommentsDisabled,
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
        createEvent,
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
