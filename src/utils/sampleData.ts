import { Task } from '../types/task';
import { getTodayString, getTomorrowString, pad } from './dateUtils';

export function getSampleTasks(): Task[] {
  const today = getTodayString();
  const tomorrow = getTomorrowString();

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = `${yesterdayDate.getFullYear()}-${pad(yesterdayDate.getMonth() + 1)}-${pad(yesterdayDate.getDate())}`;

  const twoDaysAgoDate = new Date();
  twoDaysAgoDate.setDate(twoDaysAgoDate.getDate() - 2);
  const twoDaysAgo = `${twoDaysAgoDate.getFullYear()}-${pad(twoDaysAgoDate.getMonth() + 1)}-${pad(twoDaysAgoDate.getDate())}`;

  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 4);
  const nextWeek = `${nextWeekDate.getFullYear()}-${pad(nextWeekDate.getMonth() + 1)}-${pad(nextWeekDate.getDate())}`;

  return [
    { id: 'task-1', title: 'Review my algorithms notes', description: 'Go over the tree and dynamic programming problems from class.', dueDate: today, dueTime: '18:00', priority: 'high', category: 'Coding', completed: false, createdAt: new Date().toISOString(), focusMinutes: 25 },
    { id: 'task-2', title: 'Finish the data visualization assignment', description: 'Add the last two charts and write a short summary.', dueDate: tomorrow, dueTime: '16:00', priority: 'high', category: 'Assignment', completed: false, createdAt: new Date().toISOString(), focusMinutes: 50 },
    { id: 'task-3', title: 'Read the OS notes before class', description: 'Review the memory management lecture and mark anything to ask about.', dueDate: today, dueTime: '20:30', priority: 'medium', category: 'Study', completed: false, createdAt: new Date().toISOString(), focusMinutes: 0 },
    { id: 'task-4', title: 'Send in the networks lab report', description: 'Check the screenshots and attach the final report.', dueDate: yesterday, dueTime: '17:00', priority: 'high', category: 'Assignment', completed: false, createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), focusMinutes: 30 },
    { id: 'task-5', title: 'Read a chapter on system design', description: 'Take a few notes while reading.', dueDate: today, dueTime: '11:00', priority: 'low', category: 'Study', completed: true, completedAt: new Date().toISOString(), createdAt: new Date().toISOString(), focusMinutes: 45 },
    { id: 'task-6', title: 'Go for a run', description: 'Easy 30 minutes, weather permitting.', dueDate: today, dueTime: '19:00', priority: 'medium', category: 'Health', completed: false, createdAt: new Date().toISOString(), focusMinutes: 0 },
    { id: 'task-7', title: 'Put together slides for the project check-in', description: 'Add the latest progress and a couple of questions for the team.', dueDate: nextWeek, dueTime: '14:00', priority: 'medium', category: 'Work', completed: false, createdAt: new Date().toISOString(), focusMinutes: 0 },
    { id: 'task-8', title: 'Set up the starter app', description: 'Create the repo and get the basic page running.', dueDate: twoDaysAgo, dueTime: '12:00', priority: 'low', category: 'Coding', completed: true, completedAt: new Date(Date.now() - 86400000 * 2).toISOString(), createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), focusMinutes: 60 },
  ];
}
