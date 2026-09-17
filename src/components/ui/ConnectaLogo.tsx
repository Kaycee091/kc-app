import React from 'react';

interface ConnectaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  glow?: boolean;
  className?: string;
}

/**
 * Authentic Connecta Interlocking "KC" Monogram Logo
 * Matching the illuminated brand identity in the design reference.
 */
export const ConnectaLogo: React.FC<ConnectaLogoProps> = ({
  size = 'md',
  glow = false,
  className = '',
}) => {
  const pixelSize =
    typeof size === 'number'
      ? size
      : {
          sm: 28,
          md: 40,
          lg: 64,
          xl: 96,
          '2xl': 140,
        }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {/* Ambient Glow layer matching reference image */}
      {glow && (
        <div
          className="absolute inset-0 rounded-full bg-white/20 blur-xl pointer-events-none transform scale-150 animate-pulse-slow"
          style={{ filter: 'blur(16px)' }}
        />
      )}

      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-md"
      >
        <defs>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer interlocking oval C curve */}
        <path
          d="M 68 28 C 45 28 22 42 22 62 C 22 82 45 96 68 96 C 76 96 84 93 89 89 L 85 81 C 80 85 74 88 67 88 C 49 88 32 76 32 62 C 32 47 49 36 67 36 C 75 36 82 39 87 44 L 92 37 C 85 31 77 28 68 28 Z"
          fill="currentColor"
          className="text-white"
          filter={glow ? 'url(#softGlow)' : undefined}
        />

        {/* Elegant Serif / Slab K interlocking through the C */}
        {/* Left vertical stem with top and bottom serifs */}
        <path
          d="M 38 24 L 54 24 L 54 28 L 49 28 L 49 92 L 54 92 L 54 96 L 38 96 L 38 92 L 43 92 L 43 28 L 38 28 Z"
          fill="currentColor"
          className="text-white"
          filter={glow ? 'url(#softGlow)' : undefined}
        />

        {/* Upper diagonal arm with top serif */}
        <path
          d="M 47 62 L 77 28 L 72 28 L 72 24 L 92 24 L 92 28 L 86 28 L 58 59 L 47 48 Z"
          fill="currentColor"
          className="text-white"
          filter={glow ? 'url(#softGlow)' : undefined}
        />

        {/* Lower diagonal leg with bottom serif */}
        <path
          d="M 54 55 L 83 92 L 77 92 L 77 96 L 98 96 L 98 92 L 91 92 L 63 56 Z"
          fill="currentColor"
          className="text-white"
          filter={glow ? 'url(#softGlow)' : undefined}
        />
      </svg>
    </div>
  );
};

export default ConnectaLogo;
