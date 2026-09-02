import React from 'react';

interface TypingIndicatorProps {
  typingUsers: Map<string, string>;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
  if (typingUsers.size === 0) return null;

  const names = Array.from(typingUsers.values());
  const labelText =
    names.length === 1
      ? `${names[0]} is typing...`
      : `${names.join(', ')} are typing...`;

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium animate-fade-in">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#5B5FEF] animate-bounce-dot-1" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#5B5FEF] animate-bounce-dot-2" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#5B5FEF] animate-bounce-dot-3" />
      </div>
      <span>{labelText}</span>
    </div>
  );
};
