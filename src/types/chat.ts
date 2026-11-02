import { Task } from './task';

export type ChatRole = 'user' | 'assistant' | 'system';

export interface PendingAction {
  type: 'confirm_delete' | 'clarify_reschedule' | 'clarify_add';
  taskId?: string;
  taskTitle?: string;
  payload?: any;
  prompt: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  timestamp: string; // ISO string
  intent?: string;
  actionTaken?: {
    type: 'created' | 'updated' | 'deleted' | 'completed' | 'queried';
    task?: Task;
    tasks?: Task[];
    count?: number;
  };
  pendingAction?: PendingAction;
  suggestedQuickReplies?: string[];
  isGemini?: boolean;
}

export interface CommandParseResult {
  intent:
    | 'ADD_TASK'
    | 'MOVE_TASK'
    | 'COMPLETE_TASK'
    | 'DELETE_TASK'
    | 'QUERY_TODAY'
    | 'QUERY_OVERDUE'
    | 'QUERY_TASKS'
    | 'START_TIMER'
    | 'HELP'
    | 'UNKNOWN';
  confidence: number;
  params: {
    title?: string;
    dueDate?: string; // YYYY-MM-DD
    dueTime?: string; // HH:mm
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    targetTaskId?: string;
    filter?: string;
    minutes?: number;
  };
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  clarificationNeeded?: string;
}
