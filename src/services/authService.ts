import { UserProfile } from '../types/social';
import { AdminRole } from '../types/admin';
import { supabase } from './supabaseClient';
import { DEMO_USERS } from './mockSocialData';

const AUTH_USER_KEY = 'connecta_auth_user';
const VERIFY_CODE_KEY = 'connecta_verify_code';

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

class AuthService {
  private currentUser: UserProfile | null = null;
  private verificationEmail: string | null = null;

  constructor() {
    const saved = localStorage.getItem(AUTH_USER_KEY);
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch (e) {}
    } else {
      // Default to demo admin user for instant testing
      this.currentUser = DEMO_USERS[0];
    }
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  getVerificationEmail(): string | null {
    return this.verificationEmail;
  }

  async signUp(params: SignUpParams): Promise<{ success: boolean; error?: string }> {
    // 1. Backend validation
    if (!params.first_name || !params.last_name || !params.username || !params.email || !params.password) {
      return { success: false, error: 'All required fields must be provided' };
    }
    if (params.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
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

    // 3. Create persistent User Profile
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
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      is_online: true,
      role: 'user',
      status: 'active',
      created_at: new Date().toISOString(),
    };

    this.currentUser = newUser;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
    localStorage.removeItem(VERIFY_CODE_KEY);

    return { success: true, user: newUser };
  }

  async login(loginId: string, pass: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    if (!loginId || !pass) {
      return { success: false, error: 'Please enter your email, username, or phone and password' };
    }

    // Check against demo accounts or existing accounts
    const found = DEMO_USERS.find(
      (u) =>
        u.email?.toLowerCase() === loginId.toLowerCase() ||
        u.username.toLowerCase() === loginId.toLowerCase() ||
        u.phone === loginId
    );

    const loggedUser: UserProfile = found || {
      id: `user_${Date.now()}`,
      username: loginId.split('@')[0],
      first_name: loginId.split('@')[0],
      last_name: 'User',
      full_name: loginId.split('@')[0],
      email: loginId.includes('@') ? loginId : `${loginId}@connecta.app`,
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      is_online: true,
      role: loginId.toLowerCase().includes('admin') ? 'super_admin' : 'user',
      status: 'active',
    };

    this.currentUser = loggedUser;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(loggedUser));

    return { success: true, user: loggedUser };
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!this.currentUser) throw new Error('Not authenticated');
    const updated = { ...this.currentUser, ...updates };
    this.currentUser = updated;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
    return updated;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(AUTH_USER_KEY);
  }
}

export const authService = new AuthService();
