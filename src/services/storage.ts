import { Task } from '../types/task';
import { getSampleTasks } from '../utils/sampleData';

const TASKS_STORAGE_KEY = 'focusflow_tasks_v1';
const THEME_STORAGE_KEY = 'focusflow_theme_mode';
const SETTINGS_STORAGE_KEY = 'focusflow_settings';

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

export function loadTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      // First time user: initialize with sample tasks
      const initial = getSampleTasks();
      saveTasksToStorage(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load tasks from localStorage:', err);
    return getSampleTasks();
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage:', err);
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
    const data = JSON.parse(jsonString);
    if (Array.isArray(data)) {
      return { success: true, tasks: data };
    }
    if (data && Array.isArray(data.tasks)) {
      return { success: true, tasks: data.tasks };
    }
    return { success: false, error: 'Invalid JSON format: tasks array not found.' };
  } catch (err) {
    return { success: false, error: 'Could not parse JSON file.' };
  }
}
