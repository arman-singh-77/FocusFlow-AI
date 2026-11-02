import React from 'react';
import { Play, Pause, RotateCcw, Maximize2, Timer as TimerIcon } from 'lucide-react';
import { useTimer } from '../../context/TimerContext';
import { useTasks } from '../../context/TaskContext';

interface QuickTimerWidgetProps {
  onOpenFullTimer: () => void;
}

export const QuickTimerWidget: React.FC<QuickTimerWidgetProps> = ({ onOpenFullTimer }) => {
  const { isRunning, startTimer, pauseTimer, resetTimer, formatTimeLeft, progressPercent, activeTaskId, mode } = useTimer();
  const { tasks } = useTasks();

  const activeTask = tasks.find(t => t.id === activeTaskId);

  return (
    <div className="p-5 rounded-2xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-forest-100 dark:bg-forest-900/60 text-forest-700 dark:text-mint-400 flex items-center justify-center">
            <TimerIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Quick Focus Session
            </h4>
            <span className="text-xs text-forest-800 dark:text-mint-300 capitalize font-medium">
              {mode === 'focus' ? '25-Min Pomodoro' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenFullTimer}
          title="Open Full Focus Timer"
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-cream-200/50 dark:hover:bg-charcoal-800 transition"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {activeTask && (
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-mint-50 dark:bg-forest-950/40 border border-mint-200 dark:border-forest-900 text-xs text-forest-900 dark:text-mint-200 truncate">
          <span className="font-semibold text-forest-700 dark:text-mint-400">Focusing on: </span>
          {activeTask.title}
        </div>
      )}

      {/* Big Digital Display */}
      <div className="text-center py-2">
        <div className="text-4xl font-extrabold tracking-tight font-mono text-forest-950 dark:text-cream-50">
          {formatTimeLeft()}
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-cream-300 dark:bg-charcoal-800 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-forest-600 dark:bg-mint-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-2.5 mt-3 pt-3 border-t border-cream-200 dark:border-charcoal-800">
        {isRunning ? (
          <button
            onClick={pauseTimer}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-cream-50 text-xs font-semibold shadow-soft transition active:scale-[0.98]"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            Pause
          </button>
        ) : (
          <button
            onClick={startTimer}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-cream-50 text-xs font-semibold shadow-soft transition active:scale-[0.98]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Start Focus
          </button>
        )}

        <button
          onClick={resetTimer}
          title="Reset timer"
          className="p-2 rounded-xl bg-cream-200/80 hover:bg-cream-300 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-stone-600 dark:text-stone-300 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
