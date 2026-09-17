import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Camera, Check, Sparkles } from 'lucide-react';
import { uploadFile } from '../../services/storageService';
import { router } from '../../router';

export const OnboardingWizard: React.FC = () => {
  const { user, updateProfile, setIsOnboarding, markOnboardingCompleted } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const INTERESTS = [
    'Tech & AI', 'Photography', 'Gaming', 'Travel',
    'Music', 'Fitness', 'Design', 'Business',
    'Art', 'Food', 'Sports', 'Science',
  ];

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const uploaded = await uploadFile(file);
      setAvatarUrl(uploaded.url);
    } catch {}
    setIsUploading(false);
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        avatar_url: avatarUrl,
        bio,
        location,
        onboarding_completed: true,
      });
    } catch {}
    // Mark onboarding complete so the wizard doesn't reappear on next login
    markOnboardingCompleted();
    setIsOnboarding(false);
    // Navigate into the main application — no page reload
    router.navigate('/feed');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2563EB]" />
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              Complete your profile
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-400">Step {step} of 3</span>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step ? 'flex-1 bg-[#2563EB]' : s < step ? 'w-6 bg-emerald-500' : 'w-6 bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* ── Step 1: Avatar + Bio + Location ── */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in text-center">
            <div className="relative inline-block mx-auto group">
              <Avatar src={avatarUrl} name={user?.full_name || 'User'} size="xl" />
              <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Hover over your avatar to upload a profile picture
            </p>

            <Input
              label="Bio / Short Description"
              placeholder="e.g. Building cool apps & love hiking 🌲"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <Input
              label="Current Location"
              placeholder="e.g. Lagos, Nigeria"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        )}

        {/* ── Step 2: Interests ── */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Choose your interests</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                We'll personalise your feed based on what you select.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {INTERESTS.map((item) => {
                const isSelected = selectedInterests.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setSelectedInterests((prev) =>
                        isSelected ? prev.filter((i) => i !== item) : [...prev, item]
                      )
                    }
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB]'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <span>{item}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400">
              {selectedInterests.length} selected{selectedInterests.length === 0 && ' — pick at least one'}
            </p>
          </div>
        )}

        {/* ── Step 3: Confirm ── */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">You're all set!</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Welcome to Connecta,{' '}
              <strong className="text-slate-700 dark:text-slate-300">{user?.first_name}</strong>!
              Your account is ready. Let's explore.
            </p>

            {/* Summary card */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-left space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Email verified ✓</span>
              </div>
              {bio && (
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>Bio added</span>
                </div>
              )}
              {selectedInterests.length > 0 && (
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>{selectedInterests.length} interests selected</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={isSaving}>
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={handleFinish} disabled={isSaving}>
              Skip
            </Button>
          )}

          {step < 3 ? (
            <Button
              variant="primary"
              onClick={() => setStep(step + 1)}
              isLoading={isUploading}
              disabled={isUploading}
            >
              Next
            </Button>
          ) : (
            <Button variant="primary" onClick={handleFinish} isLoading={isSaving}>
              Get Started →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
