// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, Task } from '../lib/api';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [tags, setTags] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  // Advanced features
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurrencePattern, setRecurrencePattern] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(0);
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(false);
  const [reminderTime, setReminderTime] = useState<string>('');
  const [sharedWith, setSharedWith] = useState<string>(''); // Comma-separated user IDs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [editingPriority, setEditingPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editingTags, setEditingTags] = useState<string>('');
  const [editingDueDate, setEditingDueDate] = useState<string>('');
  // Advanced features for editing
  const [editingIsRecurring, setEditingIsRecurring] = useState<boolean>(false);
  const [editingRecurrencePattern, setEditingRecurrencePattern] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [editingEstimatedDuration, setEditingEstimatedDuration] = useState<number>(0);
  const [editingReminderEnabled, setEditingReminderEnabled] = useState<boolean>(false);
  const [editingReminderTime, setEditingReminderTime] = useState<string>('');
  const [editingSharedWith, setEditingSharedWith] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sort, setSort] = useState<'created_at' | 'title' | 'priority' | 'due_date'>('created_at');

  // Fetch tasks for the authenticated user
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTasks();
    }
  }, [isAuthenticated, user, filter, priorityFilter, tagFilter, searchQuery, sort]);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const params: {
        completed?: boolean;
        priority?: string;
        tags?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: string
      } = {};

      if (filter === 'completed') {
        params.completed = true;
      } else if (filter === 'active') {
        params.completed = false;
      }

      if (priorityFilter !== 'all') {
        params.priority = priorityFilter;
      }

      if (tagFilter.trim()) {
        params.tags = tagFilter;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery;
      }

      params.sortBy = sort;
      params.sortOrder = 'asc'; // Default to ascending, can be changed as needed

      const tasksData = await api.getTasks(user.id, params);
      setTasks(tasksData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    try {
      // Parse tags from comma-separated string
      const tagsArray = tags.trim() ? tags.split(',').map(tag => tag.trim()) : [];

      // Parse shared_with from comma-separated string
      const sharedWithIds = sharedWith.trim() ? sharedWith.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];

      const newTask = await api.createTask(user.id, {
        title,
        description,
        priority,
        tags: tagsArray,
        due_date: dueDate || undefined,
        // Advanced features
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? recurrencePattern : undefined,
        estimated_duration: estimatedDuration > 0 ? estimatedDuration : undefined,
        reminder_enabled: reminderEnabled,
        reminder_time: reminderEnabled ? reminderTime : undefined,
        shared_with: sharedWithIds.length > 0 ? sharedWithIds : undefined
      });
      setTasks([...tasks, newTask]);
      // Reset form fields
      setTitle('');
      setDescription('');
      setPriority('medium');
      setTags('');
      setDueDate('');
      setIsRecurring(false);
      setRecurrencePattern('weekly');
      setEstimatedDuration(0);
      setReminderEnabled(false);
      setReminderTime('');
      setSharedWith('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const toggleTaskCompletion = async (taskId: number) => {
    if (!user) return;

    try {
      const updatedTask = await api.toggleTaskCompletion(user.id, taskId);
      setTasks(tasks.map(task =>
        task.id === taskId ? updatedTask : task
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!user) return;

    try {
      await api.deleteTask(user.id, taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
    setEditingDescription(task.description || '');
    setEditingPriority(task.priority as 'low' | 'medium' | 'high');
    setEditingTags(task.tags ? JSON.parse(task.tags.replace(/'/g, '"')).join(', ') : '');
    setEditingDueDate(task.due_date || '');
    // Advanced features
    setEditingIsRecurring(task.is_recurring || false);
    setEditingRecurrencePattern((task.recurrence_pattern as 'daily' | 'weekly' | 'monthly' | 'yearly') || 'weekly');
    setEditingEstimatedDuration(task.estimated_duration || 0);
    setEditingReminderEnabled(task.reminder_enabled || false);
    setEditingReminderTime(task.reminder_time || '');
    setEditingSharedWith(task.shared_with || '');
  };

  const updateTask = async () => {
    if (!editingTaskId || !user) return;

    try {
      // Parse tags from comma-separated string
      const tagsArray = editingTags.trim() ? editingTags.split(',').map(tag => tag.trim()) : [];

      // Parse shared_with from comma-separated string
      const sharedWithIds = editingSharedWith.trim() ? editingSharedWith.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];

      const updatedTask = await api.updateTask(user.id, editingTaskId, {
        title: editingTitle,
        description: editingDescription,
        priority: editingPriority,
        tags: tagsArray,
        due_date: editingDueDate || undefined,
        // Advanced features
        is_recurring: editingIsRecurring,
        recurrence_pattern: editingIsRecurring ? editingRecurrencePattern : undefined,
        estimated_duration: editingEstimatedDuration > 0 ? editingEstimatedDuration : undefined,
        reminder_enabled: editingReminderEnabled,
        reminder_time: editingReminderEnabled ? editingReminderTime : undefined,
        shared_with: sharedWithIds.length > 0 ? sharedWithIds : undefined
      });
      setTasks(tasks.map(task =>
        task.id === editingTaskId ? updatedTask : task
      ));
      setEditingTaskId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sort === 'title') {
      return a.title.localeCompare(b.title);
    }
    // Sort by created_at (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Redirect unauthenticated users to the welcome page
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/welcome');
    }
  }, [isAuthenticated, router]);

  // Show loading state while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">Todo App</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Task Creation Form */}
        <form onSubmit={createTask} className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Create New Task</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter task title"
                required
              />
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="work, personal, urgent"
              />
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          {/* Advanced Features */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isRecurring" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Recurring Task
              </label>
            </div>

            {isRecurring && (
              <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="recurrencePattern" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Recurrence Pattern
                  </label>
                  <select
                    id="recurrencePattern"
                    value={recurrencePattern}
                    onChange={(e) => setRecurrencePattern(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                id="estimatedDuration"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Estimated time in minutes"
                min="0"
              />
            </div>

            <div>
              <div className="flex items-center mb-1">
                <input
                  type="checkbox"
                  id="reminderEnabled"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="reminderEnabled" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Reminder
                </label>
              </div>

              {reminderEnabled && (
                <input
                  type="datetime-local"
                  id="reminderTime"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mt-1"
                />
              )}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="sharedWith" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Share With (User IDs, comma-separated)
            </label>
            <input
              type="text"
              id="sharedWith"
              value={sharedWith}
              onChange={(e) => setSharedWith(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., 1, 2, 3"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            Add Task
          </button>
        </form>

        {/* Filter and Sort Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <div className="flex space-x-2">
              {(['all', 'active', 'completed'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setFilter(option)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    filter === option
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <div className="flex space-x-2">
              {(['all', 'low', 'medium', 'high'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setPriorityFilter(option)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    priorityFilter === option
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
            <div className="flex space-x-2">
              {(['created_at', 'title', 'priority', 'due_date'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setSort(option)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    sort === option
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option === 'created_at' ? 'Date' :
                   option === 'due_date' ? 'Due Date' :
                   option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Search tasks..."
            />
          </div>

          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter by Tag</label>
            <input
              type="text"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter tag to filter..."
            />
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">No tasks found</p>
              </div>
            ) : (
              sortedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg shadow-md ${
                    task.completed
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {editingTaskId === task.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-2"
                      />

                      <textarea
                        value={editingDescription}
                        onChange={(e) => setEditingDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-2"
                        rows={2}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                        <select
                          value={editingPriority}
                          onChange={(e) => setEditingPriority(e.target.value as 'low' | 'medium' | 'high')}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>

                        <input
                          type="date"
                          value={editingDueDate}
                          onChange={(e) => setEditingDueDate(e.target.value)}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </div>

                      <input
                        type="text"
                        value={editingTags}
                        onChange={(e) => setEditingTags(e.target.value)}
                        className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm mb-2"
                        placeholder="Tags (comma-separated)"
                      />

                      {/* Advanced Features */}
                      <div className="mb-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingIsRecurring}
                            onChange={(e) => setEditingIsRecurring(e.target.checked)}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <label className="ml-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Recurring
                          </label>
                        </div>

                        {editingIsRecurring && (
                          <div className="ml-6 mt-1">
                            <select
                              value={editingRecurrencePattern}
                              onChange={(e) => setEditingRecurrencePattern(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                              <option value="yearly">Yearly</option>
                            </select>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                        <input
                          type="number"
                          value={editingEstimatedDuration}
                          onChange={(e) => setEditingEstimatedDuration(parseInt(e.target.value) || 0)}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                          placeholder="Duration (min)"
                          min="0"
                        />

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingReminderEnabled}
                            onChange={(e) => setEditingReminderEnabled(e.target.checked)}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <label className="ml-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Reminder
                          </label>
                        </div>
                      </div>

                      {editingReminderEnabled && (
                        <input
                          type="datetime-local"
                          value={editingReminderTime}
                          onChange={(e) => setEditingReminderTime(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs mb-2"
                        />
                      )}

                      <input
                        type="text"
                        value={editingSharedWith}
                        onChange={(e) => setEditingSharedWith(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs mb-2"
                        placeholder="Share with (IDs)"
                      />

                      <div className="flex space-x-2">
                        <button
                          onClick={updateTask}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingTaskId(null)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTaskCompletion(task.id)}
                            className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800 dark:text-white'}`}>
                                {task.title}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                            {task.description && (
                              <p className={`mt-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>
                                {task.description}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-2 mt-2">
                              {task.due_date && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                  📅 {new Date(task.due_date).toLocaleDateString()}
                                </span>
                              )}

                              {task.tags && (
                                <div className="flex flex-wrap gap-1">
                                  {JSON.parse(task.tags.replace(/'/g, '"')).map((tag: string, idx: number) => (
                                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Created: {new Date(task.created_at).toLocaleString()}
                              {task.updated_at && task.updated_at !== task.created_at && (
                                <span>, Updated: {new Date(task.updated_at).toLocaleString()}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditing(task)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}