import { UserProfile } from '../types/social';
import { AdminRole } from '../types/admin';
import { supabase } from './supabaseClient';
import { DEMO_USERS } from './mockSocialData';
import { realtimeEngine } from './realtimeService';
import { verifyPassword } from '../utils/crypto';

const AUTH_USER_KEY = 'connecta_auth_user';
const VERIFY_CODE_KEY = 'connecta_verify_code';
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
      this.currentUser = DEMO_USERS[0];
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
        const users = this.getUsersFromDb();
        this.currentUser = users[0] || DEMO_USERS[0];
      }
    } else {
      const users = this.getUsersFromDb();
      this.currentUser = users[0] || DEMO_USERS[0];
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
      // Migrate/Sync admin user record to ensure correct single super_admin
      let adminIndex = users.findIndex(
        (u) =>
          u.id === 'user_alex' ||
          u.email?.toLowerCase() === 'asogwakenechukwu284@gmail.com' ||
          u.username.toLowerCase() === 'humble' ||
          u.email?.toLowerCase() === 'alex@connecta.app'
      );

      const targetAdmin = DEMO_USERS[0];

      if (adminIndex !== -1) {
        users[adminIndex] = {
          ...users[adminIndex],
          id: targetAdmin.id,
          username: targetAdmin.username,
          first_name: targetAdmin.first_name,
          last_name: targetAdmin.last_name,
          full_name: targetAdmin.full_name,
          email: targetAdmin.email,
          role: 'super_admin',
          status: 'active',
          password_hash: targetAdmin.password_hash,
          is_active: true,
          is_staff: true,
          is_superuser: true,
        };
      } else {
        users.unshift(targetAdmin);
      }

      // Remove any duplicate admin entries if any exist
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

  async signUp(params: SignUpParams): Promise<{ success: boolean; error?: string }> {
    // 1. Backend validation
    if (!params.first_name || !params.last_name || !params.username || !params.email || !params.password) {
      return { success: false, error: 'All required fields must be provided' };
    }
    if (params.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const existingUsers = this.getUsersFromDb();
    if (existingUsers.some((u) => u.email?.toLowerCase() === params.email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists' };
    }
    if (existingUsers.some((u) => u.username.toLowerCase() === params.username.toLowerCase())) {
      return { success: false, error: 'Username is already taken' };
    }

    // 2. Generate 6-digit verification code
    const verifyCode = '123456';
    localStorage.setItem(VERIFY_CODE_KEY, JSON.stringify({ email: params.email, code: verifyCode, params }));
    this.verificationEmail = params.email;

    return { success: true };
  }

  async verifyEmailCode(code: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const saved = localStorage.getItem(VERIFY_CODE_KEY);
    if (!saved) return { success: false, error: 'Verification session expired. Please sign up again.' };

    const { code: expectedCode, params } = JSON.parse(saved);

    if (code !== expectedCode && code !== '123456') {
      return { success: false, error: 'Invalid verification code. Use 123456 for testing.' };
    }

    // 3. Create persistent User Profile in DB
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      username: params.username,
      first_name: params.first_name,
      last_name: params.last_name,
      full_name: `${params.first_name} ${params.last_name}`,
      email: params.email,
      phone: params.phone,
      dob: params.dob,
      gender: params.gender,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${params.username}`,
      is_online: true,
      role: 'user',
      status: 'active',
      created_at: new Date().toISOString(),
    };

    const users = this.getUsersFromDb();
    const updatedUsers = [newUser, ...users];
    this.saveUsersToDb(updatedUsers);

    this.currentUser = newUser;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
    localStorage.removeItem(VERIFY_CODE_KEY);

    this.recordLogin('success');

    return { success: true, user: newUser };
  }

  async login(loginId: string, pass: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    if (!loginId || !pass) {
      this.recordLogin('failed');
      return { success: false, error: 'Please enter your email or username and password' };
    }

    // Check against persistent database users
    const dbUsers = this.getUsersFromDb();
    const cleanId = loginId.trim().toLowerCase();

    const found = dbUsers.find(
      (u) =>
        u.email?.toLowerCase() === cleanId ||
        u.username.toLowerCase() === cleanId ||
        (u.phone && u.phone === loginId.trim())
    );

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

    // Update in database store
    const dbUsers = this.getUsersFromDb();
    const updatedDb = dbUsers.map((u) => (u.id === updated.id ? updated : u));
    this.saveUsersToDb(updatedDb);

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


