export type Priority = 'low' | 'medium' | 'high';

export type TaskCategory =
  | 'Study'
  | 'Coding'
  | 'Work'
  | 'Personal'
  | 'Health'
  | 'Assignment'
  | 'Other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm (24h)
  priority: Priority;
  category: TaskCategory;
  completed: boolean;
  completedAt?: string; // ISO string
  createdAt: string; // ISO string
  focusMinutes?: number; // Minutes spent focusing on this task
}

export type TaskFilter = 'all' | 'pending' | 'completed' | 'overdue';

export type TaskSortBy = 'dueDate' | 'priority' | 'title' | 'createdAt';

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  dueToday: number;
  completedToday: number;
  completionRate: number; // 0 - 100
  totalFocusMinutes: number;
}
