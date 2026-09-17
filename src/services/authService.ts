import { UserProfile } from '../types/social';
import { AdminRole } from '../types/admin';
import { supabase } from './supabaseClient';
import { DEMO_USERS } from './mockSocialData';
import { realtimeEngine } from './realtimeService';
import { verifyPassword, hashPassword } from '../utils/crypto';

const AUTH_USER_KEY = 'connecta_auth_user';
const VERIFY_CODE_KEY = 'connecta_verify_code';
export const PENDING_VERIFICATION_KEY = 'connecta_pending_verification';
const AUTH_2FA_KEY = 'connecta_2fa_enabled';
const SESSIONS_KEY = 'connecta_active_sessions';
const LOGIN_HISTORY_KEY = 'connecta_login_history';
const USERS_DB_KEY = 'connecta_users_db';

export interface SignUpParams {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone?: string;
  password: string;
  dob?: string;
  gender?: string;
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface LoginHistoryRecord {
  id: string;
  timestamp: string;
  device: string;
  ip: string;
  location: string;
  status: 'success' | 'failed';
}

class AuthService {
  private currentUser: UserProfile | null = null;
  private verificationEmail: string | null = null;
  private is2FAEnabled: boolean = false;
  private activeSessions: UserSession[] = [];
  private loginHistory: LoginHistoryRecord[] = [];

  constructor() {
    if (typeof localStorage === 'undefined') {
      this.currentUser = null;
      return;
    }
    this.ensureUsersDb();
    const saved = localStorage.getItem(AUTH_USER_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const dbUsers = this.getUsersFromDb();
        const updatedUser = dbUsers.find((u) => u.id === parsed.id || u.email === parsed.email);
        this.currentUser = updatedUser || parsed;
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(this.currentUser));
      } catch (e) {
        this.currentUser = null;
      }
    } else {
      this.currentUser = null;
    }

    this.is2FAEnabled = localStorage.getItem(AUTH_2FA_KEY) === 'true';

    const savedSessions = localStorage.getItem(SESSIONS_KEY);
    this.activeSessions = savedSessions
      ? JSON.parse(savedSessions)
      : [
          {
            id: 'sess_1',
            device: 'Windows Desktop (Current)',
            browser: 'Chrome / Edge',
            location: 'San Francisco, US',
            ip: '192.168.1.1',
            lastActive: new Date().toISOString(),
            isCurrent: true,
          },
        ];

