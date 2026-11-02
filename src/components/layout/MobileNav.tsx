import React from 'react';
import { LayoutDashboard, CalendarCheck2, ListTodo, Calendar as CalendarIcon, Timer, Settings } from 'lucide-react';
import { NavView } from './Sidebar';
import { useTasks } from '../../context/TaskContext';

interface MobileNavProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate }) => {
  const { stats } = useTasks();

  const items = [
    { id: 'dashboard' as NavView, label: 'Home', icon: LayoutDashboard },
    {
      id: 'today' as NavView,
      label: 'Today',
      icon: CalendarCheck2,
      badge: stats.dueToday - stats.completedToday > 0 ? stats.dueToday - stats.completedToday : null,
    },
    { id: 'tasks' as NavView, label: 'Tasks', icon: ListTodo, dot: stats.overdue > 0 },
    { id: 'calendar' as NavView, label: 'Calendar', icon: CalendarIcon },
    { id: 'timer' as NavView, label: 'Timer', icon: Timer },
    { id: 'settings' as NavView, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-cream-50/95 dark:bg-charcoal-900/95 backdrop-blur-md border-t border-cream-300 dark:border-charcoal-800 z-40 px-2 py-1.5 flex items-center justify-around">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = currentView === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
              isActive
                ? 'text-forest-800 dark:text-mint-300 font-semibold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge !== null && item.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2 bg-forest-700 text-cream-50 dark:bg-mint-400 dark:text-charcoal-950 text-[10px] font-bold px-1 rounded-full">
                  {item.badge}
                </span>
              )}
              {item.dot && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </div>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
