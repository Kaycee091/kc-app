import { UserProfile, Post, Story, MarketplaceListing, Group, Page, EventItem, NotificationItem, MemoryItem, Conversation, Message } from '../types/social';

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user_alex',
    username: 'alex_j',
    first_name: 'Alex',
    last_name: 'Johnson',
    full_name: 'Alex Johnson',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    cover_url: 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=1200&auto=format&fit=crop&q=80',
    bio: 'Software Engineer & Tech Enthusiast | Building the future on KC Network 🚀',
    email: 'alex@kc.app',
    phone: '+1 (555) 123-4567',
    dob: '1996-05-14',
    gender: 'Male',
    location: 'San Francisco, CA',
    work: 'Lead Engineer @ KC Tech',
    education: 'B.S. Computer Science, Stanford University',
    relationship_status: 'In a relationship',
    website: 'https://kc.app/alex',
    is_verified: true,
    is_online: true,
    created_at: new Date(Date.now() - 365 * 86400000).toISOString(),
    followers_count: 1420,
    following_count: 320,
    friends_count: 480,
    role: 'super_admin',
    status: 'active',
  },
  {
    id: 'user_sarah',
    username: 'sarah_adams',
    first_name: 'Sarah',
    last_name: 'Adams',
    full_name: 'Sarah Adams',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    cover_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    bio: 'Product Designer & Travel Photographer 📸☕',
    email: 'sarah@example.com',
    location: 'New York, NY',
    work: 'Senior UX Designer @ Creative Labs',
    is_verified: true,
    is_online: true,
    friends_count: 650,
    role: 'moderator',
    status: 'active',
  },
  {
    id: 'user_john',
    username: 'john_smith',
    first_name: 'John',
    last_name: 'Smith',
    full_name: 'John Smith',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Founder @ DevPulse | Coffee & Code ☕💻',
    email: 'john@example.com',
    location: 'Austin, TX',
    is_online: false,
    last_seen: new Date(Date.now() - 25 * 60000).toISOString(),
    friends_count: 310,
    role: 'support',
    status: 'active',
  },
  {
    id: 'user_david',
    username: 'david_m',
    first_name: 'David',
    last_name: 'Miller',
    full_name: 'David Miller',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Backend Specialist & Open Source Contributor',
    email: 'david@example.com',
    location: 'Seattle, WA',
    is_online: true,
    friends_count: 520,
  },
  {
    id: 'user_elena',
    username: 'elena_v',
    first_name: 'Elena',
    last_name: 'Rostova',
    full_name: 'Elena Rostova',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bio: 'Digital Creator & Public Speaker 🎤✨',
    email: 'elena@example.com',
    is_verified: true,
    is_online: false,
    friends_count: 890,
  }
];

