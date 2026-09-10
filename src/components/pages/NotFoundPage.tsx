import React from 'react';
import { Button } from '../ui/Button';
import { AlertCircle, Home, Search } from 'lucide-react';
import { router } from '../../router';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6 border border-rose-500/20 shadow-lg shadow-rose-500/10">
        <AlertCircle className="w-10 h-10" />
      </div>

      <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">404 — Page Not Found</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-3 mb-8 leading-relaxed font-medium">
        The route you requested (<code className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-rose-500 font-bold">{typeof window !== 'undefined' ? window.location.pathname : ''}</code>) does not exist or may have been moved.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={() => router.navigate('/feed')}
          leftIcon={<Home className="w-4 h-4" />}
        >
          Return to Connecta Feed
        </Button>

        <Button
          variant="outline"
          size="md"
          onClick={() => router.navigate('/search')}
          leftIcon={<Search className="w-4 h-4" />}
        >
          Search Connecta
        </Button>
      </div>
    </div>
  );
};
