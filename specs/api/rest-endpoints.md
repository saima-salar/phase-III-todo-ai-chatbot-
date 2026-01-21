# REST API Endpoints

## Authentication Endpoints (Better Auth)

- `POST /api/auth/[...betterauth]` - Better Auth routes (signin, signup, signout)

## Task Management Endpoints

### Base URL: `/api/{user_id}`

- `GET /tasks` - List all tasks for a user
  - Query parameters: `completed`, `priority`, `tags`, `search`, `sort_by`, `sort_order`
  - Response: Array of Task objects

- `POST /tasks` - Create a new task
  - Request body: TaskCreate object
  - Response: Created Task object

- `GET /tasks/{id}` - Get a specific task
  - Response: Task object

- `PUT /tasks/{id}` - Update a specific task
  - Request body: TaskUpdate object
  - Response: Updated Task object

- `DELETE /tasks/{id}` - Delete a specific task
  - Response: Success message

- `PATCH /tasks/{id}/complete` - Toggle task completion status
  - Response: Updated Task object

- `GET /user` - Get current user profile
  - Response: User object

## Authentication & Authorization

All task endpoints require:
- Valid JWT token in Authorization header (`Bearer <token>`)
- User ID in token must match `{user_id}` in URL
- Returns 401 for invalid tokens
- Returns 403 for unauthorized access

## Request/Response Models

### Task Object
```
{
  "id": number,
  "user_id": number,
  "title": string,
  "description": string | null,
  "completed": boolean,
  "priority": "low" | "medium" | "high",
  "tags": string | null,  // JSON string of tags
  "due_date": string | null,  // ISO date string
  "created_at": string,  // ISO date string
  "updated_at": string | null,  // ISO date string
  "is_recurring": boolean,
  "recurrence_pattern": string | null,  // daily, weekly, monthly, yearly
  "estimated_duration": number | null,  // minutes
  "reminder_enabled": boolean,
  "reminder_time": string | null,  // ISO date string
  "shared_with": string | null  // JSON string of user IDs
}
```

### TaskCreate Object
```
{
  "title": string,
  "description": string | null,
  "completed": boolean,
  "priority": "low" | "medium" | "high",
  "tags": string[] | null,
  "due_date": string | null,
  "is_recurring": boolean,
  "recurrence_pattern": string | null,
  "estimated_duration": number | null,
  "reminder_enabled": boolean,
  "reminder_time": string | null,
  "shared_with": number[] | null
}
```

### TaskUpdate Object
```
{
  "title"?: string,
  "description"?: string | null,
  "completed"?: boolean,
  "priority"?: "low" | "medium" | "high",
  "tags"?: string[] | null,
  "due_date"?: string | null,
  "is_recurring"?: boolean,
  "recurrence_pattern"?: string | null,
  "estimated_duration"?: number | null,
  "actual_duration"?: number | null,
  "reminder_enabled"?: boolean,
  "reminder_time"?: string | null,
  "shared_with"?: number[] | null
}
```

### User Object
```
{
  "id": number,
  "email": string,
  "first_name": string | null,
  "last_name": string | null,
  "created_at": string,
  "updated_at": string | null
}
```