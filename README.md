# FocusFlow AI 🌿

> A complete, polished, responsive productivity web application designed with a calm aesthetic, intelligent task command layer, interactive calendar, focus timer, and conversational assistant.

---

## ✨ Features

1. **Dashboard & Sidebar Navigation**
   - **Views**: Dashboard, Today, All Tasks, Calendar, Focus Timer, Settings.
   - **Responsive**: Full sidebar on desktop and ergonomic touch-friendly bottom navigation bar on mobile.
   - **Real-Time Metrics**: Daily completion progress ring, active flow streak, high priority action spotlight, overdue alert counters.

2. **Full Task Management**
   - Create, edit, delete (with safety confirmation dialog), and toggle complete.
   - Rich fields: Title, description, due date, due time, priority (`High`, `Medium`, `Low`), and subject/category (`Coding`, `Study`, `Assignment`, `Work`, `Health`, `Personal`).
   - Categorized badges with distinct, accessible color coding.

3. **Today & All Tasks Views**
   - **Today View**: Dedicated daily agenda with quick-add input bar for instant scheduling.
   - **All Tasks View**: Search by title, notes, or subject; filter tabs (`All`, `Pending`, `Completed`, `Overdue`); filter by category or priority; sort by due date, priority, title, or creation date.
   - Clear empty states with helpful illustrations and 1-click actions.

4. **Interactive Schedule Calendar**
   - Full monthly matrix view displaying scheduled task dots and preview chips on each calendar date.
   - Month and year navigation with an instant "Today" jump button.
   - Clicking any day highlights the date and opens the **Day Task Inspector**, allowing you to inspect, complete, or schedule tasks directly for that date.

5. **25-Minute Focus Timer (Pomodoro)**
   - Modes: 25-minute Pomodoro, 5-minute Short Break, and 15-minute Long Break.
   - Start, pause, reset, and live circular progress animation.
   - **Link to Task**: Connect the active timer session to a specific task to automatically log deep focus minutes.
   - **Calming Acoustic Chimes**: Synthesized with the Web Audio API—100% offline, zero network dependencies.

6. **Calm Aesthetic & Theme Toggle**
   - **Light Theme**: Warm cream backgrounds (`#FAF8F5`), muted mint surfaces (`#E8F3EE`), forest-green accents (`#28533E`), rounded-2xl cards, and subtle borders.
   - **Dark Theme**: Deep charcoal backgrounds (`#111614`, `#161F1A`) with soft glowing mint accents (`#4ADE80`, `#5EEAD4`) and accessible contrast.
   - Persistent theme storage (`light`, `dark`, or `system`).

7. **Floating FlowAI Assistant & Safe Structured Command Layer**
   - Bottom-right floating trigger button that opens an elegant slide-in conversation panel.
   - Understands natural language requests:
     - *"Add DSA practice tomorrow at 6 PM"*
     - *"Move my Python assignment to Friday"*
     - *"What should I do today?"*
     - *"Which tasks are overdue?"*
     - *"Mark DSA practice as done"*
     - *"Start focus timer for 25 minutes"*
   - **Safe Command Execution**: Modifies the exact same task data store as the UI, with immediate reactive updates.
   - **Destructive Action Safety**: Never deletes tasks without explicit confirmation; renders an interactive `[Confirm Delete]` / `[Cancel]` dialog in chat.
   - **Clarification Handling**: Prompts for missing details when requests are ambiguous.
   - **Transparent Integration**: Runs on a built-in deterministic rule engine out-of-the-box (zero API keys required, works completely offline).
   - **Optional Gemini AI**: In Settings, users can optionally connect their Google Gemini API key (stored safely in local browser storage only) with a built-in connection test and automatic fallback.

8. **Local Data Persistence & Portability**
   - Zero backend or database setup needed.
   - Pre-seeded with realistic sample tasks on first launch.
   - JSON export and import for seamless backup and transfer.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Running Locally
```bash
# 1. Install dependencies (already installed)
npm install

# 2. Start Vite development server
npm run dev

# 3. Open browser at http://localhost:5173
```

### Running Tests & Building
```bash
# Run automated verification tests
npm test

# Run TypeScript compiler checks and build for production
npm run build

# Preview production build
npm run preview
```

---

## 📁 Architecture Overview

```
FocusFlow-AI/
├── src/
│   ├── types/
│   │   ├── task.ts            # Task model, filters, categories, and statistics types
│   │   └── chat.ts            # Chat message models, command intents, and pending actions
│   ├── services/
│   │   ├── storage.ts         # LocalStorage persistence, theme, and JSON backup/import
│   │   ├── sound.ts           # Synthesized Web Audio API bells and chimes (zero dependencies)
│   │   ├── taskEngine.ts      # Safe structured task command parser & fuzzy matcher
│   │   └── gemini.ts          # Clean integration point for Google Gemini API
│   ├── context/
│   │   ├── TaskContext.tsx    # Global task state, CRUD, statistics, and filtering
│   │   ├── ThemeContext.tsx   # Light/dark/system theme management
│   │   └── TimerContext.tsx   # Pomodoro ticker and session state
│   ├── components/
│   │   ├── layout/            # Sidebar, TopHeader, and MobileNav
│   │   ├── dashboard/         # DashboardView, StatCard, and ProgressRing
│   │   ├── tasks/             # TodayView, AllTasksView, TaskCard, TaskModal, DeleteDialog
│   │   ├── calendar/          # CalendarView and Day Task Inspector
│   │   ├── timer/             # FocusTimerView and QuickTimerWidget
│   │   ├── chat/              # FlowChatbot, ChatMessage, and SuggestedPrompts
│   │   └── settings/          # SettingsView (Themes, Gemini config, backup/import)
│   ├── utils/
│   │   ├── dateUtils.ts       # Natural language date/time parsing and formatting
│   │   └── sampleData.ts      # Curated starter tasks
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── test-runner.ts             # Automated test suite for task commands & safety rules
├── tailwind.config.js
└── vite.config.ts
```
