import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/social';
import { authService, SignUpParams, UserSession, LoginHistoryRecord } from '../services/authService';
import { realtimeEngine } from '../services/realtimeService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarding: boolean;
  setIsOnboarding: (val: boolean) => void;
  isOnboardingCompleted: boolean;
  markOnboardingCompleted: () => void;
  pendingVerificationEmail: string | null;
  is2FAEnabled: boolean;
  toggle2FA: (enabled: boolean) => void;
  activeSessions: UserSession[];
  logoutAllOtherDevices: () => void;
  loginHistory: LoginHistoryRecord[];
  exportUserDataArchive: () => string;
  deactivateAccount: () => void;
  deleteAccount: () => void;
  signup: (params: SignUpParams) => Promise<{ success: boolean; devCode?: string; error?: string }>;
  verifyEmailCode: (code: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  sendVerificationCode: (email: string) => Promise<{ success: boolean; devCode?: string; error?: string }>;
  login: (loginId: string, pass: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(() => authService.isOnboardingCompleted());
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(() => authService.get2FAStatus());
  const [activeSessions, setActiveSessions] = useState<UserSession[]>(() => authService.getActiveSessions());
  const [loginHistory] = useState<LoginHistoryRecord[]>(() => authService.getLoginHistory());

  useEffect(() => {
    const unsubStatus = realtimeEngine.subscribe('admin_user_status_change', ({ userId, status }) => {
      if (user && user.id === userId) {
        setUser((prev) => (prev ? { ...prev, status } : null));
      }
    });

    const unsubRole = realtimeEngine.subscribe('admin_user_role_change', ({ userId, role }) => {
      if (user && user.id === userId) {
        setUser((prev) => (prev ? { ...prev, role } : null));
      }
    });

    return () => {
      unsubStatus();
      unsubRole();
    };
  }, [user]);

  const handleToggle2FA = (enabled: boolean) => {
    const updated = authService.toggle2FA(enabled);
    setIs2FAEnabled(updated);
  };

  const handleLogoutAllOtherDevices = () => {
    authService.logoutAllOtherDevices();
    setActiveSessions(authService.getActiveSessions());
  };

  const handleExportData = () => {
    return authService.exportUserDataArchive();
  };

  const handleDeactivateAccount = () => {
    authService.deactivateAccount();
    setUser(null);
  };

  const handleDeleteAccount = () => {
    authService.deleteAccount();
    setUser(null);
  };

  const signup = async (params: SignUpParams) => {
    const res = await authService.signUp(params);
    if (res.success) {
      setPendingVerificationEmail(params.email);
    }
    return res; // includes devCode when success
  };

  const verifyEmailCode = async (code: string, email?: string) => {
    const res = await authService.verifyEmailCode(code, email);
    if (res.success && res.user) {
      // Auto-login: set user in React state so isAuthenticated becomes true
      setUser(res.user);
      // Trigger the OnboardingWizard — the next step of the registration flow
      setIsOnboarding(true);
    }
    return res;
  };

  const sendVerificationCode = async (email: string) => {
    const res = await authService.sendVerificationCode(email);
    return res; // includes devCode
  };

  const login = async (loginId: string, pass: string) => {
    setIsLoading(true);
    const res = await authService.login(loginId, pass);
    if (res.success && res.user) {
      setUser(res.user);
    }
    setIsLoading(false);
    return res;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const updated = await authService.updateProfile(updates);
      setUser(updated);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to update profile' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isOnboarding,
        setIsOnboarding,
        isOnboardingCompleted,
        markOnboardingCompleted: () => {
          authService.markOnboardingCompleted();
          setIsOnboardingCompleted(true);
        },
        pendingVerificationEmail,
        is2FAEnabled,
        toggle2FA: handleToggle2FA,
        activeSessions,
        logoutAllOtherDevices: handleLogoutAllOtherDevices,
        loginHistory,
        exportUserDataArchive: handleExportData,
        deactivateAccount: handleDeactivateAccount,
        deleteAccount: handleDeleteAccount,
        signup,
        verifyEmailCode,
        sendVerificationCode,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

