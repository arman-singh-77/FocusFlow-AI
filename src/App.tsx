import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider, useTasks } from './context/TaskContext';
import { TimerProvider } from './context/TimerContext';
import { Sidebar, NavView } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { TopHeader } from './components/layout/TopHeader';
import { DashboardView } from './components/dashboard/DashboardView';
import { TodayView } from './components/tasks/TodayView';
import { AllTasksView } from './components/tasks/AllTasksView';
import { CalendarView } from './components/calendar/CalendarView';
import { FocusTimerView } from './components/timer/FocusTimerView';
import { SettingsView } from './components/settings/SettingsView';
import { FlowChatbot } from './components/chat/FlowChatbot';
import { TaskModal } from './components/tasks/TaskModal';
import { DeleteDialog } from './components/tasks/DeleteDialog';
import { Task } from './types/task';

const AppContent: React.FC = () => {
  const { addTask, updateTask, deleteTask } = useTasks();
  const [currentView, setCurrentView] = useState<NavView>('dashboard');

  // Task Modal state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(undefined);

  // Delete Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Keyboard shortcut listener (Ctrl+N / Cmd+N for new task)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleOpenNewTaskModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenNewTaskModal = (defaultDate?: string) => {
    setEditingTask(null);
    setModalDefaultDate(defaultDate);
    setTaskModalOpen(true);
  };

  const handleOpenEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setModalDefaultDate(undefined);
    setTaskModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  const handleDeleteRequest = (task: Task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-cream-100 dark:bg-charcoal-950 text-stone-800 dark:text-stone-100 transition-colors duration-200">
      {/* Desktop Sidebar */}
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-6">
        <TopHeader
          currentView={currentView}
          onOpenNewTaskModal={() => handleOpenNewTaskModal()}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              onNavigate={setCurrentView}
              onOpenNewTaskModal={() => handleOpenNewTaskModal()}
              onEditTask={handleOpenEditTaskModal}
              onDeleteRequest={handleDeleteRequest}
            />
          )}

          {currentView === 'today' && (
            <TodayView
              onOpenNewTaskModal={handleOpenNewTaskModal}
              onEditTask={handleOpenEditTaskModal}
              onDeleteRequest={handleDeleteRequest}
              onStartFocus={() => setCurrentView('timer')}
            />
          )}

          {currentView === 'tasks' && (
            <AllTasksView
              onOpenNewTaskModal={() => handleOpenNewTaskModal()}
              onEditTask={handleOpenEditTaskModal}
              onDeleteRequest={handleDeleteRequest}
              onStartFocus={() => setCurrentView('timer')}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView
              onOpenNewTaskModal={handleOpenNewTaskModal}
              onEditTask={handleOpenEditTaskModal}
              onDeleteRequest={handleDeleteRequest}
              onStartFocus={() => setCurrentView('timer')}
            />
          )}

          {currentView === 'timer' && <FocusTimerView />}

          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav currentView={currentView} onNavigate={setCurrentView} />

      {/* Floating Chatbot Assistant */}
      <FlowChatbot onNavigateToTimer={() => setCurrentView('timer')} />

      {/* Task Creation / Edit Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
        defaultDate={modalDefaultDate}
      />

      {/* Task Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        task={taskToDelete}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <TimerProvider>
          <AppContent />
        </TimerProvider>
      </TaskProvider>
    </ThemeProvider>
  );
}

export default App;
