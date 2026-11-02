import React from 'react';
import {
  Check,
  Clock,
  Calendar,
  AlertTriangle,
  Timer,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Task, Priority, TaskCategory } from '../../types/task';
import { isOverdue, formatDateTime, isToday } from '../../utils/dateUtils';
import { useTasks } from '../../context/TaskContext';
import { useTimer } from '../../context/TimerContext';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDeleteRequest: (task: Task) => void;
  onStartFocus?: (task: Task) => void;
}

const PRIORITY_STYLES: Record<Priority, { label: string; badge: string; border: string }> = {
  high: {
    label: 'High',
    badge: 'bg-rose-100/90 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-900',
    border: 'border-l-rose-500',
  },
  medium: {
    label: 'Medium',
    badge: 'bg-amber-100/90 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-900',
    border: 'border-l-amber-500',
  },
  low: {
    label: 'Low',
    badge: 'bg-mint-100 text-forest-800 dark:bg-forest-950/70 dark:text-mint-300 border-mint-200 dark:border-forest-800',
    border: 'border-l-mint-500',
  },
};

const CATEGORY_COLORS: Record<TaskCategory, string> = {
  Coding: 'bg-blue-100/70 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
  Assignment: 'bg-purple-100/70 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300',
  Study: 'bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
  Work: 'bg-indigo-100/70 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300',
  Health: 'bg-teal-100/70 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300',
  Personal: 'bg-stone-200/70 text-stone-800 dark:bg-stone-800 dark:text-stone-300',
  Other: 'bg-stone-200/70 text-stone-800 dark:bg-stone-800 dark:text-stone-300',
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDeleteRequest,
  onStartFocus,
}) => {
  const { toggleComplete } = useTasks();
  const { activeTaskId, setActiveTaskId, startTimer } = useTimer();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const overdue = isOverdue(task);
  const dueToday = isToday(task.dueDate);
  const priorityInfo = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;
  const isCurrentlyFocusing = activeTaskId === task.id;

  const handleStartTimer = () => {
    setActiveTaskId(task.id);
    startTimer();
    if (onStartFocus) onStartFocus(task);
  };

  return (
    <div
      className={`group relative flex flex-col justify-between p-4 rounded-2xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300/80 dark:border-charcoal-800 shadow-soft hover:shadow-soft-lg transition-all duration-200 border-l-4 ${priorityInfo.border} ${
        task.completed ? 'opacity-65' : ''
      }`}
    >
      <div>
        {/* Header row: Category, Priority, and Menu */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${
                CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Other
              }`}
            >
              {task.category}
            </span>

            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${priorityInfo.badge}`}
            >
              {priorityInfo.label}
            </span>

            {overdue && (
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                Overdue
              </span>
            )}

            {dueToday && !task.completed && !overdue && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-mint-100 text-forest-800 dark:bg-forest-900/60 dark:text-mint-300">
                Today
              </span>
            )}
          </div>

          {/* Action options */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-cream-200/60 dark:hover:bg-charcoal-800 transition"
              title="Task options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-7 z-30 w-36 rounded-xl bg-cream-50 dark:bg-charcoal-850 border border-cream-300 dark:border-charcoal-800 shadow-soft-lg py-1 text-xs text-stone-700 dark:text-stone-200">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(task);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-cream-200/60 dark:hover:bg-charcoal-800 text-left"
                  >
                    <Pencil className="w-3.5 h-3.5 text-stone-400" />
                    <span>Edit Task</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleStartTimer();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-cream-200/60 dark:hover:bg-charcoal-800 text-left text-forest-800 dark:text-mint-400 font-medium"
                  >
                    <Timer className="w-3.5 h-3.5 text-forest-600 dark:text-mint-400" />
                    <span>Focus on Task</span>
                  </button>

                  <div className="h-px bg-cream-300 dark:bg-charcoal-800 my-1" />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDeleteRequest(task);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Task</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Checkbox & Task Title */}
        <div className="flex items-start gap-3 mt-1">
          <button
            onClick={() => toggleComplete(task.id)}
            aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
            className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 border transition-all duration-200 ${
              task.completed
                ? 'bg-forest-700 dark:bg-mint-500 border-forest-700 dark:border-mint-500 text-cream-50'
                : 'border-stone-300 dark:border-charcoal-700 hover:border-forest-600 dark:hover:border-mint-400 bg-transparent'
            }`}
          >
            {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          <div className="flex-1 min-w-0">
            <h3
              className={`text-sm sm:text-base font-semibold tracking-tight text-forest-950 dark:text-cream-50 break-words ${
                task.completed ? 'line-through text-stone-400 dark:text-stone-500' : ''
              }`}
            >
              {task.title}
            </h3>

            {task.description && (
              <p
                className={`text-xs text-stone-600 dark:text-stone-400 mt-1 line-clamp-2 ${
                  task.completed ? 'line-through text-stone-400/80 dark:text-stone-600' : ''
                }`}
              >
                {task.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer row: Date/Time info & Quick Focus */}
      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-cream-200 dark:border-charcoal-800 text-xs text-stone-500 dark:text-stone-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
          <span className={overdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}>
            {formatDateTime(task.dueDate, task.dueTime)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {task.focusMinutes ? (
            <span
              className="flex items-center gap-1 text-[11px] font-medium text-forest-700 dark:text-mint-400"
              title={`${task.focusMinutes} minutes focused`}
            >
              <Clock className="w-3 h-3" />
              {task.focusMinutes}m
            </span>
          ) : null}

          {!task.completed && (
            <button
              onClick={handleStartTimer}
              title={isCurrentlyFocusing ? 'Active in timer' : 'Start Focus Session for this task'}
              className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors ${
                isCurrentlyFocusing
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-cream-200/80 hover:bg-mint-100 dark:bg-charcoal-800 dark:hover:bg-forest-900/60 text-forest-800 dark:text-mint-300'
              }`}
            >
              <Timer className="w-3 h-3" />
              <span>{isCurrentlyFocusing ? 'Focusing' : 'Focus'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
