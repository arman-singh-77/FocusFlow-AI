import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Task, TaskFilter, TaskSortBy, TaskStats } from '../types/task';
import { loadTasksFromStorage, saveTasksToStorage } from '../services/storage';
import { getSampleTasks } from '../utils/sampleData';
import { isToday, isOverdue } from '../utils/dateUtils';
import { soundService } from '../services/sound';

interface TaskContextType {
  tasks: Task[];
  stats: TaskStats;
  addTask: (data: Omit<Task, 'id' | 'createdAt' | 'completed'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  addFocusMinutes: (id: string, minutes: number) => void;
  loadSampleData: () => void;
  clearAllTasks: () => void;
  importTasks: (imported: Task[]) => void;
  
  // Search & Filter state
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedPriority: string;
  setSelectedPriority: (p: string) => void;
  selectedFilter: TaskFilter;
  setSelectedFilter: (f: TaskFilter) => void;
  sortBy: TaskSortBy;
  setSortBy: (s: TaskSortBy) => void;
  filteredTasks: Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedFilter, setSelectedFilter] = useState<TaskFilter>('all');
  const [sortBy, setSortBy] = useState<TaskSortBy>('dueDate');

  // Sync to localStorage
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  const addTask = (data: Omit<Task, 'id' | 'createdAt' | 'completed'>): Task => {
    const newTask: Task = {
      ...data,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      completed: false,
      createdAt: new Date().toISOString(),
      focusMinutes: 0,
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === id) {
          const updated = { ...task, ...updates };
          // If completion status changed to true
          if (!task.completed && updates.completed === true) {
            updated.completedAt = new Date().toISOString();
            soundService.playTaskComplete();
          } else if (task.completed && updates.completed === false) {
            updated.completedAt = undefined;
          }
          return updated;
        }
        return task;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const toggleComplete = (id: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === id) {
          const nextCompleted = !task.completed;
          if (nextCompleted) {
            soundService.playTaskComplete();
          }
          return {
            ...task,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return task;
      })
    );
  };

  const addFocusMinutes = (id: string, minutes: number) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === id) {
          return {
            ...task,
            focusMinutes: (task.focusMinutes || 0) + minutes,
          };
        }
        return task;
      })
    );
  };

  const loadSampleData = () => {
    const samples = getSampleTasks();
    setTasks(samples);
  };

  const clearAllTasks = () => {
    setTasks([]);
  };

  const importTasks = (imported: Task[]) => {
    setTasks(imported);
  };

  // Compute stats
  const stats: TaskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(t => isOverdue(t)).length;
    const todayTasks = tasks.filter(t => isToday(t.dueDate));
    const dueToday = todayTasks.length;
    const completedToday = todayTasks.filter(t => t.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalFocusMinutes = tasks.reduce((sum, t) => sum + (t.focusMinutes || 0), 0);

    return {
      total,
      completed,
      pending,
      overdue,
      dueToday,
      completedToday,
      completionRate,
      totalFocusMinutes,
    };
  }, [tasks]);

  // Compute filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = task.title.toLowerCase().includes(q);
          const matchesDesc = task.description?.toLowerCase().includes(q);
          const matchesCat = task.category.toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc && !matchesCat) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && task.category !== selectedCategory) {
          return false;
        }

        // Priority filter
        if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
          return false;
        }

        // Status filter
        if (selectedFilter === 'completed' && !task.completed) return false;
        if (selectedFilter === 'pending' && task.completed) return false;
        if (selectedFilter === 'overdue' && !isOverdue(task)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const weights = { high: 3, medium: 2, low: 1 };
          return weights[b.priority] - weights[a.priority];
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'createdAt') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        // Default: dueDate
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const dateDiff = a.dueDate.localeCompare(b.dueDate);
        if (dateDiff !== 0) return dateDiff;
        // Compare times if on the same date
        return (a.dueTime || '23:59').localeCompare(b.dueTime || '23:59');
      });
  }, [tasks, searchQuery, selectedCategory, selectedPriority, selectedFilter, sortBy]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        stats,
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        addFocusMinutes,
        loadSampleData,
        clearAllTasks,
        importTasks,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedPriority,
        setSelectedPriority,
        selectedFilter,
        setSelectedFilter,
        sortBy,
        setSortBy,
        filteredTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export function useTasks(): TaskContextType {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
