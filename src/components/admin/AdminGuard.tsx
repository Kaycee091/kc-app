import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

interface AdminGuardProps {
  children: React.ReactNode;
  onRedirectUser: () => void;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children, onRedirectUser }) => {
  const { user, isAuthenticated } = useAuth();

  const userRole = user?.role || 'user';
  const isAdminAuthorized = isAuthenticated && userRole !== 'user';

  if (!isAdminAuthorized) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#F0F2F5] dark:bg-[#0F172A] text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto mb-4 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Access Restricted</h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
          The Connecta Admin Panel requires an authorized administrator role. You are currently logged in as a standard user account.
        </p>
        <Button
          variant="primary"
          onClick={onRedirectUser}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Return to Connecta Social Feed
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};
