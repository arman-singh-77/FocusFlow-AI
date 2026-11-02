import React from 'react';
import { Sparkles } from 'lucide-react';

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

const PROMPTS = [
  'Add DSA practice tomorrow at 6 PM',
  'Move my Python assignment to Friday',
  'What should I do today?',
  'Which tasks are overdue?',
  'Show high priority tasks',
  'Start focus timer for 25 minutes',
];

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ onSelectPrompt }) => {
  return (
    <div className="space-y-1.5 px-3 py-2 border-t border-cream-200 dark:border-charcoal-800 bg-cream-100/50 dark:bg-charcoal-900/60">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
        <Sparkles className="w-3 h-3 text-amber-500" />
        <span>Try asking:</span>
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(p)}
            className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-cream-50 hover:bg-mint-100 dark:bg-charcoal-800 dark:hover:bg-forest-900/60 border border-cream-300 dark:border-charcoal-700 text-[11px] font-medium text-stone-700 dark:text-stone-300 transition"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};
