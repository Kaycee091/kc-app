import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import {
  Shield,
  Bell,
  Moon,
  Lock,
  LogOut,
  Sun,
  Monitor,
  User,
  Download,
  Trash2,
  KeyRound,
  CheckCircle2,
  Laptop,
  History,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { clsx } from 'clsx';
import { router } from '../../router';

interface SettingsPageProps {
  subtab?: string;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ subtab }) => {
  const { theme, setTheme } = useTheme();
  const { blockedUsers, toggleBlockUser } = useSocial();
  const {
    user,
    logout,
    is2FAEnabled,
    toggle2FA,
    activeSessions,
    logoutAllOtherDevices,
    loginHistory,
    exportUserDataArchive,
    deactivateAccount,
    deleteAccount,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'account' | 'privacy' | 'notifications' | 'security' | 'blocking' | 'appearance'>(
    (subtab as any) || 'account'
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [readReceipts, setReadReceipts] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  const handleDownloadArchive = () => {
    const dataStr = exportUserDataArchive();
    if (!dataStr) return;
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `connecta_data_archive_${user?.username || 'user'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.navigate('/feed')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Account & System Settings</h1>
            <p className="text-xs text-slate-500">Manage identity, security, notifications, and preferences.</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-6">
        {/* Navigation Subtabs */}
        <div className="w-full sm:w-56 flex sm:flex-col gap-1 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700 pb-3 sm:pb-0 sm:pr-4">
          {[
            { id: 'account', label: 'Account Identity', icon: <User className="w-4 h-4" /> },
            { id: 'privacy', label: 'Privacy Controls', icon: <Shield className="w-4 h-4" /> },
            { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
            { id: 'security', label: 'Security & 2FA', icon: <Lock className="w-4 h-4" /> },
            { id: 'blocking', label: 'Blocked Accounts', icon: <Shield className="w-4 h-4" /> },
            { id: 'appearance', label: 'Appearance', icon: <Moon className="w-4 h-4" /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                router.navigate(`/settings/${item.id}`);
              }}
              className={clsx(
                'flex items-center gap-3 px-3 py-3 rounded-2xl text-xs font-bold text-left transition-all',
                activeTab === item.id
                  ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 space-y-5 text-xs">
          {activeTab === 'account' && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Account Information</h3>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 space-y-2 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between"><span className="text-slate-500">Full Name</span><span className="font-bold text-slate-900 dark:text-white">{user?.full_name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Username</span><span className="font-bold text-slate-900 dark:text-white">@{user?.username}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Email Address</span><span className="font-bold text-slate-900 dark:text-white">{user?.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Role</span><span className="font-extrabold uppercase text-[#2563EB]">{user?.role || 'user'}</span></div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
                <h4 className="font-bold text-[#2563EB] flex items-center gap-1.5"><Download className="w-4 h-4" /> Connecta Data Export Archive</h4>
                <p className="text-slate-600 dark:text-slate-300">Download a complete JSON record of all your posts, profile details, and conversations.</p>
                <Button size="sm" variant="outline" onClick={handleDownloadArchive}>Download JSON</Button>
                {downloadSuccess && <p className="text-emerald-500 font-bold">Archive downloaded!</p>}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
                <Button variant="danger" size="sm" onClick={() => setIsDeleting(true)} leftIcon={<Trash2 className="w-4 h-4" />}>
                  Permanently Delete Account
                </Button>
              </div>

              {isDeleting && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 space-y-3">
                  <p className="font-bold text-rose-600">Are you sure? This will wipe your account permanently.</p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsDeleting(false)}>Cancel</Button>
                    <Button variant="danger" size="sm" onClick={deleteAccount}>Yes, Delete My Account</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Privacy Controls</h3>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 flex justify-between items-center border border-slate-200 dark:border-slate-700">
                <div><h5 className="font-bold text-slate-900 dark:text-white">Online Presence Indicator</h5><p className="text-slate-500">Show friends when you are active</p></div>
                <input type="checkbox" checked={onlineStatus} onChange={(e) => setOnlineStatus(e.target.checked)} className="w-4 h-4 rounded text-[#2563EB]" />
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Theme & Display</h3>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => setTheme('light')} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 font-bold ${theme === 'light' ? 'border-[#2563EB] text-[#2563EB]' : 'text-slate-500'}`}><Sun className="w-6 h-6" />Light</button>
                <button onClick={() => setTheme('dark')} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 font-bold ${theme === 'dark' ? 'border-[#2563EB] text-[#2563EB]' : 'text-slate-500'}`}><Moon className="w-6 h-6" />Dark</button>
                <button onClick={() => setTheme('system')} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 font-bold ${theme === 'system' ? 'border-[#2563EB] text-[#2563EB]' : 'text-slate-500'}`}><Monitor className="w-6 h-6" />System</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
