import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Camera, Check, UserPlus, Sparkles } from 'lucide-react';
import { uploadFile } from '../../services/storageService';

export const OnboardingWizard: React.FC = () => {
  const { user, updateProfile, setIsOnboarding } = useAuth();
  const { sendFriendRequest } = useSocial();

  const [step, setStep] = useState<number>(1);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Tech', 'Photography']);
  const [isUploading, setIsUploading] = useState(false);

  const INTERESTS = ['Tech & AI', 'Photography', 'Gaming', 'Travel', 'Music', 'Fitness', 'Design', 'Business'];

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const uploaded = await uploadFile(file);
      setAvatarUrl(uploaded.url);
    } catch (e) {}
    setIsUploading(false);
  };

  const handleFinish = async () => {
    await updateProfile({
      avatar_url: avatarUrl,
      bio,
      location,
    });
    setIsOnboarding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
        
        {/* Step indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2563EB]" />
            <h3 className="font-black text-slate-900 dark:text-white text-base">Welcome to KC!</h3>
          </div>
          <span className="text-xs font-bold text-slate-400">Step {step} of 3</span>
        </div>

        {/* Step 1: Avatar & Bio */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in text-center">
            <div className="relative inline-block mx-auto group">
              <Avatar src={avatarUrl} name={user?.full_name || 'User'} size="xl" />
              <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <p className="text-xs text-slate-500">Upload a profile picture to help friends recognize you</p>

            <Input
              label="Bio / Short Description"
              placeholder="e.g. Building cool apps & love hiking 🌲"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <Input
              label="Current Location"
              placeholder="e.g. San Francisco, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        )}

        {/* Step 2: Select Interests */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Choose your interests</h4>
            <p className="text-xs text-slate-500">We will personalize your KC home feed based on topics you like.</p>

            <div className="grid grid-cols-2 gap-2 pt-2">
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
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{item}</span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Finish */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">You are all set!</h4>
            <p className="text-xs text-slate-500">Welcome to KC Social Network. Let's start exploring your feed.</p>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={handleFinish}>
              Skip
            </Button>
          )}

          {step < 3 ? (
            <Button variant="primary" onClick={() => setStep(step + 1)} isLoading={isUploading}>
              Next
            </Button>
          ) : (
            <Button variant="primary" onClick={handleFinish}>
              Get Started
            </Button>
          )}
        </div>

      </div>
    </div>
  );
};
