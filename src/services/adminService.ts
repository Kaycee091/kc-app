import { AdminAuditLog, AdminRole, SystemNotification, PlatformSettings } from '../types/admin';
import { authService } from './authService';

class AdminService {
  private auditLogs: AdminAuditLog[] = [
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
    },
  ];

  getAuditLogs(): AdminAuditLog[] {
    return this.auditLogs;
  }

  logAction(action: string, targetType: AdminAuditLog['target_type'], targetId: string, details: string) {
    const admin = authService.getCurrentUser();
    if (!admin) return;

    const newLog: AdminAuditLog = {
      id: `log_${Date.now()}`,
      admin_id: admin.id,
      admin_name: admin.full_name,
      admin_role: (admin.role as AdminRole) || 'super_admin',
      action,
      target_type: targetType,
      target_id: targetId,
      details,
      timestamp: new Date().toISOString(),
    };

    this.auditLogs = [newLog, ...this.auditLogs];
  }
}

export const adminService = new AdminService();
