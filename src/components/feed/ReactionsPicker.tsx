import React from 'react';
import { ReactionType } from '../../types/social';

interface ReactionsPickerProps {
  onSelectReaction: (type: ReactionType) => void;
}

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'care', emoji: '🥰', label: 'Care' },
  { type: 'haha', emoji: '😂', label: 'Haha' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'angry', emoji: '😡', label: 'Angry' },
];

export const ReactionsPicker: React.FC<ReactionsPickerProps> = ({ onSelectReaction }) => {
  return (
    <div className="absolute -top-12 left-0 z-30 flex items-center gap-1.5 p-1.5 bg-white dark:bg-slate-800 rounded-full shadow-2xl border border-slate-200 dark:border-slate-700 animate-slide-up">
      {REACTIONS.map((item) => (
        <button
          key={item.type}
          onClick={(e) => {
            e.stopPropagation();
            onSelectReaction(item.type);
          }}
          className="text-2xl hover:scale-130 hover:-translate-y-1 transition-all duration-150 p-1 rounded-full group relative"
          title={item.label}
        >
          <span>{item.emoji}</span>
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};
