import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { Shield, Bell, Moon, Lock, LogOut, Sun, Monitor, User } from 'lucide-react';
import { clsx } from 'clsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();
  const { blockedUsers, toggleBlockUser } = useSocial();
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'appearance' | 'privacy' | 'security'>('appearance');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="KC Settings" maxWidth="lg">
      <div className="flex flex-col sm:flex-row gap-4 min-h-[300px]">
        {/* Sidebar Tabs */}
        <div className="w-full sm:w-44 flex sm:flex-col gap-1 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 pb-2 sm:pb-0 sm:pr-2">
          <button
            onClick={() => setActiveTab('appearance')}
            className={clsx(
              'flex-1 sm:flex-initial flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left',
              activeTab === 'appearance' ? 'bg-[#2563EB]/10 text-[#2563EB] font-bold' : 'text-slate-600 dark:text-slate-400'
            )}
          >
            <Moon className="w-4 h-4" />
            <span>Appearance</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={clsx(
              'flex-1 sm:flex-initial flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left',
              activeTab === 'privacy' ? 'bg-[#2563EB]/10 text-[#2563EB] font-bold' : 'text-slate-600 dark:text-slate-400'
            )}
          >
            <Shield className="w-4 h-4" />
            <span>Privacy</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={clsx(
              'flex-1 sm:flex-initial flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left',
              activeTab === 'security' ? 'bg-[#2563EB]/10 text-[#2563EB] font-bold' : 'text-slate-600 dark:text-slate-400'
            )}
          >
            <Lock className="w-4 h-4" />
            <span>Security</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 space-y-4 pt-1">
          {activeTab === 'appearance' && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Theme Preference</h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-xs font-semibold ${theme === 'light' ? 'border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB]' : 'border-slate-200 dark:border-slate-700'}`}
                >
                  <Sun className="w-5 h-5" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-xs font-semibold ${theme === 'dark' ? 'border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB]' : 'border-slate-200 dark:border-slate-700'}`}
                >
                  <Moon className="w-5 h-5" />
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-xs font-semibold ${theme === 'system' ? 'border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB]' : 'border-slate-200 dark:border-slate-700'}`}
                >
                  <Monitor className="w-5 h-5" />
                  <span>System</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-fade-in text-xs font-medium">
              <h4 className="font-bold text-slate-900 dark:text-white">Blocked Accounts ({blockedUsers.length})</h4>
              {blockedUsers.length === 0 ? (
                <p className="text-slate-400 italic">No blocked users</p>
              ) : (
                blockedUsers.map((id) => (
                  <div key={id} className="flex justify-between items-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <span>User ({id})</span>
                    <button onClick={() => toggleBlockUser(id)} className="text-[#2563EB] font-bold">Unblock</button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4 animate-fade-in">
              <Button variant="danger" className="w-full" leftIcon={<LogOut className="w-4 h-4" />} onClick={logout}>
                Sign Out of KC
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
