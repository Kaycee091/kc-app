import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
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
  AlertTriangle,
  ArrowLeft,
  HelpCircle,
  FileText,
  Ban,
  Camera,
  Check,
  Globe,
  Mail,
  Phone,
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
    updateProfile,
    is2FAEnabled,
    toggle2FA,
    activeSessions,
    logoutAllOtherDevices,
    exportUserDataArchive,
    deactivateAccount,
    deleteAccount,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'profile' | 'account' | 'privacy' | 'security' | 'notifications' | 'appearance' | 'blocking' | 'help'
  >((subtab as any) || 'profile');

  useEffect(() => {
    if (subtab && ['profile', 'account', 'privacy', 'security', 'notifications', 'appearance', 'blocking', 'help'].includes(subtab)) {
      setActiveTab(subtab as any);
    }
  }, [subtab]);

  // Profile Edit State
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Privacy toggles
  const [friendRequestsPrivacy, setFriendRequestsPrivacy] = useState<'everyone' | 'friends_of_friends'>('everyone');
  const [postVisibility, setPostVisibility] = useState<'public' | 'friends' | 'only_me'>('public');
  const [onlineStatus, setOnlineStatus] = useState(true);

  // Notification toggles
  const [notifRequests, setNotifRequests] = useState(true);
  const [notifComments, setNotifComments] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifEvents, setNotifEvents] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);

  // Modals
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`.trim(),
      bio,
      location,
      website,
    });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (!currentPassword || !newPassword) {
      setPasswordMsg({ type: 'error', text: 'All password fields are required.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setPasswordMsg({ type: 'success', text: 'Password successfully updated.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMsg(null), 4000);
  };

  const handleDownloadArchive = () => {
    const dataStr = exportUserDataArchive();
    if (!dataStr) return;
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `connecta_archive_${user?.username || 'user'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const navItems = [
    { id: 'profile', label: 'Edit Profile', icon: <User className="w-4 h-4" /> },
    { id: 'account', label: 'Account', icon: <Mail className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" /> },
    { id: 'security', label: 'Security & 2FA', icon: <Lock className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Moon className="w-4 h-4" /> },
    { id: 'blocking', label: 'Blocked Accounts', icon: <Ban className="w-4 h-4" /> },
    { id: 'help', label: 'Help & Support', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.navigate('/feed')}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Settings & Preferences</h1>
            <p className="text-xs text-slate-500">Manage identity, privacy, security, theme, and system rules</p>
          </div>
        </div>

        {/* Global Logout Shortcut */}
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-700/80 flex flex-col md:flex-row gap-6">
        {/* Navigation Tabs List */}
        <div className="w-full md:w-56 flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 md:border-r border-slate-200 dark:border-slate-700 md:pr-4 flex-shrink-0">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                router.navigate(`/settings/${item.id}`);
              }}
              className={clsx(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold text-left whitespace-nowrap transition-all',
                activeTab === item.id
                  ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 space-y-6 text-xs min-w-0">
          {/* ============================================================= */}
          {/* 1. PROFILE SETTINGS                                           */}
          {/* ============================================================= */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 animate-fade-in">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Profile Information</h3>

              {profileSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Bio / About You</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio with your friends and community..."
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                />
                <Input
                  label="Website / Link"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourlink.com"
                />
              </div>

              <Button type="submit" variant="primary" size="sm">
                Save Profile Changes
              </Button>
            </form>
          )}

          {/* ============================================================= */}
          {/* 2. ACCOUNT SETTINGS                                           */}
          {/* ============================================================= */}
          {activeTab === 'account' && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Account Details</h3>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 space-y-2.5 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center"><span className="text-slate-500">Username</span><span className="font-bold text-slate-900 dark:text-white">@{user?.username}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-500">Registered Email</span><span className="font-bold text-slate-900 dark:text-white">{user?.email}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-500">Account Status</span><span className="font-extrabold uppercase text-emerald-500">{user?.status || 'active'}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-500">Platform Role</span><span className="font-extrabold uppercase text-[#2563EB]">{user?.role || 'user'}</span></div>
              </div>

              {/* Data Archive */}
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
                <h4 className="font-bold text-[#2563EB] flex items-center gap-1.5">
                  <Download className="w-4 h-4" /> Download My Information Archive
                </h4>
                <p className="text-slate-600 dark:text-slate-300">
                  Export a comprehensive JSON snapshot of your Connecta posts, messages, and profile relationships.
                </p>
                <Button size="sm" variant="outline" onClick={handleDownloadArchive}>
                  Download Data Archive
                </Button>
                {downloadSuccess && <p className="text-emerald-500 font-bold">Archive downloaded!</p>}
              </div>

              {/* Danger Zone */}
              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-3">
                <h4 className="font-bold text-rose-600 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Danger Zone
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsDeactivateModalOpen(true)}>
                    Deactivate Account
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setIsDeleteModalOpen(true)} leftIcon={<Trash2 className="w-4 h-4" />}>
                    Permanently Delete Account
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* 3. PRIVACY SETTINGS                                           */}
          {/* ============================================================= */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Privacy Controls</h3>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 space-y-3 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">Who can send friend requests</h5>
                    <p className="text-slate-500">Control who can discover and add you as a friend</p>
                  </div>
                  <select
                    value={friendRequestsPrivacy}
                    onChange={(e) => setFriendRequestsPrivacy(e.target.value as any)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="friends_of_friends">Friends of Friends</option>
                  </select>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">Default Post Visibility</h5>
                    <p className="text-slate-500">Default audience for newly published posts</p>
                  </div>
                  <select
                    value={postVisibility}
                    onChange={(e) => setPostVisibility(e.target.value as any)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="only_me">Only Me</option>
                  </select>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">Active Online Status</h5>
                    <p className="text-slate-500">Show friends and contacts when you are online</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={onlineStatus}
                    onChange={(e) => setOnlineStatus(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2563EB]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* 4. SECURITY & 2FA SETTINGS                                    */}
          {/* ============================================================= */}
          {activeTab === 'security' && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Security & Passwords</h3>

              {/* Change Password Form */}
              <form onSubmit={handleChangePassword} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-[#2563EB]" /> Change Password
                </h4>

                {passwordMsg && (
                  <div className={`p-2.5 rounded-xl text-xs font-semibold ${passwordMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'}`}>
                    {passwordMsg.text}
                  </div>
                )}

                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <Button type="submit" size="sm" variant="primary">Update Password</Button>
              </form>

              {/* 2FA Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</h5>
                  <p className="text-slate-500">Require an authorization code upon sign-in from unknown devices</p>
                </div>
                <input
                  type="checkbox"
                  checked={is2FAEnabled}
                  onChange={(e) => toggle2FA(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2563EB]"
                />
              </div>

              {/* Active Sessions */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">Active Sessions & Devices</h5>
                    <p className="text-slate-500">{activeSessions.length} active devices connected</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={logoutAllOtherDevices}>
                    Log Out Other Sessions
                  </Button>
                </div>
                <div className="space-y-2 pt-2">
                  {activeSessions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{s.device} {s.isCurrent && <span className="text-[#2563EB] text-[10px] font-extrabold">(This Device)</span>}</p>
                          <p className="text-[10px] text-slate-500">{s.location} • {s.ip}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">{s.lastActive}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* 5. NOTIFICATION SETTINGS                                      */}
          {/* ============================================================= */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Notification Preferences</h3>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3 divide-y divide-slate-200 dark:divide-slate-800">
                <div className="flex justify-between items-center pt-2 first:pt-0">
                  <div><p className="font-bold text-slate-900 dark:text-white">Friend Requests & Accepts</p><p className="text-slate-500">Notify when someone adds or accepts you</p></div>
                  <input type="checkbox" checked={notifRequests} onChange={(e) => setNotifRequests(e.target.checked)} className="w-4 h-4 rounded text-[#2563EB]" />
                </div>
                <div className="flex justify-between items-center pt-3">
                  <div><p className="font-bold text-slate-900 dark:text-white">Comments & Reactions</p><p className="text-slate-500">Notify when someone interacts with your posts</p></div>
                  <input type="checkbox" checked={notifComments} onChange={(e) => setNotifComments(e.target.checked)} className="w-4 h-4 rounded text-[#2563EB]" />
                </div>
                <div className="flex justify-between items-center pt-3">
                  <div><p className="font-bold text-slate-900 dark:text-white">Direct Messages</p><p className="text-slate-500">Notify for chat messages and group chats</p></div>
                  <input type="checkbox" checked={notifMessages} onChange={(e) => setNotifMessages(e.target.checked)} className="w-4 h-4 rounded text-[#2563EB]" />
                </div>
                <div className="flex justify-between items-center pt-3">
                  <div><p className="font-bold text-slate-900 dark:text-white">Group & Event Updates</p><p className="text-slate-500">Notify for activities in your joined groups</p></div>
                  <input type="checkbox" checked={notifEvents} onChange={(e) => setNotifEvents(e.target.checked)} className="w-4 h-4 rounded text-[#2563EB]" />
                </div>
                <div className="flex justify-between items-center pt-3">
                  <div><p className="font-bold text-slate-900 dark:text-white">Email Digest Notifications</p><p className="text-slate-500">Receive weekly summary via email</p></div>
                  <input type="checkbox" checked={notifEmail} onChange={(e) => setNotifEmail(e.target.checked)} className="w-4 h-4 rounded text-[#2563EB]" />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* 6. APPEARANCE (THEME) SETTINGS                                */}
          {/* ============================================================= */}
          {activeTab === 'appearance' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Display & Theme</h3>
              <p className="text-slate-500">Choose your visual appearance preference. Saved automatically across devices.</p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={clsx(
                    'p-5 rounded-2xl border flex flex-col items-center gap-2.5 font-bold transition-all',
                    theme === 'light'
                      ? 'border-[#2563EB] bg-blue-50/50 dark:bg-blue-950/40 text-[#2563EB] shadow-md'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  )}
                >
                  <Sun className="w-6 h-6 text-amber-500" />
                  <span>Light</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={clsx(
                    'p-5 rounded-2xl border flex flex-col items-center gap-2.5 font-bold transition-all',
                    theme === 'dark'
                      ? 'border-[#2563EB] bg-blue-50/50 dark:bg-blue-950/40 text-[#2563EB] shadow-md'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  )}
                >
                  <Moon className="w-6 h-6 text-indigo-400" />
                  <span>Dark</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={clsx(
                    'p-5 rounded-2xl border flex flex-col items-center gap-2.5 font-bold transition-all',
                    theme === 'system'
                      ? 'border-[#2563EB] bg-blue-50/50 dark:bg-blue-950/40 text-[#2563EB] shadow-md'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  )}
                >
                  <Monitor className="w-6 h-6 text-slate-400" />
                  <span>System</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* 7. BLOCKED ACCOUNTS                                           */}
          {/* ============================================================= */}
          {activeTab === 'blocking' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Blocked Accounts</h3>
              <p className="text-slate-500">
                Blocked people cannot message you, see your posts, or find your profile in searches.
              </p>

              {blockedUsers.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center space-y-2">
                  <Ban className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">No blocked accounts</p>
                  <p className="text-slate-500 text-[11px]">When you block someone, they will appear here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {blockedUsers.map((bId) => (
                    <div key={bId} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-900 dark:text-white">User ID: {bId}</span>
                      <Button size="sm" variant="outline" onClick={() => toggleBlockUser(bId)}>
                        Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================= */}
          {/* 8. HELP & SUPPORT                                             */}
          {/* ============================================================= */}
          {activeTab === 'help' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Help & Legal</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[#2563EB]" /> Help Center
                  </h4>
                  <p className="text-slate-500 text-[11px]">Browse guides, FAQs, and platform tutorials.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Report a Problem
                  </h4>
                  <p className="text-slate-500 text-[11px]">Report technical bugs or suspicious content.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-500" /> Terms of Service
                  </h4>
                  <p className="text-slate-500 text-[11px]">Read our platform terms and user guidelines.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-500" /> Privacy Policy
                  </h4>
                  <p className="text-slate-500 text-[11px]">Learn how Connecta protects your data.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} title="Sign Out of Connecta">
        <div className="space-y-4 text-center py-2">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <LogOut className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Are you sure you want to sign out?</h4>
            <p className="text-xs text-slate-500 mt-1">You will be securely signed out of your current session on this device.</p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsLogoutModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setIsLogoutModalOpen(false);
                logout();
                router.navigate('/login');
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </Modal>

      {/* Account Deactivation Modal */}
      <Modal isOpen={isDeactivateModalOpen} onClose={() => setIsDeactivateModalOpen(false)} title="Deactivate Account">
        <div className="space-y-4 text-center py-2">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Deactivate your Connecta account?</h4>
            <p className="text-xs text-slate-500 mt-1">
              Your profile will be hidden from other members. You can reactivate anytime by signing back in.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsDeactivateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsDeactivateModalOpen(false);
                deactivateAccount();
                router.navigate('/login');
              }}
            >
              Deactivate
            </Button>
          </div>
        </div>
      </Modal>

      {/* Account Deletion Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Permanently Delete Account">
        <div className="space-y-4 text-center py-2">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <Trash2 className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-rose-600">Irreversible Action: Permanent Deletion</h4>
            <p className="text-xs text-slate-500 mt-1">
              All your posts, stories, messages, and profile relationships will be permanently removed from Connecta.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setIsDeleteModalOpen(false);
                deleteAccount();
                router.navigate('/login');
              }}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
