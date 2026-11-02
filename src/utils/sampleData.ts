import { Task } from '../types/task';
import { getTodayString, getTomorrowString, pad } from './dateUtils';

export function getSampleTasks(): Task[] {
  const today = getTodayString();
  const tomorrow = getTomorrowString();

  // Create yesterday and 2-days-ago dates for overdue/history demo
  const d1 = new Date();
  d1.setDate(d1.getDate() - 1);
  const yesterday = `${d1.getFullYear()}-${pad(d1.getMonth() + 1)}-${pad(d1.getDate())}`;

  const d2 = new Date();
  d2.setDate(d2.getDate() - 2);
  const twoDaysAgo = `${d2.getFullYear()}-${pad(d2.getMonth() + 1)}-${pad(d2.getDate())}`;

  // Next week date
  const d3 = new Date();
  d3.setDate(d3.getDate() + 4);
  const nextWeek = `${d3.getFullYear()}-${pad(d3.getMonth() + 1)}-${pad(d3.getDate())}`;

  return [
    {
      id: 'task-1',
      title: 'DSA Practice — Binary Search Trees & DP',
      description: 'Solve 3 LeetCode medium questions and review optimal edge cases.',
      dueDate: today,
      dueTime: '18:00',
      priority: 'high',
      category: 'Coding',
      completed: false,
      createdAt: new Date().toISOString(),
      focusMinutes: 25,
    },
    {
      id: 'task-2',
      title: 'Python assignment: Data Visualization',
      description: 'Complete Seaborn plots and finalize Jupyter notebook conclusions.',
      dueDate: tomorrow,
      dueTime: '16:00',
      priority: 'high',
      category: 'Assignment',
      completed: false,
      createdAt: new Date().toISOString(),
      focusMinutes: 50,
    },
    {
      id: 'task-3',
      title: 'Review Operating Systems Memory Management',
      description: 'Paging, TLB lookups, and virtual memory slides for mid-term.',
      dueDate: today,
      dueTime: '20:30',
      priority: 'medium',
      category: 'Study',
      completed: false,
      createdAt: new Date().toISOString(),
      focusMinutes: 0,
    },
    {
      id: 'task-4',
      title: 'Submit Lab Report for Computer Networks',
      description: 'Wireshark packet capture analysis and subnet masking tables.',
      dueDate: yesterday,
      dueTime: '17:00',
      priority: 'high',
      category: 'Assignment',
      completed: false,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      focusMinutes: 30,
    },
    {
      id: 'task-5',
      title: 'Read System Design Chapter 3: Rate Limiting',
      description: 'Token bucket vs leaky bucket algorithm implementations.',
      dueDate: today,
      dueTime: '11:00',
      priority: 'low',
      category: 'Study',
      completed: true,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      focusMinutes: 45,
    },
    {
      id: 'task-6',
      title: '30-minute Evening Run & Mobility Stretch',
      description: 'Zone 2 cardio and hamstring recovery stretches.',
      dueDate: today,
      dueTime: '19:00',
      priority: 'medium',
      category: 'Health',
      completed: false,
      createdAt: new Date().toISOString(),
      focusMinutes: 0,
    },
    {
      id: 'task-7',
      title: 'Prepare Capstone Project Milestone Slides',
      description: 'Diagram system architecture, database schema, and test coverage.',
      dueDate: nextWeek,
      dueTime: '14:00',
      priority: 'medium',
      category: 'Work',
      completed: false,
      createdAt: new Date().toISOString(),
      focusMinutes: 0,
    },
    {
      id: 'task-8',
      title: 'Set up Vite + TypeScript project boilerplate',
      description: 'Initial repo setup, Tailwind config, and baseline component structure.',
      dueDate: twoDaysAgo,
      dueTime: '12:00',
      priority: 'low',
      category: 'Coding',
      completed: true,
      completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      focusMinutes: 60,
    },
  ];
}
