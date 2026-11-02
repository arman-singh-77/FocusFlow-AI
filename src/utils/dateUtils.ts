/**
 * Date utility functions for FocusFlow AI
 */

export const pad = (n: number) => n.toString().padStart(2, '0');

export function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function getTomorrowString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function isSameDay(dateStr1: string, dateStr2: string): boolean {
  return dateStr1 === dateStr2;
}

export function isToday(dateStr: string): boolean {
  return dateStr === getTodayString();
}

export function isTomorrow(dateStr: string): boolean {
  return dateStr === getTomorrowString();
}

export function isPast(dateStr: string, timeStr?: string): boolean {
  if (!dateStr) return false;
  const now = new Date();
  
  if (timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const [year, month, day] = dateStr.split('-').map(Number);
    const target = new Date(year, month - 1, day, hours || 0, minutes || 0, 0);
    return target < now;
  }

  const todayStr = getTodayString();
  return dateStr < todayStr;
}

export function isOverdue(task: { dueDate: string; dueTime?: string; completed: boolean }): boolean {
  if (task.completed) return false;
  return isPast(task.dueDate, task.dueTime);
}

export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return 'No date';
  if (isToday(dateStr)) return 'Today';
  if (isTomorrow(dateStr)) return 'Tomorrow';
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (dateStr === formatDateString(yesterday)) return 'Yesterday';

  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  
  const currentYear = today.getFullYear();
  if (year === currentYear) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(timeStr?: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${pad(m)} ${period}`;
}

export function formatDateTime(dateStr: string, timeStr?: string): string {
  const dateLabel = formatFriendlyDate(dateStr);
  if (timeStr) {
    return `${dateLabel} at ${formatTime(timeStr)}`;
  }
  return dateLabel;
}

/**
 * Parses natural language date phrases like "tomorrow", "today", "friday", "next monday", etc.
 * Returns { date: 'YYYY-MM-DD', time?: 'HH:mm' } or null
 */
export function parseNaturalDateAndTimeString(text: string): { date?: string; time?: string; matchedText?: string } {
  const lower = text.toLowerCase();
  const now = new Date();
  let targetDate: Date | null = null;
  let parsedTime: string | undefined = undefined;
  let matchedParts: string[] = [];

  // Extract time: "6 PM", "6:30 pm", "18:00", "at 5pm", "at 14:30"
  const timeRegex = /(?:at\s+)?(\b\d{1,2})(?::(\d{2}))?\s*(am|pm)\b|(?:\bat\s+)(\d{1,2}):(\d{2})\b/i;
  const timeMatch = lower.match(timeRegex);
  if (timeMatch) {
    matchedParts.push(timeMatch[0]);
    if (timeMatch[3]) {
      // 12-hour format with am/pm
      let hour = parseInt(timeMatch[1], 10);
      const min = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const meridiem = timeMatch[3].toLowerCase();
      if (meridiem === 'pm' && hour < 12) hour += 12;
      if (meridiem === 'am' && hour === 12) hour = 0;
      parsedTime = `${pad(hour)}:${pad(min)}`;
    } else if (timeMatch[4] && timeMatch[5]) {
      // 24-hour format
      parsedTime = `${pad(parseInt(timeMatch[4], 10))}:${pad(parseInt(timeMatch[5], 10))}`;
    }
  }

  // Check common keywords
  if (/\btoday\b/.test(lower)) {
    targetDate = new Date(now);
    matchedParts.push('today');
  } else if (/\btomorrow\b/.test(lower)) {
    targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + 1);
    matchedParts.push('tomorrow');
  } else if (/\bday after tomorrow\b/.test(lower)) {
    targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + 2);
    matchedParts.push('day after tomorrow');
  } else if (/\byesterday\b/.test(lower)) {
    targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - 1);
    matchedParts.push('yesterday');
  } else {
    // Check day of week: monday, tuesday, etc.
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < daysOfWeek.length; i++) {
      const dayName = daysOfWeek[i];
      const nextMatch = new RegExp(`\\b(?:next\\s+)?${dayName}\\b`, 'i').exec(lower);
      if (nextMatch) {
        matchedParts.push(nextMatch[0]);
        const currentDayIndex = now.getDay();
        let daysUntil = (i - currentDayIndex + 7) % 7;
        if (daysUntil === 0) daysUntil = 7; // if today is Friday and user says Friday, mean next Friday
        if (nextMatch[0].startsWith('next') && daysUntil < 7) {
          daysUntil += 7;
        }
        targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + daysUntil);
        break;
      }
    }
  }

  // Check specific dates like "Oct 25", "25th October", "2026-10-25"
  if (!targetDate) {
    const isoDateMatch = lower.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
    if (isoDateMatch) {
      targetDate = new Date(parseInt(isoDateMatch[1]), parseInt(isoDateMatch[2]) - 1, parseInt(isoDateMatch[3]));
      matchedParts.push(isoDateMatch[0]);
    }
  }

  return {
    date: targetDate ? formatDateString(targetDate) : undefined,
    time: parsedTime,
    matchedText: matchedParts.join(' ').trim(),
  };
}
