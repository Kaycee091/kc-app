import { UserProfile, Post, PostComment, MarketplaceListing, Group, Page, EventItem, Story } from './social';

export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'support' | 'user';

export type UserAccountStatus = 'active' | 'suspended' | 'banned' | 'pending';

export interface AdminUser extends UserProfile {
  role: AdminRole;
  status: UserAccountStatus;
  joined_at: string;
  last_active: string;
  ip_address?: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  admin_role: AdminRole;
  action: string;
  target_type: 'user' | 'post' | 'comment' | 'report' | 'group' | 'page' | 'marketplace' | 'setting';
  target_id: string;
  details: string;
  timestamp: string;
  ip_address?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  target_audience: 'everyone' | 'new_users' | 'active_users' | 'admins' | 'specific';
  status: 'sent' | 'scheduled' | 'draft';
  created_at: string;
  scheduled_for?: string;
}

export interface AdminStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersWeek: number;
  activeUsers: number;
  totalPosts: number;
  postsToday: number;
  commentsToday: number;
  storiesToday: number;
  pendingReports: number;
  reportsToday: number;
  suspendedUsers: number;
  bannedContentCount: number;
  userGrowthRate: number;
  postGrowthRate: number;
  reportsChangeRate: number;
}

export interface PlatformSettings {
  platformName: string;
  description: string;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  allowUsernameChanges: boolean;
  allowAccountDeletion: boolean;
  allowPosts: boolean;
  allowComments: boolean;
  allowStories: boolean;
  allowMarketplace: boolean;
  autoModeration: boolean;
  profanityFilter: boolean;
  reportThreshold: number;
  sessionTimeoutMinutes: number;
}
