import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminRole, AdminUser, AdminAuditLog, SystemNotification, AdminStats, PlatformSettings } from '../types/admin';
import { DEMO_USERS, DEMO_POSTS, DEMO_NOTIFICATIONS } from '../services/mockSocialData';
import { useAuth } from './AuthContext';

export type AdminRoute =
  | 'dashboard'
  | 'users'
  | 'posts'
  | 'comments'
  | 'reports'
  | 'moderation'
  | 'groups'
  | 'pages'
  | 'stories'
  | 'events'
  | 'marketplace'
  | 'messages'
  | 'notifications'
  | 'analytics'
  | 'logs'
  | 'settings';

interface AdminContextType {
  activeAdminRoute: AdminRoute;
  setActiveAdminRoute: (route: AdminRoute) => void;
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
  usersList: AdminUser[];
  stats: AdminStats;
  auditLogs: AdminAuditLog[];
  systemNotifications: SystemNotification[];
  settings: PlatformSettings;
  adminSearchQuery: string;
  setAdminSearchQuery: (query: string) => void;
  
  // Actions
  suspendUser: (userId: string, reason?: string) => void;
  unsuspendUser: (userId: string) => void;
  banUser: (userId: string, reason?: string) => void;
  unbanUser: (userId: string) => void;
  deleteUserAccount: (userId: string) => void;
  changeUserRole: (userId: string, role: AdminRole) => void;
  createSystemNotification: (title: string, message: string, audience: SystemNotification['target_audience']) => void;
  updateSettings: (newSettings: Partial<PlatformSettings>) => void;
  logAdminAction: (action: string, targetType: AdminAuditLog['target_type'], targetId: string, details: string) => void;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  platformName: 'Connecta',
  description: 'Social Media & Networking Platform',
  allowRegistration: true,
  requireEmailVerification: true,
  allowUsernameChanges: true,
  allowAccountDeletion: true,
  allowPosts: true,
  allowComments: true,
  allowStories: true,
  allowMarketplace: true,
  autoModeration: true,
  profanityFilter: true,
  reportThreshold: 3,
  sessionTimeoutMinutes: 60,
};

const INITIAL_LOGS: AdminAuditLog[] = [
  {
    id: 'log_1',
    admin_id: 'user_alex',
    admin_name: 'Alex Johnson',
    admin_role: 'super_admin',
    action: 'Changed Platform Settings',
    target_type: 'setting',
    target_id: 'sys_settings',
    details: 'Enabled profanity filter and auto-moderation threshold to 3',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    ip_address: '192.168.1.1',
  },
  {
    id: 'log_2',
    admin_id: 'user_sarah',
    admin_name: 'Sarah Adams',
    admin_role: 'moderator',
    action: 'Resolved Report',
    target_type: 'report',
    target_id: 'rep_102',
    details: 'Reviewed and dismissed spam report on Post #14',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    ip_address: '192.168.1.4',
  },
];

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [activeAdminRoute, setActiveAdminRoute] = useState<AdminRoute>('dashboard');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  const [usersList, setUsersList] = useState<AdminUser[]>(() => {
    return DEMO_USERS.map((u) => ({
      ...u,
      role: (u.role as AdminRole) || (u.id === 'user_alex' ? 'super_admin' : u.id === 'user_sarah' ? 'moderator' : 'user'),
      status: u.status || 'active',
      joined_at: u.created_at || new Date(Date.now() - 90 * 86400000).toISOString(),
      last_active: u.last_seen || new Date().toISOString(),
    }));
  });

  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(INITIAL_LOGS);
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  
  const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>([
    {
      id: 'notif_sys_1',
      title: 'Platform Maintenance Notice',
      message: 'Connecta will undergo routine server maintenance on Sunday at 02:00 UTC.',
      target_audience: 'everyone',
      status: 'sent',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const logAdminAction = (
    action: string,
    targetType: AdminAuditLog['target_type'],
    targetId: string,
    details: string
  ) => {
    if (!user) return;
    const newLog: AdminAuditLog = {
      id: `log_${Date.now()}`,
      admin_id: user.id,
      admin_name: user.full_name,
      admin_role: (user.role as AdminRole) || 'super_admin',
      action,
      target_type: targetType,
      target_id: targetId,
      details,
      timestamp: new Date().toISOString(),
      ip_address: '127.0.0.1',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const suspendUser = (userId: string, reason?: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'suspended' } : u))
    );
    logAdminAction('Suspended User Account', 'user', userId, reason || 'Suspended for policy violation');
  };

  const unsuspendUser = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'active' } : u))
    );
    logAdminAction('Unsuspended User Account', 'user', userId, 'Account restored to active status');
  };

  const banUser = (userId: string, reason?: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'banned' } : u))
    );
    logAdminAction('Permanently Banned User', 'user', userId, reason || 'Banned for severe terms violation');
  };

  const unbanUser = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'active' } : u))
    );
    logAdminAction('Unbanned User Account', 'user', userId, 'User ban revoked');
  };

  const deleteUserAccount = (userId: string) => {
    setUsersList((prev) => prev.filter((u) => u.id !== userId));
    logAdminAction('Deleted User Account', 'user', userId, 'Permanently deleted user profile and associated data');
  };

  const changeUserRole = (userId: string, role: AdminRole) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u))
    );
    logAdminAction('Changed User Role', 'user', userId, `Assigned new role: ${role}`);
  };

  const createSystemNotification = (
    title: string,
    message: string,
    audience: SystemNotification['target_audience']
  ) => {
    const newNotif: SystemNotification = {
      id: `sys_notif_${Date.now()}`,
      title,
      message,
      target_audience: audience,
      status: 'sent',
      created_at: new Date().toISOString(),
    };
    setSystemNotifications((prev) => [newNotif, ...prev]);
    logAdminAction('Dispatched System Announcement', 'setting', 'notification', `Title: ${title}`);
  };

  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logAdminAction('Updated System Settings', 'setting', 'sys_config', 'Modified general platform rules and thresholds');
  };

  // Computed Statistics
  const stats: AdminStats = {
    totalUsers: usersList.length + 12400,
    newUsersToday: 48,
    newUsersWeek: 312,
    activeUsers: 8940,
    totalPosts: DEMO_POSTS.length + 48200,
    postsToday: 184,
    commentsToday: 412,
    storiesToday: 95,
    pendingReports: 12,
    reportsToday: 5,
    suspendedUsers: usersList.filter((u) => u.status === 'suspended').length + 4,
    bannedContentCount: 18,
    userGrowthRate: 12.4,
    postGrowthRate: 8.2,
    reportsChangeRate: -4.1,
  };

  return (
    <AdminContext.Provider
      value={{
        activeAdminRoute,
        setActiveAdminRoute,
        selectedUserId,
        setSelectedUserId,
        usersList,
        stats,
        auditLogs,
        systemNotifications,
        settings,
        adminSearchQuery,
        setAdminSearchQuery,
        suspendUser,
        unsuspendUser,
        banUser,
        unbanUser,
        deleteUserAccount,
        changeUserRole,
        createSystemNotification,
        updateSettings,
        logAdminAction,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};
