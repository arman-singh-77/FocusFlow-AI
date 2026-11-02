import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Timer as TimerIcon,
  Coffee,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useTimer, TimerMode } from '../../context/TimerContext';
import { useTasks } from '../../context/TaskContext';

export const FocusTimerView: React.FC = () => {
  const {
    mode,
    setMode,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTimeLeft,
    progressPercent,
    activeTaskId,
    setActiveTaskId,
  } = useTimer();

  const { tasks } = useTasks();
  const pendingTasks = tasks.filter(t => !t.completed);
  const activeTask = tasks.find(t => t.id === activeTaskId);

  // SVG Circular Ring parameters
  const size = 280;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const modeConfigs: { id: TimerMode; label: string; icon: any; duration: string }[] = [
    { id: 'focus', label: 'Pomodoro', icon: TimerIcon, duration: '25 min' },
    { id: 'shortBreak', label: 'Short Break', icon: Coffee, duration: '5 min' },
    { id: 'longBreak', label: 'Long Break', icon: Sparkles, duration: '15 min' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Timer Container Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-lg flex flex-col items-center justify-center text-center space-y-8">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-cream-200/70 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700">
          {modeConfigs.map(cfg => {
            const Icon = cfg.icon;
            const isSelected = mode === cfg.id;

            return (
              <button
                key={cfg.id}
                onClick={() => setMode(cfg.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-cream-50 dark:bg-charcoal-900 text-forest-900 dark:text-mint-300 shadow-soft'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-cream-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cfg.label}</span>
                <span className="text-[10px] text-stone-400 dark:text-stone-500 font-normal">
                  ({cfg.duration})
                </span>
              </button>
            );
          })}
        </div>

        {/* Circular SVG Timer */}
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className="text-cream-200 dark:text-charcoal-800"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
            />
            {/* Active progress ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className={`transition-all duration-500 ease-linear ${
                mode === 'focus'
                  ? 'text-forest-600 dark:text-mint-400'
                  : 'text-amber-500 dark:text-amber-400'
              }`}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Time & State in center */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-forest-950 dark:text-cream-50">
              {formatTimeLeft()}
            </span>
            <span className="text-xs uppercase tracking-widest font-bold text-stone-400 dark:text-stone-500 mt-2">
              {isRunning ? 'Flow in progress' : 'Ready to start'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={resetTimer}
            title="Reset session"
            className="p-3.5 rounded-2xl bg-cream-200/70 hover:bg-cream-300 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-stone-600 dark:text-stone-300 transition"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {isRunning ? (
            <button
              onClick={pauseTimer}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-cream-50 font-bold text-base shadow-soft transition-all"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>Pause Focus</span>
            </button>
          ) : (
            <button
              onClick={startTimer}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-forest-700 hover:bg-forest-800 active:scale-[0.98] text-cream-50 font-bold text-base shadow-soft transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Session</span>
            </button>
          )}
        </div>

        {/* Link Session to a Specific Task */}
        <div className="w-full max-w-md pt-4 border-t border-cream-200 dark:border-charcoal-800 space-y-2">
          <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400">
            Link session to a task:
          </label>
          <select
            value={activeTaskId || ''}
            onChange={e => setActiveTaskId(e.target.value || null)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-cream-100/70 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 text-xs sm:text-sm text-stone-800 dark:text-cream-50 focus:outline-none"
          >
            <option value="">-- No specific task (General Focus) --</option>
            {pendingTasks.map(t => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.category})
              </option>
            ))}
          </select>

          {activeTask && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-mint-50 dark:bg-forest-950/40 text-left border border-mint-200 dark:border-forest-900 text-xs text-forest-900 dark:text-mint-200">
              <CheckCircle2 className="w-4 h-4 text-forest-600 dark:text-mint-400 flex-shrink-0" />
              <span className="truncate">
                Session time will be logged to <strong>{activeTask.title}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Focus Protocol Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 space-y-1.5">
          <span className="text-xs font-bold text-forest-700 dark:text-mint-400 uppercase tracking-wider">
            1. Single-Tasking
          </span>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Close unrelated tabs and silence phone notifications for the full 25 minutes.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 space-y-1.5">
          <span className="text-xs font-bold text-forest-700 dark:text-mint-400 uppercase tracking-wider">
            2. Sound Cues
          </span>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Gentle acoustic chime plays when intervals end, even in background tabs.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 space-y-1.5">
          <span className="text-xs font-bold text-forest-700 dark:text-mint-400 uppercase tracking-wider">
            3. Rest Real Rest
          </span>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            During your 5-min break, step away from screens, stretch, and hydrate.
          </p>
        </div>
      </div>
    </div>
  );
};
