import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck2,
  ListTodo,
  Calendar as CalendarIcon,
  Timer,
  Settings,
  Sparkles,
  Flame,
  AlertCircle,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useTimer } from '../../context/TimerContext';

export type NavView = 'dashboard' | 'today' | 'tasks' | 'calendar' | 'timer' | 'settings';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { stats } = useTasks();
  const { isRunning, formatTimeLeft } = useTimer();

  const navItems = [
    {
      id: 'dashboard' as NavView,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'today' as NavView,
      label: 'Today',
      icon: CalendarCheck2,
      badge: stats.dueToday > 0 ? (stats.dueToday - stats.completedToday) : null,
      badgeColor: 'bg-forest-100 text-forest-800 dark:bg-forest-900/60 dark:text-mint-300',
    },
    {
      id: 'tasks' as NavView,
      label: 'All Tasks',
      icon: ListTodo,
      badge: stats.overdue > 0 ? `${stats.overdue} overdue` : null,
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
    },
    {
      id: 'calendar' as NavView,
      label: 'Calendar',
      icon: CalendarIcon,
      badge: null,
    },
    {
      id: 'timer' as NavView,
      label: 'Focus Timer',
      icon: Timer,
      badge: isRunning ? formatTimeLeft() : null,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse',
    },
    {
      id: 'settings' as NavView,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-cream-50 dark:bg-charcoal-900 border-r border-cream-300 dark:border-charcoal-800 p-5 select-none transition-colors duration-200">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3 px-2 py-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-forest-700 dark:bg-forest-600 flex items-center justify-center text-cream-50 shadow-soft">
          <Sparkles className="w-5 h-5 text-mint-300" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-lg tracking-tight text-forest-950 dark:text-cream-50">
              FocusFlow
            </h1>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-mint-100 dark:bg-forest-900/80 text-forest-700 dark:text-mint-300">
              AI
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">Calm Productivity</p>
        </div>
      </div>

      {/* Main Navigation Items */}
      <nav className="space-y-1.5 flex-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-mint-100/80 dark:bg-forest-900/50 text-forest-900 dark:text-mint-200 shadow-soft font-semibold'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-cream-200/70 dark:hover:bg-charcoal-800 hover:text-stone-900 dark:hover:text-cream-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? 'text-forest-700 dark:text-mint-400'
                      : 'text-stone-400 dark:text-stone-500'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== null && item.badge !== undefined && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Productivity Streak / Status Widget */}
      <div className="p-3.5 rounded-2xl bg-cream-200/60 dark:bg-charcoal-800/80 border border-cream-300 dark:border-charcoal-800 space-y-2 mt-auto">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Today's Flow
          </span>
          <span className="text-forest-700 dark:text-mint-400">
            {stats.completedToday}/{stats.dueToday}
          </span>
        </div>
        <div className="w-full h-1.5 bg-cream-300 dark:bg-charcoal-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-forest-600 dark:bg-mint-500 rounded-full transition-all duration-500"
            style={{
              width: `${stats.dueToday > 0 ? Math.min(100, Math.round((stats.completedToday / stats.dueToday) * 100)) : 0}%`,
            }}
          />
        </div>
        {stats.overdue > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400 pt-1">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            <span>{stats.overdue} task{stats.overdue > 1 ? 's' : ''} overdue</span>
          </div>
        )}
      </div>
    </aside>
  );
};
