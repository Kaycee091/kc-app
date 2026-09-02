import React from 'react';
import { clsx } from 'clsx';
import { CheckCircle2 } from 'lucide-react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isOnline?: boolean;
  showOnlineStatus?: boolean;
  isVerified?: boolean;
  isGroup?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  isOnline = false,
  showOnlineStatus = false,
  isVerified = false,
  className,
}) => {
  const getInitials = (str: string) => {
    if (!str) return '?';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base font-bold',
    xl: 'w-16 h-16 text-lg font-bold',
    '2xl': 'w-24 h-24 sm:w-32 sm:h-32 text-2xl font-black',
  };

  const badgeSize = {
    xs: 'w-2 h-2 right-0 bottom-0 border',
    sm: 'w-2.5 h-2.5 right-0 bottom-0 border',
    md: 'w-3 h-3 right-0 bottom-0 border-2',
    lg: 'w-3.5 h-3.5 right-0.5 bottom-0.5 border-2',
    xl: 'w-4 h-4 right-1 bottom-1 border-2',
    '2xl': 'w-6 h-6 right-2 bottom-2 border-4',
  };

  return (
    <div className="relative inline-block flex-shrink-0">
      {src ? (
        <img
          src={src}
          alt={name}
          className={clsx(
            'rounded-full object-cover shadow-sm bg-slate-100 dark:bg-slate-800 ring-2 ring-slate-900/5 dark:ring-white/10',
            sizeClasses[size],
            className
          )}
        />
      ) : (
        <div
          className={clsx(
            'rounded-full flex items-center justify-center font-bold text-white shadow-sm bg-gradient-to-tr from-[#2563EB] to-[#8B5CF6]',
            sizeClasses[size],
            className
          )}
        >
          {getInitials(name)}
        </div>
      )}

      {showOnlineStatus && (
        <span
          className={clsx(
            'absolute rounded-full border-white dark:border-slate-900 transition-colors duration-200',
            isOnline ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600',
            badgeSize[size]
          )}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}

      {isVerified && (
        <span className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-slate-900 rounded-full text-[#2563EB]">
          <CheckCircle2 className="w-3.5 h-3.5 fill-[#2563EB] text-white" />
        </span>
      )}
    </div>
  );
};
