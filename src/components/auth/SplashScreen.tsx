import React, { useState, useEffect } from 'react';
import { ConnectaLogo } from '../ui/ConnectaLogo';

interface SplashScreenProps {
  durationSeconds?: number;
  onComplete: () => void;
}

/**
 * Connecta Startup Splash Screen
 * Matches the illuminated dark visual identity from the reference image.
 * Features an illuminated interlocking KC logo, sleek progress bar,
 * and 5-second precision startup sequence.
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({
  durationSeconds = 5,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);

  useEffect(() => {
    const totalMs = durationSeconds * 1000;
    const intervalMs = 50;
    const increment = (intervalMs / totalMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, intervalMs);

    const secondTimer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(secondTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const finishTimeout = setTimeout(() => {
      onComplete();
    }, totalMs + 200);

    return () => {
      clearInterval(timer);
      clearInterval(secondTimer);
      clearTimeout(finishTimeout);
    };
  }, [durationSeconds, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black text-white px-6 py-12 select-none overflow-hidden animate-fade-in">
      {/* Top ambient spacer */}
      <div className="w-full h-8" />

      {/* Center: Illuminated KC Monogram Logo */}
      <div className="flex flex-col items-center justify-center space-y-4 my-auto">
        <div className="transform hover:scale-105 transition-transform duration-700">
          <ConnectaLogo size={120} glow />
        </div>
      </div>

      {/* Bottom: Sleek Horizontal Progress Bar — no loading text shown to user */}
      <div className="w-full max-w-xs flex flex-col items-center space-y-3 pb-8">
        <div className="w-full flex items-center gap-3">
          {/* Progress bar track */}
          <div className="flex-1 h-[3px] bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-75 ease-linear shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
