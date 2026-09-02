import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/social';
import { authService, SignUpParams } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarding: boolean;
  setIsOnboarding: (val: boolean) => void;
  pendingVerificationEmail: string | null;
  signup: (params: SignUpParams) => Promise<{ success: boolean; error?: string }>;
  verifyEmailCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  login: (loginId: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  const signup = async (params: SignUpParams) => {
    setIsLoading(true);
    const res = await authService.signUp(params);
    if (res.success) {
      setPendingVerificationEmail(params.email);
    }
    setIsLoading(false);
    return res;
  };

  const verifyEmailCode = async (code: string) => {
    setIsLoading(true);
    const res = await authService.verifyEmailCode(code);
    if (res.success && res.user) {
      setUser(res.user);
      setIsOnboarding(true);
    }
    setIsLoading(false);
    return res;
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
        pendingVerificationEmail,
        signup,
        verifyEmailCode,
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
