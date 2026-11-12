import { Task, Priority, TaskCategory } from '../types/task';
import { CommandParseResult } from '../types/chat';
import {
  getTodayString,
  parseNaturalDateAndTimeString,
  isOverdue,
  isToday,
  formatFriendlyDate,
  formatTime,
} from '../utils/dateUtils';

/**
 * Infer category from task title keywords
 */
export function inferCategory(text: string): TaskCategory {
  const lower = text.toLowerCase();
  if (/\b(dsa|leetcode|python|code|coding|react|ts|bug|api|git|dev|database|sql)\b/.test(lower)) {
    return 'Coding';
  }
  if (/\b(assignment|homework|lab\s+report|submission|submit|project\s+milestone)\b/.test(lower)) {
    return 'Assignment';
  }
  if (/\b(study|read|reading|chapter|notes|revision|exam|quiz|learn|lecture)\b/.test(lower)) {
    return 'Study';
  }
  if (/\b(gym|run|workout|stretch|exercise|walk|health|meditate|sleep)\b/.test(lower)) {
    return 'Health';
  }
  if (/\b(meeting|sync|presentation|slides|client|email|work|report)\b/.test(lower)) {
    return 'Work';
  }
  return 'Personal';
}

/**
 * Infer priority from text
 */
export function inferPriority(text: string): Priority {
  const lower = text.toLowerCase();
  if (/\b(urgent|high\s+priority|priority\s+high|asap|critical|important)\b/.test(lower)) {
    return 'high';
  }
  if (/\b(low\s+priority|priority\s+low|whenever|someday)\b/.test(lower)) {
    return 'low';
  }
  return 'medium';
}

/**
 * Fuzzy search to match task by title
 */
export function findMatchingTask(tasks: Task[], query: string): { task?: Task; matches: Task[] } {
  const cleanQuery = query.toLowerCase().trim();
  if (!cleanQuery) return { matches: [] };

  // Exact match
  const exact = tasks.find(t => t.title.toLowerCase() === cleanQuery);
  if (exact) return { task: exact, matches: [exact] };

  // Substring match
  const substringMatches = tasks.filter(t => t.title.toLowerCase().includes(cleanQuery));
  if (substringMatches.length === 1) {
    return { task: substringMatches[0], matches: substringMatches };
  }
  if (substringMatches.length > 1) {
    return { matches: substringMatches };
  }

  // Word token overlap match
  const words = cleanQuery.split(/\s+/).filter(w => w.length > 2);
  const tokenMatches = tasks.filter(t => {
    const taskTitle = t.title.toLowerCase();
    return words.some(w => taskTitle.includes(w));
  });

  return {
    task: tokenMatches.length === 1 ? tokenMatches[0] : undefined,
    matches: tokenMatches,
  };
}

/**
 * Deterministic Natural Language Parser for Task Commands
 */
