# MCP Tools Specification - AI Todo Chatbot

## Overview
This specification defines the Model Context Protocol (MCP) tools that enable the AI Todo Chatbot to interact with the todo management system. These tools provide a standardized interface for the AI agent to perform todo-related operations.

## Tools Interface

### 1. add_task
**Description**: Creates a new task for a specific user.

**Signature**:
```typescript
add_task(user_id: string, title: string, description?: string) -> Task
```

**Parameters**:
- `user_id` (string): Unique identifier of the user who owns the task
- `title` (string): Title of the task (required)
- `description` (string, optional): Detailed description of the task

**Returns**:
- `Task` object containing:
  - `id`: Unique task identifier
  - `user_id`: Owner of the task
  - `title`: Task title
  - `description`: Task description
  - `status`: Task status ('pending', 'in-progress', 'completed')
  - `created_at`: Timestamp of creation
  - `updated_at`: Timestamp of last update

**Errors**:
- `ValidationError`: When required parameters are missing or invalid
- `UnauthorizedError`: When user_id doesn't match an existing user
- `RateLimitError`: When user exceeds daily task creation limits

### 2. list_tasks
**Description**: Retrieves a list of tasks for a specific user, optionally filtered by status.

**Signature**:
```typescript
list_tasks(user_id: string, status?: 'pending'|'in-progress'|'completed') -> Task[]
```

**Parameters**:
- `user_id` (string): Unique identifier of the user whose tasks to retrieve
- `status` (string, optional): Filter tasks by status ('pending', 'in-progress', 'completed')

**Returns**:
- Array of `Task` objects as defined in `add_task`

**Errors**:
- `ValidationError`: When user_id is invalid
- `UnauthorizedError`: When user_id doesn't match an existing user

### 3. complete_task
**Description**: Marks a specific task as completed.

**Signature**:
```typescript
complete_task(user_id: string, task_id: string) -> Task
```

**Parameters**:
- `user_id` (string): Unique identifier of the user who owns the task
- `task_id` (string): Unique identifier of the task to complete

**Returns**:
- Updated `Task` object with status changed to 'completed'

**Errors**:
- `ValidationError`: When user_id or task_id is invalid
- `NotFoundError`: When task_id doesn't exist for the given user
- `UnauthorizedError`: When task doesn't belong to the specified user

### 4. delete_task
**Description**: Permanently removes a task from the user's list.

**Signature**:
```typescript
delete_task(user_id: string, task_id: string) -> boolean
```

**Parameters**:
- `user_id` (string): Unique identifier of the user who owns the task
- `task_id` (string): Unique identifier of the task to delete

**Returns**:
- `boolean`: True if deletion was successful, false otherwise

**Errors**:
- `ValidationError`: When user_id or task_id is invalid
- `NotFoundError`: When task_id doesn't exist for the given user
- `UnauthorizedError`: When task doesn't belong to the specified user

### 5. update_task
**Description**: Updates properties of an existing task.

**Signature**:
```typescript
update_task(user_id: string, task_id: string, title?: string, description?: string) -> Task
```

**Parameters**:
- `user_id` (string): Unique identifier of the user who owns the task
- `task_id` (string): Unique identifier of the task to update
- `title` (string, optional): New title for the task
- `description` (string, optional): New description for the task

**Returns**:
- Updated `Task` object with modified properties

**Errors**:
- `ValidationError`: When user_id or task_id is invalid
- `NotFoundError`: When task_id doesn't exist for the given user
- `UnauthorizedError`: When task doesn't belong to the specified user

## Error Handling

### Standard Error Format
All tools follow a consistent error format:
```typescript
{
  "error": {
    "type": "string", // Error type identifier
    "message": "string", // Human-readable error message
    "details": "object" // Additional error details (optional)
  }
}
```

### Error Types
- `ValidationError`: Parameters do not meet validation requirements
- `NotFoundError`: Requested resource does not exist
- `UnauthorizedError`: User lacks permission to perform the action
- `RateLimitError`: Rate limit exceeded for the operation
- `InternalServerError`: Unexpected server error occurred

## Authentication & Authorization
All tools require valid user authentication. Each operation validates that the user_id matches the authenticated user's identity before performing any operations.

## Performance Requirements
- All tools must respond within 2 seconds under normal load
- Tools must handle concurrent requests efficiently
- Proper indexing should be implemented to support fast lookups by user_id

## Logging & Monitoring
All tool calls should be logged with:
- User ID
- Tool name
- Parameters (excluding sensitive data)
- Response time
- Success/error status