export type Task = {
  id: string;
  title: string;
  subject: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  completed: boolean;
};

export const STORAGE_KEY = 'focusflow.tasks.v1';

export const todayKey = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

function seededTasks(): Task[] {
  const today = todayKey();
  return [
    { id: 'seed-biology', title: 'Review cell structure notes', subject: 'Biology', priority: 'High', dueDate: today, completed: false },
    { id: 'seed-essay', title: 'Outline history essay', subject: 'History', priority: 'High', dueDate: today, completed: false },
    { id: 'seed-problemset', title: 'Finish problem set 6', subject: 'Mathematics', priority: 'Medium', dueDate: today, completed: false },
    { id: 'seed-reading', title: 'Read chapter 4 and annotate', subject: 'Literature', priority: 'Low', dueDate: today, completed: true },
  ];
}

export function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false;

  const task = value as Record<string, unknown>;
  const dueDate = typeof task.dueDate === 'string'
    ? new Date(`${task.dueDate}T00:00:00.000Z`)
    : null;
  const hasValidDueDate =
    typeof task.dueDate === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(task.dueDate) &&
    dueDate !== null &&
    !Number.isNaN(dueDate.getTime()) &&
    dueDate.toISOString().slice(0, 10) === task.dueDate;

  return (
    typeof task.id === 'string' &&
    task.id.length > 0 &&
    typeof task.title === 'string' &&
    task.title.trim().length > 0 &&
    typeof task.subject === 'string' &&
    task.subject.trim().length > 0 &&
    (task.priority === 'High' || task.priority === 'Medium' || task.priority === 'Low') &&
    hasValidDueDate &&
    typeof task.completed === 'boolean'
  );
}

export function loadTasks(storage?: Pick<Storage, 'getItem'>): Task[] {
  try {
    const saved = (storage ?? localStorage).getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed: unknown = JSON.parse(saved);
      if (!Array.isArray(parsed)) return seededTasks();

      const validTasks = parsed.filter(isTask);
      return parsed.length > 0 && validTasks.length === 0
        ? seededTasks()
        : validTasks;
    }
  } catch {
    return seededTasks();
  }
  return seededTasks();
}