export function parseTaskCommand(input: string, currentTasks: Task[]): CommandParseResult {
  const text = input.trim();
  const lower = text.toLowerCase();

  // 1. HELP
  if (/^(help|\?|what can you do|commands|options)$/i.test(lower)) {
    return {
      intent: 'HELP',
      confidence: 1.0,
      params: {},
    };
  }

  // 2. QUERY OVERDUE
  if (
    /(overdue|what\s+did\s+i\s+miss|missed\s+tasks|past\s+due)/i.test(lower) &&
    !/(add|create|move|delete|reschedule)/i.test(lower)
  ) {
    return {
      intent: 'QUERY_OVERDUE',
      confidence: 0.95,
      params: {},
    };
  }

  // 3. QUERY TODAY
  if (
    /(what\s+should\s+i\s+do\s+today|today('?s)?\s+tasks|what('?s)?\s+on\s+my\s+plate|tasks\s+for\s+today|show\s+today)/i.test(lower) &&
    !/(add|create|move|delete|reschedule)/i.test(lower)
  ) {
    return {
      intent: 'QUERY_TODAY',
      confidence: 0.95,
      params: {},
    };
  }

  // 4. QUERY TASKS GENERAL / FILTER
  if (/^(show|list|get|display|view)\s+(all\s+tasks|tasks|pending|high\s+priority|coding|study)/i.test(lower)) {
    let filter = 'all';
    if (/high\s+priority/i.test(lower)) filter = 'high';
    if (/pending/i.test(lower)) filter = 'pending';
    if (/completed/i.test(lower)) filter = 'completed';

    return {
      intent: 'QUERY_TASKS',
      confidence: 0.9,
      params: { filter },
    };
  }

  // 5. START TIMER
  if (/(start|begin|run)\s+(focus|timer|pomodoro|session)/i.test(lower)) {
    const minMatch = lower.match(/(\d+)\s*(?:min|minute)/);
    const minutes = minMatch ? parseInt(minMatch[1], 10) : 25;
    return {
      intent: 'START_TIMER',
      confidence: 0.95,
      params: { minutes },
    };
  }

  // 6. DELETE TASK (Destructive -> Confirmation mandatory)
  if (/^(delete|remove|erase|cancel)\s+(task\s+)?(.+)/i.test(lower)) {
    const match = lower.match(/^(?:delete|remove|erase|cancel)\s+(?:task\s+)?(.+)/i);
    const searchTarget = match ? match[1].trim() : '';

    if (!searchTarget) {
      return {
        intent: 'DELETE_TASK',
        confidence: 0.8,
        params: {},
        clarificationNeeded: 'Which task would you like to delete? Please provide the task title.',
      };
    }

    const { task, matches } = findMatchingTask(currentTasks, searchTarget);
    if (!task) {
      if (matches.length > 1) {
        return {
          intent: 'DELETE_TASK',
          confidence: 0.8,
          params: {},
          clarificationNeeded: `I found multiple matching tasks: ${matches.map(m => `"${m.title}"`).join(', ')}. Which one did you want to delete?`,
        };
      }
      return {
        intent: 'UNKNOWN',
        confidence: 0.5,
        params: {},
        clarificationNeeded: `I couldn't find a task matching "${searchTarget}". Check your task list or try an exact title.`,
      };
    }

    return {
      intent: 'DELETE_TASK',
      confidence: 0.95,
      params: { targetTaskId: task.id, title: task.title },
      requiresConfirmation: true,
      confirmationMessage: `Are you sure you want to permanently delete "${task.title}"?`,
    };
  }

  // 7. COMPLETE / FINISH TASK
  if (/^(complete|finish|mark\s+as\s+(done|completed)|done\s+with|check\s+off)\s+(task\s+)?(.+)/i.test(lower)) {
    const match = lower.match(/^(?:complete|finish|mark\s+as\s+(?:done|completed)|done\s+with|check\s+off)\s+(?:task\s+)?(.+)/i);
    const searchTarget = match ? match[3].replace(/\s+(as\s+(done|completed))$/, '').trim() : '';

    if (!searchTarget) {
      return {
        intent: 'COMPLETE_TASK',
        confidence: 0.8,
        params: {},
        clarificationNeeded: 'Which task did you complete?',
      };
    }

    const { task, matches } = findMatchingTask(currentTasks, searchTarget);
    if (!task) {
      if (matches.length > 1) {
        return {
          intent: 'COMPLETE_TASK',
          confidence: 0.8,
          params: {},
          clarificationNeeded: `Multiple tasks match "${searchTarget}": ${matches.map(m => `"${m.title}"`).join(', ')}. Please specify.`,
        };
      }
      return {
        intent: 'UNKNOWN',
        confidence: 0.5,
        params: {},
        clarificationNeeded: `I couldn't find a task matching "${searchTarget}".`,
      };
    }

    return {
      intent: 'COMPLETE_TASK',
      confidence: 0.95,
      params: { targetTaskId: task.id, title: task.title },
    };
  }

  // 8. MOVE / RESCHEDULE TASK
  // Examples: "move my Python assignment to Friday", "reschedule DSA practice to tomorrow at 6 PM"
  if (/(?:move|reschedule|postpone|shift|change\s+(?:due\s+date|time)\s+of)\s+(.+)/i.test(lower)) {
    const parsedDate = parseNaturalDateAndTimeString(text);
    
    // Extract task search part: remove move/reschedule prefix and remove the date parts
    let searchPart = text
      .replace(/^(?:move|reschedule|postpone|shift|change\s+(?:due\s+date|time)\s+(?:of|for)?)\s+/i, '')
      .replace(/\s+(?:to|until|for)\s+.+$/i, '')
      .replace(/\s+my\s+/i, ' ')
      .trim();

    if (!parsedDate.date && !parsedDate.time) {
      // Date wasn't found in natural parse, check if destination was mentioned
      return {
        intent: 'MOVE_TASK',
        confidence: 0.8,
        params: { title: searchPart },
        clarificationNeeded: `When would you like to move "${searchPart}" to? (e.g. "tomorrow at 6 PM", "Friday")`,
      };
    }

    const { task, matches } = findMatchingTask(currentTasks, searchPart);
    if (!task) {
      if (matches.length > 1) {
        return {
          intent: 'MOVE_TASK',
          confidence: 0.8,
          params: { dueDate: parsedDate.date, dueTime: parsedDate.time },
          clarificationNeeded: `Multiple tasks matched "${searchPart}": ${matches.map(m => `"${m.title}"`).join(', ')}. Which one?`,
        };
      }
      return {
        intent: 'UNKNOWN',
        confidence: 0.5,
        params: {},
        clarificationNeeded: `I couldn't find a task matching "${searchPart}" to reschedule.`,
      };
    }

    return {
      intent: 'MOVE_TASK',
      confidence: 0.95,
      params: {
        targetTaskId: task.id,
        title: task.title,
        dueDate: parsedDate.date || task.dueDate,
        dueTime: parsedDate.time || task.dueTime,
      },
    };
  }

  // 9. ADD TASK
  // Examples: "add DSA practice tomorrow at 6 PM", "create task finish report by Friday 5pm priority high"
  if (/^(add|create|new\s+task|remind\s+me\s+to|schedule)\s+(.+)/i.test(lower)) {
    const rawContent = text.replace(/^(?:add|create|new\s+task:?|remind\s+me\s+to|schedule)\s+(?:task\s+)?/i, '').trim();

    const parsedDateTime = parseNaturalDateAndTimeString(rawContent);
    const priority = inferPriority(rawContent);

    // Remove date and time phrases separately because matched text can be reordered.
    let cleanTitle = rawContent
      .replace(/\b(?:day after tomorrow|today|tomorrow|yesterday)\b/gi, '')
      .replace(/\b(?:next\s+)?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '')
      .replace(/\b\d{4}-\d{1,2}-\d{1,2}\b/g, '')
      .replace(/\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?\b/gi, '')
      .replace(/\b\d{1,2}(?:st|nd|rd|th)?\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/gi, '')
      .replace(/\b(?:at\s*)?\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/gi, '')
      .replace(/\bat\s+\d{1,2}:\d{2}\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    // Remove priority phrases from title
    cleanTitle = cleanTitle
      .replace(/\b(?:with\s+)?(?:high|medium|low)\s+priority\b/gi, '')
      .replace(/\b(?:priority\s+(?:high|medium|low))\b/gi, '')
      .replace(/\b(?:urgent|asap)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Check if title is empty or ambiguous
    if (!cleanTitle || cleanTitle.length < 2) {
      return {
        intent: 'ADD_TASK',
        confidence: 0.7,
        params: {
          dueDate: parsedDateTime.date || getTodayString(),
          dueTime: parsedDateTime.time,
          priority,
        },
        clarificationNeeded: 'What is the title or description of the task you would like to add?',
      };
    }

    const category = inferCategory(cleanTitle);

    return {
      intent: 'ADD_TASK',
      confidence: 0.95,
      params: {
        title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
        dueDate: parsedDateTime.date || getTodayString(),
        dueTime: parsedDateTime.time,
        priority,
        category,
      },
    };
  }

  // Fallback: If input doesn't match a command, check if user just typed a task title to add
  if (text.length > 2 && text.length < 80 && !text.includes('?')) {
    const parsedDateTime = parseNaturalDateAndTimeString(text);
    return {
      intent: 'ADD_TASK',
      confidence: 0.6,
      params: {
        title: text.charAt(0).toUpperCase() + text.slice(1),
        dueDate: parsedDateTime.date || getTodayString(),
        dueTime: parsedDateTime.time,
        priority: 'medium',
        category: inferCategory(text),
      },
    };
  }

  return {
    intent: 'UNKNOWN',
    confidence: 0.2,
    params: {},
    clarificationNeeded: `I didn't quite catch that. You can say things like:
• "Add grocery shopping tomorrow at 5 PM"
• "Move my lab report to Friday"
• "What should I do today?"
• "Which tasks are overdue?"
• "Mark my notes as done"
• "Delete [task title]"`,
  };
}

/**
 * Format today's task list response
 */
export function formatTodayTasksResponse(tasks: Task[]): { text: string; tasks: Task[] } {
  const todayTasks = tasks.filter(t => isToday(t.dueDate));
  const pending = todayTasks.filter(t => !t.completed);
  const completed = todayTasks.filter(t => t.completed);

  if (todayTasks.length === 0) {
    return {
      text: "You have no tasks scheduled for today! Would you like to add one? (e.g. 'Add grocery shopping today at 5 PM')",
      tasks: [],
    };
  }

  if (pending.length === 0) {
    return {
      text: `🎉 You've completed all ${completed.length} task${completed.length > 1 ? 's' : ''} scheduled for today! Great job staying focused.`,
      tasks: todayTasks,
    };
  }

  // Sort pending by priority: high -> medium -> low
  const priorityWeight: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
  const sortedPending = [...pending].sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

  const listItems = sortedPending.map(t => {
    const time = t.dueTime ? ` (${formatTime(t.dueTime)})` : '';
    const badge = t.priority === 'high' ? '🔥 [High]' : t.priority === 'medium' ? '⚡ [Medium]' : '🌱 [Low]';
    return `• **${t.title}**${time} — ${badge} [${t.category}]`;
  }).join('\n');

  const text = `Here is what you have on your plate for today (${sortedPending.length} pending, ${completed.length} done):\n\n${listItems}`;
  return { text, tasks: sortedPending };
}

/**
 * Format overdue tasks response
 */
export function formatOverdueTasksResponse(tasks: Task[]): { text: string; tasks: Task[] } {
  const overdueTasks = tasks.filter(t => isOverdue(t));

  if (overdueTasks.length === 0) {
    return {
      text: "✨ No overdue tasks! You're completely up to date. Keep up the great momentum!",
      tasks: [],
    };
  }

  const listItems = overdueTasks.map(t => {
    const dateLabel = formatFriendlyDate(t.dueDate);
    const time = t.dueTime ? ` at ${formatTime(t.dueTime)}` : '';
    return `• **${t.title}** (Was due ${dateLabel}${time}) — [${t.category}]`;
  }).join('\n');

  const text = `⚠️ You have **${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}** needing your attention:\n\n${listItems}\n\nTip: You can say "Move [task] to tomorrow" or click to complete them.`;
  return { text, tasks: overdueTasks };
}
