import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { Task } from '../../types/task';
import { TaskCard } from '../tasks/TaskCard';
import { getTodayString, formatDateString } from '../../utils/dateUtils';

interface CalendarViewProps {
  onOpenNewTaskModal: (defaultDate?: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteRequest: (task: Task) => void;
  onStartFocus?: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onOpenNewTaskModal,
  onEditTask,
  onDeleteRequest,
  onStartFocus,
}) => {
  const { tasks } = useTasks();
  const todayStr = getTodayString();

  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(todayStr);
  };

  // Build calendar matrix
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dNum = daysInPrevMonth - i;
    const prevD = new Date(year, month - 1, dNum);
    days.push({
      dateStr: formatDateString(prevD),
      dayNum: dNum,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const curD = new Date(year, month, d);
    days.push({
      dateStr: formatDateString(curD),
      dayNum: d,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete grid (42 cells = 6 weeks)
  const remainingCells = 42 - days.length;
  for (let nextD = 1; nextD <= remainingCells; nextD++) {
    const nD = new Date(year, month + 1, nextD);
    days.push({
      dateStr: formatDateString(nD),
      dayNum: nextD,
      isCurrentMonth: false,
    });
  }

  // Map tasks by date
  const tasksByDate = React.useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach(task => {
      if (task.dueDate) {
        const list = map.get(task.dueDate) || [];
        list.push(task);
        map.set(task.dueDate, list);
      }
    });
    return map;
  }, [tasks]);

  const selectedTasks = tasksByDate.get(selectedDate) || [];

  const selectedDateFormatted = (() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  })();

  const monthLabel = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-forest-100 dark:bg-forest-900/60 text-forest-700 dark:text-mint-400 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-forest-950 dark:text-cream-50">
              {monthLabel}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Click any date to inspect and plan scheduled tasks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={jumpToToday}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-cream-200/80 hover:bg-cream-300 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-forest-900 dark:text-mint-300 transition"
          >
            Today
          </button>
          <div className="flex items-center rounded-xl bg-cream-200/60 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 p-0.5">
            <button
              onClick={prevMonth}
              title="Previous Month"
              className="p-1.5 rounded-lg hover:bg-cream-50 dark:hover:bg-charcoal-700 text-stone-600 dark:text-stone-300 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              title="Next Month"
              className="p-1.5 rounded-lg hover:bg-cream-50 dark:hover:bg-charcoal-700 text-stone-600 dark:text-stone-300 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar Month Grid (2 cols) & Day Inspector (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month View (Left 2 columns) */}
        <div className="lg:col-span-2 p-4 sm:p-6 rounded-3xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 mb-2 text-center text-xs font-bold text-stone-400 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {days.map(day => {
              const dayTasks = tasksByDate.get(day.dateStr) || [];
              const isSelected = selectedDate === day.dateStr;
              const isCurrentDay = todayStr === day.dateStr;
              const pendingCount = dayTasks.filter(t => !t.completed).length;

              return (
                <div
                  key={day.dateStr}
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={`min-h-[75px] sm:min-h-[92px] p-1.5 sm:p-2 rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-150 border ${
                    isSelected
                      ? 'border-forest-700 dark:border-mint-400 bg-mint-50/70 dark:bg-forest-950/40 shadow-soft'
                      : isCurrentDay
                      ? 'border-cream-400 dark:border-charcoal-700 bg-cream-100/60 dark:bg-charcoal-800/80'
                      : 'border-transparent hover:bg-cream-200/50 dark:hover:bg-charcoal-800/60'
                  } ${!day.isCurrentMonth ? 'opacity-35' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-semibold rounded-lg w-6 h-6 flex items-center justify-center ${
                        isCurrentDay
                          ? 'bg-forest-700 dark:bg-mint-500 text-cream-50 font-bold'
                          : isSelected
                          ? 'text-forest-800 dark:text-mint-300 font-bold'
                          : 'text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {day.dayNum}
                    </span>

                    {pendingCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-forest-100 text-forest-800 dark:bg-forest-900 dark:text-mint-300">
                        {pendingCount}
                      </span>
                    )}
                  </div>

                  {/* Task preview dots/chips */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map(t => (
                      <div
                        key={t.id}
                        className={`text-[10px] truncate px-1.5 py-0.5 rounded-md font-medium ${
                          t.completed
                            ? 'bg-cream-200 text-stone-400 line-through dark:bg-charcoal-700 dark:text-stone-500'
                            : t.priority === 'high'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                            : 'bg-cream-200/80 text-forest-900 dark:bg-charcoal-700 dark:text-cream-100'
                        }`}
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <span className="text-[9px] font-semibold text-stone-400 pl-1">
                        +{dayTasks.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Inspector (Right column) */}
        <div className="p-5 rounded-3xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200 dark:border-charcoal-800">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Selected Date
                </span>
                <h3 className="text-base font-bold text-forest-950 dark:text-cream-50">
                  {selectedDateFormatted}
                </h3>
              </div>

              <button
                onClick={() => onOpenNewTaskModal(selectedDate)}
                title="Add task for this date"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-cream-50 text-xs font-semibold shadow-soft transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* List of tasks on this day */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {selectedTasks.length > 0 ? (
                selectedTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onDeleteRequest={onDeleteRequest}
                    onStartFocus={onStartFocus}
                  />
                ))
              ) : (
                <div className="py-12 text-center space-y-2">
                  <Sparkles className="w-8 h-8 text-stone-300 dark:text-charcoal-700 mx-auto" />
                  <p className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                    No tasks scheduled for this day
                  </p>
                  <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                    Click the "Add" button above to schedule a task or practice session on this date.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
