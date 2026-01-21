// frontend/lib/taskSuggestions.ts

import { Task } from './api';

// Function to analyze user's task patterns and suggest new tasks
export const getSuggestedTasks = (tasks: Task[]): Task[] => {
  // This is a basic implementation - in a real app, you'd use more sophisticated algorithms
  const suggestions: Task[] = [];

  // Find recurring patterns in completed tasks
  const completedTasks = tasks.filter(task => task.completed);
  const tagsCount: Record<string, number> = {};

  // Count tags from completed tasks to suggest similar tasks
  completedTasks.forEach(task => {
    if (task.tags) {
      try {
        const parsedTags = JSON.parse(task.tags.replace(/'/g, '"'));
        if (Array.isArray(parsedTags)) {
          parsedTags.forEach((tag: string) => {
            tagsCount[tag] = (tagsCount[tag] || 0) + 1;
          });
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  });

  // Suggest tasks based on most common tags
  const sortedTags = Object.entries(tagsCount).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // Generate sample suggested tasks based on common tags
  sortedTags.forEach(([tag, count]) => {
    if (count >= 2) { // If tag appears in 2+ completed tasks
      suggestions.push({
        id: -Math.random(), // Temporary ID
        user_id: -1, // Placeholder
        title: `Similar to "${tag}" tasks`,
        description: `Based on your frequent "${tag}" tasks`,
        completed: false,
        priority: 'medium',
        tags: JSON.stringify([tag]),
        due_date: undefined,
        created_at: new Date().toISOString(),
        is_recurring: false,
        estimated_duration: 30,
        reminder_enabled: false,
      });
    }
  });

  // Suggest recurring versions of frequently completed tasks
  const titleCount: Record<string, number> = {};
  completedTasks.forEach(task => {
    const titleKey = task.title.toLowerCase().trim();
    titleCount[titleKey] = (titleCount[titleKey] || 0) + 1;
  });

  Object.entries(titleCount).forEach(([title, count]) => {
    if (count >= 3) { // If similar task was completed 3+ times
      suggestions.push({
        id: -Math.random(), // Temporary ID
        user_id: -1, // Placeholder
        title: `Recurring: ${title}`,
        description: `Consider making this a recurring task`,
        completed: false,
        priority: 'medium',
        tags: JSON.stringify(['recurring']),
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        created_at: new Date().toISOString(),
        is_recurring: true,
        estimated_duration: 30,
        reminder_enabled: true,
      });
    }
  });

  return suggestions;
};

// Function to analyze task completion patterns
export const analyzeTaskPatterns = (tasks: Task[]) => {
  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  // Calculate average completion time
  let avgCompletionTime = 0;
  if (completedTasks.length > 0) {
    const totalDays = completedTasks.reduce((sum, task) => {
      if (task.created_at && task.updated_at) {
        const created = new Date(task.created_at);
        const updated = new Date(task.updated_at);
        const diffDays = (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        return sum + diffDays;
      }
      return sum;
    }, 0);
    avgCompletionTime = totalDays / completedTasks.length;
  }

  // Find most common tags
  const tagFrequency: Record<string, number> = {};
  tasks.forEach(task => {
    if (task.tags) {
      try {
        const parsedTags = JSON.parse(task.tags.replace(/'/g, '"'));
        if (Array.isArray(parsedTags)) {
          parsedTags.forEach((tag: string) => {
            tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
          });
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  });

  const sortedTags = Object.entries(tagFrequency).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Find peak productivity hours (if we had timestamps of completion)
  // For now, just return a basic analysis

  return {
    totalTasks: tasks.length,
    completedTasks: completedTasks.length,
    pendingTasks: pendingTasks.length,
    completionRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
    avgCompletionTime: Math.round(avgCompletionTime * 10) / 10, // Round to 1 decimal
    mostCommonTags: sortedTags,
  };
};