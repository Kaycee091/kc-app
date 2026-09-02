import React from 'react';
import { clsx } from 'clsx';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl', className)} />
);

export const ConversationSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 p-3 rounded-2xl">
    <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="flex justify-between">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-10 h-3" />
      </div>
      <Skeleton className="w-36 h-3" />
    </div>
  </div>
);

export const MessageSkeleton: React.FC<{ isRight?: boolean }> = ({ isRight = false }) => (
  <div className={clsx('flex gap-3 max-w-[80%]', isRight ? 'ml-auto flex-row-reverse' : '')}>
    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
    <div className="space-y-1.5 flex-1">
      <Skeleton className={clsx('h-10 rounded-2xl', isRight ? 'w-48 ml-auto' : 'w-56')} />
      <Skeleton className={clsx('h-3 w-12', isRight ? 'ml-auto' : '')} />
    </div>
  </div>
);
