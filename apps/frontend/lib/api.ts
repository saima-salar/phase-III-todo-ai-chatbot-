// frontend/lib/api.ts

// Import Better Auth client
import { authClient } from './better-auth-client';

// Base API URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Define interfaces for request/response types
export interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: string; // low, medium, high
  tags?: string; // JSON string of tags
  due_date?: string;
  created_at: string;
  updated_at?: string;
  // Advanced features
  is_recurring?: boolean;
  recurrence_pattern?: string; // daily, weekly, monthly, yearly
  parent_task_id?: number; // For task dependencies
  estimated_duration?: number; // Estimated time in minutes
  actual_duration?: number; // Actual time spent in minutes
  reminder_enabled?: boolean;
  reminder_time?: string;
  shared_with?: string; // JSON string of user IDs
}

export interface TaskCreateData {
  title: string;
  description?: string;
  completed?: boolean;
  priority?: string; // low, medium, high
  tags?: string[]; // array of tags
  due_date?: string;
  // Advanced features
  is_recurring?: boolean;
  recurrence_pattern?: string; // daily, weekly, monthly, yearly
  parent_task_id?: number; // For task dependencies
  estimated_duration?: number; // Estimated time in minutes
  reminder_enabled?: boolean;
  reminder_time?: string;
  shared_with?: number[]; // Array of user IDs to share with
}

export interface TaskUpdateData {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: string; // low, medium, high
  tags?: string[]; // array of tags
  due_date?: string;
  // Advanced features
  is_recurring?: boolean;
  recurrence_pattern?: string; // daily, weekly, monthly, yearly
  parent_task_id?: number; // For task dependencies
  estimated_duration?: number; // Estimated time in minutes
  actual_duration?: number; // Actual time spent in minutes
  reminder_enabled?: boolean;
  reminder_time?: string;
  shared_with?: number[]; // Array of user IDs to share with
}

// Function to add auth headers to requests
const getAuthHeaders = async (): Promise<HeadersInit> => {
  // Get the Better Auth session to retrieve the JWT token
  const session = await authClient.getSession();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (session?.token) {
    headers['Authorization'] = `Bearer ${session.token}`;
  }

  return headers;
};

// API utility functions
export const api = {
  // Get all tasks for a user with optional filters
  getTasks: async (userId: number, params?: {
    completed?: boolean;
    priority?: string;
    tags?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string
  }): Promise<Task[]> => {
    const url = new URL(`${API_BASE_URL}/api/${userId}/tasks`);

    if (params?.completed !== undefined) {
      url.searchParams.append('completed', String(params.completed));
    }
    if (params?.priority) {
      url.searchParams.append('priority', params.priority);
    }
    if (params?.tags) {
      url.searchParams.append('tags', params.tags);
    }
    if (params?.search) {
      url.searchParams.append('search', params.search);
    }
    if (params?.sortBy) {
      url.searchParams.append('sort_by', params.sortBy);
    }
    if (params?.sortOrder) {
      url.searchParams.append('sort_order', params.sortOrder);
    }

    const headers = await getAuthHeaders();
    const response = await fetch(url.toString(), {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  // Create a new task
  createTask: async (userId: number, taskData: TaskCreateData): Promise<Task> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  // Get a specific task
  getTask: async (userId: number, taskId: number): Promise<Task> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks/${taskId}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch task: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  // Update a task
  updateTask: async (userId: number, taskId: number, taskData: TaskUpdateData): Promise<Task> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks/${taskId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update task: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  // Delete a task
  deleteTask: async (userId: number, taskId: number): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks/${taskId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.status} ${response.statusText}`);
    }
  },

  // Toggle task completion status
  toggleTaskCompletion: async (userId: number, taskId: number): Promise<Task> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks/${taskId}/complete`, {
      method: 'PATCH',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to toggle task completion: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  // Send a chat message to the AI assistant
  sendChatMessage: async (userId: number, message: string, conversationId?: string): Promise<any> => {
    const headers = await getAuthHeaders();
    const requestBody: {
      message: string;
      conversation_id?: string;
    } = {
      message,
    };

    if (conversationId) {
      requestBody.conversation_id = conversationId;
    }

    const response = await fetch(`${API_BASE_URL}/api/${userId}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Failed to send chat message: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },
};

