'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, Task } from '../../lib/api';
import { useAuth } from '../context/AuthContext';
import { getSuggestedTasks, analyzeTaskPatterns } from '../../lib/taskSuggestions';
import Navbar from '../components/Navbar';

export default function SuggestionsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [suggestedTasks, setSuggestedTasks] = useState<Task[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTasksAndGenerateSuggestions();
    }
  }, [isAuthenticated, user]);

  const fetchTasksAndGenerateSuggestions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const tasksData = await api.getTasks(user.id);
      setTasks(tasksData);

      // Generate suggestions based on user's task patterns
      const suggestions = getSuggestedTasks(tasksData);
      setSuggestedTasks(suggestions);

      // Analyze task patterns
      const analysisResult = analyzeTaskPatterns(tasksData);
      setAnalysis(analysisResult);

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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">Task Suggestions</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Analyzing your tasks and generating suggestions...</p>
          </div>
        ) : (
          <>
            {/* Analytics Overview */}
            {analysis && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Your Task Analytics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analysis.totalTasks}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{analysis.completedTasks}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{analysis.completionRate}%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analysis.avgCompletionTime} days</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Completion</p>
                  </div>
                </div>

                {analysis.mostCommonTags.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Your Most Common Tags:</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.mostCommonTags.map(([tag, count]: [string, number]) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          #{tag} ({count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Suggested Tasks */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Suggested Tasks</h2>

              {suggestedTasks.length > 0 ? (
                <div className="space-y-4">
                  {suggestedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-lg shadow-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">{task.title}</h3>
                          {task.description && (
                            <p className="text-blue-700 dark:text-blue-300">{task.description}</p>
                          )}

                          <div className="flex flex-wrap gap-2 mt-2">
                            {task.tags && (
                              <div className="flex flex-wrap gap-1">
                                {JSON.parse(task.tags.replace(/'/g, '"')).map((tag: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-200 text-blue-800 dark:bg-blue-800/30 dark:text-blue-200"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {task.priority && (
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              }`}>
                                {task.priority}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                          onClick={() => {
                            // Create the suggested task
                            // This would typically open a modal or redirect to the task creation form
                            alert(`Would create task: ${task.title}`);
                          }}
                        >
                          Create Task
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <p className="text-gray-600 dark:text-gray-400">
                    No suggestions available yet. Complete more tasks to get personalized suggestions.
                  </p>
                </div>
              )}
            </div>

            {/* Tips Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Productivity Tips</h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Try to break large tasks into smaller, manageable chunks</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Set realistic deadlines and use reminders to stay on track</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Review your completed tasks periodically to identify patterns</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Use tags to categorize and filter your tasks effectively</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}