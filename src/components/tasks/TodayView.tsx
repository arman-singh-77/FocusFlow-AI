import React, { useState } from 'react';
import {
  CalendarCheck2,
  Plus,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { TaskCard } from './TaskCard';
import { Task } from '../../types/task';
import { isToday, getTodayString } from '../../utils/dateUtils';
import { inferCategory, inferPriority } from '../../services/taskEngine';

interface TodayViewProps {
  onOpenNewTaskModal: (defaultDate?: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteRequest: (task: Task) => void;
  onStartFocus?: (task: Task) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  onOpenNewTaskModal,
  onEditTask,
  onDeleteRequest,
  onStartFocus,
}) => {
  const { tasks, addTask } = useTasks();
  const [quickInput, setQuickInput] = useState('');

  const todayStr = getTodayString();
  const todayTasks = tasks.filter(t => isToday(t.dueDate));
  const pendingTasks = todayTasks.filter(t => !t.completed);
  const completedTasks = todayTasks.filter(t => t.completed);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    addTask({
      title: quickInput.trim(),
      dueDate: todayStr,
      priority: inferPriority(quickInput),
      category: inferCategory(quickInput),
    });
    setQuickInput('');
  };

  const todayPercentage = todayTasks.length > 0
    ? Math.round((completedTasks.length / todayTasks.length) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-forest-700 dark:text-mint-400 font-semibold text-xs mb-1">
            <CalendarCheck2 className="w-4 h-4" />
            <span>TODAY'S AGENDA</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-forest-950 dark:text-cream-50">
            {formattedDate}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            {pendingTasks.length} pending • {completedTasks.length} completed
          </p>
        </div>

        {/* Progress summary widget */}
        <div className="flex items-center gap-4 bg-cream-100/80 dark:bg-charcoal-800 p-4 rounded-2xl border border-cream-200 dark:border-charcoal-700">
          <div className="text-right">
            <span className="text-2xl font-black text-forest-950 dark:text-cream-50">
              {todayPercentage}%
            </span>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">Completed</p>
          </div>
          <div className="w-20 sm:w-28 h-2.5 bg-cream-300 dark:bg-charcoal-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-forest-600 dark:bg-mint-400 rounded-full transition-all duration-500"
              style={{ width: `${todayPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Add Bar for Today */}
      <form
        onSubmit={handleQuickAdd}
        className="flex items-center gap-2 p-2 rounded-2xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft"
      >
        <div className="pl-3 text-stone-400">
          <Plus className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={quickInput}
          onChange={e => setQuickInput(e.target.value)}
          placeholder="Quick add task for today... (e.g. 'Revise graph algorithms priority high')"
          className="flex-1 px-2 py-2 text-xs sm:text-sm bg-transparent focus:outline-none text-stone-900 dark:text-cream-50 placeholder:text-stone-400"
        />
        <button
          type="submit"
          disabled={!quickInput.trim()}
          className="px-4 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 disabled:opacity-40 text-cream-50 text-xs font-semibold shadow-soft transition"
        >
          Add for Today
        </button>
      </form>

      {/* Pending Tasks Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-forest-950 dark:text-cream-50 flex items-center gap-2">
            <span>Pending For Today</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-forest-100 text-forest-800 dark:bg-forest-900/60 dark:text-mint-300">
              {pendingTasks.length}
            </span>
          </h3>

          <button
            onClick={() => onOpenNewTaskModal(todayStr)}
            className="text-xs font-semibold text-forest-700 dark:text-mint-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Detailed Task</span>
          </button>
        </div>

        {pendingTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDeleteRequest={onDeleteRequest}
                onStartFocus={onStartFocus}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 text-center space-y-2">
            <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
            <h4 className="text-sm font-bold text-stone-800 dark:text-cream-100">
              {completedTasks.length > 0
                ? "All clear! You've finished everything for today."
                : 'No tasks scheduled for today.'}
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              Enjoy your free time, focus on learning, or add a new task using the quick add bar above.
            </p>
          </div>
        )}
      </div>

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-cream-300 dark:border-charcoal-800">
          <h3 className="text-base font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-forest-600 dark:text-mint-400" />
            <span>Completed Today ({completedTasks.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDeleteRequest={onDeleteRequest}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
