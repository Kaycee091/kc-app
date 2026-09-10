import { AdminAuditLog, AdminRole, SystemNotification, PlatformSettings } from '../types/admin';
import { authService } from './authService';
import { realtimeEngine } from './realtimeService';

const AUDIT_LOGS_KEY = 'connecta_audit_logs_db';
const SETTINGS_KEY = 'connecta_platform_settings_db';
const SYS_NOTIFS_KEY = 'connecta_system_notifications_db';

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

const DEFAULT_SYS_NOTIFS: SystemNotification[] = [
  {
    id: 'notif_sys_1',
    title: 'Platform Maintenance Notice',
    message: 'Connecta will undergo routine server maintenance on Sunday at 02:00 UTC.',
    target_audience: 'everyone',
    status: 'sent',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

class AdminService {
  private auditLogs: AdminAuditLog[] = [];
  private settings: PlatformSettings = DEFAULT_SETTINGS;
  private sysNotifications: SystemNotification[] = [];

  constructor() {
    if (typeof localStorage === 'undefined') return;
    // Load Audit Logs
    const savedLogs = localStorage.getItem(AUDIT_LOGS_KEY);
    this.auditLogs = savedLogs
      ? JSON.parse(savedLogs)
      : [
          {
            id: 'log_1',
            admin_id: 'user_alex',
            admin_name: 'Humble Asogwa',
            admin_role: 'super_admin',
            action: 'Updated Platform Settings',
            target_type: 'setting',
            target_id: 'sys_config',
            details: 'Enabled auto-moderation threshold to 3 reports',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            ip_address: '192.168.1.1',
          },
        ];

    // Load Settings
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
      } catch (e) {}
    }

    // Load System Notifications
    const savedNotifs = localStorage.getItem(SYS_NOTIFS_KEY);
    this.sysNotifications = savedNotifs ? JSON.parse(savedNotifs) : DEFAULT_SYS_NOTIFS;
  }

  private persistLogs() {
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(this.auditLogs));
    realtimeEngine.broadcast('db_audit_logs_updated', this.auditLogs);
  }

  private persistSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    realtimeEngine.broadcast('db_settings_updated', this.settings);
  }

  private persistNotifs() {
    localStorage.setItem(SYS_NOTIFS_KEY, JSON.stringify(this.sysNotifications));
    realtimeEngine.broadcast('db_sys_notifs_updated', this.sysNotifications);
  }

  getAuditLogs(): AdminAuditLog[] {
    return this.auditLogs;
  }

  clearAuditLogs() {
    this.auditLogs = [];
    this.persistLogs();
  }

  logAction(action: string, targetType: AdminAuditLog['target_type'], targetId: string, details: string) {
    const admin = authService.getCurrentUser();
    const newLog: AdminAuditLog = {
      id: `log_${Date.now()}`,
      admin_id: admin?.id || 'sys_admin',
      admin_name: admin?.full_name || 'System Admin',
      admin_role: (admin?.role as AdminRole) || 'super_admin',
      action,
      target_type: targetType,
      target_id: targetId,
      details,
      timestamp: new Date().toISOString(),
      ip_address: '127.0.0.1',
    };

    this.auditLogs = [newLog, ...this.auditLogs];
    this.persistLogs();
    realtimeEngine.broadcast('admin_log_created', newLog);
  }

  getSettings(): PlatformSettings {
    return this.settings;
  }

  updateSettings(updates: Partial<PlatformSettings>): PlatformSettings {
    this.settings = { ...this.settings, ...updates };
    this.persistSettings();
    this.logAction('Updated System Settings', 'setting', 'sys_config', 'Modified general platform rules and thresholds');
    return this.settings;
  }

  getSystemNotifications(): SystemNotification[] {
    return this.sysNotifications;
  }

  createSystemNotification(title: string, message: string, targetAudience: SystemNotification['target_audience']): SystemNotification {
    const newNotif: SystemNotification = {
      id: `sys_notif_${Date.now()}`,
      title,
      message,
      target_audience: targetAudience,
      status: 'sent',
      created_at: new Date().toISOString(),
    };

    this.sysNotifications = [newNotif, ...this.sysNotifications];
    this.persistNotifs();
    this.logAction('Dispatched System Announcement', 'setting', newNotif.id, `Title: ${title} (${targetAudience})`);
    realtimeEngine.broadcast('admin_system_notification', newNotif);
    return newNotif;
  }

  deleteSystemNotification(id: string) {
    this.sysNotifications = this.sysNotifications.filter((n) => n.id !== id);
    this.persistNotifs();
    this.logAction('Deleted System Announcement', 'setting', id, 'Removed platform notification');
  }
}

export const adminService = new AdminService();
