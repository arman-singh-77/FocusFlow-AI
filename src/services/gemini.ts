import { Task } from '../types/task';
import { CommandParseResult } from '../types/chat';

export interface GeminiConfig {
  apiKey: string;
  model: string;
}

/**
 * Clean integration point for Google Gemini API.
 * Uses client-side fetch directly with user-provided key.
 * Never hardcodes or leaks keys.
 */
export async function testGeminiConnection(apiKey: string, model: string = 'gemini-2.5-flash'): Promise<{ success: boolean; message: string }> {
  if (!apiKey || apiKey.trim().length < 10) {
    return { success: false, message: 'Please enter a valid Gemini API key.' };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Respond with the single word: READY' }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.error?.message || `API error (${response.status}): ${response.statusText}`,
      };
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText) {
      return { success: true, message: 'Connection successful! Gemini is ready.' };
    }
    return { success: false, message: 'Received unexpected response format from Gemini.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error connecting to Gemini API.' };
  }
}

/**
 * Ask Gemini with contextual task data and command intent parsing
 */
export async function askGemini(
  prompt: string,
  currentTasks: Task[],
  config: GeminiConfig
): Promise<{ text: string; parsedCommand?: CommandParseResult } | null> {
  if (!config.apiKey) return null;

  const now = new Date();
  const systemPrompt = `You are FocusFlow AI, an intelligent, calm, and concise productivity assistant.
Current Date/Time: ${now.toISOString()} (${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}).

Existing User Tasks:
${JSON.stringify(
  currentTasks.map(t => ({
    id: t.id,
    title: t.title,
    dueDate: t.dueDate,
    dueTime: t.dueTime,
    priority: t.priority,
    category: t.category,
    completed: t.completed,
  })),
  null,
  2
)}

Guidelines:
1. Keep replies friendly, calm, and concise (1-3 sentences).
2. If the user wants to add, move, complete, delete, or query tasks, determine the intent.
3. If the user asks to delete a task, you MUST state that deletion is permanent and requires confirmation.
4. Output your response as plain friendly text. If a structured action is recognized, append a JSON block at the end like:
\`\`\`action
{
  "intent": "ADD_TASK" | "MOVE_TASK" | "COMPLETE_TASK" | "DELETE_TASK" | "QUERY_TODAY" | "QUERY_OVERDUE",
  "targetTaskId": "string (optional)",
  "title": "string (optional)",
  "dueDate": "YYYY-MM-DD (optional)",
  "dueTime": "HH:mm (optional)",
  "priority": "low" | "medium" | "high" (optional),
  "category": "Coding" | "Study" | "Assignment" | "Health" | "Work" | "Personal" (optional)
}
\`\`\``;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey.trim()}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUser Message: ${prompt}` }],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.warn('Gemini request failed, falling back to rule engine.');
      return null;
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    // Check for JSON action block
    const actionMatch = rawText.match(/```action\s*([\s\S]*?)\s*```/);
    let parsedCommand: CommandParseResult | undefined;
    let cleanText = rawText.replace(/```action[\s\S]*?```/, '').trim();

    if (actionMatch) {
      try {
        const actionObj = JSON.parse(actionMatch[1]);
        if (actionObj.intent) {
          parsedCommand = {
            intent: actionObj.intent,
            confidence: 0.98,
            params: {
              targetTaskId: actionObj.targetTaskId,
              title: actionObj.title,
              dueDate: actionObj.dueDate,
              dueTime: actionObj.dueTime,
              priority: actionObj.priority,
              category: actionObj.category,
            },
          };
        }
      } catch (e) {
        // action json parse failed
      }
    }

    return { text: cleanText, parsedCommand };
  } catch (err) {
    console.error('Error invoking Gemini:', err);
    return null;
  }
}
