import { realtimeEngine } from './realtimeService';
import { DEMO_USERS, DEMO_POSTS } from './mockSocialData';

export type ReportTargetType = 'post' | 'comment' | 'user' | 'group' | 'page' | 'story' | 'marketplace';
export type ReportStatus = 'pending' | 'in_review' | 'resolved' | 'dismissed';
export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'inappropriate_content'
  | 'fake_account'
  | 'copyright'
  | 'other';

export interface ReportItem {
  id: string;
  reporter_id: string;
  reporter_name: string;
  reporter_username: string;
  target_type: ReportTargetType;
  target_id: string;
  target_title?: string;
  target_author_name?: string;
  reason: ReportReason;
  details?: string;
  status: ReportStatus;
  assigned_moderator_id?: string;
  assigned_moderator_name?: string;
  created_at: string;
  resolved_at?: string;
  resolution_notes?: string;
}

const REPORTS_DB_KEY = 'connecta_reports_db';

const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'rep_101',
    reporter_id: 'user_john',
    reporter_name: 'John Smith',
    reporter_username: 'john_smith',
    target_type: 'post',
    target_id: 'post_2',
    target_title: 'Unverified promo link post',
    target_author_name: 'Sarah Adams',
    reason: 'spam',
    details: 'Post contains suspicious promotional links without context.',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'rep_102',
    reporter_id: 'user_sarah',
    reporter_name: 'Sarah Adams',
    reporter_username: 'sarah_adams',
    target_type: 'user',
    target_id: 'user_john',
    target_title: 'User @john_smith profile',
    target_author_name: 'John Smith',
    reason: 'inappropriate_content',
    details: 'User sent repetitive unsolicited commercial messages.',
    status: 'in_review',
    assigned_moderator_id: 'user_alex',
    assigned_moderator_name: 'Humble Asogwa',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'rep_103',
    reporter_id: 'user_alex',
    reporter_name: 'Humble Asogwa',
    reporter_username: 'Humble',
    target_type: 'marketplace',
    target_id: 'item_1',
    target_title: 'MacBook Pro M2 Max listing',
    target_author_name: 'Sarah Adams',
    reason: 'other',
    details: 'Price listing verification requested by system moderator.',
    status: 'resolved',
    assigned_moderator_id: 'user_alex',
    assigned_moderator_name: 'Humble Asogwa',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    resolved_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    resolution_notes: 'Verified item invoice with seller. Listing restored.',
  },
];

class ReportsService {
  private reports: ReportItem[] = [];

  constructor() {
    if (typeof localStorage === 'undefined') {
      this.reports = INITIAL_REPORTS;
      return;
    }
    const saved = localStorage.getItem(REPORTS_DB_KEY);
    if (saved) {
      try {
        this.reports = JSON.parse(saved);
      } catch (e) {
        this.reports = INITIAL_REPORTS;
      }
    } else {
      this.reports = INITIAL_REPORTS;
      this.persist();
    }
  }

  private persist() {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(REPORTS_DB_KEY, JSON.stringify(this.reports));
    realtimeEngine.broadcast('db_reports_updated', this.reports);
  }

  public getReports(): ReportItem[] {
    return this.reports;
  }

  public createReport(report: Omit<ReportItem, 'id' | 'created_at' | 'status'>): ReportItem {
    const newReport: ReportItem = {
      ...report,
      id: `rep_${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    this.reports = [newReport, ...this.reports];
    this.persist();
    realtimeEngine.broadcast('report_created', newReport);
    return newReport;
  }

  public updateReportStatus(
    reportId: string,
    status: ReportStatus,
    notes?: string,
    moderatorName?: string,
    moderatorId?: string
  ): ReportItem | null {
    let target: ReportItem | null = null;

    this.reports = this.reports.map((r) => {
      if (r.id === reportId) {
        target = {
          ...r,
          status,
          resolution_notes: notes || r.resolution_notes,
          assigned_moderator_id: moderatorId || r.assigned_moderator_id,
          assigned_moderator_name: moderatorName || r.assigned_moderator_name,
          resolved_at: status === 'resolved' || status === 'dismissed' ? new Date().toISOString() : r.resolved_at,
        };
        return target;
      }
      return r;
    });

    if (target) {
      this.persist();
      realtimeEngine.broadcast('report_updated', target);
    }
    return target;
  }

  public resolveReport(reportId: string, notes: string, moderatorName?: string, moderatorId?: string): ReportItem | null {
    return this.updateReportStatus(reportId, 'resolved', notes, moderatorName, moderatorId);
  }

  public dismissReport(reportId: string, notes: string, moderatorName?: string, moderatorId?: string): ReportItem | null {
    return this.updateReportStatus(reportId, 'dismissed', notes, moderatorName, moderatorId);
  }

  public assignModerator(reportId: string, moderatorId: string, moderatorName: string): ReportItem | null {
    return this.updateReportStatus(reportId, 'in_review', undefined, moderatorName, moderatorId);
  }
}

export const reportsService = new ReportsService();
