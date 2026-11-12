import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Bot,
  RotateCcw,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useTimer } from '../../context/TimerContext';
import { ChatMessage as ChatMessageType, PendingAction } from '../../types/chat';
import { ChatMessage } from './ChatMessage';
import { SuggestedPrompts } from './SuggestedPrompts';
import {
  parseTaskCommand,
  formatTodayTasksResponse,
  formatOverdueTasksResponse,
} from '../../services/taskEngine';
import { loadSettingsFromStorage } from '../../services/storage';
import { askGemini } from '../../services/gemini';
import { formatDateTime, getTodayString } from '../../utils/dateUtils';

interface FlowChatbotProps {
  onNavigateToTimer?: () => void;
}

const INITIAL_MESSAGE: ChatMessageType = {
  id: 'msg-welcome',
  role: 'assistant',
  text: `Hi, I'm **FlowAI**. I can help keep your day organized.

I can manage your tasks directly through natural conversation:
• "Add grocery shopping tomorrow at 5 PM"
• "Move my lab report to Friday"
• "What should I do today?"
• "Which tasks are overdue?"
• "Mark my notes as done"
• "Start focus timer for 25 minutes"

How can I help you flow today?`,
  timestamp: new Date().toISOString(),
  suggestedQuickReplies: [
    'What should I do today?',
    'Which tasks are overdue?',
    'Add grocery shopping tomorrow at 5 PM',
  ],
};