export const DEMO_STORIES: Story[] = [
  {
    id: 'story_sarah',
    author_id: 'user_sarah',
    author: DEMO_USERS[1],
    media_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    text_content: 'Sunset beach vibes! 🌊🌅',
    expires_at: new Date(Date.now() + 18 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    views_count: 142,
  },
  {
    id: 'story_john',
    author_id: 'user_john',
    author: DEMO_USERS[2],
    media_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
    text_content: 'Coding marathon night 💻⚡',
    expires_at: new Date(Date.now() + 12 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    views_count: 89,
  },
  {
    id: 'story_elena',
    author_id: 'user_elena',
    author: DEMO_USERS[4],
    bg_color: 'linear-gradient(135deg, #2563EB, #8B5CF6)',
    text_content: 'Excited for tomorrow’s KC Tech Keynote Speech! 🚀🎉',
    expires_at: new Date(Date.now() + 20 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    views_count: 215,
  }
];

export const DEMO_POSTS: Post[] = [
  {
    id: 'post_1',
    author_id: 'user_sarah',
    author: DEMO_USERS[1],
    content: 'Just launched our new product design system on KC Network! What do you think of this color palette & typography hierarchy? 🎨✨',
    privacy: 'public',
    feeling: 'feeling proud 💖',
    location: 'New York, NY',
    media: [
      { id: 'm1', media_type: 'image', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80' },
      { id: 'm2', media_type: 'image', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80' }
    ],
    reactions: [
      { id: 'r1', user_id: 'user_alex', reaction_type: 'love', user: DEMO_USERS[0] },
      { id: 'r2', user_id: 'user_john', reaction_type: 'like', user: DEMO_USERS[2] },
      { id: 'r3', user_id: 'user_david', reaction_type: 'care', user: DEMO_USERS[3] }
    ],
    comments: [
      {
        id: 'c1',
        post_id: 'post_1',
        author_id: 'user_alex',
        author: DEMO_USERS[0],
        content: 'This looks incredibly sleek and modern! Loving the blue & purple contrast! 🙌',
        created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
        replies: [
          {
            id: 'c1_sub',
            post_id: 'post_1',
            author_id: 'user_sarah',
            author: DEMO_USERS[1],
            parent_id: 'c1',
            content: 'Thank you Alex! Took us 3 weeks of iteration! 🚀',
            created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
          }
        ]
      }
    ],
    comments_count: 14,
    shares_count: 6,
    is_saved: true,
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'post_2',
    author_id: 'user_david',
    author: DEMO_USERS[3],
    content: 'Quick community poll: What is your primary frontend framework of choice for modern real-time web applications?',
    privacy: 'public',
    poll: {
      question: 'Primary Frontend Framework?',
      options: [
        { id: 'opt1', text: 'React + Vite', votes: ['user_alex', 'user_sarah', 'user_john'] },
        { id: 'opt2', text: 'Next.js App Router', votes: ['user_david'] },
        { id: 'opt3', text: 'Vue / Nuxt', votes: [] },
        { id: 'opt4', text: 'SvelteKit', votes: [] },
      ]
    },
    reactions: [
      { id: 'r4', user_id: 'user_alex', reaction_type: 'like', user: DEMO_USERS[0] },
      { id: 'r5', user_id: 'user_elena', reaction_type: 'haha', user: DEMO_USERS[4] }
    ],
    comments: [],
    comments_count: 8,
    shares_count: 2,
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'post_3',
    author_id: 'user_john',
    author: DEMO_USERS[2],
    content: 'Weekend retreat in the mountains! Fresh air and zero phone notifications for 48 hours 🌲⛰️',
    privacy: 'friends',
    location: 'Rocky Mountain National Park',
    media: [
      { id: 'm3', media_type: 'image', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&auto=format&fit=crop&q=80' }
    ],
    reactions: [
      { id: 'r6', user_id: 'user_sarah', reaction_type: 'wow', user: DEMO_USERS[1] },
      { id: 'r7', user_id: 'user_alex', reaction_type: 'love', user: DEMO_USERS[0] }
    ],
    comments: [],
    comments_count: 5,
    shares_count: 1,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  }
];

export const DEMO_MARKETPLACE: MarketplaceListing[] = [
  {
    id: 'mp_1',
    seller_id: 'user_john',
    seller: DEMO_USERS[2],
    title: 'MacBook Pro M2 Max 16-inch (32GB RAM, 1TB SSD)',
    price: 1850,
    category: 'Electronics',
    condition: 'Like New',
    description: 'Pristine condition MacBook Pro. Includes original charger and box. Battery health 98%.',
    location: 'San Francisco, CA',
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'mp_2',
    seller_id: 'user_sarah',
    seller: DEMO_USERS[1],
    title: 'Sony Alpha A7 IV Mirrorless Camera + 24-70mm GM Lens',
    price: 2100,
    category: 'Cameras',
    condition: 'Excellent',
    description: 'Professional camera kit used for studio photography. Includes extra batteries and peak design strap.',
    location: 'New York, NY',
    image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'mp_3',
    seller_id: 'user_david',
    seller: DEMO_USERS[3],
    title: 'Herman Miller Embody Ergonomic Office Chair',
    price: 950,
    category: 'Home & Office',
    condition: 'Good',
    description: 'Fully adjustable ergonomic chair in cyan blue rhythm fabric. Extremely comfortable for long coding sessions.',
    location: 'Seattle, WA',
    image_url: 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=800&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  }
];

export const DEMO_GROUPS: Group[] = [
  {
    id: 'group_devs',
    name: 'KC Developers Hub',
    description: 'Official community for web developers, software engineers, and designers building on KC Network.',
    cover_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80',
    privacy: 'public',
    created_by: 'user_alex',
    members_count: 1240,
    is_joined: true,
  },
  {
    id: 'group_creators',
    name: 'Digital Creators & Photographers',
    description: 'Share your photography, UI designs, and creative artwork with creators worldwide.',
    cover_url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1000&auto=format&fit=crop&q=80',
    privacy: 'public',
    created_by: 'user_sarah',
    members_count: 890,
    is_joined: false,
  }
];

export const DEMO_PAGES: Page[] = [
  {
    id: 'page_tech',
    name: 'KC Tech News',
    username: 'kctechnews',
    description: 'Latest breakthroughs in AI, software engineering, and digital innovation.',
    avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    cover_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
    followers_count: 14500,
    is_following: true,
  }
];

export const DEMO_EVENTS: EventItem[] = [
  {
    id: 'event_1',
    organizer_id: 'user_alex',
    organizer: DEMO_USERS[0],
    title: 'KC Tech Summit 2026: Real-Time Web Engineering',
    description: 'Join developers and architects for keynote talks on Supabase Realtime, Web API Broadcasting, and modern social platforms.',
    location: 'Moscone Center, San Francisco / Online Stream',
    start_time: new Date(Date.now() + 14 * 86400000).toISOString(),
    cover_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80',
    rsvp_status: 'going',
    attendees_count: 412,
  }
];

export const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    recipient_id: 'user_alex',
    actor_id: 'user_sarah',
    actor: DEMO_USERS[1],
    type: 'like',
    title: 'Sarah Adams loved your post',
    is_read: false,
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'notif_2',
    recipient_id: 'user_alex',
    actor_id: 'user_john',
    actor: DEMO_USERS[2],
    type: 'comment',
    title: 'John Smith commented on your photo',
    is_read: false,
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'notif_3',
    recipient_id: 'user_alex',
    actor_id: 'user_david',
    actor: DEMO_USERS[3],
    type: 'friend_request',
    title: 'David Miller sent you a friend request',
    is_read: true,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  }
];

export const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_sarah',
    type: 'direct',
    members: [DEMO_USERS[0], DEMO_USERS[1]],
    updated_at: new Date(Date.now() - 10 * 60000).toISOString(),
    unread_count: 1,
    last_message: {
      id: 'msg_m1',
      conversation_id: 'conv_sarah',
      sender_id: 'user_sarah',
      sender: DEMO_USERS[1],
      content: 'Hey Alex! Did you see the new KC app layout update?',
      message_type: 'text',
      created_at: new Date(Date.now() - 10 * 60000).toISOString(),
      status: 'delivered',
    }
  }
];

export const DEMO_MESSAGES: Record<string, Message[]> = {
  'conv_sarah': [
    {
      id: 'msg_m0',
      conversation_id: 'conv_sarah',
      sender_id: 'user_alex',
      sender: DEMO_USERS[0],
      content: 'Hi Sarah! Hope your week is going great.',
      message_type: 'text',
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      status: 'read',
    },
    {
      id: 'msg_m1',
      conversation_id: 'conv_sarah',
      sender_id: 'user_sarah',
      sender: DEMO_USERS[1],
      content: 'Hey Alex! Did you see the new KC app layout update?',
      message_type: 'text',
      created_at: new Date(Date.now() - 10 * 60000).toISOString(),
      status: 'delivered',
    }
  ]
};
