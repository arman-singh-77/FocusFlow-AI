import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  CalendarDays,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  ListTodo,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';
import { loadTasks, STORAGE_KEY, todayKey, type Task } from '@/lib/task-storage';

const queryClient = new QueryClient();

const dateLabel = (date: string) => {
  const parsed = new Date(`${date}T12:00:00`);
  if (date === todayKey()) return 'Today';
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function Home() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [taskView, setTaskView] = useState<'today' | 'all'>('today');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('Medium');
  const [dueDate, setDueDate] = useState(todayKey);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanSubject = subject.trim();
    if (!cleanTitle || !cleanSubject || !dueDate) return;
    setTasks((current) => [{
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: cleanTitle,
      subject: cleanSubject,
      priority,
      dueDate,
      completed: false,
    }, ...current]);
    setTitle('');
    setSubject('');
    setPriority('Medium');
    setDueDate(todayKey());
    setShowForm(false);
  };

  const toggleTask = (id: string) => {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  const today = todayKey();
  const todayTasks = tasks.filter((task) => task.dueDate === today);
  const visibleTasks = taskView === 'today' ? todayTasks : tasks;
  const completedCount = visibleTasks.filter((task) => task.completed).length;
  const progress = visibleTasks.length ? Math.round((completedCount / visibleTasks.length) * 100) : 0;
  const remaining = visibleTasks.length - completedCount;
  const time = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true"><Sparkles size={18} strokeWidth={2.4} /></div>
          <div className="brand-name">focus<span>flow</span></div>
        </div>
        <div className="sidebar-label">Workspace</div>
        <nav aria-label="Task views">
          <button className={`nav-item${taskView === 'today' ? ' active' : ''}`} type="button" onClick={() => setTaskView('today')} aria-current={taskView === 'today' ? 'page' : undefined}>
            <ListTodo size={17} /><span>Today</span><span className="nav-count">{todayTasks.length}</span>
          </button>
          <button className={`nav-item${taskView === 'all' ? ' active' : ''}`} type="button" onClick={() => setTaskView('all')} aria-current={taskView === 'all' ? 'page' : undefined}>
            <CalendarDays size={17} /><span>All tasks</span><span className="nav-count">{tasks.length}</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <div className="sidebar-note-mark"><Sparkles size={16} /></div>
            <strong>One thing at a time.</strong>
            <p>A little progress each day adds up to something big.</p>
          </div>
          <div className="profile">
            <div className="avatar" aria-hidden="true">ST</div>
            <div><div className="profile-name">Student workspace</div><div className="profile-caption">Your study space</div></div>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="content">
          <div className="topbar">
            <div className="crumb"><span>Workspace</span><ChevronRight size={13} /><strong>{taskView === 'today' ? 'Today' : 'All tasks'}</strong></div>
            <div className="today-pill"><CalendarDays size={14} /><span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span></div>
          </div>
          <section className="greeting" aria-labelledby="page-title">
            <div>
              <div className="eyebrow">{taskView === 'today' ? 'Your day, at a glance' : 'Everything you’re working on'}</div>
              <h1 id="page-title">{taskView === 'today' ? 'Make today count.' : 'Your full task list.'}</h1>
              <p>{taskView === 'today' ? 'A clear plan makes room for your best work.' : 'Today’s priorities and what’s coming next.'}</p>
            </div>
            <button className="add-button" type="button" onClick={() => setShowForm((open) => !open)} aria-expanded={showForm} data-testid="button-add-task">
              <Plus size={16} /> Add a task
            </button>
          </section>

          <section className="overview" aria-label="Daily progress and focus timer">
            <div className="progress-card" data-testid="progress-card">
              <div>
                <div className="progress-title">{taskView === 'today' ? 'Daily progress' : 'Overall progress'}</div>
                <div className="progress-number" data-testid="text-progress-count">{completedCount} <span style={{ color: '#849187', fontSize: 19, fontWeight: 500 }}>/ {visibleTasks.length}</span></div>
                <div className="progress-caption" data-testid="text-progress-summary">
                  {visibleTasks.length === 0
                    ? <><strong>{taskView === 'today' ? 'No tasks due today.' : 'No tasks yet.'}</strong> Add something when you’re ready.</>
                    : remaining === 0
                      ? <><strong>Everything wrapped up.</strong> Take a well-earned pause.</>
                      : <><strong>{remaining} {remaining === 1 ? 'task' : 'tasks'} to go.</strong> Keep your momentum.</>}
                </div>
              </div>
              <div className="progress-ring" role="img" aria-label={`${progress}% of tasks complete`}>
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <circle className="track" cx="50" cy="50" r="42" />
                  <circle className="value" cx="50" cy="50" r="42" strokeDasharray={263.9} strokeDashoffset={263.9 * (1 - progress / 100)} />
                </svg>
                <div className="ring-copy" data-testid="text-progress-percent">{progress}%<span>complete</span></div>
              </div>
            </div>

            <div className="focus-card" data-testid="focus-timer-card">
              <div className="focus-top">
                <div><div className="focus-label">Focus session</div><div className="timer-readout" aria-live="off" data-testid="text-timer">{time}</div></div>
                <div className="focus-icon"><Clock3 size={20} /></div>
              </div>
              <div className="focus-actions">
                <button className="timer-primary" type="button" onClick={() => setRunning((value) => secondsLeft > 0 ? !value : false)} data-testid="button-timer-toggle" aria-label={running ? 'Pause focus timer' : 'Start focus timer'}>
                  {running ? <><Pause size={13} /> Pause</> : <><Play size={13} fill="currentColor" /> {secondsLeft === 0 ? 'Finished' : 'Start focus'}</>}
                </button>
                <button className="timer-reset" type="button" onClick={() => { setRunning(false); setSecondsLeft(25 * 60); }} aria-label="Reset focus timer" data-testid="button-timer-reset"><RotateCcw size={14} /></button>
                <span className="focus-hint">25 min · one thing at a time</span>
              </div>
            </div>
          </section>

          <section className="task-section" aria-labelledby="tasks-heading">
            <div className="section-head">
              <div>
                <h2 className="section-title" id="tasks-heading">{taskView === 'today' ? 'Today’s tasks' : 'All tasks'}</h2>
                <div className="section-subtitle" data-testid="text-task-count">{visibleTasks.length ? `${remaining} still on your list` : 'Your list is ready for a fresh start'}</div>
              </div>
              <div className="task-count" data-testid="status-task-count">{visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}</div>
            </div>

            {showForm && (
              <form className="task-form" onSubmit={addTask} data-testid="form-create-task">
                <div className="form-heading">Add something to your list</div>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="task-title">Task name</label>
                    <input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Draft lab conclusion" required maxLength={100} autoFocus data-testid="input-task-title" />
                  </div>
                  <div className="field">
                    <label htmlFor="task-subject">Subject</label>
                    <input id="task-subject" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="e.g. Chemistry" required maxLength={50} data-testid="input-task-subject" />
                  </div>
                  <div className="field">
                    <label htmlFor="task-priority">Priority</label>
                    <select id="task-priority" value={priority} onChange={(event) => setPriority(event.target.value as Task['priority'])} data-testid="select-task-priority">
                      <option>High</option><option>Medium</option><option>Low</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="task-due-date">Due date</label>
                    <input id="task-due-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required data-testid="input-task-due-date" />
                  </div>
                </div>
                <div className="form-footer">
                  <button className="form-cancel" type="button" onClick={() => setShowForm(false)} data-testid="button-cancel-task">Cancel</button>
                  <button className="form-submit" type="submit" data-testid="button-submit-task"><Plus size={13} /> Add task</button>
                </div>
              </form>
            )}

            {visibleTasks.length > 0 ? (
              <div className="task-list" role="list" aria-label={taskView === 'today' ? 'Tasks due today' : 'All saved tasks'}>
                {visibleTasks.map((task) => (
                  <div className={`task-row${task.completed ? ' completed' : ''}`} role="listitem" key={task.id} data-testid={`row-task-${task.id}`}>
                    <button
                      type="button"
                      className={`check-task${task.completed ? ' is-complete' : ''}`}
                      onClick={() => toggleTask(task.id)}
                      aria-label={`${task.completed ? 'Mark incomplete' : 'Complete'}: ${task.title}`}
                      aria-pressed={task.completed}
                      data-testid={`button-complete-task-${task.id}`}
                    >{task.completed && <Check size={13} strokeWidth={3} />}</button>
                    <div className="task-info">
                      <div className="task-name" data-testid={`text-task-title-${task.id}`}>{task.title}</div>
                      <div className="task-meta">
                        <span className={`subject-dot ${task.subject.toLowerCase().includes('math') ? 'math' : task.subject.toLowerCase().includes('history') ? 'history' : task.subject.toLowerCase().includes('science') || task.subject.toLowerCase().includes('biology') ? 'science' : ''}`} />
                        <span data-testid={`text-task-subject-${task.id}`}>{task.subject}</span><span className="meta-divider" /><span>{task.completed ? 'Done' : 'Due'}</span>
                      </div>
                    </div>
                    <div className="task-end">
                      <span className={`priority ${task.priority.toLowerCase()}`} data-testid={`status-task-priority-${task.id}`}>{task.priority}</span>
                      <span className="task-due" data-testid={`text-task-due-${task.id}`}>{dateLabel(task.dueDate)}</span>
                      <button type="button" className="delete-task" onClick={() => setTasks((current) => current.filter((item) => item.id !== task.id))} aria-label={`Delete ${task.title}`} data-testid={`button-delete-task-${task.id}`}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" data-testid="empty-tasks">
                <div className="empty-mark"><CircleCheck size={19} /></div>
                <strong>{taskView === 'today' && tasks.length > 0 ? 'Nothing due today.' : 'A little breathing room.'}</strong>
                <p>{taskView === 'today' && tasks.length > 0 ? 'Your other tasks are saved under All tasks.' : 'Add a task when you’re ready to plan what’s next.'}</p>
              </div>
            )}
          </section>
          <div className="bottom-note" data-testid="text-footer-note">A focused mind, one small step at a time.</div>
        </div>
      </main>
    </div>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
