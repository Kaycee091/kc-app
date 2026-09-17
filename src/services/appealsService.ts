import { BanAppeal, AppealStatus } from '../types/admin';
import { realtimeEngine } from './realtimeService';

const APPEALS_STORAGE_KEY = 'connecta_appeals_db';

class AppealsService {
  private appeals: BanAppeal[] = [];

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(APPEALS_STORAGE_KEY);
      if (saved) {
        try {
          this.appeals = JSON.parse(saved);
        } catch {
          this.appeals = [];
        }
      }
    }
  }

  private persist() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(APPEALS_STORAGE_KEY, JSON.stringify(this.appeals));
    }
    realtimeEngine.broadcast('db_appeals_updated', this.appeals);
  }

  async getAppeals(status?: string, search?: string): Promise<BanAppeal[]> {
    try {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);
      if (search) params.append('search', search);

      const res = await fetch(`/api/v1/moderation/appeals/?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const serverAppeals: BanAppeal[] = Array.isArray(data) ? data : (data.results || []);
        if (serverAppeals.length > 0) {
          // Merge with local appeals
          const serverMap = new Map(serverAppeals.map((a) => [a.id, a]));
          const combined = [...serverAppeals];
          for (const local of this.appeals) {
            if (!serverMap.has(local.id)) {
              combined.push(local);
            }
          }
          this.appeals = combined;
          this.persist();
          return combined;
        }
      }
    } catch (e) {
      console.warn('[AppealsService] Failed to fetch from backend, using local data', e);
    }

    let filtered = [...this.appeals];
    if (status && status !== 'all') {
      filtered = filtered.filter((a) => a.status === status);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.appeal_message.toLowerCase().includes(s) ||
          (a.user?.username && a.user.username.toLowerCase().includes(s)) ||
          (a.user?.full_name && a.user.full_name.toLowerCase().includes(s))
      );
    }
    return filtered;
  }

  async getMyAppeal(userId: string): Promise<BanAppeal | null> {
    try {
      const res = await fetch(`/api/v1/moderation/appeals/my_appeal/?user_id=${encodeURIComponent(userId)}`, {
        headers: { 'X-User-Id': userId },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.appeal) {
          const idx = this.appeals.findIndex((a) => a.id === data.appeal.id);
          if (idx >= 0) {
            this.appeals[idx] = data.appeal;
          } else {
            this.appeals.unshift(data.appeal);
          }
          this.persist();
          return data.appeal;
        }
      }
    } catch (e) {
      console.warn('[AppealsService] Failed to fetch my appeal from backend', e);
    }

    // Local fallback
    const found = this.appeals.find((a) => a.user_id === userId || a.user?.id === userId);
    return found || null;
  }

  async submitAppeal(params: {
    userId: string;
    appealMessage: string;
    supportingInfo?: string;
    banReason?: string;
    userProfile?: any;
  }): Promise<{ success: boolean; appeal?: BanAppeal; error?: string }> {
    try {
      const res = await fetch('/api/v1/moderation/appeals/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': params.userId,
        },
        body: JSON.stringify({
          user_id: params.userId,
          appeal_message: params.appealMessage,
          supporting_info: params.supportingInfo || '',
          ban_reason: params.banReason || '',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.appeal) {
          const idx = this.appeals.findIndex((a) => a.id === data.appeal.id);
          if (idx >= 0) {
            this.appeals[idx] = data.appeal;
          } else {
            this.appeals.unshift(data.appeal);
          }
          this.persist();
          return { success: true, appeal: data.appeal };
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        if (errJson.error) {
          return { success: false, error: errJson.error };
        }
      }
    } catch (e) {
      console.warn('[AppealsService] Backend submission failed, saving locally', e);
    }

    // Local fallback
    const localAppeal: BanAppeal = {
      id: `appeal_${Date.now()}`,
      user_id: params.userId,
      user: params.userProfile,
      ban_reason: params.banReason || 'Policy violation',
      appeal_message: params.appealMessage,
      supporting_info: params.supportingInfo || '',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    this.appeals.unshift(localAppeal);
    this.persist();
    return { success: true, appeal: localAppeal };
  }

  async approveAppeal(appealId: string, notes?: string): Promise<{ success: boolean; appeal?: BanAppeal }> {
    try {
      const res = await fetch(`/api/v1/moderation/appeals/${appealId}/approve/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.appeal) {
          const idx = this.appeals.findIndex((a) => a.id === appealId);
          if (idx >= 0) this.appeals[idx] = data.appeal;
          this.persist();
          return { success: true, appeal: data.appeal };
        }
      }
    } catch (e) {
      console.warn('[AppealsService] Backend approve failed, updating locally', e);
    }

    const idx = this.appeals.findIndex((a) => a.id === appealId);
    if (idx >= 0) {
      this.appeals[idx] = {
        ...this.appeals[idx],
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        admin_notes: notes || 'Approved by admin',
      };
      this.persist();
      return { success: true, appeal: this.appeals[idx] };
    }
    return { success: false };
  }

  async rejectAppeal(appealId: string, notes?: string): Promise<{ success: boolean; appeal?: BanAppeal }> {
    try {
      const res = await fetch(`/api/v1/moderation/appeals/${appealId}/reject/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.appeal) {
          const idx = this.appeals.findIndex((a) => a.id === appealId);
          if (idx >= 0) this.appeals[idx] = data.appeal;
          this.persist();
          return { success: true, appeal: data.appeal };
        }
      }
    } catch (e) {
      console.warn('[AppealsService] Backend reject failed, updating locally', e);
    }

    const idx = this.appeals.findIndex((a) => a.id === appealId);
    if (idx >= 0) {
      this.appeals[idx] = {
        ...this.appeals[idx],
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        admin_notes: notes || 'Rejected by admin',
      };
      this.persist();
      return { success: true, appeal: this.appeals[idx] };
    }
    return { success: false };
  }
}

export const appealsService = new AppealsService();