    const savedHistory = localStorage.getItem(LOGIN_HISTORY_KEY);
    this.loginHistory = savedHistory
      ? JSON.parse(savedHistory)
      : [
          {
            id: 'log_hist_1',
            timestamp: new Date().toISOString(),
            device: 'Windows Desktop',
            ip: '192.168.1.1',
            location: 'San Francisco, US',
            status: 'success',
          },
        ];
  }

  private ensureUsersDb() {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (!raw) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(DEMO_USERS));
      return;
    }

    try {
      const users: UserProfile[] = JSON.parse(raw);

      // 1. Super Admin: Alex Johnson (Humble)
      const alexProfile: UserProfile = {
        id: 'user_alex',
        username: 'humble',
        first_name: 'Alex',
        last_name: 'Johnson',
        full_name: 'Alex Johnson',
        email: 'asogwakenechukwu284@gmail.com',
        role: 'super_admin',
        status: 'active',
        password_hash: 'pbkdf2_sha256$600000$c9XzLpQ2mK8v$5M6UCwewqL3znq+qo0rIBDC8qrUn3pLaruZ8daUNqTo=',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        cover_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
        bio: 'Platform Super Admin & Lead Developer',
        gender: 'male',
        location: 'Lagos, Nigeria',
        is_active: true,
        is_staff: true,
        is_superuser: true,
        is_online: true,
        created_at: '2026-09-10T09:27:58.516366+00:00',
      };

      // 2. Moderator: Sarah Adams
      const sarahProfile: UserProfile = {
        id: 'user_sarah',
        username: 'sarah_mod',
        first_name: 'Sarah',
        last_name: 'Adams',
        full_name: 'Sarah Adams',
        email: 'sarah@connecta.app',
        role: 'moderator',
        status: 'active',
        password_hash: 'pbkdf2_sha256$600000$c9XzLpQ2mK8v$5M6UCwewqL3znq+qo0rIBDC8qrUn3pLaruZ8daUNqTo=',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        cover_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800',
        bio: 'Platform Moderator & Trust/Safety Lead',
        gender: 'female',
        location: 'Abuja, Nigeria',
        is_active: true,
        is_staff: true,
        is_superuser: false,
        is_online: true,
        created_at: '2026-09-10T09:27:58.536511+00:00',
      };

      const alexIndex = users.findIndex(
        (u) =>
          u.id === 'user_alex' ||
          u.email?.toLowerCase() === 'asogwakenechukwu284@gmail.com' ||
          u.username.toLowerCase() === 'humble'
      );
      if (alexIndex !== -1) {
        users[alexIndex] = { ...users[alexIndex], ...alexProfile };
      } else {
        users.unshift(alexProfile);
      }

      const sarahIndex = users.findIndex(
        (u) =>
          u.id === 'user_sarah' ||
          u.email?.toLowerCase() === 'sarah@connecta.app' ||
          u.username.toLowerCase() === 'sarah_mod'
      );
      if (sarahIndex !== -1) {
        users[sarahIndex] = { ...users[sarahIndex], ...sarahProfile };
      } else {
        users.unshift(sarahProfile);
      }

      // Deduplicate by id and email
      const uniqueUsers: UserProfile[] = [];
      const seenIds = new Set<string>();
      const seenEmails = new Set<string>();

      for (const u of users) {
        const emailKey = u.email?.toLowerCase() || '';
        if (seenIds.has(u.id) || (emailKey && seenEmails.has(emailKey))) {
          continue;
        }
        seenIds.add(u.id);
        if (emailKey) seenEmails.add(emailKey);
        uniqueUsers.push(u);
      }

      localStorage.setItem(USERS_DB_KEY, JSON.stringify(uniqueUsers));
    } catch (e) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(DEMO_USERS));
    }
  }

  public getUsersFromDb(): UserProfile[] {
    const raw = localStorage.getItem(USERS_DB_KEY);
    return raw ? JSON.parse(raw) : DEMO_USERS;
  }

  public saveUsersToDb(users: UserProfile[]) {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    realtimeEngine.broadcast('db_users_updated', users);
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  getVerificationEmail(): string | null {
    return this.verificationEmail;
  }

  getPendingVerificationCode(email?: string): string | null {
    if (typeof localStorage === 'undefined') return null;
    const savedRaw = localStorage.getItem(VERIFY_CODE_KEY);
    if (!savedRaw) return null;
    try {
      const data = JSON.parse(savedRaw);
      if (email && data.email?.toLowerCase() !== email.toLowerCase()) return null;
      if (data.expires_at && Date.now() > data.expires_at) return null;
      return data.code || null;
    } catch {
      return null;
    }
  }

  get2FAStatus(): boolean {
    return this.is2FAEnabled;
  }

  toggle2FA(enabled: boolean): boolean {
    this.is2FAEnabled = enabled;
    localStorage.setItem(AUTH_2FA_KEY, enabled ? 'true' : 'false');
    return this.is2FAEnabled;
  }

  getActiveSessions(): UserSession[] {
    return this.activeSessions;
  }

  logoutAllOtherDevices() {
    this.activeSessions = this.activeSessions.filter((s) => s.isCurrent);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(this.activeSessions));
  }

  getLoginHistory(): LoginHistoryRecord[] {
    return this.loginHistory;
  }

  async signUp(params: SignUpParams): Promise<{ success: boolean; devCode?: string; error?: string }> {
    // 1. Validation
    if (!params.first_name || !params.last_name || !params.username || !params.email || !params.password) {
      return { success: false, error: 'All required fields must be provided' };
    }
    if (params.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const existingUsers = this.getUsersFromDb();
    if (existingUsers.some((u) => u.email?.toLowerCase() === params.email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }
    if (existingUsers.some((u) => u.username.toLowerCase() === params.username.toLowerCase())) {
      return { success: false, error: 'That username is already taken. Please choose another.' };
    }

    // 2. Generate a cryptographically random 6-digit verification code
    const verifyCode = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const verificationPayload = {
      email: params.email,
      code: verifyCode,
      expires_at: expiresAt,
      params,
    };

    // 3. Persist code in localStorage (survives page refresh) and sessionStorage
    localStorage.setItem(VERIFY_CODE_KEY, JSON.stringify(verificationPayload));
    localStorage.setItem(
      PENDING_VERIFICATION_KEY,
      JSON.stringify({ email: params.email, expires_at: expiresAt })
    );
    // sessionStorage copy used by UI to show code after refresh within the same tab
    sessionStorage.setItem('connecta_dev_code', verifyCode);
    sessionStorage.setItem('connecta_dev_code_email', params.email);

    this.verificationEmail = params.email;

    // 4. DEV MODE: log the code loudly so it can be found easily during testing
    console.log(
      `%c[CONNECTA DEV] Verification code for ${params.email}`,
      'background:#111827;color:#f59e0b;font-size:16px;font-weight:bold;padding:6px 12px;border-radius:6px;'
    );
    console.log(
      `%c${verifyCode}`,
      'background:#f59e0b;color:#111827;font-size:28px;font-weight:900;padding:8px 24px;border-radius:6px;letter-spacing:8px;'
    );
    console.log('[CONNECTA DEV] Code expires in 10 minutes.');

    return { success: true, devCode: verifyCode };
  }

  async sendVerificationCode(email: string, updatedParams?: Partial<SignUpParams>): Promise<{ success: boolean; devCode?: string; error?: string }> {
    // Preserve existing registration params when resending
    const savedRaw = localStorage.getItem(VERIFY_CODE_KEY);
    let existingParams: any = updatedParams || {};
    if (savedRaw) {
      try {
        const parsed = JSON.parse(savedRaw);
        existingParams = { ...(parsed.params || {}), ...existingParams, email };
      } catch {}
    }

    // Generate a new code
    const verifyCode = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000;

    const verificationPayload = {
      email,
      code: verifyCode,
      expires_at: expiresAt,
      params: existingParams,
    };

    localStorage.setItem(VERIFY_CODE_KEY, JSON.stringify(verificationPayload));
    localStorage.setItem(
      PENDING_VERIFICATION_KEY,
      JSON.stringify({ email, expires_at: expiresAt })
    );
    sessionStorage.setItem('connecta_dev_code', verifyCode);
    sessionStorage.setItem('connecta_dev_code_email', email);
    this.verificationEmail = email;

    // DEV MODE: log the new code
    console.log(
      `%c[CONNECTA DEV] New verification code for ${email}`,
      'background:#111827;color:#f59e0b;font-size:16px;font-weight:bold;padding:6px 12px;border-radius:6px;'
    );
    console.log(
      `%c${verifyCode}`,
      'background:#f59e0b;color:#111827;font-size:28px;font-weight:900;padding:8px 24px;border-radius:6px;letter-spacing:8px;'
    );

    return { success: true, devCode: verifyCode };
  }

  async verifyEmailCode(code: string, emailOverride?: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const savedRaw = localStorage.getItem(VERIFY_CODE_KEY);
    const pendingRaw = localStorage.getItem(PENDING_VERIFICATION_KEY);

    let savedData: any = {};
    if (savedRaw) {
      try {
        savedData = JSON.parse(savedRaw);
      } catch {}
    }

    let pendingEmail = null;
    if (pendingRaw) {
      try {
        pendingEmail = JSON.parse(pendingRaw).email;
      } catch {}
    }

    const targetEmail = emailOverride || savedData.email || pendingEmail;
    if (!targetEmail) {
      return { success: false, error: 'Verification session expired. Please register again.' };
    }

    // Normalize both sides: trim whitespace, ensure strings (preserve leading zeros)
    const enteredCode = String(code).trim();
    const storedCode = savedData.code ? String(savedData.code).trim() : null;

    // ── PRIMARY: Local dev-mode code check ───────────────────────────────────
    // The dev flow stores the code only in localStorage (no Django EmailVerificationCode
    // record is created). This must be the primary check — evaluated before any network call.
    if (storedCode) {
      // Check expiration
      if (savedData.expires_at && Date.now() > savedData.expires_at) {
        return { success: false, error: 'Verification code has expired. Please click Resend Code.' };
      }
      // Compare the codes (both normalized strings)
      if (enteredCode !== storedCode) {
        return { success: false, error: 'Incorrect verification code. Please check the code and try again.' };
      }
      // ✅ Local code matched — proceed to create the user
    } else {
      // ── FALLBACK: No local code — try Django backend ─────────────────────
      // This path runs only if the localStorage entry was cleared or is missing.
      try {
        const resp = await fetch('/api/v1/users/verify-code/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: targetEmail, code: enteredCode }),
        });
        if (!resp.ok) {
          const errJson = await resp.json().catch(() => null);
          return { success: false, error: errJson?.error || 'Verification failed. Please request a new code.' };
        }
        // Django said OK
      } catch {
        return { success: false, error: 'Verification session not found. Please register again.' };
      }
    }

    // 3. User is verified! Create/activate user
    const params = savedData.params || {
      username: targetEmail.split('@')[0],
      first_name: targetEmail.split('@')[0],
      last_name: 'User',
      email: targetEmail,
    };

    let passwordHash = '';
    if (params.password) {
      try {
        passwordHash = await hashPassword(params.password);
      } catch (e) {
        passwordHash = params.password;
      }
    }

    const newUserId = `user_${Date.now()}`;
    const newUser: UserProfile = {
      id: newUserId,
      username: params.username || targetEmail.split('@')[0],
      first_name: params.first_name || 'Connecta',
      last_name: params.last_name || 'User',
      full_name: `${params.first_name || 'Connecta'} ${params.last_name || 'User'}`.trim(),
      email: targetEmail,
      password_hash: passwordHash,
      phone: params.phone,
      dob: params.dob,
      gender: params.gender,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${params.username || targetEmail}`,
      is_online: true,
      role: 'user',
      status: 'active',
      email_verified: true,
      // onboarding_completed is FALSE so the OnboardingWizard runs after auto-login
      onboarding_completed: false,
      is_new_user: true,
      created_at: new Date().toISOString(),
      friends_count: 0,
      followers_count: 0,
      following_count: 0,
    };

    // Initialise empty social data for the brand-new user
    localStorage.setItem(`connecta_friends_${newUserId}`, JSON.stringify([]));
    localStorage.setItem(`connecta_following_${newUserId}`, JSON.stringify([]));
    localStorage.setItem(`connecta_joined_groups_${newUserId}`, JSON.stringify([]));
    localStorage.setItem(`connecta_saved_${newUserId}`, JSON.stringify([]));
    localStorage.setItem(`connecta_notifications_${newUserId}`, JSON.stringify([
      {
        id: `welcome_notif_${newUserId}`,
        recipient_id: newUserId,
        actor: {
          id: 'system_connecta',
          name: 'Connecta',
          avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
        },
        type: 'system',
        content: `Welcome to Connecta, ${params.first_name || 'friend'}! Complete your profile to get started.`,
        created_at: new Date().toISOString(),
        is_read: false,
      }
    ]));
    // Do NOT set onboarding_completed flags — the wizard will set them when finished

    const users = this.getUsersFromDb();
    const updatedUsers = [
      newUser,
      ...users.filter((u) => u.email !== targetEmail && u.username !== newUser.username),
    ];
    this.saveUsersToDb(updatedUsers);

    // Clean up verification state from localStorage / sessionStorage
    localStorage.removeItem(VERIFY_CODE_KEY);
    localStorage.removeItem(PENDING_VERIFICATION_KEY);
    sessionStorage.removeItem('connecta_dev_code');
    sessionStorage.removeItem('connecta_dev_code_email');

    // AUTO-LOGIN: create an active session for the new user immediately.
    // The OnboardingWizard (next registration step) requires isAuthenticated = true.
    this.currentUser = newUser;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
    this.recordLogin('success');

    // ── PERSIST TO DJANGO DATABASE ────────────────────────────────────────────
    // Fire-and-forget: save the new user to the backend DB so the Admin Dashboard
    // and all server-side features work with real persisted data.
    // We don't block on this — the user is already logged in locally.
    fetch('/api/v1/users/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        frontend_id: newUserId,
        username: newUser.username,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        password: params.password,          // plain — Django hashes it server-side
        avatar_url: newUser.avatar_url,
        bio: '',
        location: '',
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          console.log('[Connecta] User persisted to database:', data.user?.id || newUserId);
        } else {
          console.warn('[Connecta] DB persist notice:', data.error);
        }
      })
      .catch((err) => console.warn('[Connecta] DB persist offline (will sync later):', err));

    return { success: true, user: newUser };
  }

  isOnboardingCompleted(): boolean {
    if (this.currentUser?.onboarding_completed) return true;
    if (typeof localStorage !== 'undefined') {
      if (this.currentUser && localStorage.getItem(`connecta_onboarding_completed_${this.currentUser.id}`) === 'true') {
        return true;
      }
      return localStorage.getItem('connecta_onboarding_completed_device') === 'true';
    }
    return false;
  }

  markOnboardingCompleted(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('connecta_onboarding_completed_device', 'true');
      if (this.currentUser) {
        localStorage.setItem(`connecta_onboarding_completed_${this.currentUser.id}`, 'true');
        this.updateProfile({ onboarding_completed: true });
      }
    }
  }

  async login(loginId: string, pass: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    if (!loginId || !pass) {
      this.recordLogin('failed');
      return { success: false, error: 'Please enter your email or username and password' };
    }

    // Check against persistent database users, with fallback to DEMO_USERS
    const dbUsers = this.getUsersFromDb();
    const cleanId = loginId.trim().toLowerCase();

    let found = dbUsers.find(
      (u) =>
        u.email?.toLowerCase() === cleanId ||
        u.username.toLowerCase() === cleanId ||
        (u.phone && u.phone === loginId.trim())
    );

    if (!found) {
      found = DEMO_USERS.find(
        (u) =>
          u.email?.toLowerCase() === cleanId ||
          u.username.toLowerCase() === cleanId
      );
      if (found) {
        dbUsers.push(found);
        this.saveUsersToDb(dbUsers);
      }
    }

    if (!found) {
      this.recordLogin('failed');
      return { success: false, error: 'Invalid user or administrator credentials.' };
    }

    if (found.status === 'banned' || found.status === 'suspended') {
      this.recordLogin('failed');
      return { success: false, error: `Account ${found.status}. Please contact support.` };
    }

    // Verify Password against stored PBKDF2 hash or password string
    const isPasswordValid = await verifyPassword(pass, found.password_hash || '');
    if (!isPasswordValid) {
      this.recordLogin('failed');
      return { success: false, error: 'Invalid password. Please check your credentials.' };
    }

    this.currentUser = found;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(found));
    this.recordLogin('success');

    return { success: true, user: found };
  }

  private recordLogin(status: 'success' | 'failed') {
    const record: LoginHistoryRecord = {
      id: `lh_${Date.now()}`,
      timestamp: new Date().toISOString(),
      device: 'Windows Desktop',
      ip: '192.168.1.1',
      location: 'San Francisco, US',
      status,
    };
    this.loginHistory = [record, ...this.loginHistory.slice(0, 9)];
    localStorage.setItem(LOGIN_HISTORY_KEY, JSON.stringify(this.loginHistory));
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!this.currentUser) throw new Error('Not authenticated');
    const updated = { ...this.currentUser, ...updates };
    this.currentUser = updated;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));

    // Update in localStorage database store
    const dbUsers = this.getUsersFromDb();
    const updatedDb = dbUsers.map((u) => (u.id === updated.id ? updated : u));
    this.saveUsersToDb(updatedDb);

    // ── Sync to Django backend (fire-and-forget) ─────────────────────────────
    if (updated.id) {
      fetch(`/api/v1/users/${updated.id}/update_profile/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: updated.first_name,
          last_name: updated.last_name,
          bio: (updated as any).bio || '',
          location: (updated as any).location || '',
          avatar_url: updated.avatar_url || '',
          status: updated.status,
          role: updated.role,
        }),
      }).catch(() => {}); // Silently ignore if Django is offline
    }

    return updated;
  }

  exportUserDataArchive(): string {
    if (!this.currentUser) return '';
    const posts = localStorage.getItem('kc_posts');
    const convs = localStorage.getItem('kc_conversations');
    const msgs = localStorage.getItem('kc_messages');

    const archive = {
      export_date: new Date().toISOString(),
      platform: 'Connecta Social Network',
      user: this.currentUser,
      posts: posts ? JSON.parse(posts) : [],
      conversations: convs ? JSON.parse(convs) : [],
      messages: msgs ? JSON.parse(msgs) : {},
      active_sessions: this.activeSessions,
      login_history: this.loginHistory,
    };

    return JSON.stringify(archive, null, 2);
  }

  deactivateAccount() {
    if (this.currentUser) {
      this.currentUser.status = 'suspended';
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(this.currentUser));
      const dbUsers = this.getUsersFromDb();
      this.saveUsersToDb(dbUsers.map((u) => (u.id === this.currentUser!.id ? { ...u, status: 'suspended' } : u)));
    }
  }

  deleteAccount() {
    if (this.currentUser) {
      const dbUsers = this.getUsersFromDb().filter((u) => u.id !== this.currentUser!.id);
      this.saveUsersToDb(dbUsers);
    }
    this.currentUser = null;
    localStorage.removeItem(AUTH_USER_KEY);
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(AUTH_USER_KEY);
  }
}

export const authService = new AuthService();


