import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { StatCard } from './StatCard';
import { ProgressRing } from './ProgressRing';
import { QuickTimerWidget } from '../timer/QuickTimerWidget';
import { TaskCard } from '../tasks/TaskCard';
import { Task } from '../../types/task';
import { isToday, isOverdue } from '../../utils/dateUtils';
import { NavView } from '../layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (view: NavView) => void;
  onOpenNewTaskModal: () => void;
  onEditTask: (task: Task) => void;
  onDeleteRequest: (task: Task) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewTaskModal,
  onEditTask,
  onDeleteRequest,
}) => {
  const { tasks, stats, loadSampleData } = useTasks();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Filter tasks for dashboard sections
  const todayTasks = tasks.filter(t => isToday(t.dueDate));
  const highPriorityPending = tasks
    .filter(t => t.priority === 'high' && !t.completed)
    .slice(0, 3);
  const overdueTasks = tasks.filter(t => isOverdue(t)).slice(0, 2);

  const dailyPercentage = stats.dueToday > 0
    ? Math.round((stats.completedToday / stats.dueToday) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-mint-100/90 via-cream-50 to-cream-100 dark:from-charcoal-900 dark:via-charcoal-900 dark:to-charcoal-850 border border-cream-300 dark:border-charcoal-800 shadow-soft">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-forest-950 dark:text-cream-50">
              {getGreeting()}. What would you like to get done?
            </h1>
            <Sparkles className="w-5 h-5 text-amber-500 hidden sm:inline" />
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-300 max-w-xl">
            You have{' '}
            <span className="font-bold text-forest-800 dark:text-mint-300">
              {stats.dueToday - stats.completedToday} task{stats.dueToday - stats.completedToday !== 1 ? 's' : ''} left today
            </span>{' '}
            and {stats.overdue} overdue items. Let's tackle your highest impact priorities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 active:scale-[0.98] text-cream-50 text-sm font-semibold shadow-soft transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Progress"
          value={`${stats.completedToday} / ${stats.dueToday}`}
          subtitle={`${stats.dueToday - stats.completedToday} remaining today`}
          icon={CheckCircle2}
          iconBg="bg-forest-100 dark:bg-forest-900/60"
          iconColor="text-forest-700 dark:text-mint-400"
          badge={{
            text: `${dailyPercentage}% done`,
            color: 'bg-mint-100 text-forest-800 dark:bg-forest-950 dark:text-mint-300',
          }}
        />

        <StatCard
          title="Overdue Attention"
          value={stats.overdue}
          subtitle={stats.overdue > 0 ? 'Requires immediate action' : 'All deadlines on track'}
          icon={AlertTriangle}
          iconBg={stats.overdue > 0 ? 'bg-rose-100 dark:bg-rose-950/60' : 'bg-mint-100 dark:bg-forest-950'}
          iconColor={stats.overdue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-forest-700 dark:text-mint-400'}
          badge={
            stats.overdue > 0
              ? { text: 'Needs Review', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' }
              : { text: 'Clear', color: 'bg-mint-100 text-forest-800 dark:bg-forest-950 dark:text-mint-300' }
          }
        />

        <StatCard
          title="Deep Focus Minutes"
          value={`${stats.totalFocusMinutes}m`}
          subtitle="Time invested in deep flow"
          icon={Clock}
          iconBg="bg-amber-100 dark:bg-amber-950/60"
          iconColor="text-amber-700 dark:text-amber-400"
        />

        <StatCard
          title="Total Tasks Completed"
          value={`${stats.completionRate}%`}
          subtitle={`${stats.completed} of ${stats.total} total completed`}
          icon={Flame}
          iconBg="bg-teal-100 dark:bg-teal-950/60"
          iconColor="text-teal-700 dark:text-teal-400"
        />
      </div>

      {/* Main Grid: Focus Ring + Quick Timer + High Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Today's Flow & High Priority */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Flow Overview Ring Card */}
          <div className="p-6 rounded-3xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-mint-100/80 dark:bg-forest-900/60 text-forest-800 dark:text-mint-300 text-xs font-semibold">
                <span>Daily Momentum</span>
              </div>
              <h3 className="text-xl font-bold text-forest-950 dark:text-cream-50">
                {dailyPercentage === 100 && stats.dueToday > 0
                  ? 'Outstanding! You crushed today’s list.'
                  : dailyPercentage >= 50
                  ? 'Great progress, you are past the halfway mark.'
                  : 'Start your flow with your top priority task.'}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                {stats.completedToday} completed today • {stats.dueToday - stats.completedToday} pending •{' '}
                {stats.total - stats.completed} total backlog
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('today')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 dark:text-mint-400 hover:underline"
                >
                  <span>Open full Today checklist</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-shrink-0">
              <ProgressRing
                percentage={dailyPercentage}
                completedCount={stats.completedToday}
                totalCount={stats.dueToday}
                size={130}
              />
            </div>
          </div>

          {/* High Priority Tasks Spotlight */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-forest-950 dark:text-cream-50">
                  Top Priority Focus
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                  {highPriorityPending.length}
                </span>
              </div>

              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs font-semibold text-forest-700 dark:text-mint-400 hover:underline flex items-center gap-1"
              >
                <span>View all tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {highPriorityPending.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {highPriorityPending.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onDeleteRequest={onDeleteRequest}
                    onStartFocus={() => onNavigate('timer')}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 text-center">
                <p className="text-sm text-stone-600 dark:text-stone-300">
                  🎉 No high priority tasks pending right now.
                </p>
              </div>
            )}
          </div>

          {/* Overdue alert section if any */}
          {overdueTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <h3 className="text-base font-bold text-rose-800 dark:text-rose-300">
                    Overdue Deadlines
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('tasks')}
                  className="text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline"
                >
                  Manage all ({stats.overdue})
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {overdueTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onDeleteRequest={onDeleteRequest}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1/3): Quick Timer Widget & Today's Schedule */}
        <div className="space-y-6">
          <QuickTimerWidget onOpenFullTimer={() => onNavigate('timer')} />

          {/* Today's Schedule Mini-List */}
          <div className="p-5 rounded-3xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-forest-950 dark:text-cream-50">
                Scheduled Today
              </h4>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {todayTasks.length} total
              </span>
            </div>

            {todayTasks.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {todayTasks.map(t => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-cream-100/70 dark:bg-charcoal-800 border border-cream-200 dark:border-charcoal-700 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          t.completed
                            ? 'bg-forest-600 dark:bg-mint-400'
                            : t.priority === 'high'
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      <span
                        className={`truncate font-medium text-stone-800 dark:text-cream-100 ${
                          t.completed ? 'line-through text-stone-400 dark:text-stone-500' : ''
                        }`}
                      >
                        {t.title}
                      </span>
                    </div>

                    <span className="text-stone-400 flex-shrink-0 text-[11px] ml-2">
                      {t.dueTime || 'Anytime'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-stone-500 dark:text-stone-400">
                No tasks scheduled for today yet.
              </div>
            )}

            <button
              onClick={() => onNavigate('today')}
              className="w-full py-2 text-center text-xs font-semibold rounded-xl bg-cream-200/70 dark:bg-charcoal-800 text-forest-800 dark:text-mint-300 hover:bg-cream-200 dark:hover:bg-charcoal-700 transition"
            >
              Open Today's Workspace
            </button>
          </div>
        </div>
      </div>

      {/* Empty State / First-time user helper */}
      {tasks.length === 0 && (
        <div className="p-8 rounded-3xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 text-center space-y-3">
          <p className="text-base font-semibold text-stone-800 dark:text-cream-100">
            Welcome to FocusFlow AI!
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
            You don't have any tasks in your local workspace yet. You can create your own tasks or load sample tasks to explore all features right away.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenNewTaskModal}
              className="px-4 py-2 rounded-xl bg-forest-700 text-cream-50 text-xs font-semibold shadow-soft hover:bg-forest-800"
            >
              Create First Task
            </button>
            <button
              onClick={loadSampleData}
              className="px-4 py-2 rounded-xl bg-cream-200 dark:bg-charcoal-800 text-forest-800 dark:text-mint-300 text-xs font-semibold hover:bg-cream-300 dark:hover:bg-charcoal-700"
            >
              Load Sample Tasks
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
