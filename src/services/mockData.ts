import { UserProfile, Conversation, Message } from '../types';

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user_john',
    username: 'johnsmith',
    full_name: 'John Smith',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Senior Frontend Engineer | Passionate about UI/UX & real-time apps',
    phone: '+1 (555) 234-5678',
    email: 'john@example.com',
    is_online: true,
    last_seen: new Date().toISOString(),
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'user_sarah',
    username: 'sarah_adams',
    full_name: 'Sarah Adams',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Product Designer @ Connecta | Coffee lover & hiker ☕⛰️',
    phone: '+1 (555) 987-6543',
    email: 'sarah@example.com',
    is_online: true,
    last_seen: new Date().toISOString(),
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'user_david',
    username: 'david_m',
    full_name: 'David Miller',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Backend Specialist | Distributed Systems & Postgres',
    phone: '+1 (555) 456-7890',
    email: 'david@example.com',
    is_online: false,
    last_seen: new Date(Date.now() - 15 * 60000).toISOString(),
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: 'user_elena',
    username: 'elena_v',
    full_name: 'Elena Rostova',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bio: 'Mobile App Lead & Tech Speaker 🚀',
    phone: '+1 (555) 321-0987',
    email: 'elena@example.com',
    is_online: false,
    last_seen: new Date(Date.now() - 120 * 60000).toISOString(),
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
  }
];

export const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_john',
    type: 'direct',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    members: [
      { id: 'cm_1', conversation_id: 'conv_john', user_id: 'current_user', role: 'admin', joined_at: new Date().toISOString() },
      { id: 'cm_2', conversation_id: 'conv_john', user_id: 'user_john', role: 'member', joined_at: new Date().toISOString(), user: DEMO_USERS[0] },
    ],
    unread_count: 1,
  },
  {
    id: 'conv_sarah',
    type: 'direct',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 60000).toISOString(),
    members: [
      { id: 'cm_3', conversation_id: 'conv_sarah', user_id: 'current_user', role: 'admin', joined_at: new Date().toISOString() },
      { id: 'cm_4', conversation_id: 'conv_sarah', user_id: 'user_sarah', role: 'member', joined_at: new Date().toISOString(), user: DEMO_USERS[1] },
    ],
    unread_count: 0,
  },
  {
    id: 'conv_group_project',
    type: 'group',
    name: 'Project Connecta Team',
    avatar_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    created_by: 'current_user',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60000).toISOString(),
    members: [
      { id: 'cm_5', conversation_id: 'conv_group_project', user_id: 'current_user', role: 'admin', joined_at: new Date().toISOString() },
      { id: 'cm_6', conversation_id: 'conv_group_project', user_id: 'user_john', role: 'member', joined_at: new Date().toISOString(), user: DEMO_USERS[0] },
      { id: 'cm_7', conversation_id: 'conv_group_project', user_id: 'user_sarah', role: 'member', joined_at: new Date().toISOString(), user: DEMO_USERS[1] },
      { id: 'cm_8', conversation_id: 'conv_group_project', user_id: 'user_david', role: 'member', joined_at: new Date().toISOString(), user: DEMO_USERS[2] },
    ],
    unread_count: 2,
  }
];

export const DEMO_MESSAGES: Record<string, Message[]> = {
  'conv_john': [
    {
      id: 'msg_j1',
      conversation_id: 'conv_john',
      sender_id: 'user_john',
      content: "Hey there! How is the real-time chat application coming along?",
      message_type: 'text',
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      status: 'read',
      sender: DEMO_USERS[0],
      reads: [{ id: 'r1', message_id: 'msg_j1', user_id: 'current_user', read_at: new Date().toISOString() }]
    },
    {
      id: 'msg_j2',
      conversation_id: 'conv_john',
      sender_id: 'current_user',
      content: "Hi John! It's super fast and responsive. Built with dual-engine real-time broadcasting and polished UI!",
      message_type: 'text',
      created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
      status: 'read',
      reactions: [
        { id: 'rx1', message_id: 'msg_j2', user_id: 'user_john', reaction: '🔥', created_at: new Date().toISOString() },
        { id: 'rx2', message_id: 'msg_j2', user_id: 'user_sarah', reaction: '👍', created_at: new Date().toISOString() }
      ]
    },
    {
      id: 'msg_j3',
      conversation_id: 'conv_john',
      sender_id: 'user_john',
      content: "Are we still meeting today at 3:00 PM for the sprint review?",
      message_type: 'text',
      created_at: new Date(Date.now() - 10 * 60000).toISOString(),
      status: 'delivered',
      sender: DEMO_USERS[0]
    }
  ],
  'conv_sarah': [
    {
      id: 'msg_s1',
      conversation_id: 'conv_sarah',
      sender_id: 'user_sarah',
      content: "Check out the new dark mode theme preview!",
      message_type: 'text',
      created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      status: 'read',
      sender: DEMO_USERS[1]
    },
    {
      id: 'msg_s2',
      conversation_id: 'conv_sarah',
      sender_id: 'user_sarah',
      content: "Here is the UI design preview image for the details panel",
      message_type: 'image',
      file_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      file_name: 'connecta-preview.png',
      created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
      status: 'read',
      sender: DEMO_USERS[1]
    },
    {
      id: 'msg_s3',
      conversation_id: 'conv_sarah',
      sender_id: 'current_user',
      content: "See you tomorrow 👍",
      message_type: 'text',
      created_at: new Date(Date.now() - 45 * 60000).toISOString(),
      status: 'read',
    }
  ],
  'conv_group_project': [
    {
      id: 'msg_p1',
      conversation_id: 'conv_group_project',
      sender_id: 'user_david',
      content: "Database schema migration scripts and RLS security policies are fully configured in supabase/schema.sql!",
      message_type: 'text',
      created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
      status: 'read',
      sender: DEMO_USERS[2]
    },
    {
      id: 'msg_p2',
      conversation_id: 'conv_group_project',
      sender_id: 'user_sarah',
      content: "Awesome work @David! I uploaded the specification PDF file.",
      message_type: 'file',
      file_url: '#',
      file_name: 'connecta-specifications-v2.pdf',
      file_size: 2450000,
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      status: 'read',
      sender: DEMO_USERS[1]
    },
    {
      id: 'msg_p3',
      conversation_id: 'conv_group_project',
      sender_id: 'user_john',
      content: "Real-time subscriptions working great across multi-window browser sessions! 🚀",
      message_type: 'text',
      created_at: new Date(Date.now() - 10 * 60000).toISOString(),
      status: 'delivered',
      sender: DEMO_USERS[0],
      reactions: [
        { id: 'rx3', message_id: 'msg_p3', user_id: 'user_david', reaction: '❤️', created_at: new Date().toISOString() }
      ]
    }
  ]
};
