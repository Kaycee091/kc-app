import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Settings, Shield, Lock, Check } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useAdmin();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Admin System Settings</h2>
        <p className="text-xs text-slate-500">Configure global platform rules, registration toggles, and moderation thresholds.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* General Settings */}
        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2">General Platform</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Platform Name"
              value={form.platformName}
              onChange={(e) => setForm({ ...form, platformName: e.target.value })}
            />
            <Input
              label="Platform Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        {/* User Registration & Privacy Toggles */}
        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2">User Registration & Rules</h3>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Allow New User Registrations</span>
                <span className="text-[11px] text-slate-400">Permit public user account creation</span>
              </div>
              <input
                type="checkbox"
                checked={form.allowRegistration}
                onChange={(e) => setForm({ ...form, allowRegistration: e.target.checked })}
                className="w-4 h-4 rounded text-[#2563EB]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Require Email Verification</span>
                <span className="text-[11px] text-slate-400">Require 6-digit email verification code on sign up</span>
              </div>
              <input
                type="checkbox"
                checked={form.requireEmailVerification}
                onChange={(e) => setForm({ ...form, requireEmailVerification: e.target.checked })}
                className="w-4 h-4 rounded text-[#2563EB]"
              />
            </label>
          </div>
        </div>

        {/* Automated Moderation Settings */}
        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2">Moderation & Safety Rules</h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Enable Profanity Filter</span>
                <span className="text-[11px] text-slate-400">Automatically mask profane language in post text and comments</span>
              </div>
              <input
                type="checkbox"
                checked={form.profanityFilter}
                onChange={(e) => setForm({ ...form, profanityFilter: e.target.checked })}
                className="w-4 h-4 rounded text-[#2563EB]"
              />
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Auto-Moderation Report Threshold
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={form.reportThreshold}
                onChange={(e) => setForm({ ...form, reportThreshold: parseInt(e.target.value) || 3 })}
                className="w-32 py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
              <span className="text-[11px] text-slate-400 block mt-1">Number of reports required before content is auto-flagged</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved ? <span className="text-xs font-bold text-emerald-500">✓ Settings saved successfully!</span> : <div />}
          <Button type="submit" variant="primary">
            Save System Settings
          </Button>
        </div>

      </form>
    </div>
  );
};
