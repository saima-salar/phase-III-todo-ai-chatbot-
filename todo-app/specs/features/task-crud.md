# Task CRUD Feature Specification

## Feature Description
Full Create, Read, Update, Delete operations for user tasks.

## Acceptance Criteria
- Users can create new tasks with title and description
- Users can view their own tasks with filtering options
- Users can update existing tasks
- Users can delete tasks
- Users can toggle task completion status
- Users can sort tasks by title or creation date

## Technical Requirements
- All endpoints require authentication
- Users can only access their own tasks
- Soft delete is not implemented (hard delete)
- Tasks are associated with user ID

## API Endpoints
- `GET /api/{user_id}/tasks` - Retrieve tasks with optional filtering
- `POST /api/{user_id}/tasks` - Create new task
- `GET /api/{user_id}/tasks/{task_id}` - Get specific task
- `PUT /api/{user_id}/tasks/{task_id}` - Update task
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete task
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle completion