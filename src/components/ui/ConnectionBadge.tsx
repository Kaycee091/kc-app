import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { isSupabaseConfigured } from '../../services/supabaseClient';

export const ConnectionBadge: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide transition-all ${
        isOnline
          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 animate-pulse'
      }`}
      title={isOnline ? (isSupabaseConfigured ? 'Connected to Supabase Realtime' : 'Connected to Local Realtime Engine') : 'Connection lost. Reconnecting...'}
    >
      {isOnline ? (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 -ml-3" />
          <span>{isSupabaseConfigured ? 'Supabase Live' : 'Realtime Active'}</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 text-amber-500" />
          <span>Connecting...</span>
        </>
      )}
    </div>
  );
};
