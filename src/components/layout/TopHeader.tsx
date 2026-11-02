import React from 'react';
import { Search, Plus, Sun, Moon, Calendar } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTasks } from '../../context/TaskContext';
import { NavView } from './Sidebar';

interface TopHeaderProps {
  currentView: NavView;
  onOpenNewTaskModal: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ currentView, onOpenNewTaskModal }) => {
  const { isDark, toggleTheme } = useTheme();
  const { searchQuery, setSearchQuery } = useTasks();

  const titles: Record<NavView, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Overview of your priorities, focus, and daily flow',
    },
    today: {
      title: 'Today',
      subtitle: 'Stay locked into what matters most before day ends',
    },
    tasks: {
      title: 'All Tasks',
      subtitle: 'Organize, filter, and plan across all categories',
    },
    calendar: {
      title: 'Calendar Schedule',
      subtitle: 'Visual timeline of your commitments and milestones',
    },
    timer: {
      title: 'Focus Timer',
      subtitle: 'Pomodoro intervals for deep, undistracted flow',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Preferences, AI configuration, and data backup',
    },
  };

  const currentMeta = titles[currentView] || { title: 'FocusFlow', subtitle: '' };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-cream-100/90 dark:bg-charcoal-950/90 backdrop-blur-md border-b border-cream-300 dark:border-charcoal-800 transition-colors">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-forest-950 dark:text-cream-50">
          {currentMeta.title}
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block">
          {currentMeta.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search input (visible in tasks / dashboard) */}
        <div className="relative flex-1 sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tasks or subjects..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-600/30 dark:focus:ring-mint-500/30 text-stone-800 dark:text-cream-100 placeholder:text-stone-400 transition"
          />
        </div>

        {/* Date badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cream-200/60 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 text-xs font-medium text-stone-600 dark:text-stone-300">
          <Calendar className="w-3.5 h-3.5 text-forest-700 dark:text-mint-400" />
          <span>{todayFormatted}</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-2 rounded-xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-cream-50 hover:bg-cream-200/50 dark:hover:bg-charcoal-800 transition"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-forest-800" />}
        </button>

        {/* Add Task button */}
        <button
          onClick={onOpenNewTaskModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl bg-forest-700 hover:bg-forest-800 active:scale-[0.98] text-cream-50 font-medium text-xs sm:text-sm shadow-soft transition-all duration-150"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Task</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </header>
  );
};
