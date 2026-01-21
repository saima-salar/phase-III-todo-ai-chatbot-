'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, Task } from '../../lib/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    highPriority: 0,
    recurring: 0,
    totalTimeEstimate: 0,
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTasksAndStats();
    }
  }, [isAuthenticated, user]);

  const fetchTasksAndStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const tasksData = await api.getTasks(user.id);
      setTasks(tasksData);

      // Calculate stats
      const total = tasksData.length;
      const completed = tasksData.filter(task => task.completed).length;
      const pending = total - completed;

      const now = new Date();
      const overdue = tasksData.filter(task =>
        task.due_date && !task.completed && new Date(task.due_date) < now
      ).length;

      const highPriority = tasksData.filter(task => task.priority === 'high').length;
      const recurring = tasksData.filter(task => task.is_recurring).length;

      const totalTimeEstimate = tasksData.reduce((sum, task) => {
        return sum + (task.estimated_duration || 0);
      }, 0);

      setStats({
        total,
        completed,
        pending,
        overdue,
        highPriority,
        recurring,
        totalTimeEstimate,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">Dashboard</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Tasks</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Completed</h3>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Pending</h3>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Overdue</h3>
                <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">High Priority</h3>
                <p className="text-2xl font-bold text-orange-600">{stats.highPriority}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Recurring Tasks</h3>
                <p className="text-2xl font-bold text-purple-600">{stats.recurring}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Time Estimate</h3>
                <p className="text-2xl font-bold text-indigo-600">{stats.totalTimeEstimate} min</p>
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent Tasks</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {tasks.slice(0, 5).map((task) => (
                      <tr key={task.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{task.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {task.completed ? 'Completed' : 'Pending'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'None'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(task.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Task Completion Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Task Completion Progress</h2>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className="bg-green-600 h-4 rounded-full"
                  style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span>{stats.completed} completed</span>
                <span>{stats.pending} pending</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}