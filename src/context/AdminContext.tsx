import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminRole, AdminUser, AdminAuditLog, SystemNotification, AdminStats, PlatformSettings } from '../types/admin';
import { UserProfile, Post, Group, Page, EventItem, MarketplaceListing } from '../types/social';
import { DEMO_USERS, DEMO_POSTS, DEMO_GROUPS, DEMO_PAGES, DEMO_EVENTS, DEMO_MARKETPLACE } from '../services/mockSocialData';
import { useAuth } from './AuthContext';
import { authService } from '../services/authService';
import { realtimeEngine } from '../services/realtimeService';
import { adminService } from '../services/adminService';
import { reportsService, ReportItem, ReportStatus } from '../services/reportsService';
import { postsService } from '../services/postsService';

export type AdminRoute =
  | 'dashboard'
  | 'users'
  | 'posts'
  | 'comments'
  | 'reports'
  | 'moderation'
  | 'roles'
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
  postsList: Post[];
  hiddenPostIds: string[];
  reportsList: ReportItem[];
  groupsList: Group[];
  pagesList: Page[];
  eventsList: EventItem[];
  marketplaceList: MarketplaceListing[];
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
  updateUserProfileAdmin: (userId: string, updates: Partial<UserProfile>) => void;
  
  // Post & Comment Actions
  hidePost: (postId: string) => void;
  restorePost: (postId: string) => void;
  deletePost: (postId: string) => void;
  deleteComment: (postId: string, commentId: string) => void;

  // Report & Moderation Actions
  resolveReport: (reportId: string, notes: string) => void;
  dismissReport: (reportId: string, notes: string) => void;
  assignModerator: (reportId: string, moderatorId: string, moderatorName: string) => void;

  // Group / Page / Event / Marketplace Actions
  toggleGroupStatus: (groupId: string) => void;
  deleteGroup: (groupId: string) => void;
  togglePageStatus: (pageId: string) => void;
  deletePage: (pageId: string) => void;
  toggleEventStatus: (eventId: string) => void;
  deleteEvent: (eventId: string) => void;
  toggleMarketplaceStatus: (listingId: string) => void;
  deleteMarketplaceListing: (listingId: string) => void;

  // System & Logs Actions
  createSystemNotification: (title: string, message: string, audience: SystemNotification['target_audience']) => void;
  deleteSystemNotification: (id: string) => void;
  updateSettings: (newSettings: Partial<PlatformSettings>) => void;
  logAdminAction: (action: string, targetType: AdminAuditLog['target_type'], targetId: string, details: string) => void;
  clearAuditLogs: () => void;
}

