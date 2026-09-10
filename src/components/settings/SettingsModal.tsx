import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTheme } from '../../context/ThemeContext';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
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
  AlertTriangle
} from 'lucide-react';
import { clsx } from 'clsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
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

  const [activeTab, setActiveTab] = useState<'account' | 'privacy' | 'notifications' | 'security' | 'blocking' | 'appearance'>('account');

  // Account tab states
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Security tab 2FA modal state
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFAError, setTwoFAError] = useState('');

  // Privacy toggles
  const [readReceipts, setReadReceipts] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [defaultPostPrivacy, setDefaultPostPrivacy] = useState<'public' | 'friends' | 'only_me'>('public');

  // Notification toggles
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);

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

  const handleConfirm2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFACode === '123456' || twoFACode.length === 6) {
      toggle2FA(true);
      setIs2FAModalOpen(false);
      setTwoFACode('');
      setTwoFAError('');
    } else {
      setTwoFAError('Invalid 6-digit OTP. Use 123456 for test verification.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connecta Account & Settings" maxWidth="xl">
      <div className="flex flex-col sm:flex-row gap-4 min-h-[420px]">
        {/* Sidebar Tabs */}
        <div className="w-full sm:w-48 flex sm:flex-col gap-1 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 pb-2 sm:pb-0 sm:pr-2">
          <button
            onClick={() => setActiveTab('account')}
            className={clsx(
              'flex-1 sm:flex-initial flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors',
              activeTab === 'account' ? 'bg-[#2563EB]/10 text-[#2563EB] font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <User className="w-4 h-4" />
            <span>Account</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={clsx(
              'flex-1 sm:flex-initial flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors',
              activeTab === 'privacy' ? 'bg-[#2563EB]/10 text-[#2563EB] font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <Shield className="w-4 h-4" />
            <span>Privacy</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={clsx(
              'flex-1 sm:flex-initial flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors',
              activeTab === 'notifications' ? 'bg-[#2563EB]/10 text-[#2563EB] font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={clsx(
              'flex-1 sm:flex-initial flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors',
              activeTab === 'security' ? 'bg-[#2563EB]/10 text-[#2563EB] font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <Lock className="w-4 h-4" />
            <span>Security & 2FA</span>
          </button>

          <button
            onClick={() => setActiveTab('blocking')}
            className={clsx(
              'flex-1 sm:flex-initial flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors',
              activeTab === 'blocking' ? 'bg-[#2563EB]/10 text-[#2563EB] font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <Shield className="w-4 h-4" />
            <span>Blocking</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={clsx(
              'flex-1 sm:flex-initial flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors',
              activeTab === 'appearance' ? 'bg-[#2563EB]/10 text-[#2563EB] font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <Moon className="w-4 h-4" />
            <span>Appearance</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 space-y-4 pt-1 overflow-y-auto max-h-[500px] pr-1">
          
          {/* 1. ACCOUNT TAB */}
          {activeTab === 'account' && (
            <div className="space-y-5 animate-fade-in text-xs">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Account Information</h4>
                <p className="text-slate-500 dark:text-slate-400">View and manage your core identity details.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Full Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">{user?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Username</span>
                  <span className="font-bold text-slate-900 dark:text-white">@{user?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email</span>
                  <span className="font-bold text-slate-900 dark:text-white">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Role</span>
                  <span className="font-bold uppercase tracking-wider text-[#2563EB]">{user?.role || 'user'}</span>
                </div>
              </div>

              {/* Data Export Archive */}
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
                <div className="flex items-center gap-2 text-[#2563EB] font-bold">
                  <Download className="w-4 h-4" />
                  <span>Download Your Connecta Data Archive</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Request a complete JSON copy of your profile, posts, messages, and account history.
                </p>
                <Button variant="outline" size="sm" onClick={handleDownloadArchive} leftIcon={<Download className="w-3.5 h-3.5" />}>
                  Export Data JSON
                </Button>
                {downloadSuccess && (
                  <p className="text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Archive downloaded successfully!
                  </p>
                )}
              </div>

              {/* Account Actions */}
              <div className="pt-2 space-y-2 border-t border-slate-200 dark:border-slate-800">
                <h5 className="font-bold text-slate-900 dark:text-white text-xs">Account Status Management</h5>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => deactivateAccount()}>
                    Deactivate Account
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setIsDeleting(true)} leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
                    Permanently Delete Account
                  </Button>
                </div>
              </div>

              {/* Permanent Delete Confirmation Dialog */}
              {isDeleting && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 space-y-3">
                  <div className="flex items-center gap-2 text-rose-600 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Are you absolutely sure?</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    This action is permanent. All your posts, photos, messages, and settings will be permanently wiped.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsDeleting(false)}>
                      Cancel
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => deleteAccount()}>
                      Yes, Delete My Account
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. PRIVACY TAB */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Privacy Controls</h4>
                <p className="text-slate-500 dark:text-slate-400">Manage who can see your activity and interact with you.</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">Default Post Audience</h5>
                    <p className="text-slate-500">Who can see your new posts by default</p>
                  </div>
                  <select
                    value={defaultPostPrivacy}
                    onChange={(e) => setDefaultPostPrivacy(e.target.value as any)}
                    className="py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white"
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="only_me">Only Me</option>
                  </select>
                </div>

                <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">Online Status Indicator</h5>
                    <p className="text-slate-500">Show friends when you are active on Connecta</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={onlineStatus}
                    onChange={(e) => setOnlineStatus(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2563EB]"
                  />
                </div>

                <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">Message Read Receipts</h5>
                    <p className="text-slate-500">Allow contacts to see when you've read their messages</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={readReceipts}
                    onChange={(e) => setReadReceipts(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2563EB]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Notification Preferences</h4>
                <p className="text-slate-500 dark:text-slate-400">Choose how and when you want to receive alerts.</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">In-App Push Notifications</h5>
                    <p className="text-slate-500">Receive instant popups for reactions, comments, and messages</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushNotifs}
                    onChange={(e) => setPushNotifs(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2563EB]"
                  />
                </div>

                <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">Email Digest & Alerts</h5>
                    <p className="text-slate-500">Send email updates for important security & social activity</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2563EB]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. SECURITY & 2FA TAB */}
          {activeTab === 'security' && (
            <div className="space-y-5 animate-fade-in text-xs">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Account Security & 2FA</h4>
                <p className="text-slate-500 dark:text-slate-400">Protect your account with multi-factor authentication & session logs.</p>
              </div>

              {/* 2FA Toggle Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-[#2563EB]" />
                    Two-Factor Authentication (2FA)
                  </h5>
                  <p className="text-slate-500">
                    Status: <strong className={is2FAEnabled ? 'text-emerald-500' : 'text-amber-500'}>{is2FAEnabled ? 'ENABLED' : 'DISABLED'}</strong>
                  </p>
                </div>
                {is2FAEnabled ? (
                  <Button variant="outline" size="sm" onClick={() => toggle2FA(false)}>
                    Disable 2FA
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" onClick={() => setIs2FAModalOpen(true)}>
                    Enable 2FA
                  </Button>
                )}
              </div>

              {/* Active Sessions */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-emerald-500" />
                    Active Logged-In Sessions ({activeSessions.length})
                  </h5>
                  <button onClick={logoutAllOtherDevices} className="text-[#2563EB] font-bold hover:underline">
                    Logout Other Devices
                  </button>
                </div>
                {activeSessions.map((s) => (
                  <div key={s.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{s.device} ({s.browser})</p>
                      <p className="text-[10px] text-slate-400">IP: {s.ip} • {s.location}</p>
                    </div>
                    {s.isCurrent && <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold text-[10px]">CURRENT DEVICE</span>}
                  </div>
                ))}
              </div>

              {/* Login History */}
              <div className="space-y-2">
                <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <History className="w-4 h-4 text-purple-500" />
                  Recent Login History
                </h5>
                <div className="space-y-1">
                  {loginHistory.map((l) => (
                    <div key={l.id} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 flex justify-between text-[11px]">
                      <span>{l.device} • {l.ip} ({l.location})</span>
                      <span className={l.status === 'success' ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                        {l.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button variant="danger" className="w-full" leftIcon={<LogOut className="w-4 h-4" />} onClick={logout}>
                  Sign Out of Connecta
                </Button>
              </div>
            </div>
          )}

          {/* 5. BLOCKING TAB */}
          {activeTab === 'blocking' && (
            <div className="space-y-4 animate-fade-in text-xs font-medium">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Blocked Accounts</h4>
                <p className="text-slate-500 dark:text-slate-400">Manage users you have blocked from interacting with you.</p>
              </div>
              {blockedUsers.length === 0 ? (
                <p className="text-slate-400 italic">No blocked users</p>
              ) : (
                blockedUsers.map((id) => (
                  <div key={id} className="flex justify-between items-center p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                    <span>Blocked User ({id})</span>
                    <button onClick={() => toggleBlockUser(id)} className="text-[#2563EB] font-bold hover:underline">
                      Unblock
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 6. APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Theme & UI Preference</h4>
                <p className="text-slate-500 dark:text-slate-400">Switch between light mode, dark mode, or follow system theme.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-xs font-semibold transition-all ${theme === 'light' ? 'border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB] ring-2 ring-[#2563EB]' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                >
                  <Sun className="w-6 h-6" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-xs font-semibold transition-all ${theme === 'dark' ? 'border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB] ring-2 ring-[#2563EB]' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                >
                  <Moon className="w-6 h-6" />
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-xs font-semibold transition-all ${theme === 'system' ? 'border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB] ring-2 ring-[#2563EB]' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                >
                  <Monitor className="w-6 h-6" />
                  <span>System</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 2FA SETUP / OTP VERIFICATION MODAL */}
      <Modal isOpen={is2FAModalOpen} onClose={() => setIs2FAModalOpen(false)} title="Enable 2-Factor Authentication">
        <form onSubmit={handleConfirm2FA} className="space-y-4 text-center text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Enter the 6-digit OTP code sent to your registered email or authenticator app.
          </p>

          {twoFAError && (
            <div className="p-2 text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/60 rounded-xl">
              {twoFAError}
            </div>
          )}

          <input
            type="text"
            maxLength={6}
            placeholder="123456"
            value={twoFACode}
            onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
            className="w-44 text-center text-2xl font-mono tracking-widest py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            autoFocus
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIs2FAModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Verify & Enable 2FA
            </Button>
          </div>
        </form>
      </Modal>
    </Modal>
  );
};

