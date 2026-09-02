import React from 'react';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';

interface SearchOverlayProps {
  query: string;
  onChangeQuery: (q: string) => void;
  onClose: () => void;
  matchCount: number;
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  query,
  onChangeQuery,
  onClose,
  matchCount,
  currentIndex,
  onNext,
  onPrev,
}) => {
  return (
    <div className="h-12 px-4 bg-amber-50/90 dark:bg-amber-950/80 border-b border-amber-200 dark:border-amber-800 flex items-center justify-between z-20 animate-slide-up">
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <Search className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => onChangeQuery(e.target.value)}
          placeholder="Search in conversation..."
          className="w-full text-xs bg-transparent text-amber-950 dark:text-amber-100 placeholder:text-amber-600/60 focus:outline-none font-medium"
          autoFocus
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
          {matchCount > 0 ? `${currentIndex + 1} of ${matchCount}` : 'No results'}
        </span>

        <div className="flex items-center gap-1 border-l border-amber-200 dark:border-amber-800 pl-2">
          <button
            onClick={onPrev}
            disabled={matchCount === 0}
            className="p-1 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded disabled:opacity-40"
            title="Previous match"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={onNext}
            disabled={matchCount === 0}
            className="p-1 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded disabled:opacity-40"
            title="Next match"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
