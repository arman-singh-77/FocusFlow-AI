import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, Flag } from 'lucide-react';
import { Task, Priority, TaskCategory } from '../../types/task';
import { getTodayString } from '../../utils/dateUtils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  initialTask?: Task | null;
  defaultDate?: string;
}

const CATEGORIES: TaskCategory[] = [
  'Study',
  'Coding',
  'Assignment',
  'Work',
  'Health',
  'Personal',
  'Other',
];

const PRIORITIES: { value: Priority; label: string; activeClass: string }[] = [
  { value: 'low', label: 'Low', activeClass: 'bg-mint-200 text-forest-900 border-forest-600' },
  { value: 'medium', label: 'Medium', activeClass: 'bg-amber-200 text-amber-900 border-amber-600' },
  { value: 'high', label: 'High', activeClass: 'bg-rose-200 text-rose-900 border-rose-600' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  defaultDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(defaultDate || getTodayString());
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<TaskCategory>('Coding');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setDueDate(initialTask.dueDate || getTodayString());
      setDueTime(initialTask.dueTime || '');
      setPriority(initialTask.priority);
      setCategory(initialTask.category);
    } else {
      setTitle('');
      setDescription('');
      setDueDate(defaultDate || getTodayString());
      setDueTime('');
      setPriority('medium');
      setCategory('Coding');
    }
    setError(null);
  }, [initialTask, isOpen, defaultDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      category,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-cream-50 dark:bg-charcoal-900 rounded-3xl border border-cream-300 dark:border-charcoal-800 shadow-soft-lg overflow-hidden transition-all duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 dark:border-charcoal-800">
          <div>
            <h3 className="text-lg font-bold text-forest-950 dark:text-cream-50">
              {initialTask ? 'Edit Task' : 'Create New Task'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {initialTask ? 'Update task details and due dates' : 'Add a task to your productivity flow'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-cream-200/50 dark:hover:bg-charcoal-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs font-medium text-rose-800 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-950/60 rounded-xl border border-rose-200 dark:border-rose-900">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. DSA Practice — Trees & Dynamic Programming"
              className="w-full px-3.5 py-2 text-sm bg-cream-100/60 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-600/40 text-stone-900 dark:text-cream-50 placeholder:text-stone-400 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Description <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add key notes, links, or sub-goals..."
              className="w-full px-3.5 py-2 text-sm bg-cream-100/60 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-600/40 text-stone-900 dark:text-cream-50 placeholder:text-stone-400 transition resize-none"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-cream-100/60 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-600/40 text-stone-900 dark:text-cream-50 transition"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                Due Time <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={e => setDueTime(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-cream-100/60 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-600/40 text-stone-900 dark:text-cream-50 transition"
              />
            </div>
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Priority selection */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                <Flag className="w-3.5 h-3.5 text-stone-400" />
                Priority
              </label>
              <div className="flex rounded-xl p-1 bg-cream-200/60 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 gap-1">
                {PRIORITIES.map(p => {
                  const isSelected = priority === p.value;
                  return (
                    <button
                      type="button"
                      key={p.value}
                      onClick={() => setPriority(p.value)}
                      className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                        isSelected
                          ? p.activeClass
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-cream-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category selection */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                <Tag className="w-3.5 h-3.5 text-stone-400" />
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-cream-100/60 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-600/40 text-stone-900 dark:text-cream-50 transition"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-cream-200 dark:border-charcoal-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-cream-200/50 dark:hover:bg-charcoal-800 rounded-xl transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-cream-50 bg-forest-700 hover:bg-forest-800 active:scale-[0.98] rounded-xl shadow-soft transition-all"
            >
              {initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
