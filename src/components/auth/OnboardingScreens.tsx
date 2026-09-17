import React, { useState } from 'react';
import { ConnectaLogo } from '../ui/ConnectaLogo';
import { Users, UserPlus, Heart, MessageCircle, Sparkles, Compass, Hash, Share2, Image, Radio, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingScreensProps {
  onComplete: () => void;
}

export const OnboardingScreens: React.FC<OnboardingScreensProps> = ({ onComplete }) => {
  const [currentScreen, setCurrentScreen] = useState<1 | 2 | 3>(1);

  const handleNext = () => {
    if (currentScreen === 3) {
      // Primary button on Screen 3 is exactly "Next" -> navigates to Authentication Page
      onComplete();
    } else {
      setCurrentScreen((prev) => (prev + 1) as 1 | 2 | 3);
    }
  };

  const handleBack = () => {
    if (currentScreen > 1) {
      setCurrentScreen((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black text-white px-6 py-10 select-none overflow-hidden animate-fade-in">
      {/* Top Header: Monogram Logo & Skip Action */}
      <div className="w-full max-w-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ConnectaLogo size={32} glow />
          <span className="font-black text-lg tracking-wider text-white">CONNECTA</span>
        </div>

        {currentScreen < 3 ? (
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors px-3 py-1.5 rounded-full hover:bg-neutral-800"
          >
            Skip
          </button>
        ) : (
          <div className="w-12" />
        )}
      </div>

      {/* Center: Dynamic Screen Graphic & Content */}
      <div className="w-full max-w-md flex-1 flex flex-col items-center justify-center py-6 text-center">
        {/* SCREEN 1: CONNECT WITH PEOPLE */}
        {currentScreen === 1 && (
          <div className="w-full space-y-8 animate-fade-in">
            {/* Visual Graphic Element */}
            <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-blue-600/10 blur-2xl pointer-events-none" />
              <div className="w-48 h-48 rounded-full border border-neutral-800 flex items-center justify-center relative">
                {/* Central Avatar Badge */}
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/25 z-10 border border-white/20">
                  <Users className="w-10 h-10 text-white" />
                </div>

                {/* Orbiting Satellites */}
                <div className="absolute -top-3 left-8 p-3 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-lg text-emerald-400 animate-bounce">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="absolute bottom-2 right-4 p-3 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-lg text-rose-400">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="absolute top-1/2 -left-4 -translate-y-1/2 p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-lg text-amber-400">
                  <MessageCircle className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-3 px-4">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Connect with People
              </h2>
              <p className="text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed">
                Find friends, meet new people and stay connected with the people who matter to you.
              </p>
            </div>
          </div>
        )}

        {/* SCREEN 2: DISCOVER COMMUNITIES */}
        {currentScreen === 2 && (
          <div className="w-full space-y-8 animate-fade-in">
            {/* Visual Graphic Element */}
            <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-purple-600/10 blur-2xl pointer-events-none" />
              <div className="grid grid-cols-2 gap-3 w-52 h-52 p-4 rounded-3xl border border-neutral-800 bg-neutral-950/60 backdrop-blur-md">
                <div className="rounded-2xl bg-gradient-to-br from-indigo-900/60 to-purple-900/40 border border-indigo-500/30 flex flex-col items-center justify-center p-3 text-indigo-400">
                  <Compass className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">Groups</span>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-purple-900/60 to-pink-900/40 border border-purple-500/30 flex flex-col items-center justify-center p-3 text-purple-400">
                  <Hash className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">Topics</span>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-emerald-900/60 to-teal-900/40 border border-emerald-500/30 flex flex-col items-center justify-center p-3 text-emerald-400">
                  <Sparkles className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">Events</span>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-amber-900/60 to-rose-900/40 border border-amber-500/30 flex flex-col items-center justify-center p-3 text-amber-400">
                  <Radio className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">Live</span>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-3 px-4">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Discover Communities
              </h2>
              <p className="text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed">
                Find groups and communities that match your interests and join conversations that matter to you.
              </p>
            </div>
          </div>
        )}

        {/* SCREEN 3: SHARE WHAT MATTERS */}
        {currentScreen === 3 && (
          <div className="w-full space-y-8 animate-fade-in">
            {/* Visual Graphic Element */}
            <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-600/10 blur-2xl pointer-events-none" />
              <div className="w-52 h-52 rounded-3xl border border-neutral-800 bg-neutral-950/80 p-5 flex flex-col justify-between shadow-2xl relative">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-xs">
                    KC
                  </div>
                  <div className="text-left">
                    <div className="w-20 h-2.5 bg-neutral-700 rounded-full" />
                    <div className="w-12 h-2 bg-neutral-800 rounded-full mt-1.5" />
                  </div>
                </div>

                <div className="py-2">
                  <div className="w-full h-16 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 gap-2">
                    <Image className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-semibold">Memories & Stories</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-neutral-500 text-xs px-1">
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500" /> 128</span>
                  <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5 text-blue-400" /> Share</span>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-3 px-4">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Share What Matters
              </h2>
              <p className="text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed">
                Share moments, photos, ideas and stories with the people and communities you care about.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls: Step Indicators & Action Buttons */}
      <div className="w-full max-w-md space-y-6">
        {/* Step Indicator Dots */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentScreen === stepNumber
                  ? 'w-8 bg-white'
                  : 'w-2 bg-neutral-800'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3">
          {currentScreen > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-3.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm border border-neutral-800 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex-1 py-3.5 rounded-full bg-white hover:bg-neutral-100 text-black font-extrabold text-sm shadow-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span>Next</span>
            {currentScreen < 3 && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreens;
