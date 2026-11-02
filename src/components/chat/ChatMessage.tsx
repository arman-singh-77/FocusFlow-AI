import React from 'react';
import {
  Bot,
  Trash2,
  Calendar,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { ChatMessage as ChatMessageType, PendingAction } from '../../types/chat';
import { formatTime, formatFriendlyDate } from '../../utils/dateUtils';

interface ChatMessageProps {
  message: ChatMessageType;
  onConfirmAction?: (action: PendingAction) => void;
  onCancelAction?: () => void;
  onSelectQuickReply?: (reply: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onConfirmAction,
  onCancelAction,
  onSelectQuickReply,
}) => {
  const isUser = message.role === 'user';

  // Render text with simple bolding support (**bold**)
  const renderFormattedText = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-forest-950 dark:text-cream-50">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-forest-700 dark:bg-forest-600 text-cream-50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div className={`max-w-[85%] space-y-2`}>
        {/* Chat Bubble */}
        <div
          className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
            isUser
              ? 'bg-forest-700 text-cream-50 rounded-tr-sm shadow-soft'
              : 'bg-cream-100/90 dark:bg-charcoal-800 text-stone-800 dark:text-cream-100 border border-cream-200 dark:border-charcoal-700 rounded-tl-sm'
          }`}
        >
          <div className="whitespace-pre-line">{renderFormattedText(message.text)}</div>

          {/* Action result preview card */}
          {message.actionTaken && message.actionTaken.task && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-700 text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold text-forest-900 dark:text-cream-50">
                <span className="truncate">{message.actionTaken.task.title}</span>
                <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-mint-100 dark:bg-forest-950 text-forest-700 dark:text-mint-300">
                  {message.actionTaken.task.category}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatFriendlyDate(message.actionTaken.task.dueDate)}
                </span>
                {message.actionTaken.task.dueTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(message.actionTaken.task.dueTime)}
                  </span>
                )}
                <span className="capitalize">
                  Priority: {message.actionTaken.task.priority}
                </span>
              </div>
            </div>
          )}

          {/* Pending Confirmation Box */}
          {message.pendingAction && (
            <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                <span>Confirmation Required</span>
              </div>
              <p className="text-stone-700 dark:text-stone-300">
                {message.pendingAction.prompt}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onConfirmAction && onConfirmAction(message.pendingAction!)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-cream-50 font-semibold shadow-soft transition text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirm Delete</span>
                </button>
                <button
                  onClick={() => onCancelAction && onCancelAction()}
                  className="px-3 py-1.5 rounded-lg bg-cream-200 hover:bg-cream-300 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-stone-700 dark:text-stone-300 font-medium transition text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Quick Replies */}
        {message.suggestedQuickReplies && message.suggestedQuickReplies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {message.suggestedQuickReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => onSelectQuickReply && onSelectQuickReply(reply)}
                className="px-2.5 py-1 rounded-lg bg-cream-200/80 hover:bg-mint-100 dark:bg-charcoal-800 dark:hover:bg-forest-900/60 border border-cream-300 dark:border-charcoal-700 text-[11px] font-medium text-forest-900 dark:text-mint-300 transition"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        <div className="text-[10px] text-stone-400 px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {message.isGemini && (
            <span className="ml-1.5 text-forest-700 dark:text-mint-400 font-semibold">
              • Gemini AI
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
