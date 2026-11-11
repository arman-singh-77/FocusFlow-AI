import { Priority, Task, TaskCategory } from '../types/task';
import { getSampleTasks } from '../utils/sampleData';

export const TASKS_STORAGE_KEY = 'focusflow_tasks_v1';
export const LEGACY_TASKS_STORAGE_KEY = 'focusflow.tasks.v1';
const THEME_STORAGE_KEY = 'focusflow_theme_mode';
const SETTINGS_STORAGE_KEY = 'focusflow_settings';

const VALID_CATEGORIES: readonly TaskCategory[] = [
  'Study',
  'Coding',
  'Work',
  'Personal',
  'Health',
  'Assignment',
  'Other',
];

const VALID_PRIORITIES: readonly Priority[] = ['low', 'medium', 'high'];

function isValidCalendarDate(dateStr: unknown): dateStr is string {
  if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const parsed = new Date(`${dateStr}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === dateStr;
}

export function isValidTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false;

  const task = value as Record<string, unknown>;
  return (
    typeof task.id === 'string' &&
    task.id.length > 0 &&
    typeof task.title === 'string' &&
    task.title.trim().length > 0 &&
    isValidCalendarDate(task.dueDate) &&
    typeof task.priority === 'string' &&
    (VALID_PRIORITIES as readonly string[]).includes(task.priority) &&
    typeof task.category === 'string' &&
    (VALID_CATEGORIES as readonly string[]).includes(task.category) &&
    typeof task.completed === 'boolean' &&
    typeof task.createdAt === 'string'
  );
}

function mapSubjectToCategory(subject: string, title: string): TaskCategory {
  const exactMatch = VALID_CATEGORIES.find(
    cat => cat.toLowerCase() === subject.trim().toLowerCase()
  );
  if (exactMatch) return exactMatch;

  const combined = `${subject} ${title}`.toLowerCase();
  if (/\b(dsa|code|coding|python|react|ts|js|javascript|typescript|api|sql|programming|cs)\b/.test(combined)) {
    return 'Coding';
  }
  if (/\b(assignment|homework|worksheet|problem\s*set|lab|submission|essay)\b/.test(combined)) {
    return 'Assignment';
  }
  if (/\b(biology|history|literature|math|mathematics|chemistry|physics|science|study|chapter|notes|exam|reading)\b/.test(combined)) {
    return 'Study';
  }
  if (/\b(gym|run|health|workout|exercise|walk|meditate)\b/.test(combined)) {
    return 'Health';
  }
  if (/\b(work|meeting|project|report|slides|client)\b/.test(combined)) {
    return 'Work';
  }
  return 'Personal';
}

/**
 * Normalizes a task saved under the legacy Replit schema (`focusflow.tasks.v1`)
 * into the current unified Task shape. Returns null if malformed.
 */
export function normalizeTaskEntry(value: unknown): Task | null {
  if (isValidTask(value)) return value;
  if (typeof value !== 'object' || value === null) return null;

  const raw = value as Record<string, unknown>;
  if (
    typeof raw.id !== 'string' ||
    raw.id.length === 0 ||
    typeof raw.title !== 'string' ||
    raw.title.trim().length === 0 ||
    !isValidCalendarDate(raw.dueDate) ||
    typeof raw.completed !== 'boolean'
  ) {
    return null;
  }

  const rawPriority = typeof raw.priority === 'string' ? raw.priority.toLowerCase() : '';
  if (!(VALID_PRIORITIES as readonly string[]).includes(rawPriority)) {
    return null;
  }

  const subject = typeof raw.subject === 'string' ? raw.subject.trim() : '';
  if (!subject && typeof raw.category !== 'string') {
    return null;
  }

  const category =
    typeof raw.category === 'string' && (VALID_CATEGORIES as readonly string[]).includes(raw.category)
      ? (raw.category as TaskCategory)
      : mapSubjectToCategory(subject, raw.title);

  const description =
    typeof raw.description === 'string' && raw.description.trim().length > 0
      ? raw.description
      : subject && subject.toLowerCase() !== category.toLowerCase()
        ? `Subject: ${subject}`
        : undefined;

  return {
    id: raw.id,
    title: raw.title.trim(),
    ...(description ? { description } : {}),
    dueDate: raw.dueDate,
    ...(typeof raw.dueTime === 'string' ? { dueTime: raw.dueTime } : {}),
    priority: rawPriority as Priority,
    category,
    completed: raw.completed,
    ...(typeof raw.completedAt === 'string' ? { completedAt: raw.completedAt } : {}),
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
    ...(typeof raw.focusMinutes === 'number' ? { focusMinutes: raw.focusMinutes } : {}),
  };
}

export interface AppSettings {
  geminiApiKey?: string;
  useGemini: boolean;
  geminiModel: string;
  soundEnabled: boolean;
  defaultFocusMinutes: number;
  defaultShortBreakMinutes: number;
  defaultLongBreakMinutes: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: '',
  useGemini: false,
  geminiModel: 'gemini-2.5-flash',
  soundEnabled: true,
  defaultFocusMinutes: 25,
  defaultShortBreakMinutes: 5,
  defaultLongBreakMinutes: 15,
};

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export function loadTasksFromStorage(storage?: Partial<StorageLike>): Task[] {
  const store = storage ?? (typeof localStorage !== 'undefined' ? localStorage : undefined);
  if (!store?.getItem) {
    return getSampleTasks();
  }

  try {
    const raw = store.getItem(TASKS_STORAGE_KEY);
    if (raw !== null) {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return getSampleTasks();
      if (parsed.length === 0) return [];

      const validTasks = parsed
        .map(normalizeTaskEntry)
        .filter((t): t is Task => t !== null);

      return validTasks.length === 0 ? getSampleTasks() : validTasks;
    }

    // Legacy Replit key migration bridge (`focusflow.tasks.v1` -> `focusflow_tasks_v1`)
    const legacyRaw = store.getItem(LEGACY_TASKS_STORAGE_KEY);
    if (legacyRaw !== null) {
      const legacyParsed: unknown = JSON.parse(legacyRaw);
      if (Array.isArray(legacyParsed)) {
        if (legacyParsed.length === 0) return [];

        const migratedTasks = legacyParsed
          .map(normalizeTaskEntry)
          .filter((t): t is Task => t !== null);

        if (migratedTasks.length > 0) {
          saveTasksToStorage(migratedTasks, store);
          return migratedTasks;
        }
      }
    }

    // First-time user: initialize with sample tasks
    const initial = getSampleTasks();
    saveTasksToStorage(initial, store);
    return initial;
  } catch (err) {
    console.error('Failed to load tasks from storage:', err);
    return getSampleTasks();
  }
}

export function saveTasksToStorage(
  tasks: Task[],
  storage?: Pick<Storage, 'setItem'> | Partial<StorageLike>
): void {
  const store = storage ?? (typeof localStorage !== 'undefined' ? localStorage : undefined);
  if (!store?.setItem) return;

  try {
    store.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to storage:', err);
  }
}

export function loadSettingsFromStorage(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettingsToStorage(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function getSavedTheme(): 'light' | 'dark' | 'system' {
  try {
    const val = localStorage.getItem(THEME_STORAGE_KEY);
    if (val === 'light' || val === 'dark' || val === 'system') return val;
    return 'system';
  } catch {
    return 'system';
  }
}

export function setSavedTheme(theme: 'light' | 'dark' | 'system'): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (err) {
    console.error('Failed to save theme:', err);
  }
}

export function exportDataAsJson(tasks: Task[]): void {
  const exportPayload = {
    appName: 'FocusFlow AI',
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    tasks,
  };
  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `focusflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importDataFromJson(jsonString: string): { success: boolean; tasks?: Task[]; error?: string } {
  try {
    const data: unknown = JSON.parse(jsonString);
    const rawTasks: unknown[] | null = Array.isArray(data)
      ? data
      : typeof data === 'object' &&
          data !== null &&
          Array.isArray((data as Record<string, unknown>).tasks)
        ? ((data as Record<string, unknown>).tasks as unknown[])
        : null;

    if (!rawTasks) {
      return { success: false, error: 'Invalid JSON format: tasks array not found.' };
    }

    const validTasks: Task[] = rawTasks
      .map(normalizeTaskEntry)
      .filter((t: Task | null): t is Task => t !== null);

    if (rawTasks.length > 0 && validTasks.length === 0) {
      return { success: false, error: 'No valid tasks found in imported JSON.' };
    }

    return { success: true, tasks: validTasks };
  } catch {
    return { success: false, error: 'Could not parse JSON file.' };
  }
}
