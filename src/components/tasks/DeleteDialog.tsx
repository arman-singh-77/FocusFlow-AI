import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Task } from '../../types/task';

interface DeleteDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  task,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md bg-cream-50 dark:bg-charcoal-900 rounded-3xl border border-cream-300 dark:border-charcoal-800 shadow-soft-lg p-6 space-y-4"
        role="alertdialog"
        aria-modal="true"
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-cream-50">
            Delete Task?
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Are you sure you want to permanently delete{' '}
            <span className="font-semibold text-stone-900 dark:text-cream-50">
              "{task.title}"
            </span>
            ? This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-cream-200/60 dark:hover:bg-charcoal-800 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-cream-50 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] rounded-xl shadow-soft transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
};