export const FlowChatbot: React.FC<FlowChatbotProps> = ({ onNavigateToTimer }) => {
  const { tasks, addTask, updateTask, deleteTask, toggleComplete } = useTasks();
  const { startTimer, setMode } = useTimer();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activePendingAction, setActivePendingAction] = useState<PendingAction | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const settings = loadSettingsFromStorage();
  const isGeminiActive = settings.useGemini && !!settings.geminiApiKey;

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  // Execute a verified command on the task store
  const executeCommand = (cmd: ReturnType<typeof parseTaskCommand>) => {
    // 1. HELP
    if (cmd.intent === 'HELP') {
      return {
        text: `Here is what I can do for you:
• **Add task**: "Add grocery shopping tomorrow at 5 PM"
• **Reschedule**: "Move my lab report to Friday"
• **Query Today**: "What should I do today?"
• **Query Overdue**: "Which tasks are overdue?"
• **Complete**: "Mark my notes as done"
• **Delete**: "Delete [task title]" (requires confirmation)
• **Focus**: "Start focus timer 25 minutes"`,
        suggestedQuickReplies: ['What should I do today?', 'Which tasks are overdue?'],
      };
    }

    // 2. QUERY TODAY
    if (cmd.intent === 'QUERY_TODAY') {
      const { text, tasks: todayList } = formatTodayTasksResponse(tasks);
      return {
        text,
        actionTaken: { type: 'queried' as const, tasks: todayList },
        suggestedQuickReplies: todayList.length > 0 ? [`Complete ${todayList[0].title}`] : ['Add grocery shopping today'],
      };
    }

    // 3. QUERY OVERDUE
    if (cmd.intent === 'QUERY_OVERDUE') {
      const { text, tasks: overdueList } = formatOverdueTasksResponse(tasks);
      return {
        text,
        actionTaken: { type: 'queried' as const, tasks: overdueList },
        suggestedQuickReplies: overdueList.length > 0 ? [`Move ${overdueList[0].title} to tomorrow`] : ['What should I do today?'],
      };
    }

    // 4. QUERY TASKS GENERAL
    if (cmd.intent === 'QUERY_TASKS') {
      let filtered = tasks;
      let label = 'all tasks';
      if (cmd.params.filter === 'high') {
        filtered = tasks.filter(t => t.priority === 'high' && !t.completed);
        label = 'high-priority pending tasks';
      } else if (cmd.params.filter === 'pending') {
        filtered = tasks.filter(t => !t.completed);
        label = 'pending tasks';
      } else if (cmd.params.filter === 'completed') {
        filtered = tasks.filter(t => t.completed);
        label = 'completed tasks';
      }

      if (filtered.length === 0) {
        return { text: `No ${label} found.` };
      }

      const listStr = filtered.slice(0, 5).map(t => `• **${t.title}** (${formatDateTime(t.dueDate, t.dueTime)})`).join('\n');
      return {
        text: `Here are your ${label} (${filtered.length} total):\n\n${listStr}`,
        actionTaken: { type: 'queried' as const, tasks: filtered },
      };
    }

    // 5. START TIMER
    if (cmd.intent === 'START_TIMER') {
      setMode('focus');
      startTimer();
      if (onNavigateToTimer) onNavigateToTimer();
      return {
        text: `⏱️ Started a **25-minute Pomodoro focus session**. Deep flow mode activated!`,
      };
    }

    // 6. DELETE TASK (Destructive -> Confirmation mandatory)
    if (cmd.intent === 'DELETE_TASK') {
      if (cmd.requiresConfirmation && cmd.params.targetTaskId) {
        const pending: PendingAction = {
          type: 'confirm_delete',
          taskId: cmd.params.targetTaskId,
          taskTitle: cmd.params.title,
          prompt: cmd.confirmationMessage || `Are you sure you want to permanently delete "${cmd.params.title}"?`,
        };
        setActivePendingAction(pending);

        return {
          text: `⚠️ Deletion is permanent. Please confirm below:`,
          pendingAction: pending,
        };
      }
    }

    // 7. COMPLETE TASK
    if (cmd.intent === 'COMPLETE_TASK') {
      if (cmd.params.targetTaskId) {
        toggleComplete(cmd.params.targetTaskId);
        const target = tasks.find(t => t.id === cmd.params.targetTaskId);
        return {
          text: `✅ Marked **"${cmd.params.title || target?.title}"** as completed! Great progress.`,
          actionTaken: { type: 'completed' as const, task: target },
        };
      }
    }

    // 8. MOVE / RESCHEDULE TASK
    if (cmd.intent === 'MOVE_TASK') {
      if (cmd.params.targetTaskId && cmd.params.dueDate) {
        updateTask(cmd.params.targetTaskId, {
          dueDate: cmd.params.dueDate,
          dueTime: cmd.params.dueTime,
        });
        const target = tasks.find(t => t.id === cmd.params.targetTaskId);
        return {
          text: `📅 Rescheduled **"${cmd.params.title || target?.title}"** to **${formatDateTime(cmd.params.dueDate, cmd.params.dueTime)}**.`,
          actionTaken: {
            type: 'updated' as const,
            task: target ? { ...target, dueDate: cmd.params.dueDate, dueTime: cmd.params.dueTime } : undefined,
          },
        };
      }
    }

    // 9. ADD TASK
    if (cmd.intent === 'ADD_TASK') {
      if (cmd.params.title) {
        const created = addTask({
          title: cmd.params.title,
          dueDate: cmd.params.dueDate || getTodayString(),
          dueTime: cmd.params.dueTime,
          priority: cmd.params.priority || 'medium',
          category: (cmd.params.category as any) || 'Coding',
        });

        return {
          text: `✨ Successfully added **"${created.title}"** to your schedule for **${formatDateTime(created.dueDate, created.dueTime)}** with **${created.priority}** priority [${created.category}].`,
          actionTaken: { type: 'created' as const, task: created },
        };
      }
    }

    // Ambiguity / clarification
    if (cmd.clarificationNeeded) {
      return {
        text: cmd.clarificationNeeded,
      };
    }

    return {
      text: "I couldn't complete that action. Type 'help' to see what commands I support.",
    };
  };

  const handleSendMessage = async (userPromptText?: string) => {
    const rawInput = userPromptText || inputText;
    if (!rawInput.trim() || isProcessing) return;

    const userMsg: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: rawInput.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      // Check if user is confirming or canceling an active pending action via text
      const lower = rawInput.toLowerCase().trim();
      if (activePendingAction) {
        if (/^(yes|confirm|ok|delete|do it)$/i.test(lower)) {
          handleConfirmAction(activePendingAction);
          setIsProcessing(false);
          return;
        } else if (/^(no|cancel|stop|abort|don't)$/i.test(lower)) {
          handleCancelAction();
          setIsProcessing(false);
          return;
        }
      }

      // Check Gemini AI first if configured and enabled
      if (isGeminiActive) {
        const geminiResponse = await askGemini(rawInput, tasks, {
          apiKey: settings.geminiApiKey!,
          model: settings.geminiModel,
        });

        if (geminiResponse) {
          let botReplyText = geminiResponse.text;
          let actionResult: any = undefined;

          // If Gemini extracted a structured command, execute it on local store!
          if (geminiResponse.parsedCommand && geminiResponse.parsedCommand.intent !== 'UNKNOWN') {
            const executed = executeCommand(geminiResponse.parsedCommand);
            actionResult = executed.actionTaken;
            // If the command returned a friendly formatted output, combine or use it
            if (executed.pendingAction) {
              botReplyText = executed.text;
              setActivePendingAction(executed.pendingAction);
            } else if (executed.text && !botReplyText) {
              botReplyText = executed.text;
            }
          }

          const botMsg: ChatMessageType = {
            id: `bot-${Date.now()}`,
            role: 'assistant',
            text: botReplyText,
            timestamp: new Date().toISOString(),
            isGemini: true,
            actionTaken: actionResult,
          };
          setMessages(prev => [...prev, botMsg]);
          setIsProcessing(false);
          return;
        }
      }

      // Built-in Deterministic NLP Command Parser Fallback
      const parsed = parseTaskCommand(rawInput, tasks);
      const executionResult = executeCommand(parsed);

      const botMsg: ChatMessageType = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: executionResult.text,
        timestamp: new Date().toISOString(),
        actionTaken: executionResult.actionTaken,
        pendingAction: executionResult.pendingAction,
        suggestedQuickReplies: executionResult.suggestedQuickReplies,
        isGemini: false,
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessageType = {
        id: `bot-err-${Date.now()}`,
        role: 'assistant',
        text: 'Sorry, I encountered an issue processing that command. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAction = (action: PendingAction) => {
    if (action.type === 'confirm_delete' && action.taskId) {
      deleteTask(action.taskId);
      setActivePendingAction(null);

      const confirmMsg: ChatMessageType = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: `🗑️ Permanently deleted **"${action.taskTitle || 'Task'}"**. Your task list is updated.`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, confirmMsg]);
    }
  };

  const handleCancelAction = () => {
    setActivePendingAction(null);
    const cancelMsg: ChatMessageType = {
      id: `bot-${Date.now()}`,
      role: 'assistant',
      text: 'Action cancelled. No tasks were deleted.',
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, cancelMsg]);
  };

  const clearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setActivePendingAction(null);
  };

  return (
    <>
      {/* Floating launcher button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title="Open FlowAI Assistant"
          className="fixed bottom-20 md:bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-forest-800 hover:bg-forest-900 active:scale-95 text-cream-50 shadow-soft-lg border border-forest-600/40 group transition-all duration-200"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-mint-300 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-mint-400 animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-wide">FlowAI</span>
        </button>
      )}

      {/* Floating Chat Panel Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[410px] h-[580px] max-h-[85vh] flex flex-col bg-cream-50 dark:bg-charcoal-900 rounded-3xl border border-cream-300 dark:border-charcoal-800 shadow-soft-dark overflow-hidden animate-slideUp transition-all">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-cream-100 dark:bg-charcoal-850 border-b border-cream-200 dark:border-charcoal-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-forest-700 dark:bg-forest-600 text-cream-50 flex items-center justify-center">
                <Bot className="w-4 h-4 text-mint-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-forest-950 dark:text-cream-50">
                    FlowAI Assistant
                  </h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-mint-200/80 dark:bg-forest-950 text-forest-800 dark:text-mint-300">
                    {isGeminiActive ? 'Gemini' : 'Local Engine'}
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 dark:text-stone-400">
                  {isGeminiActive ? 'Connected to Gemini AI' : 'Rule-Based Task Copilot (Offline)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Clear conversation"
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-cream-200/50 dark:hover:bg-charcoal-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-cream-200/50 dark:hover:bg-charcoal-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin">
            {messages.map(msg => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onConfirmAction={handleConfirmAction}
                onCancelAction={handleCancelAction}
                onSelectQuickReply={reply => handleSendMessage(reply)}
              />
            ))}
            {isProcessing && (
              <div className="flex items-center gap-2 text-stone-400 text-xs pl-2 animate-pulse">
                <Bot className="w-3.5 h-3.5" />
                <span>Thinking & parsing task commands...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          <SuggestedPrompts onSelectPrompt={p => handleSendMessage(p)} />

          {/* Input Box */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-cream-50 dark:bg-charcoal-900 border-t border-cream-200 dark:border-charcoal-800 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="e.g. 'Add grocery shopping tomorrow at 5 PM'..."
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-cream-100/70 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-600/30 text-stone-900 dark:text-cream-50 placeholder:text-stone-400 transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="p-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 disabled:opacity-40 text-cream-50 shadow-soft transition active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