const GROUPS_KEY = 'connecta_groups_db';
const PAGES_KEY = 'connecta_pages_db';
const EVENTS_KEY = 'connecta_events_db';
const MARKETPLACE_KEY = 'connecta_marketplace_db';

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [activeAdminRoute, setActiveAdminRoute] = useState<AdminRoute>('dashboard');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  // 1. Users List
  const [usersList, setUsersList] = useState<AdminUser[]>(() => {
    const dbUsers = authService.getUsersFromDb();
    return dbUsers.map((u) => ({
      ...u,
      role: (u.role as AdminRole) || (u.id === 'user_alex' ? 'super_admin' : u.id === 'user_sarah' ? 'moderator' : 'user'),
      status: u.status || 'active',
      joined_at: u.created_at || new Date(Date.now() - 90 * 86400000).toISOString(),
      last_active: u.last_seen || new Date().toISOString(),
    }));
  });

  // 2. Posts List & Hidden Ids
  const [postsList, setPostsList] = useState<Post[]>(() => postsService.getPosts(true));
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>(() => postsService.getHiddenPostIds());

  // 3. Reports List
  const [reportsList, setReportsList] = useState<ReportItem[]>(() => reportsService.getReports());

  // 4. Groups, Pages, Events, Marketplace
  const [groupsList, setGroupsList] = useState<Group[]>(() => {
    const saved = localStorage.getItem(GROUPS_KEY);
    return saved ? JSON.parse(saved) : DEMO_GROUPS;
  });

  const [pagesList, setPagesList] = useState<Page[]>(() => {
    const saved = localStorage.getItem(PAGES_KEY);
    return saved ? JSON.parse(saved) : DEMO_PAGES;
  });

  const [eventsList, setEventsList] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem(EVENTS_KEY);
    return saved ? JSON.parse(saved) : DEMO_EVENTS;
  });

  const [marketplaceList, setMarketplaceList] = useState<MarketplaceListing[]>(() => {
    const saved = localStorage.getItem(MARKETPLACE_KEY);
    return saved ? JSON.parse(saved) : DEMO_MARKETPLACE;
  });

  // 5. System Logs, Notifications, Settings
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(() => adminService.getAuditLogs());
  const [settings, setSettings] = useState<PlatformSettings>(() => adminService.getSettings());
  const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>(() =>
    adminService.getSystemNotifications()
  );

  // Realtime Subscriptions
  useEffect(() => {
    const unsubUsers = realtimeEngine.subscribe('db_users_updated', (dbUsers: any[]) => {
      setUsersList(
        dbUsers.map((u) => ({
          ...u,
          role: (u.role as AdminRole) || (u.id === 'user_alex' ? 'super_admin' : u.id === 'user_sarah' ? 'moderator' : 'user'),
          status: u.status || 'active',
          joined_at: u.created_at || new Date(Date.now() - 90 * 86400000).toISOString(),
          last_active: u.last_seen || new Date().toISOString(),
        }))
      );
    });

    const unsubPosts = realtimeEngine.subscribe('db_posts_updated', () => {
      setPostsList(postsService.getPosts(true));
      setHiddenPostIds(postsService.getHiddenPostIds());
    });

    const unsubReports = realtimeEngine.subscribe('db_reports_updated', (reports: ReportItem[]) => {
      setReportsList(reports);
    });

    const unsubNotifs = realtimeEngine.subscribe('db_sys_notifs_updated', (notifs: SystemNotification[]) => {
      setSystemNotifications(notifs);
    });

    const unsubLogs = realtimeEngine.subscribe('db_audit_logs_updated', (logs: AdminAuditLog[]) => {
      setAuditLogs(logs);
    });

    const unsubSettings = realtimeEngine.subscribe('db_settings_updated', (s: PlatformSettings) => {
      setSettings(s);
    });

    return () => {
      unsubUsers();
      unsubPosts();
      unsubReports();
      unsubNotifs();
      unsubLogs();
      unsubSettings();
    };
  }, []);

  const logAdminAction = (
    action: string,
    targetType: AdminAuditLog['target_type'],
    targetId: string,
    details: string
  ) => {
    adminService.logAction(action, targetType, targetId, details);
    setAuditLogs(adminService.getAuditLogs());
  };

  const clearAuditLogs = () => {
    adminService.clearAuditLogs();
    setAuditLogs([]);
  };

  // User Management
  const suspendUser = (userId: string, reason?: string) => {
    const updated = usersList.map((u) => (u.id === userId ? { ...u, status: 'suspended' as const } : u));
    setUsersList(updated);
    authService.saveUsersToDb(updated);
    if (user?.id === userId) authService.updateProfile({ status: 'suspended' });
    realtimeEngine.broadcast('admin_user_status_change', { userId, status: 'suspended' });
    logAdminAction('Suspended User Account', 'user', userId, reason || 'Suspended for policy violation');
  };

  const unsuspendUser = (userId: string) => {
    const updated = usersList.map((u) => (u.id === userId ? { ...u, status: 'active' as const } : u));
    setUsersList(updated);
    authService.saveUsersToDb(updated);
    if (user?.id === userId) authService.updateProfile({ status: 'active' });
    realtimeEngine.broadcast('admin_user_status_change', { userId, status: 'active' });
    logAdminAction('Unsuspended User Account', 'user', userId, 'Account restored to active status');
  };

  const banUser = (userId: string, reason?: string) => {
    const updated = usersList.map((u) => (u.id === userId ? { ...u, status: 'banned' as const } : u));
    setUsersList(updated);
    authService.saveUsersToDb(updated);
    if (user?.id === userId) authService.updateProfile({ status: 'banned' });
    realtimeEngine.broadcast('admin_user_status_change', { userId, status: 'banned' });
    logAdminAction('Permanently Banned User', 'user', userId, reason || 'Banned for severe terms violation');
  };

  const unbanUser = (userId: string) => {
    const updated = usersList.map((u) => (u.id === userId ? { ...u, status: 'active' as const } : u));
    setUsersList(updated);
    authService.saveUsersToDb(updated);
    if (user?.id === userId) authService.updateProfile({ status: 'active' });
    realtimeEngine.broadcast('admin_user_status_change', { userId, status: 'active' });
    logAdminAction('Unbanned User Account', 'user', userId, 'User ban revoked');
  };

  const deleteUserAccount = (userId: string) => {
    const updated = usersList.filter((u) => u.id !== userId);
    setUsersList(updated);
    authService.saveUsersToDb(updated);
    realtimeEngine.broadcast('admin_user_status_change', { userId, status: 'deleted' });
    logAdminAction('Deleted User Account', 'user', userId, 'Permanently deleted user profile');
  };

  const changeUserRole = (userId: string, role: AdminRole) => {
    const updated = usersList.map((u) => (u.id === userId ? { ...u, role } : u));
    setUsersList(updated);
    authService.saveUsersToDb(updated);
    if (user?.id === userId) authService.updateProfile({ role });
    realtimeEngine.broadcast('admin_user_role_change', { userId, role });
    logAdminAction('Changed User Role', 'user', userId, `Assigned new role: ${role}`);
  };

  const updateUserProfileAdmin = (userId: string, updates: Partial<UserProfile>) => {
    const updated = usersList.map((u) => (u.id === userId ? { ...u, ...updates } : u));
    setUsersList(updated);
    authService.saveUsersToDb(updated);
    if (user?.id === userId) authService.updateProfile(updates);
    logAdminAction('Updated User Profile', 'user', userId, 'Administrative profile edits applied');
  };

  // Posts & Comments
  const hidePost = (postId: string) => {
    postsService.hidePost(postId);
    setHiddenPostIds(postsService.getHiddenPostIds());
    logAdminAction('Hid Post', 'post', postId, 'Post hidden from public feed');
  };

  const restorePost = (postId: string) => {
    postsService.restorePost(postId);
    setHiddenPostIds(postsService.getHiddenPostIds());
    logAdminAction('Restored Post', 'post', postId, 'Post restored to public feed');
  };

  const deletePost = (postId: string) => {
    postsService.deletePost(postId);
    setPostsList(postsService.getPosts(true));
    setHiddenPostIds(postsService.getHiddenPostIds());
    logAdminAction('Deleted Post', 'post', postId, 'Permanently removed post');
  };

  const deleteComment = (postId: string, commentId: string) => {
    postsService.deleteComment(postId, commentId);
    setPostsList(postsService.getPosts(true));
    logAdminAction('Deleted Comment', 'comment', commentId, `Removed comment from post ${postId}`);
  };

  // Reports & Moderation
  const resolveReport = (reportId: string, notes: string) => {
    const mod = user ? `${user.first_name} ${user.last_name}` : 'Admin';
    const modId = user?.id || 'admin';
    const updated = reportsService.resolveReport(reportId, notes, mod, modId);
    setReportsList(reportsService.getReports());
    if (updated) {
      logAdminAction('Resolved Report', 'report', reportId, `Notes: ${notes}`);
    }
  };

  const dismissReport = (reportId: string, notes: string) => {
    const mod = user ? `${user.first_name} ${user.last_name}` : 'Admin';
    const modId = user?.id || 'admin';
    const updated = reportsService.dismissReport(reportId, notes, mod, modId);
    setReportsList(reportsService.getReports());
    if (updated) {
      logAdminAction('Dismissed Report', 'report', reportId, `Reason: ${notes}`);
    }
  };

  const assignModerator = (reportId: string, moderatorId: string, moderatorName: string) => {
    reportsService.assignModerator(reportId, moderatorId, moderatorName);
    setReportsList(reportsService.getReports());
    logAdminAction('Assigned Report Moderator', 'report', reportId, `Assigned to ${moderatorName}`);
  };

  // Groups, Pages, Events, Marketplace Actions
  const toggleGroupStatus = (groupId: string) => {
    const updated = groupsList.map((g) => (g.id === groupId ? { ...g, is_private: !g.is_private } : g));
    setGroupsList(updated);
    localStorage.setItem(GROUPS_KEY, JSON.stringify(updated));
    logAdminAction('Toggled Group Settings', 'group', groupId, 'Updated privacy status');
  };

  const deleteGroup = (groupId: string) => {
    const updated = groupsList.filter((g) => g.id !== groupId);
    setGroupsList(updated);
    localStorage.setItem(GROUPS_KEY, JSON.stringify(updated));
    logAdminAction('Deleted Group', 'group', groupId, 'Permanently removed group');
  };

  const togglePageStatus = (pageId: string) => {
    const updated = pagesList.map((p) => (p.id === pageId ? { ...p, is_verified: !p.is_verified } : p));
    setPagesList(updated);
    localStorage.setItem(PAGES_KEY, JSON.stringify(updated));
    logAdminAction('Toggled Page Verification', 'page', pageId, 'Updated verification badge');
  };

  const deletePage = (pageId: string) => {
    const updated = pagesList.filter((p) => p.id !== pageId);
    setPagesList(updated);
    localStorage.setItem(PAGES_KEY, JSON.stringify(updated));
    logAdminAction('Deleted Page', 'page', pageId, 'Permanently removed page');
  };

  const toggleEventStatus = (eventId: string) => {
    const updated = eventsList.map((e) => (e.id === eventId ? { ...e, is_online: !e.is_online } : e));
    setEventsList(updated);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(updated));
    logAdminAction('Toggled Event Mode', 'event', eventId, 'Updated online/in-person status');
  };

  const deleteEvent = (eventId: string) => {
    const updated = eventsList.filter((e) => e.id !== eventId);
    setEventsList(updated);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(updated));
    logAdminAction('Deleted Event', 'event', eventId, 'Permanently removed event');
  };

  const toggleMarketplaceStatus = (listingId: string) => {
    const updated = marketplaceList.map((m) =>
      m.id === listingId ? { ...m, status: (m.status === 'sold' ? 'active' : 'sold') as any } : m
    );
    setMarketplaceList(updated);
    localStorage.setItem(MARKETPLACE_KEY, JSON.stringify(updated));
    logAdminAction('Toggled Marketplace Listing Status', 'marketplace', listingId, 'Updated status');
  };

  const deleteMarketplaceListing = (listingId: string) => {
    const updated = marketplaceList.filter((m) => m.id !== listingId);
    setMarketplaceList(updated);
    localStorage.setItem(MARKETPLACE_KEY, JSON.stringify(updated));
    logAdminAction('Deleted Marketplace Listing', 'marketplace', listingId, 'Removed listing');
  };

  // Announcements & Settings
  const createSystemNotification = (
    title: string,
    message: string,
    audience: SystemNotification['target_audience']
  ) => {
    const created = adminService.createSystemNotification(title, message, audience);
    setSystemNotifications(adminService.getSystemNotifications());
  };

  const deleteSystemNotification = (id: string) => {
    adminService.deleteSystemNotification(id);
    setSystemNotifications(adminService.getSystemNotifications());
  };

  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    const updated = adminService.updateSettings(newSettings);
    setSettings(updated);
  };

  // Dynamic Statistics
  const pendingReportsCount = reportsList.filter((r) => r.status === 'pending' || r.status === 'in_review').length;
  const suspendedCount = usersList.filter((u) => u.status === 'suspended').length;
  const bannedCount = usersList.filter((u) => u.status === 'banned').length;

  const stats: AdminStats = {
    totalUsers: usersList.length,
    newUsersToday: Math.max(1, Math.floor(usersList.length * 0.1)),
    newUsersWeek: Math.max(3, Math.floor(usersList.length * 0.3)),
    activeUsers: usersList.filter((u) => u.status === 'active').length,
    totalPosts: postsList.length,
    postsToday: Math.max(1, Math.floor(postsList.length * 0.2)),
    commentsToday: postsList.reduce((acc, p) => acc + (p.comments_count || 0), 0),
    storiesToday: 4,
    pendingReports: pendingReportsCount,
    reportsToday: reportsList.length,
    suspendedUsers: suspendedCount,
    bannedContentCount: bannedCount + hiddenPostIds.length,
    userGrowthRate: 14.2,
    postGrowthRate: 9.6,
    reportsChangeRate: pendingReportsCount > 0 ? -5.2 : 0,
  };

  return (
    <AdminContext.Provider
      value={{
        activeAdminRoute,
        setActiveAdminRoute,
        selectedUserId,
        setSelectedUserId,
        usersList,
        postsList,
        hiddenPostIds,
        reportsList,
        groupsList,
        pagesList,
        eventsList,
        marketplaceList,
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
        updateUserProfileAdmin,
        hidePost,
        restorePost,
        deletePost,
        deleteComment,
        resolveReport,
        dismissReport,
        assignModerator,
        toggleGroupStatus,
        deleteGroup,
        togglePageStatus,
        deletePage,
        toggleEventStatus,
        deleteEvent,
        toggleMarketplaceStatus,
        deleteMarketplaceListing,
        createSystemNotification,
        deleteSystemNotification,
        updateSettings,
        logAdminAction,
        clearAuditLogs,
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
