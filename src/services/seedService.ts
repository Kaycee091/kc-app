import { UserProfile, Post, Story, MarketplaceListing, Group, Page, EventItem, NotificationItem, Conversation, Message } from '../types/social';
import { AdminAuditLog, SystemNotification, PlatformSettings } from '../types/admin';
import { DEMO_USERS, DEMO_POSTS, DEMO_STORIES, DEMO_MARKETPLACE, DEMO_GROUPS, DEMO_PAGES, DEMO_EVENTS, DEMO_NOTIFICATIONS, DEMO_CONVERSATIONS, DEMO_MESSAGES } from './mockSocialData';

const SEED_VERSION_KEY = 'connecta_seed_version_1500_v3';
const USERS_DB_KEY = 'connecta_users_db';
const POSTS_DB_KEY = 'connecta_posts_db';
const STORIES_DB_KEY = 'connecta_stories_db';
const MARKETPLACE_DB_KEY = 'connecta_marketplace_db';
const GROUPS_DB_KEY = 'connecta_groups_db';
const PAGES_DB_KEY = 'connecta_pages_db';
const EVENTS_DB_KEY = 'connecta_events_db';
const NOTIFICATIONS_DB_KEY = 'connecta_notifications_db';
const CONVS_DB_KEY = 'connecta_conversations_db';
const MESSAGES_DB_KEY = 'connecta_messages_db';
const AUDIT_LOGS_DB_KEY = 'connecta_audit_logs_db';

class SeedService {
  public initializeSeedData() {
    if (typeof localStorage === 'undefined') return;

    // Check if seed data already initialized
    const isSeeded = localStorage.getItem(SEED_VERSION_KEY);
    if (!isSeeded) {
      // Clear stale posts cache so postsService reloads & normalizes fresh data
      localStorage.removeItem(POSTS_DB_KEY);
      this.seedAll();
      localStorage.setItem(SEED_VERSION_KEY, 'true');
    }
  }

  public seedAll() {
    if (!localStorage.getItem(USERS_DB_KEY)) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(DEMO_USERS));
    }

    if (!localStorage.getItem(POSTS_DB_KEY)) {
      localStorage.setItem(POSTS_DB_KEY, JSON.stringify(DEMO_POSTS));
    }

    if (!localStorage.getItem(STORIES_DB_KEY)) {
      localStorage.setItem(STORIES_DB_KEY, JSON.stringify(DEMO_STORIES));
    }

    if (!localStorage.getItem(MARKETPLACE_DB_KEY)) {
      localStorage.setItem(MARKETPLACE_DB_KEY, JSON.stringify(DEMO_MARKETPLACE));
    }

    if (!localStorage.getItem(GROUPS_DB_KEY)) {
      localStorage.setItem(GROUPS_DB_KEY, JSON.stringify(DEMO_GROUPS));
    }

    if (!localStorage.getItem(PAGES_DB_KEY)) {
      localStorage.setItem(PAGES_DB_KEY, JSON.stringify(DEMO_PAGES));
    }

    if (!localStorage.getItem(EVENTS_DB_KEY)) {
      localStorage.setItem(EVENTS_DB_KEY, JSON.stringify(DEMO_EVENTS));
    }

    if (!localStorage.getItem(NOTIFICATIONS_DB_KEY)) {
      localStorage.setItem(NOTIFICATIONS_DB_KEY, JSON.stringify(DEMO_NOTIFICATIONS));
    }

    if (!localStorage.getItem(CONVS_DB_KEY)) {
      localStorage.setItem(CONVS_DB_KEY, JSON.stringify(DEMO_CONVERSATIONS));
    }

    if (!localStorage.getItem(MESSAGES_DB_KEY)) {
      localStorage.setItem(MESSAGES_DB_KEY, JSON.stringify(DEMO_MESSAGES));
    }

    if (!localStorage.getItem(AUDIT_LOGS_DB_KEY)) {
      const initialLogs: AdminAuditLog[] = [
        {
          id: 'log_1',
          admin_id: 'user_alex',
          admin_name: 'Alex Johnson',
          admin_role: 'super_admin',
          action: 'Updated Platform Settings',
          target_type: 'setting',
          target_id: 'sys_config',
          details: 'Enabled auto-moderation threshold to 3 reports',
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
      localStorage.setItem(AUDIT_LOGS_DB_KEY, JSON.stringify(initialLogs));
    }
  }

  public resetDemoData() {
    localStorage.removeItem(SEED_VERSION_KEY);
    localStorage.removeItem(USERS_DB_KEY);
    localStorage.removeItem(POSTS_DB_KEY);
    localStorage.removeItem(STORIES_DB_KEY);
    localStorage.removeItem(MARKETPLACE_DB_KEY);
    localStorage.removeItem(GROUPS_DB_KEY);
    localStorage.removeItem(PAGES_DB_KEY);
    localStorage.removeItem(EVENTS_DB_KEY);
    localStorage.removeItem(NOTIFICATIONS_DB_KEY);
    localStorage.removeItem(CONVS_DB_KEY);
    localStorage.removeItem(MESSAGES_DB_KEY);
    localStorage.removeItem(AUDIT_LOGS_DB_KEY);
    this.initializeSeedData();
  }
}

export const seedService = new SeedService();
