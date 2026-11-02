import React from 'react';
import {
  ListFilter,
  ArrowUpDown,
  Tag,
  Inbox,
  X,
  Plus,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { TaskCard } from './TaskCard';
import { Task, TaskFilter, TaskSortBy, TaskCategory } from '../../types/task';

interface AllTasksViewProps {
  onOpenNewTaskModal: () => void;
  onEditTask: (task: Task) => void;
  onDeleteRequest: (task: Task) => void;
  onStartFocus?: (task: Task) => void;
}

const CATEGORIES: ('all' | TaskCategory)[] = [
  'all',
  'Coding',
  'Study',
  'Assignment',
  'Work',
  'Health',
  'Personal',
];

export const AllTasksView: React.FC<AllTasksViewProps> = ({
  onOpenNewTaskModal,
  onEditTask,
  onDeleteRequest,
  onStartFocus,
}) => {
  const {
    filteredTasks,
    stats,
    selectedFilter,
    setSelectedFilter,
    selectedCategory,
    setSelectedCategory,
    selectedPriority,
    setSelectedPriority,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
  } = useTasks();

  const filterTabs: { id: TaskFilter; label: string; count?: number; badgeColor?: string }[] = [
    { id: 'all', label: 'All Tasks', count: stats.total },
    { id: 'pending', label: 'Pending', count: stats.pending },
    { id: 'completed', label: 'Completed', count: stats.completed },
    {
      id: 'overdue',
      label: 'Overdue',
      count: stats.overdue,
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    },
  ];

  const clearAllFilters = () => {
    setSelectedFilter('all');
    setSelectedCategory('all');
    setSelectedPriority('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedFilter !== 'all' ||
    selectedCategory !== 'all' ||
    selectedPriority !== 'all' ||
    searchQuery.trim() !== '';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Filter and Control Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft space-y-4">
        {/* Top row: Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-cream-200/60 dark:bg-charcoal-800 border border-cream-300/80 dark:border-charcoal-700">
            {filterTabs.map(tab => {
              const isActive = selectedFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cream-50 dark:bg-charcoal-900 text-forest-900 dark:text-mint-300 shadow-soft'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-cream-50'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        tab.badgeColor || 'bg-stone-200/70 dark:bg-charcoal-700 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-cream-50 text-xs font-semibold shadow-soft transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
        </div>

        {/* Second row: Category, Priority, and Sort By Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-cream-200 dark:border-charcoal-800 text-xs">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-cream-100/70 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 rounded-xl text-xs text-stone-800 dark:text-cream-50 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.filter(c => c !== 'all').map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <ListFilter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="px-2.5 py-1.5 bg-cream-100/70 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 rounded-xl text-xs text-stone-800 dark:text-cream-50 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-500 dark:text-stone-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as TaskSortBy)}
              className="px-2.5 py-1.5 bg-cream-100/70 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 rounded-xl text-xs text-stone-800 dark:text-cream-50 focus:outline-none font-medium"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title (A-Z)</option>
              <option value="createdAt">Date Created</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition"
            >
              <X className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Task List / Grid */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDeleteRequest={onDeleteRequest}
              onStartFocus={onStartFocus}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cream-200/80 dark:bg-charcoal-800 text-stone-400 flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-stone-800 dark:text-cream-100">
            No matching tasks found
          </h4>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'Try relaxing your search terms or clearing the selected filters.'
              : 'Your task list is empty. Create your first task to get started.'}
          </p>

          {hasActiveFilters ? (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 rounded-xl bg-forest-700 text-cream-50 text-xs font-semibold shadow-soft hover:bg-forest-800 transition"
            >
              Clear Filters
            </button>
          ) : (
            <button
              onClick={onOpenNewTaskModal}
              className="px-4 py-2 rounded-xl bg-forest-700 text-cream-50 text-xs font-semibold shadow-soft hover:bg-forest-800 transition"
            >
              Add a Task
            </button>
          )}
        </div>
      )}
    </div>
  );
};
